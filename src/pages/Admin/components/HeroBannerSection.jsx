import { useState, useMemo } from 'react'
import { Monitor, Smartphone, ImagePlus, RefreshCw, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react'
import MediaSelectorModal from './MediaSelectorModal'

// ─── helpers ────────────────────────────────────────────────────────────────

function safeBool(v) {
  return v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v) === '1'
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
  active:         { icon: '●', label: 'Activo ahora',       color: '#38d7a1' },
  scheduled:      { icon: '○', label: 'Programado',          color: '#48d6ff' },
  disabled:       { icon: '○', label: 'Desactivado',         color: '#8fa0b7' },
  draft:          { icon: '○', label: 'Borrador',            color: '#ffbf5d' },
  ended:          { icon: '○', label: 'Finalizado',          color: '#a78bfa' },
  missing_config: { icon: '⚠', label: 'Falta configuración', color: '#ff6f7d' },
}

function BannerStatusChip({ status }) {
  const meta = STATUS_META[status] || STATUS_META.disabled
  return (
    <span
      className="hero-banner-status-chip"
      style={{ color: meta.color, borderColor: meta.color }}
    >
      {meta.icon} {meta.label}
    </span>
  )
}

function MediaThumbPicker({ label, mediaRecord, onPickMedia, onClearMedia }) {
  const previewUrl = mediaRecord?.public_url || mediaRecord?.drive_url || ''
  return (
    <div className="hero-banner-media-picker">
      <label className="admin-field-label">{label}</label>
      <div className="hero-banner-media-slot">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={mediaRecord.alt_text || label} className="hero-banner-thumb" />
            <div className="hero-banner-media-actions">
              <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={onPickMedia}>
                <RefreshCw size={12} /> Cambiar
              </button>
              <button type="button" className="admin-button admin-button--ghost admin-button--sm" onClick={onClearMedia}>
                Quitar
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="hero-banner-media-empty" onClick={onPickMedia}>
            <ImagePlus size={26} />
            <span>Seleccionar de Media</span>
          </button>
        )}
      </div>
    </div>
  )
}

function BannerPreview({ desktopRecord, mobileRecord, mode }) {
  const url = mode === 'mobile'
    ? (mobileRecord?.public_url || mobileRecord?.drive_url)
    : (desktopRecord?.public_url || desktopRecord?.drive_url)
  if (!url) return <div className="hero-banner-preview-empty">Sin imagen {mode === 'mobile' ? 'mobile' : 'desktop'}</div>
  return (
    <div className={`hero-banner-preview-frame is-${mode}`}>
      <img src={url} alt={`Preview ${mode}`} />
    </div>
  )
}

// ─── component principal ─────────────────────────────────────────────────────

/**
 * HeroBannerSection – sección visual del editor de campañas para configurar el Hero Banner.
 *
 * Props:
 *   campaign        – registro completo de campaña tal como viene del backoffice (incluye strings)
 *   bannerData      – objeto hero_banner parseado { enabled, desktop_media_id, mobile_media_id, … }
 *   desktopMedia    – registro CMS_Media para desktop (o null)
 *   mobileMedia     – registro CMS_Media para mobile (o null)
 *   onChange(patch) – callback con un patch parcial del hero_banner a aplicar
 *   onMediaChange(field, record) – callback cuando se selecciona un nuevo media ('desktop_media_id' | 'mobile_media_id', record)
 *   onUpload(payload) – para subir nuevas imágenes (misma firma que MediaUploadModal)
 */
