// Interface sounds in a retro chip style, synthesised with the Web Audio API
// (no audio files). Square and triangle waves with fast pitch steps and
// slides, the way old consoles made sound. All original to ByteQuest.
//
// Principles (see README "Sound"):
// - Sound only at moments that matter; everything else is silent.
// - Correct rises and is bright; wrong falls and is soft. Never a buzzer.
// - Small actions (tapping an option) get a tiny blip.
// - A small, consistent set so each sound becomes recognisable.
// - Easy to mute, and quiet: square waves are loud, so the master level is low.

export type Sound = 'tap' | 'correct' | 'wrong' | 'complete' | 'streak'

let ctx: AudioContext | null = null
let bus: AudioNode | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

/** Shared output: a gentle low-pass takes the fizz off square waves. */
function audio(): { ac: AudioContext; out: AudioNode } | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  if (!bus) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6000
    const g = ctx.createGain()
    g.gain.value = 0.11
    lp.connect(g).connect(ctx.destination)
    bus = lp
  }
  return { ac: ctx, out: bus }
}

interface Note {
  wave?: OscillatorType
  freq: number
  /** Slide to this frequency by the end of the note. */
  to?: number
  at: number
  dur: number
  gain?: number
  /** Hold at full level for this share of the note before fading (0–1). */
  hold?: number
}

/** One chip note: instant attack, short hold, quick fade. */
function note(ac: AudioContext, out: AudioNode, n: Note) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = n.wave ?? 'square'
  osc.frequency.setValueAtTime(n.freq, n.at)
  if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, n.at + n.dur)
  const peak = n.gain ?? 1
  const holdEnd = n.at + n.dur * (n.hold ?? 0.35)
  g.gain.setValueAtTime(0.0001, n.at)
  g.gain.linearRampToValueAtTime(peak, n.at + 0.004)
  g.gain.setValueAtTime(peak, holdEnd)
  g.gain.exponentialRampToValueAtTime(0.0001, n.at + n.dur)
  osc.connect(g).connect(out)
  osc.start(n.at)
  osc.stop(n.at + n.dur + 0.02)
}

const semis = (base: number, n: number) => base * 2 ** (n / 12)

// Note frequencies (Hz).
const C4 = 261.63
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const A5 = 880
const C6 = 1046.5
const D6 = 1174.66
const E6 = 1318.51
const G6 = 1567.98

/**
 * @param combo answers right in a row in this lesson (1 = first). The correct
 * sound climbs one semitone per answer in a row, up to five, so a run feels like
 * it's building.
 */
export function play(sound: Sound, combo = 1) {
  if (!enabled) return
  const a = audio()
  if (!a) return
  const { ac, out } = a
  const t = ac.currentTime + 0.01
  switch (sound) {
    case 'tap':
      // A tiny, soft blip.
      note(ac, out, { wave: 'triangle', freq: 1400, to: 1100, at: t, dur: 0.035, gain: 0.7, hold: 0.1 })
      break
    case 'correct': {
      // Two quick rising notes a fifth apart, the second ringing a little.
      const k = Math.min(Math.max(combo, 1) - 1, 5)
      note(ac, out, { freq: semis(A5, k), at: t, dur: 0.06, gain: 0.55, hold: 0.8 })
      note(ac, out, { freq: semis(E6, k), at: t + 0.06, dur: 0.22, gain: 0.55, hold: 0.25 })
      note(ac, out, { wave: 'triangle', freq: semis(E6, k) / 2, at: t + 0.06, dur: 0.18, gain: 0.5 })
      break
    }
    case 'wrong':
      // A soft downward "bwomp": triangle, so it's round rather than harsh.
      note(ac, out, { wave: 'triangle', freq: 330, to: 140, at: t, dur: 0.26, gain: 0.9, hold: 0.5 })
      note(ac, out, { wave: 'square', freq: 165, to: 110, at: t + 0.02, dur: 0.2, gain: 0.12, hold: 0.3 })
      break
    case 'complete': {
      // Level-clear jingle: a quick run up, a pause, then a held finish with bass.
      const run = [C5, E5, G5, C6, E6]
      run.forEach((f, i) => note(ac, out, { freq: f, at: t + i * 0.07, dur: 0.08, gain: 0.45, hold: 0.7 }))
      const end = t + run.length * 0.07 + 0.08
      note(ac, out, { freq: D6, at: end, dur: 0.12, gain: 0.45, hold: 0.7 })
      note(ac, out, { freq: G6, at: end + 0.12, dur: 0.45, gain: 0.45, hold: 0.4 })
      note(ac, out, { wave: 'triangle', freq: C4, at: t, dur: 0.3, gain: 0.8, hold: 0.6 })
      note(ac, out, { wave: 'triangle', freq: G5 / 4, at: end + 0.12, dur: 0.45, gain: 0.8, hold: 0.5 })
      break
    }
    case 'streak':
      // Power-up: a fast climbing staircase of notes.
      for (let i = 0; i < 10; i++)
        note(ac, out, { freq: semis(G5, i * 2), at: t + i * 0.035, dur: 0.05, gain: 0.35 + i * 0.02, hold: 0.6 })
      note(ac, out, { freq: semis(G5, 20), at: t + 0.35, dur: 0.3, gain: 0.45, hold: 0.3 })
      break
  }
}
