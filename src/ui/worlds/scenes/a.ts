import { H, rand, W, type Canvas, type World } from '../canvas'

type P = [number, number]

// ---------- small shared helpers ----------

/** Points along a quadratic curve from a to b, bent toward the control point k. */
function curve(a: P, k: P, b: P, n = 12): P[] {
  const out: P[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    out.push([(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * k[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * k[1] + t * t * b[1]])
  }
  return out
}

/** Straight-line interpolation through [y, value] pairs. */
function along(points: P[], y: number): number {
  if (y <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    const [y0, v0] = points[i - 1]
    const [y1, v1] = points[i]
    if (y <= y1) return v0 + ((y - y0) / (y1 - y0)) * (v1 - v0)
  }
  return points[points.length - 1][1]
}

/** A dithered ellipse: a soft patch of mist, glow or haze. */
function haze(c: Canvas, cx: number, cy: number, rx: number, ry: number, colour: string, density: number) {
  for (let y = -ry; y <= ry; y++) {
    const half = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)))
    c.dither(cx - half, cy + y, half * 2 + 1, 1, colour, density)
  }
}

/** A bank of fog or low cloud: a row of overlapping flat ellipses. */
function bank(c: Canvas, x0: number, x1: number, y: number, colour: string, seed: number, size = 1) {
  for (let x = x0; x <= x1; x += 11) {
    const r = rand(seed + x)
    c.ellipse(x + Math.floor(r * 6), y + Math.floor(rand(seed + x + 3) * 4), Math.round((10 + r * 9) * size), Math.round((3 + rand(seed + x + 7) * 3) * size), colour)
  }
}

/** A mass of round puffs painted in three passes (shade, body, light) so they merge into one canopy. */
function canopy(c: Canvas, puffs: [number, number, number][], body: string, light: string, shade: string) {
  for (const [x, y, r] of puffs) c.disc(x + 1, y + 2, r, shade)
  for (const [x, y, r] of puffs) c.disc(x, y, r, body)
  for (const [x, y, r] of puffs) if (r >= 4) c.disc(x - 1, y - 2, r - 3, light)
}

// ---------- u0: Mount Fuji ----------

const fuji: World = {
  unit: 'u0',
  landmark: 'Mount Fuji',
  place: 'Honshu, Japan',
  draw(c) {
    // Clear dawn: blue overhead, a pink band at the horizon.
    c.sky(['#3f5fa8', '#5f80c0', '#8fa6d8', '#c4bfe0', '#f2c4d0', '#fbd8c0'], 0, 122)
    c.rect(0, 122, W, H - 122, '#5f4f90')
    c.cloud(14, 30, 44, '#d9d2ec')
    c.cloud(206, 20, 36, '#b9c4e6')

    // The cone: a small flat crater, then slopes that ease outward. Lit from the left.
    const px = 132
    const slope = (x: number) => {
      const d = Math.max(0, Math.abs(x - px) - 6)
      return 22 + 92 * Math.pow(d / 128, 0.72) + (d === 0 ? (Math.abs(x - px) < 3 ? 1 : 0) : 0)
    }
    for (let x = 0; x < W; x++) {
      const top = Math.round(slope(x))
      // Snow reaches down the gullies in long fingers.
      const tooth = Math.abs(((x + 400) % 14) - 7) / 7
      const snow = 44 + 18 * tooth + 6 * rand(Math.floor(x / 3) + 50)
      for (let y = top; y < 124; y++) {
        const lit = x < px + 3 + (y - 22) * 0.22 + 3 * Math.sin(y / 5)
        c.set(x, y, y < snow ? (lit ? '#ffffff' : '#c9cdf0') : lit ? '#7888c8' : '#55629f')
      }
    }
    // Dawn haze swallowing the foot of the mountain.
    c.dither(0, 88, W, 8, '#c4bfe0', 0.25)
    c.dither(0, 96, W, 8, '#f2c4d0', 0.5)
    c.dither(0, 104, W, 10, '#f2c4d0', 0.75)

    // Far hills, pale to dark.
    c.ridge(112, [[3, 3, 1], [2, 7, 0.5]], '#9a8cc4')
    c.ridge(122, [[4, 2, 2.4], [2, 5, 1]], '#5f4f90')

    // A five-storey red pagoda on the near hill.
    const gx = 222
    const roof = '#2c2148'
    for (let i = 4; i >= 0; i--) {
      const y = 58 + i * 15
      const hw = 12 + i * 3
      const bw = 5 + i
      c.rect(gx - bw, y + 4, bw * 2 + 1, 12, '#d8402c')
      c.rect(gx - bw, y + 4, 2, 12, '#f47a52')
      c.rect(gx + Math.floor(bw / 2), y + 4, bw - Math.floor(bw / 2) + 1, 12, '#9a2838')
      c.rect(gx - bw - 1, y + 12, bw * 2 + 3, 1, '#fbe3c8')
      c.rect(gx - hw + 3, y, hw * 2 - 5, 2, roof)
      c.rect(gx - hw, y + 2, hw * 2 + 1, 2, roof)
      c.rect(gx - hw - 2, y + 1, 3, 1, roof)
      c.rect(gx + hw, y + 1, 3, 1, roof)
      c.rect(gx - hw + 3, y, hw - 3, 1, '#6a5a98')
    }
    c.rect(gx, 40, 1, 18, roof)
    for (const y of [44, 47, 50, 53]) c.rect(gx - 1, y, 3, 1, '#e2a13c')
    c.set(gx, 39, '#e2a13c')

    // Foreground hill and cherry blossom.
    c.ridge(142, [[5, 1.2, 0.6], [2, 4, 1]], '#2c2148')
    const pink = '#f48fb1'
    const pale = '#ffd0e0'
    const deep = '#c25a8c'
    c.line(34, 160, 40, 118, '#2c2148', 3)
    c.line(40, 122, 62, 104, '#2c2148', 2)
    c.line(39, 126, 18, 108, '#2c2148', 2)
    const tree: [number, number, number][] = []
    for (let i = 0; i < 34; i++) {
      const a = rand(i + 1) * Math.PI * 2
      const d = Math.sqrt(rand(i + 31))
      tree.push([42 + Math.round(Math.cos(a) * d * 40), 100 + Math.round(Math.sin(a) * d * 15), 3 + Math.floor(rand(i + 61) * 4)])
    }
    canopy(c, tree, pink, pale, deep)
    const bushes: [number, number, number][] = []
    for (let i = 0; i < 22; i++) bushes.push([166 + Math.floor(rand(i + 7) * 108), 136 + Math.floor(rand(i + 17) * 9), 3 + Math.floor(rand(i + 27) * 3)])
    canopy(c, bushes, pink, pale, deep)
  },
}

