import { H, rand, W, type Canvas, type World } from '../canvas'

type Pt = [number, number]

/** Height of a polyline crest at x (points sorted left to right). */
function crestAt(pts: Pt[], x: number): number {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (x >= x1 && x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1)
  }
  return x < pts[0][0] ? pts[0][1] : pts[pts.length - 1][1]
}

/** A mountain below a crest. Slopes that fall away to the right get the shade colour. */
function mountain(c: Canvas, pts: Pt[], lit: string, shade: string, skew = 0.45) {
  c.poly([...pts, [pts[pts.length - 1][0], H], [pts[0][0], H]], lit)
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (y2 > y1) c.poly([[x1, y1], [x2, y2], [x2 + (H - y2) * skew, H], [x1 + (H - y1) * skew, H]], shade)
  }
}

// ───────────────────────────── u10 Great Wall ─────────────────────────────

/** A wall running along a crest: lit top, shaded foot, battlements when thick enough. */
function wall(c: Canvas, pts: Pt[], x0: number, x1: number, th: number, lit: string, shade: string) {
  for (let x = x0; x <= x1; x++) {
    const y = Math.round(crestAt(pts, x))
    const notch = th >= 4 && x % 4 < 2 ? (th >= 7 ? 2 : 1) : 0
    c.rect(x, y - th - notch, 1, th + notch, lit)
    c.rect(x, y - Math.floor(th * 0.45), 1, Math.floor(th * 0.45) + 1, shade)
  }
}

/** A squat watchtower with a battlemented top, centred on cx, standing on `base`. */
function watchtower(c: Canvas, cx: number, base: number, w: number, h: number, lit: string, shade: string, dark: string) {
  const x = cx - Math.floor(w / 2)
  const split = Math.ceil(w * 0.6)
  c.rect(x, base - h, w, h, lit)
  c.rect(x + split, base - h, w - split, h, shade)
  if (h < 8) return
  // Parapet, one pixel proud of the body, with merlons on top.
  c.rect(x - 1, base - h - 2, w + 2, 2, lit)
  c.rect(x + split, base - h - 2, w + 1 - split, 2, shade)
  for (let i = 0; i < w + 1; i += 4) c.rect(x - 1 + i, base - h - 4, 2, 2, i >= split ? shade : lit)
  // Arched windows.
  const n = w >= 18 ? 3 : 2
  for (let i = 0; i < n; i++) {
    const wx = x + Math.round(((i + 0.5) * w) / n) - 1
    const wh = Math.max(3, Math.round(h * 0.26))
    c.rect(wx, base - h + Math.round(h * 0.3), w >= 18 ? 3 : 2, wh, dark)
  }
}

const greatWall: World = {
  unit: 'u10',
  landmark: 'Great Wall of China',
  place: 'Beijing, China',
  draw(c) {
    c.sky(['#8fb3cf', '#a9c6d6', '#c6d8d8', '#e2e3cc', '#f5e0b4', '#fbd9a2'])
    // A pale sun burning through the haze.
    c.disc(116, 36, 14, '#f3e8c4')
    c.disc(116, 36, 10, '#fff6da')

    const stone = '#ead9b0'
    const stoneShade = '#a8926e'
    const dark = '#4a4034'
    const mist = '#dfe5d6'

    // Far ridge, nearly lost in the mist, with a thread of wall along it.
    const far: Pt[] = [[0, 76], [34, 62], [66, 72], [104, 54], [140, 70], [176, 64], [228, 50], [272, 66]]
    mountain(c, far, '#a9c4b6', '#96b4ac')
    for (let x = 0; x < W; x++) c.rect(x, Math.round(crestAt(far, x)) - 1, 1, 2, '#e3dcc2')
    for (const x of [34, 104, 228]) c.rect(x - 2, crestAt(far, x) - 5, 5, 5, '#e3dcc2')
    c.dither(0, 78, W, 6, mist, 0.5)
    c.rect(0, 84, W, 40, mist)

    // Middle ridge: the wall climbs to a tower, then drops behind the near hill.
    const mid: Pt[] = [[0, 100], [26, 86], [64, 62], [98, 86], [130, 100], [170, 106], [272, 114]]
    mountain(c, mid, '#74a077', '#55826a')
    wall(c, mid, 0, 134, 4, stone, stoneShade)
    watchtower(c, 64, 64, 11, 12, stone, stoneShade, dark)
    c.dither(0, 108, W, 6, mist, 0.5)
    c.rect(0, 114, W, 46, mist)

    // Near ridge with the big watchtower on its summit.
    const near: Pt[] = [[40, 160], [84, 130], [114, 114], [150, 92], [188, 56], [216, 84], [242, 78], [272, 100]]
    mountain(c, near, '#40744a', '#295340')
    wall(c, near, 40, W, 8, stone, stoneShade)
    watchtower(c, 242, 78, 13, 13, stone, stoneShade, dark)
    watchtower(c, 112, 114, 13, 13, stone, stoneShade, dark)
    watchtower(c, 188, 58, 24, 24, stone, stoneShade, dark)

    // Foreground: dark brush and pines along the bottom.
    c.ridge(147, [[2, 3, 1.2], [1, 9, 0.4]], '#16301f')
    for (let x = 3; x < W; x += 15) c.disc(x + Math.floor(rand(x) * 6), 150, 4 + Math.floor(rand(x + 9) * 4), '#16301f')
    for (const [x, h] of [[14, 30], [30, 20], [258, 26]] as const) c.pine(x, 152, h, '#16301f')
  },
}

