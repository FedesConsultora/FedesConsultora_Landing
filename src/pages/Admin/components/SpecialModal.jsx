import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  Power,
  Settings2,
  Users,
  X,
} from 'lucide-react'
import { StatusPill } from './DataTable'
import AdminModalPortal from './AdminModalPortal'
import { adminCommand } from '../adminApi'

function asBoolean(value) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1'
}

function parseObject(value) {
  if (!value) return {}
  if (typeof value === 'object') return Array.isArray(value) ? {} : value
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function Kpi({ label, value, note }) {
  return <div className="admin-mini-kpi"><strong>{value ?? '—'}</strong><span>{label}</span>{note && <small>{note}</small>}</div>
}

function RowList({ rows, columns }) {
  if (!rows?.length) return <div className="admin-empty-inline">Sin registros.</div>
  return (
    <div className="admin-table-shell">
      <table className="admin-data-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column.replace(/_/g, ' ')}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.answer_id || row.event_id || row.mailing_id || index}>
              {columns.map((column) => (
                <td key={column}>
                  {column === 'status' || column === 'classification' || column === 'segment'
                    ? <StatusPill value={row[column]} />
                    : String(row[column] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Distribution({ data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1])
  if (!entries.length) return <div className="admin-empty-inline">Sin datos.</div>
  const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1)
  return (
    <div className="admin-distribution admin-distribution--modern">
      {entries.slice(0, 10).map(([key, value]) => (
        <div className="admin-distribution-row" key={key}>
          <span title={key}>{key}</span>
          <div><i style={{ width: `${Math.max(value ? 4 : 0, Math.round(((Number(value) || 0) / max) * 100))}%` }} /></div>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function ModalFrame({ title, subtitle, eyebrow = 'Vista 360°', onClose, children, actions, className = '' }) {
  return (
    <AdminModalPortal>
      <div className="admin-modal-layer">
        <button type="button" aria-label="Cerrar" className="admin-modal-backdrop" onClick={onClose} />
        <section className={`admin-modal admin-modal--xl admin-glass ${className}`} role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
          <div className="admin-modal-heading"><span>{eyebrow}</span><h2>{title}</h2><p>{subtitle}</p></div>
          {children}
          {actions && <div className="admin-modal-actions">{actions}</div>}
        </section>
      </div>
    </AdminModalPortal>
  )
}

function buildLandingTrackingUrl(landing) {
  const params = new URLSearchParams()
  if (landing.source_default) params.set('source', landing.source_default)
  if (landing.utm_source_default) params.set('utm_source', landing.utm_source_default)
  if (landing.utm_medium_default) params.set('utm_medium', landing.utm_medium_default)
  if (landing.utm_campaign_default) params.set('utm_campaign', landing.utm_campaign_default)
  if (landing.meta?.utmContent) params.set('utm_content', landing.meta.utmContent)
  const query = params.toString()
  return `${landing.path || '/'}${query ? `?${query}` : ''}`
}

function RuntimeCard({ label, value, note, state = 'neutral', action }) {
  return (
    <article className={`admin-runtime-card ${state === 'live' ? 'is-live' : state === 'warning' ? 'is-warning' : ''}`}>
      <div className="admin-runtime-card__head"><span>{label}</span>{action}</div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function IntegrityPanel({ integrity }) {
  const checks = integrity?.checks || []
  return (
    <section className="admin-panel admin-glass-soft admin-panel--span-4">
      <div className="admin-panel-heading-row">
        <div><h3>Integridad de la campaña</h3><p>Chequeos de conexión entre estado público, landings, atribución y Hero.</p></div>
        <span>{integrity?.score ?? 0}% conectado</span>
      </div>
      <div className="admin-integrity-grid">
        {checks.map((check) => (
          <div className={`admin-integrity-check ${check.ok ? 'is-ok' : ''}`} key={check.key}>
            <span>{check.ok ? <Check size={11} /> : '!'}</span>
            <div><strong>{check.label}</strong><small>{check.detail}</small></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CampaignLandingsPanel({ campaign, landings, funnelByLanding, onSetLandingStatus, onEditLanding }) {
  const copyUrl = async (landing) => {
    const relative = buildLandingTrackingUrl(landing)
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(`${window.location.origin}${relative}`)
  }

  const createLanding = () => onEditLanding?.({
    campaign_key: campaign.campaign_key,
    landing_key: '',
    name: '',
    path: '',
    benefit_label: '',
    benefit_percent: '',
    sort_order: (landings.length + 1) * 10,
    status: 'draft',
    meta: {},
  })

  return (
    <section className="admin-panel admin-glass-soft admin-panel--span-4 admin-campaign-landings">
      <div className="admin-panel-heading-row">
        <div>
          <h3>Landings de la campaña</h3>
          <p>Una campaña puede tener varias propuestas, descuentos y fuentes. Cada landing conserva su contenido, UTM y estado.</p>
        </div>
        <div className="admin-panel-heading-actions">
          <span>{landings.length} configurada{landings.length === 1 ? '' : 's'}</span>
          <button type="button" className="admin-button admin-button--ghost admin-button--small" onClick={createLanding}><Plus size={14} />Agregar landing</button>
        </div>
      </div>
      <div className="admin-campaign-landing-grid">
        {landings.map((landing) => {
          const relativeUrl = buildLandingTrackingUrl(landing)
          const publicNow = campaign.status === 'published' && landing.status === 'published'
          const funnel = funnelByLanding?.[landing.landing_key] || {}
          return (
            <article className="admin-campaign-landing-card" key={landing.landing_id || landing.landing_key}>
              <div className="admin-campaign-landing-card__head">
                <div><strong>{landing.name || landing.landing_key}</strong><span>{landing.path}</span></div>
                <StatusPill value={landing.status} />
              </div>
              <div className="admin-campaign-landing-card__meta">
                <span><b>Beneficio</b>{landing.benefit_label || '—'}</span>
                <span><b>Clave</b>{landing.landing_key || '—'}</span>
                <span><b>Tráfico</b>{funnel.views ?? 0} vistas · {funnel.uniqueViews ?? 0} sesiones</span>
                <span><b>Leads</b>{funnel.leads ?? 0} · {funnel.responders ?? 0} respondieron</span>
                <span><b>Sesiones enlazadas</b>{funnel.linkedLeads ?? 0} · {funnel.sessionCoverage ?? 0}% cobertura lead</span>
                <span><b>Sesión → lead</b>{`${funnel.sessionToLead ?? 0}%`}</span>
                <span><b>Completos</b>{funnel.complete ?? 0} · {funnel.leadToComplete ?? 0}% de leads</span>
                <span><b>Origen</b>{landing.source_default || '—'}</span>
                <span><b>UTM</b>{landing.utm_medium_default || '—'} · {landing.utm_campaign_default || '—'}</span>
              </div>
              <code className="admin-campaign-landing-url">{relativeUrl}</code>
              <div className="admin-campaign-landing-card__actions">
                <button type="button" className="admin-button admin-button--ghost" onClick={() => onEditLanding?.(landing)}><Pencil size={14} />Editar contenido</button>
                <button type="button" className="admin-button admin-button--ghost" onClick={() => copyUrl(landing)}><Copy size={14} />Copiar URL</button>
                {publicNow && <a className="admin-button admin-button--ghost" href={relativeUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} />Abrir</a>}
                {landing.status === 'published' ? (
                  <button type="button" className="admin-button admin-button--danger-soft" onClick={() => onSetLandingStatus?.(landing, 'hidden')}><EyeOff size={14} />Ocultar página</button>
                ) : (
                  <button type="button" className="admin-button admin-button--primary" onClick={() => onSetLandingStatus?.(landing, 'published')}><Eye size={14} />Publicar página</button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function FunnelOverview({ funnel }) {
  const stats = funnel?.stats || {}
  return (
    <section className="admin-panel admin-glass-soft admin-panel--span-4">
      <div className="admin-panel-heading-row">
        <div><h3>Embudo real</h3><p>Separa tráfico anónimo de personas identificadas. La conversión trazable usa session_id, no una aproximación por cantidad de eventos.</p></div>
      </div>
      <div className="admin-kpi-row admin-funnel-kpis">
        <Kpi label="Impresiones banner" value={stats.impressions ?? 0} />
        <Kpi label="Clicks banner" value={stats.bannerClicks ?? 0} />
        <Kpi label="Vistas landing" value={stats.landingViews ?? 0} />
        <Kpi label="Sesiones landing" value={stats.uniqueLandingSessions ?? 0} />
        <Kpi label="Leads" value={stats.identifiedLeads ?? 0} />
        <Kpi label="Leads con sesión" value={stats.leadsWithSession ?? 0} note={`${stats.sessionCoverage ?? 0}% cobertura`} />
        <Kpi label="Sesiones enlazadas" value={stats.linkedLeads ?? 0} note="visita ↔ lead" />
        <Kpi label="Respondieron" value={stats.responders ?? 0} />
        <Kpi label="Completaron" value={stats.complete ?? 0} />
      </div>
      <div className="admin-rate-strip admin-rate-strip--five">
        <span><b>{stats.clickToVisit ?? 0}%</b> click → vista</span>
        <span><b>{stats.sessionToLead ?? 0}%</b> sesión trazable → lead</span>
        <span><b>{stats.sessionCoverage ?? 0}%</b> leads con session_id</span>
        <span><b>{stats.leadToResponse ?? 0}%</b> lead → respuesta</span>
        <span><b>{stats.leadToComplete ?? 0}%</b> lead → completo</span>
      </div>
      {funnel?.trackingNote && <p className="admin-data-note">{funnel.trackingNote}</p>}
    </section>
  )
}

function AudiencePanel({ data, onLead }) {
  const responders = data.funnel?.responders || []
  const recent = data.recentLeads || []
  const answerDistribution = data.funnel?.answerDistribution || {}
  return (
    <>
      <section className="admin-panel admin-glass-soft admin-panel--span-2">
        <div className="admin-panel-heading-row"><div><h3>Quiénes respondieron</h3><p>Personas identificadas que contestaron al menos una pregunta.</p></div><span>{responders.length}</span></div>
        <div className="admin-attention-list">
          {responders.length ? responders.map((lead) => (
            <button type="button" key={lead.lead_id} onClick={() => onLead?.(lead.lead_id)}>
              <div><strong>{lead.company || lead.full_name || lead.email || 'Lead'}</strong><span>{lead.email || 'sin email'} · {lead.landing_key || 'sin landing'} · {lead.answer_count || 0} respuesta(s) · {lead.last_source || lead.source || 'sin origen'}</span></div>
              <StatusPill value={lead.status} />
            </button>
          )) : <div className="admin-empty-inline">Todavía nadie respondió preguntas.</div>}
        </div>
      </section>

      <section className="admin-panel admin-glass-soft admin-panel--span-2">
        <div className="admin-panel-heading-row"><div><h3>Leads recientes</h3><p>Última actividad comercial de esta campaña.</p></div><span>{recent.length}</span></div>
        <div className="admin-attention-list">
          {recent.length ? recent.map((lead) => (
            <button type="button" key={lead.lead_id} onClick={() => onLead?.(lead.lead_id)}>
              <div><strong>{lead.company || lead.full_name || lead.email || 'Lead'}</strong><span>{lead.landing_key || 'sin landing'} · {lead.source || 'sin origen'} · {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleString('es-AR') : 'sin actividad'}</span></div>
              <StatusPill value={lead.status} />
            </button>
          )) : <div className="admin-empty-inline">Todavía no hay leads.</div>}
        </div>
      </section>

      <section className="admin-panel admin-glass-soft admin-panel--span-4">
        <h3>Respuestas agregadas</h3>
        <div className="admin-answer-distribution-grid">
          {Object.keys(answerDistribution).length ? Object.entries(answerDistribution).map(([question, values]) => (
            <article key={question}><strong>{question.toUpperCase()}</strong><Distribution data={values} /></article>
          )) : <div className="admin-empty-inline">Todavía no hay respuestas.</div>}
        </div>
      </section>
    </>
  )
}

function AttributionPanel({ data }) {
  const stats = data.funnel?.stats || {}
  return (
    <>
      <section className="admin-panel admin-glass-soft admin-panel--span-4">
        <div className="admin-panel-heading-row"><div><h3>Cobertura de atribución</h3><p>Cuánto del tráfico puede vincularse determinísticamente con un lead identificado.</p></div><span>{stats.sessionCoverage ?? 0}% de leads con sesión</span></div>
        <div className="admin-kpi-row">
          <Kpi label="Sesiones landing" value={stats.uniqueLandingSessions ?? 0} />
          <Kpi label="Leads identificados" value={stats.identifiedLeads ?? 0} />
          <Kpi label="Leads con session_id" value={stats.leadsWithSession ?? 0} />
          <Kpi label="Sesiones enlazadas" value={stats.linkedLeads ?? 0} />
          <Kpi label="Sesión → lead" value={`${stats.sessionToLead ?? 0}%`} />
        </div>
      </section>
      <section className="admin-panel admin-glass-soft"><h3>Entradas por origen</h3><Distribution data={data.funnel?.visitSources} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Origen de leads</h3><Distribution data={data.sources} /></section>
      <section className="admin-panel admin-glass-soft"><h3>UTM source</h3><Distribution data={data.utmSources} /></section>
      <section className="admin-panel admin-glass-soft"><h3>UTM medium</h3><Distribution data={data.utmMediums} /></section>
      <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>UTM campaign</h3><Distribution data={data.utmCampaigns} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Segmentos</h3><Distribution data={data.segments} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Etapas</h3><Distribution data={data.stages} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Mailings</h3><Distribution data={data.mailingStatuses} /></section>
      <section className="admin-panel admin-glass-soft"><h3>Eventos CRM</h3><Distribution data={data.eventTypes} /></section>
    </>
  )
}

export function Campaign360Modal({
  data,
  onClose,
  onOpenLeads,
  onEditCampaign,
  onLead,
  onSetCampaignPublic,
  onSetLandingStatus,
  onEditLanding,
  onRuntimeChange,
}) {
  const [tab, setTab] = useState('overview')
  const [snapshot, setSnapshot] = useState(data)
  const [heroBusy, setHeroBusy] = useState(false)
  const [heroError, setHeroError] = useState('')

  useEffect(() => setSnapshot(data), [data])

  const campaign = snapshot?.campaign || {}
  const stats = snapshot?.stats || {}
  const landings = snapshot?.landings || []
  const funnel = snapshot?.funnel || {}
  const hero = snapshot?.hero || {}
  const publicState = snapshot?.publicState || {}
  const campaignPublished = campaign.status === 'published'

  const refreshLocal = async () => {
    const fresh = await adminCommand('campaign360', { campaignKey: campaign.campaign_key })
    setSnapshot(fresh)
    return fresh
  }

  const toggleHero = async () => {
    setHeroBusy(true)
    setHeroError('')
    try {
      await adminCommand('setCampaignHeroEnabled', { campaignKey: campaign.campaign_key, enabled: !hero.enabled })
      const fresh = await refreshLocal()
      onRuntimeChange?.(fresh)
    } catch (error) {
      setHeroError(error.message || 'No se pudo cambiar el estado del Hero.')
    } finally {
      setHeroBusy(false)
    }
  }

  const masterAction = campaignPublished ? (
    <button type="button" className="admin-button admin-button--danger-soft" onClick={() => onSetCampaignPublic?.(false)}><Power size={15} />Desactivar campaña pública</button>
  ) : (
    <button type="button" className="admin-button admin-button--primary" onClick={() => onSetCampaignPublic?.(true)}><Power size={15} />Publicar campaña</button>
  )

  const tabs = [
    ['overview', BarChart3, 'Resumen'],
    ['landings', Layers3, `Landings (${landings.length})`],
    ['audience', Users, 'Audiencia'],
    ['attribution', Globe2, 'Atribución'],
  ]

  return (
    <ModalFrame
      title={campaign.name || campaign.campaign_key}
      subtitle={`${campaign.campaign_key || ''} · control operativo y lectura de resultados`}
      eyebrow="Centro de control de campaña"
      onClose={onClose}
      className="admin-campaign-control-modal"
      actions={<>{masterAction}<button type="button" className="admin-button admin-button--ghost" onClick={onEditCampaign}><Settings2 size={15} />Configurar campaña</button><button type="button" className="admin-button admin-button--ghost" onClick={onOpenLeads}><Users size={15} />Ver todos los leads</button></>}
    >
      <div className="admin-control-tabs" role="tablist" aria-label="Secciones de campaña">
        {tabs.map(([key, Icon, label]) => (
          <button type="button" role="tab" aria-selected={tab === key} className={`admin-control-tab ${tab === key ? 'is-active' : ''}`} key={key} onClick={() => setTab(key)}><Icon size={13} />{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-special-grid">
          <section className="admin-panel admin-glass-soft admin-panel--span-4">
            <div className="admin-runtime-grid">
              <RuntimeCard
                label="Campaña pública"
                value={publicState.campaignPublic ? 'Activa' : 'No pública'}
                note={publicState.campaignPublic ? 'Las landings publicadas pueden abrirse.' : 'Ninguna landing hija puede abrirse.'}
                state={publicState.campaignPublic ? 'live' : 'warning'}
              />
              <RuntimeCard
                label="Hero de la Home"
                value={hero.active ? 'Visible ahora' : hero.enabled ? 'Habilitado, no visible' : 'Oculto'}
                note={hero.active ? 'El servidor entrega el banner en este momento.' : `Motivo: ${hero.reason || 'sin configurar'}`}
                state={hero.active ? 'live' : hero.enabled ? 'warning' : 'neutral'}
                action={<button type="button" className={`admin-runtime-action ${hero.enabled ? 'is-danger' : ''}`} onClick={toggleHero} disabled={heroBusy}>{heroBusy ? <LoaderCircle className="is-spinning" size={13} /> : hero.enabled ? <EyeOff size={13} /> : <Eye size={13} />}{hero.enabled ? 'Ocultar' : 'Mostrar'}</button>}
              />
              <RuntimeCard
                label="Páginas públicas"
                value={`${publicState.publishedLandings ?? 0} de ${publicState.totalLandings ?? landings.length}`}
                note="Cada descuento y canal vive en su propia landing."
                state={publicState.publishedLandings ? 'live' : 'warning'}
              />
            </div>
            {heroError && <div className="admin-form-error">{heroError}</div>}
          </section>

          <FunnelOverview funnel={funnel} />
          <IntegrityPanel integrity={snapshot?.integrity} />

          <section className="admin-panel admin-glass-soft admin-panel--span-4">
            <div className="admin-kpi-row">
              <Kpi label="Leads" value={stats.total || 0} />
              <Kpi label="Completos" value={stats.complete || 0} />
              <Kpi label="Incompletos" value={stats.incomplete || 0} />
              <Kpi label="Calificados" value={stats.qualified || 0} />
              <Kpi label="En evaluación" value={stats.review || 0} />
              <Kpi label="Recursos" value={stats.resources || 0} />
              <Kpi label="Clicks reunión" value={stats.meetingClicks || 0} />
            </div>
          </section>
        </div>
      )}

      {tab === 'landings' && <div className="admin-special-grid"><CampaignLandingsPanel campaign={campaign} landings={landings} funnelByLanding={funnel.byLanding} onSetLandingStatus={onSetLandingStatus} onEditLanding={onEditLanding} /></div>}
      {tab === 'audience' && <div className="admin-special-grid"><AudiencePanel data={snapshot} onLead={onLead} /></div>}
      {tab === 'attribution' && <div className="admin-special-grid"><AttributionPanel data={snapshot} /></div>}
    </ModalFrame>
  )
}

function AttributionValue({ label, value, technical = false }) {
  return <div className={`admin-attribution-value ${technical ? 'is-technical' : ''}`}><span>{label}</span><strong title={String(value || '')}>{value || '—'}</strong></div>
}

export function Lead360Modal({ data, onClose, onEdit, onIssueResume }) {
  const lead = data.lead || {}
  const metadata = useMemo(() => parseObject(lead.metadata_json), [lead.metadata_json])
  const firstAttribution = metadata.firstAttribution || {}
  const lastAttribution = metadata.lastAttribution || {}
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

  return (
    <ModalFrame
      title={lead.company || lead.full_name || lead.email || 'Lead'}
      subtitle={`${lead.email || ''} · ${lead.campaign_key || 'Sin campaña'} · ${lead.landing_key || 'Sin landing'} · ${lead.source || 'Sin origen'}`}
      eyebrow="Lead 360°"
      onClose={onClose}
      actions={<><button type="button" className="admin-button admin-button--ghost" onClick={onEdit}><Pencil size={15} />Modificar seguimiento</button>{lead.campaign_key === 'galicia-2026' && <button type="button" className="admin-button admin-button--primary" disabled={resumeBusy} onClick={issueResume}><KeyRound size={15} />{resumeBusy ? 'Generando…' : 'Generar recuperación'}</button>}</>}
    >
      <div className="admin-kpi-row"><Kpi label="Estado" value={lead.status} /><Kpi label="Score" value={lead.score_total ?? 0} /><Kpi label="Clasificación" value={lead.classification || '—'} /><Kpi label="Segmento" value={lead.mailing_segment || '—'} /><Kpi label="Paso" value={lead.current_step || 1} /><Kpi label="Revisión" value={lead.manual_review_status || '—'} /></div>
      {resumeError && <div className="admin-form-error">{resumeError}</div>}
      {resume && <div className="admin-resume-banner"><div><strong>Enlace de recuperación generado</strong><span>Vence: {new Date(resume.expiresAt).toLocaleString('es-AR')}</span></div><div><button type="button" onClick={copyResume}><Copy size={15} />Copiar</button><a href={`${window.location.origin}${resume.relativeUrl}`} target="_blank" rel="noreferrer"><ExternalLink size={15} />Abrir</a></div></div>}

      <div className="admin-special-grid">
        <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Persona y seguimiento</h3><div className="admin-detail-grid">{['full_name','email','phone','company','website','owner','next_action_at','meeting_status','meeting_clicked_at','last_activity_at'].map((field) => <article className="admin-detail-card" key={field}><label>{field.replace(/_/g, ' ')}</label><div>{field === 'website' && lead[field] ? <a className="admin-inline-link" href={lead[field]} target="_blank" rel="noreferrer">{lead[field]} <ExternalLink size={12} /></a> : String(lead[field] ?? '—')}</div></article>)}</div></section>
        <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Evaluación comercial</h3><div className="admin-detail-grid">{['campaign_key','stage','status','score_total','knockout','classification','benefit','mailing_segment','manual_review_status'].map((field) => <article className="admin-detail-card" key={field}><label>{field.replace(/_/g, ' ')}</label><div>{field === 'knockout' ? (asBoolean(lead[field]) ? 'Sí' : 'No') : String(lead[field] ?? '—')}</div></article>)}</div></section>

        <section className="admin-panel admin-glass-soft admin-panel--span-4 admin-lead-attribution">
          <div className="admin-panel-heading-row"><div><h3>Recorrido y atribución</h3><p>Primera adquisición separada del último contacto conocido. Los IDs permiten unir CRM con AN_Events sin inferencias.</p></div><span>{lead.session_id ? 'Sesión vinculable' : 'Histórico sin session_id'}</span></div>
          <div className="admin-attribution-columns">
            <article>
              <span className="admin-card-eyebrow">Primera adquisición</span>
              <AttributionValue label="Landing" value={firstAttribution.landingKey || lead.landing_key} />
              <AttributionValue label="Source" value={firstAttribution.source || lead.source} />
              <AttributionValue label="UTM source" value={firstAttribution.utmSource || lead.utm_source} />
              <AttributionValue label="UTM medium" value={firstAttribution.utmMedium || lead.utm_medium} />
              <AttributionValue label="UTM campaign" value={firstAttribution.utmCampaign || lead.utm_campaign} />
              <AttributionValue label="UTM content" value={firstAttribution.utmContent || lead.utm_content} />
            </article>
            <article>
              <span className="admin-card-eyebrow">Último contacto</span>
              <AttributionValue label="Landing" value={lastAttribution.landingKey || lead.last_landing_key || lead.landing_key} />
              <AttributionValue label="Source" value={lastAttribution.source || lead.last_source || lead.source} />
              <AttributionValue label="Referer" value={lastAttribution.referrer || lead.referrer} />
              <AttributionValue label="Sesión actual" value={lead.session_id || lastAttribution.sessionId} technical />
              <AttributionValue label="Visitor ID" value={lead.visitor_id || lastAttribution.visitorId || firstAttribution.visitorId} technical />
              <AttributionValue label="Sesión de adquisición" value={firstAttribution.sessionId} technical />
            </article>
          </div>
        </section>

        <section className="admin-panel admin-glass-soft admin-panel--span-4"><div className="admin-panel-heading-row"><div><h3>Respuestas</h3><p>Qué contestó esta persona y cómo aportó al scoring.</p></div><span>{data.answers?.length || 0} respuestas</span></div><RowList rows={data.answers} columns={['question_key','answer_key','answer_text','score','knockout','updated_at']} /></section>
        <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Mailings</h3><RowList rows={data.mailings} columns={['sequence_no','template_key','segment','status','scheduled_at','sent_at']} /></section>
        <section className="admin-panel admin-glass-soft admin-panel--span-2"><h3>Timeline</h3><RowList rows={data.events} columns={['landing_key','event_type','source','page_path','created_at']} /></section>
      </div>
    </ModalFrame>
  )
}

export function Onboarding360Modal({ data, onClose, onEdit }) {
  const onboarding = data.onboarding || {}
  const payload = data.data?.formData || data.data || {}
  const answers = Object.entries(payload).filter(([key, value]) => /^q\d+$/.test(key) && value).sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
  return (
    <ModalFrame title={onboarding.company_name || onboarding.cuit || 'Onboarding'} subtitle={`${onboarding.contact_name || ''} · ${onboarding.email || ''}`} onClose={onClose} actions={<button type="button" className="admin-button admin-button--primary" onClick={onEdit}><Pencil size={15} />Modificar onboarding</button>}>
      <div className="admin-kpi-row"><Kpi label="Paso" value={onboarding.current_step || 1} /><Kpi label="Estado" value={onboarding.status} /><Kpi label="Completado" value={asBoolean(onboarding.is_completed) ? 'Sí' : 'No'} /><Kpi label="CUIT" value={onboarding.cuit} /></div>
      <div className="admin-special-grid">
        <section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Datos generales</h3><div className="admin-detail-grid">{Object.entries(payload).filter(([key]) => !/^q\d+$/.test(key)).map(([key, value]) => <article className="admin-detail-card" key={key}><label>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</label><div>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</div></article>)}</div></section>
        {answers.length > 0 && <section className="admin-panel admin-glass-soft admin-panel--span-4"><h3>Respuestas estratégicas</h3><div className="admin-answer-list">{answers.map(([key, value]) => <article key={key}><strong>{key.toUpperCase()}</strong><p>{String(value)}</p></article>)}</div></section>}
      </div>
    </ModalFrame>
  )
}