import { useState } from 'react'
import { Copy, KeyRound, RefreshCcw, Save, X } from 'lucide-react'

export default function SecurityModal({ onClose, onChangePassword, onRotateKey }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const changePassword = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      if (newPassword.length < 10) throw new Error('La nueva contraseña debe tener al menos 10 caracteres.')
      if (newPassword !== confirmPassword) throw new Error('Las contraseñas nuevas no coinciden.')
      await onChangePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Contraseña actualizada.')
    } catch (err) {
      setError(err.message)
    }
  }

  const rotate = async () => {
    setError('')
    setMessage('')
    try {
      const result = await onRotateKey()
      setApiKey(result.apiKey || '')
      setMessage('API key rotada. Guardala ahora: se muestra una sola vez.')
    } catch (err) {
      setError(err.message)
    }
  }

  const copyKey = async () => {
    if (apiKey) await navigator.clipboard.writeText(apiKey)
  }

  return (
    <div className="admin-modal-layer">
      <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="admin-modal admin-glass">
        <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
        <div className="admin-modal-heading"><span>Sistema</span><h2>Seguridad</h2><p>Credenciales del backoffice y claves de integración.</p></div>
        <div className="admin-security-grid">
          <form className="admin-security-card admin-glass-soft" onSubmit={changePassword}>
            <div className="admin-security-icon"><KeyRound size={20} /></div>
            <h3>Cambiar contraseña</h3>
            <p>La contraseña se almacena hasheada en Script Properties.</p>
            <label className="admin-field"><span>Contraseña actual</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
            <label className="admin-field"><span>Nueva contraseña</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /></label>
            <label className="admin-field"><span>Repetir nueva contraseña</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></label>
            <button type="submit" className="admin-button admin-button--primary"><Save size={15} />Actualizar contraseña</button>
          </form>
          <section className="admin-security-card admin-glass-soft">
            <div className="admin-security-icon"><RefreshCcw size={20} /></div>
            <h3>API key VADDAR</h3>
            <p>Rotala sólo cuando necesites revocar la integración server-to-server actual.</p>
            <button type="button" className="admin-button admin-button--ghost" onClick={rotate}><RefreshCcw size={15} />Rotar API key</button>
            {apiKey && <div className="admin-secret-box"><code>{apiKey}</code><button type="button" onClick={copyKey}><Copy size={15} />Copiar</button></div>}
          </section>
        </div>
        {message && <div className="admin-form-success">{message}</div>}
        {error && <div className="admin-form-error">{error}</div>}
      </section>
    </div>
  )
}