// ───────────────────────────── u11 Big Ben ─────────────────────────────

const bigBen: World = {
  unit: 'u11',
  landmark: 'Big Ben',
  place: 'London, UK',
  night: true,
  draw(c) {
    c.sky(['#0e1730', '#152242', '#1e3054', '#2b4166', '#3d5274', '#55627e'], 0, 126)
    c.stars(24, 11, 40)
    // A moon half hidden by flat evening clouds.
    c.disc(62, 34, 9, '#dfe6da')
    for (const [x, y, w, col] of [[44, 37, 40, '#3d5274'], [96, 22, 46, '#152242'], [8, 54, 52, '#2b4166'], [200, 30, 54, '#1e3054'], [214, 58, 50, '#2b4166'], [120, 50, 36, '#2b4166']] as const) c.cloud(x, y, w, col)

    const bank = 124
    const gold = '#dcbb78'
    const goldShade = '#9c7e52'
    const stoneDim = '#77634a'
    const slate = '#232c44'
    const lamp = '#ffd27a'

    // Far city across the river, barely lighter than the sky.
    for (let x = 0; x < W; x += 11) {
      const h = 6 + Math.floor(rand(x + 17) * 16)
      c.rect(x, bank - h, 10, h, '#33466a')
    }

    // Palace of Westminster: a long pinnacled range with two lesser towers.
    c.rect(22, 98, 152, bank - 98, stoneDim)
    c.rect(22, 95, 152, 3, slate)
    for (let x = 23; x < 173; x += 6) c.rect(x, 91, 1, 7, stoneDim)
    c.dither(22, 112, 152, 12, goldShade, 0.5)
    c.windows(25, 102, 147, 18, lamp, 3, 5, 5, 0.75)
    // Victoria Tower: square, with four corner turrets.
    c.rect(34, 64, 20, bank - 64, stoneDim)
    c.rect(47, 64, 7, bank - 64, '#5d4d3c')
    for (const x of [33, 52]) {
      c.rect(x, 56, 3, 10, stoneDim)
      c.rect(x + 1, 52, 1, 4, stoneDim)
    }
    c.rect(43, 54, 1, 10, stoneDim)
    c.windows(37, 70, 14, 26, lamp, 4, 6, 9, 0.7)
    // Central spire.
    c.rect(100, 86, 9, 10, stoneDim)
    c.tri(104, 62, 86, 4, slate)

    // Elizabeth Tower: shaft, clock stage, belfry, two-stage roof, spire.
    const cx = 196
    c.rect(cx - 7, 68, 15, bank - 68, gold)
    c.rect(cx + 3, 68, 5, bank - 68, goldShade)
    for (const dx of [-5, -2, 1]) c.rect(cx + dx, 72, 1, bank - 76, '#b9995f')
    c.rect(cx - 9, 46, 19, 22, gold)
    c.rect(cx + 6, 46, 4, 22, goldShade)
    c.rect(cx - 9, 46, 19, 1, '#f6e2a6')
    c.rect(cx - 9, 67, 19, 1, '#f6e2a6')
    c.disc(cx, 57, 8, slate)
    c.disc(cx, 57, 6, '#fff6cc')
    c.line(cx, 57, cx, 52, slate)
    c.line(cx, 57, cx + 3, 59, slate)
    c.rect(cx - 8, 38, 17, 8, gold)
    c.rect(cx + 5, 38, 4, 8, goldShade)
    for (let x = cx - 7; x <= cx + 7; x += 2) c.rect(x, 39, 1, 6, slate)
    c.poly([[cx - 9, 38], [cx + 9, 38], [cx + 5, 28], [cx - 5, 28]], slate)
    c.poly([[cx - 9, 38], [cx - 1, 38], [cx - 1, 28], [cx - 5, 28]], '#34425e')
    c.rect(cx - 5, 24, 11, 4, gold)
    for (let x = cx - 4; x <= cx + 4; x += 2) c.rect(x, 25, 1, 2, slate)
    c.tri(cx, 14, 24, 5, slate)
    c.rect(cx, 11, 1, 4, gold)

    // Westminster Bridge, running off to the right.
    c.rect(cx + 8, 112, W, 12, '#3f5a52')
    for (let x = cx + 26; x < W + 20; x += 30) c.ellipse(x, bank, 12, 8, '#152242')
    c.rect(cx + 8, 110, W, 2, '#7fa08a')
    for (let x = cx + 12; x < W; x += 15) {
      c.rect(x, 105, 1, 5, '#3f5a52')
      c.rect(x - 1, 103, 3, 2, lamp)
    }

    // The Thames, with the lit tower and windows smeared across it.
    c.water(bank, H, '#152242', '#3d5274', 3)
    for (let y = bank + 2; y < 150; y += 2) {
      const w = 5 + Math.floor(rand(y) * 9)
      c.rect(cx - Math.floor(w / 2), y, w, 1, y < bank + 12 ? gold : goldShade)
    }
    for (let x = 24; x < 172; x += 5) if (rand(x + 2) < 0.5) c.rect(x, bank + 2 + Math.floor(rand(x) * 3) * 2, 3, 1, lamp)

    // Foreground: the near embankment wall and its lamps.
    c.rect(0, 148, W, 12, '#0a1020')
    for (let x = 0; x < W; x += 6) c.rect(x, 145, 2, 3, '#0a1020')
    c.rect(0, 144, W, 1, '#0a1020')
    for (const x of [28, 118, 244]) {
      c.rect(x, 126, 2, 20, '#0a1020')
      c.rect(x - 2, 122, 6, 5, '#0a1020')
      c.rect(x - 1, 123, 4, 3, '#ffe9a8')
    }
  },
}

