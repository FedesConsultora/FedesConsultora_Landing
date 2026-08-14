const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

const DEFAULT_TIMEOUT = 30000
const POLL_INTERVAL = 900
const POLL_ATTEMPTS = 10
const LATE_CALLBACK_TTL = 60000
const GALICIA_LANDING_PATH = '/bonificacion-galicia'
const PUBLIC_CAMPAIGNS_CACHE_TTL = 30000

function assertApiUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar VITE_GOOGLE_SCRIPT_URL')
  }
}

function buildUrl(params = {}) {
  assertApiUrl()
  const url = new URL(API_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

function jsonp(params, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    assertApiUrl()

    const callback = `__fedesCms_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    let settled = false

    const removeLateCallback = () => {
      window.setTimeout(() => {
        try { delete window[callback] } catch { window[callback] = undefined }
      }, LATE_CALLBACK_TTL)
    }

    const finish = (error, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      script.remove()

      if (error) {
        window[callback] = () => {}
        removeLateCallback()
        reject(error)
        return
      }

      try { delete window[callback] } catch { window[callback] = undefined }
      resolve(value)
    }

    const timer = window.setTimeout(
      () => finish(new Error('La consulta al CMS demoró demasiado.')),
      timeout,
    )

    window[callback] = (payload) => finish(null, payload)
    script.onerror = () => finish(new Error('No se pudo consultar el CMS.'))
    script.src = buildUrl({ ...params, callback })
    document.body.appendChild(script)
  })
}

function normalizeGaliciaPagePath(value) {
  if (value === '/regalo-galicia' || value === '/bono' || value === GALICIA_LANDING_PATH) return GALICIA_LANDING_PATH
  return value
}

async function postOpaque(action, payload) {
  assertApiUrl()
  const body = new URLSearchParams()
  body.set('action', action)

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    const normalizedValue = key === 'pagePath' ? normalizeGaliciaPagePath(value) : value
    body.set(key, typeof normalizedValue === 'object' ? JSON.stringify(normalizedValue) : String(normalizedValue))
  })

  await fetch(buildUrl(), {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    body,
  })
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

export async function getLeadStatus(leadId, timeout = DEFAULT_TIMEOUT) {
  return jsonp({ api: 'lead-status', leadId }, timeout)
}

export async function getLeadProgress(leadId, timeout = DEFAULT_TIMEOUT) {
  return jsonp({ api: 'lead-progress', leadId }, timeout)
}

export async function getGaliciaResume(token, timeout = DEFAULT_TIMEOUT) {
  return jsonp({ api: 'galicia-resume', token }, timeout)
}

export async function waitForLead(leadId, predicate, attempts = POLL_ATTEMPTS) {
  let last = null
  let lastError = null

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      last = await getLeadStatus(leadId)
      if (last?.found && predicate(last)) return last
      lastError = null
    } catch (error) {
      lastError = error
    }

    await wait(POLL_INTERVAL)
  }

  if (last?.found) {
    throw new Error('El registro todavía se está procesando. Volvé a intentar en unos segundos.')
  }

  throw new Error(lastError?.message || 'No pudimos confirmar el registro. Revisá tu conexión e intentá nuevamente.')
}

export async function startGaliciaLead(payload) {
  await postOpaque('galiciaStart', payload)
  return {
    found: false,
    leadId: payload.leadId,
    status: 'incomplete',
    stage: 'captured',
    pendingConfirmation: true,
  }
}

export async function saveGaliciaProgress(payload) {
  await postOpaque('galiciaProgress', payload)
  return { success: true, pendingConfirmation: true }
}

export async function completeGaliciaLead(payload) {
  await postOpaque('galiciaComplete', payload)
  return waitForLead(payload.leadId, (lead) => lead.status === 'complete')
}

export async function markGaliciaMeetingClick(leadId, source) {
  if (!leadId) return
  try {
    await postOpaque('galiciaMeetingClick', {
      leadId,
      source,
      pagePath: GALICIA_LANDING_PATH,
    })
  } catch (error) {
    console.warn('[Galicia] No se pudo registrar meeting_click', error)
  }
}

let campaignPromise = null

export async function getGaliciaCampaign() {
  if (!campaignPromise) {
    campaignPromise = jsonp({ api: 'campaign', key: 'galicia-2026', _ts: Date.now() })
      .then((payload) => payload?.data || payload?.campaign || payload || null)
      .catch((error) => {
        console.info('[Galicia] Datos de campaña no disponibles todavía', error.message)
        return null
      })
      .finally(() => {
        campaignPromise = null
      })
  }
  return campaignPromise
}

let campaignsRequest = null
let campaignsCache = { data: null, at: 0 }

function normalizeCampaignCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.campaigns)) return payload.campaigns
  return []
}

export async function getAllPublicCampaigns({ force = false } = {}) {
  const cacheFresh = campaignsCache.data && Date.now() - campaignsCache.at < PUBLIC_CAMPAIGNS_CACHE_TTL
  if (!force && cacheFresh) return campaignsCache.data

  if (!campaignsRequest) {
    campaignsRequest = jsonp({ api: 'campaigns', _ts: Date.now() })
      .then((payload) => {
        const data = normalizeCampaignCollection(payload)
        campaignsCache = { data, at: Date.now() }
        return data
      })
      .catch((error) => {
        console.info('[Campaigns] Error cargando campañas públicas:', error.message)
        return Array.isArray(campaignsCache.data) ? campaignsCache.data : []
      })
      .finally(() => {
        campaignsRequest = null
      })
  }

  return campaignsRequest
}

export function getHeroCampaignSeenKey(campaign) {
  const key = String(campaign?.campaign_key || '').trim()
  if (!key) return ''
  const version = String(
    campaign?.updated_at ||
    campaign?.starts_at ||
    campaign?.hero_banner?.desktop_media_id ||
    campaign?.hero_banner?.mobile_media_id ||
    'v1',
  ).trim()
  return `fedes_hero_banner_seen:${key}:${version}`
}

function mergeCampaigns(collection, directCampaign) {
  const merged = normalizeCampaignCollection(collection).slice()
  if (!directCampaign || typeof directCampaign !== 'object') return merged

  const key = String(directCampaign.campaign_key || '').trim()
  if (!key) return merged

  const index = merged.findIndex((item) => String(item?.campaign_key || '').trim() === key)
  if (index >= 0) merged[index] = directCampaign
  else merged.push(directCampaign)
  return merged
}

export async function getActiveHeroCampaigns() {
  const [collectionResult, galiciaResult] = await Promise.allSettled([
    getAllPublicCampaigns({ force: true }),
    getGaliciaCampaign(),
  ])

  const collection = collectionResult.status === 'fulfilled' ? collectionResult.value : []
  const galicia = galiciaResult.status === 'fulfilled' ? galiciaResult.value : null
  const all = mergeCampaigns(collection, galicia)

  if (!Array.isArray(all)) return []
  const now = Date.now()
  const params = new URLSearchParams(window.location.search)
  const forceVisibility = params.get('forceHero') === '1'

  const active = all.filter((c) => {
    if (!c || c.status !== 'published') return false
    const banner = c.hero_banner
    if (!banner || !banner.enabled) return false
    if (!(banner.desktop_url || banner.desktop_file_id)) return false
    if (!(banner.mobile_url || banner.mobile_file_id)) return false

    const startsAt = Date.parse(c.starts_at || '')
    if (!Number.isFinite(startsAt) || startsAt > now) return false

    const endsAt = Date.parse(c.ends_at || '')
    if (Number.isFinite(endsAt) && endsAt < now) return false

    if (banner.show_once_per_session && !forceVisibility) {
      try {
        const seenKey = getHeroCampaignSeenKey(c)
        if (seenKey && sessionStorage.getItem(seenKey) === 'true') return false
      } catch {
        /* ignore storage access error */
      }
    }

    return true
  }).sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))

  if (forceVisibility) {
    console.info('[Hero Campaigns] Diagnóstico forceHero', {
      received: all.map((campaign) => ({
        campaign_key: campaign?.campaign_key,
        status: campaign?.status,
        starts_at: campaign?.starts_at,
        ends_at: campaign?.ends_at,
        hero_enabled: campaign?.hero_banner?.enabled,
        has_desktop: Boolean(campaign?.hero_banner?.desktop_url || campaign?.hero_banner?.desktop_file_id),
        has_mobile: Boolean(campaign?.hero_banner?.mobile_url || campaign?.hero_banner?.mobile_file_id),
      })),
      active: active.map((campaign) => campaign?.campaign_key),
    })
  }

  return active
}

export function createLeadId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

export function getAttribution() {
  const params = new URLSearchParams(window.location.search)
  const explicitSource = params.get('source')
  const utmSource = params.get('utm_source') || ''

  return {
    source: explicitSource || (utmSource ? `utm_${utmSource}` : 'galicia_direct'),
    utmSource,
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    referrer: document.referrer || '',
  }
}
