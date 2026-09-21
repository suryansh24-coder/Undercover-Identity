import { useEffect, useCallback } from 'react'
import { setSoundEnabled, playSound } from '../utils/soundEngine'

/**
 * Bridges the global sound-on/off preference to the Web Audio engine.
 * Sounds never autoplay — they require a user gesture and an explicit opt-in.
 */
export function useOptionalSound(enabled) {
  useEffect(() => {
    setSoundEnabled(Boolean(enabled))
  }, [enabled])

  return useCallback((name) => {
    if (!enabled) return
    playSound(name)
  }, [enabled])
}