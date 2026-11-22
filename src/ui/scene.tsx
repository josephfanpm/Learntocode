// Pixel scenery: layered backdrops that scroll at different speeds (parallax).
// The motion is plain CSS, so a banner per unit stays cheap. Art is CC0 by
// Luis Zuno (see public/art/CREDITS.md).
import type { ReactNode } from 'react'

const BASE = import.meta.env.BASE_URL
const H = 160 // every layer is 160 scene pixels tall

/** [file, width in scene pixels, speed in scene pixels per second] back to front. */
const LAYERS = {
  mountain: [
    ['mountain/parallax-mountain-bg.png', 272, 0],
    ['mountain/parallax-mountain-montain-far.png', 272, 2],
    ['mountain/parallax-mountain-mountains.png', 544, 5],
    ['mountain/parallax-mountain-trees.png', 544, 9],
    ['mountain/parallax-mountain-foreground-trees.png', 544, 16],
  ],
  forest: [
    ['forest/parallax-forest-back-trees.png', 272, 2],
    ['forest/parallax-forest-lights.png', 272, 5],
    ['forest/parallax-forest-middle-trees.png', 272, 9],
    ['forest/parallax-forest-front-trees.png', 272, 16],
  ],
} as const

export type SceneKind = keyof typeof LAYERS

/** Two scenes cover every unit: alternate them and shift the colours so each world looks different. */
const HUES = [0, 0, 150, 200, 40, 250, 95, 300, 180, 330, 60, 220, 120, 280]
export function worldLook(index: number): { kind: SceneKind; hue: number } {
  return { kind: index % 2 === 0 ? 'forest' : 'mountain', hue: HUES[index % HUES.length] }
}

export function Scene({
  kind,
  hue = 0,
  dim = false,
  className = '',
  children,
}: {
  kind: SceneKind
  /** Degrees to rotate the colours by. */
  hue?: number
  /** Greyed out, for locked worlds. */
  dim?: boolean
  className?: string
  children?: ReactNode
}) {
  const filter = [hue ? `hue-rotate(${hue}deg)` : '', dim ? 'grayscale(0.85) brightness(0.55)' : ''].filter(Boolean).join(' ')
  return (
    <div className={`scene ${className}`}>
      <div className="absolute inset-0" style={{ filter: filter || undefined }} aria-hidden>
        {LAYERS[kind].map(([file, width, speed]) => (
          <div
            key={file}
            className="px-layer"
            style={{
              backgroundImage: `url(${BASE}art/${file})`,
              ['--w' as string]: `${(width / H) * 100}cqh`,
              animationDuration: speed && !dim ? `${width / speed}s` : undefined,
              animationName: speed && !dim ? undefined : 'none',
            }}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

const SPARKS = [
  [22, 18], [70, 9], [118, 26], [160, 12], [205, 30], [240, 8], [48, 44], [186, 52],
]

/** Four-point pixel sparkles that fade in and out, each a beat after the last. */
export function Sparkles() {
  return (
    <svg viewBox="0 0 272 160" className="absolute inset-0 size-full" shapeRendering="crispEdges" preserveAspectRatio="xMidYMin slice" aria-hidden>
      {SPARKS.map(([x, y], i) => (
        <g key={i} className="px-spark" style={{ ['--i' as string]: i }} fill="#fff6d8">
          <rect x={x} y={y - 2} width="1" height="5" />
          <rect x={x - 2} y={y} width="5" height="1" />
        </g>
      ))}
    </svg>
  )
}
