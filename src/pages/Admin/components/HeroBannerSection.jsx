import { useMemo, useRef, useState } from 'react'
import { ExternalLink, Eye, FolderOpen, ImagePlus, LoaderCircle, Monitor, Smartphone, ToggleLeft, ToggleRight, UploadCloud } from 'lucide-react'
import MediaSelectorModal from './MediaSelectorModal'
import ResilientMediaImage from './ResilientMediaImage'
import { getMediaFileId, getMediaImageUrl, withLocalMediaPreview } from '../mediaUtils'

function safeBool(value) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1'
}

function calcBannerStatus(campaign, banner) {
  if (!banner || !safeBool(banner.enabled)) return 'disabled'
  if (!campaign) return 'draft'
  if (campaign.status !== 'published') return 'draft'
  if (!banner.desktop_media_id || !banner.mobile_media_id) return 'missing_config'

  const now = Date.now()
  const startsAt = Date.parse(campaign.starts_at || '')
  const endsAt = Date.parse(campaign.ends_at || '')

  if (!Number.isFinite(startsAt)) return 'missing_config'
  if (startsAt > now) return 'scheduled'
  if (Number.isFinite(endsAt) && endsAt < now) return 'ended'
  return 'active'
}

const STATUS_META = {
  active: { icon: '●', label: 'Activo ahora', color: '#17835f' },
  scheduled: { icon: '○', label: 'Programado', color: '#1b5ebf' },
  disabled: { icon: '○', label: 'Desactivado', color: '#7b8797' },
  draft: { icon: '○', label: 'Borrador', color: '#9b6a18' },
  ended: { icon: '○', label: 'Finalizado', color: '#7357a8' },
  missing_config: { icon: '⚠', label: 'Falta configuración', color: '#b34b54' },
}

function BannerStatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.disabled
  return <span className="hero-banner-status-chip" style={{ color: meta.color, borderColor: meta.color }}>{meta.icon} {meta.label}</span>
}

function validateImage(file) {
  if (!file) throw new Error('Seleccioná una imagen.')
  if (!file.type?.startsWith('image/')) throw new Error('El archivo debe ser una imagen.')
  if (file.size > 8 * 1024 * 1024) throw new Error('La imagen supera el máximo de 8 MB.')
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file)
  })
}

