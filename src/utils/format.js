export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`
}

export function randomSegment(length = 4) {
  let out = ''
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export function generateCaseFileNumber() {
  return `VC-${randomSegment()}-${randomSegment()}`
}

export function generateDocumentId() {
  const bytes = new Uint8Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  return `UI-${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('')}`
}

export function formatIssuedDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
    .toUpperCase()
  const year = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mi = String(date.getUTCMinutes()).padStart(2, '0')
  return { day, month, year, isoDate: `${year}-${mm}-${day}`, time: `${hh}:${mi}` }
}

export function truncate(value, max) {
  if (!value) return ''
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

export function normalizeCodeName(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}