// ---------- u1: Eiffel Tower ----------

const eiffel: World = {
  unit: 'u1',
  landmark: 'Eiffel Tower',
  place: 'Paris, France',
  night: true,
  draw(c) {
    // Blue hour: deep blue falling to a band of pale gold.
    c.sky(['#0e1640', '#16245c', '#21407e', '#34689c', '#6a9cb0', '#c8c49a', '#f6c478'])
    c.stars(34, 21, 58)
    c.disc(54, 31, 6, '#fff2c0')
    c.disc(57, 29, 5, '#16245c')

    // Far rooftops: Paris is low and even, with one dome.
    for (let x = 0; x < W; x += 12) {
      const h = 7 + Math.floor(rand(x + 2) * 8)
      c.rect(x, 128 - h, 11, h + 30, '#2d5088')
      c.rect(x + 2, 126 - h, 2, 2, '#2d5088')
    }
    c.disc(44, 114, 8, '#2d5088')
    c.rect(44, 100, 1, 7, '#2d5088')
    // Nearer blocks with lit windows.
    for (let x = -4; x < W; x += 15) {
      const h = 10 + Math.floor(rand(x + 71) * 9)
      c.rect(x, 138 - h, 14, h + 20, '#15265a')
      c.rect(x + 1, 136 - h, 12, 2, '#1d3470')
      c.windows(x + 2, 141 - h, 11, h - 4, '#ffd27a', 3, 4, x + 5, 0.5)
    }

    // The tower, floodlit gold. Outer edge and the gap between the legs, by height.
    const cx = 152
    const gold = '#f0b040'
    const lit = '#ffe590'
    const shade = '#a8642a'
    const dark = '#6a3a22'
    const outer: P[] = [[30, 1.5], [44, 2.5], [66, 4], [82, 5.5], [93, 7.5], [103, 10], [113, 13.5], [124, 19], [134, 27]]
    for (let y = 30; y <= 134; y++) {
      const hw = Math.round(along(outer, y))
      for (let dx = -hw; dx <= hw; dx++) {
        // Open space: between the upper legs, and under the great arch.
        if (y > 94 && y < 111 && Math.abs(dx) < along([[94, 1], [111, 7]], y)) continue
        if (y > 114 && (dx * dx) / (19 * 19) + ((137 - y) * (137 - y)) / (21 * 21) < 1) continue
        const lattice = (((dx + y) % 4) + 4) % 4 === 0 || (((dx - y) % 4) + 4) % 4 === 0
        const edge = dx === -hw
        c.set(cx + dx, y, dx < 0 ? (edge || lattice ? lit : gold) : lattice ? gold : shade)
      }
    }
    // The arch rim, three decks and the top cabin.
    for (let a = 0; a <= 60; a++) {
      const t = (Math.PI * a) / 60
      c.set(cx + Math.cos(t) * 19, 137 - Math.sin(t) * 21, a > 30 ? lit : gold)
    }
    c.rect(cx - 15, 111, 31, 4, dark)
    c.rect(cx - 15, 111, 31, 1, lit)
    c.windows(cx - 13, 113, 27, 1, '#fff2c0', 2, 1, 4, 0.8)
    c.rect(cx - 9, 91, 19, 3, dark)
    c.rect(cx - 9, 91, 19, 1, lit)
    c.rect(cx - 3, 31, 7, 3, dark)
    c.rect(cx - 3, 31, 7, 1, lit)
    c.rect(cx - 1, 25, 3, 6, gold)
    c.rect(cx, 13, 1, 12, shade)
    c.set(cx, 12, '#fff2c0')

    // Foreground: the dark trees of the park.
    c.ridge(148, [[2, 4, 1.2], [1, 11, 0.4]], '#080e2a')
    for (let x = 3; x < W; x += 15) c.disc(x + Math.floor(rand(x + 4) * 6), 147, 4 + Math.floor(rand(x + 8) * 4), '#080e2a')
  },
}

// ---------- u2: Pyramids of Giza ----------