function MediaThumbPicker({ label, hint, mediaRecord, busy, error, onPickMedia, onClearMedia, onUploadFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [previewUnavailable, setPreviewUnavailable] = useState(false)

  const acceptFile = async (file) => {
    setDragging(false)
    setPreviewUnavailable(false)
    if (!file) return
    await onUploadFile(file)
  }

  const onDrop = (event) => {
    event.preventDefault()
    if (busy) return
    acceptFile(event.dataTransfer.files?.[0]).catch(() => {})
  }

  return (
    <div className="hero-banner-media-picker">
      <div className="hero-banner-media-label"><strong>{label}</strong><span>{hint}</span></div>
      <div
        className={`hero-banner-media-slot ${dragging ? 'is-dragging' : ''} ${busy ? 'is-uploading' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); if (!busy) setDragging(true) }}
        onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true) }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          className="hero-banner-file-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => acceptFile(event.target.files?.[0]).finally(() => { event.target.value = '' }).catch(() => {})}
        />

        {mediaRecord && !previewUnavailable ? (
          <>
            <ResilientMediaImage media={mediaRecord} alt={mediaRecord?.alt_text || label} className="hero-banner-thumb" onUnavailable={() => setPreviewUnavailable(true)} />
            <div className="hero-banner-media-info"><strong>{mediaRecord?.file_name || 'Imagen cargada'}</strong><span>Arrastrá otra imagen acá para reemplazarla.</span></div>
            <div className="hero-banner-media-actions">
              <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={() => inputRef.current?.click()} disabled={busy}><UploadCloud size={13} />Subir otra</button>
              <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={onPickMedia} disabled={busy}><FolderOpen size={13} />Biblioteca</button>
              <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={onClearMedia} disabled={busy}>Quitar</button>
            </div>
          </>
        ) : mediaRecord && previewUnavailable ? (
          <div className="hero-banner-drop-content">
            <ImagePlus size={30} />
            <strong>La imagen está guardada, pero Drive no permite mostrarla</strong>
            <span>{mediaRecord.file_name || 'Archivo de Media'} · podés reemplazarla o revisar permisos.</span>
            <button type="button" className="admin-button admin-button--primary admin-button--sm" onClick={() => inputRef.current?.click()} disabled={busy}><UploadCloud size={13} />Reemplazar</button>
            <button type="button" className="hero-banner-library-link" onClick={onPickMedia} disabled={busy}><FolderOpen size={13} />Seleccionar desde Media</button>
          </div>
        ) : (
          <div className="hero-banner-drop-content">
            {busy ? <LoaderCircle className="is-spinning" size={30} /> : <ImagePlus size={30} />}
            <strong>{busy ? 'Subiendo imagen…' : 'Arrastrá la imagen acá'}</strong>
            <span>o elegila desde tu computadora</span>
            <button type="button" className="admin-button admin-button--primary admin-button--sm" onClick={() => inputRef.current?.click()} disabled={busy}><UploadCloud size={13} />Elegir archivo</button>
            <button type="button" className="hero-banner-library-link" onClick={onPickMedia} disabled={busy}><FolderOpen size={13} />Seleccionar desde Media</button>
          </div>
        )}

        {busy && mediaRecord && <div className="hero-banner-upload-overlay"><LoaderCircle className="is-spinning" size={22} /><span>Subiendo…</span></div>}
      </div>
      {error && <div className="hero-banner-upload-error">{error}</div>}
    </div>
  )
}

function BannerPreview({ desktopRecord, mobileRecord, mode }) {
  const record = mode === 'mobile' ? mobileRecord : desktopRecord
  const [failed, setFailed] = useState(false)
  if (!record || failed) return <div className="hero-banner-preview-empty">Sin vista previa {mode === 'mobile' ? 'mobile' : 'desktop'} disponible</div>
  return <div className={`hero-banner-preview-frame is-${mode}`}><ResilientMediaImage media={record} alt={`Preview ${mode}`} onUnavailable={() => setFailed(true)} /></div>
}

export default function HeroBannerSection({ campaign, bannerData = {}, desktopMedia, mobileMedia, onChange, onMediaChange, onUpload }) {
  const [previewMode, setPreviewMode] = useState('desktop')
  const [mediaPicker, setMediaPicker] = useState(null)
  const [uploadState, setUploadState] = useState({ desktop: false, mobile: false })
  const [uploadErrors, setUploadErrors] = useState({ desktop: '', mobile: '' })

  const banner = bannerData || {}
  const enabled = safeBool(banner.enabled)
  const bannerStatus = useMemo(() => calcBannerStatus(campaign, banner), [campaign, banner])

  const defaultClickUrl = useMemo(() => {
    const path = campaign?.landing_path || ''
    if (!path || path === '/') return ''
    if (campaign?.campaign_key === 'galicia-2026') return '/bonificacion-galicia?source=home_banner&utm_source=fedesconsultora&utm_medium=website&utm_campaign=beneficio_galicia_2026'
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}source=home_banner&utm_source=fedesconsultora&utm_medium=website&utm_campaign=${encodeURIComponent(campaign?.campaign_key || '')}`
  }, [campaign])

  const handleChange = (field, value) => onChange({ ...banner, [field]: value })

  const handleMediaSelect = (field, record) => {
    setMediaPicker(null)
    onMediaChange(field, record)
  }

  const handleDirectUpload = async (kind, file) => {
    setUploadErrors((current) => ({ ...current, [kind]: '' }))
    try {
      validateImage(file)
      setUploadState((current) => ({ ...current, [kind]: true }))
      const base64 = await fileAsDataUrl(file)
      const result = await onUpload({
        base64,
        fileName: file.name,
        mimeType: file.type,
        altText: banner.alt || `${campaign?.name || 'Campaña'} · banner ${kind}`,
        entityType: `hero_banner_${kind}`,
        entityId: campaign?.campaign_id || campaign?.campaign_key || '',
      })
      if (!result?.media?.media_id) throw new Error('La subida terminó pero no se recibió el registro de Media.')
      const media = withLocalMediaPreview(result.media, base64)
      onMediaChange(kind === 'desktop' ? 'desktop_media_id' : 'mobile_media_id', media)
    } catch (error) {
      setUploadErrors((current) => ({ ...current, [kind]: error.message || 'No se pudo subir la imagen.' }))
      throw error
    } finally {
      setUploadState((current) => ({ ...current, [kind]: false }))
    }
  }

  const handleUploadAndSelect = async (payload) => {
    const result = await onUpload(payload)
    if (mediaPicker && result?.media) {
      const media = withLocalMediaPreview(result.media, payload.base64)
      onMediaChange(mediaPicker === 'desktop' ? 'desktop_media_id' : 'mobile_media_id', media)
      setMediaPicker(null)
    }
    return result
  }

  const previewInHome = () => {
    if (!desktopMedia || !mobileMedia) {
      setUploadErrors((current) => ({ ...current, desktop: !desktopMedia ? 'Cargá la imagen Desktop para previsualizar.' : current.desktop, mobile: !mobileMedia ? 'Cargá la imagen Mobile para previsualizar.' : current.mobile }))
      return
    }

    const previewCampaign = {
      ...campaign,
      status: 'published',
      starts_at: new Date(Date.now() - 60000).toISOString(),
      ends_at: new Date(Date.now() + 3600000).toISOString(),
      hero_banner: {
        ...banner,
        enabled: true,
        desktop_url: getMediaImageUrl(desktopMedia),
        mobile_url: getMediaImageUrl(mobileMedia),
        desktop_file_id: getMediaFileId(desktopMedia),
        mobile_file_id: getMediaFileId(mobileMedia),
        click_url: banner.click_url || defaultClickUrl,
      },
      __preview: true,
    }

    try {
      sessionStorage.setItem('fedes_hero_banner_preview', JSON.stringify(previewCampaign))
      window.open('/?previewHero=1', '_blank')
    } catch {
      window.alert('No se pudo preparar la vista previa en esta sesión.')
    }
  }

  return (
    <div className="hero-banner-section">
      <div className="hero-banner-section-header">
        <div className="hero-banner-section-title"><h3>Banner del Hero</h3><p>Se guarda con la campaña y sólo aparece en producción cuando está activo, publicado y dentro de sus fechas.</p></div>
        <div className="hero-banner-header-actions">
          <BannerStatusChip status={bannerStatus} />
          <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={previewInHome}><Eye size={14} />Probar en Home</button>
          <button type="button" className={`hero-banner-toggle ${enabled ? 'is-on' : ''}`} onClick={() => handleChange('enabled', !enabled)} aria-pressed={enabled} aria-label={enabled ? 'Desactivar banner' : 'Activar banner'}>
            {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}<span>{enabled ? 'Mostrar en el Hero' : 'Ocultar del Hero'}</span>
          </button>
        </div>
      </div>

      {bannerStatus === 'draft' && <div className="hero-banner-runtime-note"><strong>Está en borrador.</strong> No aparecerá en la Home pública hasta cambiar la campaña a <code>published</code>. Usá “Probar en Home” para verla sin publicarla.</div>}
      {bannerStatus === 'missing_config' && <div className="hero-banner-runtime-note is-warning"><strong>Falta configuración.</strong> Para mostrarse necesita ambas imágenes y una fecha de inicio.</div>}

      <div className="hero-banner-media-row">
        <MediaThumbPicker
          label="Desktop"
          hint="1367 × 683 recomendado · PNG/JPG/WEBP · hasta 8 MB"
          mediaRecord={desktopMedia}
          busy={uploadState.desktop}
          error={uploadErrors.desktop}
          onUploadFile={(file) => handleDirectUpload('desktop', file)}
          onPickMedia={() => setMediaPicker('desktop')}
          onClearMedia={() => onMediaChange('desktop_media_id', null)}
        />
        <MediaThumbPicker
          label="Mobile"
          hint="651 × 1277 recomendado · PNG/JPG/WEBP · hasta 8 MB"
          mediaRecord={mobileMedia}
          busy={uploadState.mobile}
          error={uploadErrors.mobile}
          onUploadFile={(file) => handleDirectUpload('mobile', file)}
          onPickMedia={() => setMediaPicker('mobile')}
          onClearMedia={() => onMediaChange('mobile_media_id', null)}
        />
      </div>

      <div className="admin-form-grid hero-banner-settings-grid">
        <label className="admin-field is-wide"><span>Texto alternativo</span><input type="text" value={banner.alt || ''} onChange={(event) => handleChange('alt', event.target.value)} placeholder="Beneficio exclusivo Galicia para participantes de la charla" /></label>
        <label className="admin-field"><span>Tiempo visible (segundos)</span><input type="number" min={2} max={30} value={banner.display_seconds ?? 6} onChange={(event) => handleChange('display_seconds', Number(event.target.value))} /></label>
        <label className="admin-check-field"><input type="checkbox" checked={banner.show_once_per_session !== false} onChange={(event) => handleChange('show_once_per_session', event.target.checked)} /><span>Mostrar sólo una vez por sesión</span></label>
        <label className="admin-field is-wide"><span>URL de destino (opcional)</span><div className="hero-banner-url-row"><input type="text" inputMode="url" value={banner.click_url || ''} onChange={(event) => handleChange('click_url', event.target.value)} placeholder={defaultClickUrl || '/bonificacion-galicia?source=home_banner…'} />{(banner.click_url || defaultClickUrl) && <a href={banner.click_url || defaultClickUrl} target="_blank" rel="noopener noreferrer" className="admin-button admin-button--ghost" title="Abrir URL"><ExternalLink size={14} /></a>}</div>{!banner.click_url && defaultClickUrl && <small className="admin-field-hint">Se usará: {defaultClickUrl}</small>}</label>
        <label className="admin-check-field"><input type="checkbox" checked={safeBool(banner.open_in_new_tab)} onChange={(event) => handleChange('open_in_new_tab', event.target.checked)} /><span>Abrir en nueva pestaña</span></label>
      </div>

      {(desktopMedia || mobileMedia) && <div className="hero-banner-preview-section"><div className="hero-banner-preview-tabs"><span className="hero-banner-preview-label">Vista previa</span><button type="button" className={`admin-tab-btn ${previewMode === 'desktop' ? 'is-active' : ''}`} onClick={() => setPreviewMode('desktop')}><Monitor size={13} />Desktop</button><button type="button" className={`admin-tab-btn ${previewMode === 'mobile' ? 'is-active' : ''}`} onClick={() => setPreviewMode('mobile')}><Smartphone size={13} />Mobile</button></div><BannerPreview desktopRecord={desktopMedia} mobileRecord={mobileMedia} mode={previewMode} /></div>}

      {mediaPicker && <MediaSelectorModal onClose={() => setMediaPicker(null)} onSelect={(record) => handleMediaSelect(mediaPicker === 'desktop' ? 'desktop_media_id' : 'mobile_media_id', record)} onUpload={handleUploadAndSelect} entityType={`hero_banner_${mediaPicker}`} entityId={campaign?.campaign_id || campaign?.campaign_key || ''} />}
    </div>
  )
}
