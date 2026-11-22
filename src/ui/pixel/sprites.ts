// Pixel-art critters, built from layers on a 20×20 grid (plus a margin for
// ears, hats and effects). Bases are drawn as left halves and mirrored, so
// every head is symmetric. Faces, paws, accessories and effects are overlays.
//
// Palette keys:
//   o outline   f fur   d dark fur   l light fur (muzzle)   w white
//   p pink      n nose/eyes          b belly    m marking   c cheek marking
//   . transparent (in overlays: erase)

export type Animal = 'redpanda' | 'cat' | 'bunny' | 'bear'
export type Fur = 'ginger' | 'grey' | 'cream' | 'brown' | 'black' | 'white'
export type Face = 'happy' | 'wave' | 'cheer' | 'oops' | 'think' | 'sleepy' | 'celebrate'
export type Accessory = 'none' | 'glasses' | 'beanie' | 'headphones' | 'bow' | 'crown'

export type Pixel = [x: number, y: number, color: string]

const mirror = (half: string) => half + [...half].reverse().join('')

// Head rows 4–13 and body rows 14–19, shared by every animal.
const HEAD = [
  'offfffffff', // 4
  'offfmmffff', // 5
  'offfffffff', // 6
  'offfffffff', // 7
  'offfffffff', // 8
  'occfffflll', // 9
  'occcffllll', // 10
  'occccfllll', // 11
  '.occccllll', // 12
  '..oooooooo', // 13
]

const BODY = [
  '...offffff', // 14
  '..offfffff', // 15
  '..offddfff', // 16
  '..obbboooo', // 17
  '..obbbo...', // 18
  '...ooo....', // 19
]

const EARS: Record<Animal, { top: number; rows: string[] }> = {
  redpanda: { top: 0, rows: ['..ooo.....', '.owwwo....', '.owddooooo', '.owdffffff'] },
  cat: { top: 0, rows: ['.o........', '.oo.......', '.opo......', '.oppoooooo'] },
  bunny: {
    top: -3,
    rows: ['..oo......', '.offo.....', '.ofpo.....', '.ofpo.....', '.ofpo.....', '.ofpoooooo', '.offffffff'],
  },
  bear: { top: 1, rows: ['.ooo......', 'odddoooooo', 'oddfffffff'] },
}

/** Which keys the markings resolve to, per animal. */
const MARKS: Record<Animal, { m: string; c: string }> = {
  redpanda: { m: 'w', c: 'w' },
  cat: { m: 'f', c: 'f' },
  bunny: { m: 'f', c: 'l' },
  bear: { m: 'f', c: 'f' },
}

export const FURS: Record<Fur, { f: string; d: string; b: string }> = {
  ginger: { f: '#d9622b', d: '#5a2a1a', b: '#3b1d14' },
  grey: { f: '#9aa3b5', d: '#5c6478', b: '#d7dbe4' },
  cream: { f: '#efd3a8', d: '#a77d4f', b: '#fbf0dd' },
  brown: { f: '#8a5a3b', d: '#4e3020', b: '#c79b72' },
  black: { f: '#3d3d4e', d: '#1f1f2a', b: '#6b6b80' },
  white: { f: '#f4f4f7', d: '#b9bccb', b: '#ffffff' },
}

const BASE_COLORS: Record<string, string> = {
  o: '#241a2e',
  l: '#f8ecdc',
  w: '#ffffff',
  p: '#f59ab0',
  n: '#241a2e',
}

/** Turn a base into pixels (x, y in local grid coordinates). */
function base(animal: Animal, fur: Fur, withBody: boolean): Pixel[] {
  const ears = EARS[animal]
  const rows: [number, string][] = []
  ears.rows.forEach((r, i) => rows.push([ears.top + i, r]))
  const headStart = ears.top + ears.rows.length
  HEAD.forEach((r, i) => {
    const y = 4 + i
    if (y >= headStart) rows.push([y, r])
  })
  if (withBody) BODY.forEach((r, i) => rows.push([14 + i, r]))
  const pal = { ...BASE_COLORS, ...FURS[fur] }
  // Red pandas keep their dark belly whatever the fur.
  if (animal === 'redpanda' && fur === 'ginger') pal.b = FURS.ginger.b
  const marks = MARKS[animal]
  const out: Pixel[] = []
  for (const [y, half] of rows) {
    const row = mirror(half)
    ;[...row].forEach((ch, x) => {
      let k = ch
      if (k === 'm') k = marks.m
      if (k === 'c') k = marks.c
      if (k === '.') return
      out.push([x, y, pal[k as keyof typeof pal] ?? '#ff00ff'])
    })
  }
  return out
}

