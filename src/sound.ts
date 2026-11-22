// Interface sounds in a classic-console style, synthesised with the Web Audio
// API (no audio files). The voices are the ones 8-bit consoles had: pulse
// waves at narrow duty cycles for melody, a triangle wave for bass, and a
// noise burst for percussion. Every tune here is original to ByteQuest.
//
// Principles (see README "Sound"):
// - Sound only at moments that matter; everything else is silent.
// - Correct rises and is bright; wrong is a soft bonk. Never a buzzer.
// - Small actions (tapping an option) get a tiny menu tick.
// - A small, consistent set so each sound becomes recognisable.
// - Easy to mute, and quiet: pulse waves are loud, so the master level is low.

export type Sound = 'tap' | 'correct' | 'wrong' | 'complete' | 'streak'

let ctx: AudioContext | null = null
let bus: AudioNode | null = null
let enabled = true
const pulses = new Map<number, PeriodicWave>()

export function setSoundEnabled(on: boolean) {
  enabled = on
}

/** Shared output: a gentle low-pass takes the fizz off the pulse waves. */
function audio(): { ac: AudioContext; out: AudioNode } | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  if (!bus) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7000
    const g = ctx.createGain()
    g.gain.value = 0.1
    lp.connect(g).connect(ctx.destination)
    bus = lp
  }
  return { ac: ctx, out: bus }
}

/** A pulse wave with the given duty cycle (0.5 = square, 0.25 and 0.125 = thinner, brighter). */
function pulse(ac: AudioContext, duty: number): PeriodicWave {
  let w = pulses.get(duty)
  if (!w) {
    const n = 32
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty)
    w = ac.createPeriodicWave(real, imag)
    pulses.set(duty, w)
  }
  return w
}

interface Note {
  /** 'tri' for the bass voice, or a pulse duty cycle. */
  voice?: 'tri' | 0.5 | 0.25 | 0.125
  freq: number
  /** Slide to this frequency by the end of the note. */
  to?: number
  at: number
  dur: number
  gain?: number
  /** Hold at full level for this share of the note before fading (0–1). */
  hold?: number
}

/** One chip note: instant attack, a hold, then a quick fade. */
function note(ac: AudioContext, out: AudioNode, n: Note) {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  const voice = n.voice ?? 0.25
  if (voice === 'tri') osc.type = 'triangle'
  else osc.setPeriodicWave(pulse(ac, voice))
  osc.frequency.setValueAtTime(n.freq, n.at)
  if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, n.at + n.dur)
  const peak = n.gain ?? 1
  g.gain.setValueAtTime(0.0001, n.at)
  g.gain.linearRampToValueAtTime(peak, n.at + 0.003)
  g.gain.setValueAtTime(peak, n.at + n.dur * (n.hold ?? 0.4))
  g.gain.exponentialRampToValueAtTime(0.0001, n.at + n.dur)
  osc.connect(g).connect(out)
  osc.start(n.at)
  osc.stop(n.at + n.dur + 0.02)
}

/** A short burst of noise, the console's percussion voice. */
function noise(ac: AudioContext, out: AudioNode, at: number, dur: number, gain: number, cutoff: number) {
  const len = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2
  const src = ac.createBufferSource()
  src.buffer = buf
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = cutoff
  const g = ac.createGain()
  g.gain.value = gain
  src.connect(lp).connect(g).connect(out)
  src.start(at)
}

/** Frequency of a note `n` semitones above A4 (440 Hz). */
const hz = (n: number) => 440 * 2 ** (n / 12)

