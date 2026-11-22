import { rand, W, H, type Canvas, type World } from '../canvas'

type P = [number, number]

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/** Height of a piecewise-linear outline at x. Points are sorted by x. */
function interp(pts: P[], x: number): number {
  if (x <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x1, y1] = pts[i - 1]
      const [x2, y2] = pts[i]
      return x2 === x1 ? y2 : y1 + ((x - x1) / (x2 - x1)) * (y2 - y1)
    }
  }
  return pts[pts.length - 1][1]
}

/** Recolour pixels that currently have one of the `from` colours (optionally dithered). */
function swap(c: Canvas, x: number, y: number, w: number, h: number, from: string[], to: string, density = 1) {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const X = Math.round(x + i)
      const Y = Math.round(y + j)
      if (X < 0 || X >= W || Y < 0 || Y >= H) continue
      const cur = c.get(X, Y)
      if (cur !== undefined && from.includes(cur) && BAYER[Y % 4][X % 4] / 16 < density) c.set(X, Y, to)
    }
}

interface Peak {
  cx: number
  top: number
  /** How far the outline has dropped at distance d from the peak's centre. */
  prof: (d: number) => number
}

/**
 * A range of peaks, mesas or islands: each column is filled from the highest
 * outline down to yMax, lit on the left of its peak and shaded on the right.
 * Columns no higher than `floor` are clamped to it (or skipped if floor = yMax).
 */
function massif(c: Canvas, peaks: Peak[], floor: number, lit: string, shade: string, yMax: number): number[] {
  const tops: number[] = []
  for (let x = 0; x < W; x++) {
    let best = floor
    let col = lit
    for (const p of peaks) {
      const y = p.top + p.prof(Math.abs(x - p.cx))
      if (y < best) {
        best = y
        col = x <= p.cx ? lit : shade
      }
    }
    const top = Math.round(best)
    tops[x] = top
    if (top < yMax) c.rect(x, top, 1, yMax - top, col)
  }
  return tops
}

/**
 * Mirror everything above y0 into the water below it, squashed. Whole rows are
 * replaced by the water colour `tint` as ripples: a share d0 of the rows at
 * the shore, rising to d1 at the bottom.
 */
function reflect(c: Canvas, y0: number, y1: number, squash: number, tint: string, d0 = 0.25, d1 = 0.6) {
  let acc = 0
  for (let y = y0; y < y1; y++) {
    const sy = y0 - 1 - Math.floor((y - y0) * squash)
    const shift = y % 4 === 1 ? 1 : y % 4 === 3 ? -1 : 0
    const f = d0 + ((d1 - d0) * (y - y0)) / (y1 - y0)
    const ripple = Math.floor(acc + f) > Math.floor(acc)
    acc += f
    for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, x + shift))
      const gap = f < 0.9 && rand(y * 31 + Math.floor((x + y * 5) / 13)) < 0.18
      c.set(x, y, ripple && !gap ? tint : ((sy >= 0 ? c.get(sx, sy) : undefined) ?? tint))
    }
  }
}

/** The top half of an ellipse sitting on the line y = base. */
function dome(c: Canvas, cx: number, base: number, rx: number, ry: number, col: string) {
  for (let j = 0; j <= ry; j++) {
    const w = Math.round(rx * Math.sqrt(1 - (j / ry) * (j / ry)))
    c.rect(cx - w, base - j, w * 2 + 1, 1, col)
  }
}

/** A tall, narrow fir with drooping tiers, for framing the sides of a scene. */
function fir(c: Canvas, x: number, base: number, h: number, col: string) {
  for (let r = 0; r < h; r++) {
    const half = Math.floor(0.5 + (r % 7) * 0.45 + r * 0.1)
    c.rect(x - half, base - h + r, half * 2 + 1, 1, col)
  }
}

/** Short horizontal glints on water. */
function glints(c: Canvas, y0: number, y1: number, n: number, seed: number, col: string) {
  for (let i = 0; i < n; i++) {
    const y = y0 + Math.floor(rand(seed + i) * (y1 - y0))
    c.rect(Math.floor(rand(seed + i + 50) * W), y, 3 + Math.floor(rand(seed + i + 90) * 6), 1, col)
  }
}

