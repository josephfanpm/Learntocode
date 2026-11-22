import { rand, W, H, type Canvas, type World } from '../canvas'

// ---------- small helpers shared by the scenes in this file ----------

type Pt = [number, number]

/** Recolour pixels of one colour inside a rectangle: used for lit and shaded sides. */
function tint(c: Canvas, x: number, y: number, w: number, h: number, from: string, to: string) {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const X = Math.round(x + i)
      const Y = Math.round(y + j)
      if (X >= 0 && X < W && Y >= 0 && Y < H && c.get(X, Y) === from) c.set(X, Y, to)
    }
}

/** A row of city blocks standing on `base`, optionally with lit windows. */
function skyline(c: Canvas, base: number, seed: number, step: number, minH: number, maxH: number, col: string, win?: string, lit = 0.45, x0 = 0, x1 = W) {
  for (let x = x0 - 3; x < x1; x += step) {
    const h = minH + Math.floor(rand(seed + x) * (maxH - minH))
    const w = step - 1 - Math.floor(rand(seed + x + 7) * 3)
    c.rect(x, base - h, w, h + 40, col)
    if (win) c.windows(x + 1, base - h + 2, w - 2, h - 3, win, 3, 4, seed + x, lit)
  }
}

/** A palm silhouette with its foot at (x, y). */
function palm(c: Canvas, x: number, y: number, h: number, col: string) {
  c.line(x, y, x + 2, y - h, col, h > 16 ? 2 : 1)
  const k = h / 14
  for (const [dx, dy] of [[-7, 2], [-6, -2], [-2, -5], [3, -5], [6, -2], [8, 2], [-4, 5], [5, 5]]) c.line(x + 2, y - h, x + 2 + dx * k, y - h + dy * k, col)
}

/** An onion dome whose tip is at (cx, top). Returns the y of its foot. */
function onion(c: Canvas, cx: number, top: number, r: number, a: string, b: string, style: 'diag' | 'vert' | 'horiz' | 'zig' | 'plain'): number {
  const h = Math.round(r * 2.3)
  for (let j = 0; j <= h; j++) {
    const u = j / h
    const half = u < 0.35 ? 0.766 * r * Math.pow(u / 0.35, 1.8) : r * Math.sqrt(Math.max(0, 1 - ((u - 0.62) / 0.42) ** 2))
    const hw = Math.round(half)
    for (let dx = -hw; dx <= hw; dx++) {
      let k = 0
      if (style === 'diag') k = Math.floor((dx + j + 60) / 3) % 2
      else if (style === 'vert') k = Math.floor((Math.abs(dx) + 1) / 2) % 2
      else if (style === 'horiz') k = Math.floor(j / 3) % 2
      else if (style === 'zig') k = Math.floor((j + Math.abs((((dx % 6) + 6) % 6) - 3)) / 3) % 2
      c.set(cx + dx, top + j, k ? b : a)
    }
  }
  // A small gold cross on the tip.
  c.rect(cx, top - 5, 1, 5, '#f4c04c')
  c.rect(cx - 1, top - 3, 3, 1, '#f4c04c')
  return top + h
}

/** A Dutch windmill with its foot at (x, by); s scales it. */
function mill(c: Canvas, x: number, by: number, s: number) {
  const h = 50 * s
  const wb = 11 * s
  const wt = 6 * s
  const body = '#6c4a38'
  const shade = '#44302c'
  c.poly([[x - wt, by - h], [x + wt, by - h], [x + wb, by], [x - wb, by]], body)
  c.poly([[x + 1, by - h], [x + wt, by - h], [x + wb, by], [x + 2, by]], shade)
  // Cap.
  c.poly([[x - wt - 1, by - h], [x - wt + 2 * s, by - h - 7 * s], [x + wt - 2 * s, by - h - 7 * s], [x + wt + 1, by - h]], '#2c2428')
  if (s > 0.6) {
    c.rect(x - 2, by - 9, 4, 9, '#2c2428')
    c.rect(x - 4, by - 30, 3, 4, '#f4dca0')
    c.rect(x - 2, by - 44, 2, 3, '#f4dca0')
  }
  // Four sails: a dark stock with a pale lattice frame on one side.
  const hx = x
  const hy = by - h - 3 * s
  const L = 34 * s
  for (let k = 0; k < 4; k++) {
    const a = ((28 + k * 90) * Math.PI) / 180
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const px = -dy
    const py = dx
    const wSail = 7 * s
    if (s > 0.3)
      c.poly(
        [
          [hx + dx * L * 0.22, hy + dy * L * 0.22],
          [hx + dx * L, hy + dy * L],
          [hx + dx * L + px * wSail, hy + dy * L + py * wSail],
          [hx + dx * L * 0.22 + px * wSail, hy + dy * L * 0.22 + py * wSail],
        ],
        '#ecd6a4',
      )
    if (s > 0.6) {
      for (let t = 0.3; t < 1; t += 0.14) c.line(hx + dx * L * t, hy + dy * L * t, hx + dx * L * t + px * wSail, hy + dy * L * t + py * wSail, '#8c7450')
      c.line(hx + dx * L * 0.22 + px * wSail * 0.5, hy + dy * L * 0.22 + py * wSail * 0.5, hx + dx * L + px * wSail * 0.5, hy + dy * L + py * wSail * 0.5, '#8c7450')
    }
    c.line(hx, hy, hx + dx * L, hy + dy * L, '#2c2428', s > 0.6 ? 2 : 1)
  }
}