// ───────────────────────────── u13 Santorini ─────────────────────────────

const santorini: World = {
  unit: 'u13',
  landmark: 'Santorini',
  place: 'Oia, Greece',
  draw(c) {
    const horizon = 104
    c.sky(['#2d7fd8', '#4c98e4', '#74b4ee', '#a0d0f5', '#cbe6f9'], 0, horizon)
    c.disc(238, 34, 9, '#fffbe0')
    c.cloud(170, 22, 34, '#e4f2fc')
    c.cloud(206, 60, 26, '#e4f2fc')

    // Far side of the caldera, then the sea.
    c.poly([[150, horizon], [176, 95], [204, 91], [236, 95], [272, 88], [272, horizon]], '#7fb0e2')
    c.water(horizon, H, '#1c62c0', '#74b4ee', 4)
    c.dither(0, 136, W, 24, '#164c9e', 0.5)

    const white = '#ffffff'
    const shadow = '#c5d6ee'
    const blue = '#2459c4'
    const blueLit = '#5a92ee'
    const door = '#2c4f94'
    const rock = '#9a6a50'
    const rockDark = '#5e3c38'

    // The cliff, stepping down to the sea from the upper left.
    const crest: Pt[] = [[0, 36], [40, 32], [84, 40], [120, 52], [150, 66], [180, 86], [205, 106], [228, 128], [250, 150], [272, 158]]
    c.poly([...crest, [272, H], [0, H]], rock)
    for (let x = 0; x < W; x++) {
      const y = Math.round(crestAt(crest, x))
      c.dither(x, y + 100, 1, H, rockDark, 0.5)
      c.dither(x, y + 112, 1, H, rockDark, 1)
      if (rand(Math.floor(x / 3) + 400) < 0.3) c.rect(x, y + 4, 1, 60, '#7e5444')
    }

    /** One cubic house: white, a shaded side, a door, a window, maybe a dome. */
    const house = (x: number, base: number, w: number, h: number, seed: number) => {
      const kind = rand(seed)
      const body = rand(seed + 3) < 0.1 ? '#f6d9a4' : white
      if (kind < 0.16) {
        c.disc(x + Math.floor(w / 2), base - h, Math.floor(w / 2) - 1, blue)
        c.rect(x + Math.floor(w / 2) - 2, base - h - Math.floor(w / 2) + 2, 2, 2, blueLit)
      } else if (kind < 0.36) c.ellipse(x + Math.floor(w / 2), base - h, Math.floor(w / 2), 3, body)
      c.rect(x, base - h, w, h, body)
      c.rect(x + w - 3, base - h, 3, h, shadow)
      c.rect(x, base - 1, w, 1, shadow)
      c.rect(x + 2, base - 5, 2, 4, rand(seed + 1) < 0.5 ? blue : door)
      if (w > 9) c.rect(x + 6, base - h + 3, 2, 2, door)
    }
    /** One terrace of houses, `drop` pixels below the cliff edge. */
    const terrace = (t: number) => {
      for (let x = -6 + Math.floor(rand(t) * 6); x < 250; ) {
        const w = 9 + Math.floor(rand(x * 3 + t) * 8)
        const h = 8 + Math.floor(rand(x * 5 + t) * 6)
        const base = Math.round(crestAt(crest, x + w / 2)) + 5 + t * 11 + Math.floor(rand(x + t * 9) * 3)
        if (base < 154 && crestAt(crest, x + w) + 2 < base - h + 8) house(x, base, w, h, x * 7 + t * 31)
        x += w + Math.floor(rand(x + t) * 3)
      }
    }
    for (let t = 0; t < 3; t++) terrace(t)

    // A windmill on the top of the cliff.
    c.rect(14, 24, 9, 12, white)
    c.rect(20, 24, 3, 12, shadow)
    c.tri(18, 18, 24, 6, rockDark)
    for (const [dx, dy] of [[9, 5], [-9, -5], [-5, 9], [5, -9]] as const) c.line(12, 22, 12 + dx, 22 + dy, rockDark)

    // The landmark church: a big blue dome and a bell tower.
    const hx = 116
    const hy = 92
    c.disc(hx + 14, hy - 20, 11, blue)
    c.rect(hx + 3, hy - 20, 23, 12, blue)
    c.disc(hx + 10, hy - 25, 3, blueLit)
    c.rect(hx + 13, hy - 35, 3, 4, white)
    c.rect(hx, hy - 16, 30, 16, white)
    c.rect(hx + 23, hy - 16, 7, 16, shadow)
    c.rect(hx + 4, hy - 8, 4, 8, door)
    c.rect(hx + 13, hy - 11, 3, 4, door)
    c.rect(hx - 12, hy - 34, 10, 34, white)
    c.rect(hx - 5, hy - 34, 3, 34, shadow)
    c.rect(hx - 13, hy - 36, 12, 2, white)
    c.rect(hx - 9, hy - 40, 4, 4, blue)
    for (const y of [hy - 31, hy - 21]) {
      c.rect(hx - 10, y, 4, 6, blueLit)
      c.rect(hx - 9, y + 2, 2, 3, door)
    }

    for (let t = 3; t < 9; t++) terrace(t)
    // Bougainvillea spilling over a few walls.
    for (const [x, y] of [[52, 78], [96, 104], [150, 110], [22, 96], [176, 124]] as const) {
      c.disc(x, y, 2, '#d8408a')
      c.rect(x + 1, y + 1, 3, 2, '#d8408a')
    }
  },
}

