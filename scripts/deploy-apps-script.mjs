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

console.log('1/4 Verificando archivos que clasp va a publicar...')
runClasp(['show-file-status'])

console.log('\n2/4 Subiendo código local a Apps Script...')
runClasp(['push', '--force'])

console.log('\n3/4 Creando una versión inmutable...')
const versionResult = runClasp(['version', description], { capture: true })
const versionOutput = `${versionResult.stdout || ''}\n${versionResult.stderr || ''}`
const versionMatch = versionOutput.match(/Created version\s+(\d+)/i)

if (!versionMatch) {
  console.error('❌ clasp creó la versión, pero no pude detectar automáticamente su número.')
  console.error('Ejecutá npm run cms:versions para inspeccionarla antes de volver a publicar.')
  process.exit(1)
}

const version = versionMatch[1]
console.log(`\n4/4 Actualizando el deployment existente ${config.deploymentId} a la versión ${version}...`)
runClasp(['redeploy', config.deploymentId, version, description])

console.log('\nVerificando la URL pública...')
runNodeScript('scripts/smoke-apps-script.mjs')

console.log('\n✅ Apps Script publicado correctamente.')
console.log(`Versión: ${version}`)
console.log(`Deployment: ${config.deploymentId}`)
console.log(`URL estable: ${config.webAppUrl}`)
console.log('VITE_GOOGLE_SCRIPT_URL no cambia porque reutilizamos siempre el mismo deployment.')