/** A moai facing right, with its foot at (x, by); s scales a 10×30 figure. */
function moai(c: Canvas, x: number, by: number, s: number, hat = false) {
  const mid = '#8c8474'
  const lit = '#c4b490'
  const shade = '#54504c'
  const dark = '#2c2c34'
  const Y = (v: number) => by - (30 - v) * s
  const outline: Pt[] = [[2, 0], [8, 0], [9.2, 3], [8.2, 4.2], [8.2, 6.5], [10, 11], [10, 12.5], [8.4, 12.8], [9, 14.5], [8.4, 15.5], [9, 17.5], [7, 19], [7, 21], [10, 23], [10, 30], [0, 30], [0, 21], [1, 19], [1, 3]]
  c.poly(outline.map(([px, py]) => [x + px * s, Y(py)] as Pt), mid)
  tint(c, x, Y(0), 3.2 * s, 30 * s + 1, mid, shade) // the back, away from the sun
  tint(c, x + 7.4 * s, Y(0), 3 * s + 1, 30 * s + 1, mid, lit) // the face, toward the sun
  tint(c, x + 3 * s, Y(0), 8 * s, Math.max(1, 0.8 * s), mid, lit)
  c.rect(x + 6.4 * s, Y(4.2), 2 * s, 1.8 * s, dark) // eye socket under the brow
  c.rect(x + 7 * s, Y(14.6), 2 * s, Math.max(1, 0.6 * s), dark) // mouth
  c.rect(x + 7.6 * s, Y(12.6), 2 * s, Math.max(1, 0.5 * s), shade) // under the nose
  c.rect(x + 3.4 * s, Y(5), 1.3 * s, 9 * s, shade) // long ear
  c.rect(x + 7 * s, Y(19.2), 2.4 * s, 1.6 * s, shade) // shadow under the chin
  if (hat) {
    c.rect(x + 1.2 * s, Y(-4.4), 8 * s, 4.4 * s + 1, '#a04c34')
    tint(c, x + 1.2 * s, Y(-4.4), 2.4 * s, 4.4 * s + 1, '#a04c34', '#6c3430')
    c.rect(x + 3.6 * s, Y(-6), 3.2 * s, 1.8 * s, '#a04c34')
  }
}

/** An aurora curtain: a bright wavy lower edge with dithered rays fading upward. */
function aurora(c: Canvas, seed: number, yBase: number, amp: number, len: number, core: string, glow: string, x0 = 0, x1 = W) {
  for (let x = x0; x < x1; x++) {
    const y = Math.round(yBase + amp * Math.sin((x / W) * Math.PI * 2 * 1.2 + seed) + amp * 0.45 * Math.sin((x / W) * Math.PI * 2 * 3.3 + seed * 2.3))
    const L = Math.round(len * (0.55 + 0.45 * rand(seed * 31 + Math.floor(x / 3))))
    const fade = Math.min(1, (x - x0) / 24, (x1 - 1 - x) / 24)
    for (let d = 0; d < L; d++) c.dither(x, y - d, 1, 1, glow, Math.pow(1 - d / L, 1.4) * 0.95 * fade)
    if (fade > 0.4) c.rect(x, y, 1, 2, core)
  }
}

// ---------- the scenes ----------

const dubai: World = {
  unit: 'u19',
  landmark: 'Burj Khalifa',
  place: 'Dubai, UAE',
  night: true,
  draw(c) {
    c.sky(['#1a1e42', '#2a2c5a', '#4c3c6c', '#84506c', '#c06c5c', '#e89858', '#f4c888'])
    c.stars(26, 19, 44)
    // A thin crescent moon.
    c.disc(216, 30, 6, '#fff0c8')
    c.disc(219, 28, 5, '#2a2c5a')

    // Desert haze and far dunes on the horizon.
    c.dither(0, 108, W, 14, '#f8dca8', 0.4)
    c.ridge(122, [[3, 1.5, 0.4], [1.5, 4, 2]], '#d8946c')
    // Far towers, pale in the haze, then a nearer dark row with lights.
    skyline(c, 126, 5, 8, 8, 34, '#a8647c')
    skyline(c, 134, 61, 12, 12, 44, '#3a2a54', '#ffd27a', 0.4)

    // The tower: a needle that steps in, alternately left and right, as it rises.
    const cx = 92
    const lit = '#f2e2d0'
    const mid = '#a8b0cc'
    const shade = '#5a6492'
    const tiers: [number, number, number][] = [[34, 1, 1], [44, 2, 1], [53, 2, 3], [62, 4, 3], [71, 4, 5], [81, 6, 5], [91, 6, 7], [101, 8, 7], [110, 9, 9], [120, 11, 11]]
    c.rect(cx, 12, 1, 22, mid)
    c.rect(cx, 26, 2, 8, mid)
    for (const [y, l, r] of tiers) {
      c.rect(cx - l, y, l, 140 - y, lit)
      c.rect(cx, y, r + 1, 140 - y, shade)
    }
    c.rect(cx - 1, 40, 2, 100, mid) // the central spine
    for (const [y, l, r] of tiers) c.rect(cx - l, y, l + r + 1, 1, '#fff6e4') // a bright lip on each setback
    c.windows(cx + 1, 66, 8, 66, '#ffd27a', 2, 5, 9, 0.35)
    c.set(cx, 11, '#ff6a5a')

    // Foreground: dark dunes and a few palms.
    c.ridge(146, [[3, 2, 1.2], [1.5, 5, 0.3]], '#22183a')
    palm(c, 206, 150, 22, '#22183a')
    palm(c, 226, 152, 16, '#22183a')
    palm(c, 30, 152, 18, '#22183a')
  },
}

