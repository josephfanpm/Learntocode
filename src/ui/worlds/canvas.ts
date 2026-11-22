// A tiny pixel-painting toolkit. Every world scene is drawn with these calls
// on a 272×160 grid, so all 38 share one style: banded skies with ordered
// dithering, flat silhouettes, a few highlight colours, no anti-aliasing.
//
// It is plain data (no DOM), so the same code paints the in-app banner and
// the preview images that scripts/render-worlds.ts writes for checking.

export const W = 272
export const H = 160

/** 4×4 Bayer matrix: the classic ordered-dither pattern. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/** A repeatable pseudo-random number in [0, 1) from an integer seed. */
export function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export class Canvas {
  /** One CSS colour per pixel, row by row; undefined = not painted yet. */
  px: (string | undefined)[] = new Array(W * H)

  set(x: number, y: number, c: string) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || x >= W || y < 0 || y >= H) return
    this.px[y * W + x] = c
  }

  get(x: number, y: number): string | undefined {
    return this.px[Math.round(y) * W + Math.round(x)]
  }

  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c)
  }

  /** A checkerboard-style dither of colour `c` over a rectangle. density 0–1. */
  dither(x: number, y: number, w: number, h: number, c: string, density = 0.5) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const X = Math.round(x + i)
        const Y = Math.round(y + j)
        if (BAYER[((Y % 4) + 4) % 4][((X % 4) + 4) % 4] / 16 < density) this.set(X, Y, c)
      }
  }

  /**
   * A sky: horizontal colour bands from top to bottom, with each boundary
   * dithered into the next band so it reads as a gradient.
   */
  sky(colors: string[], y0 = 0, y1 = H) {
    const band = (y1 - y0) / colors.length
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / band
      const i = Math.min(colors.length - 1, Math.floor(t))
      const f = t - i // how far through this band
      for (let x = 0; x < W; x++) {
        // In the last 45% of a band, mix in the next colour with an ordered dither.
        const mix = i < colors.length - 1 && f > 0.55 ? (f - 0.55) / 0.45 : 0
        this.set(x, y, BAYER[y % 4][x % 4] / 16 < mix ? colors[i + 1] : colors[i])
      }
    }
  }

  /** A filled disc. */
  disc(cx: number, cy: number, r: number, c: string) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) this.set(cx + x, cy + y, c)
  }

  /** A filled ellipse. */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1.05) this.set(cx + x, cy + y, c)
  }

  /** A filled polygon (scanline fill). Points are [x, y]. */
  poly(points: [number, number][], c: string) {
    const ys = points.map((p) => p[1])
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const xs: number[] = []
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i]
        const [x2, y2] = points[(i + 1) % points.length]
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1))
      }
      xs.sort((a, b) => a - b)
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) this.set(x, y, c)
    }
  }

  /** A triangle with its point at (cx, top) and a flat base. */
  tri(cx: number, top: number, base: number, half: number, c: string) {
    this.poly([[cx, top], [cx + half, base], [cx - half, base]], c)
  }

  /** A straight line, one pixel thick (or `t` thick). */
  line(x1: number, y1: number, x2: number, y2: number, c: string, t = 1) {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1)
    for (let i = 0; i <= n; i++) this.rect(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n, t, t, c)
  }

  /**
   * Rolling hills or a mountain range filling everything below a wavy line.
   * waves: [height, cycles across the picture, phase]. Bigger height = taller.
   */
  ridge(base: number, waves: [number, number, number][], c: string, yMax = H) {
    for (let x = 0; x < W; x++) {
      const top = Math.round(base + waves.reduce((s, [a, k, p]) => s + a * Math.sin((2 * Math.PI * k * x) / W + p), 0))
      this.rect(x, top, 1, yMax - top, c)
    }
  }

  /** Water: a flat colour with short broken highlight dashes that thin out toward the top. */
  water(y0: number, y1: number, c: string, shine: string, seed = 1) {
    this.rect(0, y0, W, y1 - y0, c)
    for (let y = y0 + 1; y < y1; y += 2)
      for (let x = 0; x < W; x++) {
        const r = rand(seed * 1000 + y * 37 + Math.floor(x / 5))
        if (r > 0.86 - ((y - y0) / (y1 - y0)) * 0.2) this.set(x, y, shine)
      }
  }

  /** Scattered stars above `yMax`. */
  stars(n: number, seed: number, yMax: number, c = '#fff6d8') {
    for (let i = 0; i < n; i++) this.set(Math.floor(rand(seed + i) * W), Math.floor(rand(seed + i + 99) * yMax), c)
  }

  /** A soft pixel cloud. */
  cloud(x: number, y: number, w: number, c: string) {
    this.rect(x, y + 3, w, 4, c)
    this.rect(x + 4, y, w - 12, 3, c)
    this.rect(x + 9, y + 7, w - 16, 2, c)
  }

  /** Lit windows: a grid of dots inside a rectangle, some switched off. */
  windows(x: number, y: number, w: number, h: number, c: string, stepX = 3, stepY = 3, seed = 1, lit = 0.6) {
    for (let j = 0; j < h; j += stepY) for (let i = 0; i < w; i += stepX) if (rand(seed + i * 7 + j * 13) < lit) this.set(x + i, y + j, c)
  }

  /** A pine tree silhouette with its base at (x, y). */
  pine(x: number, y: number, h: number, c: string) {
    for (let r = 0; r < h; r++) this.rect(x - Math.floor((r * 0.45 + 1) / 1), y - h + r, Math.floor(r * 0.45 + 1) * 2 + 1, 1, r % 4 === 3 ? c : c)
    this.rect(x, y, 1, 2, c)
  }

  /** A row of pines along the bottom, for foregrounds. */
  pines(y: number, c: string, seed = 1, step = 9, min = 10, max = 22) {
    for (let x = 2; x < W; x += step) this.pine(x + Math.floor(rand(seed + x) * 4), y, min + Math.floor(rand(seed + x + 5) * (max - min)), c)
  }
}

export interface World {
  /** The unit this scene belongs to, e.g. "u3". */
  unit: string
  /** The landmark, e.g. "Tokyo Tower". */
  landmark: string
  /** Where it is, e.g. "Tokyo, Japan". */
  place: string
  /** Night scenes get twinkling sparkles on top in the app. */
  night?: boolean
  draw: (c: Canvas) => void
}

/** Paint a world and return its pixels. */
export function paint(world: World): Canvas {
  const c = new Canvas()
  world.draw(c)
  return c
}
