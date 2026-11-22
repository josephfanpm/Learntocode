import { useEffect, useMemo, useRef, useState } from 'react'
import type { MatchExercise } from '../content/types'
import type { ExProps } from './exercises'
import { Inline } from './text'

// Drag-to-slot matching. Each left item is a row with an empty slot; the
// right-hand answers are chips in a tray. Drag a chip into a slot, or tap a
// chip and then a slot (single-pointer alternative, WCAG 2.5.7). Tap a placed
// chip to send it back; drag it onto another slot to swap.

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Drag = { r: number; from: number | null; x: number; y: number; ox: number; oy: number; w: number; moved: boolean; startX: number; startY: number }

export function Match({ ex, locked, reveal, register }: ExProps<MatchExercise>) {
  const rows = useMemo(() => shuffle(ex.pairs.map((_, i) => i)), [ex])
  const tray = useMemo(() => shuffle(ex.pairs.map((_, i) => i)), [ex])
  // slots[leftIndex] = rightIndex placed there
  const [slots, setSlots] = useState<Record<number, number>>({})
  const [picked, setPicked] = useState<number | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [over, setOver] = useState<number | 'tray' | null>(null)
  const dragRef = useRef<Drag | null>(null)

  useEffect(
    () => register(Object.keys(slots).length === ex.pairs.length ? () => Object.entries(slots).every(([l, r]) => Number(l) === r) : null),
    [slots, ex, register],
  )

  const slotOf = (r: number) => {
    const e = Object.entries(slots).find(([, v]) => v === r)
    return e ? Number(e[0]) : null
  }

  /** Put chip r into slot l (or back in the tray when l is null). Swaps if the slot is taken. */
  const place = (r: number, l: number | null) => {
    setSlots((cur) => {
      const next = { ...cur }
      const from = Object.entries(cur).find(([, v]) => v === r)?.[0]
      if (from !== undefined) delete next[Number(from)]
      if (l !== null) {
        const occupant = cur[l]
        if (occupant !== undefined && occupant !== r && from !== undefined) next[Number(from)] = occupant
        next[l] = r
      }
      return next
    })
    setPicked(null)
  }

  const targetAt = (x: number, y: number): number | 'tray' | null => {
    const el = document.elementFromPoint(x, y)
    const slot = el?.closest<HTMLElement>('[data-slot]')
    if (slot) return Number(slot.dataset.slot)
    if (el?.closest('[data-tray]')) return 'tray'
    return null
  }

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, r: number) => {
    if (locked || e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const d: Drag = { r, from: slotOf(r), x: e.clientX, y: e.clientY, ox: e.clientX - rect.left, oy: e.clientY - rect.top, w: rect.width, moved: false, startX: e.clientX, startY: e.clientY }
    dragRef.current = d
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const moved = d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6
    const next = { ...d, x: e.clientX, y: e.clientY, moved }
    dragRef.current = next
    if (moved) {
      setDrag(next)
      setOver(targetAt(e.clientX, e.clientY))
    }
  }

  const onUp = (e: React.PointerEvent) => {
    const d = dragRef.current
    dragRef.current = null
    setDrag(null)
    setOver(null)
    if (!d) return
    if (d.moved) {
      const t = targetAt(e.clientX, e.clientY)
      if (typeof t === 'number') place(d.r, t)
      else if (t === 'tray') place(d.r, null)
      return
    }
    // A tap: chip in a slot goes back to the tray; chip in the tray is picked.
    if (d.from !== null) place(d.r, null)
    else setPicked(picked === d.r ? null : d.r)
  }

  const onCancel = () => {
    dragRef.current = null
    setDrag(null)
    setOver(null)
  }

  const tapSlot = (l: number) => {
    if (locked || picked === null) return
    place(picked, l)
  }

  const chip = (r: number, extra = '') => (
    <button
      key={r}
      type="button"
      disabled={locked}
      onPointerDown={(e) => onDown(e, r)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        e.stopPropagation()
        if (slotOf(r) !== null) place(r, null)
        else setPicked(picked === r ? null : r)
      }}
      aria-pressed={picked === r}
      aria-label={`${ex.pairs[r][1]}${slotOf(r) !== null ? ', placed. Press to remove.' : ''}`}
      style={{ touchAction: 'none' }}
      className={`tile w-full cursor-grab px-3 py-2.5 text-left text-[0.95rem] select-none active:cursor-grabbing ${drag?.r === r ? 'opacity-30' : ''} ${extra}`}
    >
      <Inline text={ex.pairs[r][1]} />
    </button>
  )

  const inTray = tray.filter((r) => slotOf(r) === null)

  return (
    <div className="space-y-5">
      <h2 className="text-[1.35rem] leading-snug font-semibold text-balance">
        <Inline text={ex.prompt} />
      </h2>

      <ol className="space-y-2.5">
        {rows.map((l) => {
          const r = slots[l]
          const filled = r !== undefined
          const ok = filled && r === l
          const state = locked ? (ok ? 'good' : 'bad') : null
          const hot = over === l || (picked !== null && !locked)
          return (
            <li key={l} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-stretch gap-2">
              <div
                className={`flex items-center rounded-xl px-3 py-2.5 text-[0.95rem] font-medium ${
                  state === 'good' ? 'bg-good-soft text-good' : state === 'bad' ? 'bg-bad-soft text-bad' : 'bg-cobalt-soft text-cobalt-deep'
                }`}
              >
                <Inline text={ex.pairs[l][0]} />
              </div>
              <div
                data-slot={l}
                onClick={() => tapSlot(l)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && picked !== null) {
                    e.preventDefault()
                    e.stopPropagation()
                    tapSlot(l)
                  }
                }}
                role={picked !== null && !filled ? 'button' : undefined}
                tabIndex={picked !== null && !filled && !locked ? 0 : undefined}
                aria-label={filled ? undefined : `Slot for ${ex.pairs[l][0]}${picked !== null ? '. Press to place the chosen answer.' : ', empty'}`}
                className={`min-h-12 rounded-xl transition-colors ${
                  filled ? '' : `border-2 border-dashed ${over === l ? 'border-cobalt bg-cobalt-soft' : hot ? 'border-cobalt/60 bg-card' : 'border-rule'}`
                } ${state === 'good' ? '[&_.tile]:!border-good [&_.tile]:!bg-good-soft' : state === 'bad' ? '[&_.tile]:!border-bad [&_.tile]:!bg-bad-soft' : ''} ${
                  filled && over === l ? 'rounded-xl ring-2 ring-cobalt' : ''
                }`}
              >
                {filled && chip(r)}
                {locked && reveal && !ok && (
                  <p className="mt-1 px-1 text-xs text-ink-2">
                    Answer: <Inline text={ex.pairs[l][1]} />
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {!locked && (
        <div
          data-tray
          className={`flex min-h-16 flex-wrap gap-2.5 rounded-2xl border-2 p-2.5 transition-colors ${
            over === 'tray' ? 'border-cobalt bg-cobalt-soft' : 'border-transparent'
          }`}
        >
          {inTray.map((r) => (
            <div key={r} className="min-w-[calc(50%-0.35rem)] flex-1 sm:min-w-[calc(33%-0.5rem)]">
              {chip(r)}
            </div>
          ))}
          {inTray.length === 0 && <p className="self-center px-2 text-sm text-ink-3">All placed. Check your answer, or drag one back here.</p>}
        </div>
      )}
      {!locked && inTray.length > 0 && (
        <p className="text-sm text-ink-3">{picked === null ? 'Drag each answer to its match, or tap an answer then a slot.' : 'Now tap a slot.'}</p>
      )}

      {drag && drag.moved && (
        <div
          aria-hidden
          className="tile pointer-events-none fixed z-50 px-3 py-2.5 text-[0.95rem] shadow-xl"
          style={{ left: drag.x - drag.ox, top: drag.y - drag.oy, width: drag.w, transform: 'rotate(-2deg) scale(1.04)', borderColor: 'var(--color-cobalt)' }}
        >
          <Inline text={ex.pairs[drag.r][1]} />
        </div>
      )}
    </div>
  )
}
