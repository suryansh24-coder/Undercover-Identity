import { useEffect, useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { Scene, Reveal, SystemLabel, TerminalCard } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'

const CHECKS = [
  ['BIOMETRIC DATABASE', 'CONNECTED'],
  ['IDENTITY SYSTEM', 'READY'],
  ['SECURITY PROTOCOL', 'ACTIVE'],
  ['ENCRYPTION', 'AES-256'],
  ['ACCESS LEVEL', 'AUTHORIZED'],
]

const STEP_DURATION = 520

export default function SecurityClearance() {
  const { actions, state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)
  const [revealed, setRevealed] = useState(0)
  const [granted, setGranted] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    play('boot')
    CHECKS.forEach((_, index) => {
      timers.current.push(
        window.setTimeout(() => setRevealed(index + 1), (index + 1) * STEP_DURATION)
      )
    })
    timers.current.push(
      window.setTimeout(() => {
        setGranted(true)
        play('granted')
      }, (CHECKS.length + 1) * STEP_DURATION)
    )
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [play])

  const begin = () => {
    play('click')
    actions.go('upload')
  }

  return (
    <Scene className="security" label="Security clearance">
      <div className="security-shell">
        <Reveal className="security-header">
          <SystemLabel icon="fingerprint">AUTHENTICATING OPERATIVE</SystemLabel>
        </Reveal>

        <Reveal delay={120}>
          <TerminalCard title="Sector 09 · Identity Verification" className="security-card">
            <ul className="security-list" role="list">
              {CHECKS.map(([label, value], index) => {
                const active = index === revealed - 1
                const done = revealed > index && revealed > 0
                return (
                  <li key={label} className="security-row mono">
                    <span className="security-label">{label}</span>
                    <span className="leader" aria-hidden="true" />
                    {!done ? (
                      <span className="security-scan" aria-hidden="true">
                        <span />
                      </span>
                    ) : active ? (
                      <span className="security-state is-current gold">
                        {value} <span className="pulse" aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="security-state gold">{value}</span>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className={`security-granted ${granted ? 'is-visible' : ''}`} aria-live="polite">
              <p className="security-granted-title">
                {granted ? 'ACCESS GRANTED' : '\u00A0'}
              </p>
              <p className="security-welcome">{granted ? 'WELCOME, OPERATIVE.' : '\u00A0'}</p>
              {granted ? (
                <div className="security-briefing">
                  <span className="security-briefing-op mono">OPERATION NIGHTFALL</span>
                  <p className="security-briefing-line">
                    Your existing identity has been compromised. Forge a new cover before the
                    network traces you.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="security-action">
              <ActionButton
                variant="primary"
                size="lg"
                icon="shield"
                magnetic
                disabled={!granted}
                onClick={begin}
                data-cursor="hover"
              >
                Begin Operation
              </ActionButton>
            </div>
          </TerminalCard>
        </Reveal>

        <Reveal delay={420} className="security-note">
          <span className="mono micro muted">CLEARANCE PROTOCOL 7-K · SESSION ISOLATED</span>
        </Reveal>
      </div>
    </Scene>
  )
}