// ───────────────────────────── u12 Everest ─────────────────────────────

const everest: World = {
  unit: 'u12',
  landmark: 'Mount Everest',
  place: 'Khumbu, Nepal',
  draw(c) {
    c.sky(['#173f8c', '#2257a8', '#356fc0', '#5a90d4', '#8fb6e4', '#c4dcf0'])

    const snowLit = '#fff1d2'
    const snowShade = '#8fb0de'
    const rock = '#36446c'
    const rockLit = '#b08a6c'

    // The massif: Everest's pyramid, the South Col, then Lhotse to the right.
    const massif: Pt[] = [[0, 100], [26, 88], [50, 92], [78, 76], [104, 58], [124, 42], [140, 28], [150, 18], [160, 29], [174, 44], [188, 58], [202, 66], [214, 58], [226, 47], [236, 43], [246, 55], [258, 70], [272, 78]]
    for (let x = 0; x < W; x++) {
      const top = Math.round(crestAt(massif, x))
      for (let y = top; y < 132; y++) {
        // Faces that look east (right of each summit's spine) catch the sun.
        const lit = (x > 150 + (y - 18) * 0.22 && x < 203 + (y - 66) * 0.3) || x > 236 + (y - 43) * 0.25
        // Slanted strata: bands of bare rock and snow.
        const band = Math.floor((x * (lit ? -0.55 : 0.6) + y) / 4)
        const bare = y - top > 2 && rand(band + (lit ? 50 : 0)) < (lit ? 0.16 : 0.72)
        c.set(x, y, lit ? (bare ? rockLit : snowLit) : bare ? rock : snowShade)
      }
    }
    // A banner of spindrift streaming off the summit.
    c.poly([[152, 17], [176, 11], [200, 10], [200, 13], [176, 17], [158, 20]], '#eef5fc')
    c.dither(200, 10, 22, 4, '#eef5fc', 0.5)

    // The Nuptse wall in front: a jagged snow ridge with lit and shaded facets.
    const ridge: Pt[] = [[0, 108], [18, 96], [34, 104], [56, 88], [74, 100], [96, 86], [118, 98], [138, 90], [160, 102], [182, 92], [206, 104], [230, 94], [250, 104], [272, 96]]
    mountain(c, ridge, '#a9c3ea', '#ffffff', 0.4)
    c.dither(0, 114, W, 8, '#6f8fc8', 0.5)
    c.rect(0, 122, W, H - 122, '#6f8fc8')

    // Foreground: a dark rocky shoulder with a cairn and strings of prayer flags.
    const ground = '#141d38'
    c.poly([[0, 128], [38, 118], [70, 126], [112, 140], [170, 148], [272, 150], [272, H], [0, H]], ground)
    c.tri(40, 108, 120, 8, ground)
    c.rect(40, 90, 1, 20, ground)
    const flags = ['#3f6fe0', '#ffffff', '#e8452f', '#3fae5a', '#ffd23a']
    for (const [x2, y2, sag] of [[-6, 116, 5], [132, 138, 9], [214, 144, 14]] as const) {
      const n = Math.abs(x2 - 40)
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const x = Math.round(40 + (x2 - 40) * t)
        const y = Math.round(91 + (y2 - 91) * t + sag * Math.sin(Math.PI * t))
        c.set(x, y, ground)
        if (i % 5 === 2) c.rect(x, y + 1, 3, 3, flags[Math.floor(i / 5) % 5])
      }
    }
  },
}

// ───────────────────────────── u14 Colosseum ─────────────────────────────

/** A Roman stone pine: bare trunk, flat umbrella crown. */
function stonePine(c: Canvas, x: number, base: number, h: number, col: string) {
  c.rect(x, base - h, 2, h, col)
  c.line(x, base - h + 6, x - 5, base - h, col)
  c.ellipse(x, base - h, Math.round(h * 0.42), Math.round(h * 0.16), col)
  c.ellipse(x + 4, base - h - 3, Math.round(h * 0.26), Math.round(h * 0.12), col)
}