// ---------------------------------------------------------------- u29 Uluru
const uluru: World = {
  unit: 'u29',
  landmark: 'Uluru',
  place: 'Northern Territory, Australia',
  draw(c) {
    c.sky(['#3a1c5e', '#6b2470', '#a83260', '#dc4a40', '#f47a34', '#fbb04a', '#fdd67a'], 0, 110)

    // Streaks of cloud catching the last light, and a pale early moon.
    for (const [x, y, w] of [[14, 30, 64], [150, 20, 86], [204, 50, 52], [4, 58, 40]] as const) {
      c.rect(x, y, w, 2, '#f47a34')
      c.rect(x + 6, y + 2, w - 16, 1, '#fbb04a')
    }
    c.disc(232, 30, 5, '#fde8c8')

    // Far domes on the horizon.
    for (const [x, r] of [[250, 7], [260, 9], [269, 6]] as const) c.ellipse(x, 110, r, r + 1, '#b0503c')

    // The rock: one long mound with steep ends and a gently rolling top.
    const base = '#d8472a'
    const glow = '#f97a3a'
    const rim = '#ffb054'
    const shade = '#a02c2c'
    const deep = '#74202e'
    const outline: P[] = [[30, 110], [35, 98], [42, 82], [51, 68], [62, 59], [78, 55], [98, 53], [120, 51], [142, 52], [160, 55], [176, 53], [194, 56], [208, 61], [220, 71], [229, 85], [235, 99], [240, 110]]
    const prof: P[] = outline.map(([x, y]) => [x, 110 - (110 - y) * 1.18])
    for (let x = 30; x <= 240; x++) {
      const top = Math.round(interp(prof, x))
      c.rect(x, top, 1, 110 - top, base)
      c.rect(x, top, 1, 2, rim)
      c.dither(x, top + 2, 1, 7, glow, 0.5)
    }
    // Weathered grooves running down the face.
    for (let i = 0; i < 16; i++) {
      const gx = 44 + i * 12 + Math.floor(rand(i + 3) * 7)
      const y0 = Math.round(interp(prof, gx)) + 4 + Math.floor(rand(i + 20) * 8)
      const drift = rand(i + 40) > 0.5 ? 2 : -2
      c.line(gx, y0, gx + drift, 109, shade)
      if (i % 2 === 0) c.line(gx + 1, y0 + 3, gx + 1 + drift, 96, glow)
      if (i % 3 === 0) c.line(gx - 1, y0 + 14, gx - 1 + drift, 109, shade)
    }
    // The base and the far end fall into shadow.
    swap(c, 30, 92, 212, 8, [base], shade, 0.25)
    swap(c, 30, 100, 212, 10, [base, glow], shade, 0.5)
    swap(c, 204, 50, 10, 60, [base, glow], shade, 0.5)
    swap(c, 214, 50, 28, 60, [base, glow, rim], shade)
    for (const gx of [219, 226, 232]) c.line(gx, Math.round(interp(prof, gx)) + 3, gx + 2, 109, deep)

    // Red plain, darkening toward the viewer, dotted with scrub.
    c.sky(['#b4472a', '#8c3328', '#5e2130', '#33142a'], 110, 160)
    for (let i = 0; i < 46; i++) {
      const y = 113 + Math.floor(rand(i + 7) * rand(i + 70) * 34)
      const r = 1 + Math.floor((y - 110) / 12)
      const x = Math.floor(rand(i + 130) * W)
      c.rect(x, y, r * 3 + 1, r, '#33142a')
      c.rect(x + 1, y - 1, r * 3 - 1, 1, '#33142a')
    }
    for (let i = 0; i < 26; i++) c.rect(Math.floor(rand(i + 300) * W), 113 + Math.floor(rand(i + 330) * 26), 3, 1, '#f47a34')

    // Foreground: dark scrub and two desert oaks framing the view.
    const dark = '#1c0c20'
    c.ridge(151, [[2, 3, 1], [1, 11, 0.3]], dark)
    for (let x = 3; x < W; x += 13) c.disc(x + Math.floor(rand(x) * 6), 150, 3 + Math.floor(rand(x + 9) * 4), dark)
    for (const [x, top, s] of [[16, 92, 1], [256, 104, 0.7]] as const) {
      c.rect(x, top, 2, 150 - top, dark)
      c.ellipse(x, top - 4 * s, 10 * s, 9 * s, dark)
      c.ellipse(x - 7 * s, top + 4 * s, 6 * s, 5 * s, dark)
      c.ellipse(x + 8 * s, top + 2 * s, 6 * s, 6 * s, dark)
    }
  },
}

// ----------------------------------------------------------------- u30 Pisa
const pisa: World = {
  unit: 'u30',
  landmark: 'Leaning Tower of Pisa',
  place: 'Pisa, Italy',
  draw(c) {
    c.sky(['#3a8fd8', '#58a6e4', '#80c0ee', '#aad8f4', '#d4ecf8'], 0, 124)
    c.disc(40, 30, 9, '#fffbe0')
    for (const [x, y, w] of [[70, 22, 44], [226, 34, 36], [130, 52, 30], [8, 62, 34]] as const) {
      c.cloud(x, y, w, '#ffffff')
      c.rect(x + 9, y + 7, w - 16, 2, '#d4ecf8')
    }

    // Far hills, then a line of trees behind the square.
    c.ridge(104, [[4, 2, 0.5], [2, 5, 2]], '#9ccbe8', 124)
    c.ridge(114, [[1, 9, 0], [1, 23, 1]], '#4f9a68', 124)
    for (let x = 4; x < W; x += 21) c.tri(x + Math.floor(rand(x) * 8), 100 + Math.floor(rand(x + 2) * 6), 118, 2, '#3c7c58')

    // The cathedral: nave, transept, apse and a grey dome over the crossing.
    const m = '#f6eedd'
    const ms = '#cfc4b6'
    const roof = '#9aa7ba'
    const roofS = '#73809a'
    const arch = '#8a7f90'
    c.rect(34, 100, 118, 24, m) // aisle
    c.rect(40, 86, 108, 14, m) // clerestory
    c.poly([[38, 86], [150, 86], [146, 80], [42, 80]], roof)
    c.rect(34, 97, 118, 3, roof)
    c.rect(34, 99, 118, 1, roofS)
    c.rect(26, 84, 18, 40, m) // west front with its gable
    c.tri(35, 74, 84, 10, m)
    c.rect(26, 84, 18, 1, ms)
    c.rect(100, 84, 26, 40, m) // transept
    c.tri(113, 74, 84, 14, m)
    c.poly([[113, 74], [127, 84], [118, 84]], ms)
    c.rect(118, 84, 8, 40, ms)
    c.rect(148, 102, 15, 22, ms) // apse
    dome(c, 155, 102, 8, 6, roofS)
    c.rect(104, 62, 19, 14, m) // drum and dome
    c.rect(117, 62, 6, 14, ms)
    for (const x of [106, 110, 114, 119]) c.rect(x, 66, 2, 5, arch)
    dome(c, 113, 62, 11, 13, roof)
    c.rect(102, 62, 23, 1, ms)
    swap(c, 117, 48, 10, 14, [roof], roofS)
    c.rect(107, 53, 2, 6, '#c4cedc')
    c.rect(112, 44, 3, 5, m)
    c.rect(113, 40, 1, 4, roofS)
    for (let y = 104; y < 124; y += 5) swap(c, 26, y, 136, 1, [m], ms) // banded marble
    for (let x = 37; x < 148; x += 5) {
      if (x > 98 && x < 127) continue
      c.rect(x, 89, 2, 5, arch)
      c.rect(x, 109, 2, 7, arch)
    }
    for (let x = 28; x < 44; x += 4) for (const y of [80, 88, 96]) c.rect(x, y, 2, 3, arch)
    c.rect(33, 112, 5, 12, arch)
    for (const x of [104, 110]) c.rect(x, 92, 3, 8, arch)
    c.rect(107, 112, 5, 12, arch)

    // The tower: a base storey, six open galleries and a narrower belfry, all sheared to lean.
    const wall = ['#fbf4e4', '#cdc1b4']
    const trim = ['#ffffff', '#e4dacc']
    const open = ['#857a8c', '#665e74']
    const blind = ['#ddd2c0', '#b3a79c']
    const cx = 198
    const by = 124
    const lean = 0.105
    for (let h = 0; h < 100; h++) {
      const belfry = h >= 86
      const half = belfry ? 8 : 12
      const r = belfry ? h - 86 : h < 20 ? h : (h - 20) % 11
      const cornice = belfry ? r === 13 : h < 20 ? r === 19 : r === 10
      for (let u = -half - 1; u <= half + 1; u++) {
        if (Math.abs(u) > half && !cornice) continue
        const s = u > half * 0.3 ? 1 : 0
        const k = (((u + half) % 4) + 4) % 4
        let col = wall[s]
        if (cornice) col = trim[s]
        else if (h < 20) {
          if ((r >= 3 && r <= 14 && k !== 0) || (r === 15 && k === 2)) col = blind[s]
        } else if ((r >= 2 && r <= 7 && k !== 0) || (r === 8 && k === 2)) col = open[s]
        const x = cx + u + Math.round(h * lean)
        c.set(x, by - h + Math.round((x - cx) * lean), col)
      }
    }

    // Lawn, the tower's shadow, a few visitors.
    c.sky(['#8ad85a', '#6cc04a', '#4a9c42', '#2c7038'], 124, 160)
    c.rect(0, 124, W, 1, '#b8e87a')
    c.dither(196, 126, 54, 4, '#2c7038', 0.5)
    for (const x of [58, 72, 90, 138, 170, 226, 240]) {
      c.rect(x, 124, 2, 4, x % 4 === 0 ? '#d8483a' : '#2a3a5a')
      c.set(x, 123, '#f0c8a0')
      c.set(x + 1, 123, '#f0c8a0')
    }

    // Foreground hedge and trees.
    const dark = '#153c2a'
    c.ridge(151, [[2, 4, 0.2], [1, 12, 1.4]], dark)
    for (let x = 2; x < W; x += 15) c.disc(x + Math.floor(rand(x + 1) * 6), 150, 4 + Math.floor(rand(x + 4) * 4), dark)
  },
}

