import { Archive, ChevronLeft, ChevronRight, Copy, Download, Eye, Filter, Pencil, RotateCcw, Search, Trash2, X } from 'lucide-react'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function valueLabel(value) {
  if (value === true || value === 'true') return 'Sí'
  if (value === false || value === 'false') return 'No'
  if (value == null || value === '') return '—'
  return String(value)
}

export function StatusPill({ value }) {
  const normalized = String(value || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  return <span className={`admin-status-pill status-${normalized || 'empty'}`}>{valueLabel(value)}</span>
}

function CellValue({ field, value }) {
  if (field.type === 'datetime') return <span>{formatDate(value)}</span>
  if (field.type === 'boolean') return <StatusPill value={value === true || value === 'true' ? 'Sí' : 'No'} />
  if (['status', 'classification', 'mailing_segment', 'manual_review_status', 'meeting_status'].includes(field.name)) return <StatusPill value={value} />
  const text = valueLabel(value)
  return <span className="admin-cell-text" title={text}>{text}</span>
}

export function FilterBar({ def, result, query, setQuery, onApply, onClear, onExport }) {
  const fieldsByName = Object.fromEntries(def.fields.map((field) => [field.name, field]))
  const updateFilter = (name, value) => setQuery((current) => ({ ...current, filters: { ...current.filters, [name]: value }, page: 1 }))
  return (
    <div className="admin-filter-card admin-glass-soft">
      <div className="admin-filter-main">
        <div className="admin-search-wrap"><Search size={17} /><input value={query.search} onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value, page: 1 }))} onKeyDown={(event) => event.key === 'Enter' && onApply()} placeholder={`Buscar en ${def.label.toLowerCase()}…`} /></div>
        <button type="button" className="admin-button admin-button--primary" onClick={onApply}><Search size={16} />Buscar</button>
        <button type="button" className="admin-button admin-button--ghost" onClick={onClear}><X size={16} />Limpiar</button>
        <button type="button" className="admin-button admin-button--ghost" onClick={onExport}><Download size={16} />CSV</button>
      </div>
      <div className="admin-filter-grid">
        {def.filterFields.map((name) => (
          <label className="admin-field" key={name}><span>{fieldsByName[name]?.label || name}</span><select value={query.filters[name] || ''} onChange={(event) => updateFilter(name, event.target.value)}><option value="">Todos</option>{(result?.facets?.[name] || []).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        ))}
        <label className="admin-field"><span>Desde</span><input type="date" value={query.dateFrom} onChange={(event) => setQuery((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))} /></label>
        <label className="admin-field"><span>Hasta</span><input type="date" value={query.dateTo} onChange={(event) => setQuery((current) => ({ ...current, dateTo: event.target.value, page: 1 }))} /></label>
        <label className="admin-field"><span>Ordenar por</span><select value={query.sortBy} onChange={(event) => setQuery((current) => ({ ...current, sortBy: event.target.value, page: 1 }))}><option value="">Predeterminado</option>{def.fields.filter((field) => !['json', 'textarea'].includes(field.type)).map((field) => <option key={field.name} value={field.name}>{field.label}</option>)}</select></label>
        <label className="admin-field"><span>Dirección</span><select value={query.sortDir} onChange={(event) => setQuery((current) => ({ ...current, sortDir: event.target.value, page: 1 }))}><option value="desc">Descendente</option><option value="asc">Ascendente</option></select></label>
        {def.fields.some((field) => field.name === 'archived_at') && <label className="admin-field"><span>Histórico</span><select value={query.includeArchived ? 'true' : 'false'} onChange={(event) => setQuery((current) => ({ ...current, includeArchived: event.target.value === 'true', page: 1 }))}><option value="false">Sólo activos</option><option value="true">Incluir bajas</option></select></label>}
        <div className="admin-filter-apply"><Filter size={15} /><button type="button" onClick={onApply}>Aplicar filtros</button></div>
      </div>
    </div>
  )
}

