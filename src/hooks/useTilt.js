import { useRef, useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * 3D perspective tilt that follows the pointer. The element settles
 * naturally when idle. Disabled under reduced motion and on touch.
 */
export function useTilt({ max = 7, scale = 1.02, enabled = true } = {}) {
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
    let lost = false

    const onMove = (event) => {
      const rect = node.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      target.x = x
      target.y = y
      lost = false
    }

    const onLeave = () => {
      lost = true
    }

    const onEnter = () => {
      lost = false
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.09
      current.y += (target.y - current.y) * 0.09
      const tx = lost ? 0 : current.y * -max
      const ty = lost ? 0 : current.x * max
      const s = lost ? 1 : scale
      node.style.transform = `perspective(1100px) rotateX(${tx.toFixed(3)}deg) rotateY(${ty.toFixed(3)}deg) scale(${s})`
      raf = requestAnimationFrame(tick)
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerenter', onEnter)
    node.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerenter', onEnter)
      node.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [max, scale, enabled, reduced])

  return ref
}