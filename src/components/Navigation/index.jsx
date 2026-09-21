import { STEP_INDEX } from '../../context/identityReducer'
import { useIdentity } from '../../context/IdentityContext'

export default function Navigation() {
  const { state } = useIdentity()
  const total = STEP_INDEX.dossier
  const progress = Math.round((STEP_INDEX[state.step] / total) * 100)

  return (
    <div className="nav-frame" data-export-skip>
      <div className="nav-track" aria-hidden="true">
        <div className="nav-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="sr-only">{`System flow ${progress}% complete across ${state.step} stage`}</p>
    </div>
  )
}