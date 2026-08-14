import { useEffect, useMemo, useState } from 'react'
import { getMediaImageCandidates } from '../mediaUtils'

export default function ResilientMediaImage({ media, alt = '', className = '', size = 'w2000', onUnavailable }) {
  const candidates = useMemo(() => getMediaImageCandidates(media, size), [media, size])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [candidates])

  if (!candidates.length || index >= candidates.length) {
    onUnavailable?.()
    return null
  }

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      onError={() => {
        const next = index + 1
        setIndex(next)
        if (next >= candidates.length) onUnavailable?.()
      }}
    />
  )
}
