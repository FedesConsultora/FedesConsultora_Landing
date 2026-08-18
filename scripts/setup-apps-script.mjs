import fs from 'node:fs'
import path from 'node:path'
import {
  claspJsonPath,
  extractScriptId,
  readClaspProject,
  readCmsConfig,
  repoRoot,
  runClasp,
} from './clasp-utils.mjs'

const suppliedTarget = process.argv[2] || ''
const config = readCmsConfig()
const existingClasp = readClaspProject()
let scriptId = extractScriptId(suppliedTarget)

if (!scriptId && existingClasp?.scriptId) scriptId = existingClasp.scriptId

if (!scriptId) {
  console.error('Falta vincular el proyecto de Apps Script.')
  console.error('Uso: npm run cms:setup -- "URL_DEL_EDITOR_O_SCRIPT_ID"')
  process.exit(1)
}

if (suppliedTarget && !extractScriptId(suppliedTarget)) {
  console.error('No pude extraer un Script ID válido.')
  process.exit(1)
}

if (existingClasp?.scriptId && existingClasp.scriptId !== scriptId) {
  console.error('Este repo ya está vinculado a otro Script ID.')
  process.exit(1)
}

const rootDir = String(config.rootDir || 'apps-script')
const appsScriptDir = path.join(repoRoot, rootDir)
fs.mkdirSync(appsScriptDir, { recursive: true })

fs.writeFileSync(
  claspJsonPath,
  `${JSON.stringify({ scriptId, rootDir }, null, 2)}\n`,
  'utf8',
)

console.log(`Proyecto vinculado localmente a ${scriptId}`)

const whoami = runClasp(['show-authorized-user'], { capture: true, allowFailure: true })
if (whoami.status !== 0) {
  console.log('No hay sesión válida de clasp. Abriendo login de Google...')
  runClasp(['login'])
}

const localSourceFiles = fs.readdirSync(appsScriptDir).filter((name) =>
  /\.(gs|js|html|json)$/i.test(name),
)

if (localSourceFiles.length === 0) {
  console.log('Importando el código actual desde Apps Script...')
  runClasp(['pull'])
} else {
  console.log('Ya existe código Apps Script local; no se reemplaza automáticamente.')
}

const manifestPath = path.join(appsScriptDir, 'appsscript.json')
if (!fs.existsSync(manifestPath)) {
  console.error(`No apareció ${rootDir}/appsscript.json.`)
  process.exit(1)
}

runClasp(['show-file-status'])
console.log('Configuración terminada.')
console.log(`URL de producción: ${config.webAppUrl}`)
console.log('Desde ahora publicá con: npm run cms:deploy -- "descripción del cambio"')