const neuschwanstein: World = {
  unit: 'u20',
  landmark: 'Neuschwanstein Castle',
  place: 'Bavaria, Germany',
  draw(c) {
    c.sky(['#4a8ad0', '#6aa4dc', '#90bfe6', '#b8d6ee', '#dceaf2'])
    c.cloud(22, 26, 40, '#f4f8fc')
    c.cloud(206, 40, 34, '#f4f8fc')

    // The Alps: pale peaks with snow caps, then a nearer blue range.
    for (const [x, y, half] of [[66, 40, 50], [22, 52, 44], [108, 64, 36], [252, 50, 44], [216, 34, 52], [186, 66, 30]] as const) {
      c.tri(x, y, 130, half, '#a4bcdc')
      c.poly([[x, y], [x + half, 130], [x + half * 0.15, 130], [x + half * 0.1, y + 30], [x - half * 0.04, y + 14]], '#8ca8d0')
      c.poly([[x, y], [x + half * 0.28, y + 14], [x + half * 0.1, y + 11], [x - half * 0.05, y + 17], [x - half * 0.2, y + 10], [x - half * 0.3, y + 15]], '#f2f6fa')
    }
    c.ridge(96, [[7, 2.2, 1], [3, 5, 0.2]], '#7896c0')

    // Autumn forest on the hills behind the crag.
    c.ridge(112, [[5, 1.6, 2.6], [2, 6, 1]], '#a85a2c')

    // The crag.
    c.poly([[96, 99], [198, 97], [204, 106], [200, 114], [212, 160], [84, 160], [94, 112], [90, 106]], '#9c9ca8')
    c.poly([[174, 97], [198, 97], [204, 106], [200, 114], [212, 160], [180, 160], [176, 112], [180, 104]], '#5c5c74')
    c.rect(96, 98, 80, 1, '#c4c4cc')
    for (const [x, y] of [[104, 100], [122, 102], [137, 100], [152, 103], [166, 100]] as const) c.line(x, y, x - 2, y + 14, '#74748c')
    c.poly([[110, 106], [126, 104], [124, 108], [112, 110]], '#74748c')
    c.poly([[146, 107], [164, 106], [162, 110], [148, 111]], '#74748c')

    const wall = '#f6f2e6'
    const shade = '#b4bcd0'
    const roof = '#3e4a6c'
    const roofLit = '#6878a0'
    const win = '#3c4464'
    // Gatehouse in red brick, with two little turrets.
    c.rect(100, 78, 20, 21, '#b85c44')
    c.rect(112, 78, 8, 21, '#8c4038')
    c.rect(107, 88, 5, 11, win)
    for (const x of [99, 118]) {
      c.rect(x, 70, 4, 29, wall)
      c.rect(x + 3, 70, 1, 29, shade)
      c.tri(x + 1.5, 63, 70, 3, roof)
    }
    for (let x = 103; x < 118; x += 4) c.rect(x, 76, 2, 2, '#b85c44')
    // Lower wing and the square tower.
    c.rect(120, 74, 30, 24, wall)
    c.poly([[120, 74], [123, 67], [147, 67], [150, 74]], roof)
    c.rect(123, 67, 24, 1, roofLit)
    c.windows(123, 79, 26, 14, win, 4, 6, 3, 1)
    c.rect(128, 48, 9, 28, wall)
    c.rect(135, 48, 2, 28, shade)
    c.rect(127, 46, 11, 3, wall)
    c.tri(132, 37, 46, 5, roof)
    c.rect(131, 54, 2, 4, win)
    // The palace: a tall white block with a steep slate roof and end turrets.
    c.rect(150, 58, 44, 40, wall)
    c.rect(184, 58, 10, 40, shade)
    c.poly([[150, 58], [154, 47], [190, 47], [194, 58]], roof)
    c.rect(154, 47, 36, 1, roofLit)
    for (const y of [63, 71, 79, 88]) for (let x = 154; x < 192; x += 4) c.rect(x, y, 1, 3, win)
    for (const [x, top] of [[147, 46], [192, 42]] as const) {
      c.rect(x, top, 5, 98 - top, wall)
      c.rect(x + 3, top, 2, 98 - top, shade)
      c.tri(x + 2, top - 11, top, 3, roof)
    }
    // The tall round tower with a balcony and a pointed cap.
    c.rect(167, 26, 7, 30, wall)
    c.rect(172, 26, 2, 30, shade)
    c.rect(166, 32, 9, 2, shade)
    c.rect(166, 24, 9, 2, wall)
    c.tri(170, 12, 24, 4, roof)
    c.rect(169, 38, 2, 4, win)

    // Autumn trees climbing the crag and filling the foreground.
    const leaves = ['#d88a2c', '#b8442c', '#e8b83c', '#8c3a24', '#4c6c3c']
    for (let row = 0; row < 6; row++)
      for (let x = -2; x < W + 4; x += 7) {
        const y = 106 + row * 8 + Math.floor(rand(x + row * 50) * 5)
        if (row < 1 && x > 84 && x < 212) continue // keep the rock under the castle bare
        c.disc(x + Math.floor(rand(x * 3 + row) * 4), y, 4 + Math.floor(rand(x + row * 9) * 3), leaves[Math.floor(rand(x * 7 + row * 13) * leaves.length)])
      }
    c.ridge(150, [[3, 4, 0.5], [1.5, 11, 2]], '#3a1c1c')
    for (let x = 3; x < W; x += 15) c.disc(x + Math.floor(rand(x + 2) * 6), 150, 5 + Math.floor(rand(x + 8) * 3), '#3a1c1c')
  },
}

