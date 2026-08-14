import { useMemo, useState, useCallback, useEffect } from 'react'
import { LoaderCircle, Save, X } from 'lucide-react'
import { StatusPill } from './DataTable'
import { adminCommand } from '../adminApi'
import HeroBannerSection from './HeroBannerSection'
import AdminModalPortal from './AdminModalPortal'

function asBoolean(value) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1'
}

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
  if (field.type === 'boolean') return <StatusPill value={asBoolean(value) ? 'Sí' : 'No'} />
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

function parseBanner(metadataRaw) {
  try {
    const meta = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw || '{}') : (metadataRaw || {})
    return (meta.hero_banner && typeof meta.hero_banner === 'object') ? meta.hero_banner : {}
  } catch {
    return {}
  }
}

function serializeMetadataWithBanner(metadataRaw, bannerPatch) {
  try {
    const meta = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw || '{}') : (metadataRaw || {})
    return JSON.stringify({ ...meta, hero_banner: bannerPatch }, null, 2)
  } catch {
    return JSON.stringify({ hero_banner: bannerPatch }, null, 2)
  }
}

export default function RecordModal({ def, mode, record, onClose, onSave, onUploadMedia }) {
  const [form, setForm] = useState(() => Object.fromEntries(def.fields.map((field) => [field.name, record?.[field.name] ?? ''])))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isView = mode === 'view'
  const isCampaign = def.key === 'campaigns'
  const title = mode === 'create' ? `Alta · ${def.label}` : mode === 'edit' ? `Modificar · ${def.label}` : `Consulta · ${def.label}`
  const editableFields = useMemo(() => def.fields.filter((field) => !field.readOnly), [def.fields])

  const [bannerData, setBannerData] = useState(() => parseBanner(record?.metadata_json))
  const [desktopMedia, setDesktopMedia] = useState(null)
  const [mobileMedia, setMobileMedia] = useState(null)

  const loadMedia = useCallback(async (field, mediaId) => {
    if (!mediaId) return
    try {
      const result = await adminCommand('queryTable', {
        tableKey: 'media',
        query: { filters: {}, search: mediaId, pageSize: 10 },
      })
      const match = (result.rows || []).find((row) => row.media_id === mediaId)
      if (field === 'desktop_media_id') setDesktopMedia(match || null)
      else setMobileMedia(match || null)
    } catch {
      // El editor sigue usable aunque falle una miniatura existente.
    }
  }, [])

  useEffect(() => {
    if (!isCampaign) return
    const banner = parseBanner(record?.metadata_json)
    if (banner.desktop_media_id) loadMedia('desktop_media_id', banner.desktop_media_id)
    if (banner.mobile_media_id) loadMedia('mobile_media_id', banner.mobile_media_id)
  }, [isCampaign, loadMedia, record?.metadata_json])

  const handleBannerChange = (newBanner) => {
    setBannerData(newBanner)
    setForm((current) => ({
      ...current,
      metadata_json: serializeMetadataWithBanner(current.metadata_json, newBanner),
    }))
  }

  const handleBannerMediaChange = (field, mediaRecord) => {
    if (field === 'desktop_media_id') setDesktopMedia(mediaRecord)
    else setMobileMedia(mediaRecord)

    setBannerData((currentBanner) => {
      const nextBanner = { ...currentBanner, [field]: mediaRecord?.media_id || '' }
      setForm((current) => ({
        ...current,
        metadata_json: serializeMetadataWithBanner(current.metadata_json, nextBanner),
      }))
      return nextBanner
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      const payload = {}
      editableFields.forEach((field) => {
        let value = form[field.name]
        if (field.type === 'boolean') value = asBoolean(value)
        if (field.type === 'number' && value !== '') value = Number(value)
        if (field.type === 'json' && value) JSON.parse(value)
        payload[field.name] = value
      })

      // El banner es parte de metadata_json. Lo serializamos otra vez al guardar para no
      // depender del timing de setState después de una subida o drag & drop.
      if (isCampaign) {
        payload.metadata_json = serializeMetadataWithBanner(form.metadata_json, bannerData)
      }

      await onSave(payload)
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.')
      setSaving(false)
    }
  }

  const handleUpload = async (payload) => {
    return onUploadMedia ? onUploadMedia(payload) : adminCommand('uploadMedia', payload)
  }

  return (
    <AdminModalPortal>
      <div className="admin-modal-layer" role="presentation">
        <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={saving ? undefined : onClose} />
        <section className={`admin-modal ${isCampaign ? 'admin-modal--xl' : ''} admin-glass`} role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={saving}><X size={19} /></button>
          <div className="admin-modal-heading"><span>{isView ? 'Consulta' : mode === 'create' ? 'Alta' : 'Modificación'}</span><h2>{title}</h2><p>{record?.[def.pk] || 'Nuevo registro'}</p></div>
          {isView ? (
            <div className="admin-detail-grid">{def.fields.map((field) => <article className={`admin-detail-card ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}</div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="admin-form-grid">
                {editableFields.map((field) => (
                  <label className={`admin-field ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}>
                    <span>{field.label}</span>
                    {field.type === 'boolean' ? <input type="checkbox" checked={asBoolean(form[field.name])} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))} /> : field.type === 'select' ? <select value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}><option value="">Sin definir</option>{(field.options || []).filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select> : ['textarea', 'json'].includes(field.type) ? <textarea className={field.type === 'json' ? 'is-code' : ''} value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} /> : <input type={field.type === 'datetime' ? 'datetime-local' : field.type === 'url' ? 'text' : field.type} inputMode={field.type === 'url' ? 'url' : undefined} value={formatInputValue(form[field.name], field.type)} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} />}
                  </label>
                ))}
                {mode === 'edit' && def.fields.filter((field) => field.readOnly).map((field) => <article className="admin-detail-card" key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}
              </div>

              {isCampaign && (
                <div className="admin-campaign-banner-editor">
                  <HeroBannerSection
                    campaign={{ ...record, ...Object.fromEntries(editableFields.map((field) => [field.name, form[field.name]])) }}
                    bannerData={bannerData}
                    desktopMedia={desktopMedia}
                    mobileMedia={mobileMedia}
                    onChange={handleBannerChange}
                    onMediaChange={handleBannerMediaChange}
                    onUpload={handleUpload}
                  />
                </div>
              )}

              {error && <div className="admin-form-error admin-save-error">{error}</div>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-button admin-button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
                <button type="submit" className="admin-button admin-button--primary" disabled={saving}>
                  {saving ? <LoaderCircle className="is-spinning" size={16} /> : <Save size={16} />}
                  {saving ? 'Guardando…' : mode === 'create' ? 'Crear registro' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminModalPortal>
  )
}
