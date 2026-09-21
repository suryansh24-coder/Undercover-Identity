import { useEffect, useMemo, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useOptionalSound } from '../../hooks/useOptionalSound'

const OVERLAY_SCRIPTS = {
  'enter-system': {
    lines: [
      'ACCESS REQUESTED',
      'ESTABLISHING SECURE CHANNEL',
      'BIOMETRIC CHANNEL OPEN',
      'INTELLIGENCE DATABASE CONNECTED',
      'ENCRYPTION VERIFIED',
      'ACCESS GRANTED',
      'WELCOME, OPERATIVE.',
    ],
    onComplete: ['GO', 'security'],
  },
}

/**
 * Full-screen cinematic interception: types each system line in
 * sequence, flashes, then hands off to the next stage.
 */
export default function TransitionOverlay() {
  const { state, actions } = useIdentity()
  const reduced = useReducedMotion()
  const play = useOptionalSound(state.soundEnabled)
  const script = useMemo(
    () => OVERLAY_SCRIPTS[state.overlay] || OVERLAY_SCRIPTS['enter-system'],
    [state.overlay]
  )

  const [lineIndex, setLineIndex] = useState(0)
  const [exiting, setExiting] = useState(false)
  const timers = useRef([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (!state.overlay) return undefined
    doneRef.current = false
    setLineIndex(0)

    const perLine = 460
    const force = script.lines.length * perLine
    const fastest = (reduced ? Math.min(160, perLine) : perLine) * script.lines.length

    for (let i = 1; i < script.lines.length; i += 1) {
      timers.current.push(window.setTimeout(() => setLineIndex(i), i * perLine))
    }
    play('enter')

    const finishTimer = window.setTimeout(() => {
      if (doneRef.current) return
      doneRef.current = true
      setExiting(true)
      play('granted')
      const completeTimer = window.setTimeout(() => {
        const [type, arg] = script.onComplete
        if (type === 'GO') actions.go(arg)
        setExiting(false)
      }, reduced ? 60 : 480)
      timers.current.push(completeTimer)
    }, Math.max(fastest, force - 260))
    timers.current.push(finishTimer)

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [state.overlay, script, actions, play, reduced])

  if (!state.overlay) return null

  const current = script.lines[lineIndex]

  return (
    <div className={`transition-overlay ${exiting ? 'transition-overlay--out' : ''}`} role="status" aria-live="polite">
      <div className="transition-console">
        <p className="transition-line--dim mono">UNDERCOVER IDENTITY · SECURE LINK</p>
        <div style={{ height: 'var(--sp-5)' }} />
        <p key={lineIndex} className="transition-line">
          {current}
        </p>
        <div className="transition-progress" aria-hidden="true">
          <i style={{ width: `${((lineIndex + 1) / script.lines.length) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}