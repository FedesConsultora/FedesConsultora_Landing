import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, KeyRound, LoaderCircle, Plus, ShieldCheck } from 'lucide-react'
import AdminShell from './components/AdminShell'
import DashboardView from './components/DashboardView'
import DataTable, { FilterBar } from './components/DataTable'
import RecordModal from './components/RecordModal'
import { Campaign360Modal, Lead360Modal, Onboarding360Modal } from './components/SpecialModal'
import SecurityModal from './components/SecurityModal'
import MediaUploadModal from './components/MediaUploadModal'
import { adminCommand, downloadCsv, getAdminToken, loginAdmin, logoutAdmin, setAdminToken } from './adminApi'
import './AdminDashboard.scss'

const WORKSPACE_CACHE_KEY = 'fedes_admin_workspace_v3'
const TABLE_CACHE_TTL = 60 * 1000
const DASHBOARD_CACHE_TTL = 45 * 1000
const PREFETCH_TABLES = ['campaigns', 'leads', 'contacts', 'onboarding', 'leadMailings', 'blog', 'media']

const INITIAL_QUERY = {
  search: '', filters: {}, dateFrom: '', dateTo: '', includeArchived: false,
  page: 1, pageSize: 50, sortBy: '', sortDir: 'desc',
}

function freshQuery(filters = {}) {
  return { ...INITIAL_QUERY, filters: { ...filters } }
}

function queryCacheKey(tableKey, query) {
  return `${tableKey}|${JSON.stringify({
    search: query.search || '', filters: query.filters || {}, dateFrom: query.dateFrom || '', dateTo: query.dateTo || '',
    includeArchived: Boolean(query.includeArchived), page: query.page || 1, pageSize: query.pageSize || 50,
    sortBy: query.sortBy || '', sortDir: query.sortDir || 'desc',
  })}`
}

function readWorkspaceCache() {
  try {
    return JSON.parse(sessionStorage.getItem(WORKSPACE_CACHE_KEY) || 'null')
  } catch {
    return null
  }
}

function writeWorkspaceCache(workspace) {
  try {
    if (workspace) sessionStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(workspace))
    else sessionStorage.removeItem(WORKSPACE_CACHE_KEY)
  } catch {
    // El panel sigue funcionando aunque el navegador no permita storage.
  }
}

function subtitleFor(def) {
  if (!def) return ''
  if (def.key === 'campaigns') return 'Alta, baja, modificación y consulta de campañas. Galicia es una campaña dentro del ecosistema.'
  if (def.key === 'leads') return 'CRM consolidado con scoring, atribución, seguimiento, reuniones y mailings.'
  if (def.key === 'onboarding') return 'Legajos completos de onboarding de clientes y prospectos.'
  if (def.readOnly) return 'Consulta integral. Esta entidad permanece de solo lectura para preservar integridad.'
  return 'Alta, baja, modificación y consulta con filtros avanzados.'
}

