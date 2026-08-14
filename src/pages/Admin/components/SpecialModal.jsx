import { useState } from 'react'
import { Copy, ExternalLink, KeyRound, Pencil, X } from 'lucide-react'
import { StatusPill } from './DataTable'
import AdminModalPortal from './AdminModalPortal'

function asBoolean(value) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1'
}

function Kpi({ label, value }) {
  return <div className="admin-mini-kpi"><strong>{value ?? '—'}</strong><span>{label}</span></div>
}

function RowList({ rows, columns }) {
  if (!rows?.length) return <div className="admin-empty-inline">Sin registros.</div>
  return <div className="admin-table-shell"><table className="admin-data-table"><thead><tr>{columns.map((column) => <th key={column}>{column.replace(/_/g, ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.answer_id || row.event_id || row.mailing_id || index}>{columns.map((column) => <td key={column}>{column === 'status' || column === 'classification' || column === 'segment' ? <StatusPill value={row[column]} /> : String(row[column] ?? '—')}</td>)}</tr>)}</tbody></table></div>
}

function Distribution({ data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1])
  if (!entries.length) return <div className="admin-empty-inline">Sin datos.</div>
  const max = Math.max(...entries.map(([, value]) => value), 1)
  return <div className="admin-distribution">{entries.map(([key, value]) => <div className="admin-distribution-row" key={key}><span>{key}</span><div><i style={{ width: `${Math.round((value / max) * 100)}%` }} /></div><strong>{value}</strong></div>)}</div>
}

function ModalFrame({ title, subtitle, onClose, children, actions }) {
  return (
    <AdminModalPortal>
      <div className="admin-modal-layer">
        <button type="button" aria-label="Cerrar" className="admin-modal-backdrop" onClick={onClose} />
        <section className="admin-modal admin-modal--xl admin-glass" role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
          <div className="admin-modal-heading"><span>Vista 360°</span><h2>{title}</h2><p>{subtitle}</p></div>
          {children}
          {actions && <div className="admin-modal-actions">{actions}</div>}
        </section>
      </div>
    </AdminModalPortal>
  )
}

export function Campaign360Modal({ data, onClose, onOpenLeads, onEditCampaign, onLead }) {
  const campaign = data.campaign || {}
  const stats = data.stats || {}
  return <ModalFrame title={campaign.name || campaign.campaign_key} subtitle={`${campaign.campaign_key || ''} · ${campaign.landing_path || 'Sin landing'} · ${campaign.status || ''}`} onClose={onClose} actions={<><button type="button" className="admin-button admin-button--ghost" onClick={onEditCampaign}><Pencil size={15} />Modificar campaña</button><button type="button" className="admin-button admin-button--primary" onClick={onOpenLeads}>Ver todos los leads</button></>}>
    <div className="admin-kpi-row"><Kpi label="Leads" value={stats.total || 0} /><Kpi label="Completos" value={stats.complete || 0} /><Kpi label="Incompletos" value={stats.incomplete || 0} /><Kpi label="Conversión" value={`${stats.conversion || 0}%`} /><Kpi label="Calificados" value={stats.qualified || 0} /><Kpi label="Revisión" value={stats.review || 0} /><Kpi label="Recursos" value={stats.resources || 0} /><Kpi label="Clicks reunión" value={stats.meetingClicks || 0} /></div>
    <div className="admin-special-grid">
      <section className="admin-panel admin-glass-soft"><h3>Origen operativo</h3><Distribution data={data.sources} /></section>
      <section className="admin-panel admin-glass-soft"><h3>UTM source</h3><Distribution data={data.utmSources} /></section>
      <section className="admin-panel admin-glass-soft"><h3>UTM medium</h3><Distribution data={data.utmMediums} /></section>
      <section className="admin-panel admin-glass-soft"><h3>UTM campaign</h3><Distribution data={data.utmCampaigns} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Segmentos</h3><Distribution data={data.segments} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Etapas</h3><Distribution data={data.stages} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Mailings</h3><Distribution data={data.mailingStatuses} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Eventos</h3><Distribution data={data.eventTypes} /></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Leads recientes de la campaña</h3><div className="admin-attention-list">{(data.recentLeads || []).length ? data.recentLeads.map((lead) => <button type="button" key={lead.lead_id} onClick={() => onLead?.(lead.lead_id)}><div><strong>{lead.company || lead.full_name || lead.email || 'Lead'}</strong><span>{lead.source || 'Sin origen'} · {lead.utm_source || 'sin UTM source'} · {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleString('es-AR') : 'sin actividad'}</span></div><StatusPill value={lead.status} /></button>) : <div className="admin-empty-inline">Todavía no hay leads.</div>}</div></section>
    </div>
  </ModalFrame>
}

