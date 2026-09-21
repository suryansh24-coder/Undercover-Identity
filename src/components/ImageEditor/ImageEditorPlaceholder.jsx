import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Scene, Reveal } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'
import Icon from '../common/Icon'
import { renderComposite, loadImageElement } from './renderEngine'
import { drawSticker } from './presets'
import {
  FILTERS,
  FRAMES,
  STICKERS,
  RESIZE_PRESETS,
  findResizePreset,
} from './presets'

const TOOLS = [
  { id: 'crop', icon: 'crop', label: 'Crop' },
  { id: 'resize', icon: 'resize', label: 'Resize' },
  { id: 'filter', icon: 'sliders', label: 'Filter' },
  { id: 'draw', icon: 'pen', label: 'Draw' },
  { id: 'text', icon: 'type', label: 'Text' },
  { id: 'sticker', icon: 'sparkle', label: 'Sticker' },
  { id: 'frame', icon: 'frame', label: 'Frame' },
]

const INK_COLORS = ['#edeef2', '#c9a86a', '#b3131f', '#0c0d11']
const MAX_DISPLAY_WIDTH = 980
const MAX_EXPORT_WIDTH = 2400
const DEFAULT_TEXT = 'REDACTED'

let actionKeyCounter = 0
const nextKey = () => `a-${++actionKeyCounter}`