const colosseum: World = {
  unit: 'u14',
  landmark: 'Colosseum',
  place: 'Rome, Italy',
  draw(c) {
    c.sky(['#5683c2', '#84a4d0', '#b6c1d2', '#e4cdb2', '#f8cc8c', '#fbb768', '#f6a05a'], 0, 130)
    // Low sun on the left.
    c.disc(30, 98, 17, '#fddc98')
    c.disc(30, 98, 13, '#fff4cc')

    const cx = 132
    const R = 104
    const ground = 126
    const topY = (x: number) => 32 + 13 * ((x - cx) / R) ** 2
    const lvl = (x: number, f: number) => Math.round(ground - f * (ground - topY(x)))
    const lit = '#fbe0a8'
    const base = '#e6b67c'
    const shade = '#b47a54'
    const dark = '#5c3024'
    const line = '#a8744e'

    // Far Rome: pale roofs and pines on the horizon.
    c.rect(0, 118, W, 12, '#dba878')
    for (let x = 0; x < W; x += 12) c.rect(x, 112 - Math.floor(rand(x + 8) * 8), 11, 20, '#dba878')
    for (const x of [8, 250, 264]) stonePine(c, x, 124, 26, '#b8845e')
    c.rect(0, ground, W, H - ground, '#c08a58')
    c.dither(0, 134, W, 26, '#8a5a3c', 0.5)

    /** A curved wall from x0 to x1, `f` of the full height, shaded round the drum. */
    const ring = (x0: number, x1: number, f: number, jag: number, body: string) => {
      for (let x = x0; x <= x1; x++) {
        const top = lvl(x, f) + Math.floor(rand(Math.floor(x / 5) + 70) * jag)
        const t = (x - cx) / R
        c.rect(x, top, 1, ground - top, body)
        if (t < -0.22) c.dither(x, top, 1, ground - top, lit, t < -0.3 ? 1 : 0.5)
        if (t > 0.3) c.dither(x, top, 1, ground - top, shade, t > 0.38 ? 1 : 0.5)
      }
    }
    /** Arches on every bay between x0 and x1, for the storeys bounded by `floors`. */
    const arches = (x0: number, x1: number, floors: number[]) => {
      for (let k = -10; k <= 10; k++) {
        const a = (k * 8.4 * Math.PI) / 180
        const ax = Math.round(cx + R * Math.sin(a))
        const hw = Math.max(1, Math.round(4 * Math.cos(a)))
        if (ax - hw < x0 || ax + hw > x1) continue
        for (let i = 0; i + 1 < floors.length; i++) {
          const y0 = lvl(ax, floors[i]) - (i ? 2 : 0)
          const top = lvl(ax, floors[i + 1]) + 5
          c.rect(ax - hw, top + 2, hw * 2 + 1, y0 - top - 2, dark)
          if (hw > 1) c.rect(ax - hw + 1, top + 1, hw * 2 - 1, 1, dark)
          if (hw > 2) c.rect(ax - hw + 2, top, hw * 2 - 3, 1, dark)
        }
      }
      for (const f of floors.slice(1)) for (let x = x0; x <= x1; x++) c.set(x, lvl(x, f), line)
    }

    // The inner ring, lower and ragged, where the outer wall has fallen away.
    ring(150, cx + R, 0.6, 5, '#d09a68')
    arches(190, cx + R, [0, 0.27, 0.53])
    // The surviving outer ring: three arcades and an attic.
    const end = 176
    ring(cx - R, end, 1, 0, base)
    arches(cx - R, end - 4, [0, 0.26, 0.51, 0.76])
    for (let x = cx - R; x <= end; x++) {
      c.set(x, lvl(x, 1), '#fff0c8')
      c.set(x, lvl(x, 0.76) - 1, x < cx ? '#fff0c8' : base)
    }
    for (let k = -9; k <= 3; k += 2) {
      const ax = Math.round(cx + R * Math.sin((k * 8.4 * Math.PI) / 180))
      c.rect(ax - 1, lvl(ax, 0.9), 2, 3, dark)
    }
    // The sloping brick buttress that closes the broken end.
    c.poly([[end - 4, lvl(end - 4, 1)], [end + 2, lvl(end, 1) + 1], [end + 26, lvl(end + 26, 0.3)], [end + 26, ground], [end - 4, ground]], '#eec08a')
    c.poly([[end + 2, lvl(end, 1) + 1], [end + 26, lvl(end + 26, 0.3)], [end + 26, ground], [end + 18, ground]], '#c48a5e')

    // Foreground: shadowed ground and stone pines framing the sides.
    c.ridge(150, [[2, 2, 0.5], [1, 7, 2]], '#3a2018')
    stonePine(c, 250, 152, 62, '#3a2018')
    stonePine(c, 18, 152, 40, '#3a2018')
    for (let x = 60; x < 230; x += 23) c.disc(x + Math.floor(rand(x) * 8), 150, 3 + Math.floor(rand(x + 4) * 3), '#3a2018')
  },
}

// ───────────────────────────── u15 Stonehenge ─────────────────────────────

