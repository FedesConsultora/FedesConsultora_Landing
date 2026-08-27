import { readCmsConfig } from './clasp-utils.mjs'

const config = readCmsConfig()
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchJsonp(params, attemptLabel) {
  let lastError = null

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const callback = `__fedesCmsSmoke_${Date.now()}_${attempt}`
    const url = new URL(config.webAppUrl)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    })
    url.searchParams.set('callback', callback)
    url.searchParams.set('_ts', String(Date.now()))

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        cache: 'no-store',
        headers: { 'user-agent': 'Fedes-CMS-Smoke/3.0' },
      })
      const body = await response.text()
      const prefix = `${callback}(`
      const start = body.indexOf(prefix)
      const end = body.lastIndexOf(')')

      if (!response.ok || start < 0 || end <= start) {
        throw new Error(`HTTP ${response.status}; respuesta JSONP inesperada`)
      }

      return JSON.parse(body.slice(start + prefix.length, end))
    } catch (error) {
      lastError = error
      if (attempt < 5) {
        console.log(`${attemptLabel} intento ${attempt}/5 todavía no listo; reintento...`)
        await wait(1500)
      }
    }
  }

  throw lastError || new Error(`${attemptLabel} falló`)
}

try {
  const health = await fetchJsonp({ api: 'health' }, 'Health')
  if (!health?.success) throw new Error('Health no confirmó success=true')
  if (Number(health.schemaVersion || 0) < 6) throw new Error(`Schema ${health.schemaVersion || 0} es anterior al requerido (6)`)
  console.log(`✅ Health OK · ${health.app} v${health.version} · schema ${health.schemaVersion}`)

  const heroRuntimes = await fetchJsonp({ api: 'hero-runtimes' }, 'Hero runtime')
  if (!heroRuntimes?.success || !heroRuntimes?.states || !heroRuntimes.states['galicia-2026']) {
    throw new Error('Hero runtime no devolvió el estado de galicia-2026')
  }
  const galiciaHero = heroRuntimes.states['galicia-2026']
  if (galiciaHero.active && !galiciaHero.enabled) throw new Error('Hero Galicia figura activo pero disabled')
  console.log(`✅ Hero runtime OK · ${galiciaHero.active ? 'visible' : galiciaHero.reason || 'no visible'}`)

  const campaign = await fetchJsonp({
    api: config.smoke?.api || 'campaign',
    key: config.smoke?.key || 'galicia-2026',
  }, 'Campaña Galicia')

  if (campaign?.campaign_key === 'galicia-2026') {
    console.log(`✅ Campaña Galicia pública · ${campaign.status}`)

    const landings = await fetchJsonp({ api: 'campaign-landings', campaignKey: 'galicia-2026' }, 'Landings Galicia')
    if (!Array.isArray(landings)) throw new Error('campaign-landings no devolvió una colección')
    console.log(`✅ Landings públicas · ${landings.length}`)

    const primaryLanding = await fetchJsonp({ api: 'campaign-landing', path: '/bonificacion-galicia' }, 'Landing principal')
    if (primaryLanding?.landing_key !== 'charla-pymes') {
      throw new Error('La landing principal de Galicia no resolvió como charla-pymes')
    }
    if (Number(primaryLanding?.benefit_percent || 0) !== 50) {
      throw new Error('La landing principal de Galicia dejó de tener 50%')
    }
    console.log(`✅ Landing principal OK · ${primaryLanding.path} · ${primaryLanding.benefit_percent}%`)
  } else {
    console.log('ℹ️ Galicia no está pública; el smoke respeta el switch maestro y no exige una landing activa.')
  }

  console.log('✅ Smoke test OK')
  console.log(`   ${config.webAppUrl}`)
} catch (error) {
  console.error(`❌ Smoke test falló: ${error.message || 'error desconocido'}`)
  process.exit(1)
}
