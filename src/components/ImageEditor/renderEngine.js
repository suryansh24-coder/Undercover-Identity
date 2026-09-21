import { filterCss, drawFrame, drawSticker } from './presets'

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The editor could not decode the image.'))
    img.src = src
  })
}

/** Normalized-line resolution helpers: line widths scale with canvas. */

function applyFilter(ctx, actions, _width) {
  const filterAction = actions.filter((a) => a.type === 'filter').at(-1)
  const css = filterCss(filterAction?.id || 'none')
  if (css !== 'none') {
    ctx.filter = css
    return () => {
      ctx.filter = 'none'
    }
  }
  return () => {}
}

function drawStrokes(ctx, actions, width, height) {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const action of actions) {
    if (action.type !== 'stroke' || !action.points || action.points.length < 2) continue
    ctx.strokeStyle = action.color
    ctx.lineWidth = Math.max(1.5, action.size * width)
    ctx.beginPath()
    action.points.forEach((p, i) => {
      const x = p.x * width
      const y = p.y * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }
  ctx.restore()
}

function drawTexts(ctx, actions, width, height) {
  for (const action of actions) {
    if (action.type !== 'text' || !action.content) continue
    const size = action.size * width
    const cx = action.x * width
    const cy = action.y * height
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(action.rotation || 0)
    ctx.font = `${size}px 'Anton', 'Arial Narrow', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = Math.max(1.5, size * 0.09)
    ctx.strokeStyle = 'rgba(12,13,17,0.85)'
    ctx.strokeText(action.content, 0, 0)
    ctx.fillStyle = action.color || '#edeef2'
    ctx.fillText(action.content, 0, 0)
    ctx.restore()
  }
}

function drawStickers(ctx, actions, width, height) {
  for (const action of actions) {
    if (action.type !== 'sticker') continue
    ctx.save()
    ctx.translate(action.x * width, action.y * height)
    ctx.rotate(action.rotation || 0)
    drawSticker(ctx, action.shape, 0, 0, action.size * width)
    ctx.restore()
  }
}

export function drawFrameTo(ctx, frameId, width, height) {
  drawFrame(ctx, width, height, frameId)
}

/**
 * Replays the immutable action list onto a canvas. This is the single
 * source of truth for both the live preview and the export render.
 */
export function renderComposite(ctx, { image, width, height, actions = [] }) {
  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // shadow under image on very light frames
  ctx.fillStyle = '#101116'
  ctx.fillRect(0, 0, width, height)

  if (image) {
    ctx.drawImage(image, 0, 0, width, height)
    const restoreFilter = applyFilter(ctx, actions, width)
    ctx.drawImage(image, 0, 0, width, height)
    restoreFilter()
  }

  drawStrokes(ctx, actions, width, height)
  drawTexts(ctx, actions, width, height)
  drawStickers(ctx, actions, width, height)

  const filterAction = actions.filter((a) => a.type === 'frame').at(-1)
  drawFrameTo(ctx, filterAction?.id || 'none', width, height)
  ctx.restore()
}