const INK = '#241a2e'
const PINK = '#f59ab0'
const WHITE = '#ffffff'

/** Eyes, nose, mouth and cheeks. Eyes sit at rows 7–8, cols 5–6 and 13–14. */
function face(mood: Face): Pixel[] {
  const px: Pixel[] = []
  // 2×3 eyes with a highlight in the top-right corner.
  const eye = (x: number, y: number) => {
    px.push([x, y, INK], [x + 1, y, WHITE], [x, y + 1, INK], [x + 1, y + 1, INK], [x, y + 2, INK], [x + 1, y + 2, INK])
  }
  const closedHappy = (x: number) => px.push([x - 1, 8, INK], [x, 7, INK], [x + 1, 7, INK], [x + 2, 8, INK])
  // nose
  px.push([9, 10, INK], [10, 10, INK])
  switch (mood) {
    case 'cheer':
    case 'celebrate':
      closedHappy(5)
      closedHappy(13)
      px.push([8, 11, INK], [9, 11, INK], [10, 11, INK], [11, 11, INK], [9, 12, PINK], [10, 12, PINK])
      break
    case 'sleepy':
      px.push([5, 8, INK], [6, 8, INK], [13, 8, INK], [14, 8, INK], [9, 12, INK], [10, 12, INK])
      break
    case 'think':
      eye(5, 5)
      eye(13, 5)
      px.push([10, 12, INK], [11, 12, INK])
      break
    case 'oops':
      eye(5, 6)
      eye(13, 6)
      // worried brows: inner ends up
      px.push([4, 5, INK], [5, 5, INK], [6, 4, INK], [13, 4, INK], [14, 5, INK], [15, 5, INK])
      px.push([8, 12, INK], [9, 11, INK], [10, 12, INK], [11, 11, INK])
      break
    default:
      eye(5, 6)
      eye(13, 6)
      px.push([8, 11, INK], [11, 11, INK], [9, 12, INK], [10, 12, INK])
  }
  if (mood !== 'sleepy') px.push([3, 10, PINK], [16, 10, PINK])
  return px
}

/** Paws and effects that sit around the body, per mood. */
function extras(mood: Face, fur: Fur): Pixel[] {
  const d = FURS[fur].d
  const px: Pixel[] = []
  const paw = (x: number, y: number) =>
    px.push([x, y, INK], [x + 1, y, INK], [x - 1, y + 1, INK], [x, y + 1, d], [x + 1, y + 1, d], [x + 2, y + 1, INK], [x - 1, y + 2, INK], [x, y + 2, d], [x + 1, y + 2, d], [x + 2, y + 2, INK], [x, y + 3, INK], [x + 1, y + 3, INK])
  switch (mood) {
    case 'cheer':
    case 'celebrate':
      paw(-1, 10)
      paw(19, 10)
      break
    case 'wave':
      paw(19, 9)
      break
    case 'think':
      paw(14, 12)
      px.push([20, 1, '#8691ad'], [21, -1, '#8691ad'], [22, -1, '#8691ad'], [21, -2, '#8691ad'], [22, -2, '#8691ad'])
      break
    case 'oops':
      px.push([19, 3, '#7cc4f5'], [18, 4, '#7cc4f5'], [19, 4, '#7cc4f5'], [20, 4, '#7cc4f5'], [19, 5, '#7cc4f5'])
      break
    case 'sleepy':
      for (const [x, y] of [[18, -2], [19, -2], [20, -2], [21, -2], [20, -1], [19, 0], [18, 1], [19, 1], [20, 1], [21, 1]]) px.push([x, y, '#8691ad'])
      break
  }
  if (mood === 'celebrate') {
    const spark = (x: number, y: number, c: string) => px.push([x, y - 1, c], [x - 1, y, c], [x, y, c], [x + 1, y, c], [x, y + 1, c])
    spark(-2, 2, '#ffd166')
    spark(21, 3, '#ff7a1a')
    px.push([1, -2, '#0f9fae'], [18, -2, '#c2378b'], [-1, 7, '#7a4ff0'])
  }
  return px
}

