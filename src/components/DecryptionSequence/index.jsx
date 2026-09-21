import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Scene } from '../common/Scene'
import Icon from '../common/Icon'

const CLASSIFY_LINES = [
  'IDENTITY PROFILE RECEIVED',
  'VERIFYING COVER PROFILE',
  'ASSIGNING CLEARANCE',
  'GENERATING CASE NUMBER',
  'CLASSIFICATION COMPLETE',
]

const DECRYPT_LINES = [
  'ACCESSING CLASSIFIED DATABASE...',
  'VERIFYING IDENTITY...',
  'DECRYPTING COVER PROFILE...',
  'VALIDATING IMAGE INTEGRITY...',
  'GENERATING CASE FILE...',
  'ENCRYPTION VERIFIED...',
]

const REVEAL_LINE = 'IDENTITY CONFIRMED'
const LINES = [...CLASSIFY_LINES, ...DECRYPT_LINES, REVEAL_LINE]
const CLASSIFY_COUNT = CLASSIFY_LINES.length

const CLASSIFY_MS = 430
const DECRYPT_MS = 470
const REVEAL_HOLD_MS = 1350
const GLITCH_BURSTS = 5

function lineDuration(index) {
  return index < CLASSIFY_COUNT ? CLASSIFY_MS : DECRYPT_MS
}

function fragmentsFor() {
  const hex = []
  for (let i = 0; i < 12; i += 1) {
    const bytes = new Uint8Array(5)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
    else for (let j = 0; j < bytes.length; j += 1) bytes[j] = Math.floor(Math.random() * 256)
    hex.push(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '))
  }
  return hex
}

/**
 * Two-phase cinematic pass. The submitted cover profile is first
 * CLASSIFIED, then the dossier is DECRYPTED, ending in a "MATCH FOUND"
 * reveal before the classified dossier materializes. Skippable with the
 * on-screen action, the Escape key, or an automatic fast path under
 * reduced motion.
 */
export default function DecryptionSequence({ onComplete }) {
  const { state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)
  const reduced = useReducedMotion()
  const factor = reduced ? 0.3 : 1

  const [lineIndex, setLineIndex] = useState(0)
  const [glitching, setGlitching] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [canSkip, setCanSkip] = useState(false)

  const fragments = useMemo(() => fragmentsFor(), [])
  const timers = useRef([])
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    play('granted')
    const t = window.setTimeout(() => onComplete(), reduced ? 60 : 460)
    timers.current.push(t)
  }, [onComplete, play, reduced])

  const skip = useCallback(() => {
    if (doneRef.current || !canSkip) return
    setLineIndex(LINES.length)
    setRevealed(true)
    setGlitching(false)
    play('granted')
    const t = window.setTimeout(() => {
      if (doneRef.current) return
      doneRef.current = true
      timers.current.forEach((x) => window.clearTimeout(x))
      timers.current = []
      onComplete()
    }, reduced ? 60 : 420)
    timers.current.push(t)
  }, [canSkip, onComplete, play, reduced])

  useEffect(() => {
    play('classify')

    let acc = 0
    LINES.forEach((_, i) => {
      if (i === 0) return
      acc += lineDuration(i - 1)
      timers.current.push(
        window.setTimeout(() => {
          setLineIndex(i)
          if (i === DECRYPT_LINES.length + CLASSIFY_COUNT) setRevealed(true)
        }, acc * factor)
      )
    })

    for (let i = 0; i < GLITCH_BURSTS; i += 1) {
      const burstAt = (CLASSIFY_COUNT * CLASSIFY_MS + i * (DECRYPT_MS * 1.15)) * factor
      timers.current.push(
        window.setTimeout(() => {
          setGlitching(true)
          const off = window.setTimeout(() => setGlitching(false), 140)
          timers.current.push(off)
        }, burstAt)
      )
    }

    const lastAt = acc * factor
    const total = lastAt + lineDuration(LINES.length - 1) * factor + REVEAL_HOLD_MS * factor
    timers.current.push(window.setTimeout(finish, total))

    const skipReveal = window.setTimeout(() => setCanSkip(true), 900 * factor)
    timers.current.push(skipReveal)

    const onKey = (event) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [play, reduced, factor, finish, skip])

  const current = LINES[Math.min(lineIndex, LINES.length - 1)]
  const phaseTitle =
    lineIndex < CLASSIFY_COUNT
      ? 'CLASSIFICATION IN PROGRESS'
      : revealed
        ? 'BIOMETRIC DATABASE'
        : 'CLASSIFIED PROCESSING'

  return (
    <Scene className="decrypt" label="Classifying and decrypting your classified identity" aria-live="polite">
      <div className={`decrypt-core ${glitching ? 'is-glitching' : ''}`}>
        {revealed ? <span className="decrypt-beam" aria-hidden="true" /> : null}

        <div className="decrypt-ring" aria-hidden="true">
          <i className="decrypt-ring--outer" />
          <i className="decrypt-ring--mid" />
          <i className="decrypt-ring--inner" />
          <span className="decrypt-ring-core">
            <Icon name="lockRotor" size={26} />
          </span>
        </div>

        <p className="decrypt-title mono micro gold">{phaseTitle}</p>
        <p key={lineIndex} className="decrypt-line">
          {current}
        </p>

        {revealed ? (
          <div className="decrypt-match" aria-hidden="true">
            <p className="decrypt-match-find mono">MATCH FOUND</p>
            <p className="decrypt-match-sub mono micro muted">COVER PROFILE LOCATED · SECTOR 09</p>
          </div>
        ) : (
          <>
            <div className="decrypt-progress" aria-hidden="true">
              <i style={{ width: `${(lineIndex / LINES.length) * 100}%` }} />
            </div>

            <div className="decrypt-fragments" aria-hidden="true">
              {fragments.slice(0, Math.min(lineIndex + 1, 9)).map((frag, i) => (
                <span key={frag} className="decrypt-frag mono" style={{ '--i': i }}>
                  {frag.split(' ').slice(0, 3).join(' ')}
                </span>
              ))}
            </div>
          </>
        )}

        <p className="decrypt-scan mono micro" aria-hidden="true">
          {revealed ? 'BIOMETRIC SCAN COMPLETE — IDENTITY VERIFIED' : 'SCANNING BIOMETRIC PROFILE — SECTOR 09'}
        </p>

        <div className="decrypt-tools">
          <button
            type="button"
            className={`decrypt-skip mono ${canSkip && !revealed ? 'is-visible' : ''}`}
            onClick={skip}
            aria-hidden={!canSkip || revealed}
            tabIndex={canSkip && !revealed ? 0 : -1}
          >
            <Icon name="arrowR" size={12} /> SKIP
          </button>
        </div>
      </div>
    </Scene>
  )
}