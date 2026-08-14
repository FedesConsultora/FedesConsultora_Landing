function driveFileIdFromUrl(url = '') {
  const value = String(url || '')
  const queryMatch = value.match(/[?&]id=([^&#]+)/i)
  if (queryMatch?.[1]) return decodeURIComponent(queryMatch[1])
  const pathMatch = value.match(/\/d\/([^/]+)/i)
  return pathMatch?.[1] || ''
}

export function getMediaImageUrl(media, size = 'w2000') {
  if (!media) return ''
  if (media._preview_url) return media._preview_url

  const fileId = media.file_id || driveFileIdFromUrl(media.public_url) || driveFileIdFromUrl(media.drive_url)
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(size)}`
  }

  return media.public_url || media.drive_url || ''
}

export function withLocalMediaPreview(media, previewUrl) {
  if (!media) return media
  return previewUrl ? { ...media, _preview_url: previewUrl } : media
}
