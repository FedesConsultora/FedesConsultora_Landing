import React, { useEffect, useMemo, useState } from 'react'
import './HeroCampaignSlider.scss'

function imageCandidates(url, fileId, size) {
  const candidates = []

  // Para el Hero priorizamos la entrega directa de Google Images antes que la
  // URL pública de Drive, que suele agregar redirects y tarda más en arrancar.
  if (fileId) {
    candidates.push(`https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=${encodeURIComponent(size)}`)
    candidates.push(`https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(size)}`)
  }
  if (url) candidates.push(url)
  if (fileId) candidates.push(`https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`)

  return [...new Set(candidates.filter(Boolean))]
}

function CampaignImage({ desktopUrl, mobileUrl, desktopFileId, mobileFileId, alt, onReady, onUnavailable }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const preferredSize = isMobile ? 'w900' : 'w1600'
  const candidates = useMemo(
    () => imageCandidates(
      isMobile ? mobileUrl : desktopUrl,
      isMobile ? mobileFileId : desktopFileId,
      preferredSize,
    ),
    [isMobile, mobileUrl, desktopUrl, mobileFileId, desktopFileId, preferredSize],
  )
  const [index, setIndex] = useState(0)
  const exhausted = !candidates.length || index >= candidates.length

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  useEffect(() => {
    if (exhausted) onUnavailable?.()
  }, [exhausted, onUnavailable])

  if (exhausted) return null

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className="hero-campaign-slide__img"
      loading="eager"
      decoding="async"
      fetchPriority="high"
      draggable="false"
      onLoad={() => onReady?.()}
      onError={() => setIndex((current) => current + 1)}
    />
  )
}

export default function HeroCampaignSlide({ campaign, onBannerClick, onImageReady, onImageUnavailable }) {
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
        <CampaignImage
          desktopUrl={banner.desktop_url}
          mobileUrl={banner.mobile_url}
          desktopFileId={banner.desktop_file_id}
          mobileFileId={banner.mobile_file_id}
          alt={altText}
          onReady={onImageReady}
          onUnavailable={onImageUnavailable}
        />
      </a>
    </div>
  )
}