// ------------------------------------------------------- u31 Sagrada Família
const sagrada: World = {
  unit: 'u31',
  landmark: 'Sagrada Família',
  place: 'Barcelona, Spain',
  draw(c) {
    c.sky(['#3c7a9c', '#5c9aa8', '#9cbca8', '#e0cc90', '#f8c868', '#f8a850'], 0, 132)

    // A big low sun and thin clouds.
    c.disc(228, 98, 16, '#fde4a0')
    c.disc(228, 98, 12, '#fff6d4')
    for (const [x, y, w] of [[18, 36, 50], [196, 28, 46], [30, 70, 34]] as const) {
      c.rect(x, y, w, 2, '#f8e0b0')
      c.rect(x + 8, y + 2, w - 18, 1, '#e0cc90')
    }

    // Far hills and a hazy city.
    c.ridge(112, [[5, 1.5, 2.4], [2, 4, 0.3]], '#e8a060', 140)
    for (let x = 0; x < W; x += 8) {
      const h = 8 + Math.floor(rand(x + 13) * 14)
      c.rect(x, 128 - h, 7, h + 20, '#c88058')
    }

    // A spire: a tapering cigar with a lit side, a shaded side and rows of openings.
    const spire = (cx: number, tip: number, base: number, w: number, lit: string, mid: string, shade: string, slots = true) => {
      for (let y = tip; y <= base; y++) {
        const hw = Math.min(w, Math.round(0.4 + w * Math.pow((y - tip) / 58, 0.62)))
        c.rect(cx - hw, y, hw * 2 + 1, 1, mid)
        c.rect(cx - hw, y, Math.max(1, Math.ceil(hw * 0.6)), 1, lit)
        if (hw > 0) c.rect(cx + hw - Math.ceil(hw * 0.6) + 1, y, Math.ceil(hw * 0.6), 1, shade)
        if (slots && hw >= 2 && (y - tip) % 3 === 0 && y > tip + 12) c.rect(cx - hw + 2, y, hw * 2 - 3, 1, '#5a3440')
      }
    }

    // The tall central tower with its cross, and the star-topped tower beside it.
    spire(133, 22, 118, 10, '#f6e2b4', '#d8b88c', '#a88468', false)
    for (let y = 40; y < 112; y += 6) c.rect(130, y, 2, 3, '#a88468')
    for (let y = 43; y < 112; y += 6) c.rect(136, y, 2, 3, '#7c5c54')
    c.rect(133, 13, 1, 9, '#fff6d4')
    c.rect(130, 15, 7, 1, '#fff6d4')
    c.rect(132, 14, 3, 3, '#fff6d4')
    spire(176, 46, 118, 8, '#f6e2b4', '#d8b88c', '#a88468', false)
    for (let y = 62; y < 112; y += 6) c.rect(175, y, 2, 3, '#a88468')
    c.rect(176, 38, 1, 8, '#fff6d4')
    c.rect(173, 41, 7, 1, '#fff6d4')
    c.rect(175, 40, 3, 3, '#fff6d4')

    // The four bell towers of the facade, inner pair taller, each with a bright finial.
    for (const [cx, tip] of [[102, 46], [120, 34], [146, 34], [164, 46]] as const) {
      spire(cx, tip, 118, 5, '#e8b070', '#c08858', '#8a5a4c')
      c.rect(cx - 1, tip - 4, 3, 3, '#fde4a0')
      c.set(cx, tip - 5, '#e8452f')
      c.set(cx, tip - 1, '#e8452f')
    }

    // The facade: three gabled portals between the tower bases.
    c.rect(94, 110, 80, 30, '#c08858')
    c.rect(146, 110, 28, 30, '#8a5a4c')
    for (const [x, top, half] of [[109, 102, 9], [133, 92, 12], [157, 102, 9]] as const) {
      c.tri(x, top, 112, half, '#e8b070')
      c.poly([[x, top], [x + half, 112], [x, 112]], '#8a5a4c')
      c.rect(x - 3, 122, 7, 14, '#5a3440')
      c.tri(x, 117, 122, 3, '#5a3440')
    }
    c.disc(133, 106, 3, '#fde4a0')

    // Construction cranes.
    const steel = '#5a3440'
    c.rect(200, 36, 1, 90, steel)
    c.rect(184, 36, 40, 1, steel)
    c.line(200, 30, 222, 36, steel)
    c.line(200, 30, 186, 36, steel)
    c.rect(185, 37, 4, 3, steel)
    c.rect(216, 37, 1, 10, steel)
    c.rect(72, 58, 1, 70, steel)
    c.rect(58, 58, 28, 1, steel)
    c.line(72, 53, 60, 58, steel)
    c.line(72, 53, 84, 58, steel)
    c.rect(82, 59, 3, 3, steel)

    // City blocks in front, then a dark line of park trees.
    for (let x = -4; x < W; x += 15) {
      const h = 12 + Math.floor(rand(x + 71) * 16)
      const w = 11 + Math.floor(rand(x + 5) * 4)
      c.rect(x, 146 - h, w, h + 20, '#5a3440')
      c.rect(x, 146 - h, 2, h + 20, '#8a5a4c')
      c.windows(x + 3, 149 - h, w - 4, h - 6, '#fde4a0', 3, 4, x, 0.3)
    }
    const dark = '#26182c'
    c.ridge(151, [[2, 4, 1.2], [1, 12, 0.4]], dark)
    for (let x = 3; x < W; x += 12) c.disc(x + Math.floor(rand(x + 2) * 6), 150, 4 + Math.floor(rand(x + 8) * 4), dark)
  },
}