const stonehenge: World = {
  unit: 'u15',
  landmark: 'Stonehenge',
  place: 'Wiltshire, England',
  draw(c) {
    const horizon = 106
    c.sky(['#3f5f8a', '#6f8ea6', '#a9bfae', '#e3d6a0', '#fbd27a', '#fdb658', '#fb9a4c'], 0, horizon)
    const sx = 137
    c.disc(sx, horizon, 27, '#ffe08c')
    c.disc(sx, horizon, 21, '#fff8d4')
    c.cloud(30, 40, 46, '#c9cdb0')
    c.cloud(196, 28, 40, '#9fb4aa')
    c.cloud(214, 62, 30, '#f0dca4')

    // The plain: a far tree line, then grass that darkens toward us.
    c.ridge(horizon - 3, [[1.2, 3, 0.4], [0.8, 11, 1.3]], '#a4703e', horizon)
    c.rect(0, horizon, W, H - horizon, '#6a7032')
    c.dither(0, horizon, W, 4, '#c8a444', 0.5)
    c.dither(0, 118, W, 14, '#3e4c2a', 0.5)
    c.rect(0, 132, W, H - 132, '#3e4c2a')
    c.dither(0, 142, W, 18, '#1c2618', 0.5)

    const body = '#3b3552'
    const deep = '#27223a'
    const rim = '#fdc878'
    const farStone = '#6a5560'
    const shadowCol = '#2a3422'
    type Stone = [x: number, w: number, top: number, base: number]

    /** Long shadows thrown toward us, fanning out from the sun. */
    const shadow = (x: number, w: number, base: number) => {
      const k = (H - 94) / (base - 94)
      c.poly([[x, base], [x + w, base], [sx + (x + w - sx) * k, H], [sx + (x - sx) * k, H]], shadowCol)
    }
    /** An upright: slightly tapered, dark, with a rim of light on the sunward edge. */
    const upright = ([x, w, top, base]: Stone, col = body) => {
      const r = Math.floor(rand(x) * 2)
      c.poly([[x + 1, top + r], [x + w - 2, top], [x + w - 1, base], [x - 1, base]], col)
      if (col !== body) return
      const sunRight = x + w / 2 < sx
      c.rect(sunRight ? x : x + w - 4, top + 3, 3, base - top - 3, deep)
      c.rect(sunRight ? x + w - 2 : x, top + 1, 1, base - top - 2, rim)
    }
    const lintel = (x0: number, x1: number, top: number, h: number, col = body) => {
      c.poly([[x0 + 1, top], [x1 - 1, top + (rand(x0) < 0.5 ? 1 : 0)], [x1, top + h], [x0, top + h]], col)
      if (col !== body) return
      c.rect(x0 + 1, top + h - 2, x1 - x0 - 1, 2, deep)
      c.rect(x0 + 2, top, x1 - x0 - 3, 1, rim)
    }

    // The far side of the circle, small and hazy.
    const back: Stone[] = [[6, 8, 82, 107], [82, 8, 78, 107], [94, 8, 78, 107], [176, 8, 78, 107], [188, 8, 80, 107]]
    back.forEach((s) => upright(s, farStone))
    lintel(80, 104, 73, 5, farStone)

    // The near stones: a run of the outer circle, the great trilithon, a pair, a leaner.
    const front: Stone[] = [[26, 17, 60, 113], [58, 16, 60, 113], [104, 19, 44, 116], [151, 19, 44, 116], [198, 16, 62, 113], [228, 17, 62, 113]]
    front.forEach(([x, w, , base]) => shadow(x, w, base))
    shadow(256, 10, 111)
    front.forEach((s) => upright(s))
    lintel(22, 78, 50, 10)
    lintel(99, 175, 33, 11)
    lintel(194, 249, 52, 10)
    c.poly([[262, 76], [270, 74], [268, 111], [255, 111]], body)
    c.line(261, 77, 255, 110, rim)
  },
}

// ───────────────────────────── u16 Christ the Redeemer ─────────────────────────────

const rio: World = {
  unit: 'u16',
  landmark: 'Christ the Redeemer',
  place: 'Rio de Janeiro, Brazil',
  draw(c) {
    const sea = 112
    c.sky(['#16365a', '#215673', '#4a7c84', '#a39a74', '#eaa458', '#f57c44', '#e85a48'], 0, sea)
    c.disc(126, 104, 18, '#ffcf80')
    c.disc(126, 104, 14, '#fff2c4')
    c.cloud(20, 44, 50, '#7a6a78')
    c.cloud(204, 34, 44, '#4a6474')
    c.cloud(60, 64, 34, '#d88a5c')

    // Far hills across Guanabara Bay.
    c.poly([[0, sea], [0, 100], [22, 94], [46, 102], [70, 98], [96, 104], [130, 100], [160, 106], [272, 104], [272, sea]], '#a8465a')
    // The bay, on fire with the sunset.
    c.water(sea, H, '#a8404e', '#fdb46a', 6)
    for (let y = sea + 1; y < 140; y += 2) {
      const w = 6 + Math.floor(rand(y + 3) * 14)
      c.rect(120 - Math.floor(w / 2) + Math.floor(rand(y) * 6), y, w, 1, '#ffe2a0')
    }
    // Sugarloaf and the lower Urca hill beside it.
    const loaf = '#5a2a52'
    c.poly([[2, sea], [10, 102], [22, 97], [34, 101], [40, sea]], loaf)
    c.poly([[36, sea], [40, 96], [45, 80], [51, 69], [58, 64], [65, 66], [71, 76], [76, 92], [82, 106], [88, sea]], loaf)
    c.poly([[51, 69], [58, 64], [65, 66], [60, 78], [52, 92], [44, 104], [40, 96], [45, 80]], '#7c3a5a')
    c.rect(0, sea, 96, 2, loaf)

    // Corcovado: a steep granite peak, lit on its sunward shoulder.
    const peak = '#1c1430'
    const peakLit = '#3c2848'
    const hill: Pt[] = [[60, H], [100, 138], [130, 116], [152, 98], [168, 84], [177, 79], [192, 79], [200, 90], [212, 112], [230, 134], [252, 148], [272, 154]]
    c.poly([...hill, [272, H]], peak)
    c.poly([[177, 79], [168, 84], [152, 98], [130, 116], [100, 138], [60, H], [112, H], [150, 124], [172, 98]], peakLit)

    // The statue: pedestal, robed figure, arms held straight out.
    const cx = 184
    const stoneLit = '#ffe9c6'
    const stoneShade = '#b9828c'
    c.rect(cx - 5, 69, 11, 11, '#6a4a5c')
    c.rect(cx + 2, 69, 4, 11, peakLit)
    const figure = (col: string, side: number[]) => {
      for (const s of side) {
        c.poly([[cx, 24], [cx + s * 30, 27], [cx + s * 30, 30], [cx, 31]], col)
        c.poly([[cx + s * 4, 30], [cx + s * 18, 30], [cx + s * 6, 46]], col)
        c.poly([[cx, 24], [cx + s * 5, 24], [cx + s * 7, 69], [cx, 69]], col)
      }
    }
    figure(stoneLit, [-1, 1])
    figure(stoneShade, [1])
    c.rect(cx - 1, 31, 3, 38, stoneLit)
    c.rect(cx - 2, 16, 5, 7, stoneLit)
    c.rect(cx - 1, 15, 3, 1, stoneLit)
    c.rect(cx + 1, 17, 2, 6, stoneShade)

    // Foreground: the city shore at the foot of the mountain, lights coming on.
    c.poly([[0, 140], [40, 134], [90, 138], [272, 150], [272, H], [0, H]], '#120c22')
    for (let x = 0; x < 110; x += 8) {
      const h = 4 + Math.floor(rand(x + 21) * 10)
      c.rect(x, 138 - h, 7, h + 6, '#120c22')
      c.windows(x + 1, 140 - h, 5, h, '#ffcf80', 2, 3, x, 0.5)
    }
  },
}