export default function ImageEditorPlaceholder({ source, onSave, onCancel }) {
  const [baseSrc, setBaseSrc] = useState(source)
  const [actions, setActions] = useState([])
  const [activeTool, setActiveTool] = useState('crop')
  const [resizeId, setResizeId] = useState('standard')
  const [cropRect, setCropRect] = useState(null)
  const [draftKey, setDraftKey] = useState(null)
  const [strokeColor, setStrokeColor] = useState('#c9a86a')
  const [strokeWidth, setStrokeWidth] = useState(0.012)
  const [textColor, setTextColor] = useState('#edeef2')
  const [textSize, setTextSize] = useState(0.06)
  const [stickerId, setStickerId] = useState('crosshair')
  const [stickerSize, setStickerSize] = useState(0.18)
  const [stickerRotation, setStickerRotation] = useState(0)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(true)

  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const baseImageRef = useRef(null)
  const dragRef = useRef(null)
  const liveStrokeRef = useRef(null)
  const rafRef = useRef(0)

  const baseSize = useMemo(() => {
    const img = baseImageRef.current
    if (img && img.naturalWidth) return { w: img.naturalWidth, h: img.naturalHeight }
    return { w: 1, h: 1 }
  }, [])

  const resizePreset = findResizePreset(resizeId)
  const scale = resizePreset.scale
  const outputW = Math.round(baseSize.w * scale)
  const outputH = Math.round(baseSize.h * scale)

  const renderNow = useCallback(() => {
    const canvas = canvasRef.current
    const img = baseImageRef.current
    if (!canvas || !img || !box.w) return
    canvas.width = box.w
    canvas.height = box.h
    const ctx = canvas.getContext('2d')
    const liveStroke = liveStrokeRef.current
    const allActions = liveStroke
      ? actions.concat([{ type: 'stroke', points: liveStroke, color: strokeColor, size: strokeWidth }])
      : actions
    renderComposite(ctx, {
      image: img,
      width: box.w,
      height: box.h,
      actions: allActions,
    })
  }, [actions, box, strokeColor, strokeWidth])

  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(renderNow)
  }, [renderNow])

  useEffect(() => {
    let alive = true
    setBusy(true)
    loadImageElement(baseSrc)
      .then((img) => {
        if (!alive) return
        baseImageRef.current = img
        setBusy(false)
      })
      .catch(() => {
        if (!alive) return
        setBusy(false)
      })
    return () => {
      alive = false
    }
  }, [baseSrc])

  useEffect(() => {
    const el = boxRef.current
    if (!el) return undefined
    const observer = new ResizeObserver(() => {
      if (!baseImageRef.current) return
      const avail = Math.max(240, el.clientWidth - 48)
      const w = Math.min(MAX_DISPLAY_WIDTH, avail, outputW)
      const h = Math.round((w * outputH) / Math.max(1, outputW))
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [outputW, outputH, baseSrc])

  useEffect(() => {
    if (!busy && box.w) scheduleRender()
  }, [busy, box, scheduleRender])

  const addAction = useCallback((action) => {
    setActions((prev) => [...prev, { ...action, key: nextKey() }])
  }, [])

  const undo = useCallback(() => {
    setActions((prev) => {
      const removed = prev.at(-1)
      if (removed?.type === 'crop' && removed.previousBase) {
        setBaseSrc(removed.previousBase)
      }
      return prev.slice(0, -1)
    })
    setDraftKey(null)
  }, [])

  const resetAll = useCallback(() => {
    setActions([])
    setBaseSrc(source)
    setCropRect(null)
    setDraftKey(null)
    setResizeId('standard')
  }, [source])

  const applyCrop = useCallback(() => {
    if (!cropRect) return
    const img = baseImageRef.current
    if (!img) return
    const cw = Math.max(2, Math.round(cropRect.w * img.naturalWidth))
    const ch = Math.max(2, Math.round(cropRect.h * img.naturalHeight))
    const sx = Math.round(cropRect.x * img.naturalWidth)
    const sy = Math.round(cropRect.y * img.naturalHeight)
    const target = document.createElement('canvas')
    target.width = cw
    target.height = ch
    const ctx = target.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch)
    const previousBase = baseSrc
    setActions((prev) => [...prev, { type: 'crop', key: nextKey(), previousBase }])
    setBaseSrc(target.toDataURL('image/jpeg', 0.95))
    setCropRect(null)
  }, [cropRect, baseSrc])

  const clamp01 = (v) => Math.min(1, Math.max(0, v))

  const toNormalized = (event) => {
    const rect = boxRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  const hitTest = useCallback(
    (point) => {
      for (let i = actions.length - 1; i >= 0; i -= 1) {
        const a = actions[i]
        if (a.type !== 'text' && a.type !== 'sticker') continue
        const radius = a.type === 'text' ? a.size * 0.4 : a.size * 0.62
        if (Math.hypot(point.x - a.x, point.y - a.y) < radius) {
          return { item: a, index: i }
        }
      }
      return null
    },
    [actions]
  )

  const edgeHit = useCallback(
    (p) => {
      if (!cropRect) return null
      const { x, y, w, h } = cropRect
      const t = 0.035
      const near = (px, py) => Math.abs(p.x - px) < t && Math.abs(p.y - py) < t
      if (near(x, y)) return 'nw'
      if (near(x + w, y)) return 'ne'
      if (near(x, y + h)) return 'sw'
      if (near(x + w, y + h)) return 'se'
      return null
    },
    [cropRect]
  )

  const onPointerDown = useCallback(
    (event) => {
      event.preventDefault()
      const p = toNormalized(event)
      if (activeTool === 'draw') {
        liveStrokeRef.current = [p]
        dragRef.current = { mode: 'stroke' }
        scheduleRender()
        return
      }
      if (activeTool === 'crop') {
        const edge = edgeHit(p)
        if (cropRect && edge) {
          dragRef.current = { mode: edge, start: p, orig: { ...cropRect } }
        } else if (
          cropRect &&
          p.x >= cropRect.x &&
          p.x <= cropRect.x + cropRect.w &&
          p.y >= cropRect.y &&
          p.y <= cropRect.y + cropRect.h
        ) {
          dragRef.current = { mode: 'move', start: p, orig: { ...cropRect } }
        } else {
          dragRef.current = { mode: 'create', start: p }
        }
        return
      }
      if (activeTool === 'text' || activeTool === 'sticker') {
        const hit = hitTest({ x: clamp01(p.x), y: clamp01(p.y) })
        if (hit) {
          dragRef.current = { mode: 'moveItem', start: p, item: hit.item }
          setDraftKey(hit.item.key)
        } else {
          const action =
            activeTool === 'text'
              ? {
                  type: 'text',
                  content: DEFAULT_TEXT,
                  x: clamp01(p.x),
                  y: clamp01(p.y),
                  size: textSize,
                  color: textColor,
                  rotation: 0,
                }
              : {
                  type: 'sticker',
                  shape: stickerId,
                  x: clamp01(p.x),
                  y: clamp01(p.y),
                  size: stickerSize,
                  rotation: stickerRotation,
                }
          const key = nextKey()
          setActions((prev) => [...prev, { ...action, key }])
          setDraftKey(key)
        }
      }
    },
    [
      activeTool,
      cropRect,
      edgeHit,
      hitTest,
      scheduleRender,
      stickerId,
      stickerSize,
      stickerRotation,
      textColor,
      textSize,
    ]
  )

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragRef.current
      if (!drag) return
      const p = toNormalized(event)

      if (drag.mode === 'stroke') {
        liveStrokeRef.current.push(p)
        scheduleRender()
        return
      }
      if (drag.mode === 'create') {
        const x = clamp01(Math.min(drag.start.x, p.x))
        const y = clamp01(Math.min(drag.start.y, p.y))
        const w = clamp01(Math.abs(p.x - drag.start.x))
        const h = clamp01(Math.abs(p.y - drag.start.y))
        setCropRect({ x, y, w, h })
        return
      }
      if (drag.mode === 'move') {
        setCropRect({
          ...drag.orig,
          x: clamp01(drag.orig.x + (p.x - drag.start.x)),
          y: clamp01(drag.orig.y + (p.y - drag.start.y)),
        })
        return
      }
      if (['nw', 'ne', 'sw', 'se'].includes(drag.mode)) {
        let { x, y, w, h } = drag.orig
        const nx = clamp01(p.x)
        const ny = clamp01(p.y)
        if (drag.mode.includes('e')) w = clamp01(nx - x)
        if (drag.mode.includes('w')) {
          w = clamp01(x + w - nx)
          x = clamp01(nx)
        }
        if (drag.mode.includes('s')) h = clamp01(ny - y)
        if (drag.mode.includes('n')) {
          h = clamp01(y + h - ny)
          y = clamp01(ny)
        }
        setCropRect({ x: clamp01(x), y: clamp01(y), w: Math.max(0.03, w), h: Math.max(0.03, h) })
        return
      }
      if (drag.mode === 'moveItem') {
        const item = drag.item
        setActions((prev) =>
          prev.map((a) =>
            a.key === item.key
              ? { ...a, x: clamp01(a.x + (p.x - drag.start.x)), y: clamp01(a.y + (p.y - drag.start.y)) }
              : a
          )
        )
        drag.start = p
      }
    },
    [scheduleRender]
  )

  const onPointerUp = useCallback(
    (event) => {
      void event
      const drag = dragRef.current
      if (!drag) return
      if (drag.mode === 'stroke') {
        const points = liveStrokeRef.current
        liveStrokeRef.current = null
        dragRef.current = null
        if (points && points.length >= 2) {
          addAction({
            type: 'stroke',
            points: points.map((p) => ({ ...p })),
            color: strokeColor,
            size: strokeWidth,
          })
        }
        scheduleRender()
        return
      }
      dragRef.current = null
    },
    [addAction, scheduleRender, strokeColor, strokeWidth]
  )

  const save = async () => {
    if (!baseImageRef.current) return
    setSaving(true)
    try {
      cancelAnimationFrame(rafRef.current)
      const expScale = Math.min(MAX_EXPORT_WIDTH / baseSize.w, scale)
      const w = Math.round(baseSize.w * expScale)
      const h = Math.round(baseSize.h * expScale)
      const out = document.createElement('canvas')
      out.width = w
      out.height = h
      renderComposite(out.getContext('2d'), {
        image: baseImageRef.current,
        width: w,
        height: h,
        actions,
      })
      const dataUrl = out.toDataURL('image/jpeg', 0.94)
      onSave(dataUrl, actions.length > 0 || scale !== 1)
    } catch {
      onSave(baseSrc, false)
    } finally {
      setSaving(false)
    }
  }

  const hintByTool = {
    crop: cropRect ? 'Drag the frame · resize at the corners · then APPLY CROP' : 'Click and drag to frame the subject',
    draw: 'Draw a freehand ink stroke over the subject',
    text: 'Click the image to place redacted text · drag to move it',
    sticker: 'Choose an emblem, then click the image to stamp it',
    resize: 'Choose the output resolution baked into the saved image',
    filter: 'Apply a tonal treatment to the photograph',
    frame: 'Finish the photo inside a document frame',
  }

  return (
    <Scene className="editor-scene scene--wide" label="Step two of three — modify your identity photo">
      <div className="scene-tools">
        <button type="button" className="back-link" data-cursor="hover" onClick={onCancel}>
          <Icon name="chevronL" size={14} /> Return
        </button>
      </div>

      <div className="editor-shell">
        <Reveal>
          <header className="editor-head">
            <div className="editor-head-copy">
              <p className="section-meta-index mono micro gold">STEP 02 / 03</p>
              <h2 className="editor-title">Modify Your Identity</h2>
              <p className="editor-sub muted">Refine the visual identity attached to your classified profile.</p>
            </div>
            <div className="editor-head-actions">
              <ActionButton variant="primary" size="md" icon="check" magnetic busy={saving} onClick={save}>
                Save Image
              </ActionButton>
            </div>
          </header>
        </Reveal>

        <Reveal delay={120}>
          <div className="editor-layout">
            <aside className="editor-tools" aria-label="Image tools">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  data-cursor="hover"
                  className={`editor-tool ${activeTool === tool.id ? 'is-active' : ''}`}
                  onClick={() => setActiveTool(tool.id)}
                  aria-pressed={activeTool === tool.id}
                  title={tool.label}
                >
                  <Icon name={tool.icon} size={17} />
                  <span>{tool.label}</span>
                </button>
              ))}
              <span className="editor-tools-sep" aria-hidden="true" />
              <button type="button" className="editor-tool" data-cursor="hover" onClick={undo} disabled={actions.length === 0} title="Undo last edit">
                <Icon name="undo" size={17} />
                <span>Undo</span>
              </button>
              <button
                type="button"
                className="editor-tool"
                data-cursor="hover"
                onClick={resetAll}
                disabled={actions.length === 0 && resizeId === 'standard'}
                title="Reset image to original"
              >
                <Icon name="refresh" size={17} />
                <span>Reset</span>
              </button>
            </aside>

            <div className="editor-stage">
              <div className="editor-frame-bar" aria-hidden="true">
                <span className="mono micro">
                  SUBJECT {baseSize.w}×{baseSize.h} · {resizePreset.label.toLowerCase()}
                </span>
                <span className="mono micro gold">ENCRYPTED FEED</span>
              </div>
              <div className="editor-box" ref={boxRef}>
                {busy ? (
                  <div className="editor-loading" role="status">
                    <span className="pulse" aria-hidden="true" />
                    <span className="mono">LOADING SUBJECT…</span>
                  </div>
                ) : (
                  <div className="editor-canvas-box" style={{ width: box.w, height: box.h }} data-tool={activeTool}>
                    <canvas ref={canvasRef} className="editor-canvas" />
                    {activeTool === 'crop' && cropRect ? <CropOverlay rect={cropRect} box={box} /> : null}
                    {activeTool === 'crop' && !cropRect ? <CropCursorGuide /> : null}
                    <div
                      className="editor-capture"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerLeave={onPointerUp}
                    />
                    <div className="editor-scanline" aria-hidden="true" />
                  </div>
                )}
                <p className="editor-hint mono micro">
                  <Icon name="info" size={12} /> {hintByTool[activeTool]}
                </p>
              </div>
            </div>

            <aside className="editor-panel" aria-label={`${TOOLS.find((t) => t.id === activeTool)?.label} settings`}>
              {activeTool === 'crop' && (
                <ToolPanel title="Crop">
                  <PanelHint>
                    {cropRect
                      ? `Keeps ${Math.round(cropRect.w * 100)}% × ${Math.round(cropRect.h * 100)}% of the frame`
                      : 'Frame the subject you want to keep, then apply the crop.'}
                  </PanelHint>
                  <div className="editor-panel-row">
                    <ActionButton variant="ghost" size="sm" onClick={() => setCropRect(null)} disabled={!cropRect}>
                      Reset Crop
                    </ActionButton>
                    <ActionButton variant="primary" size="sm" icon="check" onClick={applyCrop} disabled={!cropRect}>
                      Apply Crop
                    </ActionButton>
                  </div>
                </ToolPanel>
              )}
              {activeTool === 'resize' && (
                <ToolPanel title="Resize">
                  <div className="editor-segmented" role="radiogroup" aria-label="Output resolution">
                    {RESIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        role="radio"
                        aria-checked={resizeId === preset.id}
                        data-cursor="hover"
                        className={`editor-segment mono ${resizeId === preset.id ? 'is-active' : ''}`}
                        onClick={() => setResizeId(preset.id)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <PanelHint>
                    Exported at {outputW}×{outputH}px{scale !== 1 ? ` · ${resizePreset.label.toLowerCase()}` : ''}.
                  </PanelHint>
                </ToolPanel>
              )}
              {activeTool === 'filter' && (
                <ToolPanel title="Filter">
                  <ToneChips value={currentFilter(actions)} onChange={(id) => pushFilter(setActions, id)} />
                </ToolPanel>
              )}
              {activeTool === 'draw' && (
                <ToolPanel title="Draw">
                  <Swatches value={strokeColor} onChange={setStrokeColor} />
                  <Slider label="Ink weight" min={0.004} max={0.03} step={0.001} value={strokeWidth} onChange={setStrokeWidth} />
                </ToolPanel>
              )}
              {activeTool === 'text' && (
                <ToolPanel title="Text">
                  <TextDraft actions={actions} draftKey={draftKey} setActions={setActions} setDraftKey={setDraftKey} />
                  <Swatches value={textColor} onChange={setTextColor} />
                  <Slider label="Size" min={0.02} max={0.16} step={0.002} value={textSize} onChange={setTextSize} />
                </ToolPanel>
              )}
              {activeTool === 'sticker' && (
                <ToolPanel title="Sticker">
                  <div className="editor-sticker-grid">
                    {STICKERS.map((stk) => (
                      <button
                        key={stk.id}
                        type="button"
                        data-cursor="hover"
                        className={`editor-sticker ${stickerId === stk.id ? 'is-active' : ''}`}
                        onClick={() => setStickerId(stk.id)}
                        aria-pressed={stickerId === stk.id}
                        title={stk.label}
                      >
                        <MiniSticker id={stk.id} />
                      </button>
                    ))}
                  </div>
                  <Slider label="Size" min={0.06} max={0.4} step={0.01} value={stickerSize} onChange={setStickerSize} />
                  <Slider label="Rotation" min={-1.5} max={1.5} step={0.02} value={stickerRotation} onChange={setStickerRotation} />
                  <PanelHint>Click the image to stamp the emblem.</PanelHint>
                </ToolPanel>
              )}
              {activeTool === 'frame' && (
                <ToolPanel title="Frame">
                  <div className="editor-frame-grid">
                    {FRAMES.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        data-cursor="hover"
                        className={`editor-frame-chip mono ${currentFrame(actions) === frame.id ? 'is-active' : ''}`}
                        onClick={() => pushFrame(setActions, frame.id)}
                      >
                        {frame.label}
                      </button>
                    ))}
                  </div>
                  <PanelHint>The frame is baked into the exported photograph.</PanelHint>
                </ToolPanel>
              )}
            </aside>
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}

