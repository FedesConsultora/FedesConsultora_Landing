import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCampaignLanding } from '../../services/galiciaApi'
import BonoLanding from './BonoLanding'
import './BonificacionGaliciaRoute.scss'

function LandingLoading() {
  return (
    <main className="bono-route-state" aria-live="polite">
      <span className="bono-route-state__spinner" aria-hidden="true" />
      <p>Validando beneficio…</p>
    </main>
  )
}

export default function CampaignLandingRoute() {
  const location = useLocation()
  const [resolved, setResolved] = useState({ path: '', landing: null })

  useEffect(() => {
    let active = true
    const requestedPath = location.pathname

    getCampaignLanding(requestedPath, { force: true })
      .then((landing) => {
        if (active) setResolved({ path: requestedPath, landing })
      })
      .catch(() => {
        if (active) setResolved({ path: requestedPath, landing: null })
      })

    return () => { active = false }
  }, [location.pathname])

  if (resolved.path !== location.pathname) return <LandingLoading />
  if (!resolved.landing) return <Navigate to="/" replace />

  return <BonoLanding landing={resolved.landing} />
}