/** A striped tail for the red panda, curling up on its right. */
function tail(fur: Fur): Pixel[] {
  const f = FURS[fur].f
  const d = FURS[fur].d
  const rows: [number, string][] = [
    [12, '..oo'],
    [13, '.odfo'],
    [14, '.ofdo'],
    [15, 'odfdo'],
    [16, 'ofdfo'],
    [17, 'odfo.'],
    [18, '.oo..'],
  ]
  const px: Pixel[] = []
  for (const [y, r] of rows)
    [...r].forEach((ch, i) => {
      if (ch === '.') return
      px.push([17 + i, y, ch === 'o' ? INK : ch === 'f' ? f : d])
    })
  return px
}

export function accessory(a: Accessory): Pixel[] {
  const px: Pixel[] = []
  const fill = (x0: number, x1: number, y: number, c: string) => {
    for (let x = x0; x <= x1; x++) px.push([x, y, c])
  }
  switch (a) {
    case 'glasses': {
      const frame = '#241a2e'
      for (const x0 of [3, 12]) {
        fill(x0, x0 + 4, 6, frame)
        fill(x0, x0 + 4, 9, frame)
        px.push([x0, 7, frame], [x0, 8, frame], [x0 + 4, 7, frame], [x0 + 4, 8, frame])
      }
      fill(8, 11, 7, frame)
      break
    }
    case 'beanie': {
      const h = '#2d5be3'
      const h2 = '#1d3fa8'
      fill(8, 11, -2, '#ff7a1a')
      fill(7, 12, -1, '#ff7a1a')
      fill(4, 15, 0, h)
      fill(2, 17, 1, h)
      fill(1, 18, 2, h)
      fill(1, 18, 3, h2)
      fill(0, 19, 4, h2)
      for (let x = 2; x <= 17; x += 3) px.push([x, 2, h2])
      break
    }
    case 'headphones': {
      const k = '#16213e'
      const c = '#ff7a1a'
      fill(4, 15, 0, k)
      px.push([3, 1, k], [16, 1, k], [2, 2, k], [17, 2, k], [1, 3, k], [18, 3, k])
      for (const x of [-1, 18]) for (let y = 6; y <= 10; y++) px.push([x, y, k], [x + 1, y, c], [x + 2, y, k])
      break
    }
    case 'bow': {
      const p = '#e0487a'
      const p2 = '#b8325f'
      for (const [x, y] of [[13, 1], [14, 1], [17, 1], [18, 1], [13, 2], [14, 2], [15, 2], [16, 2], [17, 2], [18, 2], [13, 3], [14, 3], [17, 3], [18, 3]]) px.push([x, y, p])
      px.push([15, 2, p2], [16, 2, p2])
      break
    }
    case 'crown': {
      const g = '#ffc93c'
      const g2 = '#e0a21b'
      px.push([6, -2, g], [9, -3, g], [10, -3, g], [13, -2, g])
      fill(6, 13, -1, g)
      fill(6, 13, 0, g)
      fill(6, 13, 1, g2)
      px.push([8, 0, '#e0487a'], [11, 0, '#2d5be3'])
      break
    }
  }
  return px
}

export interface CritterSpec {
  animal: Animal
  fur: Fur
  face: Face
  accessory?: Accessory
  /** Include the body (mascot) or just head and shoulders (avatar). */
  body?: boolean
  /** Paws and mood effects (mascot only). */
  effects?: boolean
  tail?: boolean
}

export function critter(spec: CritterSpec): Pixel[] {
  const withBody = spec.body ?? true
  const layers: Pixel[] = []
  if (withBody && spec.tail) layers.push(...tail(spec.fur))
  layers.push(...base(spec.animal, spec.fur, withBody))
  layers.push(...face(spec.face))
  // Hats sit on top of ears; headphones and glasses on the face.
  layers.push(...accessory(spec.accessory ?? 'none'))
  if (withBody && spec.effects !== false) layers.push(...extras(spec.face, spec.fur))
  // Later layers win.
  const map = new Map<string, Pixel>()
  for (const p of layers) map.set(`${p[0]},${p[1]}`, p)
  return [...map.values()]
}
