import { useMemo, useState } from 'react'
import { ExternalLink, Save, X } from 'lucide-react'
import { adminCommand } from '../adminApi'
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
  ['utm_content', 'UTM content', 'text'],
  ['method_note', 'Nota metodológica', 'textarea'],
  ['result_note', 'Nota del resultado', 'textarea'],
]

function buildTrackingUrl(form) {
  const params = new URLSearchParams()
  if (form.source_default) params.set('source', form.source_default)
  if (form.utm_source_default) params.set('utm_source', form.utm_source_default)
  if (form.utm_medium_default) params.set('utm_medium', form.utm_medium_default)
  if (form.utm_campaign_default) params.set('utm_campaign', form.utm_campaign_default)
  if (form.utm_content) params.set('utm_content', form.utm_content)
  const query = params.toString()
  return `${form.path || '/'}${query ? `?${query}` : ''}`
}

function initialForm(landing) {
  const base = Object.fromEntries(FIELDS.map(([name]) => [name, landing?.[name] ?? '']))
  return {
    landing_key: landing?.landing_key || '',
    ...base,
    utm_content: landing?.meta?.utmContent || '',
    method_note: landing?.meta?.methodNote || '',
    result_note: landing?.meta?.resultNote || '',
  }
}

function buildPayload(form, landing) {
  const metadata = { ...(landing?.meta || {}) }
  if (form.utm_content) metadata.utmContent = form.utm_content
  else delete metadata.utmContent
  if (form.method_note) metadata.methodNote = form.method_note
  else delete metadata.methodNote
  if (form.result_note) metadata.resultNote = form.result_note
  else delete metadata.resultNote

  const payload = {
    ...form,
    benefit_percent: Number(form.benefit_percent) || 0,
    metadata_json: JSON.stringify(metadata),
  }
  delete payload.utm_content
  delete payload.method_note
  delete payload.result_note
  return payload
}

export default function CampaignLandingEditModal({ landing, busy, onClose, onSave }) {
  const createMode = !landing?.landing_id
  const [form, setForm] = useState(() => initialForm(landing))
  const [error, setError] = useState('')
  const [createBusy, setCreateBusy] = useState(false)

  const trackingUrl = useMemo(() => buildTrackingUrl(form), [form])
  const isBusy = busy || createBusy
  const change = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (createMode && !String(form.landing_key || '').trim()) return setError('Ingresá una clave estable para la landing, por ejemplo galicia-cordoba.')
    if (!String(form.name || '').trim()) return setError('Ingresá un nombre interno.')
    if (!String(form.path || '').trim().startsWith('/')) return setError('La ruta pública debe empezar con /.')
    if (!String(form.benefit_label || '').trim()) return setError('Ingresá el texto del beneficio.')

    const payload = buildPayload(form, landing)

    try {
      if (createMode) {
        setCreateBusy(true)
        await adminCommand('createCampaignLanding', {
          campaignKey: landing?.campaign_key,
          record: payload,
        })
        await onClose()
        return
      }
      await onSave(payload)
    } catch (saveError) {
      setError(saveError.message || 'No pudimos guardar la landing.')
    } finally {
      setCreateBusy(false)
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
            <h2>{createMode ? 'Nueva landing' : landing?.name || landing?.landing_key || 'Editar landing'}</h2>
            <p>{landing?.campaign_key}{!createMode && landing?.landing_key ? ` · ${landing.landing_key}` : ' · se crea inicialmente como borrador'}</p>
          </div>

          <div className="admin-landing-editor__grid">
            {createMode && (
              <label className="admin-field">
                <span>Clave estable de landing</span>
                <input
                  type="text"
                  value={form.landing_key}
                  onChange={(event) => change('landing_key', event.target.value)}
                  placeholder="galicia-cordoba"
                />
              </label>
            )}
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
            {!createMode && landing?.status === 'published' && (
              <a href={trackingUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} />Vista pública</a>
            )}
          </section>

          {createMode && (
            <div className="admin-form-note">
              La landing se guarda como <strong>draft</strong>. Después podés revisarla y publicarla desde la Vista 360° de la campaña.
            </div>
          )}
          {error && <div className="admin-form-error">{error}</div>}

          <div className="admin-modal-actions">
            <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-button admin-button--primary" disabled={isBusy}>
              <Save size={15} />{isBusy ? 'Guardando…' : createMode ? 'Crear landing' : 'Guardar landing'}
            </button>
          </div>
        </form>
      </div>
    </AdminModalPortal>
  )
}