export default function HeroBannerSection({
  campaign,
  bannerData = {},
  desktopMedia,
  mobileMedia,
  onChange,
  onMediaChange,
  onUpload,
}) {
  const [previewMode, setPreviewMode] = useState('desktop')
  const [mediaPicker, setMediaPicker] = useState(null) // 'desktop' | 'mobile' | null

  const banner = bannerData || {}
  const enabled = safeBool(banner.enabled)
  const bannerStatus = useMemo(() => calcBannerStatus(campaign, banner), [campaign, banner])

  const defaultClickUrl = useMemo(() => {
    const path = campaign?.landing_path || ''
    if (!path || path === '/') return ''
    if (campaign?.campaign_key === 'galicia-2026') {
      return '/bonificacion-galicia?source=home_banner&utm_source=fedesconsultora&utm_medium=website&utm_campaign=beneficio_galicia_2026'
    }
    const sep = path.includes('?') ? '&' : '?'
    return `${path}${sep}source=home_banner&utm_source=fedesconsultora&utm_medium=website&utm_campaign=${encodeURIComponent(campaign?.campaign_key || '')}`
  }, [campaign])

  const handleChange = (field, value) => {
    onChange({ ...banner, [field]: value })
  }

  const handleMediaSelect = (field, record) => {
    setMediaPicker(null)
    onMediaChange(field, record)
  }

  const handleMediaClear = (field) => {
    onMediaChange(field, null)
  }

  const handleUploadAndSelect = async (payload) => {
    const result = await onUpload(payload)
    if (mediaPicker && result?.media) {
      const field = mediaPicker === 'desktop' ? 'desktop_media_id' : 'mobile_media_id'
      onMediaChange(field, result.media)
      setMediaPicker(null)
    }
    return result
  }

  return (
    <div className="hero-banner-section">
      <div className="hero-banner-section-header">
        <div className="hero-banner-section-title">
          <h3>🎯 Banner del Hero</h3>
          <p>Configurá una imagen promocional que aparece antes del Hero normal en la home.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BannerStatusChip status={bannerStatus} />
          <button
            type="button"
            className={`hero-banner-toggle ${enabled ? 'is-on' : ''}`}
            onClick={() => handleChange('enabled', !enabled)}
            aria-pressed={enabled}
            aria-label={enabled ? 'Desactivar banner' : 'Activar banner'}
          >
            {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            <span>{enabled ? 'Mostrar en el Hero' : 'Ocultar del Hero'}</span>
          </button>
        </div>
      </div>

      <div className="hero-banner-media-row">
        <MediaThumbPicker
          label="Imagen Desktop (1367×683 sugerido)"
          mediaRecord={desktopMedia}
          onPickMedia={() => setMediaPicker('desktop')}
          onClearMedia={() => handleMediaClear('desktop_media_id')}
        />
        <MediaThumbPicker
          label="Imagen Mobile (651×1277 sugerido)"
          mediaRecord={mobileMedia}
          onPickMedia={() => setMediaPicker('mobile')}
          onClearMedia={() => handleMediaClear('mobile_media_id')}
        />
      </div>

      <div className="admin-form-grid" style={{ marginTop: 16 }}>
        <label className="admin-field is-wide">
          <span>Texto alternativo</span>
          <input
            type="text"
            value={banner.alt || ''}
            onChange={(e) => handleChange('alt', e.target.value)}
            placeholder="Beneficio exclusivo Galicia para participantes de la charla"
          />
        </label>

        <label className="admin-field">
          <span>Tiempo visible (segundos)</span>
          <input
            type="number"
            min={2}
            max={30}
            value={banner.display_seconds ?? 6}
            onChange={(e) => handleChange('display_seconds', Number(e.target.value))}
          />
        </label>

        <label className="admin-field" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
          <input
            type="checkbox"
            checked={banner.show_once_per_session !== false}
            onChange={(e) => handleChange('show_once_per_session', e.target.checked)}
            id="banner-once-per-session"
          />
          <span htmlFor="banner-once-per-session">Mostrar sólo una vez por sesión</span>
        </label>

        <label className="admin-field is-wide">
          <span>URL de destino (opcional)</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={banner.click_url || ''}
              onChange={(e) => handleChange('click_url', e.target.value)}
              placeholder={defaultClickUrl || '/bonificacion-galicia?source=home_banner…'}
              style={{ flex: 1 }}
            />
            {(banner.click_url || defaultClickUrl) && (
              <a
                href={banner.click_url || defaultClickUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-button admin-button--ghost"
                style={{ flexShrink: 0 }}
                title="Abrir URL"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {!banner.click_url && defaultClickUrl && (
            <small style={{ color: 'var(--admin-muted)', marginTop: 4, display: 'block' }}>
              Se usará: {defaultClickUrl}
            </small>
          )}
        </label>

        <label className="admin-field" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 22 }}>
          <input
            type="checkbox"
            checked={safeBool(banner.open_in_new_tab)}
            onChange={(e) => handleChange('open_in_new_tab', e.target.checked)}
            id="banner-new-tab"
          />
          <span htmlFor="banner-new-tab">Abrir en nueva pestaña</span>
        </label>
      </div>

      {/* Preview responsive */}
      {(desktopMedia || mobileMedia) && (
        <div className="hero-banner-preview-section">
          <div className="hero-banner-preview-tabs">
            <span className="hero-banner-preview-label">Vista previa</span>
            <button
              type="button"
              className={`admin-tab-btn ${previewMode === 'desktop' ? 'is-active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor size={13} /> Desktop
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${previewMode === 'mobile' ? 'is-active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone size={13} /> Mobile
            </button>
          </div>
          <BannerPreview
            desktopRecord={desktopMedia}
            mobileRecord={mobileMedia}
            mode={previewMode}
          />
        </div>
      )}

      {/* Modal de selección de media */}
      {mediaPicker && (
        <MediaSelectorModal
          onClose={() => setMediaPicker(null)}
          onSelect={(record) => handleMediaSelect(
            mediaPicker === 'desktop' ? 'desktop_media_id' : 'mobile_media_id',
            record
          )}
          onUpload={handleUploadAndSelect}
          entityType="hero_banner"
          entityId={campaign?.campaign_id || ''}
        />
      )}
    </div>
  )
}
