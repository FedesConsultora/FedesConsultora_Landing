const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const DEFAULT_TIMEOUT = 12000
const LATE_CALLBACK_TTL = 30000

function assertApiUrl() {
  if (!API_URL) throw new Error('Falta configurar VITE_GOOGLE_SCRIPT_URL')
}

function buildUrl(params = {}) {
  assertApiUrl()
  const url = new URL(API_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}

function jsonp(params, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const callback = `__fedesHeroRuntime_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    let settled = false

    const finish = (error, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      script.remove()
      if (error) {
        window[callback] = () => {}
        window.setTimeout(() => {
          try { delete window[callback] } catch { window[callback] = undefined }
        }, LATE_CALLBACK_TTL)
        reject(error)
        return
      }
      try { delete window[callback] } catch { window[callback] = undefined }
      resolve(value)
    }

    const timer = window.setTimeout(() => finish(new Error('La validación del Hero demoró demasiado.')), timeout)
    window[callback] = (payload) => finish(null, payload)
    script.onerror = () => finish(new Error('No se pudo validar el Hero.'))
    script.src = buildUrl({ ...params, callback, _ts: Date.now() })
    document.body.appendChild(script)
  })
}

export async function getCampaignHeroRuntime(campaignKey = 'galicia-2026') {
  const payload = await jsonp({ api: 'hero-runtime', key: campaignKey })
  if (!payload || payload.success === false) return { active: false, reason: payload?.reason || 'unavailable', campaign: null }
  return {
    active: Boolean(payload.active),
    reason: payload.reason || '',
    revision: payload.revision || '',
    checkedAt: payload.checkedAt || '',
    campaign: payload.campaign || null,
  }
}

export async function getActiveCampaignHeroes() {
  const payload = await jsonp({ api: 'hero-runtimes' })
  if (!payload || payload.success === false) return []
  return Array.isArray(payload.campaigns) ? payload.campaigns : []
}