const chichen: World = {
  unit: 'u21',
  landmark: 'Chichén Itzá',
  place: 'Yucatán, Mexico',
  draw(c) {
    c.sky(['#1c7ad4', '#3a98e4', '#60b4ee', '#8eccf4', '#c4e6f6'])
    // High sun and fair-weather clouds.
    c.disc(226, 30, 9, '#fff4b8')
    c.disc(226, 30, 6, '#fffce0')
    c.cloud(18, 34, 46, '#f8fcff')
    c.cloud(60, 58, 30, '#e4f2fc')
    c.cloud(196, 62, 44, '#f8fcff')

    // Jungle behind: a pale far line and a nearer, darker one.
    c.ridge(100, [[3, 3, 0.5], [2, 9, 1.4]], '#58a878')
    c.ridge(108, [[3, 4, 2.5], [2, 13, 0.4]], '#2c7c4c')
    for (let x = 0; x < W; x += 11) c.disc(x + Math.floor(rand(x + 1) * 5), 108, 4 + Math.floor(rand(x + 4) * 3), '#2c7c4c')
    // The lawn.
    c.rect(0, 120, W, 40, '#78c04c')
    c.dither(0, 120, W, 4, '#a4d860', 0.5)

    // El Castillo: nine terraces, a central stair, and the temple on top.
    const cx = 128
    const stone = '#e4d4a4'
    const lit = '#f6ecc8'
    const shade = '#b09868'
    const dark = '#6c5840'
    for (let i = 0; i < 9; i++) {
      const y = 48 + i * 8
      const half = 26 + i * 6
      c.rect(cx - half, y, half * 2 + 1, 8, stone)
      c.rect(cx, y, half + 1, 8, shade) // right half sits in shade
      c.rect(cx - half, y, half, 1, lit)
      c.rect(cx - half, y + 7, half * 2 + 1, 1, dark)
      // Recessed panels along each terrace face.
      for (let x = cx - half + 3; x < cx + half - 2; x += 6) c.rect(x, y + 3, 3, 2, x < cx ? shade : dark)
    }
    // The stair: lighter than the terraces, ruled with steps, between two balustrades.
    c.rect(cx - 8, 48, 17, 72, lit)
    for (let y = 49; y < 120; y += 2) c.rect(cx - 6, y, 13, 1, stone)
    c.rect(cx - 8, 48, 2, 72, shade)
    c.rect(cx + 7, 48, 2, 72, dark)
    c.rect(cx - 10, 116, 4, 4, stone)
    c.rect(cx + 7, 116, 4, 4, shade)
    // The temple.
    c.rect(cx - 14, 34, 29, 14, stone)
    c.rect(cx, 34, 15, 14, shade)
    c.rect(cx - 15, 33, 31, 2, lit)
    c.rect(cx - 14, 39, 29, 1, dark)
    c.rect(cx - 3, 40, 7, 8, '#3c2c2c')
    c.rect(cx - 10, 42, 3, 6, dark)
    c.rect(cx + 8, 42, 3, 6, dark)

    // Shadow on the grass, then dark jungle framing the bottom.
    c.dither(cx - 80, 120, 200, 3, '#3c8c3c', 0.5)
    c.ridge(150, [[3, 3, 1], [2, 10, 2.2]], '#123c2c')
    for (let x = 2; x < W; x += 13) c.disc(x + Math.floor(rand(x + 6) * 6), 150, 5 + Math.floor(rand(x + 3) * 4), '#123c2c')
    palm(c, 20, 152, 30, '#123c2c')
    palm(c, 40, 154, 20, '#123c2c')
    palm(c, 250, 152, 26, '#123c2c')
  },
}

