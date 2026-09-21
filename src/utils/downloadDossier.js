/**
 * Renders a DOM node to an image blob entirely in the browser.
 * The heavy html-to-image dependency is loaded on demand so the
 * main bundle stays lean.
 */
let htmlToImagePromise = null

function loadHtmlToImage() {
  if (!htmlToImagePromise) {
    htmlToImagePromise = import('html-to-image')
  }
  return htmlToImagePromise
}

export async function dossierNodeToBlob(node, { pixelRatio = 2 } = {}) {
  if (!node) {
    throw new Error('Dossier document was not found for export.')
  }
  try {
    await document.fonts.ready
  } catch {
    // Font readiness is best-effort; continue regardless.
  }
  const { toBlob } = await loadHtmlToImage()
  const blob = await toBlob(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: '#07080a',
    style: {
      transform: 'none',
      transformOrigin: 'center top',
    },
    filter: (element) => {
      // Skip purely decorative fixed background overlays that would
      // cover the exported document.
      if (element instanceof HTMLElement && element.dataset.exportSkip) return false
      return true
    },
  })
  if (!blob) {
    throw new Error('The browser could not compose the dossier image.')
  }
  return blob
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function dossierFilename(codename) {
  const slug = String(codename || 'operative')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  return `undercover-dossier-${slug || 'operative'}.png`
}