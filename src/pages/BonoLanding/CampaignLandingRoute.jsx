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
  const [state, setState] = useState({ loading: true, landing: null })

  useEffect(() => {
    let active = true
    setState({ loading: true, landing: null })

    getCampaignLanding(location.pathname, { force: true })
      .then((landing) => {
        if (active) setState({ loading: false, landing })
      })
      .catch(() => {
        if (active) setState({ loading: false, landing: null })
      })

    return () => { active = false }
  }, [location.pathname])

  if (state.loading) return <LandingLoading />
  if (!state.landing) return <Navigate to="/" replace />

  return <BonoLanding landing={state.landing} />
}
