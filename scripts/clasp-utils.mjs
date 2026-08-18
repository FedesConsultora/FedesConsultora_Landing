import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(scriptDir, '..')
export const claspJsonPath = path.join(repoRoot, '.clasp.json')
export const configPath = path.join(repoRoot, 'cms.config.json')
export const CLASP_PACKAGE = '@google/clasp@3.3.0'

export function readCmsConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error('Falta cms.config.json en la raíz del repositorio.')
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

export function runClasp(args, { capture = false, allowFailure = false } = {}) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const result = spawnSync(command, ['--yes', CLASP_PACKAGE, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  })

  if (capture) {
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
  }

  if (!allowFailure && result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  return result
}

export function runNodeScript(relativePath, args = []) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativePath), ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
  return result
}

export function extractScriptId(value) {
  const input = String(value || '').trim()
  if (!input) return ''

  const projectUrlMatch = input.match(
    /script\.google\.com\/(?:[^\s]*?\/projects|d)\/([A-Za-z0-9_-]{20,})(?:\/|$)/i,
  )
  if (projectUrlMatch) return projectUrlMatch[1]

  const rawMatch = input.match(/^([A-Za-z0-9_-]{20,})$/)
  return rawMatch ? rawMatch[1] : ''
}

export function readClaspProject() {
  if (!fs.existsSync(claspJsonPath)) return null
  return JSON.parse(fs.readFileSync(claspJsonPath, 'utf8'))
}