const giza: World = {
  unit: 'u2',
  landmark: 'Pyramids of Giza',
  place: 'Giza, Egypt',
  draw(c) {
    // Hot clear day: blue down to a dusty horizon, then sand.
    c.sky(['#2f8fd6', '#55aae4', '#86c6ee', '#bfe0ee', '#f1e3bc'], 0, 108)
    c.rect(0, 108, W, H - 108, '#e8bc6a')
    c.disc(40, 32, 13, '#fbeeb4')
    c.disc(40, 32, 9, '#ffffff')
    c.ridge(104, [[2, 2, 0.4], [1, 6, 2]], '#f0d49a', 112)

    // A pyramid: a lit face and a shaded face meeting at the near corner, with courses of stone.
    const pyramid = (ax: number, ay: number, base: number, left: number, front: number, right: number, cap = false) => {
      c.poly([[ax, ay], [left, base], [front, base + 4]], '#f4cf7c')
      c.poly([[ax, ay], [front, base + 4], [right, base]], '#b47c3c')
      for (let y = ay + 5; y < base; y += 4) {
        const t = (y - ay) / (base - ay)
        const ridge = ax + ((front - ax) * (y - ay)) / (base + 4 - ay)
        c.dither(ax + (left - ax) * t + 1, y, ridge - (ax + (left - ax) * t) - 1, 1, '#dcae5c', 0.5)
        c.dither(ridge + 1, y, ax + (right - ax) * t - ridge - 1, 1, '#986430', 0.5)
      }
      if (cap) {
        // The smooth casing stones still left at the top.
        const y = ay + 16
        const t = 16 / (base - ay)
        const ridge = ax + ((front - ax) * 16) / (base + 4 - ay)
        c.poly([[ax, ay], [ax + (left - ax) * t, y], [ridge, y + 1]], '#fff0c4')
        c.poly([[ax, ay], [ridge, y + 1], [ax + (right - ax) * t, y]], '#d09a54')
      }
    }
    pyramid(214, 46, 108, 156, 236, 272)
    pyramid(126, 22, 112, 44, 158, 208, true)
    pyramid(40, 76, 116, 2, 54, 80)

    // Sand: soft bands toward the viewer.
    c.dither(0, 118, W, 6, '#d9a550', 0.25)
    c.dither(0, 124, W, 8, '#d9a550', 0.5)
    c.rect(0, 132, W, 28, '#d9a550')

    // The Sphinx, looking east, in front of the far pyramid.
    const stone = '#a87434'
    const dim = '#6c4220'
    c.rect(214, 116, 46, 11, stone)
    c.ellipse(254, 117, 9, 7, stone)
    c.rect(214, 123, 50, 4, dim)
    c.rect(196, 122, 22, 5, stone)
    c.rect(196, 125, 22, 2, dim)
    c.poly([[208, 99], [219, 99], [225, 117], [213, 117]], dim)
    c.rect(205, 101, 8, 12, '#e4b464')
    c.rect(204, 98, 12, 3, stone)
    c.rect(204, 105, 2, 2, dim)
    c.rect(207, 113, 7, 4, stone)
    c.rect(214, 116, 40, 1, '#e4b464')
    c.rect(196, 122, 20, 1, '#e4b464')

    // A camel train on the near dune.
    c.ridge(140, [[4, 1, 2.6], [2, 3, 0.3]], '#a2662e')
    const camel = (x: number, y: number) => {
      const k = '#4a2a1a'
      c.rect(x, y - 7, 8, 3, k)
      c.rect(x + 2, y - 9, 4, 2, k)
      c.rect(x - 2, y - 10, 2, 5, k)
      c.rect(x - 4, y - 11, 3, 2, k)
      for (const d of [0, 2, 5, 7]) c.rect(x + d, y - 4, 1, 4, k)
    }
    for (let i = 0; i < 4; i++) camel(84 + i * 17, 139 - i)

    // Palms and a dark dune framing the bottom.
    c.ridge(152, [[3, 1.5, 4], [1, 5, 1]], '#4a2a1a')
    const palm = (x: number, y: number, h: number) => {
      c.line(x, y, x + 3, y - h, '#4a2a1a', 2)
      for (const [dx, dy] of [[-11, 3], [-9, -4], [-3, -8], [5, -7], [11, -2], [10, 5]]) {
        c.line(x + 3, y - h, x + 3 + dx, y - h + dy, '#2f5a3a', 2)
        c.line(x + 3 + dx, y - h + dy, x + 3 + dx * 1.25, y - h + dy + 4, '#2f5a3a')
      }
    }
    palm(18, 154, 40)
    palm(34, 156, 28)
  },
}

// ---------- u4: Niagara Falls ----------

