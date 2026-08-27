import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAttribution, getCampaignLanding } from '../../services/galiciaApi'
import { trackEvent } from '../../services/googleApi'
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
  const trackedVisitRef = useRef('')

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

  useEffect(() => {
    const landing = resolved.landing
    if (!landing || resolved.path !== location.pathname) return

    const visitKey = `${landing.landing_key || landing.path}:${location.search}`
    if (trackedVisitRef.current === visitKey) return
    trackedVisitRef.current = visitKey

    const attribution = getAttribution(landing)
    trackEvent('Campaign Funnel', 'campaign_landing_view', landing.landing_key || landing.path, {
      campaign_key: landing.campaign?.campaign_key || landing.campaign_key || 'galicia-2026',
      landing_key: landing.landing_key || '',
      landing_path: landing.path || location.pathname,
      source: attribution.source,
      utm_source: attribution.utmSource,
      utm_medium: attribution.utmMedium,
      utm_campaign: attribution.utmCampaign,
      utm_content: attribution.utmContent,
      referrer: attribution.referrer,
      page_path: location.pathname,
      device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
    })
  }, [location.pathname, location.search, resolved])

  if (resolved.path !== location.pathname) return <LandingLoading />
  if (!resolved.landing) return <Navigate to="/" replace />

  return <BonoLanding landing={resolved.landing} />
}