const stBasil: World = {
  unit: 'u22',
  landmark: "St Basil's Cathedral",
  place: 'Moscow, Russia',
  night: true,
  draw(c) {
    c.sky(['#1a1e4c', '#2a326c', '#4a5294', '#8276b0', '#c49abc', '#f0c2be'])
    c.stars(22, 22, 46)
    // A pale winter moon.
    c.disc(40, 34, 7, '#f4ecf4')
    c.disc(38, 33, 2, '#d4cce4')

    // Far city under snow, and a Kremlin tower and wall to the right.
    skyline(c, 122, 8, 10, 6, 20, '#8a7cb0')
    const far = '#6a5c98'
    c.rect(200, 106, 72, 20, far)
    for (let x = 200; x < W; x += 4) c.rect(x, 104, 2, 2, far)
    c.rect(228, 80, 11, 30, far)
    c.rect(230, 70, 7, 10, far)
    c.tri(233, 50, 70, 4, far)
    c.rect(232, 84, 3, 3, '#ffd27a')

    // Snowy ground.
    c.rect(0, 122, W, 38, '#e2e8f6')
    c.dither(0, 124, W, 10, '#b4c0e4', 0.3)

    const brick = '#b44e3c'
    const dim = '#7c3040'
    const trim = '#f4ece4'
    const dark = '#40203c'
    const drum = (x: number, y: number, w: number, bottom: number) => {
      c.rect(x, y, w, bottom - y, brick)
      c.rect(x + Math.ceil(w * 0.62), y, w - Math.ceil(w * 0.62), bottom - y, dim)
      c.rect(x - 1, y, w + 2, 2, trim)
      c.rect(x, y + 8, w, 1, trim)
      for (let i = 2; i < w - 1; i += 3) c.rect(x + i, y + 3, 1, 4, dark)
    }
    // Back domes.
    drum(120, 56, 9, 100)
    onion(c, 124, 41, 6, '#e8e4e0', '#c83c3c', 'diag')
    drum(146, 62, 9, 100)
    onion(c, 150, 47, 6, '#f0a030', '#2c8c5c', 'zig')
    // The central tent tower with its small gold dome.
    drum(130, 58, 15, 100)
    c.poly([[137, 24], [146, 58], [128, 58]], brick)
    c.poly([[137, 24], [146, 58], [140, 58]], dim)
    c.line(137, 26, 131, 57, trim)
    c.line(137, 26, 137, 57, trim)
    c.line(137, 26, 143, 57, trim)
    c.rect(128, 57, 19, 2, trim)
    c.rect(136, 20, 3, 5, trim)
    onion(c, 137, 13, 3, '#f4c04c', '#f4c04c', 'plain')
    // Front domes: the two big ones, then the small outer pair.
    drum(102, 70, 13, 100)
    onion(c, 108, 48, 9, '#3c9c5c', '#f4d048', 'diag')
    drum(160, 74, 13, 100)
    onion(c, 166, 52, 9, '#3c6cc8', '#f0f0f4', 'vert')
    drum(90, 88, 7, 100)
    onion(c, 93, 75, 5, '#f4d048', '#2c8c5c', 'horiz')
    drum(178, 90, 7, 100)
    onion(c, 181, 77, 5, '#c83c3c', '#3c6cc8', 'horiz')
    // The base: brick galleries with white arches and snow on the ledges.
    c.rect(86, 100, 102, 23, brick)
    c.rect(150, 100, 38, 23, dim)
    c.rect(85, 99, 104, 2, '#f8fafe')
    for (let x = 89; x < 186; x += 7) {
      c.rect(x, 108, 4, 9, dark)
      c.rect(x - 1, 106, 6, 2, trim)
    }
    c.rect(86, 118, 102, 1, trim)
    // Porch roofs: little green tents at the corners.
    c.tri(96, 90, 100, 5, '#2c8c5c')
    c.tri(176, 92, 100, 5, '#2c8c5c')

    // Falling snow, then blue snowdrifts and dark firs in front.
    c.stars(46, 91, 120, '#ffffff')
    c.ridge(142, [[3, 2, 0.4], [1.5, 6, 2]], '#aab6e0')
    c.ridge(152, [[2, 3, 2.2]], '#5c68a8')
    for (const [x, h] of [[12, 34], [28, 24], [246, 30], [262, 38], [228, 20]] as const) {
      c.pine(x, 156, h, '#1a2048')
      c.rect(x - 1, 156 - h + 3, 3, 1, '#e2e8f6')
    }
  },
}

const kinderdijk: World = {
  unit: 'u23',
  landmark: 'Windmills of Kinderdijk',
  place: 'Kinderdijk, Netherlands',
  draw(c) {
    c.sky(['#86b2e0', '#a8c8e8', '#ccdaec', '#f0dcd8', '#fcdab8', '#fde6c4'])
    // A soft low sun and long thin clouds.
    c.disc(222, 86, 11, '#fff0c8')
    c.disc(222, 86, 8, '#fffbe8')
    c.cloud(30, 30, 52, '#f6f4f8')
    c.cloud(150, 44, 60, '#f6f4f8')
    c.cloud(214, 24, 36, '#f6f4f8')

    // Far tree line and a village on the horizon.
    c.ridge(100, [[1.5, 6, 1], [1, 15, 0.3]], '#9cb4a4')
    c.rect(238, 92, 3, 8, '#9cb4a4')
    c.tri(239, 86, 92, 2, '#9cb4a4')
    // Flat fields.
    c.rect(0, 102, W, 58, '#84b858')
    c.dither(0, 102, W, 5, '#b4d478', 0.5)

    // Tulip strips fanning out from the vanishing point.
    const vx = 158
    const vy = 101
    const strip = (xa: number, xb: number, col: string) => {
      const at = (x: number, t: number): Pt => [vx + (x - vx) * t, vy + (H - vy) * t]
      c.poly([at(xa, 0.28), at(xb, 0.28), at(xb, 1), at(xa, 1)], col)
    }
    const tulips = ['#e8483c', '#f8c838', '#f078a0', '#e8483c', '#f8a030', '#c84890']
    tulips.forEach((col, i) => strip(-150 + i * 34, -150 + i * 34 + 22, col))
    // The canal, widening toward us on the right.
    c.poly([[vx - 4, vy], [vx + 4, vy], [W + 40, H], [176, H]], '#8cb4d8')
    for (let y = 106; y < H; y += 3) {
      const t = (y - vy) / (H - vy)
      const xl = vx - 4 + (176 - vx + 4) * t
      const xr = vx + 4 + (W + 40 - vx - 4) * t
      for (let x = xl + 2; x < Math.min(W, xr - 2); x += 7) if (rand(x * 3 + y) > 0.55) c.rect(x, y, 3, 1, '#e4f0f8')
    }

    // The mills, far to near along the dike.
    mill(c, 150, 102, 0.2)
    mill(c, 138, 104, 0.32)
    mill(c, 116, 107, 0.5)
    mill(c, 62, 116, 1)

    // Reeds and a dark bank along the bottom.
    c.ridge(154, [[2, 4, 1]], '#2c4a2c')
    for (let x = 0; x < W; x += 3) c.rect(x, 150 - Math.floor(rand(x + 5) * 7), 1, 8, '#2c4a2c')
  },
}