// ------------------------------------------------------------ u32 Matterhorn
const matterhorn: World = {
  unit: 'u32',
  landmark: 'Matterhorn',
  place: 'Zermatt, Switzerland',
  draw(c) {
    c.sky(['#2b3a6e', '#4c5a96', '#8a78b0', '#d48fa8', '#f6b596', '#fddcb0'], 0, 100)
    c.stars(14, 5, 26, '#e8e4f8')
    for (const [x, y, w] of [[176, 54, 48], [20, 62, 40], [208, 70, 44]] as const) {
      c.rect(x, y, w, 2, '#f6b596')
      c.rect(x + 6, y + 2, w - 14, 1, '#fddcb0')
    }

    // Far snowy range.
    c.ridge(84, [[5, 2.5, 0.4], [3, 6, 2.2], [1.5, 15, 1]], '#a898c8', 100)
    c.ridge(90, [[3, 3, 1.4], [2, 8, 0.2]], '#7c78b0', 100)

    // The peak: a sunlit east face and a shadowed north face meeting at a hooked summit.
    const snow = '#c8b8dc'
    const rock = '#786c9c'
    const glow = '#ffc8a0'
    const glowRock = '#e08870'
    const north = '#565a92'
    const northSnow = '#9c9ccc'
    const ridge: P[] = [[142, 100], [139, 84], [134, 62], [129, 40], [124, 26], [119, 20]]
    c.poly([[116, 18], [113, 21], [118, 27], [118, 36], [113, 48], [105, 62], [95, 71], [81, 85], [60, 96], [40, 100], ...ridge], snow)
    c.poly([[116, 18], [122, 18], [127, 21], [133, 28], [138, 38], [145, 45], [151, 48], [160, 61], [175, 79], [196, 94], [214, 100], ...ridge], north)
    for (const [x1, y1, x2, y2] of [[124, 28, 120, 44], [128, 44, 114, 70], [131, 62, 112, 88], [119, 64, 98, 84], [135, 80, 124, 99], [106, 78, 82, 97], [96, 76, 70, 95]] as const) c.line(x1, y1, x2, y2, rock, 2)
    for (const [x1, y1, x2, y2] of [[132, 32, 138, 50], [142, 50, 154, 72], [150, 54, 172, 84], [140, 64, 150, 94], [160, 76, 186, 96]] as const) c.line(x1, y1, x2, y2, northSnow, 2)
    // First light on the upper east face.
    swap(c, 90, 14, 60, 42, [snow], glow)
    swap(c, 90, 14, 60, 42, [rock], glowRock)
    swap(c, 80, 56, 70, 8, [snow], glow, 0.5)
    swap(c, 80, 56, 70, 8, [rock], glowRock, 0.5)

    // Dark foothills, pines and chalets along the shore.
    const hill = '#2e3460'
    c.ridge(93, [[3, 2, 4], [1.5, 7, 0.5]], hill, 100)
    for (let x = 3; x < W; x += 7) c.pine(x + Math.floor(rand(x + 6) * 3), 99, 5 + Math.floor(rand(x + 1) * 7), '#1c2248')
    for (const [x, y] of [[40, 99], [58, 98], [222, 99], [236, 98]] as const) {
      c.rect(x, y - 5, 10, 6, '#3c2430')
      c.poly([[x - 2, y - 5], [x + 5, y - 10], [x + 12, y - 5]], '#e8d8e8')
      c.rect(x + 2, y - 3, 2, 2, '#ffd27a')
      c.rect(x + 6, y - 3, 2, 2, '#ffd27a')
    }

    // The lake holds a squashed mirror image of it all.
    reflect(c, 100, 160, 1.45, '#2b3a6e', 0.25, 0.6)
    c.rect(0, 100, W, 1, '#1c2248')
    glints(c, 104, 150, 14, 9, '#f6b596')

    // Foreground: rocks on the near shore and tall firs framing the sides.
    const dark = '#12142e'
    c.ridge(153, [[2, 3, 2], [1, 10, 0.7]], dark)
    for (const [x, h] of [[5, 84], [17, 62], [28, 40], [244, 44], [256, 70], [267, 90]] as const) fir(c, x, 158, h, dark)
  },
}