export function Lead360Modal({ data, onClose, onEdit, onIssueResume }) {
  const lead = data.lead || {}
  const [resume, setResume] = useState(null)
  const [resumeError, setResumeError] = useState('')
  const [resumeBusy, setResumeBusy] = useState(false)

  const issueResume = async () => {
    setResumeError('')
    setResumeBusy(true)
    try { setResume(await onIssueResume(lead.lead_id)) } catch (error) { setResumeError(error.message) } finally { setResumeBusy(false) }
  }

  const copyResume = async () => {
    if (!resume?.relativeUrl) return
    const url = `${window.location.origin}${resume.relativeUrl}`
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
  }

  return <ModalFrame title={lead.company || lead.full_name || lead.email || 'Lead'} subtitle={`${lead.email || ''} · ${lead.campaign_key || 'Sin campaña'} · ${lead.source || 'Sin origen'}`} onClose={onClose} actions={<><button type="button" className="admin-button admin-button--ghost" onClick={onEdit}><Pencil size={15} />Modificar lead</button>{lead.campaign_key === 'galicia-2026' && <button type="button" className="admin-button admin-button--primary" disabled={resumeBusy} onClick={issueResume}><KeyRound size={15} />{resumeBusy ? 'Generando…' : 'Generar recuperación'}</button>}</>}>
    <div className="admin-kpi-row"><Kpi label="Estado" value={lead.status} /><Kpi label="Score" value={lead.score_total ?? 0} /><Kpi label="Clasificación" value={lead.classification || '—'} /><Kpi label="Segmento" value={lead.mailing_segment || '—'} /><Kpi label="Paso" value={lead.current_step || 1} /><Kpi label="Revisión" value={lead.manual_review_status || '—'} /></div>
    {resumeError && <div className="admin-form-error">{resumeError}</div>}
    {resume && <div className="admin-resume-banner"><div><strong>Enlace de recuperación generado</strong><span>Vence: {new Date(resume.expiresAt).toLocaleString('es-AR')}</span></div><div><button type="button" onClick={copyResume}><Copy size={15} />Copiar</button><a href={`${window.location.origin}${resume.relativeUrl}`} target="_blank" rel="noreferrer"><ExternalLink size={15} />Abrir</a></div></div>}
    <div className="admin-special-grid">
      <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Perfil y seguimiento</h3><div className="admin-detail-grid">{['full_name','email','phone','company','website','owner','next_action_at','meeting_status','meeting_clicked_at','last_activity_at'].map((field) => <article className="admin-detail-card" key={field}><label>{field.replace(/_/g, ' ')}</label><div>{field === 'website' && lead[field] ? <a className="admin-inline-link" href={lead[field]} target="_blank" rel="noreferrer">{lead[field]} <ExternalLink size={12} /></a> : String(lead[field] ?? '—')}</div></article>)}</div></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Evaluación interna y atribución</h3><div className="admin-detail-grid">{['stage','status','score_total','knockout','classification','benefit','mailing_segment','manual_review_status','source','utm_source','utm_medium','utm_campaign','referrer'].map((field) => <article className="admin-detail-card" key={field}><label>{field.replace(/_/g, ' ')}</label><div>{field === 'knockout' ? (asBoolean(lead[field]) ? 'Sí' : 'No') : String(lead[field] ?? '—')}</div></article>)}</div></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Respuestas</h3><RowList rows={data.answers} columns={['question_key','answer_key','answer_text','score','knockout','updated_at']} /></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Mailings</h3><RowList rows={data.mailings} columns={['sequence_no','template_key','segment','status','scheduled_at','sent_at']} /></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Timeline</h3><RowList rows={data.events} columns={['event_type','source','page_path','created_at']} /></section>
    </div>
  </ModalFrame>
}

export function Onboarding360Modal({ data, onClose, onEdit }) {
  const onboarding = data.onboarding || {}
  const payload = data.data?.formData || data.data || {}
  const answers = Object.entries(payload).filter(([key, value]) => /^q\d+$/.test(key) && value).sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
  return <ModalFrame title={onboarding.company_name || onboarding.cuit || 'Onboarding'} subtitle={`${onboarding.contact_name || ''} · ${onboarding.email || ''}`} onClose={onClose} actions={<button type="button" className="admin-button admin-button--primary" onClick={onEdit}><Pencil size={15} />Modificar onboarding</button>}>
    <div className="admin-kpi-row"><Kpi label="Paso" value={onboarding.current_step || 1} /><Kpi label="Estado" value={onboarding.status} /><Kpi label="Completado" value={asBoolean(onboarding.is_completed) ? 'Sí' : 'No'} /><Kpi label="CUIT" value={onboarding.cuit} /></div>
    <div className="admin-special-grid"><section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Datos generales</h3><div className="admin-detail-grid">{Object.entries(payload).filter(([key]) => !/^q\d+$/.test(key)).map(([key, value]) => <article className="admin-detail-card" key={key}><label>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</label><div>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</div></article>)}</div></section>{answers.length > 0 && <section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Respuestas estratégicas</h3><div className="admin-answer-list">{answers.map(([key, value]) => <article key={key}><strong>{key.toUpperCase()}</strong><p>{String(value)}</p></article>)}</div></section>}</div>
  </ModalFrame>
}