function LoginView({ onLogin, error, busy }) {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  return (
    <main className="admin-login-page">
      <div className="admin-ambient admin-ambient--one" />
      <div className="admin-ambient admin-ambient--two" />
      <form className="admin-login-card admin-glass" onSubmit={(event) => { event.preventDefault(); onLogin(password) }}>
        <div className="admin-login-logo">F</div>
        <span className="admin-eyebrow">Backoffice · Fedes</span>
        <h1>Centro de gestión</h1>
        <p>CRM, campañas, onboarding, sitio web, analítica y datos en un único panel React.</p>
        <label className="admin-field">
          <span>Contraseña</span>
          <div className="admin-login-input admin-login-input--password">
            <KeyRound size={17} />
            <input
              type={visible ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && <div className="admin-form-error">{error}</div>}
        <button className="admin-button admin-button--primary admin-button--wide" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="is-spinning" size={17} /> : <ShieldCheck size={17} />}
          {busy ? 'Cargando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  )
}

function BootView() {
  return (
    <main className="admin-login-page admin-boot-page">
      <div className="admin-boot-card admin-glass">
        <LoaderCircle className="is-spinning" size={24} />
        <div><strong>Cargando panel…</strong><span>Preparando tu espacio de trabajo.</span></div>
      </div>
    </main>
  )
}

function TableLoadingState({ hasData }) {
  if (hasData) return <div className="admin-inline-loading"><LoaderCircle className="is-spinning" size={14} />Actualizando datos…</div>
  return (
    <div className="admin-table-skeleton admin-glass-soft" aria-label="Cargando datos">
      <div className="admin-skeleton-line is-wide" />
      <div className="admin-skeleton-line" />
      <div className="admin-skeleton-line" />
      <div className="admin-skeleton-line" />
      <div className="admin-skeleton-line is-short" />
    </div>
  )
}

export default function AdminDashboard() {
  const [token, setToken] = useState(() => getAdminToken())
  const [workspace, setWorkspace] = useState(() => getAdminToken() ? readWorkspaceCache() : null)
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState(null)
  const [view, setView] = useState('dashboard')
  const [tableKey, setTableKey] = useState(null)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState(() => freshQuery())
  const [selected, setSelected] = useState(new Set())
  const [modal, setModal] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [booting, setBooting] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [toast, setToast] = useState(null)

  const tableCacheRef = useRef(new Map())
  const tableRequestsRef = useRef(new Map())
  const activeTableRef = useRef({ key: null, cacheKey: '' })
  const dashboardFetchedAtRef = useRef(0)
  const prefetchStartedRef = useRef(false)

  const tables = workspace?.tables || {}
  const activeDef = tableKey ? tables[tableKey] : null

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    window.setTimeout(() => setToast((current) => current?.message === message ? null : current), 3500)
  }, [])

  const handleCommandError = useCallback((error) => {
    if (/sesión vencida|sesión inválida/i.test(error.message)) {
      setAdminToken('')
      writeWorkspaceCache(null)
      setToken('')
      setWorkspace(null)
      setAuthError('La sesión venció. Ingresá nuevamente.')
    } else notify(error.message, 'error')
  }, [notify])

  const invalidateTableCache = useCallback((key) => {
    for (const cacheKey of tableCacheRef.current.keys()) {
      if (cacheKey.startsWith(`${key}|`)) tableCacheRef.current.delete(cacheKey)
    }
  }, [])

  const fetchTable = useCallback(async (key, nextQuery, options = {}) => {
    const resolvedQuery = nextQuery || freshQuery()
    const cacheKey = queryCacheKey(key, resolvedQuery)
    const cached = tableCacheRef.current.get(cacheKey)
    const updateView = options.updateView !== false
    const force = Boolean(options.force)
    const cacheIsFresh = cached && Date.now() - cached.at < TABLE_CACHE_TTL

    if (cached && updateView && activeTableRef.current.cacheKey === cacheKey) {
      setResult(cached.data)
      setSelected(new Set())
    }

    if (cacheIsFresh && !force) {
      if (updateView && activeTableRef.current.cacheKey === cacheKey) setTableLoading(false)
      return cached.data
    }

    if (updateView && activeTableRef.current.cacheKey === cacheKey) setTableLoading(!cached)

    let request = tableRequestsRef.current.get(cacheKey)
    if (!request) {
      request = adminCommand('queryTable', { tableKey: key, query: resolvedQuery })
      tableRequestsRef.current.set(cacheKey, request)
    }

    try {
      const data = await request
      tableCacheRef.current.set(cacheKey, { data, at: Date.now() })
      if (updateView && activeTableRef.current.cacheKey === cacheKey) {
        setResult(data)
        setSelected(new Set())
      }
      return data
    } catch (error) {
      if (updateView && activeTableRef.current.cacheKey === cacheKey) handleCommandError(error)
      throw error
    } finally {
      tableRequestsRef.current.delete(cacheKey)
      if (updateView && activeTableRef.current.cacheKey === cacheKey) setTableLoading(false)
    }
  }, [handleCommandError])

  const prefetchTable = useCallback((key) => {
    if (!key || !getAdminToken()) return
    const nextQuery = freshQuery()
    const cacheKey = queryCacheKey(key, nextQuery)
    const cached = tableCacheRef.current.get(cacheKey)
    if (cached && Date.now() - cached.at < TABLE_CACHE_TTL) return
    fetchTable(key, nextQuery, { updateView: false }).catch(() => {})
  }, [fetchTable])

  const startBackgroundPrefetch = useCallback(() => {
    if (prefetchStartedRef.current) return
    prefetchStartedRef.current = true
    window.setTimeout(async () => {
      for (const key of PREFETCH_TABLES) {
        if (!getAdminToken()) break
        try { await fetchTable(key, freshQuery(), { updateView: false }) } catch { /* navegación seguirá funcionando con carga local */ }
        await new Promise((resolve) => window.setTimeout(resolve, 80))
      }
    }, 350)
  }, [fetchTable])

  const loadDashboard = useCallback(async ({ force = false } = {}) => {
    if (!force && dashboardFetchedAtRef.current && Date.now() - dashboardFetchedAtRef.current < DASHBOARD_CACHE_TTL) return
    setDashboardLoading(true)
    try {
      const [dashboardData, insightData] = await Promise.all([adminCommand('dashboard'), adminCommand('insights')])
      setDashboard(dashboardData)
      setInsights(insightData)
      dashboardFetchedAtRef.current = Date.now()
    } catch (error) {
      handleCommandError(error)
    } finally {
      setDashboardLoading(false)
    }
  }, [handleCommandError])

  const boot = useCallback(async () => {
    if (!getAdminToken()) return
    setBooting(true)
    try {
      // Las tres lecturas arrancan juntas. El shell puede usar el workspace cacheado mientras llegan.
      const [workspaceData, dashboardData, insightData] = await Promise.all([
        adminCommand('workspace'),
        adminCommand('dashboard'),
        adminCommand('insights'),
      ])
      setWorkspace(workspaceData)
      writeWorkspaceCache(workspaceData)
      setDashboard(dashboardData)
      setInsights(insightData)
      dashboardFetchedAtRef.current = Date.now()
      startBackgroundPrefetch()
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBooting(false)
    }
  }, [handleCommandError, startBackgroundPrefetch])

  useEffect(() => {
    if (token) boot()
  }, [token, boot])

  const login = async (password) => {
    setAuthBusy(true)
    setAuthError('')
    try {
      const response = await loginAdmin(password)
      setToken(response.token)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  const logout = async () => {
    setActionBusy(true)
    try { await logoutAdmin() } catch { setAdminToken('') }
    writeWorkspaceCache(null)
    tableCacheRef.current.clear()
    tableRequestsRef.current.clear()
    prefetchStartedRef.current = false
    setToken('')
    setWorkspace(null)
    setDashboard(null)
    setInsights(null)
    setActionBusy(false)
  }

  const openDashboard = () => {
    setView('dashboard')
    setTableKey(null)
    activeTableRef.current = { key: null, cacheKey: '' }
    setModal(null)
    loadDashboard().catch(() => {})
  }

  const openTable = (key, options = {}) => {
    const nextQuery = options.query || freshQuery(options.filters || {})
    const cacheKey = queryCacheKey(key, nextQuery)
    const cached = tableCacheRef.current.get(cacheKey)

    activeTableRef.current = { key, cacheKey }
    setView('table')
    setTableKey(key)
    setQuery(nextQuery)
    setModal(null)
    setSelected(new Set())
    setResult(cached?.data || null)
    setTableLoading(!cached)

    // La navegación ya ocurrió. Los datos llegan después o se revalidan en segundo plano.
    fetchTable(key, nextQuery, { updateView: true }).catch(() => {})
  }

  const applyTableQuery = (nextQuery = query, force = true) => {
    if (!tableKey) return
    const cacheKey = queryCacheKey(tableKey, nextQuery)
    activeTableRef.current = { key: tableKey, cacheKey }
    setQuery(nextQuery)
    const cached = tableCacheRef.current.get(cacheKey)
    if (cached) setResult(cached.data)
    fetchTable(tableKey, nextQuery, { updateView: true, force }).catch(() => {})
  }

  const refresh = () => {
    if (view === 'dashboard') loadDashboard({ force: true }).catch(() => {})
    else applyTableQuery(query, true)
  }

  const saveRecord = async (mode, record, payload) => {
    setActionBusy(true)
    try {
      if (mode === 'create') await adminCommand('create', { tableKey, record: payload })
      else await adminCommand('update', { tableKey, id: record[activeDef.pk], record: payload })
      invalidateTableCache(tableKey)
      dashboardFetchedAtRef.current = 0
      setModal(null)
      notify(mode === 'create' ? 'Alta creada.' : 'Modificación guardada.')
      await fetchTable(tableKey, query, { updateView: true, force: true })
    } catch (error) {
      handleCommandError(error)
      throw error
    } finally {
      setActionBusy(false)
    }
  }

  const mutateRow = async (operation, row, message) => {
    setActionBusy(true)
    try {
      await adminCommand(operation, { tableKey, id: row[activeDef.pk] })
      invalidateTableCache(tableKey)
      dashboardFetchedAtRef.current = 0
      notify(message)
      await fetchTable(tableKey, query, { updateView: true, force: true })
    } catch (error) {
      handleCommandError(error)
    } finally {
      setActionBusy(false)
    }
  }

  const bulk = async (action) => {
    if (!selected.size || !window.confirm(`Aplicar ${action} a ${selected.size} registros?`)) return
    setActionBusy(true)
    try {
      const response = await adminCommand('bulk', { tableKey, ids: Array.from(selected), action })
      const failed = (response.results || []).filter((item) => !item.success)
      invalidateTableCache(tableKey)
      dashboardFetchedAtRef.current = 0
      notify(failed.length ? `Operación terminada con ${failed.length} error(es).` : 'Operación masiva completada.', failed.length ? 'error' : 'success')
      await fetchTable(tableKey, query, { updateView: true, force: true })
    } catch (error) {
      handleCommandError(error)
    } finally {
      setActionBusy(false)
    }
  }

  const exportRows = async () => {
    if (!activeDef) return
    setActionBusy(true)
    try {
      const exportQuery = { ...query, page: 1, pageSize: 100 }
      const first = await adminCommand('queryTable', { tableKey, query: exportQuery })
      const rows = [...first.rows]
      for (let page = 2; page <= first.pages; page += 1) {
        const part = await adminCommand('queryTable', { tableKey, query: { ...exportQuery, page } })
        rows.push(...part.rows)
      }
      const fields = [activeDef.pk, ...activeDef.listColumns.filter((field) => field !== activeDef.pk)]
      downloadCsv(`fedes-${tableKey}-${new Date().toISOString().slice(0, 10)}.csv`, rows, fields)
      notify(`${rows.length} registros exportados.`)
    } catch (error) {
      handleCommandError(error)
    } finally {
      setActionBusy(false)
    }
  }

  const openRecord = async (row, mode) => {
    if (!activeDef) return
    setActionBusy(true)
    try {
      const data = await adminCommand('record', { tableKey, id: row[activeDef.pk] })
      setModal({ type: 'record', mode, record: data.record })
    } catch (error) {
      handleCommandError(error)
    } finally {
      setActionBusy(false)
    }
  }

  const viewRecord = async (row) => {
    if (activeDef.special === 'campaign') return openCampaign360(row.campaign_key)
    if (activeDef.special === 'lead') return openLead360(row.lead_id)
    if (activeDef.special === 'onboarding') return openOnboarding360(row.onboarding_id)
    return openRecord(row, 'view')
  }

  const openCampaign360 = async (campaignKey) => {
    setActionBusy(true)
    try { setModal({ type: 'campaign360', data: await adminCommand('campaign360', { campaignKey }) }) } catch (error) { handleCommandError(error) } finally { setActionBusy(false) }
  }

  const openLead360 = async (leadId) => {
    setActionBusy(true)
    try { setModal({ type: 'lead360', data: await adminCommand('lead360', { leadId }) }) } catch (error) { handleCommandError(error) } finally { setActionBusy(false) }
  }

  const openOnboarding360 = async (onboardingId) => {
    setActionBusy(true)
    try { setModal({ type: 'onboarding360', data: await adminCommand('onboarding360', { onboardingId }) }) } catch (error) { handleCommandError(error) } finally { setActionBusy(false) }
  }

  const issueResume = async (leadId) => adminCommand('issueResumeLink', { leadId, ttlHours: 168 })

  const uploadMedia = async (payload) => {
    const response = await adminCommand('uploadMedia', payload)
    invalidateTableCache('media')
    notify('Imagen subida correctamente.')
    if (tableKey === 'media') await fetchTable('media', query, { updateView: true, force: true })
    return response
  }

  const changePassword = async (currentPassword, newPassword) => {
    await adminCommand('changePassword', { currentPassword, newPassword })
    notify('Contraseña actualizada.')
  }

  const rotateKey = async () => adminCommand('rotateVaddarApiKey')

  const title = view === 'dashboard' ? 'Inicio' : activeDef?.label || 'Backoffice'
  const subtitle = view === 'dashboard' ? 'Visión consolidada del CRM, campañas, onboarding, contenidos y actividad.' : subtitleFor(activeDef)

  const newButton = useMemo(() => {
    if (view !== 'table' || !activeDef) return null
    if (activeDef.key === 'media') return <button type="button" className="admin-button admin-button--primary" onClick={() => setModal({ type: 'mediaUpload' })}><Plus size={16} />Subir media</button>
    if (activeDef.permissions.create) return <button type="button" className="admin-button admin-button--primary" onClick={() => setModal({ type: 'record', mode: 'create', record: {} })}><Plus size={16} />Alta</button>
    return null
  }, [activeDef, view])

  if (!import.meta.env.VITE_GOOGLE_SCRIPT_URL) return <main className="admin-config-error"><h1>Falta VITE_GOOGLE_SCRIPT_URL</h1><p>Configurá el endpoint de Apps Script para usar el backoffice.</p></main>
  if (!token) return <LoginView onLogin={login} error={authError} busy={authBusy} />
  if (!workspace) return <BootView />

  return (
    <AdminShell
      workspace={workspace}
      view={view}
      tableKey={tableKey}
      title={title}
      subtitle={subtitle}
      onDashboard={openDashboard}
      onTable={openTable}
      onPrefetch={prefetchTable}
      onRefresh={refresh}
      onLogout={logout}
      onSecurity={() => setModal({ type: 'security' })}
      refreshing={tableLoading || dashboardLoading || booting}
    >
      {newButton && <div className="admin-view-actions">{newButton}</div>}

      {view === 'dashboard' ? (
        <div className="admin-view-stack">
          {dashboardLoading && dashboard && <div className="admin-inline-loading"><LoaderCircle className="is-spinning" size={14} />Actualizando resumen…</div>}
          {!dashboard && <TableLoadingState hasData={false} />}
          {dashboard && <DashboardView dashboard={dashboard} insights={insights} onTable={openTable} onCampaign={openCampaign360} onLead={openLead360} />}
        </div>
      ) : activeDef && (
        <div className="admin-view-stack">
          <FilterBar
            def={activeDef}
            result={result}
            query={query}
            setQuery={setQuery}
            onApply={() => applyTableQuery(query, true)}
            onClear={() => { const next = freshQuery(); applyTableQuery(next, true) }}
            onExport={exportRows}
          />
          {tableLoading && <TableLoadingState hasData={Boolean(result)} />}
          {result && (
            <DataTable
              def={activeDef}
              result={result}
              selected={selected}
              setSelected={setSelected}
              onView={viewRecord}
              onEdit={(row) => openRecord(row, 'edit')}
              onDuplicate={(row) => mutateRow('duplicate', row, 'Registro duplicado.')}
              onArchive={(row) => window.confirm('¿Dar de baja este registro?') && mutateRow('archive', row, 'Registro dado de baja.')}
              onRestore={(row) => mutateRow('restore', row, 'Registro restaurado.')}
              onDelete={(row) => window.confirm('Esta baja es definitiva. ¿Eliminar el registro?') && mutateRow('delete', row, 'Registro eliminado.')}
              onBulk={bulk}
              onPage={(page) => applyTableQuery({ ...query, page }, false)}
              onPageSize={(pageSize) => applyTableQuery({ ...query, page: 1, pageSize }, false)}
            />
          )}
        </div>
      )}

      {modal?.type === 'record' && activeDef && <RecordModal def={activeDef} mode={modal.mode} record={modal.record} onClose={() => setModal(null)} onSave={(payload) => saveRecord(modal.mode, modal.record, payload)} onUploadMedia={uploadMedia} />}
      {modal?.type === 'campaign360' && <Campaign360Modal data={modal.data} onClose={() => setModal(null)} onOpenLeads={() => openTable('leads', { filters: { campaign_key: modal.data.campaign.campaign_key } })} onEditCampaign={() => { const row = modal.data.campaign; setTableKey('campaigns'); setModal({ type: 'record', mode: 'edit', record: row }) }} />}
      {modal?.type === 'lead360' && <Lead360Modal data={modal.data} onClose={() => setModal(null)} onEdit={() => { setTableKey('leads'); setModal({ type: 'record', mode: 'edit', record: modal.data.lead }) }} onIssueResume={issueResume} />}
      {modal?.type === 'onboarding360' && <Onboarding360Modal data={modal.data} onClose={() => setModal(null)} onEdit={() => { setTableKey('onboarding'); setModal({ type: 'record', mode: 'edit', record: modal.data.onboarding }) }} />}
      {modal?.type === 'security' && <SecurityModal onClose={() => setModal(null)} onChangePassword={changePassword} onRotateKey={rotateKey} />}
      {modal?.type === 'mediaUpload' && <MediaUploadModal onClose={() => setModal(null)} onUpload={uploadMedia} />}

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>}
      {actionBusy && <div className="admin-action-progress"><LoaderCircle className="is-spinning" size={15} /><span>Cargando…</span></div>}
    </AdminShell>
  )
}
