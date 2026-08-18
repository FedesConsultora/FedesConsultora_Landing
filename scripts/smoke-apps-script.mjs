import { readCmsConfig } from './clasp-utils.mjs'

const config = readCmsConfig()
const callback = `__fedesCmsSmoke_${Date.now()}`
const url = new URL(config.webAppUrl)

url.searchParams.set('api', config.smoke?.api || 'campaign')
url.searchParams.set('key', config.smoke?.key || 'galicia-2026')
url.searchParams.set('callback', callback)
url.searchParams.set('_ts', String(Date.now()))

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let lastError = null

for (let attempt = 1; attempt <= 5; attempt += 1) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'user-agent': 'Fedes-CMS-Smoke/1.0' },
    })
    const body = await response.text()

    if (response.ok && body.includes(callback)) {
      console.log(`✅ Smoke test OK (${response.status})`)
      console.log(`   ${config.webAppUrl}`)
      process.exit(0)
    }

    throw new Error(`HTTP ${response.status}; respuesta inesperada del Web App`)
  } catch (error) {
    lastError = error
    if (attempt < 5) {
      console.log(`Smoke test intento ${attempt}/5 todavía no listo; reintento...`)
      await wait(1500)
    }
  }
}

console.error(`❌ El Web App no respondió como se esperaba: ${lastError?.message || 'error desconocido'}`)
process.exit(1)
