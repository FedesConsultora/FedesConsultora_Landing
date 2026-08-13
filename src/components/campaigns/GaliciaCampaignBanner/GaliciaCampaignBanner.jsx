import { useEffect, useState } from 'react'
import { getGaliciaCampaign } from '../../../services/galiciaApi'
import './GaliciaCampaignBanner.scss'

const MAX_BANNER_MS = 7 * 24 * 60 * 60 * 1000
const GALICIA_BANNER_URL = '/bonificacion-galicia?source=home_banner&utm_source=fedes&utm_medium=website&utm_campaign=beneficio_galicia_2026'

function isCampaignBannerActive(campaign) {
  if (!campaign) return false

  const startsAt = Date.parse(campaign.starts_at || '')
  if (!Number.isFinite(startsAt)) return false

  const configuredEnd = Date.parse(campaign.ends_at || '')
  const hardEnd = startsAt + MAX_BANNER_MS
  const endsAt = Number.isFinite(configuredEnd) ? Math.min(configuredEnd, hardEnd) : hardEnd
  const now = Date.now()

  return now >= startsAt && now <= endsAt
}

export default function GaliciaCampaignBanner() {
  const [campaign, setCampaign] = useState(null)

  useEffect(() => {
    let active = true
    getGaliciaCampaign().then((data) => {
      if (active && isCampaignBannerActive(data)) setCampaign(data)
    })
    return () => { active = false }
  }, [])

  if (!campaign) return null

  return (
    <aside className="galicia-campaign-banner" aria-label="Beneficio Banco Galicia">
      <div className="galicia-campaign-banner__inner">
        <div>
          <span>Banco Galicia · Beneficio 2026</span>
          <strong>¿Participaste de “Pymes que venden más”?</strong>
          <p>Activá el beneficio exclusivo de Onboarding estratégico con Fedes.</p>
        </div>
        <a href={GALICIA_BANNER_URL}>Activar beneficio</a>
      </div>
    </aside>
  )
}
