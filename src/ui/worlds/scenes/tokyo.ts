import { rand, W, type World } from '../canvas'

// The reference scene: every other world follows this recipe.
//   1. A banded, dithered sky.
//   2. A sun or moon.
//   3. A far silhouette layer (pale, low contrast).
//   4. The landmark, in two or three colours: a base, a lit side, a shaded side.
//   5. A dark foreground that frames the bottom edge.
export const tokyo: World = {
  unit: 'u3',
  landmark: 'Tokyo Tower',
  place: 'Tokyo, Japan',
  night: true,
  draw(c) {
    c.sky(['#1a1440', '#2c1d5c', '#4b2a78', '#7a3a86', '#b24f80', '#e2746c', '#f6a66a'])
    c.stars(40, 7, 60)

    // A big low sun behind the skyline.
    c.disc(86, 104, 26, '#ffd9a0')
    c.disc(86, 104, 22, '#fff0c8')

    // Far city: pale blocks that fade into the sky.
    for (let x = 0; x < W; x += 9) {
      const h = 14 + Math.floor(rand(x + 3) * 26)
      c.rect(x, 124 - h, 8, h + 40, '#6d3b78')
    }
    // Nearer city, darker, with lit windows.
    for (let x = -3; x < W; x += 13) {
      const h = 18 + Math.floor(rand(x + 41) * 34)
      const w = 9 + Math.floor(rand(x + 5) * 4)
      c.rect(x, 136 - h, w, h + 30, '#3a2258')
      c.windows(x + 1, 138 - h, w - 2, h - 4, '#ffd27a', 3, 4, x, 0.45)
    }

    // The tower: two legs that splay toward the base, cross-bracing, two decks, a spire.
    const cx = 168
    const red = '#e8452f'
    const lit = '#ff7a4d'
    const shade = '#a32a2a'
    const white = '#fff1e0'
    const leg = (side: 1 | -1, colour: string) =>
      c.poly(
        [
          [cx + side * 1, 30],
          [cx + side * 3, 62],
          [cx + side * 7, 92],
          [cx + side * 15, 116],
          [cx + side * 27, 140],
          [cx + side * 20, 140],
          [cx + side * 10, 116],
          [cx + side * 3, 92],
          [cx, 62],
        ],
        colour,
      )
    leg(-1, red)
    leg(1, shade)
    // Lattice: horizontal ties and diagonals between the legs.
    for (const [y, half] of [[70, 4], [84, 6], [100, 10], [110, 13], [126, 20]] as const) c.rect(cx - half, y, half * 2 + 1, 1, lit)
    for (const [y1, h1, y2, h2] of [[70, 4, 84, 6], [84, 6, 100, 10], [100, 10, 110, 13], [110, 13, 126, 20]] as const) {
      c.line(cx - h1, y1, cx + h2, y2, lit)
      c.line(cx + h1, y1, cx - h2, y2, red)
    }
    // Decks, banded white and red like the real tower.
    c.rect(cx - 9, 92, 19, 5, white)
    c.rect(cx - 9, 94, 19, 1, red)
    c.windows(cx - 8, 93, 17, 1, '#ffd27a', 2, 1, 3, 0.7)
    c.rect(cx - 4, 60, 9, 4, white)
    c.rect(cx - 4, 62, 9, 1, red)
    // Spire, white and red bands.
    c.rect(cx, 12, 1, 18, red)
    c.rect(cx, 16, 1, 3, white)
    c.rect(cx, 23, 1, 3, white)
    c.set(cx, 11, '#ffd27a')

    // Foreground: a dark ridge of rooftops and trees along the bottom.
    c.ridge(148, [[2, 5, 0.6], [1, 13, 2.1]], '#1a0f33')
    for (let x = 4; x < W; x += 17) c.disc(x + Math.floor(rand(x) * 6), 148, 4 + Math.floor(rand(x + 9) * 3), '#1a0f33')
  },
}
