import { formatBytes } from './format'

export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
}

export const MAX_FILE_BYTES = 12 * 1024 * 1024

export const MAX_PREVIEW_WIDTH = 1600
export const MAX_PREVIEW_HEIGHT = 1600

export function validateImageFile(file, maxBytes = MAX_FILE_BYTES) {
  if (!file) {
    return { ok: false, code: 'no-file', message: 'No image file was detected.' }
  }
  if (!(file instanceof File) && !(file instanceof Blob)) {
    return { ok: false, code: 'invalid', message: 'That file looks invalid. Select a JPG, PNG, or WEBP image.' }
  }
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    return {
      ok: false,
      code: 'type',
      message: `Unsupported format (${file.type || 'unknown'}). Use JPG, PNG, or WEBP.`,
    }
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      code: 'size',
      message: `File is ${formatBytes(file.size)} — the maximum is ${formatBytes(maxBytes)}.`,
    }
  }
  return { ok: true, code: 'ok' }
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The image failed to decode.'))
    img.src = dataUrl
  })
}

export async function readImageFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
  return dataUrl
}

export async function decodeImage(dataUrl) {
  try {
    const img = await loadImageElement(dataUrl)
    return { img, width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    throw new Error('The selected image could not be decoded.')
  }
}

function canvasToDataUrl(canvas, type) {
  const mime = type === 'image/png' ? 'image/png' : 'image/jpeg'
  return type === 'image/png' ? canvas.toDataURL(mime) : canvas.toDataURL(mime, 0.92)
}

/**
 * Reads a file into a bounded, normalized preview data URL.
 * Large photographs are downscaled locally to keep the session fast.
 */
export async function createImagePreview(file) {
  const raw = await readImageFile(file)
  const { img, width, height } = await decodeImage(raw)

  const scale = Math.min(1, MAX_PREVIEW_WIDTH / width, MAX_PREVIEW_HEIGHT / height)
  const outW = Math.max(1, Math.round(width * scale))
  const outH = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, outW, outH)

  return {
    dataUrl: canvasToDataUrl(canvas, file.type),
    width: outW,
    height: outH,
  }
}