const niagara: World = {
  unit: 'u4',
  landmark: 'Niagara Falls',
  place: 'Ontario, Canada',
  draw(c) {
    // Bright day over the far shore.
    c.sky(['#2f7fd0', '#55a0e0', '#86c0ec', '#c0e0f2'], 0, 46)
    c.cloud(24, 12, 46, '#ffffff')
    c.cloud(196, 6, 38, '#e4f2fa')
    for (let x = 0; x < W; x++) {
      const top = 39 - Math.floor(rand(Math.floor(x / 3) + 9) * 4)
      c.rect(x, top, 1, 46 - top, '#2f6f52')
    }
    // The upper river, calm before the drop; the gorge below.
    c.water(45, 100, '#3aa0b4', '#8fd4dc', 3)
    c.water(96, H, '#1c8494', '#6fd0cc', 8)

    // The horseshoe: the brink curves away from us, so the middle is higher and shorter.
    const mid = 132
    for (let x = 0; x < W; x++) {
      const u = Math.abs(x - mid) / 108
      if (u >= 1) {
        // The banks at either end: trees over a rock face.
        c.rect(x, 43 - Math.floor(rand(Math.floor(x / 4) + 3) * 5), 1, 30, '#2f7a4a')
        for (let y = 70; y < 120; y++) c.set(x, y, y > 104 || rand(Math.floor(x / 3) * 7 + Math.floor(y / 26)) > 0.6 ? '#3f5058' : '#566a70')
        continue
      }
      const brink = Math.round(48 + 18 * u * u)
      const foot = Math.round(94 + 26 * u * u)
      const s = rand(Math.floor(x / 2) * 7 + 1)
      const side = u > 0.7
      for (let y = brink; y <= foot; y++) {
        // A green lip where the water bends, then white streaks.
        const lip = y - brink
        const streak = rand(Math.floor(x / 2) * 5 + Math.floor((y - brink) / 14)) > 0.4 ? s : 1 - s
        const col = streak < 0.4 ? (side ? '#d2ecf4' : '#ffffff') : streak < 0.75 ? (side ? '#a2d6e6' : '#d2ecf4') : side ? '#74bcd4' : '#a2d6e6'
        c.set(x, y, lip < 2 ? '#48b49c' : lip < 4 ? '#8fd8c8' : col)
      }
    }

    // A rainbow standing in the spray.
    const bow = ['#f25a5a', '#f9a84a', '#f9e86a', '#6ad08a', '#5a9af0']
    for (let y = 30; y < 104; y++)
      for (let x = 110; x < W; x++) {
        const r = Math.sqrt((x - 198) * (x - 198) + (y - 112) * (y - 112))
        const i = Math.floor((68 - r) / 2)
        const thin = y > 84 ? (x + y) % 2 === 0 : x % 2 === 0 || y % 2 === 0
        if (i >= 0 && i < 5 && thin) c.set(x, y, bow[i])
      }

    // Mist boiling up from the foot of the falls.
    for (let x = 30; x <= 236; x += 9) {
      const u = Math.abs(x - mid) / 108
      c.disc(x + Math.floor(rand(x) * 4), Math.round(96 + 26 * u * u) + Math.floor(rand(x + 5) * 4), 5 + Math.floor((1 - u) * 5 + rand(x + 2) * 3), '#ffffff')
    }
    for (let x = 44; x <= 222; x += 13) c.ellipse(x + Math.floor(rand(x + 8) * 5), 106 + Math.floor(rand(x + 1) * 5), 9, 3, '#d2ecf4')

    // A tour boat nosing toward the spray.
    c.rect(72, 126, 18, 3, '#ffffff')
    c.rect(74, 129, 14, 1, '#1f4a7a')
    c.rect(76, 122, 10, 4, '#e4f4f8')
    c.rect(77, 123, 8, 1, '#e2472c')
    c.rect(80, 119, 2, 3, '#1f4a7a')

    // Foreground: a dark wooded bank.
    c.poly([[0, 132], [44, 138], [110, 149], [200, 153], [W, 150], [W, H], [0, H]], '#0f2b2c')
    for (let x = 4; x < 120; x += 10) c.pine(x + Math.floor(rand(x + 1) * 4), 138 + Math.floor(x / 9), 14 + Math.floor(rand(x + 6) * 12), '#0f2b2c')
    for (let x = 190; x < W; x += 11) c.pine(x, 153, 10 + Math.floor(rand(x + 2) * 10), '#0f2b2c')
  },
}

// ---------- u5: Golden Gate Bridge ----------

const goldenGate: World = {
  unit: 'u5',
  landmark: 'Golden Gate Bridge',
  place: 'San Francisco, USA',
  draw(c) {
    // Sunset: mauve overhead burning down to gold.
    c.sky(['#5c3a78', '#a4486e', '#e0603f', '#f58a3a', '#fbb84c', '#fde08a'], 0, 114)
    c.disc(222, 98, 19, '#fde08a')
    c.disc(222, 98, 15, '#fff6c8')
    c.cloud(28, 24, 52, '#c2587a')
    c.cloud(120, 38, 34, '#f07a52')

    // The far headlands and the bay.
    for (let x = 0; x < 128; x++) {
      const top = Math.round(114 - 26 * Math.pow(Math.sin((Math.PI * (x + 30)) / 160), 2) - 3 * Math.sin(x / 7))
      c.rect(x, top, 1, 114 - top, '#7a3a66')
    }
    c.water(113, H, '#8a3f66', '#f9a94e', 4)
    for (let y = 114; y < 150; y += 2) c.rect(214 + Math.floor(rand(y) * 10), y, 6 + Math.floor(rand(y + 3) * 10), 1, '#fde08a')

    const red = '#e2472c'
    const lit = '#ff8a50'
    const shade = '#9c2a34'
    const deck = (x: number) => 88 + (170 - x) * 0.08

    // The far tower, and fog rolling in around its feet.
    c.rect(66, 58, 2, 56, shade)
    c.rect(72, 58, 2, 56, red)
    for (const y of [60, 70, 80, 90]) c.rect(66, y, 8, 2, red)
    bank(c, -10, 150, 108, '#f6b48c', 5, 0.9)

    // Cables: one long sag between the towers, and the side spans.
    const cable = (x: number) => {
      if (x > 170) return 16 + ((x - 170) / 130) * 62 + 9 * Math.sin((Math.PI * (x - 170)) / 130)
      if (x < 70) return 58 + ((70 - x) / 52) * 40 + 4 * Math.sin((Math.PI * (70 - x)) / 52)
      const s = (x - 70) / 100
      const k = (s - 0.42) / (s < 0.42 ? 0.42 : 0.58)
      return 58 - 42 * s + (deck(112) - 3 - (58 - 42 * 0.42)) * (1 - k * k)
    }
    for (let x = 18; x < W; x++) {
      const y = Math.round(cable(x))
      const d = Math.round(deck(x))
      if (x % (x > 150 ? 5 : x > 100 ? 4 : 3) === 0) c.rect(x, y, 1, d - y, shade)
      c.rect(x, y, 1, x > 140 ? 2 : 1, red)
      // The roadway, thicker as it comes toward us.
      const t = x > 200 ? 4 : x > 130 ? 3 : 2
      c.rect(x, d, 1, t, red)
      c.rect(x, d, 1, 1, lit)
      if (t > 2) c.rect(x, d + t - 1, 1, 1, shade)
    }

    // The near tower: two stepped columns, four cross-struts, bracing below the road.
    const tx = 170
    for (const side of [-1, 1]) {
      const x = tx + side * 9
      c.rect(x - 3, 40, 7, 86, red)
      c.rect(x - 2, 14, 5, 26, red)
      c.rect(x - 3, 40, 2, 86, shade)
      c.rect(x - 2, 14, 1, 26, shade)
      c.rect(x + 3, 40, 1, 86, lit)
      c.rect(x + 2, 14, 1, 26, lit)
    }
    for (const y of [16, 34, 52, 70]) {
      c.rect(tx - 7, y, 15, 4, red)
      c.rect(tx - 7, y, 15, 1, lit)
      c.rect(tx - 7, y + 3, 15, 1, shade)
    }
    c.line(tx - 6, 94, tx + 6, 110, shade)
    c.line(tx + 6, 94, tx - 6, 110, shade)
    c.rect(tx - 14, 88, 29, 3, red)
    c.rect(tx - 14, 88, 29, 1, lit)

    // Near fog over the water, then a dark headland with cypress.
    bank(c, 60, 300, 122, '#fbd2a8', 9, 1.3)
    bank(c, -10, 120, 128, '#fbd2a8', 12, 1)
    c.poly([[96, H], [150, 150], [196, 142], [236, 132], [W, 126], [W, H]], '#2a1436')
    c.ridge(154, [[2, 3, 1], [1, 9, 0]], '#2a1436')
    for (let x = 200; x < W; x += 12) c.pine(x + Math.floor(rand(x) * 4), 140 - Math.floor((x - 200) / 6), 12 + Math.floor(rand(x + 4) * 10), '#2a1436')
  },
}