function currentFilter(actions) {
  return actions.filter((a) => a.type === 'filter').at(-1)?.id || 'none'
}
function pushFilter(setActions, id) {
  setActions((prev) => [
    ...prev.filter((a) => a.type !== 'filter'),
    { type: 'filter', id, key: nextKey() },
  ])
}

function currentFrame(actions) {
  return actions.filter((a) => a.type === 'frame').at(-1)?.id || 'none'
}
function pushFrame(setActions, id) {
  setActions((prev) => [
    ...prev.filter((a) => a.type !== 'frame'),
    { type: 'frame', id, key: nextKey() },
  ])
}

function ToolPanel({ title, children }) {
  return (
    <div className="tool-panel">
      <p className="tool-panel-title mono">{title}</p>
      <div className="tool-panel-body">{children}</div>
    </div>
  )
}

function PanelHint({ children }) {
  return <p className="panel-hint mono micro">{children}</p>
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <label className="editor-slider">
      <span className="field-label mono">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function Swatches({ value, onChange }) {
  return (
    <div className="editor-swatches" role="radiogroup" aria-label="Color">
      {INK_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          data-cursor="hover"
          className={`editor-swatch ${value === color ? 'is-active' : ''}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  )
}

function ToneChips({ value, onChange }) {
  return (
    <div className="editor-tone-grid" role="radiogroup" aria-label="Filter preset">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="radio"
          aria-checked={value === filter.id}
          data-cursor="hover"
          className={`editor-tone mono ${value === filter.id ? 'is-active' : ''}`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function TextDraft({ actions, draftKey, setActions, setDraftKey }) {
  const draft = actions.find((a) => a.key === draftKey)
  const update = (patch) => {
    if (!draft) return
    setActions((prev) => prev.map((a) => (a.key === draft.key ? { ...a, ...patch } : a)))
  }
  const removeDraft = () => {
    if (!draft) return
    setActions((prev) => prev.filter((a) => a.key !== draft.key))
    setDraftKey(null)
  }
  return (
    <>
      <label className="editor-text-editor">
        <span className="field-label mono">Stamped Text</span>
        <input
          type="text"
          className="field-input"
          value={draft?.content ?? ''}
          maxLength={22}
          placeholder="Place text on the image first"
          disabled={!draft}
          onChange={(event) => update({ content: event.target.value.toUpperCase() })}
        />
      </label>
      {draft ? (
        <div className="editor-panel-row">
          <ActionButton variant="ghost" size="sm" icon="x" onClick={removeDraft}>
            Remove
          </ActionButton>
        </div>
      ) : (
        <PanelHint>Click the image to place a text stamp, then edit it here.</PanelHint>
      )}
    </>
  )
}

function MiniSticker({ id }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = 2
    canvas.width = 44 * dpr
    canvas.height = 44 * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, 44, 44)
    ctx.translate(22, 22)
    ctx.strokeStyle = '#c9a86a'
    ctx.lineWidth = 1.6
    drawSticker(ctx, id, 0, 0, 28)
  }, [id])
  return <canvas ref={ref} style={{ width: 44, height: 44 }} aria-hidden="true" />
}

function CropOverlay({ rect, box }) {
  const x = rect.x * box.w
  const y = rect.y * box.h
  const w = rect.w * box.w
  const h = rect.h * box.h
  const shadeLeft = rect.x * box.w
  const shadeRight = box.w - (x + w)
  const shadeTop = rect.y * box.h
  const shadeBottom = box.h - (y + h)
  return (
    <div className="crop-overlay">
      <i className="crop-shade" style={{ top: 0, left: 0, width: box.w, height: shadeTop }} />
      <i className="crop-shade" style={{ top: y + h, left: 0, width: box.w, height: shadeBottom }} />
      <i className="crop-shade" style={{ top: y, left: 0, width: shadeLeft, height: h }} />
      <i className="crop-shade" style={{ top: y, left: x + w, width: shadeRight, height: h }} />
      <div className="crop-select" style={{ left: x, top: y, width: w, height: h }}>
        <i className="crop-handle crop-handle--nw" />
        <i className="crop-handle crop-handle--ne" />
        <i className="crop-handle crop-handle--sw" />
        <i className="crop-handle crop-handle--se" />
        <div className="crop-tris crop-tris--tl" />
        <div className="crop-tris crop-tris--tr" />
        <div className="crop-tris crop-tris--bl" />
        <div className="crop-tris crop-tris--br" />
      </div>
    </div>
  )
}

function CropCursorGuide() {
  return (
    <div className="crop-guide" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}