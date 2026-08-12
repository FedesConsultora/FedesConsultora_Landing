import { useMemo, useState } from 'react'
import './AdminDashboard.scss'

export default function AdminDashboard() {
  const [loaded, setLoaded] = useState(false)
  const apiUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

  const adminUrl = useMemo(() => {
    if (!apiUrl) return ''
    const url = new URL(apiUrl)
    url.searchParams.set('page', 'admin')
    return url.toString()
  }, [apiUrl])

  if (!adminUrl) {
    return (
      <main className="admin-host admin-host--error">
        <section>
          <span>Fedes Backoffice</span>
          <h1>No se pudo abrir el panel</h1>
          <p>Falta configurar VITE_GOOGLE_SCRIPT_URL en este entorno.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-host">
      {!loaded && (
        <div className="admin-host__loading" aria-live="polite">
          <div className="admin-host__loader" />
          <strong>Cargando Fedes Backoffice…</strong>
          <span>Conectando con la base de datos segura.</span>
        </div>
      )}
      <iframe
        className={`admin-host__frame ${loaded ? 'is-loaded' : ''}`}
        src={adminUrl}
        title="Fedes Backoffice"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setLoaded(true)}
      />
    </main>
  )
}
