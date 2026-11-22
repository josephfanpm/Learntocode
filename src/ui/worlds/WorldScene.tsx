import { useEffect, useRef, type ReactNode } from 'react'
import { Sparkles } from '../scene'
import { H, paint, W, type World } from './canvas'

// Paints a world's destination scene onto a small canvas and lets the browser
// scale it up with hard pixel edges. Each scene is painted once and cached.

const cache = new Map<string, ImageData>()

function imageFor(world: World): ImageData {
  let img = cache.get(world.unit)
  if (!img) {
    const c = paint(world)
    img = new ImageData(W, H)
    c.px.forEach((col, i) => {
      const v = col ? parseInt(col.slice(1), 16) : 0x0a0e24
      img!.data.set([(v >> 16) & 255, (v >> 8) & 255, v & 255, 255], i * 4)
    })
    cache.set(world.unit, img)
  }
  return img
}

/** Soft pixel clouds drifting across the sky. Drawn twice side by side so the loop has no seam. */
function Clouds() {
  const clouds = [
    { x: 10, y: 14, w: 34 }, { x: 96, y: 30, w: 26 }, { x: 170, y: 10, w: 40 }, { x: 236, y: 38, w: 22 },
  ]
  return (
    <div className="px-clouds absolute inset-y-0 left-0 w-[200%]" aria-hidden>
      <svg viewBox={`0 0 ${W * 2} ${H}`} className="size-full" shapeRendering="crispEdges" preserveAspectRatio="none">
        {[0, W].map((dx) =>
          clouds.map((c, i) => (
            <g key={`${dx}-${i}`} fill="#ffffff" opacity="0.16">
              <rect x={c.x + dx} y={c.y + 3} width={c.w} height="4" />
              <rect x={c.x + dx + 4} y={c.y} width={c.w - 12} height="3" />
              <rect x={c.x + dx + 8} y={c.y + 7} width={c.w - 14} height="2" />
            </g>
          )),
        )}
      </svg>
    </div>
  )
}

export function WorldScene({ world, dim = false, className = '', children }: { world: World; dim?: boolean; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    ref.current?.getContext('2d')?.putImageData(imageFor(world), 0, 0)
  }, [world])
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={ref}
        width={W}
        height={H}
        role="img"
        aria-label={`${world.landmark}, ${world.place}`}
        className="absolute inset-0 size-full object-cover"
        style={{ imageRendering: 'pixelated', objectPosition: '50% 40%', filter: dim ? 'grayscale(0.85) brightness(0.5)' : undefined }}
      />
      {!dim && <Clouds />}
      {!dim && world.night && <Sparkles />}
      {children}
    </div>
  )
}
