import { useRef, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { useTilt } from '../../hooks/useTilt'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Scene, Reveal, SystemLabel } from '../common/Scene'
import { ActionButton } from '../common/ActionButton'
import DossierDocument from './DossierDocument'
import DossierActions from './DossierActions'

export default function Dossier() {
  const { state, actions } = useIdentity()
  const reduced = useReducedMotion()
  const paperRef = useRef(null)
  const tiltRef = useTilt({ max: 6, scale: reduced ? 1 : 1.015, enabled: !reduced })
  const [light, setLight] = useState({ x: 50, y: 35, on: false })

  const { identity, dossier, editedImage } = state

  if (!identity || !dossier) {
    return (
      <Scene className="dossier" label="Dossier unavailable">
        <div className="dossier-missing terminal-card" role="alert">
          <p className="mono">NO ACTIVE DOSSIER ON FILE.</p>
          <br />
          <p className="mono micro muted">
            The previous session was cleared. Build a new cover to receive your dossier.
          </p>
          <div style={{ marginTop: 'var(--sp-5)' }}>
            <ActionButton variant="primary" size="md" magnetic onClick={() => actions.reset()}>
              Restart Session
            </ActionButton>
          </div>
        </div>
      </Scene>
    )
  }

  const onGlare = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setLight({ x, y, on: true })
  }

  const onGlareLeave = () => setLight((prev) => ({ ...prev, on: false }))

  return (
    <Scene className="dossier" label="Classified dossier for your undercover identity">
      <div className="dossier-scene-header">
        <Reveal>
          <SystemLabel icon="archive">DOCUMENT DECRYPTED · AWAITING OPERATIVE</SystemLabel>
        </Reveal>
        <Reveal delay={60}>
          <p className="dossier-scene-title">
            DOSSIER — <span className="gold">{identity.codename}</span>
          </p>
          <p className="muted mono micro">RENDERED LOCALLY · NOTHING LEAVES THIS DEVICE</p>
        </Reveal>
      </div>

      <div className="dossier-3d-wrap">
        <div
          ref={tiltRef}
          className="dossier-tilt"
          onPointerMove={onGlare}
          onPointerLeave={onGlareLeave}
        >
          <div className="dossier-glow" aria-hidden="true" style={{ left: `${light.x}%`, top: `${light.y}%`, opacity: light.on ? 1 : 0 }} />
          <div className="dossier-shadow" aria-hidden="true" />
          <div className="dossier-float">
            <DossierDocument ref={paperRef} identity={identity} dossier={dossier} photo={editedImage} />
          </div>
        </div>
      </div>

      <Reveal delay={200} className="dossier-actions-wrap">
        <DossierActions paperRef={paperRef} identity={identity} dossier={dossier} />
      </Reveal>
    </Scene>
  )
}