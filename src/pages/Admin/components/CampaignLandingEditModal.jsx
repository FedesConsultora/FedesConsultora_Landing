import { useMemo, useState } from 'react'
import { ExternalLink, Save, X } from 'lucide-react'
import AdminModalPortal from './AdminModalPortal'

const FIELDS = [
  ['name', 'Nombre interno', 'text'],
  ['path', 'Ruta pública', 'text'],
  ['benefit_label', 'Texto del beneficio', 'text'],
  ['benefit_percent', 'Porcentaje', 'number'],
  ['badge', 'Badge', 'text'],
  ['kicker', 'Kicker', 'text'],
  ['headline', 'Título principal', 'text'],
  ['headline_accent', 'Título destacado', 'text'],
  ['description', 'Descripción', 'textarea'],
  ['seo_title', 'SEO title', 'text'],
  ['seo_description', 'SEO description', 'textarea'],
  ['source_default', 'Source por defecto', 'text'],
  ['utm_source_default', 'UTM source', 'text'],
  ['utm_medium_default', 'UTM medium', 'text'],
  ['utm_campaign_default', 'UTM campaign', 'text'],
]

function buildTrackingUrl(form, landing) {
  const params = new URLSearchParams()
  if (form.source_default) params.set('source', form.source_default)
  if (form.utm_source_default) params.set('utm_source', form.utm_source_default)
  if (form.utm_medium_default) params.set('utm_medium', form.utm_medium_default)
  if (form.utm_campaign_default) params.set('utm_campaign', form.utm_campaign_default)
  if (landing?.meta?.utmContent) params.set('utm_content', landing.meta.utmContent)
  const query = params.toString()
  return `${form.path || '/'}${query ? `?${query}` : ''}`
}

export default function CampaignLandingEditModal({ landing, busy, onClose, onSave }) {
  const [form, setForm] = useState(() => Object.fromEntries(
    FIELDS.map(([name]) => [name, landing?.[name] ?? '']),
  ))
  const [error, setError] = useState('')

  const trackingUrl = useMemo(() => buildTrackingUrl(form, landing), [form, landing])

  const change = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!String(form.name || '').trim()) return setError('Ingresá un nombre interno.')
    if (!String(form.path || '').trim().startsWith('/')) return setError('La ruta pública debe empezar con /.')
    if (!String(form.benefit_label || '').trim()) return setError('Ingresá el texto del beneficio.')

    try {
      await onSave({
        ...form,
        benefit_percent: Number(form.benefit_percent) || 0,
      })
    } catch (saveError) {
      setError(saveError.message || 'No pudimos guardar la landing.')
    }
  }

  return (
    <AdminModalPortal>
      <div className="admin-modal-layer">
        <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
        <form className="admin-modal admin-modal--xl admin-glass admin-landing-editor" onSubmit={submit}>
          <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
          <div className="admin-modal-heading">
            <span>Landing de campaña</span>
            <h2>{landing?.name || landing?.landing_key || 'Editar landing'}</h2>
            <p>{landing?.campaign_key} · {landing?.landing_key}</p>
          </div>

          <div className="admin-landing-editor__grid">
            {FIELDS.map(([name, label, type]) => (
              <label className={`admin-field ${type === 'textarea' ? 'admin-field--wide' : ''}`} key={name}>
                <span>{label}</span>
                {type === 'textarea' ? (
                  <textarea rows={4} value={form[name]} onChange={(event) => change(name, event.target.value)} />
                ) : (
                  <input type={type} value={form[name]} onChange={(event) => change(name, event.target.value)} />
                )}
              </label>
            ))}
          </div>

          <section className="admin-landing-editor__preview admin-glass-soft">
            <div>
              <span>URL de tracking resultante</span>
              <code>{trackingUrl}</code>
            </div>
            <a href={trackingUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} />Vista pública</a>
          </section>

          {error && <div className="admin-form-error">{error}</div>}

          <div className="admin-modal-actions">
            <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-button admin-button--primary" disabled={busy}>
              <Save size={15} />{busy ? 'Guardando…' : 'Guardar landing'}
            </button>
          </div>
        </form>
      </div>
    </AdminModalPortal>
  )
}