// ---------------------------------------------------------- u33 Moraine Lake
const moraine: World = {
  unit: 'u33',
  landmark: 'Moraine Lake',
  place: 'Banff, Canada',
  draw(c) {
    c.sky(['#2472c8', '#3f8cd8', '#62a8e6', '#8ec4f0', '#b8dcf6'], 0, 92)
    c.cloud(196, 16, 40, '#ffffff')
    c.cloud(24, 26, 30, '#ffffff')

    // The wall of ten peaks: lit on the left, shaded on the right.
    const lit = '#93a4c2'
    const shade = '#55648e'
    const snow = '#f6fafd'
    const snowS = '#b9c7e2'
    const summits: [number, number, number][] = [[8, 52, 1.5], [33, 39, 1.7], [58, 47, 1.3], [90, 27, 1.6], [117, 41, 1.9], [149, 19, 1.5], [178, 37, 1.8], [205, 29, 1.4], [237, 45, 1.6], [262, 53, 1.3]]
    const peaks: Peak[] = summits.map(([cx, top, k], i) => ({ cx, top, prof: (d) => d * k + 2 * Math.sin(d * 0.8 + i * 2) }))
    const sk = massif(c, peaks, 80, lit, shade, 92)
    for (let x = 0; x < W; x++) {
      if (sk[x] >= 80) continue
      const cap = Math.max(2, Math.round((64 - sk[x]) / 4))
      c.rect(x, sk[x], 1, cap, c.get(x, sk[x]) === lit ? snow : snowS)
    }
    // Snow lying in broken lines along the rock ledges.
    for (let y = 46; y < 78; y += 6)
      for (let x = 0; x < W; x += 5) {
        if (rand(x * 7 + y) < 0.45) continue
        const yy = y + Math.floor(rand(Math.floor(x / 30) + 4) * 4)
        swap(c, x, yy, 5, 1, [lit], snow)
        swap(c, x, yy, 5, 1, [shade], snowS)
      }
    // Scree fans at the foot of the wall.
    c.ridge(82, [[2, 5, 0.4], [1.5, 14, 1.2]], '#c2ccdc', 92)
    c.ridge(87, [[1.5, 7, 2], [1, 19, 0.2]], '#93a4c2', 92)

    // Forested slopes running down to the water on both sides.
    const forest = '#1c5048'
    c.poly([[0, 58], [18, 66], [44, 78], [78, 87], [112, 91], [0, 91]], forest)
    c.poly([[272, 66], [250, 74], [224, 83], [196, 88], [170, 91], [272, 91]], forest)
    for (let x = 0; x < 112; x += 5) c.pine(x, Math.round(interp([[0, 58], [18, 66], [44, 78], [78, 87], [112, 91]], x)) + 3, 9, forest)
    for (let x = 172; x < W; x += 5) c.pine(x, Math.round(interp([[170, 91], [196, 88], [224, 83], [250, 74], [272, 66]], x)) + 3, 9, forest)
    swap(c, 0, 58, 112, 34, [forest], '#2c7058', 0.25)

    // The lake: turquoise, with the peaks mirrored in it.
    reflect(c, 91, 160, 1.3, '#1fb8bc', 0.5, 1.15)
    c.rect(0, 91, W, 1, '#a4f0e0')
    glints(c, 94, 150, 18, 4, '#7fe8dc')

    // A red canoe with one paddler.
    c.rect(140, 107, 22, 2, '#e0443a')
    c.rect(138, 106, 3, 1, '#e0443a')
    c.rect(161, 106, 3, 1, '#e0443a')
    c.rect(142, 109, 18, 1, '#8c2430')
    c.rect(151, 102, 3, 5, '#1c2a44')
    c.rect(151, 100, 3, 2, '#f0c8a0')
    c.line(155, 102, 159, 109, '#f6e6b0')
    c.rect(140, 111, 20, 1, '#a4f0e0')

    // Foreground: the rock pile and tall dark pines on either side.
    const dark = '#0c2a2c'
    c.ridge(154, [[2, 3, 0.4], [1, 9, 2]], dark)
    for (const [x, h] of [[4, 92], [15, 66], [27, 78], [40, 46], [51, 30], [226, 32], [238, 52], [249, 76], [260, 60], [269, 96]] as const) fir(c, x, 158, h, dark)
  },
}