// ---------- u6: Machu Picchu ----------

const machuPicchu: World = {
  unit: 'u6',
  landmark: 'Machu Picchu',
  place: 'Cusco Region, Peru',
  draw(c) {
    // Cool Andean morning, sun just over the ridge on the right.
    c.sky(['#62b0d8', '#94cfe4', '#c6e8dc', '#eef0c8', '#fbe4a8'], 0, 112)
    c.rect(0, 112, W, H - 112, '#6fae4c')
    c.disc(238, 34, 12, '#fdf2b8')
    c.disc(238, 34, 8, '#ffffff')

    // Far ranges, paling with distance, and cloud lying in the valley.
    c.ridge(74, [[9, 1.5, 0.5], [4, 4, 2]], '#a6cfc6', 114)
    c.ridge(88, [[7, 2.2, 3.2], [3, 6, 1]], '#78aea2', 114)
    bank(c, -10, 290, 94, '#eef6ea', 3, 1.2)

    const body = '#3f8048'
    const lit = '#6cae58'
    const shade = '#285a40'
    const rock = '#93a08c'
    // The shoulder on the right and the small peak on the left.
    c.poly([[W, 46], [254, 58], [240, 84], [226, 118], [W, 118]], body)
    c.poly([[W, 46], [254, 58], [240, 84], [226, 118], [240, 118], [256, 80]], shade)
    c.poly([[74, 118], [92, 84], [102, 68], [108, 66], [116, 76], [130, 118]], body)
    c.poly([[74, 118], [92, 84], [102, 68], [108, 66], [104, 90], [98, 118]], shade)

    // Huayna Picchu: a steep fang with a bare rock face.
    c.poly([[160, 15], [166, 19], [176, 36], [192, 64], [210, 96], [226, 118], [98, 118], [114, 96], [130, 70], [144, 44], [154, 22]], body)
    c.poly([[160, 15], [154, 22], [144, 44], [130, 70], [114, 96], [98, 118], [140, 118], [150, 80], [158, 44]], shade)
    c.poly([[160, 15], [166, 19], [176, 36], [192, 64], [210, 96], [226, 118], [204, 118], [186, 78], [170, 40]], lit)
    c.poly([[160, 17], [165, 24], [170, 42], [164, 54], [158, 40]], rock)
    c.poly([[166, 58], [176, 66], [182, 86], [172, 92], [164, 74]], rock)
    c.poly([[160, 17], [158, 40], [164, 54], [161, 30]], '#6f7c72')
    bank(c, 70, 280, 106, '#eef6ea', 21, 0.8)

    // The citadel's ridge, a bright plaza, and farming terraces stepping down on the left.
    c.ridge(114, [[3, 1, 2], [1, 4, 0]], '#6fae4c')
    for (let i = 0; i < 9; i++) {
      const y = 112 + i * 6
      const edge = (x: number) => 118 - i * 7 + 6 * Math.sin(x / 9 + i)
      for (let x = 0; x < 130; x++)
        if (x < edge(x)) {
          c.rect(x, y, 1, 2, '#b9ad88')
          c.rect(x, y + 2, 1, 4, i % 2 ? '#7fbc52' : '#5c9c44')
        }
    }
    c.ellipse(164, 133, 32, 6, '#93cc5c')

    // Roofless stone houses with their pointed gables.
    const house = (x: number, y: number, w: number, h: number) => {
      c.rect(x, y - h, w, h, '#d2c6a2')
      c.tri(x + Math.floor(w / 2), y - h - Math.ceil(w / 2), y - h, Math.floor(w / 2), '#d2c6a2')
      c.rect(x + w - Math.ceil(w / 3), y - h, Math.ceil(w / 3), h, '#938868')
      c.rect(x + 1, y - h + 2, 1, 2, '#4a4636')
      c.rect(x, y, w, 1, '#938868')
    }
    // Four tiers of walls stepping down the ridge, houses crowded along each.
    for (let t = 0; t < 4; t++) {
      const y = 121 + t * 8
      const x0 = t === 1 || t === 2 ? 204 : 128 + t * 4
      c.rect(x0 - 3, y, W - x0 + 3, 2, '#b9ad88')
      c.rect(x0 - 3, y + 2, W - x0 + 3, 1, '#938868')
      for (let x = x0; x < W - 4; ) {
        const w = 5 + Math.floor(rand(x + t * 9) * 3)
        if (rand(x + t * 5 + 2) > 0.25) house(x, y, w, 4 + (t > 1 ? 1 : 0))
        else c.rect(x, y - 3, w, 3, '#938868')
        x += w + 2 + Math.floor(rand(x + 4) * 3)
      }
    }

    // A llama on the terraces, and a dark slope at our feet.
    const lx = 44
    const ly = 116
    c.rect(lx, ly - 7, 10, 4, '#fff6e0')
    c.rect(lx + 8, ly - 13, 3, 8, '#fff6e0')
    c.rect(lx + 9, ly - 14, 4, 3, '#fff6e0')
    c.set(lx + 9, ly - 15, '#fff6e0')
    for (const d of [0, 2, 7, 9]) c.rect(lx + d, ly - 3, 1, 3, '#d2c6a2')
    c.ridge(152, [[4, 1.3, 1], [2, 5, 2]], '#1c3c2c')
    for (let x = 0; x < W; x += 14) c.disc(x + Math.floor(rand(x + 2) * 6), 152, 4 + Math.floor(rand(x + 6) * 4), '#1c3c2c')
  },
}

