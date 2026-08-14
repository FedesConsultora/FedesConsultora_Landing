import { useEffect, useMemo, useState } from 'react'
import { Image, Search, Upload, X } from 'lucide-react'
import { adminCommand } from '../adminApi'
import { getMediaImageUrl, withLocalMediaPreview } from '../mediaUtils'
import AdminModalPortal from './AdminModalPortal'

function validateImage(file) {
  if (!file) throw new Error('Seleccioná una imagen.')
  if (!file.type?.startsWith('image/')) throw new Error('El archivo debe ser una imagen.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Máximo 8 MB.')
}

export default function MediaSelectorModal({ onClose, onSelect, onUpload, entityType = '', entityId = '' }) {
  const [tab, setTab] = useState('browse')
  const [mediaList, setMediaList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)

  const fetchMedia = async (force = false) => {
    if (mediaList !== null && !force) return
    setLoading(true)
    setError('')
    try {
      const result = await adminCommand('queryTable', {
        tableKey: 'media',
        query: { pageSize: 100, sortBy: 'created_at', sortDir: 'desc', includeArchived: false },
      })
      setMediaList(result.rows || [])
    } catch {
      setError('No se pudo cargar la lista de medios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia().catch(() => {})
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredMedia = useMemo(() => {
    if (!mediaList) return []
    const term = search.trim().toLowerCase()
    if (!term) return mediaList
    return mediaList.filter((media) => (media.file_name || '').toLowerCase().includes(term) || (media.alt_text || '').toLowerCase().includes(term))
  }, [mediaList, search])

  const handleFile = (file) => {
    setUploadError('')
    try {
      validateImage(file)
      setUploadFile(file)
      setTab('upload')
    } catch (err) {
      setUploadError(err.message)
      setTab('upload')
    }
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setUploadError('')
    try { validateImage(uploadFile) } catch (err) { setUploadError(err.message); return }
    setUploadBusy(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
        reader.readAsDataURL(uploadFile)
      })
      const result = await onUpload({ base64, fileName: uploadFile.name, mimeType: uploadFile.type, altText: uploadAlt, entityType, entityId })
      if (result?.media) {
        onSelect(withLocalMediaPreview(result.media, base64))
        onClose()
      } else {
        setUploadFile(null)
        setTab('browse')
        await fetchMedia(true)
      }
    } catch (err) {
      setUploadError(err.message || 'Error al subir la imagen.')
    } finally {
      setUploadBusy(false)
    }
  }

  return (
    <AdminModalPortal>
      <div className="admin-modal-layer" role="presentation">
        <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
        <section className="admin-modal admin-modal--xl admin-glass" role="dialog" aria-modal="true">
          <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
          <div className="admin-modal-heading"><span>Media</span><h2>Seleccionar imagen</h2><p>Elegí una imagen existente o arrastrá una nueva.</p></div>

          <div className="admin-media-selector-tabs">
            <button type="button" className={`admin-tab-btn ${tab === 'browse' ? 'is-active' : ''}`} onClick={() => { setTab('browse'); fetchMedia().catch(() => {}) }}><Image size={14} />Explorar biblioteca</button>
            <button type="button" className={`admin-tab-btn ${tab === 'upload' ? 'is-active' : ''}`} onClick={() => setTab('upload')}><Upload size={14} />Subir nueva</button>
          </div>

          {tab === 'browse' && <div className="admin-media-selector-browse"><div className="admin-media-selector-search"><Search size={15} /><input type="search" placeholder="Buscar por nombre o texto alternativo…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>{loading && <div className="admin-empty-inline">Cargando imágenes…</div>}{error && <div className="admin-form-error">{error}</div>}{!loading && !error && <div className="admin-media-grid">{filteredMedia.length === 0 ? <div className="admin-empty-inline">No hay imágenes disponibles.</div> : filteredMedia.map((media) => <button type="button" key={media.media_id} className="admin-media-thumb" onClick={() => { onSelect(media); onClose() }} title={media.file_name}><img src={getMediaImageUrl(media, 'w640')} alt={media.alt_text || media.file_name} loading="lazy" /><span>{media.file_name?.slice(0, 32) || media.media_id}</span></button>)}</div>}</div>}

          {tab === 'upload' && <form onSubmit={handleUpload} className="admin-media-selector-upload"><div className={`admin-upload-drop ${dragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files?.[0]) }}><Upload size={30} /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => handleFile(event.target.files?.[0])} /><strong>{uploadFile?.name || 'Arrastrá una imagen o hacé click'}</strong><span>{uploadFile ? `${Math.round(uploadFile.size / 1024)} KB` : 'PNG, JPG, WEBP · máximo 8 MB'}</span></div>{uploadFile && <div className="admin-upload-preview"><img src={URL.createObjectURL(uploadFile)} alt="Vista previa" /></div>}<div className="admin-form-grid"><label className="admin-field is-wide"><span>Texto alternativo</span><input value={uploadAlt} onChange={(event) => setUploadAlt(event.target.value)} placeholder="Descripción accesible de la imagen" /></label></div>{uploadError && <div className="admin-form-error">{uploadError}</div>}<div className="admin-modal-actions"><button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button><button type="submit" className="admin-button admin-button--primary" disabled={uploadBusy}><Upload size={15} />{uploadBusy ? 'Subiendo…' : 'Subir y seleccionar'}</button></div></form>}
        </section>
      </div>
    </AdminModalPortal>
  )
}
