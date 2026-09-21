import { useEffect, useRef } from 'react'
import { useIdentity } from '../../context/IdentityContext'
import Icon from './Icon'

export function Toast() {
  const { state, actions } = useIdentity()
  const toast = state?.toast
  const timer = useRef(null)

  useEffect(() => {
    if (!toast) return undefined
    timer.current = window.setTimeout(() => actions.dismissToast(), 3400)
    return () => window.clearTimeout(timer.current)
  }, [toast, actions])

  if (!toast) return null

  const toneClass = toast.tone === 'error' ? 'toast--error' : toast.tone === 'success' ? 'toast--success' : ''

  return (
    <div className={`toast ${toneClass}`} role="status" aria-live="polite" data-toast>
      <Icon name={toast.tone === 'error' ? 'alert' : toast.tone === 'success' ? 'checkCircle' : 'info'} size={16} />
      <span className="toast-message mono">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => actions.dismissToast()}
        aria-label="Dismiss message"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}