const moaiScene: World = {
  unit: 'u24',
  landmark: 'Moai of Easter Island',
  place: 'Rapa Nui, Chile',
  draw(c) {
    c.sky(['#3c74b0', '#6494c0', '#98b4c8', '#d4ccb0', '#f4cc8c', '#f8b468'], 0, 84)
    // Low sun over the ocean, with long clouds lit from below.
    c.disc(232, 62, 13, '#ffe0a0')
    c.disc(232, 62, 10, '#fff6d4')
    c.cloud(120, 22, 56, '#e8d8cc')
    c.cloud(14, 40, 40, '#e8d8cc')
    c.cloud(180, 36, 30, '#f8e4c4')

    // Ocean, with a path of light under the sun and a far headland.
    c.water(84, H, '#2c6c94', '#7cb4c8', 24)
    for (let y = 85; y < H; y += 2) {
      const w = 7 + (y - 85) * 0.3
      for (let x = 232 - w; x < 232 + w; x += 4) if (rand(x * 5 + y) > 0.35) c.rect(x, y, 3, 1, '#ffe0a0')
    }
    c.poly([[0, 84], [0, 74], [30, 70], [58, 78], [80, 84]], '#7c8ca4')

    // The grassy slope, ending in a cliff on the right.
    const grass = '#8c9c44'
    c.poly([[0, 100], [120, 103], [206, 108], [226, 116], [240, 134], [262, H], [0, H]], grass)
    c.poly([[206, 108], [226, 116], [240, 134], [262, H], [236, H], [224, 134], [214, 118]], '#5c5444')
    c.dither(0, 100, 206, 6, '#c4c05c', 0.4)

    // The stone platform, then the row of heads, far to near.
    c.poly([[22, 111], [204, 105], [208, 110], [22, 117]], '#6c6458')
    c.poly([[22, 115], [208, 109], [208, 110], [22, 117]], '#3c3838')
    moai(c, 184, 106, 1.45)
    moai(c, 156, 107, 1.7)
    moai(c, 123, 109, 1.95, true)
    moai(c, 85, 111, 2.25)
    moai(c, 40, 113, 2.55)

    // Foreground: darker grass with tufts.
    c.ridge(140, [[3, 2, 0.8], [1, 7, 2]], '#56682c')
    c.ridge(152, [[2, 3, 2.4]], '#2c3820')
    for (let x = 2; x < W; x += 6) c.tri(x + Math.floor(rand(x) * 3), 144 - Math.floor(rand(x + 2) * 6), 153, 2, '#2c3820')
  },
}

const toronto: World = {
  unit: 'u25',
  landmark: 'CN Tower',
  place: 'Toronto, Canada',
  night: true,
  draw(c) {
    c.sky(['#0c1a3c', '#122e5c', '#1c4880', '#2e68a4', '#5a8cc0', '#96b4d4'], 0, 122)
    c.stars(30, 25, 50)
    c.disc(52, 32, 6, '#eef4fc')
    c.disc(50, 31, 2, '#c4d4ec')

    // Far towers in pale blue, then the downtown row with lit windows.
    skyline(c, 122, 13, 9, 10, 40, '#3c6494')
    skyline(c, 122, 71, 13, 18, 58, '#14244c', '#ffd890', 0.5, 0, 150)
    skyline(c, 122, 37, 12, 10, 30, '#14244c', '#ffd890', 0.5, 196, W)
    // The stadium dome beside the tower.
    c.ellipse(212, 122, 20, 11, '#b4c4e0')
    c.ellipse(216, 123, 15, 9, '#7c90bc')
    c.rect(192, 120, 42, 2, '#14244c')

    // The tower: flared concrete shaft, the pod, a second small pod, the antenna.
    const cx = 172
    const lit = '#dce4f0'
    const shade = '#7c8cb4'
    c.poly([[cx - 3, 60], [cx + 3, 60], [cx + 4, 100], [cx + 9, 122], [cx - 9, 122], [cx - 4, 100]], lit)
    c.poly([[cx + 1, 60], [cx + 3, 60], [cx + 4, 100], [cx + 9, 122], [cx + 3, 122], [cx + 1, 100]], shade)
    c.poly([[cx - 5, 64], [cx - 12, 59], [cx - 12, 55], [cx - 9, 51], [cx - 6, 47], [cx + 6, 47], [cx + 9, 51], [cx + 12, 55], [cx + 12, 59], [cx + 5, 64]], lit)
    tint(c, cx + 4, 47, 10, 18, lit, shade)
    c.rect(cx - 9, 52, 19, 1, '#ffd890')
    c.rect(cx - 12, 57, 25, 1, '#f0503c')
    c.rect(cx - 7, 49, 15, 1, '#14244c')
    c.rect(cx - 2, 34, 4, 13, lit)
    c.rect(cx + 1, 34, 1, 13, shade)
    c.rect(cx - 3, 36, 6, 3, lit)
    c.rect(cx - 3, 37, 6, 1, '#ffd890')
    c.rect(cx - 1, 22, 2, 12, lit)
    c.rect(cx, 10, 1, 12, shade)
    c.set(cx, 9, '#f0503c')
    c.windows(cx - 1, 66, 1, 50, '#ffd890', 1, 6, 4, 0.9)

    // The lake, with the lights of the city stretched across it.
    c.water(122, H, '#102c58', '#5a8cc0', 25)
    for (let x = 2; x < W; x += 5) if (rand(x + 500) > 0.45) c.dither(x, 123, 1, 6 + Math.floor(rand(x + 9) * 14), '#ffd890', 0.5)
    c.dither(cx - 2, 123, 4, 26, '#dce4f0', 0.5)
    // Foreground: the dark tree line of the islands.
    c.ridge(152, [[2, 3, 0.5], [1, 9, 2]], '#060e24')
    for (let x = 0; x < W; x += 12) c.disc(x + Math.floor(rand(x + 12) * 6), 152, 4 + Math.floor(rand(x + 1) * 4), '#060e24')
  },
}

