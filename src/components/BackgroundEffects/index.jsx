import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Immersive layered background. Pure decoration — never receives
 * pointer events and is hidden from assistive tech.
 */
export default function BackgroundEffects() {
  return (
    <div className="bg-root" aria-hidden="true" data-export-skip>
      <div className="bg-veil" />
      <div className="bg-grid" />
      <div className="bg-grid-front" />
      <div className="bg-glow bg-glow--a" />
      <div className="bg-glow bg-glow--b" />
      <div className="bg-glow bg-glow--c" />
      <div className="bg-scans" />
      <div className="bg-beam" />
      <Particles />
      <div className="bg-vignette" />
      <div className="bg-grain" />
    </div>
  )
}

function Particles() {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    if (reduced) return undefined

    const ctx = canvas.getContext('2d')
    let raf = 0
    let width = 0
    let height = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const COUNT = Math.min(34, Math.floor((window.innerWidth * window.innerHeight) / 36000))

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      speed: 0.006 + Math.random() * 0.018,
      drift: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      gold: Math.random() > 0.55,
    }))

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y -= p.speed * 0.01
        p.x += Math.sin(t * 0.0006 + p.phase) * 0.0004
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }
        const alpha = 0.14 + 0.22 * Math.abs(Math.sin(t * 0.001 + p.phase))
        ctx.beginPath()
        ctx.arc(p.x * width, p.y * height, p.r * dpr, 0, Math.PI * 2)
        ctx.fillStyle = p.gold
          ? `rgba(201,168,106,${alpha})`
          : `rgba(236,238,242,${alpha * 0.8})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="bg-particles" aria-hidden="true" />
}