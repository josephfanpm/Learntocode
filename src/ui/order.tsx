import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { OrderExercise } from '../content/types'
import { reduced } from '../motion'
import type { ExProps } from './exercises'
import { Code, highlight, Inline } from './text'

// Sortable list. Starts shuffled (never already right); drag a row to move it,
// or use the up/down buttons (single-pointer and keyboard alternative).

function shuffledWrong(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return a
  for (let k = 0; k < 20; k++) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    if (a.some((x, i) => x !== i)) return a
  }
  return a.reverse()
}

type Drag = { id: number; grabDy: number; y: number; startY: number; moved: boolean }

export function Order({ ex, locked, reveal, register }: ExProps<OrderExercise>) {
  const initial = useMemo(() => shuffledWrong(ex.lines.length), [ex])
  const [order, setOrder] = useState(initial)
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const els = useRef(new Map<number, HTMLLIElement>())
  const lastTops = useRef(new Map<number, number>())
  // JavaScript has no language tag in the schema, so also spot code by its punctuation.
  const isCode = !!ex.language || ex.lines.some((l) => /[;{}()=]/.test(l))

  useEffect(() => register(() => order.every((id, i) => ex.lines[id] === ex.lines[i])), [order, ex, register])

  // FLIP: rows that change position glide to their new place.
  useLayoutEffect(() => {
    for (const [id, el] of els.current) {
      const prev = lastTops.current.get(id)
      const top = el.offsetTop
      if (prev !== undefined && prev !== top && id !== dragRef.current?.id) {
        el.animate([{ transform: `translateY(${prev - top}px)` }, { transform: 'translateY(0)' }], {
          duration: reduced() ? 0 : 160,
          easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        })
      }
      lastTops.current.set(id, top)
    }
  }, [order])

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return
    const next = [...order]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    setOrder(next)
  }

  const onDown = (e: React.PointerEvent<HTMLLIElement>, id: number) => {
    if (locked || e.button !== 0 || (e.target as HTMLElement).closest('[data-nodrag]')) return
    const el = els.current.get(id)!
    const list = listRef.current!.getBoundingClientRect()
    const d = { id, grabDy: e.clientY - list.top - el.offsetTop, y: e.clientY, startY: e.clientY, moved: false }
    dragRef.current = d
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const moved = d.moved || Math.abs(e.clientY - d.startY) > 5
    const next = { ...d, y: e.clientY, moved }
    dragRef.current = next
    if (!moved) return
    setDrag(next)
    // Where would the dragged row's centre land among the others?
    const list = listRef.current!.getBoundingClientRect()
    const me = els.current.get(d.id)!
    const centre = e.clientY - list.top - d.grabDy + me.offsetHeight / 2
    const others = order.filter((id) => id !== d.id)
    let idx = 0
    for (const id of others) {
      const el = els.current.get(id)!
      if (el.offsetTop + el.offsetHeight / 2 < centre) idx++
    }
    const from = order.indexOf(d.id)
    if (idx !== from) move(from, idx)
  }

  const end = () => {
    dragRef.current = null
    setDrag(null)
  }

  const offset = (id: number) => {
    if (!drag || drag.id !== id || !drag.moved) return undefined
    const list = listRef.current!.getBoundingClientRect()
    const el = els.current.get(id)!
    return drag.y - list.top - drag.grabDy - el.offsetTop
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[1.35rem] leading-snug font-semibold text-balance">
        <Inline text={ex.prompt} />
      </h2>
      <ol ref={listRef} className="relative space-y-2.5">
        {order.map((id, i) => {
          const ok = ex.lines[id] === ex.lines[i]
          const dy = offset(id)
          const dragging = dy !== undefined
          return (
            <li
              key={id}
              ref={(el) => {
                if (el) els.current.set(id, el)
                else els.current.delete(id)
              }}
              onPointerDown={(e) => onDown(e, id)}
              onPointerMove={onMove}
              onPointerUp={end}
              onPointerCancel={end}
              style={{
                touchAction: locked ? undefined : 'none',
                transform: dragging ? `translateY(${dy}px) scale(1.02)` : undefined,
                zIndex: dragging ? 10 : undefined,
                transition: dragging ? 'none' : undefined,
              }}
              className={`tile relative flex items-center gap-3 py-2 pr-2 pl-2.5 select-none ${locked ? '' : 'cursor-grab active:cursor-grabbing'} ${
                dragging ? '!border-cobalt shadow-xl' : ''
              } ${locked ? (ok ? '!border-good !bg-good-soft' : '!border-bad !bg-bad-soft') : ''}`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg font-display text-sm font-bold ${
                  locked ? (ok ? 'bg-good text-white' : 'bg-bad text-white') : 'bg-cobalt-soft text-cobalt-deep'
                }`}
              >
                {i + 1}
              </span>
              <span className={`min-w-0 flex-1 py-1 ${isCode ? 'overflow-x-auto font-mono text-[0.92rem] whitespace-pre' : 'text-[0.97rem]'}`}>
                {isCode ? highlight(ex.lines[id], ex.language) : <Inline text={ex.lines[id]} />}
              </span>
              {!locked && (
                <span className="flex shrink-0 items-center" data-nodrag>
                  <button
                    type="button"
                    aria-label={`Move "${ex.lines[id].trim()}" up`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                    className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-paper hover:text-ink disabled:opacity-25"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move "${ex.lines[id].trim()}" down`}
                    disabled={i === order.length - 1}
                    onClick={() => move(i, i + 1)}
                    className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-paper hover:text-ink disabled:opacity-25"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <GripVertical size={18} className="ml-0.5 text-ink-3" aria-hidden />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {!locked && <p className="text-sm text-ink-3">Drag the steps into order, or use the arrows.</p>}
      {locked && reveal && (
        <div>
          <p className="mb-1 text-sm font-medium text-ink-2">Correct order</p>
          {isCode ? (
            <Code code={ex.lines.join('\n')} lang={ex.language} />
          ) : (
            <ol className="list-decimal space-y-1 pl-6 text-sm text-ink-2">
              {ex.lines.map((l) => (
                <li key={l}>
                  <Inline text={l} />
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
