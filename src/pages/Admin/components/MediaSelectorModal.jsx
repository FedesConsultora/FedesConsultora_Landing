import { useState, useMemo } from 'react'
import { Image, X, Search, Upload } from 'lucide-react'
import { adminCommand } from '../adminApi'

/**
 * MediaSelectorModal – permite elegir una imagen existente de CMS_Media
 * o subir una nueva, devolviendo el registro completo seleccionado.
 *
 * Props:
 *   onClose()
 *   onSelect(mediaRecord)   – record de CMS_Media { media_id, public_url, file_name, alt_text, … }
 *   onUpload(payload)       – llamada para subir imagen nueva (igual que MediaUploadModal)
 *   entityType              – para prefill en subida ('hero_banner', etc.)
 *   entityId                – para prefill en subida
 */
export default function MediaSelectorModal({ onClose, onSelect, onUpload, entityType = '', entityId = '' }) {
  const [tab, setTab] = useState('browse')
  const [mediaList, setMediaList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Subida
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const fetchMedia = async () => {
    if (mediaList !== null) return
    setLoading(true)
    setError('')
    try {
      const result = await adminCommand('queryTable', {
        tableKey: 'media',
        query: { pageSize: 100, sortBy: 'created_at', sortDir: 'desc', includeArchived: false },
      })
      setMediaList(result.rows || [])
    } catch (err) {
      setError('No se pudo cargar la lista de medios.')
    } finally {
      setLoading(false)
    }
  }

  // Cargar la lista cuando cambia a la pestaña de explorar
  const handleTabBrowse = () => {
    setTab('browse')
    fetchMedia()
  }

  const filteredMedia = useMemo(() => {
    if (!mediaList) return []
    const term = search.trim().toLowerCase()
    if (!term) return mediaList
    return mediaList.filter(
      (m) =>
        (m.file_name || '').toLowerCase().includes(term) ||
        (m.alt_text || '').toLowerCase().includes(term)
    )
  }, [mediaList, search])

  const handleSelect = (record) => {
    onSelect(record)
    onClose()
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setUploadError('')
    if (!uploadFile) return setUploadError('Seleccioná una imagen.')
    if (!uploadFile.type.startsWith('image/')) return setUploadError('El archivo debe ser una imagen.')
    if (uploadFile.size > 8 * 1024 * 1024) return setUploadError('Máximo 8 MB.')
    setUploadBusy(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
        reader.readAsDataURL(uploadFile)
      })
      const result = await onUpload({
        base64,
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        altText: uploadAlt,
        entityType,
        entityId,
      })
      // Si la respuesta incluye el registro media, seleccionarlo automáticamente
      if (result?.media) {
        onSelect(result.media)
      } else {
        // Refrescar lista y cambiar a explorar
        setMediaList(null)
        handleTabBrowse()
      }
    } catch (err) {
      setUploadError(err.message || 'Error al subir la imagen.')
    } finally {
      setUploadBusy(false)
    }
  }

  return (
    <div className="admin-modal-layer" role="presentation">
      <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="admin-modal admin-modal--xl admin-glass" role="dialog" aria-modal="true">
        <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
        <div className="admin-modal-heading">
          <span>Media</span>
          <h2>Seleccionar imagen</h2>
          <p>Elegí una imagen existente de CMS_Media o subí una nueva.</p>
        </div>

        <div className="admin-media-selector-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'browse' ? 'is-active' : ''}`}
            onClick={handleTabBrowse}
          >
            <Image size={14} /> Explorar biblioteca
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'upload' ? 'is-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <Upload size={14} /> Subir nueva
          </button>
        </div>

        {tab === 'browse' && (
          <div className="admin-media-selector-browse">
            <div className="admin-media-selector-search">
              <Search size={15} />
              <input
                type="search"
                placeholder="Buscar por nombre o texto alternativo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && <div className="admin-empty-inline">Cargando imágenes…</div>}
            {error && <div className="admin-form-error">{error}</div>}
            {!loading && !error && (
              <div className="admin-media-grid">
                {filteredMedia.length === 0 ? (
                  <div className="admin-empty-inline">No hay imágenes disponibles.</div>
                ) : (
                  filteredMedia.map((m) => (
                    <button
                      type="button"
                      key={m.media_id}
                      className="admin-media-thumb"
                      onClick={() => handleSelect(m)}
                      title={m.file_name}
                    >
                      <img
                        src={m.public_url || m.drive_url}
                        alt={m.alt_text || m.file_name}
                        loading="lazy"
                      />
                      <span>{m.file_name?.slice(0, 24) || m.media_id}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'upload' && (
          <form onSubmit={handleUpload} className="admin-media-selector-upload">
            <div className="admin-upload-drop">
              <Upload size={30} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <strong>{uploadFile?.name || 'Elegí una imagen'}</strong>
              <span>{uploadFile ? `${Math.round(uploadFile.size / 1024)} KB` : 'PNG, JPG, WEBP · máximo 8 MB'}</span>
            </div>
            {uploadFile && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <img
                  src={URL.createObjectURL(uploadFile)}
                  alt="preview"
                  style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                />
              </div>
            )}
            <div className="admin-form-grid">
              <label className="admin-field is-wide">
                <span>Texto alternativo</span>
                <input
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Descripción accesible de la imagen"
                />
              </label>
            </div>
            {uploadError && <div className="admin-form-error">{uploadError}</div>}
            <div className="admin-modal-actions">
              <button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="admin-button admin-button--primary" disabled={uploadBusy}>
                <Upload size={15} />
                {uploadBusy ? 'Subiendo…' : 'Subir imagen'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
