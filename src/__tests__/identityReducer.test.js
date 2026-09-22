import { describe, it, expect } from 'vitest'
import { identityReducer, INITIAL_STATE } from '../context/identityReducer'

describe('identityReducer', () => {
  it('starts on the landing step', () => {
    expect(identityReducer(undefined, { type: '@@init' }).step).toBe('landing')
  })

  it('navigates steps correctly', () => {
    const state = identityReducer(INITIAL_STATE, { type: 'GO', step: 'security' })
    expect(state.step).toBe('security')
    expect(state.overlay).toBeNull()
  })

  it('ignores unknown steps', () => {
    const state = identityReducer(INITIAL_STATE, { type: 'GO', step: 'nope' })
    expect(state.step).toBe('landing')
  })

  it('stores the uploaded image and edited image', () => {
    let state = identityReducer(INITIAL_STATE, { type: 'SET_UPLOAD', image: { dataUrl: 'data:x', name: 'a.jpg' } })
    expect(state.uploadedImage.dataUrl).toBe('data:x')
    state = identityReducer(state, { type: 'SET_EDITED', dataUrl: 'data:y', changed: true })
    expect(state.editedImage).toBe('data:y')
    expect(state.editorHadChanges).toBe(true)
  })

  it('clears images on CLEAR_UPLOAD', () => {
    const state = identityReducer(
      { ...INITIAL_STATE, uploadedImage: { dataUrl: 'x' }, editedImage: 'y', editorHadChanges: true },
      { type: 'CLEAR_UPLOAD' }
    )
    expect(state.uploadedImage).toBeNull()
    expect(state.editedImage).toBeNull()
    expect(state.editorHadChanges).toBe(false)
  })

  it('stores identity and dossier', () => {
    let state = identityReducer(INITIAL_STATE, { type: 'SET_IDENTITY', identity: { codename: 'X' } })
    state = identityReducer(state, { type: 'SET_DOSSIER', dossier: { documentId: 'UI-ABC' } })
    expect(state.identity.codename).toBe('X')
    expect(state.dossier.documentId).toBe('UI-ABC')
  })

  it('manages overlay state', () => {
    let state = identityReducer(INITIAL_STATE, { type: 'SHOW_OVERLAY', overlay: 'enter-system' })
    expect(state.overlay).toBe('enter-system')
    state = identityReducer(state, { type: 'HIDE_OVERLAY' })
    expect(state.overlay).toBeNull()
  })

  it('sets and clears errors', () => {
    let state = identityReducer(INITIAL_STATE, { type: 'SET_ERROR', message: 'Bad file' })
    expect(state.error).toBe('Bad file')
    state = identityReducer(state, { type: 'CLEAR_ERROR' })
    expect(state.error).toBeNull()
  })

  it('resets everything but preserves the sound preference', () => {
    const seeded = identityReducer(
      { ...INITIAL_STATE, soundEnabled: true, uploadedImage: { dataUrl: 'x' }, identity: { codename: 'X' } },
      { type: 'RESET' }
    )
    expect(seeded.step).toBe('landing')
    expect(seeded.uploadedImage).toBeNull()
    expect(seeded.identity).toBeNull()
    expect(seeded.soundEnabled).toBe(true)
    expect(seeded.toast).toBeTruthy()
  })

  it('toggles sound from each end of the preference', () => {
    expect(
      identityReducer({ ...INITIAL_STATE, soundEnabled: false }, { type: 'TOGGLE_SOUND' }).soundEnabled
    ).toBe(true)
    expect(
      identityReducer({ ...INITIAL_STATE, soundEnabled: true }, { type: 'TOGGLE_SOUND' }).soundEnabled
    ).toBe(false)
  })

  it('notifies and dismisses toast', () => {
    const notified = identityReducer(INITIAL_STATE, { type: 'NOTIFY', message: 'hi', tone: 'success', id: 1 })
    expect(notified.toast.message).toBe('hi')
    expect(notified.toast.tone).toBe('success')
    expect(identityReducer(notified, { type: 'DISMISS_TOAST' }).toast).toBeNull()
  })
})
