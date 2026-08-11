const API_URL = import.meta.env.VITE_CMS_SCRIPT_URL || import.meta.env.VITE_GOOGLE_SCRIPT_URL

const DEFAULT_TIMEOUT = 12000
const POLL_INTERVAL = 650
const POLL_ATTEMPTS = 12

function assertApiUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar VITE_CMS_SCRIPT_URL o VITE_GOOGLE_SCRIPT_URL')
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
    const timer = window.setTimeout(() => cleanup(new Error('La consulta al CMS demoró demasiado.')), timeout)

    const cleanup = (error, value) => {
      window.clearTimeout(timer)
      delete window[callback]
      script.remove()
      if (error) reject(error)
      else resolve(value)
    }

    window[callback] = (payload) => cleanup(null, payload)
    script.onerror = () => cleanup(new Error('No se pudo consultar el CMS.'))
    script.src = buildUrl({ ...params, callback })
    document.body.appendChild(script)
  })
}

async function postOpaque(action, payload) {
  assertApiUrl()
  const body = new URLSearchParams()
  body.set('action', action)

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    body.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
  })

  await fetch(buildUrl(), {
    method: 'POST',
    mode: 'no-cors',
    body,
  })
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

export async function getLeadStatus(leadId) {
  return jsonp({ api: 'lead-status', leadId })
}

export async function waitForLead(leadId, predicate, attempts = POLL_ATTEMPTS) {
  let last = null

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    last = await getLeadStatus(leadId)
    if (last?.found && predicate(last)) return last
    await wait(POLL_INTERVAL)
  }

  throw new Error(last?.found
    ? 'El registro todavía se está procesando. Volvé a intentar en unos segundos.'
    : 'No pudimos confirmar el registro. Revisá tu conexión e intentá nuevamente.')
}

export async function startGaliciaLead(payload) {
  await postOpaque('galiciaStart', payload)
  return waitForLead(payload.leadId, (lead) => lead.status === 'incomplete' || lead.status === 'complete')
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
      pagePath: '/bono',
    })
  } catch (error) {
    console.warn('[Galicia] No se pudo registrar meeting_click', error)
  }
}

export async function getGaliciaCampaign() {
  try {
    return await jsonp({ api: 'campaign', key: 'galicia-2026' })
  } catch (error) {
    console.warn('[Galicia] Campaña no disponible desde CMS', error)
    return null
  }
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
