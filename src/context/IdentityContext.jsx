import { createContext, useContext, useMemo, useReducer } from 'react'
import { identityReducer, INITIAL_STATE } from './identityReducer'

const IdentityContext = createContext(null)

export function IdentityProvider({ children }) {
  const [state, dispatch] = useReducer(identityReducer, INITIAL_STATE)

  const actions = useMemo(
    () => ({
      go: (step) => dispatch({ type: 'GO', step }),
      setUpload: (image) => dispatch({ type: 'SET_UPLOAD', image }),
      clearUpload: () => dispatch({ type: 'CLEAR_UPLOAD' }),
      setEdited: (dataUrl, changed = true) => dispatch({ type: 'SET_EDITED', dataUrl, changed }),
      setIdentity: (identity) => dispatch({ type: 'SET_IDENTITY', identity }),
      setDossier: (dossier) => dispatch({ type: 'SET_DOSSIER', dossier }),
      showOverlay: (overlay) => dispatch({ type: 'SHOW_OVERLAY', overlay }),
      hideOverlay: () => dispatch({ type: 'HIDE_OVERLAY' }),
      setError: (message) => dispatch({ type: 'SET_ERROR', message }),
      clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
      notify: (message, tone = 'info') =>
        dispatch({ type: 'NOTIFY', message, tone, id: Date.now() }),
      dismissToast: () => dispatch({ type: 'DISMISS_TOAST' }),
      toggleSound: () => dispatch({ type: 'TOGGLE_SOUND' }),
      setBooted: () => dispatch({ type: 'BOOTED' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) {
    throw new Error('useIdentity must be used within <IdentityProvider>')
  }
  return ctx
}

export function useStep() {
  const { state, actions } = useIdentity()
  return {
    step: state.step,
    go: actions.go,
    ...state,
    ...actions,
  }
}