// Semitones from A4.
const C5 = 3
const G5 = 10
const A5 = 12
const B5 = 14
const C6 = 15
const E6 = 19
const G6 = 22
const C7 = 27

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
      // Menu-cursor tick: one very short, thin blip.
      note(ac, out, { voice: 0.125, freq: hz(C6), at: t, dur: 0.028, gain: 0.45, hold: 0.3 })
      break
    case 'correct': {
      // "Collect" blip: a three-note rising flick, the last note ringing,
      // with a quiet octave-down pulse underneath to give it body.
      const k = Math.min(Math.max(combo, 1) - 1, 5)
      const up = [G5, C6, E6].map((n) => hz(n + k))
      note(ac, out, { voice: 0.25, freq: up[0], at: t, dur: 0.045, gain: 0.5, hold: 0.9 })
      note(ac, out, { voice: 0.25, freq: up[1], at: t + 0.045, dur: 0.045, gain: 0.5, hold: 0.9 })
      note(ac, out, { voice: 0.25, freq: up[2], at: t + 0.09, dur: 0.26, gain: 0.55, hold: 0.25 })
      note(ac, out, { voice: 0.5, freq: up[2] / 2, at: t + 0.09, dur: 0.2, gain: 0.18, hold: 0.2 })
      break
    }
    case 'wrong':
      // A soft bonk: a low thump with a puff of noise, then a lower, shorter echo.
      note(ac, out, { voice: 'tri', freq: 196, to: 131, at: t, dur: 0.11, gain: 1, hold: 0.3 })
      noise(ac, out, t, 0.05, 0.35, 1200)
      note(ac, out, { voice: 'tri', freq: 147, to: 98, at: t + 0.13, dur: 0.14, gain: 0.8, hold: 0.3 })
      break
    case 'complete': {
      // Stage-clear fanfare: a pickup run, a call, and a held answer, over a
      // walking triangle bass, with a harmony a third below on the ending.
      const s = 0.085 // one step
      const lead: [number, number, number][] = [
        // [semitones, start step, length in steps]
        [G5, 0, 1],
        [C6, 1, 1],
        [E6, 2, 1],
        [G6, 3, 2],
        [E6, 5, 1],
        [G6, 6, 1],
        [A5 + 12, 7, 2],
        [G6, 9, 1],
        [B5 + 12, 10, 1],
        [C7, 11, 5],
      ]
      for (const [n, at, len] of lead) note(ac, out, { voice: 0.25, freq: hz(n), at: t + at * s, dur: len * s * 0.95, gain: 0.42, hold: len > 2 ? 0.45 : 0.75 })
      // harmony on the ending
      note(ac, out, { voice: 0.125, freq: hz(E6), at: t + 9 * s, dur: s * 0.9, gain: 0.22, hold: 0.7 })
      note(ac, out, { voice: 0.125, freq: hz(G6), at: t + 10 * s, dur: s * 0.9, gain: 0.22, hold: 0.7 })
      note(ac, out, { voice: 0.125, freq: hz(E6 + 12), at: t + 11 * s, dur: 5 * s, gain: 0.22, hold: 0.45 })
      // bass: C, F, G, C
      const bass: [number, number, number][] = [
        [C5 - 24, 0, 3],
        [C5 - 24, 3, 2],
        [C5 - 19, 5, 2],
        [C5 - 19, 7, 2],
        [C5 - 17, 9, 2],
        [C5 - 12, 11, 5],
      ]
      for (const [n, at, len] of bass) note(ac, out, { voice: 'tri', freq: hz(n), at: t + at * s, dur: len * s * 0.9, gain: 0.9, hold: 0.6 })
      // a little percussion on the landing
      noise(ac, out, t + 11 * s, 0.08, 0.25, 5000)
      break
    }
    case 'streak': {
      // Power-up sweep: a rising three-note pattern that climbs through
      // octaves and speeds up, ending on a bright held note.
      // C major chord tones from C4 up through three octaves.
      const tones = [0, 4, 7, 12, 16, 19, 24, 28, 31]
      let at = t
      tones.forEach((semi, i) => {
        const step = 0.055 - i * 0.003
        note(ac, out, { voice: 0.125, freq: hz(C5 - 12 + semi), at, dur: step * 1.1, gain: 0.34 + i * 0.015, hold: 0.7 })
        at += step
      })
      note(ac, out, { voice: 0.25, freq: hz(C7), at, dur: 0.34, gain: 0.5, hold: 0.3 })
      note(ac, out, { voice: 'tri', freq: hz(C5), at, dur: 0.32, gain: 0.8, hold: 0.4 })
      noise(ac, out, at, 0.06, 0.2, 6000)
      break
    }
  }
}
