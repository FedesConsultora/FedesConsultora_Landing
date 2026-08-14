function driveFileIdFromUrl(url = '') {
  const value = String(url || '')
  const queryMatch = value.match(/[?&]id=([^&#]+)/i)
  if (queryMatch?.[1]) return decodeURIComponent(queryMatch[1])
  const pathMatch = value.match(/\/d\/([^/]+)/i)
  return pathMatch?.[1] || ''
}

export function getMediaFileId(media) {
  if (!media) return ''
  return media.file_id || driveFileIdFromUrl(media.public_url) || driveFileIdFromUrl(media.drive_url) || ''
}

export function getMediaImageCandidates(media, size = 'w2000') {
  if (!media) return []
  if (media._preview_url) return [media._preview_url]

  const fileId = getMediaFileId(media)
  const candidates = []

  if (media.public_url) candidates.push(media.public_url)
  if (fileId) {
    candidates.push(`https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=${encodeURIComponent(size)}`)
    candidates.push(`https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(size)}`)
    candidates.push(`https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`)
  }

  return [...new Set(candidates.filter(Boolean))]
}

export function getMediaImageUrl(media, size = 'w2000') {
  return getMediaImageCandidates(media, size)[0] || ''
}

export function withLocalMediaPreview(media, previewUrl) {
  if (!media) return media
  return previewUrl ? { ...media, _preview_url: previewUrl } : media
}