export default function DataTable({ def, result, selected, setSelected, onView, onEdit, onDuplicate, onArchive, onRestore, onDelete, onBulk, onPage, onPageSize }) {
  const fields = Object.fromEntries(def.fields.map((field) => [field.name, field]))
  const rows = result?.rows || []
  const canSelect = def.permissions.deleteMode !== 'none'
  const toggleAll = (checked) => setSelected(checked ? new Set(rows.map((row) => String(row[def.pk]))) : new Set())
  const toggleOne = (id, checked) => setSelected((current) => { const next = new Set(current); if (checked) next.add(String(id)); else next.delete(String(id)); return next })

  return (
    <>
      {selected.size > 0 && <div className="admin-bulk-bar"><span><strong>{selected.size}</strong> seleccionados</span><div>{def.permissions.deleteMode === 'archive' && <><button type="button" className="admin-button admin-button--danger admin-button--small" onClick={() => onBulk('archive')}><Archive size={14} />Dar de baja</button><button type="button" className="admin-button admin-button--success admin-button--small" onClick={() => onBulk('restore')}><RotateCcw size={14} />Restaurar</button></>}{def.permissions.deleteMode === 'hard' && <button type="button" className="admin-button admin-button--danger admin-button--small" onClick={() => onBulk('delete')}><Trash2 size={14} />Eliminar</button>}</div></div>}
      <div className="admin-table-shell">
        <table className="admin-data-table">
          <thead><tr><th className="admin-checkbox-cell">{canSelect && <input type="checkbox" checked={rows.length > 0 && rows.every((row) => selected.has(String(row[def.pk])))} onChange={(event) => toggleAll(event.target.checked)} />}</th>{def.listColumns.map((name) => <th key={name}>{fields[name]?.label || name}</th>)}<th>Acciones</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={def.listColumns.length + 2}><div className="admin-empty-state"><strong>Sin resultados</strong><span>Probá quitando filtros o creando un registro.</span></div></td></tr> : rows.map((row) => {
              const id = row[def.pk]
              const archived = Boolean(row.archived_at)
              const duplicable = ['settings', 'content', 'modules', 'cases', 'testimonials', 'team', 'blog', 'gallery', 'campaigns'].includes(def.key)
              return <tr key={String(id)}><td className="admin-checkbox-cell">{canSelect && <input type="checkbox" checked={selected.has(String(id))} onChange={(event) => toggleOne(id, event.target.checked)} />}</td>{def.listColumns.map((name) => <td key={name}><CellValue field={fields[name] || { name, type: 'text' }} value={row[name]} /></td>)}<td><div className="admin-row-actions"><button type="button" title="Consulta" onClick={() => onView(row)}><Eye size={15} /></button>{def.permissions.write && <button type="button" title="Modificar" onClick={() => onEdit(row)}><Pencil size={15} /></button>}{duplicable && <button type="button" title="Duplicar" onClick={() => onDuplicate(row)}><Copy size={15} /></button>}{def.permissions.deleteMode === 'archive' && (archived ? <button type="button" title="Restaurar" onClick={() => onRestore(row)}><RotateCcw size={15} /></button> : <button type="button" title="Dar de baja" className="is-danger" onClick={() => onArchive(row)}><Archive size={15} /></button>)}{def.permissions.deleteMode === 'hard' && <button type="button" title="Eliminar" className="is-danger" onClick={() => onDelete(row)}><Trash2 size={15} /></button>}</div></td></tr>
            })}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination"><span>Mostrando {result?.total ? ((result.page - 1) * result.pageSize) + 1 : 0}–{Math.min((result?.page || 1) * (result?.pageSize || 50), result?.total || 0)} de <strong>{result?.total || 0}</strong></span><div><select value={result?.pageSize || 50} onChange={(event) => onPageSize(Number(event.target.value))}><option value="25">25</option><option value="50">50</option><option value="100">100</option></select><button type="button" disabled={(result?.page || 1) <= 1} onClick={() => onPage((result?.page || 1) - 1)}><ChevronLeft size={16} /></button><span>{result?.page || 1} / {result?.pages || 1}</span><button type="button" disabled={(result?.page || 1) >= (result?.pages || 1)} onClick={() => onPage((result?.page || 1) + 1)}><ChevronRight size={16} /></button></div></div>
    </>
  )
}
