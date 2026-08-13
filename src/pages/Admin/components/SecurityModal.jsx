import { useState } from 'react'
import { Copy, KeyRound, LoaderCircle, RefreshCcw, Save, ShieldCheck, X } from 'lucide-react'

export default function SecurityModal({ onClose, onChangePassword, onRotateKey }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [rotatingKey, setRotatingKey] = useState(false)

  const changePassword = async (event) => {
    event.preventDefault()
    if (savingPassword) return
    setError('')
    setMessage('')
    setSavingPassword(true)
    try {
      if (!currentPassword) throw new Error('Ingresá tu contraseña actual.')
      if (newPassword.length < 10) throw new Error('La nueva contraseña debe tener al menos 10 caracteres.')
      if (newPassword === currentPassword) throw new Error('La nueva contraseña debe ser distinta de la actual.')
      if (newPassword !== confirmPassword) throw new Error('Las contraseñas nuevas no coinciden.')
      await onChangePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Contraseña actualizada correctamente. La próxima vez que inicies sesión usá la nueva contraseña.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const rotate = async () => {
    if (rotatingKey) return
    setError('')
    setMessage('')
    setRotatingKey(true)
    try {
      const result = await onRotateKey()
      setApiKey(result.apiKey || '')
      setMessage('API key rotada. Guardala ahora: se muestra una sola vez.')
    } catch (err) {
      setError(err.message)
    } finally {
      setRotatingKey(false)
    }
  }

  const copyKey = async () => {
    if (apiKey) await navigator.clipboard.writeText(apiKey)
  }

  return (
    <div className="admin-modal-layer">
      <button type="button" className="admin-modal-backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="admin-modal admin-glass" role="dialog" aria-modal="true" aria-labelledby="admin-security-title">
        <button type="button" className="admin-modal-close" onClick={onClose}><X size={19} /></button>
        <div className="admin-modal-heading">
          <span>Cuenta y accesos</span>
          <h2 id="admin-security-title">Seguridad del panel</h2>
          <p>Cambiá la contraseña del backoffice sin salir de React y administrá las credenciales de integración.</p>
        </div>

        <div className="admin-security-grid">
          <form className="admin-security-card admin-glass-soft" onSubmit={changePassword}>
            <div className="admin-security-icon"><KeyRound size={20} /></div>
            <h3>Cambiar contraseña</h3>
            <p>La contraseña no se guarda en la landing ni en la base: el backend almacena únicamente su hash seguro.</p>
            <label className="admin-field"><span>Contraseña actual</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>
            <label className="admin-field"><span>Nueva contraseña</span><input type="password" minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /></label>
            <label className="admin-field"><span>Repetir nueva contraseña</span><input type="password" minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></label>
            <small className="admin-security-hint"><ShieldCheck size={13} /> Mínimo 10 caracteres.</small>
            <button type="submit" className="admin-button admin-button--primary" disabled={savingPassword}>
              {savingPassword ? <LoaderCircle className="is-spinning" size={15} /> : <Save size={15} />}
              {savingPassword ? 'Cambiando contraseña…' : 'Actualizar contraseña'}
            </button>
          </form>

          <section className="admin-security-card admin-glass-soft">
            <div className="admin-security-icon"><RefreshCcw size={20} /></div>
            <h3>API key VADDAR</h3>
            <p>Rotala sólo cuando necesites revocar la integración server-to-server actual.</p>
            <button type="button" className="admin-button admin-button--ghost" onClick={rotate} disabled={rotatingKey}>
              {rotatingKey ? <LoaderCircle className="is-spinning" size={15} /> : <RefreshCcw size={15} />}
              {rotatingKey ? 'Rotando…' : 'Rotar API key'}
            </button>
            {apiKey && <div className="admin-secret-box"><code>{apiKey}</code><button type="button" onClick={copyKey}><Copy size={15} />Copiar</button></div>}
          </section>
        </div>
        {message && <div className="admin-form-success">{message}</div>}
        {error && <div className="admin-form-error">{error}</div>}
      </section>
    </div>
  )
}
