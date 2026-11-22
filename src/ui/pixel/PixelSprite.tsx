import { useMemo } from 'react'
import type { Pixel } from './sprites'

/** Renders pixels as crisp SVG rects, merging horizontal runs of one colour. */
export function PixelSprite({
  pixels,
  view,
  width,
  className = '',
  label,
}: {
  pixels: Pixel[]
  /** [x, y, w, h] in grid units. */
  view: [number, number, number, number]
  width: number
  className?: string
  label?: string
}) {
  const rects = useMemo(() => {
    const byRow = new Map<number, Pixel[]>()
    for (const p of pixels) {
      const row = byRow.get(p[1]) ?? []
      row.push(p)
      byRow.set(p[1], row)
    }
    const out: { x: number; y: number; w: number; c: string }[] = []
    for (const [y, row] of byRow) {
      row.sort((a, b) => a[0] - b[0])
      let cur: { x: number; y: number; w: number; c: string } | null = null
      for (const [x, , c] of row) {
        if (cur && cur.c === c && cur.x + cur.w === x) cur.w++
        else {
          if (cur) out.push(cur)
          cur = { x, y, w: 1, c }
        }
      }
      if (cur) out.push(cur)
    }
    return out
  }, [pixels])
  const [vx, vy, vw, vh] = view
  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      width={width}
      height={(width * vh) / vw}
      shapeRendering="crispEdges"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w + 0.02} height={1.02} fill={r.c} />
      ))}
    </svg>
  )
}