// ---------- u7: Sydney Opera House ----------

const sydney: World = {
  unit: 'u7',
  landmark: 'Sydney Opera House',
  place: 'Sydney, Australia',
  draw(c) {
    // Late afternoon: teal-blue above, a warm haze low down.
    c.sky(['#2f7fb4', '#55a3c8', '#8cc6d4', '#c8e0c8', '#f6dca4', '#f9c48c'], 0, 106)
    c.cloud(180, 14, 54, '#f4f0dc')
    c.cloud(30, 26, 34, '#c4e2e0')

    // The far shore and the harbour.
    c.ridge(100, [[2, 3, 0.8], [1, 9, 2]], '#7c9cae', 108)
    c.water(104, H, '#1f5490', '#8cc6e4', 6)

    // The Harbour Bridge behind: a steel arch between two stone pylons.
    const steel = '#4c6488'
    const span = (x: number) => Math.sin((Math.PI * (x - 10)) / 126)
    for (let x = 10; x <= 136; x++) {
      const top = Math.round(90 - 38 * span(x))
      const low = Math.round(92 - 28 * Math.pow(span(x), 0.8))
      c.rect(x, top, 1, 2, steel)
      c.rect(x, low, 1, 1, steel)
      if (x % 4 === 0) c.rect(x, top, 1, Math.max(1, low - top), steel)
      if (x % 6 === 0 && low < 90) c.rect(x, low, 1, 90 - low, '#6c84a4')
    }
    c.rect(0, 90, 150, 3, steel)
    c.rect(0, 90, 150, 1, '#8ca4c0')
    for (const x of [4, 136]) {
      c.rect(x, 74, 7, 30, '#b8a890')
      c.rect(x + 4, 74, 3, 30, '#8a7c74')
      c.rect(x - 1, 73, 9, 2, '#b8a890')
    }

    // The podium the shells stand on.
    c.rect(92, 96, 172, 9, '#c88c6c')
    c.rect(92, 96, 172, 2, '#e8b890')
    c.rect(92, 102, 172, 3, '#8c5a50')
    c.poly([[84, 105], [92, 100], [92, 105]], '#8c5a50')

    // A shell: a tall curved fin leaning over its glass mouth. `dir` is the way it faces.
    const shell = (foot: number, back: number, ax: number, ay: number, body: string, rib: string) => {
      const base = 97
      const dir = foot < back ? 1 : -1
      const spine = curve([back, base], [back - dir * 2, ay + (base - ay) * 0.18], [ax, ay])
      const mouth = curve([ax, ay], [ax + dir * (foot - ax) * dir * 0.2 + dir * 2, (ay + base) / 2], [foot, base])
      c.poly([...spine, ...mouth], body)
      // The shaded rib along the mouth, and the dark glass under it.
      c.poly([...mouth, [foot + dir * (back - foot) * dir * 0.3, base], [ax + dir * 3, ay + 7]], rib)
      c.poly([[foot + dir * 2, base], [ax + dir * 4, ay + (base - ay) * 0.45], [foot + (back - foot) * 0.34, base]], '#3c4470')
    }
    const white = '#fff8e8'
    const cream = '#e4d4c4'
    const grey = '#b8a8b0'
    // The second hall behind, in shadow; then the main row, back to front.
    shell(214, 250, 206, 38, cream, grey)
    shell(252, 222, 258, 62, white, cream)
    shell(160, 216, 150, 24, white, cream)
    shell(134, 174, 126, 48, white, cream)
    shell(114, 142, 108, 70, white, cream)
    shell(262, 246, 265, 84, white, cream)

    // The shells mirrored in the water, a sailing boat and a ferry.
    for (let y = 106; y < 124; y += 2) c.rect(110 + Math.floor(rand(y) * 8), y, 140 - (y - 106) * 4, 1, '#c8dcec')
    c.tri(52, 108, 126, 6, '#ffffff')
    c.poly([[54, 110], [54, 126], [62, 126]], '#e4d4c4')
    c.rect(44, 127, 20, 2, '#12305c')
    c.rect(196, 132, 30, 4, '#2f7a52')
    c.rect(198, 128, 26, 4, '#f6dca4')
    c.windows(199, 130, 24, 1, '#12305c', 3, 1, 2, 1)
    c.rect(208, 125, 6, 3, '#f6dca4')

    // Foreground: the dark shore of the gardens.
    c.ridge(152, [[3, 1.4, 2], [1, 6, 1]], '#0c2244')
    for (let x = 0; x < W; x += 16) c.disc(x + Math.floor(rand(x + 3) * 8), 151, 5 + Math.floor(rand(x + 9) * 5), '#0c2244')
  },
}

// ---------- u8: Statue of Liberty ----------