// ───────────────────────────── u17 Petra ─────────────────────────────

const petra: World = {
  unit: 'u17',
  landmark: 'The Treasury',
  place: 'Petra, Jordan',
  draw(c) {
    c.sky(['#5aa6e2', '#8cc6ee', '#bfe0f6'], 0, 40)
    const face = '#e8946a'
    const lit = '#fbc898'
    const mid = '#d47c58'
    const recess = '#a8523f'
    const dark = '#55231f'
    const wallCol = '#4a1d1c'
    const strata = '#6c2c25'
    const cx = 140
    const G = 126

    // The sunlit rock face the Treasury is carved from, and the sandy floor.
    c.poly([[70, 20], [104, 12], [130, 16], [156, 10], [184, 15], [210, 12], [210, H], [70, H]], face)
    for (let x = 80; x < 200; x += 3) if (rand(x + 60) < 0.4) c.rect(x, 16 + Math.floor(rand(x) * 6), 2, 14 + Math.floor(rand(x + 1) * 90), mid)
    c.rect(40, G, 200, H - G, '#f2c08c')
    c.dither(40, G + 10, 200, 6, '#d49a6a', 0.5)
    c.rect(40, G + 16, 200, H, '#d49a6a')

    const col = (x: number, y0: number, y1: number, w: number) => {
      c.rect(x, y0, w, y1 - y0, lit)
      c.rect(x + w - 1, y0, 1, y1 - y0, mid)
      c.rect(x - 1, y0, w + 2, 2, lit)
      c.rect(x - 1, y1 - 1, w + 2, 1, lit)
    }
    // Upper storey: a round tholos between two half-pediment pavilions.
    c.rect(cx - 44, 30, 89, 34, recess)
    for (const s of [-1, 1]) {
      c.poly([[cx + s * 44, 34], [cx + s * 17, 26], [cx + s * 17, 38], [cx + s * 44, 38]], lit)
      c.rect(Math.min(cx + s * 17, cx + s * 44), 38, 28, 3, mid)
      col(cx + s * 42 - 2, 41, 62, 4)
      col(cx + s * 19 - 2, 41, 62, 4)
      c.rect(Math.min(cx + s * 24, cx + s * 37), 44, 14, 18, mid)
    }
    c.rect(cx - 9, 40, 19, 22, mid)
    c.rect(cx - 10, 37, 21, 3, lit)
    for (const dx of [-9, -2, 6]) col(cx + dx, 40, 62, 3)
    c.ellipse(cx, 36, 10, 4, lit)
    c.tri(cx, 25, 36, 9, lit)
    c.poly([[cx, 25], [cx + 9, 36], [cx + 2, 36]], mid)
    c.rect(cx - 1, 19, 3, 6, lit)
    c.rect(cx - 2, 21, 5, 2, lit)
    c.rect(cx - 46, 62, 93, 4, lit)
    c.rect(cx - 46, 65, 93, 1, mid)

    // Lower storey: six columns, a pediment over the middle four, the dark doorway.
    c.rect(cx - 44, 66, 89, 14, face)
    c.tri(cx, 66, 80, 31, lit)
    c.tri(cx, 71, 80, 22, mid)
    c.rect(cx - 46, 80, 93, 5, lit)
    c.rect(cx - 46, 84, 93, 1, mid)
    c.rect(cx - 29, 85, 59, G - 85, recess)
    c.rect(cx - 6, 98, 13, G - 98, dark)
    c.rect(cx - 7, 96, 15, 2, lit)
    for (const dx of [-42, -29, -12, 9, 26, 39]) col(cx + dx, 85, G - 3, 4)
    for (const s of [-1, 1]) c.rect(Math.min(cx + s * 33, cx + s * 38), 96, 6, 22, mid)
    c.rect(cx - 34, G - 3, 69, 3, lit)
    c.rect(cx - 12, G, 25, 2, lit)
    // Two tiny travellers, for scale.
    for (const x of [cx - 22, cx + 16]) {
      c.rect(x, G - 2, 2, 5, dark)
      c.rect(x, G - 4, 2, 2, '#f4e6d0')
    }

    // The Siq: dark canyon walls closing in from both sides, banded with strata.
    const left: Pt[] = [[0, 0], [100, 0], [92, 22], [99, 46], [88, 72], [94, 98], [84, 122], [70, 142], [58, H], [0, H]]
    const right: Pt[] = [[W, 0], [176, 0], [186, 26], [181, 52], [193, 76], [188, 102], [200, 126], [216, 146], [224, H], [W, H]]
    c.poly(left, wallCol)
    c.poly(right, wallCol)
    for (let k = 0; k < 11; k++)
      for (let x = 0; x < W; x++) {
        const y = Math.round(6 + k * 15 + 4 * Math.sin(x * 0.06 + k * 1.7) + (x < cx ? x : W - x) * 0.12)
        for (let t = 0; t < 2 + (k % 2); t++) if (c.get(x, y + t) === wallCol) c.set(x, y + t, strata)
      }
    // A warm glow where the light catches the canyon's inner edges.
    for (let y = 0; y < H; y++)
      for (let x = 1; x < W - 1; x++) {
        const here = c.get(x, y)
        if (here !== wallCol && here !== strata) continue
        for (const d of [1, 2, 3]) {
          const n = c.get(x < cx ? x + d : x - d, y)
          if (n !== wallCol && n !== strata && n !== '#b0483a') {
            c.set(x, y, '#b0483a')
            break
          }
        }
      }
  },
}

