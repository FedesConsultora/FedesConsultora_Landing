import fs from 'node:fs'
import path from 'node:path'
import {
  readClaspProject,
  readCmsConfig,
  repoRoot,
  runClasp,
  runNodeScript,
} from './clasp-utils.mjs'

const config = readCmsConfig()
const claspProject = readClaspProject()

if (!claspProject?.scriptId) {
  console.error('❌ Falta .clasp.json. Ejecutá una sola vez: npm run cms:setup -- "URL_DEL_EDITOR_O_SCRIPT_ID"')
  process.exit(1)
}

const rootDir = String(config.rootDir || 'apps-script')
const manifestPath = path.join(repoRoot, rootDir, 'appsscript.json')
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Falta ${rootDir}/appsscript.json. Primero importá el Apps Script con npm run cms:setup.`)
  process.exit(1)
}

if (!config.deploymentId || !config.webAppUrl) {
  console.error('❌ cms.config.json no tiene deploymentId/webAppUrl de producción.')
  process.exit(1)
}

const description = process.argv.slice(2).join(' ').trim() || `Fedes CMS ${new Date().toISOString()}`

function resultText(result) {
  return `${result?.stdout || ''}\n${result?.stderr || ''}`
}

function isReauthError(result) {
  return /invalid_grant|invalid_rapt|reauth related error/i.test(resultText(result))
}

function runClaspWithReauth(args, label) {
  let result = runClasp(args, { capture: true, allowFailure: true })
  if (result.status === 0) return result

  if (!isReauthError(result)) {
    console.error(`❌ ${label} falló.`)
    process.exit(result.status ?? 1)
  }

  console.log('\n🔐 Google exige volver a autenticar la sesión de clasp.')
  console.log('   Voy a abrir el login una sola vez y después reintentar automáticamente el paso.')
  const login = runClasp(['login'], { allowFailure: true })
  if (login.status !== 0) {
    console.error('❌ No se pudo renovar la sesión de Google. Ejecutá `npm run cms:login` y repetí el deploy.')
    process.exit(login.status ?? 1)
  }

  console.log(`\nReintentando ${label}...`)
  result = runClasp(args, { capture: true, allowFailure: true })
  if (result.status !== 0) {
    console.error(`❌ ${label} siguió fallando después de reautenticar.`)
    process.exit(result.status ?? 1)
  }

  return result
}

console.log('1/5 Validando sintaxis local de Apps Script...')
runNodeScript('scripts/check-apps-script.mjs')

console.log('\n2/5 Verificando archivos que clasp va a publicar...')
runClasp(['show-file-status'])

console.log('\n3/5 Subiendo código local a Apps Script...')
runClaspWithReauth(['push', '--force'], 'la subida de código')

console.log(`\n4/5 Actualizando el deployment fijo ${config.deploymentId}...`)
runClaspWithReauth([
  'create-deployment',
  '--deploymentId',
  config.deploymentId,
  '--description',
  description,
], 'la actualización del deployment')

console.log('\n5/5 Verificando la URL pública...')
runNodeScript('scripts/smoke-apps-script.mjs')

console.log('\n✅ Apps Script publicado correctamente.')
console.log(`Deployment fijo: ${config.deploymentId}`)
console.log(`URL estable: ${config.webAppUrl}`)
console.log('VITE_GOOGLE_SCRIPT_URL no cambia porque siempre se actualiza el mismo deployment.')