const liberty: World = {
  unit: 'u8',
  landmark: 'Statue of Liberty',
  place: 'New York, USA',
  night: true,
  draw(c) {
    // A teal evening with a full moon over the harbour.
    c.sky(['#071a2c', '#0b2840', '#113a54', '#1a5066', '#2a6872', '#48807c'], 0, 122)
    c.stars(30, 44, 56)
    haze(c, 186, 40, 26, 26, '#48807c', 0.25)
    haze(c, 186, 40, 21, 21, '#8fb8a0', 0.25)
    c.disc(186, 40, 15, '#f4f0d0')
    c.disc(181, 36, 3, '#d8dcb8')
    c.disc(191, 45, 2, '#d8dcb8')

    // The skyline across the water, far then near.
    for (let x = 0; x < W; x += 8) {
      const h = (x > 150 ? 12 : 4) + Math.floor(rand(x + 6) * (x > 150 ? 26 : 10))
      c.rect(x, 121 - h, 7, h, '#1a5066')
    }
    c.rect(232, 66, 6, 56, '#1a5066')
    c.rect(234, 54, 1, 12, '#1a5066')
    for (let x = 146; x < W; x += 11) {
      const h = 10 + Math.floor(rand(x + 16) * 22)
      const w = 8 + Math.floor(rand(x + 2) * 3)
      c.rect(x, 121 - h, w, h, '#0c3246')
      c.windows(x + 1, 123 - h, w - 2, h - 4, '#ffd27a', 2, 3, x, 0.35)
    }
    c.water(121, H, '#0a2c40', '#3c8a88', 5)
    for (let y = 123; y < 152; y += 2) c.rect(180 + Math.floor(rand(y + 1) * 8), y, 4 + Math.floor(rand(y + 4) * 9), 1, '#d8dcb8')

    // Her island and the star-shaped fort.
    const cx = 112
    c.ellipse(cx, 121, 66, 4, '#061826')
    for (let x = cx - 60; x <= cx + 60; x += 9) if (Math.abs(x - cx) > 46) c.disc(x, 116, 4, '#061826')
    const stone = '#a8b4ac'
    const stoneLit = '#d4dccc'
    const stoneDim = '#5c7078'
    c.poly([[cx - 48, 118], [cx - 36, 108], [cx + 36, 108], [cx + 48, 118]], stoneDim)
    c.poly([[cx - 48, 118], [cx - 36, 108], [cx, 108], [cx, 118]], stone)
    c.rect(cx - 36, 108, 73, 1, stoneLit)
    // The pedestal: stepped base, tapering shaft, a balcony.
    c.rect(cx - 20, 103, 41, 5, stone)
    c.rect(cx - 15, 98, 31, 5, stone)
    c.poly([[cx - 9, 72], [cx + 9, 72], [cx + 12, 98], [cx - 12, 98]], stone)
    c.poly([[cx + 3, 72], [cx + 9, 72], [cx + 12, 98], [cx + 4, 98]], stoneDim)
    c.rect(cx + 6, 98, 10, 5, stoneDim)
    c.rect(cx + 8, 103, 13, 5, stoneDim)
    c.rect(cx - 12, 70, 25, 2, stoneLit)
    c.rect(cx - 12, 86, 25, 2, stoneLit)
    for (const dx of [-6, -2, 2, 6]) c.rect(cx + dx - 1, 76, 2, 7, '#34484f')
    c.rect(cx - 1, 91, 3, 7, '#34484f')

    // The statue: robe, raised torch arm, tablet, crowned head.
    const green = '#5cc0a0'
    const pale = '#a8ecd0'
    const deep = '#2c7870'
    c.poly([[cx - 8, 37], [cx + 7, 36], [cx + 9, 52], [cx + 11, 70], [cx - 11, 70], [cx - 9, 52]], green)
    c.poly([[cx + 2, 36], [cx + 7, 36], [cx + 9, 52], [cx + 11, 70], [cx + 4, 70]], deep)
    c.poly([[cx - 8, 37], [cx - 5, 37], [cx - 7, 70], [cx - 11, 70], [cx - 9, 52]], pale)
    c.line(cx - 5, 40, cx + 6, 54, deep)
    c.line(cx - 6, 48, cx + 4, 64, deep)
    c.line(cx - 4, 57, cx + 1, 69, deep)
    c.poly([[cx - 15, 22], [cx - 10, 22], [cx - 3, 37], [cx - 9, 41]], green)
    c.line(cx - 15, 22, cx - 10, 40, pale, 2)
    c.poly([[cx + 6, 38], [cx + 12, 45], [cx + 10, 50], [cx + 4, 43]], deep)
    c.rect(cx + 8, 40, 5, 11, green)
    c.rect(cx + 8, 40, 2, 11, pale)
    c.rect(cx - 3, 27, 7, 8, green)
    c.rect(cx + 1, 28, 3, 7, deep)
    c.rect(cx - 1, 35, 4, 2, deep)
    c.rect(cx - 4, 26, 9, 2, pale)
    for (const [dx, dy] of [[-7, -2], [-4, -5], [0, -6], [4, -5], [7, -2]]) c.line(cx, 26, cx + dx, 26 + dy, pale)
    // The torch and its flame.
    c.rect(cx - 14, 18, 3, 5, green)
    c.rect(cx - 16, 17, 7, 2, pale)
    c.ellipse(cx - 13, 13, 2, 3, '#ffd27a')
    c.rect(cx - 13, 9, 1, 3, '#ffd27a')
    c.set(cx - 13, 14, '#ffffff')

    // A ferry with its lights on, and dark pilings at the bottom edge.
    c.rect(210, 138, 28, 4, '#061826')
    c.rect(214, 134, 20, 4, '#061826')
    c.windows(215, 136, 18, 1, '#ffd27a', 2, 1, 1, 1)
    c.ridge(154, [[1, 2, 0], [1, 7, 1]], '#04121c')
    for (let x = 6; x < W; x += 22) c.rect(x, 144 + Math.floor(rand(x) * 5), 3, 16, '#04121c')
  },
}

// ---------- u9: Taj Mahal ----------