// ----------------------------------------------------------- u34 Ha Long Bay
const halong: World = {
  unit: 'u34',
  landmark: 'Ha Long Bay',
  place: 'Quang Ninh, Vietnam',
  draw(c) {
    c.sky(['#9cc0cc', '#b4d0d0', '#cfe0d0', '#e8e8cc', '#f6e8c0'], 0, 98)
    // A pale sun through the haze.
    c.disc(206, 34, 12, '#f6ecd0')
    c.disc(206, 34, 9, '#fffbe8')

    // Water, lightest at the horizon.
    c.sky(['#cfe4d4', '#a4d0c4', '#78b8b0', '#509c9c', '#347c84'], 98, 160)

    // A limestone island: sheer sides, a lumpy top, and a faint reflection.
    const karst = (parts: [number, number, number][], base: number, lit: string, shade: string) => {
      const peaks: Peak[] = parts.map(([cx, w, h]) => ({
        cx,
        top: base - h,
        prof: (d) => h * Math.pow(d / (w / 2), 3) + 2 * Math.sin(d * 0.55 + cx) + Math.sin(d * 1.3 + cx * 2),
      }))
      const tops = massif(c, peaks, base, lit, shade, base)
      for (let x = 0; x < W; x++) {
        if (tops[x] >= base) continue
        const depth = Math.round((base - tops[x]) * 0.3)
        for (let j = 0; j < depth; j++) if (j < 2 || (j % 2 === 0 && rand(j * 17 + Math.floor((x + j * 3) / 9) + base) > 0.2)) c.set(x, base + j, shade)
      }
      return tops
    }
    // Far islands, almost lost in the haze, then a middle rank.
    karst([[18, 30, 20], [64, 40, 30], [150, 34, 36], [192, 26, 20], [246, 44, 26]], 98, '#bcd4c8', '#bcd4c8')
    karst([[128, 30, 52], [108, 22, 30], [266, 30, 46], [176, 16, 22]], 100, '#8cb8a6', '#74a498')

    // The near islands: green tops over pale grey cliffs.
    const green = '#3c8866'
    const greenS = '#27625a'
    const cliff = '#a8b8a0'
    const near = (parts: [number, number, number][], base: number) => {
      const tops = karst(parts, base, green, greenS)
      for (let x = 0; x < W; x++) {
        if (tops[x] >= base) continue
        c.rect(x, tops[x], 1, 2, '#68ac78')
        // Bare rock shows in vertical streaks on the lit side.
        if (rand(Math.floor(x / 2) * 3 + base) > 0.6 && c.get(x, base - 6) === green) {
          const len = 4 + Math.floor(rand(x + 1) * (base - tops[x]) * 0.5)
          c.rect(x, base - len, 1, len, cliff)
        }
      }
      swap(c, 0, base - 3, W, 3, [green], cliff)
      swap(c, 0, base - 3, W, 3, [greenS], '#74a498')
      swap(c, 0, base - 1, W, 1, [green, greenS, cliff, '#74a498'], '#1c4448')
    }
    near([[56, 44, 80], [84, 28, 54], [28, 34, 46]], 104)
    near([[232, 34, 62], [254, 26, 40]], 106)
    glints(c, 102, 156, 30, 6, '#e8f0dc')

    // A junk under three ribbed sails.
    const hull = '#44262c'
    const sail = '#e0603a'
    const rib = '#a83c30'
    const jx = 160
    const wl = 122
    c.poly([[jx - 26, wl - 8], [jx - 20, wl], [jx + 18, wl], [jx + 27, wl - 13], [jx + 19, wl - 7], [jx - 14, wl - 6]], hull)
    c.rect(jx - 18, wl - 6, 34, 1, '#7c4a3c')
    const mast = (mx: number, top: number, w: number) => {
      c.rect(jx + mx, wl - top - 3, 1, top - 3, hull)
      const y0 = wl - top
      const y1 = wl - 9
      c.poly([[jx + mx - 3, y0 + 4], [jx + mx + w * 0.5, y0], [jx + mx + w, y0 + (y1 - y0) * 0.3], [jx + mx + w + 1, y0 + (y1 - y0) * 0.75], [jx + mx + w - 2, y1], [jx + mx - 3, y1]], sail)
      for (let y = y0 + 4; y < y1; y += 4) swap(c, jx + mx - 4, y, w + 8, 1, [sail], rib)
      swap(c, jx + mx - 3, y0, 2, y1 - y0 + 1, [sail], '#f89058')
    }
    mast(-17, 30, 10)
    mast(-3, 48, 15)
    mast(15, 32, 9)
    c.rect(jx - 20, wl + 1, 38, 1, hull)
    c.rect(jx - 16, wl + 3, 30, 1, hull)
    c.rect(jx - 10, wl + 5, 18, 1, rib)
    c.rect(jx - 6, wl + 7, 12, 1, rib)

    // A small sampan nearer the viewer.
    c.poly([[58, 139], [61, 142], [80, 142], [84, 138], [79, 140], [62, 140]], hull)
    c.rect(68, 136, 6, 4, hull)
    c.rect(76, 133, 1, 7, hull)
  },
}

// ---------------------------------------------------------- u35 Grand Canyon
const canyon: World = {
  unit: 'u35',
  landmark: 'Grand Canyon',
  place: 'Arizona, USA',
  draw(c) {
    c.sky(['#4f96d2', '#78b2e0', '#a8cfe8', '#e2d8c6', '#f4cfa0'], 0, 50)
    c.cloud(40, 10, 44, '#fff6e4')
    c.cloud(180, 18, 34, '#fff6e4')

    // A butte outline: a flat top, then alternating sheer cliffs and talus slopes.
    const steps = (hw: number, n: number, cliff: number, slope: number) => {
      const pts: P[] = [[0, 0], [hw, 0]]
      let d = hw
      let y = 0
      for (let i = 0; i < n; i++) {
        y += cliff
        pts.push([d + 0.01, y])
        d += slope
        y += slope * 0.6
        pts.push([d, y])
      }
      pts.push([d + 300, y + 40])
      return (dist: number) => interp(pts, dist)
    }
    const layer = (parts: [number, number, number][], n: number, cliff: number, slope: number, floor: number, lit: string, shade: string, cap: string, band: string, bandS: string) => {
      const tops = massif(c, parts.map(([cx, top, hw]) => ({ cx, top, prof: steps(hw, n, cliff, slope) })), floor, lit, shade, H)
      // Horizontal strata, then a sunlit cap on every ledge.
      for (let y = Math.min(...tops) + 5; y < floor; y += cliff + 1) {
        swap(c, 0, y, W, 2, [lit], band)
        swap(c, 0, y, W, 2, [shade], bandS)
      }
      for (let x = 0; x < W; x++) c.rect(x, tops[x], 1, 2, cap)
    }

    // The far rim: dead flat, pale with distance.
    layer([[58, 45, 44], [206, 44, 52]], 1, 2, 5, 48, '#c2a6c0', '#c2a6c0', '#d8c0cc', '#b698b8', '#b698b8')
    // Three ranks of temples and buttes, warmer and darker as they come nearer.
    layer([[36, 55, 10], [92, 51, 5], [148, 57, 14], [212, 53, 7], [258, 58, 10]], 2, 4, 6, 70, '#d49aa2', '#b47e9c', '#f0c4b4', '#c4868e', '#a47092')
    layer([[14, 62, 16], [116, 66, 7], [178, 61, 12], [252, 67, 16]], 3, 6, 7, 92, '#e48a58', '#b85e52', '#fcc890', '#cc6c48', '#a04c4c')
    layer([[26, 76, 26], [88, 96, 6], [198, 100, 7], [250, 82, 22]], 3, 9, 9, 124, '#c8502e', '#8c2e30', '#f8a860', '#a83c2a', '#742430')

    // The inner gorge winds across the platform, with the river at the bottom of it.
    const path: P[] = [[100, 150], [110, 142], [121, 151], [132, 141], [146, 150], [160, 160]]
    for (let y = 100; y < H; y++) {
      const x = Math.round(interp(path, y))
      const w = 1 + Math.floor((y - 100) / 9)
      c.rect(x - w - 3, y, w * 2 + 8, 1, '#742430')
      c.rect(x + w, y, 5, 1, '#4c1830')
      c.rect(x - w + 1, y, w * 2 - 1, 1, '#3ca090')
      if (y % 7 === 3) c.rect(x - 1, y, 2, 1, '#a8e0c8')
    }

    // Foreground: the dark near rim with a twisted juniper.
    const dark = '#2c1020'
    c.poly([[0, 118], [22, 120], [40, 126], [58, 138], [84, 148], [110, 156], [110, 160], [0, 160]], dark)
    c.poly([[272, 132], [250, 136], [232, 146], [206, 154], [190, 160], [272, 160]], dark)
    c.line(0, 118, 22, 120, '#8c2e30')
    c.line(22, 120, 40, 126, '#8c2e30')
    c.line(30, 122, 34, 108, dark, 2)
    c.line(34, 108, 28, 100, dark, 2)
    c.line(34, 110, 42, 102, dark)
    c.ellipse(27, 98, 8, 4, dark)
    c.ellipse(43, 101, 6, 3, dark)
    c.ellipse(34, 94, 5, 3, dark)
  },
}

