import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'cms.config.json'), 'utf8'))
const outputDir = path.join(repoRoot, 'src', 'generated')
const outputPath = path.join(outputDir, 'heroCampaignBootstrap.js')

fs.mkdirSync(outputDir, { recursive: true })

const writeBootstrap = (campaign = null) => {
  const payload = {
    fetchedAt: Date.now(),
    campaign,
  }

  fs.writeFileSync(
    outputPath,
    `// Archivo generado automáticamente por scripts/sync-hero-bootstrap.mjs\nexport const HERO_CAMPAIGN_BOOTSTRAP = ${JSON.stringify(payload, null, 2)}\n`,
    'utf8',
  )
}

try {
  const callback = `__fedesBuildHero_${Date.now()}`
  const url = new URL(config.webAppUrl)
  url.searchParams.set('api', 'campaign')
  url.searchParams.set('key', 'galicia-2026')
  url.searchParams.set('callback', callback)
  url.searchParams.set('_ts', String(Date.now()))

  const response = await fetch(url, {
    redirect: 'follow',
    cache: 'no-store',
    headers: { 'user-agent': 'Fedes-Hero-Bootstrap/1.0' },
  })

  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const start = text.indexOf('(')
  const end = text.lastIndexOf(')')
  if (!text.includes(callback) || start < 0 || end <= start) {
    throw new Error('Respuesta JSONP inesperada')
  }

  const payload = JSON.parse(text.slice(start + 1, end))
  const campaign = payload?.data || payload?.campaign || payload || null
  writeBootstrap(campaign)
  console.log('✅ Bootstrap del Hero actualizado desde Apps Script.')
} catch (error) {
  writeBootstrap(null)
  console.warn(`⚠️ No se pudo generar el bootstrap del Hero: ${error.message}`)
  console.warn('   El build continúa y el frontend usará la carga dinámica normal.')
}
