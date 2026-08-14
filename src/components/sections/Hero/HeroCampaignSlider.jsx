import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import HeroCampaignSlide from './HeroCampaignSlide'
import { getActiveHeroCampaigns } from '../../../services/galiciaApi'
import { trackEvent } from '../../../services/googleApi'
import './HeroCampaignSlider.scss'

function hasRenderableHeroMedia(campaign) {
  const banner = campaign?.hero_banner
  return Boolean(
    banner &&
    (banner.desktop_url || banner.desktop_file_id) &&
    (banner.mobile_url || banner.mobile_file_id),
  )
}

function decodePreviewCampaign(value) {
  if (!value) return null
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = window.atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

function readAdminPreviewCampaign() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('previewHero') !== '1') return null

    const encodedPreview = params.get('previewCampaign')
    const queryPreview = decodePreviewCampaign(encodedPreview)
    if (queryPreview && hasRenderableHeroMedia(queryPreview)) return queryPreview

    const raw = sessionStorage.getItem('fedes_hero_banner_preview')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!hasRenderableHeroMedia(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export default function HeroCampaignSlider({ normalHero }) {
  const [campaigns, setCampaigns] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const markBannerAsSeen = useCallback((campaignKey, isPreview = false) => {
    if (!campaignKey || isPreview) return
    try {
      sessionStorage.setItem(`fedes_hero_banner_seen:${campaignKey}`, 'true')
    } catch {
      /* ignore */
    }
  }, [])

  const advanceNext = useCallback((isManual = false) => {
    clearCurrentTimer()
    setCampaigns((currentCampaigns) => {
      setCurrentIndex((prevIndex) => {
        const currentCampaign = currentCampaigns[prevIndex]
        if (currentCampaign) {
          markBannerAsSeen(currentCampaign.campaign_key, currentCampaign.__preview)
          if (!currentCampaign.__preview) {
            trackEvent(
              'Hero Campaign Banner',
              isManual ? 'hero_banner_manual_advance' : 'hero_banner_auto_advance',
              currentCampaign.campaign_key,
              {
                campaign_key: currentCampaign.campaign_key,
                source: 'home_banner',
                utm_source: 'fedesconsultora',
                utm_medium: 'website',
                utm_campaign: currentCampaign.campaign_key,
                device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
                page_path: window.location.pathname,
              }
            )
          }
        }
        return prevIndex + 1
      })
      return currentCampaigns
    })
  }, [clearCurrentTimer, markBannerAsSeen])

  useEffect(() => {
    let active = true
    const previewCampaign = readAdminPreviewCampaign()

    if (previewCampaign) {
      setCampaigns([previewCampaign])
      setLoaded(true)
      return () => { active = false }
    }

    const timeoutId = setTimeout(() => {
      if (active) setLoaded(true)
    }, 2500)

    getActiveHeroCampaigns()
      .then((activeCampaigns) => {
        if (active) {
          setCampaigns(Array.isArray(activeCampaigns) ? activeCampaigns : [])
          setLoaded(true)
        }
      })
      .catch(() => {
        if (active) setLoaded(true)
      })

    return () => {
      active = false
      clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    clearCurrentTimer()

    if (currentIndex < campaigns.length) {
      const activeCampaign = campaigns[currentIndex]
      if (activeCampaign) {
        if (!activeCampaign.__preview) {
          trackEvent(
            'Hero Campaign Banner',
            'hero_banner_impression',
            activeCampaign.campaign_key,
            {
              campaign_key: activeCampaign.campaign_key,
              source: 'home_banner',
              utm_source: 'fedesconsultora',
              utm_medium: 'website',
              utm_campaign: activeCampaign.campaign_key,
              device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
              page_path: window.location.pathname,
            }
          )
        }

        const seconds = Number(activeCampaign.hero_banner?.display_seconds) || 6
        timerRef.current = setTimeout(() => {
          advanceNext(false)
        }, Math.max(2, seconds) * 1000)
      }
    }

    return () => clearCurrentTimer()
  }, [loaded, currentIndex, campaigns, clearCurrentTimer, advanceNext])

  const handleBannerClick = (campaign, clickUrl) => {
    markBannerAsSeen(campaign.campaign_key, campaign.__preview)
    if (campaign.__preview) return
    trackEvent(
      'Hero Campaign Banner',
      'hero_banner_click',
      campaign.campaign_key,
      {
        campaign_key: campaign.campaign_key,
        click_url: clickUrl,
        source: 'home_banner',
        utm_source: 'fedesconsultora',
        utm_medium: 'website',
        utm_campaign: campaign.campaign_key,
        device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        page_path: window.location.pathname,
      }
    )
  }

  const isShowingBanner = loaded && campaigns.length > 0 && currentIndex < campaigns.length
  const currentCampaign = isShowingBanner ? campaigns[currentIndex] : null

  const slideVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeInOut' } },
        exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
      }
    : {
        initialBanner: { x: 0, opacity: 1 },
        exitBanner: {
          x: '-100%',
          opacity: 0,
          transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
        },
        initialHero: { x: '100%', opacity: 0.6 },
        animateHero: {
          x: 0,
          opacity: 1,
          transition: { duration: 0.85, ease: [0.25, 1, 0.5, 1] },
        },
      }

  return (
    <div className="hero-campaign-slider-wrapper">
      <AnimatePresence mode="wait">
        {isShowingBanner && currentCampaign ? (
          <motion.div
            key={`banner-${currentCampaign.campaign_key}-${currentIndex}`}
            className="hero-campaign-slider-slide is-banner"
            initial={shouldReduceMotion ? slideVariants.initial : slideVariants.initialBanner}
            animate={shouldReduceMotion ? slideVariants.animate : { x: 0, opacity: 1 }}
            exit={shouldReduceMotion ? slideVariants.exit : slideVariants.exitBanner}
            drag={window.innerWidth <= 768 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -60) advanceNext(true)
            }}
          >
            <HeroCampaignSlide campaign={currentCampaign} onBannerClick={handleBannerClick} onImageUnavailable={() => advanceNext(false)} />

            {currentCampaign.__preview && <div className="hero-campaign-preview-badge">Vista previa del Backoffice</div>}

            <button
              type="button"
              className="hero-campaign-skip-btn"
              onClick={() => advanceNext(true)}
              aria-label="Continuar al contenido principal"
            >
              <span>Continuar</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="normal-hero"
            className="hero-campaign-slider-slide is-normal-hero"
            initial={campaigns.length > 0 && !shouldReduceMotion ? slideVariants.initialHero : shouldReduceMotion && campaigns.length > 0 ? slideVariants.initial : false}
            animate={campaigns.length > 0 && !shouldReduceMotion ? slideVariants.animateHero : shouldReduceMotion && campaigns.length > 0 ? slideVariants.animate : { x: 0, opacity: 1 }}
          >
            {normalHero}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
