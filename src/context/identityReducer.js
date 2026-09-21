export const STEPS = [
  'landing',
  'security',
  'upload',
  'editor',
  'identity',
  'decrypt',
  'dossier',
]

export const STEP_INDEX = Object.fromEntries(STEPS.map((step, index) => [step, index]))

export const INITIAL_STATE = {
  step: 'landing',
  uploadedImage: null,
  editedImage: null,
  editorHadChanges: false,
  identity: null,
  dossier: null,
  overlay: null,
  error: null,
  toast: null,
  soundEnabled: false,
  booted: false,
}

export function identityReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GO':
      if (!STEPS.includes(action.step)) return state
      return {
        ...state,
        step: action.step,
        error: null,
        overlay: null,
      }

    case 'SET_UPLOAD':
      return {
        ...state,
        uploadedImage: action.image,
        error: null,
      }

    case 'CLEAR_UPLOAD':
      return {
        ...state,
        uploadedImage: null,
        editedImage: null,
        editorHadChanges: false,
      }

    case 'SET_EDITED':
      return {
        ...state,
        editedImage: action.dataUrl,
        editorHadChanges: action.changed === true,
      }

    case 'SET_IDENTITY':
      return { ...state, identity: action.identity }

    case 'SET_DOSSIER':
      return { ...state, dossier: action.dossier }

    case 'SHOW_OVERLAY':
      return { ...state, overlay: action.overlay, error: null }

    case 'HIDE_OVERLAY':
      return { ...state, overlay: null }

    case 'SET_ERROR':
      return { ...state, error: action.message }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    case 'NOTIFY':
      return {
        ...state,
        toast: { id: action.id, message: action.message, tone: action.tone },
      }

    case 'DISMISS_TOAST':
      return Object.assign({}, state, {
        toast: null,
      })

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }

    case 'BOOTED':
      return { ...state, booted: true }

    case 'RESET':
      return {
        ...INITIAL_STATE,
        soundEnabled: state.soundEnabled,
        toast: { id: Date.now(), message: 'SESSION WIPED · NEW OPERATIVE', tone: 'info' },
      }

    default:
      return state
  }
}