const kirkjufell: World = {
  unit: 'u26',
  landmark: 'Northern lights over Kirkjufell',
  place: 'Snæfellsnes, Iceland',
  night: true,
  draw(c) {
    c.sky(['#050818', '#081028', '#0c1c38', '#102c44', '#16404c'], 0, 112)
    c.stars(70, 26, 100)
    // Aurora: a violet fringe above two green curtains.
    aurora(c, 3.1, 40, 9, 30, '#b88cf0', '#7c4cc8')
    aurora(c, 1.2, 58, 10, 34, '#c8ffd8', '#38d890')
    aurora(c, 4.4, 76, 6, 20, '#8cf0b8', '#209c78', 0, 130)

    // Far hills across the fjord.
    c.ridge(104, [[3, 2, 0.4], [2, 5, 2]], '#0e2030', 112)
    // The fjord, catching the green light.
    c.water(110, 122, '#0e2c3c', '#48d098', 26)

    // Kirkjufell: a steep, slightly lopsided cone with banded rock.
    const base = '#1a3440'
    const lit = '#2c6458'
    const shade = '#0c1826'
    const peak: Pt[] = [[92, 114], [116, 100], [136, 76], [150, 50], [157, 38], [163, 35], [169, 39], [178, 56], [194, 84], [214, 104], [236, 114]]
    c.poly(peak, lit)
    c.poly([[163, 35], [169, 39], [178, 56], [194, 84], [214, 104], [236, 114], [172, 114], [168, 80], [164, 52]], shade)
    c.poly([[163, 35], [164, 52], [168, 80], [172, 114], [150, 114], [154, 80], [158, 52]], base)
    for (let y = 48; y < 112; y += 9) for (let x = 90; x < 172; x++) if ((x + y) % 2 === 0 && c.get(x, y) === lit) c.set(x, y, '#48907c')

    // Near ground: dark tundra with a ledge and the waterfall on the left.
    const land = '#0a1620'
    c.poly([[0, 108], [30, 106], [74, 108], [96, 116], [150, 120], [W, 118], [W, H], [0, H]], land)
    c.dither(0, 108, 90, 3, '#1c4444', 0.5)
    c.dither(96, 119, 176, 2, '#1c4444', 0.4)
    c.poly([[24, 108], [80, 109], [82, 136], [22, 136]], '#040a12')
    c.rect(24, 108, 56, 1, '#1c4444')
    for (const [x, w] of [[33, 3], [43, 13], [64, 5]] as const) {
      c.rect(x, 109, w, 27, '#cfeaf2')
      c.rect(x + w - 1, 110, 1, 26, '#7cb0c8')
    }
    c.rect(47, 111, 1, 25, '#7cb0c8')
    c.rect(51, 110, 2, 26, '#7cb0c8')
    // The pool and the stream running out of the picture.
    c.poly([[28, 134], [78, 133], [120, 142], [170, H], [70, H], [40, 144]], '#16485c')
    c.dither(30, 132, 46, 5, '#cfeaf2', 0.5)
    c.dither(28, 137, 52, 3, '#cfeaf2', 0.25)
    for (let y = 140; y < H; y += 3) c.rect(60 + (y - 140) * 2 + Math.floor(rand(y) * 12), y, 5, 1, '#48d098')
    c.ridge(154, [[2, 3, 1.5], [1, 9, 0.2]], '#03070e')
  },
}

const seattle: World = {
  unit: 'u27',
  landmark: 'Space Needle',
  place: 'Seattle, USA',
  draw(c) {
    c.sky(['#1f4a6c', '#3c6c84', '#7c9490', '#c8a878', '#f4a850', '#f87c3c', '#e85c3c'], 0, 136)
    // Sunset clouds.
    c.cloud(150, 26, 54, '#5c8490')
    c.cloud(20, 50, 38, '#a8a48c')
    c.cloud(214, 46, 30, '#a8a48c')
    // The sun, half behind the skyline.
    c.disc(150, 112, 15, '#ffd070')
    c.disc(150, 112, 11, '#fff0b0')

    // Mount Rainier, faint and huge behind everything.
    const mt = '#d49480'
    c.poly([[136, 124], [170, 92], [188, 72], [198, 62], [206, 58], [214, 60], [222, 70], [240, 90], [W, 110], [W, 124]], mt)
    c.poly([[198, 62], [206, 58], [214, 60], [222, 70], [230, 80], [222, 78], [216, 86], [208, 74], [202, 84], [196, 74], [186, 80]], '#fce8c8')
    tint(c, 212, 58, 60, 70, mt, '#b87c7c')

    // Hills and the downtown skyline.
    c.ridge(126, [[3, 2, 2], [2, 5, 0.6]], '#6c4460')
    skyline(c, 136, 44, 12, 14, 48, '#2c2040', '#ffd27a', 0.4, 128, W)
    skyline(c, 136, 17, 11, 6, 16, '#2c2040', '#ffd27a', 0.4, 0, 70)

    // The Needle: an hourglass of three legs under a wide saucer and a spire.
    const cx = 94
    const white = '#f6eeda'
    const shade = '#a89474'
    const dark = '#4c3c44'
    c.rect(cx, 14, 1, 16, white)
    c.rect(cx - 1, 28, 3, 5, white)
    c.poly([[cx - 12, 38], [cx - 5, 33], [cx + 5, 33], [cx + 12, 38]], white)
    c.rect(cx - 18, 38, 37, 2, white) // the halo rim
    c.rect(cx - 16, 40, 33, 2, dark)
    c.windows(cx - 15, 40, 31, 1, '#ffd27a', 2, 1, 6, 0.8)
    c.rect(cx - 14, 42, 29, 2, '#f08030')
    c.poly([[cx - 11, 44], [cx + 11, 44], [cx + 5, 51], [cx - 5, 51]], shade)
    tint(c, cx + 5, 33, 15, 7, white, '#d4c4a4')
    // Legs: pinched at the waist, splayed at the foot.
    c.rect(cx - 1, 51, 3, 81, shade)
    const leg = (side: 1 | -1, col: string) =>
      c.poly([[cx + side * 5, 51], [cx + side * 2, 84], [cx + side * 6, 110], [cx + side * 13, 134], [cx + side * 9, 134], [cx + side * 3.5, 110], [cx + side * 0.5, 84], [cx + side * 3, 51]], col)
    leg(-1, white)
    leg(1, shade)
    c.rect(cx - 2, 82, 5, 3, white)
    c.rect(cx - 6, 108, 13, 2, white)
    c.rect(cx - 9, 104, 19, 2, shade)
    c.set(cx, 13, '#ff5a4a')

    // Foreground: dark firs.
    c.rect(0, 136, W, 24, '#2c2040')
    c.pines(156, '#140e20', 27, 9, 12, 28)
    c.rect(0, 154, W, 6, '#140e20')
  },
}

