import { useEffect, useMemo, useState } from 'react'
import { getMediaImageCandidates } from '../mediaUtils'

export default function ResilientMediaImage({ media, alt = '', className = '', size = 'w2000', onUnavailable }) {
  const candidates = useMemo(() => getMediaImageCandidates(media, size), [media, size])
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
      className={className}
      onError={() => setIndex((current) => current + 1)}
    />
  )
}
