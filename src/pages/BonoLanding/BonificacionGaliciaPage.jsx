import { useEffect } from 'react'
import BonoLanding from './BonoLanding'
import './BonoLandingOverrides.scss'

const CANONICAL_PATH = '/regalo-galicia'

export default function BonificacionGaliciaPage() {
  useEffect(() => {
    const syncCanonical = () => {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', `${window.location.origin}${CANONICAL_PATH}`)
    }

    syncCanonical()
    const frame = window.requestAnimationFrame(syncCanonical)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return <BonoLanding />
}
