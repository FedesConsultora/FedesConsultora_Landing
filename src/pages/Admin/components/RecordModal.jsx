import { useMemo, useState } from 'react'
import { Save, X } from 'lucide-react'
import { StatusPill } from './DataTable'

function formatInputValue(value, type) {
  if (value == null) return ''
  if (type === 'datetime' && value) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  if (type === 'json' && typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

function DetailValue({ field, value }) {
  if (field.type === 'boolean') return <StatusPill value={value === true || value === 'true' ? 'Sí' : 'No'} />
  if (['status', 'classification', 'mailing_segment', 'manual_review_status', 'meeting_status'].includes(field.name)) return <StatusPill value={value} />
  if (field.type === 'json') {
    let pretty = value || ''
    try { pretty = JSON.stringify(JSON.parse(value), null, 2) } catch { /* keep raw */ }
    return <pre className="admin-json-view">{pretty || '—'}</pre>
  }
  if (field.type === 'datetime') {
    const date = value ? new Date(value) : null
    return <span>{date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-AR') : '—'}</span>
  }
  return <span>{value == null || value === '' ? '—' : String(value)}</span>
}

export default function RecordModal({ def, mode, record, onClose, onSave }) {
  const [form, setForm] = useState(() => Object.fromEntries(def.fields.map((field) => [field.name, record?.[field.name] ?? ''])))
  const [error, setError] = useState('')
  const isView = mode === 'view'
  const title = mode === 'create' ? `Alta · ${def.label}` : mode === 'edit' ? `Modificar · ${def.label}` : `Consulta · ${def.label}`
  const editableFields = useMemo(() => def.fields.filter((field) => !field.readOnly), [def.fields])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {}
      editableFields.forEach((field) => {
        let value = form[field.name]
        if (field.type === 'boolean') value = Boolean(value)
        if (field.type === 'number' && value !== '') value = Number(value)
        if (field.type === 'json' && value) JSON.parse(value)
        payload[field.name] = value
      })
      await onSave(payload)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="admin-modal-layer" role="presentation">
      <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="admin-modal admin-glass" role="dialog" aria-modal="true">
        <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
        <div className="admin-modal-heading"><span>{isView ? 'Consulta' : mode === 'create' ? 'Alta' : 'Modificación'}</span><h2>{title}</h2><p>{record?.[def.pk] || 'Nuevo registro'}</p></div>
        {isView ? (
          <div className="admin-detail-grid">{def.fields.map((field) => <article className={`admin-detail-card ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}</div>
        ) : (
          <form onSubmit={submit}>
            <div className="admin-form-grid">
              {editableFields.map((field) => (
                <label className={`admin-field ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}>
                  <span>{field.label}</span>
                  {field.type === 'boolean' ? <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))} /> : field.type === 'select' ? <select value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}><option value="">Sin definir</option>{(field.options || []).filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select> : ['textarea', 'json'].includes(field.type) ? <textarea className={field.type === 'json' ? 'is-code' : ''} value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} /> : <input type={field.type === 'datetime' ? 'datetime-local' : field.type} value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} />}
                </label>
              ))}
              {mode === 'edit' && def.fields.filter((field) => field.readOnly).map((field) => <article className="admin-detail-card" key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}
            </div>
            {error && <div className="admin-form-error">{error}</div>}
            <div className="admin-modal-actions"><button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button><button type="submit" className="admin-button admin-button--primary"><Save size={16} />{mode === 'create' ? 'Crear registro' : 'Guardar cambios'}</button></div>
          </form>
        )}
      </section>
    </div>
  )
}
