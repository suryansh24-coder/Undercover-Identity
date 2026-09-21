/* Visual presets isolated here so tool UIs and the render engine
   share one source of truth. */

export const FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.16) brightness(0.92)' },
  { id: 'champagne', label: 'Champagne', css: 'sepia(0.35) saturate(1.06) contrast(1.04) brightness(1.02)' },
  { id: 'cinematic', label: 'Cinematic', css: 'contrast(1.18) saturate(0.78) sepia(0.12) brightness(0.98)' },
  { id: 'steel', label: 'Cold Steel', css: 'grayscale(0.45) hue-rotate(175deg) contrast(1.12) brightness(1.05)' },
  { id: 'classified', label: 'Faded File', css: 'contrast(0.86) brightness(1.07) sepia(0.2) grayscale(0.3)' },
  { id: 'warInk', label: 'War Ink', css: 'contrast(1.4) grayscale(0.92) brightness(1.02)' },
]

export function filterCss(id) {
  const found = FILTERS.find((f) => f.id === id)
  return found ? found.css : 'none'
}

export const FRAMES = [
  { id: 'none', label: 'None' },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'champagne', label: 'Champagne' },
  { id: 'officer', label: 'Officer' },
  { id: 'sealed', label: 'Sealed' },
]

export const FRAME_COLORS = {
  obsidian: '#0c0d11',
  champagne: '#c9a86a',
  officer: '#1a1c24',
  sealed: '#131419',
}

export const RESIZE_PRESETS = [
  { id: 'standard', label: 'STANDARD', scale: 1 },
  { id: 'large', label: 'LARGE', scale: 1.5 },
  { id: 'compact', label: 'COMPACT', scale: 0.75 },
]

export function resizePreset(scale) {
  return RESIZE_PRESETS.find((p) => p.scale === scale) || RESIZE_PRESETS[0]
}

export function findResizePreset(id) {
  return RESIZE_PRESETS.find((p) => p.id === id) || RESIZE_PRESETS[0]
}

export function drawFrame(ctx, width, height, id) {
  if (id === 'none') return
  const color = FRAME_COLORS[id] || FRAME_COLORS.obsidian
  const pad = Math.max(10, width * 0.035)
  const halfPad = pad / 4

  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)

  if (id === 'obsidian') {
    ctx.strokeStyle = 'rgba(201,168,106,0.65)'
    ctx.lineWidth = Math.max(1.5, width * 0.003)
    ctx.strokeRect(pad * 0.5, pad * 0.5, width - pad, height - pad)
  } else if (id === 'champagne') {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = Math.max(2, width * 0.004)
    ctx.strokeRect(pad * 0.35, pad * 0.35, width - pad * 0.7, height - pad * 0.7)
    ctx.strokeStyle = 'rgba(20,22,28,0.85)'
    ctx.lineWidth = Math.max(1, width * 0.002)
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2)
  } else if (id === 'officer') {
    ctx.strokeStyle = 'rgba(236,238,242,0.75)'
    ctx.lineWidth = Math.max(2, width * 0.004)
    ctx.strokeRect(halfPad, halfPad, width - pad * 0.5, height - pad * 0.5)
    // corner ticks
    const t = Math.max(10, width * 0.05)
    ctx.beginPath()
    for (const [x, y, dx, dy] of [
      [halfPad, halfPad, t, 0],
      [halfPad, halfPad, 0, t],
      [width - halfPad, halfPad, -t, 0],
      [width - halfPad, halfPad, 0, t],
      [halfPad, height - halfPad, t, 0],
      [halfPad, height - halfPad, 0, -t],
      [width - halfPad, height - halfPad, -t, 0],
      [width - halfPad, height - halfPad, 0, -t],
    ]) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + dx, y + dy)
    }
    ctx.stroke()
  } else if (id === 'sealed') {
    ctx.strokeStyle = 'rgba(179,19,31,0.85)'
    ctx.lineWidth = Math.max(2, width * 0.005)
    ctx.setLineDash([width * 0.02, width * 0.012])
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2)
    ctx.setLineDash([])
  }
  ctx.restore()
}

export const STICKERS = [
  { id: 'crosshair', label: 'Crosshair' },
  { id: 'star', label: 'Target Star' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'laurel', label: 'Laurel' },
  { id: 'palm', label: 'Palm' },
  { id: 'helicopter', label: 'Helicopter' },
  { id: 'radio', label: 'Radio' },
  { id: 'fish', label: 'Trophy Fish' },
]

