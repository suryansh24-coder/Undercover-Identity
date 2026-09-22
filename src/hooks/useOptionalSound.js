import { useEffect, useCallback } from 'react'
import { setSoundEnabled, playSound, primeAudio } from '../utils/soundEngine'

/**
 * Bridges the global sound-on/off preference to the Web Audio engine.
 *
 * Default is ON. The engine never creates an AudioContext until the
 * browser's first real user gesture (autoplay policy) — this hook arms
 * a one-shot first-gesture listener so the outcome is "audible once the
 * user has interacted", not "silent forever".
 */
export function useOptionalSound(enabled) {
  useEffect(() => {
    setSoundEnabled(Boolean(enabled))
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const prime = () => primeAudio()
    window.addEventListener('pointerdown', prime, { once: true })
    window.addEventListener('keydown', prime, { once: true })
    return () => {
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('keydown', prime)
    }
  }, [enabled])

  return useCallback((name) => {
    if (!enabled) return
    playSound(name)
  }, [enabled])
}