const marinaBay: World = {
  unit: 'u28',
  landmark: 'Marina Bay Sands',
  place: 'Singapore',
  night: true,
  draw(c) {
    c.sky(['#0c0820', '#1a0e38', '#2c1450', '#481c64', '#6c2870', '#94386c'], 0, 124)
    c.stars(34, 28, 60)

    // Far skyline, and the big observation wheel on the left.
    skyline(c, 124, 83, 9, 8, 30, '#5c2c70')
    skyline(c, 124, 29, 11, 20, 62, '#3c1c5c', '#ffb8e0', 0.35, 226, W)
    for (let a = 0; a < 360; a += 4) c.set(30 + 17 * Math.cos((a * Math.PI) / 180), 92 + 17 * Math.sin((a * Math.PI) / 180), '#c890d0')
    for (let a = 0; a < 360; a += 45) c.line(30, 92, 30 + 16 * Math.cos((a * Math.PI) / 180), 92 + 16 * Math.sin((a * Math.PI) / 180), '#7c4c94')
    c.line(30, 92, 22, 124, '#7c4c94')
    c.line(30, 92, 38, 124, '#7c4c94')

    // Three towers, each leaning on a splayed leg, with bands of lit floors.
    const glass = '#3c5ca0'
    const side = '#1c2c64'
    for (const x of [104, 144, 184]) {
      c.poly([[x + 4, 46], [x + 24, 46], [x + 24, 124], [x - 5, 124], [x - 1, 96], [x + 3, 70]], glass)
      c.poly([[x + 17, 46], [x + 24, 46], [x + 24, 124], [x + 17, 124]], side)
      c.poly([[x + 9, 86], [x + 12, 124], [x + 3, 124]], '#2c1450') // the gap between the two leaning slabs
      for (let y = 50; y < 122; y += 4) for (let i = 0; i < 22; i += 2) if (c.get(x + 1 + i, y) === glass && rand(x + y * 7 + i) < 0.6) c.set(x + 1 + i, y, i % 6 === 0 ? '#9ce0f8' : '#ffd890')
    }
    // The SkyPark: a long boat-shaped deck that overhangs at one end.
    c.poly([[92, 37], [228, 36], [224, 41], [214, 46], [100, 46], [95, 42]], '#d4dcf0')
    c.poly([[95, 42], [224, 41], [214, 46], [100, 46]], '#6c78b0')
    for (let x = 98; x < 222; x += 5) c.disc(x + Math.floor(rand(x + 3) * 2), 36, 1, '#2c7c5c')
    c.windows(98, 39, 124, 1, '#ffd890', 3, 1, 5, 0.7)

    // The lotus-shaped museum in front: white petals opening upward.
    const cxL = 62
    const cyL = 126
    for (const k of [0, 6, 1, 5, 2, 4, 3]) {
      const a = ((192 + k * 26) * Math.PI) / 180
      const len = 23 + (k % 2) * 4
      const ax = Math.cos(a)
      const ay = Math.sin(a)
      const tipX = cxL + ax * len
      const tipY = cyL + ay * len
      const col = k % 2 ? '#eef0fa' : '#aab2dc'
      c.poly([[cxL - ay * 2, cyL + ax * 2], [tipX - ay * 3.5, tipY + ax * 3.5], [tipX + ax * 3, tipY + ay * 3], [tipX + ay * 3.5, tipY - ax * 3.5], [cxL + ay * 2, cyL - ax * 2]], col)
      c.line(cxL, cyL, tipX + ay * 3.5, tipY - ax * 3.5, '#5c68a4')
    }
    c.ellipse(cxL, 125, 9, 3, '#5c68a4')

    // The bay, with the lights stretched across it, and a dark quay.
    c.water(124, H, '#160c34', '#94386c', 28)
    for (const x of [104, 144, 184]) for (let i = 2; i < 24; i += 3) c.dither(x + i, 125, 1, 10 + Math.floor(rand(x + i) * 14), i % 2 ? '#ffd890' : '#9ce0f8', 0.5)
    c.rect(0, 154, W, 6, '#07041a')
    for (let x = 6; x < W; x += 22) {
      c.rect(x, 146, 1, 8, '#07041a')
      c.set(x, 145, '#ffd890')
    }
  },
}

export const scenes: World[] = [dubai, neuschwanstein, chichen, stBasil, kinderdijk, moaiScene, toronto, kirkjufell, seattle, marinaBay]
