import { useRef, useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Magnetic pull — the button drifts toward the cursor within
 * a bounded radius and springs back. Pure decoration; the real
 * action stays on the actual pointer target.
 */
export function useMagnetic({ strength = 0.32, enabled = true } = {}) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || reduced || !enabled) {
      if (node) node.style.transform = ''
      return undefined
    }

    let raf = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const onMove = (event) => {
      const rect = node.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.x = (event.clientX - cx) * strength
      target.y = (event.clientY - cy) * strength
    }

    const onLeave = () => {
      target.x = 0
      target.y = 0
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.16
      current.y += (target.y - current.y) * 0.16
      node.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [strength, enabled, reduced])

  return ref
}