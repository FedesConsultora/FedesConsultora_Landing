import { useMemo, useState, useCallback, useEffect } from 'react'
import { Info, LoaderCircle, Save, X } from 'lucide-react'
import { StatusPill } from './DataTable'
import { adminCommand } from '../adminApi'
import HeroBannerSection from './HeroBannerSection'
import AdminModalPortal from './AdminModalPortal'
import '../AdminPolish.scss'

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

function parseMetadata(metadataRaw) {
  try {
    const meta = typeof metadataRaw === 'string' ? JSON.parse(metadataRaw || '{}') : (metadataRaw || {})
    return meta && typeof meta === 'object' && !Array.isArray(meta) ? meta : {}
  } catch {
    return {}
  }
}

function parseBanner(metadataRaw) {
  const meta = parseMetadata(metadataRaw)
  return (meta.hero_banner && typeof meta.hero_banner === 'object' && !Array.isArray(meta.hero_banner)) ? meta.hero_banner : {}
}

function serializeMetadataWithBanner(metadataRaw, bannerPatch) {
  const meta = parseMetadata(metadataRaw)
  return JSON.stringify({ ...meta, hero_banner: bannerPatch }, null, 2)
}

function comparableCampaignMetadata(metadataRaw) {
  const meta = parseMetadata(metadataRaw)
  const banner = meta.hero_banner && typeof meta.hero_banner === 'object' && !Array.isArray(meta.hero_banner)
    ? { ...meta.hero_banner }
    : {}
  // enabled es un control runtime inmediato, no un cambio pendiente del formulario.
  delete banner.enabled
  return JSON.stringify({ ...meta, hero_banner: banner })
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
  const createMode = mode === 'create'
  const title = createMode ? `Nueva · ${def.label}` : mode === 'edit' ? `Configurar · ${def.label}` : `Consulta · ${def.label}`
  const editableFields = useMemo(() => def.fields.filter((field) => !field.readOnly), [def.fields])

  const campaignVisibleFields = useMemo(() => {
    if (!isCampaign) return editableFields
    const hidden = new Set(['landing_path', 'benefit_label', 'status', 'metadata_json'])
    if (!createMode) hidden.add('campaign_key')
    return editableFields.filter((field) => !hidden.has(field.name))
  }, [editableFields, isCampaign, createMode])

  const campaignIdentityFields = useMemo(
    () => campaignVisibleFields.filter((field) => ['campaign_key', 'name', 'meeting_url'].includes(field.name)),
    [campaignVisibleFields],
  )
  const campaignScheduleFields = useMemo(
    () => campaignVisibleFields.filter((field) => ['starts_at', 'ends_at', 'sort_order', 'featured'].includes(field.name)),
    [campaignVisibleFields],
  )
  const campaignOtherFields = useMemo(
    () => campaignVisibleFields.filter((field) => !['campaign_key', 'name', 'meeting_url', 'starts_at', 'ends_at', 'sort_order', 'featured'].includes(field.name)),
    [campaignVisibleFields],
  )

  const [bannerData, setBannerData] = useState(() => parseBanner(record?.metadata_json))
  const [desktopMedia, setDesktopMedia] = useState(null)
  const [mobileMedia, setMobileMedia] = useState(null)

  const genericDirty = useMemo(() => editableFields.some((field) => {
    const current = form[field.name]
    const original = record?.[field.name] ?? ''
    if (field.type === 'boolean') return asBoolean(current) !== asBoolean(original)
    return String(current ?? '') !== String(original ?? '')
  }), [editableFields, form, record])

  const campaignConfigDirty = useMemo(() => {
    if (!isCampaign) return genericDirty
    const visibleChanged = campaignVisibleFields.some((field) => {
      const current = form[field.name]
      const original = record?.[field.name] ?? ''
      if (field.type === 'boolean') return asBoolean(current) !== asBoolean(original)
      return String(current ?? '') !== String(original ?? '')
    })
    const currentMetadata = serializeMetadataWithBanner(form.metadata_json, bannerData)
    return visibleChanged || comparableCampaignMetadata(currentMetadata) !== comparableCampaignMetadata(record?.metadata_json)
  }, [bannerData, campaignVisibleFields, form, genericDirty, isCampaign, record])

  const isDirty = isCampaign ? campaignConfigDirty : genericDirty

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

  const validateCampaign = () => {
    if (!createMode) return
    const key = String(form.campaign_key || '').trim()
    if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(key)) throw new Error('La clave de campaña debe usar minúsculas, números y guiones; por ejemplo galicia-2026.')
    if (!String(form.name || '').trim()) throw new Error('Ingresá un nombre para la campaña.')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      const payload = {}

      if (isCampaign) {
        validateCampaign()
        campaignVisibleFields.forEach((field) => {
          let value = form[field.name]
          if (field.type === 'boolean') value = asBoolean(value)
          if (field.type === 'number' && value !== '') value = Number(value)
          payload[field.name] = value
        })
        payload.status = createMode ? 'draft' : (record?.status || 'draft')
        payload.metadata_json = serializeMetadataWithBanner(record?.metadata_json || form.metadata_json, bannerData)
      } else {
        editableFields.forEach((field) => {
          let value = form[field.name]
          if (field.type === 'boolean') value = asBoolean(value)
          if (field.type === 'number' && value !== '') value = Number(value)
          if (field.type === 'json' && value) JSON.parse(value)
          payload[field.name] = value
        })
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

  const renderFields = (fields) => fields.map((field) => (
    <label className={`admin-field ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}>
      <span>{field.label}</span>
      <FieldControl field={field} value={form[field.name]} onChange={(value) => setField(field.name, value)} />
    </label>
  ))

  const readonlyFields = useMemo(() => {
    if (isCampaign) return []
    const noisy = new Set(['resume_token_hash', 'metadata_json', 'data_json'])
    return def.fields.filter((field) => field.readOnly && !noisy.has(field.name))
  }, [def.fields, isCampaign])

  return (
    <AdminModalPortal>
      <div className="admin-modal-layer" role="presentation">
        <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={saving ? undefined : onClose} />
        <section className={`admin-modal ${isCampaign ? 'admin-modal--xl admin-campaign-config-modal' : ''} admin-glass`} role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={saving}><X size={19} /></button>
          <div className="admin-modal-heading">
            <span>{isCampaign && mode === 'edit' ? 'Configuración' : isView ? 'Consulta' : createMode ? 'Alta' : 'Modificación'}</span>
            <h2>{title}</h2>
            <p>{isCampaign ? `${record?.campaign_key || 'Nueva campaña'} · la operación pública y las landings se controlan desde el Centro de control` : record?.[def.pk] || 'Nuevo registro'}</p>
          </div>

          {isView ? (
            <div className="admin-detail-grid">{def.fields.map((field) => <article className={`admin-detail-card ${['textarea', 'json'].includes(field.type) ? 'is-wide' : ''}`} key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}</div>
          ) : (
            <form onSubmit={submit} noValidate>
              {isCampaign ? (
                <>
                  <div className="admin-campaign-editor-head">
                    <div><h3>{record?.name || 'Configuración de campaña'}</h3><p>Acá definís identidad, vigencia y contenido del Hero. Los estados públicos se controlan aparte.</p></div>
                    <StatusPill value={createMode ? 'draft' : record?.status} />
                  </div>

                  <div className="admin-form-note admin-campaign-config-note"><Info size={15} /><span><strong>Modelo separado:</strong> una campaña puede tener varias landings. El beneficio, copy y UTMs de cada página se editan desde Landings; acá no se duplican.</span></div>

                  <section className="admin-form-section">
                    <div className="admin-form-section__heading"><span>Campaña</span><h3>Identidad y operación</h3><p>Clave estable, nombre interno y destino comercial compartido.</p></div>
                    <div className="admin-form-grid">
                      {!createMode && record?.campaign_key && <article className="admin-detail-card"><label>Clave estable</label><DetailValue field={{ type: 'text' }} value={record.campaign_key} /></article>}
                      {renderFields(campaignIdentityFields)}
                    </div>
                  </section>

                  <section className="admin-form-section">
                    <div className="admin-form-section__heading"><span>Vigencia</span><h3>Fechas y orden</h3><p>Publicar/ocultar se hace desde el Centro de control. Estas fechas determinan cuándo puede estar activa.</p></div>
                    <div className="admin-form-grid">{renderFields(campaignScheduleFields)}{renderFields(campaignOtherFields)}</div>
                  </section>

                  <section className="admin-form-section admin-form-section--hero">
                    <div className="admin-form-section__heading"><span>Home</span><h3>Hero de campaña</h3><p>El switch es inmediato en campañas existentes. Imágenes, destino y tiempos se aplican al guardar.</p></div>
                    <HeroBannerSection
                      campaign={{ ...record, ...Object.fromEntries(campaignVisibleFields.map((field) => [field.name, form[field.name]])) }}
                      bannerData={bannerData}
                      desktopMedia={desktopMedia}
                      mobileMedia={mobileMedia}
                      onChange={handleBannerChange}
                      onMediaChange={handleBannerMediaChange}
                      onUpload={handleUpload}
                      immediateToggle={!createMode}
                    />
                  </section>
                </>
              ) : (
                <div className="admin-form-grid">
                  {renderFields(editableFields)}
                  {mode === 'edit' && readonlyFields.map((field) => <article className="admin-detail-card" key={field.name}><label>{field.label}</label><DetailValue field={field} value={record?.[field.name]} /></article>)}
                </div>
              )}

              {isCampaign && isDirty && <div className="admin-unsaved-banner"><span>Hay cambios de configuración todavía sin guardar.</span><strong>Guardar cambios</strong></div>}
              {error && <div className="admin-form-error admin-save-error">{error}</div>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-button admin-button--ghost" onClick={onClose} disabled={saving}>{isCampaign && !isDirty ? 'Cerrar' : 'Cancelar'}</button>
                <button type="submit" className="admin-button admin-button--primary" disabled={saving || (mode === 'edit' && !isDirty)}>
                  {saving ? <LoaderCircle className="is-spinning" size={16} /> : <Save size={16} />}
                  {saving ? 'Guardando…' : createMode ? 'Crear campaña' : isDirty ? 'Guardar cambios' : 'Sin cambios pendientes'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminModalPortal>
  )
}
