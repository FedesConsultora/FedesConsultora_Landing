import { useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'

export default function MediaUploadModal({ onClose, onUpload }) {
  const [file, setFile] = useState(null)
  const [altText, setAltText] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!file) return setError('Seleccioná una imagen.')
    if (!file.type.startsWith('image/')) return setError('El archivo debe ser una imagen.')
    if (file.size > 8 * 1024 * 1024) return setError('Máximo 8 MB.')
    setBusy(true)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
        reader.readAsDataURL(file)
      })
      await onUpload({ base64, fileName: file.name, mimeType: file.type, altText, entityType, entityId })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="admin-modal-layer"><button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} /><section className="admin-modal admin-glass"><button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button><div className="admin-modal-heading"><span>Media</span><h2>Subir imagen</h2><p>Se guarda en Google Drive y se registra en CMS_Media.</p></div><form onSubmit={submit}><div className="admin-upload-drop"><ImagePlus size={30} /><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /><strong>{file?.name || 'Elegí una imagen'}</strong><span>{file ? `${Math.round(file.size / 1024)} KB` : 'PNG, JPG, WEBP · máximo 8 MB'}</span></div><div className="admin-form-grid"><label className="admin-field is-wide"><span>Texto alternativo</span><input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Descripción accesible de la imagen" /></label><label className="admin-field"><span>Tipo relacionado</span><input value={entityType} onChange={(event) => setEntityType(event.target.value)} placeholder="blog, case, team…" /></label><label className="admin-field"><span>ID relacionado</span><input value={entityId} onChange={(event) => setEntityId(event.target.value)} /></label></div>{error && <div className="admin-form-error">{error}</div>}<div className="admin-modal-actions"><button type="button" className="admin-button admin-button--ghost" onClick={onClose}>Cancelar</button><button type="submit" className="admin-button admin-button--primary" disabled={busy}><Upload size={15} />{busy ? 'Subiendo…' : 'Subir imagen'}</button></div></form></section></div>
}
