import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ContactRound,
  FileCheck2,
  Megaphone,
  MousePointerClick,
  Radar,
  UserRoundSearch,
  Users,
} from 'lucide-react'
import { StatusPill } from './DataTable'

function rate(numerator, denominator) {
  if (!denominator) return '0%'
  return `${Math.round((Number(numerator || 0) * 1000) / Number(denominator || 1)) / 10}%`
}

function PrimaryKpi({ label, value, note, icon: Icon, tone = 'default' }) {
  return (
    <article className={`admin-overview-kpi admin-glass-soft tone-${tone}`}>
      <div className="admin-overview-kpi__icon"><Icon size={19} /></div>
      <div className="admin-overview-kpi__copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function CompactMetric({ label, value, note }) {
  return (
    <div className="admin-compact-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  )
}

function Distribution({ rows = [] }) {
  if (!rows.length) return <div className="admin-empty-inline">Sin datos todavía.</div>
  const max = Math.max(...rows.map((item) => item.count), 1)
  return <div className="admin-distribution admin-distribution--modern">{rows.slice(0, 8).map((item) => <div className="admin-distribution-row" key={item.key}><span title={item.key}>{item.key}</span><div><i style={{ width: `${Math.max(4, Math.round((item.count / max) * 100))}%` }} /></div><strong>{item.count}</strong></div>)}</div>
}

function CampaignFunnel({ campaign }) {
  const stages = [
    ['Interacciones', campaign.interactions || 0],
    ['Visitas', campaign.views || 0],
    ['Leads', campaign.leads || 0],
    ['Respondieron', campaign.responders || 0],
    ['Completos', campaign.complete || 0],
  ]
  const max = Math.max(...stages.map(([, value]) => Number(value) || 0), 1)

  return (
    <div className="admin-campaign-mini-funnel admin-campaign-mini-funnel--five">
      {stages.map(([label, value]) => (
        <div className="admin-campaign-mini-funnel__stage" key={label}>
          <div className="admin-campaign-mini-funnel__label"><span>{label}</span><strong>{value}</strong></div>
          <div className="admin-campaign-mini-funnel__track"><i style={{ width: `${Math.max(value ? 8 : 0, Math.round((value / max) * 100))}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

function HeroState({ hero }) {
  const active = Boolean(hero?.active)
  const reasonLabels = {
    campaign_hidden: 'Campaña oculta',
    scheduled: 'Programado',
    ended: 'Finalizado',
    hero_disabled: 'Hero oculto',
    missing_desktop: 'Falta desktop',
    missing_mobile: 'Falta mobile',
  }
  return <span className={`admin-runtime-pill ${active ? 'is-live' : 'is-off'}`}><span className="admin-runtime-dot" />{active ? 'Hero visible' : reasonLabels[hero?.reason] || 'Hero no visible'}</span>
}

function CampaignCard({ campaign, onOpen }) {
  return (
    <article className="admin-campaign-overview-card admin-glass-soft">
      <div className="admin-campaign-overview-card__head">
        <div><span className="admin-card-eyebrow">{campaign.campaign_key}</span><h3>{campaign.name || campaign.campaign_key}</h3></div>
        <StatusPill value={campaign.status} />
      </div>
      <div className="admin-campaign-overview-card__runtime"><HeroState hero={campaign.hero} /><span>{campaign.publishedLandings || 0}/{campaign.landings || 0} landings públicas</span><span>{campaign.impressions || 0} impresiones · {campaign.bannerClicks || 0} clicks</span></div>
      <CampaignFunnel campaign={campaign} />
      <div className="admin-campaign-overview-card__rates"><span><b>{campaign.viewToLead || 0}%</b> visita → lead</span><span><b>{campaign.leadToResponse || 0}%</b> lead → respuesta</span><span><b>{campaign.leadToComplete || 0}%</b> lead → completo</span><span><b>{campaign.traceability || 0}%</b> sesiones enlazadas</span></div>
      <button type="button" className="admin-button admin-button--ghost admin-campaign-open" onClick={() => onOpen(campaign.campaign_key)}>Centro de control <ArrowRight size={14} /></button>
    </article>
  )
}

function CmsHealth({ cms = {}, onTable }) {
  const rows = [
    ['Blog y Recursos', cms.blog, 'blog'], ['Contenido Web', cms.content, 'content'], ['Media', cms.media, 'media'],
    ['Casos de éxito', cms.cases, 'cases'], ['Equipo', cms.team, 'team'], ['Testimonios', cms.testimonials, 'testimonials'],
  ]
  return <div className="admin-cms-health-grid">{rows.map(([label, data, table]) => <button type="button" key={table} onClick={() => onTable(table)}><span>{label}</span><strong>{data?.published || 0}<small> / {data?.total || 0}</small></strong><em>{data?.draft || 0} borradores · {data?.hidden || 0} ocultos</em></button>)}</div>
}

function DashboardShortcuts({ stats, onTable }) {
  const items = [
    ['Campañas', `${stats.activeCampaigns || 0} activas`, 'campaigns', Megaphone],
    ['Leads', `${stats.leads || 0} identificados`, 'leads', UserRoundSearch],
    ['Analítica', `${stats.interactions || 0} eventos`, 'analytics', ChartNoAxesCombined],
    ['Contactos', `${stats.contacts || 0} consultas`, 'contacts', ContactRound],
    ['Onboarding', `${stats.onboardingCompleted || 0}/${stats.onboardings || 0} completos`, 'onboarding', ClipboardCheck],
  ]
  return (
    <div className="admin-dashboard-shortcuts">
      {items.map(([label, note, table, Icon]) => (
        <button type="button" key={table} onClick={() => onTable(table)}>
          <i><Icon size={17} /></i><span><strong>{label}</strong><small>{note}</small></span>
        </button>
      ))}
    </div>
  )
}

export default function DashboardView({ dashboard, insights, onTable, onCampaign, onLead }) {
  const stats = dashboard?.stats || {}
  const health = dashboard?.health || {}

  return (
    <div className="admin-dashboard-stack admin-dashboard-modern">
      <section className="admin-dashboard-intro">
        <div><span className="admin-card-eyebrow">Resumen operativo</span><h2>Actividad y CRM</h2></div>
        <div className={`admin-health-badge ${health.campaignIssues ? 'has-warning' : ''}`}>{health.campaignIssues ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}<div><strong>{health.campaignIssues ? `${health.campaignIssues} campaña(s) para revisar` : 'Operación conectada'}</strong><span>{health.analyticsEvents || 0} eventos · {health.analyticsSessions || 0} sesiones</span></div></div>
      </section>

      <DashboardShortcuts stats={stats} onTable={onTable} />

      <div className="admin-primary-kpi-grid">
        <PrimaryKpi label="Interacciones" value={stats.interactions || 0} note={`${stats.heroImpressions || 0} impresiones · ${stats.heroClicks || 0} clicks`} icon={Radar} tone="violet" />
        <PrimaryKpi label="Visitas a landings" value={stats.landingViews || 0} note={`${stats.landingSessions || 0} sesiones`} icon={MousePointerClick} tone="blue" />
        <PrimaryKpi label="Leads identificados" value={stats.leads || 0} note={`${rate(stats.leads, stats.landingViews)} de las visitas`} icon={Users} tone="cyan" />
        <PrimaryKpi label="Respondieron" value={stats.responders || 0} note={`${rate(stats.responders, stats.leads)} de los leads`} icon={Activity} tone="amber" />
        <PrimaryKpi label="Completaron" value={stats.complete || 0} note={`${rate(stats.complete, stats.leads)} de los leads`} icon={FileCheck2} tone="green" />
      </div>

      <section className="admin-compact-metrics admin-glass-soft">
        <CompactMetric label="Campañas activas" value={stats.activeCampaigns || 0} note={`${stats.campaigns || 0} totales`} />
        <CompactMetric label="Calificados" value={stats.qualified || 0} note="Resultado comercial" />
        <CompactMetric label="Contactos" value={stats.contacts || 0} note="Formularios generales" />
        <CompactMetric label="Onboardings" value={stats.onboardings || 0} note={`${stats.onboardingCompleted || 0} completos`} />
        <CompactMetric label="Mailings pendientes" value={stats.mailingsPending || 0} note="Pendientes / programados" />
      </section>

      <section className="admin-panel admin-glass-soft admin-dashboard-campaigns">
        <div className="admin-panel-head"><div><span>Campañas</span><h3>Control de campañas</h3></div><button type="button" onClick={() => onTable('campaigns')}>Ver todas <ArrowRight size={14} /></button></div>
        <div className="admin-campaign-overview-grid">{(dashboard?.campaigns || []).length ? dashboard.campaigns.map((campaign) => <CampaignCard key={campaign.campaign_key} campaign={campaign} onOpen={onCampaign} />) : <div className="admin-empty-inline">Todavía no hay campañas.</div>}</div>
      </section>

      <div className="admin-dashboard-grid admin-dashboard-grid--balanced">
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Operación</span><h3>Necesitan atención</h3></div></div><div className="admin-attention-list">{(dashboard?.attention || []).length ? dashboard.attention.map((lead) => <button type="button" key={lead.lead_id} onClick={() => onLead(lead.lead_id)}><div><strong>{lead.company || lead.full_name || lead.email}</strong><span>{lead.landing_key || 'sin landing'} · {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleString('es-AR') : 'sin fecha'}</span></div><StatusPill value={lead.status} /></button>) : <div className="admin-empty-inline">Todo al día.</div>}</div></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Leads recientes</h3></div><button type="button" onClick={() => onTable('leads')}>Abrir <ArrowRight size={14} /></button></div><div className="admin-attention-list">{(dashboard?.recentLeads || []).map((lead) => <button type="button" key={lead.lead_id} onClick={() => onLead(lead.lead_id)}><div><strong>{lead.company || lead.full_name || lead.email}</strong><span>{lead.campaign_key || 'Sin campaña'} · {lead.landing_key || 'sin landing'} · {lead.source || 'Sin origen'}</span></div><StatusPill value={lead.status} /></button>)}</div></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Analítica</span><h3>Páginas con actividad</h3></div><button type="button" onClick={() => onTable('analytics')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.analytics?.topPages || []} /></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Atribución</span><h3>Fuentes de tráfico</h3></div></div><Distribution rows={insights?.analytics?.topSources || []} /></section>
      </div>

      <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Integridad</span><h3>Conexiones de datos</h3></div></div><div className="admin-connection-grid admin-connection-grid--tracking"><CompactMetric label="Eventos" value={health.analyticsEvents || 0} note="AN_Events" /><CompactMetric label="Sesiones" value={health.analyticsSessions || 0} note="tráfico anónimo" /><CompactMetric label="Leads con landing" value={`${health.leadsWithLanding || 0}/${stats.leads || 0}`} note="adquisición" /><CompactMetric label="Leads con origen" value={`${health.leadsWithSource || 0}/${stats.leads || 0}`} note="source" /><CompactMetric label="Leads con sesión" value={`${health.leadsWithSession || 0}/${stats.leads || 0}`} note="trazabilidad" /><CompactMetric label="Sesiones enlazadas" value={health.linkedLeadSessions || 0} note="analítica ↔ CRM" /><CompactMetric label="Última landing" value={`${health.leadsWithLastLanding || 0}/${stats.leads || 0}`} note="último contacto" /><CompactMetric label="Visitor ID" value={`${health.leadsWithVisitor || 0}/${stats.leads || 0}`} note="identidad web" /><CompactMetric label="Landings públicas" value={health.publishedLandings || 0} note="URLs activas" /><CompactMetric label="Alertas" value={health.campaignIssues || 0} note="campañas" /></div></section>

      <div className="admin-dashboard-grid admin-dashboard-grid--balanced">
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Etapas de leads</h3></div><button type="button" onClick={() => onTable('leads')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.crm?.leadStages || []} /></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Clasificación interna</h3></div></div><Distribution rows={insights?.crm?.leadClassifications || []} /></section>
      </div>

      <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CMS</span><h3>Salud editorial</h3></div></div><CmsHealth cms={insights?.cms} onTable={onTable} /></section>

      <div className="admin-dashboard-grid admin-dashboard-grid--balanced">
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Auditoría</span><h3>Actividad administrativa</h3></div><button type="button" onClick={() => onTable('audit')}>Historial <ArrowRight size={14} /></button></div><div className="admin-attention-list">{(dashboard?.recentAudit || []).map((item) => <button type="button" key={item.audit_id} onClick={() => onTable('audit')}><div><strong>{item.action} · {item.entity}</strong><span>{item.actor || 'admin'} · {item.created_at ? new Date(item.created_at).toLocaleString('es-AR') : '—'}</span></div><ArrowRight size={15} /></button>)}</div></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Contactos</span><h3>Origen de consultas</h3></div><button type="button" onClick={() => onTable('contacts')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.crm?.contactSources || []} /></section>
      </div>
    </div>
  )
}
