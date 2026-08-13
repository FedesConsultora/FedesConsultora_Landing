const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

const DEFAULT_TIMEOUT = 30000
const POLL_INTERVAL = 900
const POLL_ATTEMPTS = 10
const LATE_CALLBACK_TTL = 60000
const GALICIA_LANDING_PATH = '/regalo-galicia'

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
  if (value === '/bonificacion-galicia' || value === '/bono' || value === GALICIA_LANDING_PATH) return GALICIA_LANDING_PATH
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
    campaignPromise = jsonp({ api: 'campaign', key: 'galicia-2026' })
      .catch((error) => {
        console.info('[Galicia] Datos de campaña no disponibles todavía', error.message)
        return null
      })
  }
  return campaignPromise
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
