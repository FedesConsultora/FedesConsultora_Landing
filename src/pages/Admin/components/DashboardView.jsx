import { ArrowRight, CircleAlert, ContactRound, FileCheck2, Mail, Megaphone, Users } from 'lucide-react'
import { StatusPill } from './DataTable'

function StatCard({ label, value, note, icon: Icon }) {
  return <article className="admin-stat-card admin-glass-soft"><div className="admin-stat-icon"><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>
}

function Distribution({ rows = [] }) {
  if (!rows.length) return <div className="admin-empty-inline">Sin datos todavía.</div>
  const max = Math.max(...rows.map((item) => item.count), 1)
  return <div className="admin-distribution">{rows.map((item) => <div className="admin-distribution-row" key={item.key}><span title={item.key}>{item.key}</span><div><i style={{ width: `${Math.round((item.count / max) * 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div>
}

function CmsHealth({ cms = {}, onTable }) {
  const rows = [
    ['Blog y Recursos', cms.blog, 'blog'], ['Contenido Web', cms.content, 'content'], ['Media', cms.media, 'media'],
    ['Casos de éxito', cms.cases, 'cases'], ['Equipo', cms.team, 'team'], ['Testimonios', cms.testimonials, 'testimonials'],
  ]
  return <div className="admin-table-shell"><table className="admin-data-table"><thead><tr><th>Entidad</th><th>Total</th><th>Publicados</th><th>Borradores</th><th>Ocultos</th><th /></tr></thead><tbody>{rows.map(([label, data, table]) => <tr key={table}><td><strong>{label}</strong></td><td>{data?.total || 0}</td><td>{data?.published || 0}</td><td>{data?.draft || 0}</td><td>{data?.hidden || 0}</td><td><button type="button" className="admin-link-button" onClick={() => onTable(table)}>Abrir</button></td></tr>)}</tbody></table></div>
}

export default function DashboardView({ dashboard, insights, onTable, onCampaign, onLead }) {
  const stats = dashboard?.stats || {}
  const conversion = stats.leads ? `${Math.round((stats.complete * 1000) / stats.leads) / 10}%` : '0%'
  return (
    <div className="admin-dashboard-stack">
      <div className="admin-stats-grid">
        <StatCard label="Leads" value={stats.leads || 0} note="Base comercial" icon={Users} />
        <StatCard label="Completos" value={stats.complete || 0} note="Formularios finalizados" icon={FileCheck2} />
        <StatCard label="Incompletos" value={stats.incomplete || 0} note="Seguimiento pendiente" icon={CircleAlert} />
        <StatCard label="Conversión" value={conversion} note="Global de campañas" icon={Megaphone} />
        <StatCard label="Contactos" value={stats.contacts || 0} note="Consultas generales" icon={ContactRound} />
        <StatCard label="Onboardings" value={stats.onboardings || 0} note={`${stats.onboardingCompleted || 0} completados`} icon={FileCheck2} />
        <StatCard label="Campañas" value={stats.campaigns || 0} note="Históricas + activas" icon={Megaphone} />
        <StatCard label="Mailings pendientes" value={stats.mailingsPending || 0} note="Pendientes / programados" icon={Mail} />
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-panel--wide admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Campañas</h3><p>Galicia es una campaña dentro del ecosistema general.</p></div><button type="button" onClick={() => onTable('campaigns')}>Ver todas <ArrowRight size={14} /></button></div><div className="admin-table-shell"><table className="admin-data-table"><thead><tr><th>Campaña</th><th>Estado</th><th>Leads</th><th>Completos</th><th>Incompletos</th><th>Conversión</th><th /></tr></thead><tbody>{(dashboard?.campaigns || []).map((campaign) => <tr key={campaign.campaign_key}><td><strong>{campaign.name || campaign.campaign_key}</strong><small className="admin-subcell">{campaign.campaign_key}</small></td><td><StatusPill value={campaign.status} /></td><td>{campaign.total}</td><td>{campaign.complete}</td><td>{campaign.incomplete}</td><td>{campaign.conversion}%</td><td><button type="button" className="admin-link-button" onClick={() => onCampaign(campaign.campaign_key)}>360°</button></td></tr>)}</tbody></table></div></section>

        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Operación</span><h3>Necesitan atención</h3><p>Incompletos de +24 h o revisión manual pendiente.</p></div></div><div className="admin-attention-list">{(dashboard?.attention || []).length ? dashboard.attention.map((lead) => <button type="button" key={lead.lead_id} onClick={() => onLead(lead.lead_id)}><div><strong>{lead.company || lead.full_name || lead.email}</strong><span>{lead.status} · {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleString('es-AR') : 'sin fecha'}</span></div><ArrowRight size={15} /></button>) : <div className="admin-empty-inline">Todo al día.</div>}</div></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Leads recientes</h3><p>Últimos ingresos de todas las campañas.</p></div><button type="button" onClick={() => onTable('leads')}>Abrir <ArrowRight size={14} /></button></div><div className="admin-attention-list">{(dashboard?.recentLeads || []).map((lead) => <button type="button" key={lead.lead_id} onClick={() => onLead(lead.lead_id)}><div><strong>{lead.company || lead.full_name || lead.email}</strong><span>{lead.campaign_key || 'Sin campaña'} · {lead.source || 'Sin origen'}</span></div><StatusPill value={lead.status} /></button>)}</div></section>

        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Analítica</span><h3>Últimos 30 días</h3><p>{insights?.analytics?.last30 || 0} eventos recientes.</p></div><button type="button" onClick={() => onTable('analytics')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.analytics?.topPages || []} /></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Atribución</span><h3>Fuentes de tráfico</h3><p>Origen de los eventos web recientes.</p></div></div><Distribution rows={insights?.analytics?.topSources || []} /></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Etapas de leads</h3><p>Distribución transversal a todas las campañas.</p></div><button type="button" onClick={() => onTable('leads')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.crm?.leadStages || []} /></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>CRM</span><h3>Clasificación interna</h3><p>Lectura agregada de la base comercial.</p></div></div><Distribution rows={insights?.crm?.leadClassifications || []} /></section>

        <section className="admin-panel admin-panel--wide admin-glass-soft"><div className="admin-panel-head"><div><span>CMS</span><h3>Salud editorial</h3><p>Estado de publicación del contenido administrable.</p></div></div><CmsHealth cms={insights?.cms} onTable={onTable} /></section>

        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Auditoría</span><h3>Actividad administrativa</h3><p>Últimos cambios registrados.</p></div><button type="button" onClick={() => onTable('audit')}>Historial <ArrowRight size={14} /></button></div><div className="admin-attention-list">{(dashboard?.recentAudit || []).map((item) => <button type="button" key={item.audit_id} onClick={() => onTable('audit')}><div><strong>{item.action} · {item.entity}</strong><span>{item.actor || 'admin'} · {item.created_at ? new Date(item.created_at).toLocaleString('es-AR') : '—'}</span></div><ArrowRight size={15} /></button>)}</div></section>
        <section className="admin-panel admin-glass-soft"><div className="admin-panel-head"><div><span>Contactos</span><h3>Origen de consultas</h3><p>Distribución de formularios de contacto.</p></div><button type="button" onClick={() => onTable('contacts')}>Abrir <ArrowRight size={14} /></button></div><Distribution rows={insights?.crm?.contactSources || []} /></section>

        <section className="admin-panel admin-panel--wide admin-glass-soft"><div className="admin-panel-head"><div><span>Calidad</span><h3>Salud de la base</h3><p>Huecos que conviene revisar para mantener los datos accionables.</p></div></div><div className="admin-quality-grid">{[
          ['Leads sin email', insights?.quality?.leadsMissingEmail || 0, 'leads'], ['Leads sin empresa', insights?.quality?.leadsMissingCompany || 0, 'leads'], ['Leads sin origen', insights?.quality?.leadsMissingSource || 0, 'leads'], ['Onboarding sin email', insights?.quality?.onboardingMissingEmail || 0, 'onboarding'], ['Onboarding sin empresa', insights?.quality?.onboardingMissingCompany || 0, 'onboarding'], ['Posts sin contenido', insights?.quality?.blogMissingContent || 0, 'blog'], ['Media sin alt', insights?.quality?.mediaMissingAlt || 0, 'media'], ['Mailings fallidos', insights?.quality?.failedMailings || 0, 'leadMailings'],
        ].map(([label, count, table]) => <button type="button" key={label} onClick={() => onTable(table)}><span>{label}</span><strong className={count ? 'has-warning' : ''}>{count || '✓'}</strong></button>)}</div></section>
      </div>
    </div>
  )
}
