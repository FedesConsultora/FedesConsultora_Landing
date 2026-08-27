import { useCallback, useEffect, useState } from 'react'
import { Activity, BarChart3, Clock3, Eye, MousePointerClick, Radar, Users } from 'lucide-react'
import { adminCommand } from '../adminApi'

function compactNumber(value) {
  return new Intl.NumberFormat('es-AR', { notation: Number(value || 0) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(Number(value || 0))
}

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <article className="admin-analytics-kpi admin-glass-soft">
      <span className="admin-analytics-kpi__icon"><Icon size={17} /></span>
      <div><span>{label}</span><strong>{compactNumber(value)}</strong>{note && <small>{note}</small>}</div>
    </article>
  )
}

function TrendChart({ rows = [] }) {
  if (!rows.length) return <div className="admin-empty-inline">Sin actividad para el período.</div>
  const width = 760
  const height = 210
  const insetX = 24
  const insetTop = 18
  const insetBottom = 38
  const usableW = width - insetX * 2
  const usableH = height - insetTop - insetBottom
  const max = Math.max(...rows.map((row) => Number(row.events) || 0), 1)
  const points = rows.map((row, index) => {
    const x = insetX + (rows.length <= 1 ? 0 : (index / (rows.length - 1)) * usableW)
    const y = insetTop + usableH - ((Number(row.events) || 0) / max) * usableH
    return { x, y, row }
  })
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = `${insetX},${insetTop + usableH} ${line} ${insetX + usableW},${insetTop + usableH}`
  const labelStep = rows.length <= 7 ? 1 : Math.ceil(rows.length / 6)

  return (
    <div className="admin-trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Actividad por día">
        {[0, 1, 2, 3].map((step) => {
          const y = insetTop + (usableH / 3) * step
          return <line key={step} className="admin-trend-grid" x1={insetX} y1={y} x2={width - insetX} y2={y} />
        })}
        <polygon className="admin-trend-area" points={area} />
        <polyline className="admin-trend-line" points={line} fill="none" />
        {points.map((point, index) => (
          <g key={point.row.date}>
            <circle className="admin-trend-dot" cx={point.x} cy={point.y} r="3.6"><title>{`${point.row.date}: ${point.row.events} eventos · ${point.row.sessions} sesiones`}</title></circle>
            {(index % labelStep === 0 || index === rows.length - 1) && <text className="admin-trend-label" x={point.x} y={height - 12} textAnchor="middle">{point.row.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  )
}

function Heatmap({ data }) {
  const days = data?.days || []
  const hours = data?.hours || []
  const matrix = data?.matrix || []
  const max = Math.max(Number(data?.max) || 0, 1)
  const levelFor = (value) => {
    if (!value) return 0
    const ratio = value / max
    if (ratio < 0.2) return 1
    if (ratio < 0.45) return 2
    if (ratio < 0.7) return 3
    return 4
  }

  return (
    <div className="admin-heatmap-wrap">
      <div className="admin-heatmap-hours">
        <span />
        {hours.map((hour) => <span key={hour}>{hour % 3 === 0 ? String(hour).padStart(2, '0') : ''}</span>)}
      </div>
      <div className="admin-heatmap-grid">
        {days.map((day, dayIndex) => (
          <div className="admin-heatmap-row" key={day}>
            <strong>{day}</strong>
            {hours.map((hour) => {
              const value = Number(matrix?.[dayIndex]?.[hour] || 0)
              return <span key={`${day}-${hour}`} className={`heat-${levelFor(value)}`} title={`${day} ${String(hour).padStart(2, '0')}:00 · ${value} eventos`}><i /></span>
            })}
          </div>
        ))}
      </div>
      <div className="admin-heatmap-legend"><span>Menos</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={`heat-${level}`} />)}<span>Más</span></div>
    </div>
  )
}

function Ranking({ title, rows = [] }) {
  const max = Math.max(...rows.map((row) => Number(row.count) || 0), 1)
  return (
    <section className="admin-analytics-ranking admin-glass-soft">
      <div className="admin-analytics-section-head"><h3>{title}</h3></div>
      <div className="admin-analytics-ranking__list">
        {rows.length ? rows.map((row) => (
          <div className="admin-analytics-ranking__row" key={row.key}>
            <div><span title={row.key}>{row.key}</span><strong>{compactNumber(row.count)}</strong></div>
            <i><b style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }} /></i>
          </div>
        )) : <div className="admin-empty-inline">Sin datos.</div>}
      </div>
    </section>
  )
}

function Coverage({ data = {} }) {
  const rows = [
    ['Sesión', data.session],
    ['Visitante', data.visitor],
    ['Campaña', data.campaign],
    ['Landing', data.landing],
    ['Origen', data.source],
    ['UTM campaign', data.utmCampaign],
  ]
  return (
    <section className="admin-analytics-coverage admin-glass-soft">
      <div className="admin-analytics-section-head"><h3>Cobertura de datos</h3></div>
      <div className="admin-analytics-coverage__grid">
        {rows.map(([label, value]) => (
          <article key={label}><span>{label}</span><strong>{Number(value || 0).toFixed(1)}%</strong><i><b style={{ width: `${Math.min(100, Math.max(0, Number(value || 0)))}%` }} /></i></article>
        ))}
      </div>
    </section>
  )
}

export default function AnalyticsOverview() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (range) => {
    setLoading(true)
    setError('')
    try {
      setData(await adminCommand('analyticsOverview', { days: range }))
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cargar el resumen visual.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  const stats = data?.stats || {}
  const top = data?.top || {}

  return (
    <div className="admin-analytics-overview">
      <div className="admin-analytics-toolbar">
        <div className="admin-segmented-control" aria-label="Período analítico">
          {[7, 30, 90].map((value) => <button type="button" key={value} className={days === value ? 'is-active' : ''} onClick={() => setDays(value)}>{value} días</button>)}
        </div>
        {loading && <span className="admin-analytics-updating"><Activity size={13} />Actualizando</span>}
      </div>

      {error && <div className="admin-form-error">{error}</div>}

      <div className="admin-analytics-kpi-grid">
        <StatCard label="Eventos" value={stats.events} note={`${stats.sessions || 0} sesiones`} icon={Radar} />
        <StatCard label="Visitantes" value={stats.visitors} note="IDs reconocidos" icon={Users} />
        <StatCard label="Vistas landing" value={stats.landingViews} note={`${stats.landingSessions || 0} sesiones`} icon={Eye} />
        <StatCard label="Clicks Hero" value={stats.heroClicks} note={`${stats.heroImpressions || 0} impresiones`} icon={MousePointerClick} />
        <StatCard label="Campañas" value={stats.campaigns} note="con actividad" icon={BarChart3} />
      </div>

      <div className="admin-analytics-main-grid">
        <section className="admin-analytics-chart-card admin-glass-soft">
          <div className="admin-analytics-section-head"><div><span>Actividad</span><h3>Tendencia</h3></div><Clock3 size={16} /></div>
          <TrendChart rows={data?.trend || []} />
        </section>
        <section className="admin-analytics-chart-card admin-glass-soft">
          <div className="admin-analytics-section-head"><div><span>Comportamiento</span><h3>Mapa de calor</h3></div></div>
          <Heatmap data={data?.heatmap} />
        </section>
      </div>

      <div className="admin-analytics-ranking-grid">
        <Ranking title="Campañas" rows={top.campaigns} />
        <Ranking title="Landings" rows={top.landings} />
        <Ranking title="Fuentes" rows={top.sources} />
        <Ranking title="Páginas" rows={top.pages} />
        <Ranking title="Eventos" rows={top.events} />
        <Ranking title="Categorías" rows={top.categories} />
      </div>

      <Coverage data={data?.coverage} />
    </div>
  )
}
