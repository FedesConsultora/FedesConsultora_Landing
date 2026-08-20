import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { readCmsConfig, repoRoot } from './clasp-utils.mjs'

const config = readCmsConfig()
const rootDir = String(config.rootDir || 'apps-script')
const appsScriptDir = path.join(repoRoot, rootDir)

if (!fs.existsSync(appsScriptDir)) {
  console.error(`❌ No existe ${rootDir}/`)
  process.exit(1)
}

const files = fs.readdirSync(appsScriptDir)
  .filter((name) => name.endsWith('.js'))
  .sort()

if (!files.length) {
  console.error(`❌ No encontré archivos .js en ${rootDir}/`)
  process.exit(1)
}

for (const file of files) {
  const fullPath = path.join(appsScriptDir, file)
  const result = spawnSync(process.execPath, ['--check', fullPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.status !== 0) {
    console.error(`❌ Error de sintaxis en ${rootDir}/${file}`)
    if (result.stderr) process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
}

const manifestPath = path.join(appsScriptDir, 'appsscript.json')
if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Falta ${rootDir}/appsscript.json`)
  process.exit(1)
}

try {
  JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
} catch (error) {
  console.error(`❌ ${rootDir}/appsscript.json no es JSON válido: ${error.message}`)
  process.exit(1)
}

console.log(`✅ Apps Script válido · ${files.length} archivos JS + manifest`)