// ───────────────────────────── u18 Angkor Wat ─────────────────────────────

const angkor: World = {
  unit: 'u18',
  landmark: 'Angkor Wat',
  place: 'Siem Reap, Cambodia',
  draw(c) {
    const pond = 112
    c.sky(['#3a2a5c', '#6a3a6e', '#a84c6c', '#dc6a5c', '#f48e4e', '#fbb85a', '#fde08a'], 0, pond)
    c.disc(190, 92, 16, '#ffd98a')
    c.disc(190, 92, 12, '#fff6d0')
    c.cloud(28, 30, 50, '#8a4470')
    c.cloud(196, 46, 44, '#c25c68')
    c.cloud(96, 18, 30, '#5a346a')

    const stone = '#2a1838'
    const edge = '#6a3050'
    const jungle = '#7c3858'

    // Far jungle behind the temple.
    c.ridge(100, [[2, 4, 0.3], [1.5, 13, 1.1]], jungle, pond)

    /** A lotus-bud tower: stacked tiers that swell, then close to a point. */
    const tower = (cx: number, base: number, w: number, h: number) => {
      for (let r = 0; r < h; r++) {
        const t = Math.min(1, (r / h) * 1.2)
        const half = Math.round((w / 2) * Math.pow(Math.sin((t * Math.PI) / 2), 0.75)) + (r % 4 === 3 ? 1 : 0)
        c.rect(cx - half, base - h + r, half * 2 + 1, 1, stone)
        if (r % 4 !== 3 && half > 2) c.set(cx + half, base - h + r, edge)
      }
      c.rect(cx, base - h - 4, 1, 4, stone)
    }
    const cx = 132
    // Galleries in three stepped terraces, with the five towers on top.
    tower(cx - 80, 102, 13, 26)
    tower(cx + 80, 102, 13, 26)
    c.rect(cx - 96, 100, 193, 13, stone)
    c.rect(cx - 96, 99, 193, 1, edge)
    tower(cx - 36, 92, 17, 34)
    tower(cx + 36, 92, 17, 34)
    c.rect(cx - 52, 90, 105, 12, stone)
    c.rect(cx - 52, 89, 105, 1, edge)
    tower(cx, 82, 23, 52)
    c.rect(cx - 22, 80, 45, 12, stone)
    // Gate pavilions along the front gallery, and its row of window slots.
    for (const dx of [-96, -48, 0, 48, 96]) {
      c.rect(cx + dx - 6, 95, 13, 6, stone)
      c.tri(cx + dx, 89, 95, 5, stone)
    }
    for (let x = cx - 92; x < cx + 94; x += 4) c.rect(x, 104, 1, 3, edge)

    // Sugar palms on either bank.
    const palm = (x: number, base: number, h: number) => {
      c.line(x, base, x + 2, base - h, stone, 2)
      const [px, py] = [x + 2, base - h]
      // Fronds: each arcs out from the crown, then droops.
      for (const s of [-1, 1])
        for (const [mx, my, ex, ey] of [[4, -6, 8, -5], [6, -3, 11, 0], [5, 0, 9, 5], [2, -7, 3, -9]] as const) {
          c.line(px, py, px + s * mx, py + my, stone, 2)
          c.line(px + s * mx, py + my, px + s * ex, py + ey, stone)
        }
      c.disc(px, py, 2, stone)
    }
    for (const [x, h] of [[12, 60], [26, 44], [246, 66], [262, 48], [228, 40]] as const) palm(x, pond + 1, h)
    c.rect(0, pond - 2, W, 3, stone)

    // The pond: a squashed mirror image, broken by ripples.
    const ripple = '#7a3458'
    for (let y = pond + 1; y < H; y++) {
      const src = pond - 2 - Math.round((y - pond - 1) * 1.7)
      const wob = y > pond + 8 ? Math.round(Math.sin(y * 1.9)) : 0
      for (let x = 0; x < W; x++) c.set(x, y, c.get(Math.max(0, Math.min(W - 1, x + wob)), Math.max(0, src)) ?? stone)
    }
    for (let y = pond + 3; y < H; y += 3)
      for (let x = 0; x < W; x++) if (rand(y * 53 + Math.floor(x / 7)) < 0.3 + (y - pond) * 0.006) c.set(x, y, ripple)

    // Foreground: lily pads and reeds on the near bank.
    for (const [x, y] of [[40, 138], [96, 146], [150, 134], [206, 144], [70, 128]] as const) {
      c.ellipse(x, y, 6, 2, '#243a40')
      c.rect(x - 1, y - 2, 2, 2, '#f48e9e')
    }
    c.ridge(154, [[2, 3, 0.7], [1, 9, 1.9]], '#160c24')
    for (let x = 2; x < W; x += 5) c.line(x, 154, x + Math.round(rand(x) * 4 - 2), 146 - Math.floor(rand(x + 7) * 6), '#160c24')
  },
}

export const scenes: World[] = [greatWall, bigBen, everest, santorini, colosseum, stonehenge, rio, petra, angkor]
