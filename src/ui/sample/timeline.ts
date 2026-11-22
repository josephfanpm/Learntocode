// One clock drives the whole scene. Every moving thing is a pure function
// of `t` (milliseconds since the scene started), so everything stays in sync
// and retiming means editing one table.

/** [start, length] in milliseconds. */
export type Beat = readonly [number, number]

export const HERO = {
  line1: [250, 420],
  line2: [340, 420], // 90 ms after line 1: staggered, never all at once
  pip: [700, 460],
  subtitle: [900, 1100], // typed out letter by letter
  cta: [2000, 360],
} as const satisfies Record<string, Beat>

/** Parallax speeds in scene pixels per second, back to front. */
export const DRIFT = { far: 2, mid: 5, near: 9, front: 16 } as const

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** How far through a beat we are, 0 to 1. */
export function progress(t: number, [start, length]: Beat): number {
  return clamp01((t - start) / length)
}

/** Ease-out cubic: quick to start, gentle to land. */
export const easeOut = (p: number) => 1 - (1 - p) ** 3

/** The part of `text` typed so far. */
export function typed(text: string, p: number): string {
  return text.slice(0, Math.round(clamp01(p) * text.length))
}

/** Horizontal offset of a looping layer, snapped to whole scene pixels. */
export function drift(t: number, pxPerSecond: number, width: number): number {
  return Math.floor((t / 1000) * pxPerSecond) % width
}

/** A star's brightness: each star twinkles on its own slow cycle. */
export function twinkle(t: number, seed: number): number {
  const phase = (t / 1000 / (2.5 + (seed % 5) * 0.6) + seed * 0.37) % 1
  return phase < 0.12 ? 0.25 : 1
}
