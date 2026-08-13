import {
  Activity, BadgeCheck, Boxes, ChartNoAxesCombined, ClipboardCheck, ContactRound, Database,
  History, Home, Image, Images, ListChecks, LogOut, Mail, Megaphone, Menu, Newspaper,
  PanelsTopLeft, Quote, RefreshCw, Settings, ShieldCheck, UserRoundSearch, Users, X,
} from 'lucide-react'
import Logo from '../../../assets/img/Logo.svg'

const ICONS = {
  Activity, BadgeCheck, Boxes, ChartNoAxesCombined, ClipboardCheck, ContactRound, Database,
  History, Home, Image, Images, ListChecks, Mail, Megaphone, Newspaper, PanelsTopLeft, Quote,
  Settings, UserRoundSearch, Users,
}

function NavItem({ active, icon, label, onClick }) {
  const Icon = ICONS[icon] || Database
  return (
    <button type="button" className={`admin-nav-item ${active ? 'is-active' : ''}`} onClick={onClick}>
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  )
}

export default function AdminShell({ workspace, view, tableKey, title, subtitle, onDashboard, onTable, onRefresh, onLogout, onSecurity, children }) {
  const groups = workspace?.groups || []
  const tables = workspace?.tables || {}

  return (
    <div className="react-admin-shell">
      <input id="admin-sidebar-toggle" className="admin-sidebar-toggle" type="checkbox" />
      <aside className="admin-sidebar admin-glass">
        <div className="admin-brand">
          <img className="admin-brand-logo" src={Logo} alt="Fedes" />
          <div><strong>Backoffice</strong><span>Gestión integral</span></div>
          <label htmlFor="admin-sidebar-toggle" className="admin-sidebar-close"><X size={18} /></label>
        </div>

        <nav className="admin-sidebar-nav">
          <NavItem active={view === 'dashboard'} icon="Home" label="Inicio" onClick={onDashboard} />
          {groups.map((group) => {
            const defs = Object.values(tables).filter((table) => table.group === group)
            if (!defs.length) return null
            return (
              <div className="admin-nav-group" key={group}>
                <div className="admin-nav-group-label">{group}</div>
                {defs.map((table) => (
                  <NavItem
                    key={table.key}
                    active={view === 'table' && tableKey === table.key}
                    icon={table.icon}
                    label={table.label}
                    onClick={() => onTable(table.key)}
                  />
                ))}
              </div>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-nav-item admin-security-entry" onClick={onSecurity}><ShieldCheck size={17} /><span>Seguridad y contraseña</span></button>
          <div className="admin-system-state"><i /> v{workspace?.app?.version || '—'} · DB {workspace?.app?.schemaVersion || '—'}</div>
          <button type="button" className="admin-nav-item is-danger" onClick={onLogout}><LogOut size={17} /><span>Salir</span></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar admin-glass">
          <div className="admin-topbar-copy">
            <div className="admin-topbar-mobile-row">
              <label htmlFor="admin-sidebar-toggle" className="admin-mobile-menu"><Menu size={19} /></label>
              <span className="admin-breadcrumb">Fedes / {title}</span>
            </div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-button admin-button--ghost" onClick={onSecurity}><ShieldCheck size={16} /><span>Seguridad</span></button>
            <button type="button" className="admin-button admin-button--ghost" onClick={onRefresh}><RefreshCw size={16} /><span>Actualizar</span></button>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  )
}
