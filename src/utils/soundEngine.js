/* ============================================================
   OPTIONAL MICRO-SOUND ENGINE
   Web Audio oscillators only — no assets.
   - ON by default; the user can mute via the sound toggle.
   - No AudioContext is ever created before the first user
     gesture (browser autoplay policy) — creation happens lazily
     inside the enable-click, which is that gesture.
   - Subtle, short, imperative feedback only. Never crashes.
   ============================================================ */

let ctx = null
let masterGain = null
let muted = false
let hasGestured = false
let operations = 0

function audioSupported() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.AudioContext || window.webkitAudioContext)
  )
}

function ensureContext() {
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : 0.9
    masterGain.connect(ctx.destination)
  }
  return ctx
}

export function primeAudio() {
  if (!audioSupported()) return false
  hasGestured = true
  const c = ensureContext()
  if (!c) return false
  if (c.state === 'suspended') c.resume().catch(() => {})
  if (masterGain) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 0.9, c.currentTime, 0.04)
  }
  return true
}

export function setSoundEnabled(enabled) {
  // Preference sync — runs on mount/state change. NEVER creates a
  // context here (that would trip the browser autoplay warning before
  // any user gesture).
  muted = !enabled
  if (ctx) {
    if (ctx.state === 'suspended' && enabled) ctx.resume().catch(() => {})
    if (masterGain) {
      masterGain.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.04)
    }
  }
  return audioSupported()
}

export function enableSoundFromGesture() {
  // Called inside the toggle's click — that IS the gesture. Creates and
  // resumes the context now so the confirmation chime is genuinely audible.
  if (!audioSupported()) return false
  muted = false
  hasGestured = true
  const c = ensureContext()
  if (!c) return false
  if (c.state === 'suspended') c.resume().catch(() => {})
  if (masterGain) {
    masterGain.gain.setTargetAtTime(0.9, c.currentTime, 0.04)
  }
  return true
}

export function soundEnabled() {
  return !muted
}

function tone({ freq = 440, type = 'sine', duration = 0.09, gain = 0.12, when = 0 }) {
  if (muted || !hasGestured || !masterGain) return
  const c = ensureContext()
  if (!c) return
  try {
    const t0 = c.currentTime + when
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.connect(g)
    g.connect(masterGain)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
    operations += 1
  } catch {
    // Audio is decorative — never crash on a failed beep.
  }
}

export function playSound(name) {
  if (muted) return
  switch (name) {
    case 'boot':
      tone({ freq: 220, duration: 0.7, gain: 0.08, type: 'triangle', when: 0 })
      tone({ freq: 330, duration: 0.7, gain: 0.06, type: 'triangle', when: 0.12 })
      break
    case 'click':
      tone({ freq: 760, duration: 0.05, gain: 0.07, type: 'square' })
      break
    case 'enter':
      tone({ freq: 392, duration: 0.16, gain: 0.1, type: 'sine', when: 0 })
      tone({ freq: 523, duration: 0.22, gain: 0.1, type: 'sine', when: 0.1 })
      break
    case 'granted':
      tone({ freq: 523, duration: 0.18, gain: 0.11, type: 'triangle', when: 0 })
      tone({ freq: 659, duration: 0.22, gain: 0.11, type: 'triangle', when: 0.14 })
      break
    case 'gta':
      tone({ freq: 660, duration: 0.14, gain: 0.11, type: 'triangle', when: 0 })
      tone({ freq: 990, duration: 0.32, gain: 0.12, type: 'triangle', when: 0.14 })
      break
    case 'classify':
      tone({ freq: 98, duration: 1.1, gain: 0.16, type: 'sawtooth', when: 0 })
      tone({ freq: 147, duration: 1.1, gain: 0.1, type: 'sawtooth', when: 0.05 })
      break
    case 'save':
      tone({ freq: 1046, duration: 0.08, gain: 0.08, type: 'square', when: 0 })
      tone({ freq: 1568, duration: 0.1, gain: 0.07, type: 'square', when: 0.07 })
      break
    case 'download':
      tone({ freq: 587, duration: 0.12, gain: 0.1, type: 'triangle', when: 0 })
      tone({ freq: 880, duration: 0.2, gain: 0.1, type: 'triangle', when: 0.12 })
      break
    case 'error':
      tone({ freq: 160, duration: 0.28, gain: 0.1, type: 'square', when: 0 })
      tone({ freq: 120, duration: 0.28, gain: 0.09, type: 'square', when: 0.16 })
      break
    case 'wipe':
      tone({ freq: 240, duration: 0.1, gain: 0.07, type: 'sine' })
      tone({ freq: 180, duration: 0.12, gain: 0.06, type: 'sine', when: 0.1 })
      break
    default:
      break
  }
}

export function disposeSounds() {
  if (ctx) {
    ctx.close().catch(() => {})
    ctx = null
    masterGain = null
  }
}
