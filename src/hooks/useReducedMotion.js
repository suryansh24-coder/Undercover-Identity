import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getServerSnapshot() {
  return false
}

/** True when the user prefers reduced motion. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function finePointerSnapshot() {
  return window.matchMedia('(pointer: fine)').matches
}

/** True when a precise pointing device is available. */
export function useFinePointer() {
  return useSyncExternalStore(
    (cb) => {
      const media = window.matchMedia('(pointer: fine)')
      media.addEventListener('change', cb)
      return () => media.removeEventListener('change', cb)
    },
    finePointerSnapshot,
    () => false
  )
}