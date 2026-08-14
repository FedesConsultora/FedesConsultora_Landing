import React from 'react'
import './HeroCampaignSlider.scss'

export default function HeroCampaignSlide({ campaign, onBannerClick }) {
  if (!campaign || !campaign.hero_banner) return null

  const banner = campaign.hero_banner
  const clickUrl = banner.click_url || campaign.landing_path || '#'
  const target = banner.open_in_new_tab ? '_blank' : undefined
  const rel = banner.open_in_new_tab ? 'noopener noreferrer' : undefined
  const altText = banner.alt || campaign.name || 'Campaña Fedes'

  return (
    <div className="hero-campaign-slide">
      <a
        href={clickUrl}
        target={target}
        rel={rel}
        className="hero-campaign-slide__link"
        onClick={() => onBannerClick(campaign, clickUrl)}
        aria-label={altText}
      >
        <picture className="hero-campaign-slide__picture">
          <source media="(max-width: 768px)" srcSet={banner.mobile_url} />
          <img
            src={banner.desktop_url}
            alt={altText}
            className="hero-campaign-slide__img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </a>
    </div>
  )
}

