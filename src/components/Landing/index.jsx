import { useEffect } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useOptionalSound } from '../../hooks/useOptionalSound'
import { Scene, Reveal, SystemLabel } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'

const STATUS_ITEMS = [
  ['SECURITY PROTOCOL', 'ACTIVE'],
  ['DATABASE', 'ENCRYPTED'],
  ['ACCESS', 'RESTRICTED'],
]

export default function Landing() {
  const { actions, state } = useIdentity()
  const play = useOptionalSound(state.soundEnabled)

  useEffect(() => {
    const t = window.setTimeout(() => actions.setBooted(), 120)
    return () => window.clearTimeout(t)
  }, [actions])

  const enterSystem = () => {
    play('click')
    actions.showOverlay('enter-system')
  }

  return (
    <Scene className="landing" label="Undercover Identity — enter the system">
      <div className="landing-inner">
        <div className="landing-rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <Reveal delay={140}>
          <SystemLabel icon="lock">SECTOR 09 · INTELLIGENCE DIVISION</SystemLabel>
        </Reveal>

        <Reveal delay={320}>
          <h1 className="landing-title">
            <span className="landing-sub-title">CLASSIFIED</span>
            <span className="landing-main-title">
              UNDER<span className="title-gold">COVER</span>
            </span>
          </h1>
        </Reveal>

        <Reveal delay={540}>
          <p className="landing-tagline">YOUR IDENTITY IS CLASSIFIED.</p>
        </Reveal>

        <Reveal delay={680}>
          <p className="landing-support">Every operative needs a cover. Build yours.</p>
        </Reveal>

        <Reveal delay={860}>
          <div className="landing-cta">
            <ActionButton variant="primary" size="lg" icon="lock" magnetic onClick={enterSystem} data-cursor="hover">
              Enter System
            </ActionButton>
          </div>
        </Reveal>

        <Reveal delay={1040}>
          <div className="landing-status" role="list" aria-label="System status">
            <span className="landing-system-status" role="listitem">
              <span className="pulse" aria-hidden="true" />
              SYSTEM STATUS
              <span className="gold">ONLINE</span>
            </span>
            {STATUS_ITEMS.map(([label, value]) => (
              <span className="landing-status-item mono" role="listitem" key={label}>
                {label}
                <span className="leader" aria-hidden="true" />
                {value}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}