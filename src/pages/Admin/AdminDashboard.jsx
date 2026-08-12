import { useCallback, useEffect, useMemo, useState } from 'react'
import { KeyRound, LoaderCircle, Plus, ShieldCheck } from 'lucide-react'
import AdminShell from './components/AdminShell'
import DashboardView from './components/DashboardView'
import DataTable, { FilterBar } from './components/DataTable'
import RecordModal from './components/RecordModal'
import { Campaign360Modal, Lead360Modal, Onboarding360Modal } from './components/SpecialModal'
import SecurityModal from './components/SecurityModal'
import MediaUploadModal from './components/MediaUploadModal'
import { adminCommand, downloadCsv, getAdminToken, loginAdmin, logoutAdmin, setAdminToken } from './adminApi'
import './AdminDashboard.scss'

const INITIAL_QUERY = {
  search: '', filters: {}, dateFrom: '', dateTo: '', includeArchived: false,
  page: 1, pageSize: 50, sortBy: '', sortDir: 'desc',
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
  return (
    <main className="admin-login-page">
      <div className="admin-ambient admin-ambient--one" />
      <div className="admin-ambient admin-ambient--two" />
      <form className="admin-login-card admin-glass" onSubmit={(event) => { event.preventDefault(); onLogin(password) }}>
        <div className="admin-login-logo">F</div>
        <span className="admin-eyebrow">Backoffice · Fedes</span>
        <h1>Centro de gestión</h1>
        <p>CRM, campañas, onboarding, sitio web, analítica y datos en un único panel React.</p>
        <label className="admin-field"><span>Contraseña</span><div className="admin-login-input"><KeyRound size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoFocus required /></div></label>
        {error && <div className="admin-form-error">{error}</div>}
        <button className="admin-button admin-button--primary admin-button--wide" type="submit" disabled={busy}>{busy ? <LoaderCircle className="is-spinning" size={17} /> : <ShieldCheck size={17} />}{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </main>
  )
}

export default function AdminDashboard() {
  const [token, setToken] = useState(() => getAdminToken())
  const [workspace, setWorkspace] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState(null)
  const [view, setView] = useState('dashboard')
  const [tableKey, setTableKey] = useState(null)
  const [result, setResult] = useState(null)
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [selected, setSelected] = useState(new Set())
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [toast, setToast] = useState(null)

  const tables = workspace?.tables || {}
  const activeDef = tableKey ? tables[tableKey] : null

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    window.setTimeout(() => setToast((current) => current?.message === message ? null : current), 3500)
  }, [])

  const handleCommandError = useCallback((error) => {
    if (/sesión vencida|sesión inválida/i.test(error.message)) {
      setAdminToken('')
      setToken('')
      setWorkspace(null)
      setAuthError('La sesión venció. Ingresá nuevamente.')
    } else notify(error.message, 'error')
  }, [notify])

  const loadDashboard = useCallback(async () => {
    setBusy(true)
    try {
      const [dashboardData, insightData] = await Promise.all([adminCommand('dashboard'), adminCommand('insights')])
      setDashboard(dashboardData)
      setInsights(insightData)
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }, [handleCommandError])

  const boot = useCallback(async () => {
    if (!getAdminToken()) return
    setBusy(true)
    try {
      const data = await adminCommand('workspace')
      setWorkspace(data)
      setView('dashboard')
      setTableKey(null)
      const [dashboardData, insightData] = await Promise.all([adminCommand('dashboard'), adminCommand('insights')])
      setDashboard(dashboardData)
      setInsights(insightData)
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }, [handleCommandError])

  useEffect(() => { if (token) boot() }, [token, boot])

  const login = async (password) => {
    setBusy(true)
    setAuthError('')
    try {
      const response = await loginAdmin(password)
      setToken(response.token)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    setBusy(true)
    try { await logoutAdmin() } catch { setAdminToken('') }
    setToken('')
    setWorkspace(null)
    setDashboard(null)
    setInsights(null)
    setBusy(false)
  }

  const fetchTable = useCallback(async (key, nextQuery = query) => {
    setBusy(true)
    try {
      const data = await adminCommand('queryTable', { tableKey: key, query: nextQuery })
      setResult(data)
      setSelected(new Set())
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }, [handleCommandError, query])

  const openDashboard = async () => {
    setView('dashboard')
    setTableKey(null)
    setModal(null)
    await loadDashboard()
  }

  const openTable = async (key, options = {}) => {
    const nextQuery = options.query || { ...INITIAL_QUERY, filters: options.filters || {} }
    setView('table')
    setTableKey(key)
    setQuery(nextQuery)
    setModal(null)
    await fetchTable(key, nextQuery)
  }

  const refresh = () => view === 'dashboard' ? loadDashboard() : fetchTable(tableKey, query)

  const saveRecord = async (mode, record, payload) => {
    setBusy(true)
    try {
      if (mode === 'create') await adminCommand('create', { tableKey, record: payload })
      else await adminCommand('update', { tableKey, id: record[activeDef.pk], record: payload })
      setModal(null)
      notify(mode === 'create' ? 'Alta creada.' : 'Modificación guardada.')
      await fetchTable(tableKey, query)
    } catch (error) {
      handleCommandError(error)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const mutateRow = async (operation, row, message) => {
    setBusy(true)
    try {
      await adminCommand(operation, { tableKey, id: row[activeDef.pk] })
      notify(message)
      await fetchTable(tableKey, query)
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }

  const bulk = async (action) => {
    if (!selected.size || !window.confirm(`Aplicar ${action} a ${selected.size} registros?`)) return
    setBusy(true)
    try {
      const response = await adminCommand('bulk', { tableKey, ids: Array.from(selected), action })
      const failed = (response.results || []).filter((item) => !item.success)
      notify(failed.length ? `Operación terminada con ${failed.length} error(es).` : 'Operación masiva completada.', failed.length ? 'error' : 'success')
      await fetchTable(tableKey, query)
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }

  const exportRows = async () => {
    if (!activeDef) return
    setBusy(true)
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
      setBusy(false)
    }
  }

  const openRecord = async (row, mode) => {
    if (!activeDef) return
    setBusy(true)
    try {
      const data = await adminCommand('record', { tableKey, id: row[activeDef.pk] })
      setModal({ type: 'record', mode, record: data.record })
    } catch (error) {
      handleCommandError(error)
    } finally {
      setBusy(false)
    }
  }

  const viewRecord = async (row) => {
    if (activeDef.special === 'campaign') return openCampaign360(row.campaign_key)
    if (activeDef.special === 'lead') return openLead360(row.lead_id)
    if (activeDef.special === 'onboarding') return openOnboarding360(row.onboarding_id)
    return openRecord(row, 'view')
  }

  const openCampaign360 = async (campaignKey) => {
    setBusy(true)
    try { setModal({ type: 'campaign360', data: await adminCommand('campaign360', { campaignKey }) }) } catch (error) { handleCommandError(error) } finally { setBusy(false) }
  }
  const openLead360 = async (leadId) => {
    setBusy(true)
    try { setModal({ type: 'lead360', data: await adminCommand('lead360', { leadId }) }) } catch (error) { handleCommandError(error) } finally { setBusy(false) }
  }
  const openOnboarding360 = async (onboardingId) => {
    setBusy(true)
    try { setModal({ type: 'onboarding360', data: await adminCommand('onboarding360', { onboardingId }) }) } catch (error) { handleCommandError(error) } finally { setBusy(false) }
  }

  const issueResume = async (leadId) => adminCommand('issueResumeLink', { leadId, ttlHours: 168 })

  const uploadMedia = async (payload) => {
    await adminCommand('uploadMedia', payload)
    notify('Imagen subida correctamente.')
    if (tableKey === 'media') await fetchTable('media', query)
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
  if (!token || !workspace) return <LoginView onLogin={login} error={authError} busy={busy} />

  return (
    <AdminShell workspace={workspace} view={view} tableKey={tableKey} title={title} subtitle={subtitle} onDashboard={openDashboard} onTable={openTable} onRefresh={refresh} onLogout={logout} onSecurity={() => setModal({ type: 'security' })}>
      {newButton && <div className="admin-view-actions">{newButton}</div>}
      {view === 'dashboard' ? <DashboardView dashboard={dashboard} insights={insights} onTable={openTable} onCampaign={openCampaign360} onLead={openLead360} /> : activeDef && <><FilterBar def={activeDef} result={result} query={query} setQuery={setQuery} onApply={() => fetchTable(tableKey, query)} onClear={() => { const next = { ...INITIAL_QUERY }; setQuery(next); fetchTable(tableKey, next) }} onExport={exportRows} /><DataTable def={activeDef} result={result} selected={selected} setSelected={setSelected} onView={viewRecord} onEdit={(row) => openRecord(row, 'edit')} onDuplicate={(row) => mutateRow('duplicate', row, 'Registro duplicado.')} onArchive={(row) => window.confirm('¿Dar de baja este registro?') && mutateRow('archive', row, 'Registro dado de baja.')} onRestore={(row) => mutateRow('restore', row, 'Registro restaurado.')} onDelete={(row) => window.confirm('Esta baja es definitiva. ¿Eliminar el registro?') && mutateRow('delete', row, 'Registro eliminado.')} onBulk={bulk} onPage={(page) => { const next = { ...query, page }; setQuery(next); fetchTable(tableKey, next) }} onPageSize={(pageSize) => { const next = { ...query, page: 1, pageSize }; setQuery(next); fetchTable(tableKey, next) }} /></>}

      {modal?.type === 'record' && activeDef && <RecordModal def={activeDef} mode={modal.mode} record={modal.record} onClose={() => setModal(null)} onSave={(payload) => saveRecord(modal.mode, modal.record, payload)} />}
      {modal?.type === 'campaign360' && <Campaign360Modal data={modal.data} onClose={() => setModal(null)} onOpenLeads={() => openTable('leads', { filters: { campaign_key: modal.data.campaign.campaign_key } })} onEditCampaign={() => { const row = modal.data.campaign; setTableKey('campaigns'); setModal({ type: 'record', mode: 'edit', record: row }) }} />}
      {modal?.type === 'lead360' && <Lead360Modal data={modal.data} onClose={() => setModal(null)} onEdit={() => { setTableKey('leads'); setModal({ type: 'record', mode: 'edit', record: modal.data.lead }) }} onIssueResume={issueResume} />}
      {modal?.type === 'onboarding360' && <Onboarding360Modal data={modal.data} onClose={() => setModal(null)} onEdit={() => { setTableKey('onboarding'); setModal({ type: 'record', mode: 'edit', record: modal.data.onboarding }) }} />}
      {modal?.type === 'security' && <SecurityModal onClose={() => setModal(null)} onChangePassword={changePassword} onRotateKey={rotateKey} />}
      {modal?.type === 'mediaUpload' && <MediaUploadModal onClose={() => setModal(null)} onUpload={uploadMedia} />}

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>}
      {busy && <div className="admin-busy-overlay"><LoaderCircle className="is-spinning" size={28} /><span>Procesando…</span></div>}
    </AdminShell>
  )
}