const tajMahal: World = {
  unit: 'u9',
  landmark: 'Taj Mahal',
  place: 'Agra, India',
  draw(c) {
    // Sunrise through haze: lavender to apricot.
    c.sky(['#7c84c2', '#b29ac8', '#e4aab4', '#f8c2a0', '#fddaa4', '#feecc0'], 0, 108)
    c.rect(0, 108, W, H - 108, '#3c6c50')
    c.disc(52, 84, 14, '#ffc890')
    c.disc(52, 84, 10, '#fff0c8')
    c.ridge(99, [[2, 5, 1], [1, 14, 0]], '#c9a4b8', 108)

    const cx = 142
    const lit = '#fff6ea'
    const mid = '#f2d4c8'
    const shade = '#d4a4ac'
    const recess = '#a87490'
    const gold = '#e2a13c'

    // A minaret: a slim shaft with balconies and a little domed cap.
    const minaret = (x: number, top: number, w: number, a: string, b: string) => {
      c.rect(x - w, top + 8, w * 2 + 1, 98 - top - 8, a)
      c.rect(x + 1, top + 8, w, 98 - top - 8, b)
      for (const y of [top + 8, top + 26, top + 42]) c.rect(x - w - 1, y, w * 2 + 3, 2, b)
      c.disc(x, top + 4, w + 1, a)
      c.rect(x - w, top + 5, w * 2 + 1, 3, recess)
      c.rect(x, top - 2, 1, 4, gold)
    }
    minaret(cx - 52, 50, 1, mid, shade)
    minaret(cx + 52, 50, 1, mid, shade)

    // The onion dome on its drum, and the four small domes beside it.
    c.ellipse(cx, 40, 17, 16, mid)
    c.tri(cx, 17, 27, 6, mid)
    c.ellipse(cx - 4, 40, 13, 15, lit)
    c.tri(cx - 1, 18, 27, 4, lit)
    c.rect(cx, 10, 1, 8, gold)
    c.rect(cx - 1, 13, 3, 1, gold)
    c.rect(cx - 13, 52, 27, 8, lit)
    c.rect(cx + 4, 52, 10, 8, mid)
    c.rect(cx - 14, 51, 29, 1, shade)
    for (const side of [-1, 1]) {
      const x = cx + side * 23
      c.disc(x, 56, 5, side < 0 ? lit : mid)
      c.rect(x - 5, 57, 11, 6, side < 0 ? lit : mid)
      for (const dx of [-3, 0, 3]) c.rect(x + dx, 58, 1, 4, recess)
      c.rect(x, 48, 1, 3, gold)
    }

    // The tomb: a tall central portal between two wings, with chamfered corners.
    c.rect(cx - 34, 66, 69, 32, lit)
    c.rect(cx + 14, 66, 21, 32, mid)
    c.rect(cx - 38, 68, 5, 30, mid)
    c.rect(cx + 34, 68, 5, 30, shade)
    c.rect(cx - 14, 60, 29, 38, lit)
    c.rect(cx - 14, 60, 29, 1, shade)
    c.rect(cx - 34, 66, 20, 1, shade)
    c.rect(cx + 15, 66, 20, 1, shade)
    const arch = (x: number, y: number, hw: number, h: number, col: string) => {
      c.tri(x, y, y + hw, hw, col)
      c.rect(x - hw, y + hw, hw * 2 + 1, h - hw, col)
    }
    arch(cx, 66, 9, 32, shade)
    arch(cx, 72, 6, 26, recess)
    arch(cx, 86, 2, 12, '#6c4868')
    for (const side of [-1, 1])
      for (const y of [70, 85]) {
        arch(cx + side * 24, y, 4, 12, recess)
        arch(cx + side * 36, y + 1, 1, 9, recess)
      }

    // The marble terrace and the front pair of minarets.
    c.rect(cx - 84, 98, 169, 9, mid)
    c.rect(cx - 84, 98, 169, 2, lit)
    c.rect(cx + 40, 100, 45, 7, shade)
    for (let x = cx - 80; x < cx + 82; x += 7) c.rect(x, 102, 3, 4, recess)
    minaret(cx - 76, 40, 2, lit, mid)
    minaret(cx + 76, 40, 2, lit, shade)

    // Gardens, with morning haze lying against the terrace.
    c.rect(0, 107, W, 2, '#2c5444')
    for (let y = 116; y < H; y += 12) c.dither(0, y, W, 6, '#2c5444', 0.5)

    // The long pool, holding the tomb upside down.
    const half = (y: number) => 8 + (y - 112) * 0.95
    for (let y = 112; y < H; y++) {
      const hw = Math.round(half(y))
      c.rect(cx - hw - 4, y, 4, 1, '#e8bca0')
      c.rect(cx + hw + 1, y, 4, 1, '#c48c84')
      for (let x = cx - hw; x <= cx + hw; x++) {
        // Marble shows as one soft tone, the arches a little darker; the rest is sky-blue water.
        const src = c.get(x, 108 - Math.round((y - 112) * 2))
        const ripple = y % 3 === 0 && rand(y * 31 + Math.floor(x / 6)) > 0.3
        const tone = src === lit || src === mid || src === shade ? '#dcd0e0' : src === recess ? '#a894bc' : '#7c94c4'
        c.set(x, y, ripple ? '#7c94c4' : tone)
      }
    }

    // Rows of cypress leading the eye in.
    for (let i = 0; i < 5; i++)
      for (const side of [-1, 1]) {
        const h = 10 + i * 4
        c.ellipse(cx + side * (20 + i * 15), 118 + i * 9 - Math.round(h / 2), 2 + Math.floor(i / 2), Math.round(h / 2), '#183a34')
        c.rect(cx + side * (20 + i * 15), 118 + i * 9, 1, 2, '#183a34')
      }
    c.ridge(156, [[1, 3, 0], [1, 8, 2]], '#102a28')
  },
}

export const scenes: World[] = [fuji, eiffel, giza, niagara, goldenGate, machuPicchu, sydney, liberty, tajMahal]
