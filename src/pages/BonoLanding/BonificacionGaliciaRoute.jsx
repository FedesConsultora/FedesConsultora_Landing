import { useEffect } from 'react'
import BonoLanding from './BonoLanding'
import './BonificacionGaliciaRoute.scss'

export default function BonificacionGaliciaRoute() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', `${window.location.origin}/bonificacion-galicia`)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return <BonoLanding />
}
