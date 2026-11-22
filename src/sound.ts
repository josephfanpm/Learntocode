// Interface sounds, synthesised with the Web Audio API (no audio files).
//
// Principles (see README "Sound"):
// - Sound only at moments that matter; everything else is silent.
// - Correct rises and is bright; wrong falls and is soft. Never a buzzer.
// - Small actions (tapping an option) get a tiny non-musical tick.
// - A small, consistent set so each sound becomes recognisable.
// - Easy to mute, and quiet by default relative to system sounds.

export type Sound = 'tap' | 'correct' | 'wrong' | 'complete' | 'streak'

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const MASTER = 0.22

/** A soft bell: a sine fundamental plus a quieter overtone, fast attack, exponential decay. */
function bell(ac: AudioContext, freq: number, at: number, dur: number, gain = 1, detuneCents = 0) {
  const out = ac.createGain()
  out.gain.setValueAtTime(0.0001, at)
  out.gain.exponentialRampToValueAtTime(MASTER * gain, at + 0.008)
  out.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  out.connect(ac.destination)
  for (const [mult, g] of [[1, 1], [2.01, 0.28], [3.98, 0.08]] as const) {
    const osc = ac.createOscillator()
    const og = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * mult, at)
    osc.detune.value = detuneCents
    og.gain.value = g
    osc.connect(og).connect(out)
    osc.start(at)
    osc.stop(at + dur + 0.05)
  }
}

/** A muted, low "thud" tone that slides down a little. */
function soft(ac: AudioContext, from: number, to: number, at: number, dur: number, gain = 1) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(from, at)
  osc.frequency.exponentialRampToValueAtTime(to, at + dur)
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(MASTER * gain, at + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  osc.connect(lp).connect(g).connect(ac.destination)
  osc.start(at)
  osc.stop(at + dur + 0.05)
}

/** A tiny filtered-noise tick for taps (and the "snap" at the start of the correct sound). */
function tick(ac: AudioContext, at: number, freq = 2400, gain = 0.9) {
  const len = Math.floor(ac.sampleRate * 0.025)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
  const src = ac.createBufferSource()
  src.buffer = buf
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 1.2
  const g = ac.createGain()
  g.gain.value = MASTER * gain
  src.connect(bp).connect(g).connect(ac.destination)
  src.start(at)
}

// Note frequencies (Hz).
const N = { G4: 392, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 }

/**
 * @param combo answers right in a row in this lesson (1 = first). The correct
 * sound climbs one semitone per answer in a row, up to five, so a run feels like
 * it's building.
 */
export function play(sound: Sound, combo = 1) {
  if (!enabled) return
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.01
  switch (sound) {
    case 'tap':
      tick(ac, t)
      break
    case 'correct': {
      // Snap, then two quick rising notes a fifth apart with a sparkle on top.
      // Short (under half a second), consonant, bright, and it resolves upward.
      const k = 2 ** (Math.min(Math.max(combo, 1) - 1, 5) / 12)
      tick(ac, t, 3800, 0.7)
      bell(ac, N.A5 * k, t, 0.16, 0.75)
      bell(ac, N.E6 * k, t + 0.075, 0.45, 0.95, -5)
      bell(ac, N.E6 * k, t + 0.075, 0.45, 0.45, 6)
      bell(ac, N.E6 * 2 * k, t + 0.09, 0.3, 0.16)
      break
    }
    case 'wrong':
      // Two soft low notes stepping down. Gentle, not a buzzer.
      soft(ac, 311, 294, t, 0.18, 0.9)
      soft(ac, 262, 247, t + 0.13, 0.3, 0.8)
      break
    case 'complete':
      // Major arpeggio up to the octave, like a station arrival chime.
      ;[N.C5, N.E5, N.G5, N.C6].forEach((f, i) => bell(ac, f, t + i * 0.11, 0.7, 0.85))
      break
    case 'streak':
      // Higher, sparkling rise for extending the streak.
      ;[N.G5, N.C6, N.E6, N.G6].forEach((f, i) => bell(ac, f, t + i * 0.07, 0.6, 0.7))
      bell(ac, N.G6 * 1.5, t + 0.32, 0.9, 0.35)
      break
  }
}