// ----------------------------------------------------------- u36 Kilimanjaro
const kilimanjaro: World = {
  unit: 'u36',
  landmark: 'Mount Kilimanjaro',
  place: 'Kilimanjaro, Tanzania',
  draw(c) {
    c.sky(['#6a5aa0', '#a868a0', '#e0808c', '#f8a878', '#fcd088', '#fff0b8'], 0, 102)
    // The sun coming up beside the mountain's foot.
    c.disc(34, 88, 15, '#ffe8a0')
    c.disc(34, 88, 11, '#fffbe0')
    for (const [x, y, w] of [[60, 50, 50], [204, 40, 46], [8, 34, 36]] as const) {
      c.rect(x, y, w, 2, '#fcd088')
      c.rect(x + 6, y + 2, w - 14, 1, '#f8a878')
    }

    // The mountain: long gentle slopes up to a broad flat summit.
    const lit = '#a884b4'
    const shade = '#6c62a4'
    const prof: P[] = [[20, 102], [44, 94], [70, 84], [94, 71], [114, 57], [128, 45], [138, 38], [146, 35], [158, 34], [172, 35], [182, 34], [190, 37], [200, 44], [214, 56], [232, 70], [252, 82], [272, 90]]
    for (let x = 20; x < W; x++) {
      const top = Math.round(interp(prof, x))
      for (let y = top; y < 102; y++) c.set(x, y, x < 152 - (y - 34) * 0.22 + 3 * Math.sin(y * 0.3) ? lit : shade)
    }
    // Gullies down the flanks.
    for (const [x1, y1, x2, y2] of [[120, 56, 96, 96], [136, 46, 126, 98], [104, 70, 70, 98], [196, 46, 214, 96], [178, 44, 184, 98], [222, 68, 250, 98]] as const) c.line(x1, y1, x2, y2, x1 < 150 ? '#8c70a8' : '#584e94')
    // The snow cap, with glaciers fingering down from the rim.
    for (let x = 124; x <= 204; x++) {
      const top = Math.round(interp(prof, x))
      const edge = Math.min(x - 124, 204 - x)
      const len = Math.min(edge * 0.8, 5 + 3 * Math.sin(x * 0.5) + 2 * Math.sin(x * 1.3 + 1) + (x % 9 < 2 ? 5 : 0))
      c.rect(x, top, 1, Math.max(1, Math.round(len)), c.get(x, top + 1) === lit ? '#fff8ec' : '#d4c8e4')
    }
    // Morning haze hides the foot, so the summit floats above the plain.
    c.dither(0, 88, W, 6, '#fcd088', 0.5)
    c.dither(0, 94, W, 8, '#fff0b8', 0.75)

    // Savanna grass, gold to brown.
    c.sky(['#e8b050', '#cc8c3c', '#945c30', '#54302a'], 102, 160)
    c.ridge(101, [[1, 6, 0.3], [1, 17, 2]], '#8c5c40', 105)
    for (let i = 0; i < 40; i++) c.rect(Math.floor(rand(i + 11) * W), 106 + Math.floor(rand(i + 50) * 40), 4, 1, '#945c30')

    // Flat-topped acacias: an umbrella canopy on forked branches.
    const acacia = (x: number, y: number, s: number, col: string) => {
      const rx = Math.round(s * 0.6)
      const ry = Math.max(2, Math.round(s * 0.16))
      const top = y - s
      dome(c, x, top + ry, rx, ry, col)
      const t = s > 30 ? 2 : 1
      const fork = y - Math.round(s * 0.45)
      c.rect(x, fork, t, y - fork, col)
      for (const k of [-0.7, -0.3, 0.25, 0.7]) c.line(x, fork, x + Math.round(rx * k), top + ry, col, t)
    }
    for (const [x, s] of [[20, 10], [60, 8], [96, 12], [150, 9], [188, 11], [128, 7]] as const) acacia(x, 105, s, '#6c4438')
    const dark = '#24141e'
    acacia(66, 124, 26, '#3c2028')
    acacia(218, 152, 64, dark)

    // A giraffe walking through.
    const giraffe = (x: number, y: number, s: number, dir: 1 | -1, col: string) => {
      const p = (pts: P[]) => c.poly(pts.map(([px, py]) => [x + dir * px * s, y + py * s] as P), col)
      p([[0, -22], [14, -25], [17, -17], [14, -13], [1, -13], [-1, -17]])
      p([[11, -24], [16, -22], [23, -41], [20, -42]])
      p([[19, -43], [22, -44], [28, -40], [27, -38], [21, -38]])
      p([[20, -46], [21, -46], [21, -43], [20, -43]])
      for (const lx of [0, 3, 12, 15]) p([[lx, -14], [lx + 1.6, -14], [lx + 1.2, 0], [lx, 0]])
      c.line(x - dir * s, y - 19 * s, x - dir * 3 * s, y - 9 * s, col)
    }
    giraffe(116, 140, 1, 1, dark)
    giraffe(160, 128, 0.6, -1, '#3c2028')

    // Foreground grass.
    c.ridge(153, [[1.5, 4, 1], [1, 15, 0.2]], dark)
    for (let x = 1; x < W; x += 5) c.line(x, 153, x + (rand(x) > 0.5 ? 2 : -2), 147 + Math.floor(rand(x + 3) * 4), dark)
  },
}

