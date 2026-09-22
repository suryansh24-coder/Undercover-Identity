import { useEffect, useState } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import { primeAudio, setSoundEnabled, playSound } from '../../utils/soundEngine'
import { IconButton } from '../common/ActionButton'
import Icon from '../common/Icon'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const pad = (n) => String(n).padStart(2, '0')
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  return (
    <span className="clock mono" aria-label={`Local time ${hh} ${mm} ${ss}`}>
      {hh}:{mm}
      <span className="clock-sec">:{ss}</span>
    </span>
  )
}

function SoundToggle() {
  const { state, actions } = useIdentity()
  const sound = state.soundEnabled
  return (
    <IconButton
      icon={sound ? 'sound' : 'mute'}
      label={sound ? 'Mute system sounds' : 'Enable system sounds'}
      onClick={() => {
        if (!sound) {
          // Enabling — this click IS the first gesture: prime and resume
          // now so the GTA confirmation chime is genuinely audible.
          if (primeAudio()) {
            setSoundEnabled(true)
            actions.toggleSound()
            playSound('gta')
          } else {
            actions.notify('AUDIO UNAVAILABLE — STAYING SILENT.', 'error')
          }
        } else {
          // Muting — an audible click first, then go quiet.
          playSound('click')
          setSoundEnabled(false)
          actions.toggleSound()
        }
      }}
      className="sys-sound"
    />
  )
}

export default function SystemMeta() {
  const { state } = useIdentity()
  return (
    <>
      <div className="sys-corner sys-corner--tl" data-export-skip>
        <div className="sys-brand">
          <span className="sys-emblem" aria-hidden="true">
            <Icon name="logo" size={26} />
          </span>
          <span className="sys-brand-text">
            <span className="sys-brand-title">UNDERCOVER IDENTITY</span>
            <span className="sys-brand-sub mono">INDEPENDENT INTELLIGENCE DIVISION</span>
          </span>
        </div>
      </div>

      <div className="sys-corner sys-corner--tr" data-export-skip>
        <div className="sys-status">
          <span className="sys-status-dot" aria-hidden="true" />
          <span className="mono">SYSTEM STATUS</span>
          <span className="sys-status-on mono">ONLINE</span>
          <span className="sys-sep" />
          <Clock />
          <span className="sys-sound-wrap">
            <SoundToggle />
          </span>
        </div>
      </div>

      <div className="sys-corner sys-corner--bl" data-export-skip>
        <span className="mono micro sys-foot">
          SESSION-LOCAL · NO UPLOADS · NO TRACKING {state.editorHadChanges ? '· IMAGE MODIFIED' : ''}
        </span>
      </div>

      <div className="sys-corner sys-corner--br" data-export-skip>
        <span className="sys-diamond" aria-hidden="true">
          <Icon name="lockRotor" size={15} />
        </span>
        <span className="mono micro sys-foot">VERSION 0.1·0</span>
      </div>
    </>
  )
}