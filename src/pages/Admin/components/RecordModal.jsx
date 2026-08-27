import { useMemo, useState, useCallback, useEffect } from 'react'
import { Info, LoaderCircle, Save, X } from 'lucide-react'
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

function FieldControl({ field, value, onChange }) {
  if (field.type === 'boolean') {
    return <input type="checkbox" checked={asBoolean(value)} onChange={(event) => onChange(event.target.checked)} />
  }
  if (field.type === 'select') {
    return (
      <select value={formatInputValue(value, field.type)} onChange={(event) => onChange(event.target.value)}>
        <option value="">Sin definir</option>
        {(field.options || []).filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  }
  if (['textarea', 'json'].includes(field.type)) {
    return <textarea className={field.type === 'json' ? 'is-code' : ''} value={formatInputValue(value, field.type)} onChange={(event) => onChange(event.target.value)} />
  }
  return <input type={field.type === 'datetime' ? 'datetime-local' : field.type === 'url' ? 'text' : field.type} inputMode={field.type === 'url' ? 'url' : undefined} value={formatInputValue(value, field.type)} onChange={(event) => onChange(event.target.value)} />
}

export default function RecordModal({ def, mode, record, onClose, onSave, onUploadMedia }) {
  const [form, setForm] = useState(() => Object.fromEntries(def.fields.map((field) => [field.name, record?.[field.name] ?? ''])))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isView = mode === 'view'
  const isCampaign = def.key === 'campaigns'
  const title = mode === 'create' ? `Alta · ${def.label}` : mode === 'edit' ? `Configurar · ${def.label}` : `Consulta · ${def.label}`
  const editableFields = useMemo(() => def.fields.filter((field) => !field.readOnly), [def.fields])

  const campaignVisibleFields = useMemo(() => {
    if (!isCampaign) return editableFields
    const hidden = new Set(['campaign_key', 'landing_path', 'benefit_label', 'status', 'metadata_json'])
    return editableFields.filter((field) => !hidden.has(field.name))
  }, [editableFields, isCampaign])

  const campaignIdentityFields = useMemo(
    () => campaignVisibleFields.filter((field) => ['name', 'meeting_url'].includes(field.name)),
    [campaignVisibleFields],
  )
  const campaignScheduleFields = useMemo(
    () => campaignVisibleFields.filter((field) => ['starts_at', 'ends_at', 'sort_order', 'featured'].includes(field.name)),
    [campaignVisibleFields],
  )
  const campaignOtherFields = useMemo(
    () => campaignVisibleFields.filter((field) => !['name', 'meeting_url', 'starts_at', 'ends_at', 'sort_order', 'featured'].includes(field.name)),
    [campaignVisibleFields],
  )

  const [bannerData, setBannerData] = useState(() => parseBanner(record?.metadata_json))
  const [desktopMedia, setDesktopMedia] = useState(null)
  const [mobileMedia, setMobileMedia] = useState(null)

  const isDirty = useMemo(() => editableFields.some((field) => {
    const current = form[field.name]
    const original = record?.[field.name] ?? ''
    if (field.type === 'boolean') return asBoolean(current) !== asBoolean(original)
    return String(current ?? '') !== String(original ?? '')
  }), [editableFields, form, record])

  const loadMedia = useCallback(async (field, mediaId) => {
    if (!mediaId) return
    try {
      const result = await adminCommand('record', { tableKey: 'media', id: mediaId })
      const media = result?.record || null
      if (field === 'desktop_media_id') setDesktopMedia(media)
      else setMobileMedia(media)
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

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

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

      if (isCampaign) payload.metadata_json = serializeMetadataWithBanner(form.metadata_json, bannerData)
      await onSave(payload)
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.')
      setSaving(false)
    }
  }

  const handleUpload = async (payload) => {
    return onUploadMedia ? onUploadMedia(payload) : adminCommand('uploadMedia', payload)
  }

  const renderFields = (fields) => fields.map((field) => (
    <label className={`admin-field ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}>
      <span>{field.label}</span>
      <FieldControl field={field} value={form[field.name]} onChange={(value) => setField(field.name, value)} />
    </label>
  ))

  return (
    <AdminModalPortal>
      <div className="admin-modal-layer" role="presentation">
        <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={saving ? undefined : onClose} />
        <section className={`admin-modal ${isCampaign ? 'admin-modal--xl admin-campaign-config-modal' : ''} admin-glass`} role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={saving}><X size={19} /></button>
          <div className="admin-modal-heading">
            <span>{isCampaign && mode === 'edit' ? 'Configuración' : isView ? 'Consulta' : mode === 'create' ? 'Alta' : 'Modificación'}</span>
            <h2>{title}</h2>
            <p>{isCampaign ? `${record?.campaign_key || 'Nueva campaña'} · la operación pública y las landings se controlan desde la Vista 360°` : record?.[def.pk] || 'Nuevo registro'}</p>
          </div>

          {isView ? (
            <div className="admin-detail-grid">{def.fields.map((field) => <article className={`admin-detail-card ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}</div>
          ) : (
            <form onSubmit={submit} noValidate>
              {isCampaign ? (
                <>
                  <div className="admin-campaign-editor-head">
                    <div><h3>{record?.name || 'Configuración de campaña'}</h3><p>Acá definís identidad, vigencia y Hero. No se mezclan estados públicos ni contenido de las landings.</p></div>
                    {record?.status && <StatusPill value={record.status} />}
                  </div>

                  <div className="admin-form-note admin-campaign-config-note"><Info size={15} /><span><strong>Separación intencional:</strong> “Configurar” modifica datos de la campaña. La Vista 360° muestra resultados y controla campaña, Hero y landings en producción.</span></div>

                  <section className="admin-form-section">
                    <div className="admin-form-section__heading"><span>Campaña</span><h3>Identidad y operación</h3><p>Nombre interno y destino comercial compartido por las landings.</p></div>
                    <div className="admin-form-grid">
                      {record?.campaign_key && <article className="admin-detail-card"><label>Clave estable</label><DetailValue field={{ type: 'text' }} value={record.campaign_key} /></article>}
                      {renderFields(campaignIdentityFields)}
                    </div>
                  </section>

                  <section className="admin-form-section">
                    <div className="admin-form-section__heading"><span>Vigencia</span><h3>Fechas y orden</h3><p>La campaña sólo puede ser pública dentro de este período.</p></div>
                    <div className="admin-form-grid">{renderFields(campaignScheduleFields)}{renderFields(campaignOtherFields)}</div>
                  </section>

                  <section className="admin-form-section admin-form-section--hero">
                    <div className="admin-form-section__heading"><span>Home</span><h3>Hero de campaña</h3><p>Mostrar/ocultar es inmediato. Cambiar imágenes o parámetros requiere guardar.</p></div>
                    <HeroBannerSection
                      campaign={{ ...record, ...Object.fromEntries(editableFields.map((field) => [field.name, form[field.name]])) }}
                      bannerData={bannerData}
                      desktopMedia={desktopMedia}
                      mobileMedia={mobileMedia}
                      onChange={handleBannerChange}
                      onMediaChange={handleBannerMediaChange}
                      onUpload={handleUpload}
                      immediateToggle={mode === 'edit'}
                    />
                  </section>
                </>
              ) : (
                <div className="admin-form-grid">
                  {renderFields(editableFields)}
                  {mode === 'edit' && def.fields.filter((field) => field.readOnly).map((field) => <article className="admin-detail-card" key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}
                </div>
              )}

              {isCampaign && isDirty && <div className="admin-unsaved-banner"><span>Hay cambios de configuración todavía sin guardar.</span><strong>Guardar cambios</strong></div>}
              {error && <div className="admin-form-error admin-save-error">{error}</div>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-button admin-button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
                <button type="submit" className="admin-button admin-button--primary" disabled={saving || (mode === 'edit' && !isDirty)}>
                  {saving ? <LoaderCircle className="is-spinning" size={16} /> : <Save size={16} />}
                  {saving ? 'Guardando…' : mode === 'create' ? 'Crear registro' : isDirty ? 'Guardar cambios' : 'Sin cambios pendientes'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminModalPortal>
  )
}
