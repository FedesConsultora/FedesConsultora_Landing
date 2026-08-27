const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const TOKEN_KEY = 'fedes_admin_token'
const REQUIRED_BACKEND_MAJOR = 4
const BACKEND_CHECK_TTL = 10 * 60 * 1000

let backendCheck = null
let backendCheckedAt = 0

function opaqueId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, '')
  return `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`
}

function jsonp(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const callback = `__fedesAdmin_${opaqueId()}`
    const script = document.createElement('script')
    let settled = false

    const finish = (error, value) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try { delete window[callback] } catch { window[callback] = undefined }
      script.remove()
      if (error) reject(error)
      else resolve(value)
    }

    const timer = window.setTimeout(() => finish(new Error('Tiempo de espera agotado')), timeout)
    window[callback] = (payload) => finish(null, payload)
    const target = new URL(url)
    target.searchParams.set('callback', callback)
    script.src = target.toString()
    script.onerror = () => finish(new Error('No se pudo consultar el backend'))
    document.head.appendChild(script)
  })
}

function backendVersionError(version) {
  const detected = version ? `v${version}` : 'una versión anterior'
  return new Error(`El backend de Apps Script está desactualizado (${detected}). El Backoffice React requiere backend v4 o superior. Actualizá la implementación existente de la Web App y volvé a intentar.`)
}

function assertCompatibleVersion(version) {
  const value = String(version || '')
  const major = Number(value.split('.')[0])
  if (!Number.isFinite(major) || major < REQUIRED_BACKEND_MAJOR) throw backendVersionError(value)
  return value
}

function markBackendCompatible(version, extra = {}) {
  const normalized = assertCompatibleVersion(version)
  const payload = { success: true, version: normalized, ...extra }
  backendCheck = Promise.resolve(payload)
  backendCheckedAt = Date.now()
  return payload
}

async function ensureAdminBackend() {
  if (!API_URL) throw new Error('Falta VITE_GOOGLE_SCRIPT_URL')
  const now = Date.now()
  if (backendCheck && now - backendCheckedAt < BACKEND_CHECK_TTL) return backendCheck

  const url = new URL(API_URL)
  url.searchParams.set('api', 'health')
  backendCheck = jsonp(url.toString()).then((response) => {
    if (!response?.success) throw backendVersionError(response?.version)
    markBackendCompatible(response.version, response)
    return response
  }).catch((error) => {
    backendCheck = null
    backendCheckedAt = 0
    throw error
  })
  backendCheckedAt = now
  return backendCheck
}

async function pollResult(requestId, clientSecret) {
  const started = Date.now()
  let waitMs = 120
  while (Date.now() - started < 30000) {
    const url = new URL(API_URL)
    url.searchParams.set('api', 'admin-result')
    url.searchParams.set('requestId', requestId)
    url.searchParams.set('clientSecret', clientSecret)
    const response = await jsonp(url.toString())

    if (response?.code === 'INVALID_API' || /API no válida/i.test(response?.error || '')) {
      backendCheck = null
      backendCheckedAt = 0
      throw backendVersionError('')
    }

    if (!response?.pending) {
      const result = response?.result ?? response
      if (result?.success === false) {
        if (result?.code === 'INVALID_API' || /API no válida|operación administrativa inválida/i.test(result?.error || '')) {
          backendCheck = null
          backendCheckedAt = 0
          throw backendVersionError('')
        }
        throw new Error(result.error || 'Error administrativo')
      }
      return result
    }

    await new Promise((resolve) => window.setTimeout(resolve, waitMs))
    waitMs = Math.min(360, waitMs + 45)
  }
  throw new Error('El backend tardó demasiado en responder')
}

export async function adminCommand(operation, payload = {}, token = getAdminToken(), options = {}) {
  if (!API_URL) throw new Error('Falta VITE_GOOGLE_SCRIPT_URL')
  if (!options.skipBackendCheck) await ensureAdminBackend()

  const requestId = opaqueId()
  const clientSecret = opaqueId()
  const body = { action: 'adminCommand', operation, requestId, clientSecret, token: token || '', payload }

  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(body),
    keepalive: false,
  })

  const result = await pollResult(requestId, clientSecret)
  if (result?.appVersion) markBackendCompatible(result.appVersion, { schemaVersion: result.schemaVersion })
  else if (result?.meta?.appVersion) markBackendCompatible(result.meta.appVersion, { schemaVersion: result.meta.schemaVersion })
  return result
}

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || ''
}

export function setAdminToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export async function loginAdmin(password) {
  // Login no hace un health request previo: el propio resultado autenticado trae
  // la versión del backend. Esto elimina un round-trip completo del camino crítico.
  const result = await adminCommand('login', { password }, '', { skipBackendCheck: true })
  if (!result?.token) throw new Error('El backend no devolvió una sesión válida')

  if (result.appVersion) markBackendCompatible(result.appVersion, { schemaVersion: result.schemaVersion })
  else await ensureAdminBackend()

  setAdminToken(result.token)
  return result
}

export async function logoutAdmin() {
  const token = getAdminToken()
  try {
    if (token) await adminCommand('logout', {}, token)
  } finally {
    setAdminToken('')
  }
}

export function downloadCsv(filename, rows, fields) {
  const csvCell = (value) => {
    const stringValue = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  const csv = [fields.map(csvCell).join(','), ...rows.map((row) => fields.map((field) => csvCell(row[field])).join(','))].join('\r\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