// -------------------------------------------------------- u37 Monument Valley
const monument: World = {
  unit: 'u37',
  landmark: 'Monument Valley',
  place: 'Arizona–Utah, USA',
  night: true,
  draw(c) {
    c.sky(['#17163a', '#262460', '#463488', '#7a4698', '#b85c94', '#e88880', '#f8b888'], 0, 114)
    c.stars(36, 11, 52)
    c.disc(196, 30, 6, '#fff0d0')
    c.rect(194, 28, 2, 2, '#e0c8c0')
    c.rect(198, 32, 2, 1, '#e0c8c0')

    // Far mesas on the horizon.
    for (const [x, w, h] of [[0, 30, 8], [98, 22, 6], [176, 34, 9], [250, 22, 7]] as const) c.poly([[x - 4, 114], [x, 114 - h], [x + w, 114 - h], [x + w + 4, 114]], '#a05488')

    // The plain.
    c.sky(['#7a3458', '#5a2650', '#3c1a42', '#241232'], 114, 160)
    c.rect(0, 114, W, 1, '#b85c94')

    // A butte: a sheer block on a sloping skirt of rubble, with an optional "thumb" spire.
    const lit = '#d86444'
    const mid = '#a83c44'
    const shade = '#6c2850'
    const talus = '#58224c'
    const talusLit = '#80344e'
    const butte = (cx: number, top: number, hw: number, thumb: -1 | 0 | 1, seed: number) => {
      const base = 114
      const foot = Math.round(base - (base - top) * 0.36)
      c.poly([[cx - hw - 26, base], [cx - hw - 3, foot], [cx + hw + 3, foot], [cx + hw + 26, base]], talus)
      c.poly([[cx - hw - 26, base], [cx - hw - 3, foot], [cx - hw + 4, foot], [cx - hw - 6, base]], talusLit)
      if (thumb !== 0) {
        const tx = cx + thumb * (hw + 8)
        c.poly([[cx, foot - 12], [tx - 3 * thumb, foot - 12], [tx + 4 * thumb, foot + 2], [cx, foot + 2]], thumb < 0 ? mid : shade)
        c.rect(tx - 2, top + 12, 5, foot - top - 10, mid)
        c.rect(tx - 2, top + 12, 2, foot - top - 10, lit)
        c.rect(tx + 2, top + 14, 1, foot - top - 12, shade)
        c.rect(tx - 1, top + 10, 2, 2, mid)
      }
      // The block, with a ragged top edge.
      for (let x = cx - hw; x <= cx + hw; x++) {
        const edge = Math.min(x - (cx - hw), cx + hw - x)
        const y = top + (edge < 2 ? 4 - edge * 2 : 0) + Math.floor(rand(seed + Math.floor(x / 3)) * 3)
        const u = (x - cx) / hw
        c.rect(x, y, 1, foot - y + 1, u < -0.45 ? lit : u > 0.35 ? shade : mid)
      }
      // Vertical cracks, and a ledge near the foot.
      for (let x = cx - hw + 3; x < cx + hw - 1; x += 3 + Math.floor(rand(seed + x) * 3)) c.rect(x, top + 5 + Math.floor(rand(x + seed) * 8), 1, foot - top - 8, x - cx < -0.45 * hw ? mid : shade)
      c.rect(cx - hw - 1, foot - 3, hw * 2 + 3, 1, shade)
    }
    butte(58, 30, 17, 1, 3) // West Mitten
    butte(150, 46, 14, -1, 8) // East Mitten
    butte(232, 54, 24, 0, 5) // Merrick Butte

    // The road, running straight toward the buttes.
    c.poly([[80, 160], [126, 160], [112, 114], [110, 114]], '#191228')
    for (let y = 118, n = 0; y < 160; y += 3 + n, n++) c.rect(Math.round(111 + ((y - 114) / 46) * -8 + ((y - 114) / 46) * 0), y, 1 + Math.floor((y - 114) / 20), 2 + Math.floor(n / 2), '#f8c860')

    // Foreground scrub.
    const dark = '#120a22'
    for (let i = 0; i < 30; i++) {
      const y = 120 + Math.floor(rand(i + 5) * 30)
      const w = 4 + Math.floor((y - 114) / 5)
      const x = Math.floor(rand(i + 60) * W)
      if (x > 70 - w && x < 130) continue
      c.rect(x, y, w, 1 + Math.floor((y - 114) / 16), '#241232')
      c.rect(x + 1, y - 1, w - 2, 1, '#241232')
    }
    c.ridge(154, [[1.5, 3, 0.5], [1, 11, 1]], dark)
    for (let x = 2; x < W; x += 14) {
      if (x > 74 && x < 132) continue
      c.disc(x + Math.floor(rand(x + 7) * 6), 153, 3 + Math.floor(rand(x + 2) * 3), dark)
    }
  },
}

export const scenes: World[] = [uluru, pisa, sagrada, matterhorn, moraine, halong, canyon, kilimanjaro, monument]