export const STICKER_COLORS = ['#c9a86a', '#edeef2', '#b3131f']

export function drawSticker(ctx, id, cx, cy, size) {
  ctx.save()
  ctx.translate(cx, cy)
  const r = size / 2
  ctx.lineWidth = Math.max(1.4, r * 0.07)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(12,13,17,0.85)'
  ctx.fillStyle = 'rgba(236,238,242,0.92)'
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  switch (id) {
    case 'crosshair': {
      ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2)
      ctx.moveTo(-r * 0.62, 0)
      ctx.lineTo(r * 0.62, 0)
      ctx.moveTo(0, -r * 0.62)
      ctx.lineTo(0, r * 0.62)
      ctx.moveTo(-r * 0.3, 0)
      ctx.lineTo(r * 0.3, 0)
      ctx.moveTo(0, -r * 0.3)
      ctx.lineTo(0, r * 0.3)
      break
    }
    case 'star': {
      for (let i = 0; i < 10; i += 1) {
        const rad = i % 2 === 0 ? r : r * 0.46
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const x = Math.cos(a) * rad
        const y = Math.sin(a) * rad
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }
    case 'diamond': {
      ctx.moveTo(0, -r)
      ctx.lineTo(r, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r, 0)
      ctx.closePath()
      break
    }
    case 'laurel': {
      ctx.moveTo(-r, 0)
      for (let i = 0; i <= 10; i += 1) {
        const a = (i / 10) * Math.PI
        const wave = Math.sin(i * 1.2) * r * 0.16
        ctx.lineTo(-r + (a / Math.PI) * r * 2, -wave)
      }
      ctx.moveTo(-r, 0)
      for (let i = 0; i <= 10; i += 1) {
        const a = (i / 10) * Math.PI
        const wave = Math.sin(i * 1.2) * r * 0.16
        ctx.lineTo(-r + (a / Math.PI) * r * 2, wave)
      }
      break
    }
    case 'palm': {
      ctx.moveTo(-r * 0.7, r)
      ctx.lineTo(0, -r * 0.4)
      const s = r * 0.5
      for (let i = -2; i <= 2; i += 1) {
        ctx.moveTo(0, -r * 0.35)
        const tipX = Math.sin((i / 2) * 1.1) * s
        const tipY = -r * 0.35 - Math.cos((i / 2) * 1.1) * s
        ctx.quadraticCurveTo(i * s * 0.4, -r * 0.1, tipX, tipY)
      }
      break
    }
    case 'helicopter': {
      // simplified rotor silhouette
      ctx.moveTo(-r, -r * 0.3)
      ctx.lineTo(r, -r * 0.3)
      ctx.moveTo(0, r)
      ctx.lineTo(0, -r * 0.3)
      ctx.moveTo(-r * 0.32, r)
      ctx.lineTo(r * 0.32, r)
      ctx.moveTo(-r * 0.55, -r * 0.3)
      ctx.lineTo(-r * 0.55, r * 0.05)
      ctx.quadraticCurveTo(0, r * 0.2, r * 0.55, r * 0.05)
      ctx.lineTo(r * 0.55, -r * 0.3)
      break
    }
    case 'radio': {
      ctx.moveTo(-r, r)
      ctx.lineTo(-r * 0.28, r * 0.5)
      ctx.lineTo(-r * 0.28, -r * 0.4)
      ctx.lineTo(r * 0.28, -r * 0.4)
      ctx.lineTo(r * 0.28, r * 0.5)
      ctx.lineTo(r, r)
      ctx.closePath()
      ctx.moveTo(-r * 0.5, r * 0.25)
      ctx.lineTo(r * 0.5, r * 0.25)
      break
    }
    case 'fish': {
      ctx.moveTo(-r, 0)
      ctx.lineTo(r, -r * 0.5)
      ctx.lineTo(r * 0.4, 0)
      ctx.lineTo(r, r * 0.5)
      ctx.closePath()
      break
    }
    default:
      break
  }
  ctx.stroke()
  if (id === 'star') {
    ctx.fillStyle = 'rgba(236,238,242,0.25)'
    ctx.fill()
  }
  ctx.restore()
}