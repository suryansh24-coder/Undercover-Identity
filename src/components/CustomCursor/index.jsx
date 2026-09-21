import { useEffect, useRef } from 'react'
import { useReducedMotion, useFinePointer } from '../../hooks/useReducedMotion'

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], input, select, textarea, label[data-cursor], [data-cursor="hover"], [draggable="true"], [contenteditable="true"]'

/**
 * Refined dual-element cursor: a fast dot plus a lagging ring.
 * Only renders on precise pointers and respects reduced motion.
 * The native cursor is hidden via .has-cursor (JS-gated), so the
 * experience always degrades gracefully.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const reduced = useReducedMotion()
  const fine = useFinePointer()

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (reduced || !fine || !dot || !ring) return undefined

    let raf = 0
    let hovering = false
    let pressing = false
    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }

    document.documentElement.classList.add('has-cursor')

    const onMove = (event) => {
      pos.x = event.clientX
      pos.y = event.clientY
    }

    const onHoverIn = (event) => {
      if (event.target.closest && event.target.closest(INTERACTIVE_SELECTOR)) hovering = true
    }
    const onHoverOut = (event) => {
      if (event.target.closest && event.target.closest(INTERACTIVE_SELECTOR)) hovering = false
    }
    const onDown = () => (pressing = true)
    const onUp = () => (pressing = false)

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.22
      cur.y += (pos.y - cur.y) * 0.22
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ring.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`

      const size = hovering ? 36 : 26
      ring.style.width = `${size}px`
      ring.style.height = `${size}px`
      dot.style.transform += ` scale(${pressing ? 0.6 : 1})`
      ring.dataset.mode = hovering ? 'hover' : pressing ? 'pressed' : ''

      raf = requestAnimationFrame(tick)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onHoverIn)
    document.addEventListener('pointerout', onHoverOut)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    raf = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onHoverIn)
      document.removeEventListener('pointerout', onHoverOut)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [reduced, fine])

  if (reduced || !fine) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}