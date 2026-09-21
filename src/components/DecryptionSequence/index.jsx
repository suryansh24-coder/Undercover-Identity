import { useEffect, useMemo, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { Scene } from '../common/Scene'
import Icon from '../common/Icon'

const MESSAGES = [
  'ACCESSING CLASSIFIED DATABASE...',
  'DECRYPTING IDENTITY...',
  'VERIFYING BIOMETRICS...',
  'GENERATING CASE FILE...',
  'ENCRYPTION VERIFIED...',
  'IDENTITY LOCATED.',
]

const LINE_MS = 620

function fragmentsFor() {
  const hex = []
  for (let i = 0; i < 10; i += 1) {
    const bytes = new Uint8Array(5)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes)
    else for (let j = 0; j < bytes.length; j += 1) bytes[j] = Math.floor(Math.random() * 256)
    hex.push(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '))
  }
  return hex
}

export default function DecryptionSequence({ onComplete }) {
  const { state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)
  const [lineIndex, setLineIndex] = useState(0)
  const [glitching, setGlitching] = useState(false)
  const fragments = useMemo(() => fragmentsFor(), [])
  const timers = useRef([])
  const doneRef = useRef(false)

  useEffect(() => {
    play('classify')
    MESSAGES.forEach((_, index) => {
      timers.current.push(window.setTimeout(() => setLineIndex(index + 1), (index + 1) * LINE_MS))
    })
    for (let i = 0; i < 6; i += 1) {
      timers.current.push(
        window.setTimeout(() => {
          setGlitching(true)
          window.setTimeout(() => setGlitching(false), 140)
        }, 350 + i * 780)
      )
    }
    timers.current.push(
      window.setTimeout(() => {
        if (doneRef.current) return
        doneRef.current = true
        play('granted')
        window.setTimeout(() => onComplete(), 520)
      }, MESSAGES.length * LINE_MS + 340)
    )
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [onComplete, play])

  const current = MESSAGES[Math.min(lineIndex, MESSAGES.length - 1)]

  return (
    <Scene className="decrypt" label="Decrypting and locating your classified identity" aria-live="polite">
      <div className={`decrypt-core ${glitching ? 'is-glitching' : ''}`}>
        <div className="decrypt-ring" aria-hidden="true">
          <i className="decrypt-ring--outer" />
          <i className="decrypt-ring--mid" />
          <i className="decrypt-ring--inner" />
          <span className="decrypt-ring-core">
            <Icon name="lockRotor" size={26} />
          </span>
        </div>

        <p className="decrypt-title mono micro gold">CLASSIFIED PROCESSING</p>
        <p key={lineIndex} className="decrypt-line">
          {current}
        </p>

        <div className="decrypt-progress" aria-hidden="true">
          <i style={{ width: `${(lineIndex / MESSAGES.length) * 100}%` }} />
        </div>

        <div className="decrypt-fragments" aria-hidden="true">
          {fragments.slice(0, lineIndex + 1).map((frag, i) => (
            <span key={frag} className="decrypt-frag mono" style={{ '--i': i }}>
              {frag.split(' ').slice(0, 3).join(' ')}
            </span>
          ))}
        </div>

        <p className="decrypt-scan mono micro" aria-hidden="true">
          SCANNING BIOMETRIC PROFILE — SECTOR 09
        </p>
      </div>
    </Scene>
  )
}