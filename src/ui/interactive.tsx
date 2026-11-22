import { useEffect, useState } from 'react'
import type { BitsExercise, SpotExercise, StepsExercise, TypeExercise } from '../content/types'
import { play } from '../sound'
import type { ExProps } from './exercises'
import { Code, highlight, Inline } from './text'

// Four hands-on formats: spot the bug, bit switches, step through, type the answer.

const Prompt = ({ text }: { text: string }) => (
  <h2 className="text-[1.35rem] leading-snug font-semibold text-balance">
    <Inline text={text} />
  </h2>
)

// ---------- Spot: tap the line ----------

export function Spot({ ex, locked, reveal, register }: ExProps<SpotExercise>) {
  const [pick, setPick] = useState<number | null>(null)
  useEffect(() => register(pick === null ? null : () => pick === ex.answer), [pick, ex, register])
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      <div className="code !p-2" role="radiogroup" aria-label="Lines of code">
        {ex.lines.map((line, i) => {
          const good = locked && i === ex.answer && (reveal || pick === i)
          const bad = locked && pick === i && i !== ex.answer
          // Blank lines are spacing, not answers.
          if (!line.trim()) return <div key={i} className="h-3" aria-hidden />
          return (
            <button
              key={i}
              role="radio"
              aria-checked={pick === i}
              disabled={locked}
              onClick={() => {
                setPick(i)
                play('tap')
              }}
              className={`flex w-full items-baseline gap-3 rounded-lg px-2 py-1 text-left transition-colors ${
                good ? 'bg-good/35' : bad ? 'bg-bad/40' : pick === i ? 'bg-cobalt/45' : 'hover:bg-white/10'
              }`}
            >
              <span className="w-4 shrink-0 text-right text-ink-3 select-none">{i + 1}</span>
              <span className="whitespace-pre">{highlight(line, ex.language)}</span>
            </button>
          )
        })}
      </div>
      {!locked && <p className="text-sm text-ink-3">Tap the line.</p>}
    </div>
  )
}

// ---------- Bits: flip switches to make a number ----------

export function Bits({ ex, locked, reveal, register }: ExProps<BitsExercise>) {
  const [on, setOn] = useState<boolean[]>(() => Array(ex.bits).fill(false))
  const value = on.reduce((sum, b, i) => sum + (b ? 2 ** (ex.bits - 1 - i) : 0), 0)
  useEffect(() => register(() => value === ex.target), [value, ex, register])
  const flip = (i: number) => {
    setOn((cur) => cur.map((b, j) => (j === i ? !b : b)))
    play('tap')
  }
  const answer = ex.target.toString(2).padStart(ex.bits, '0')
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      <div className="flex items-end justify-center gap-1.5 sm:gap-2.5">
        {on.map((b, i) => {
          const place = 2 ** (ex.bits - 1 - i)
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-xs tabular-nums ${b ? 'font-bold text-cobalt' : 'text-ink-3'}`}>{place}</span>
              <button
                role="switch"
                aria-checked={b}
                aria-label={`The ${place}s bit`}
                disabled={locked}
                onClick={() => flip(i)}
                className={`relative h-16 w-9 rounded-xl border-2 border-b-4 transition-colors sm:w-11 ${b ? 'border-cobalt-deep bg-cobalt' : 'border-rule bg-white'}`}
              >
                <span className={`absolute left-1/2 size-6 -translate-x-1/2 rounded-lg transition-[top] duration-150 ${b ? 'top-1 bg-white' : 'top-7 bg-rule'}`} />
              </button>
              <span className={`font-mono text-xl font-bold ${b ? 'text-ink' : 'text-ink-3'}`}>{b ? 1 : 0}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-rule bg-white p-3" aria-live="polite">
        <span className="text-sm text-ink-2">Your number</span>
        <span className={`font-display text-3xl font-bold tabular-nums ${locked ? (value === ex.target ? 'text-good' : 'text-bad') : ''}`}>{value}</span>
      </div>
      {locked && reveal && (
        <p className="text-sm text-ink-2">
          Answer: <code className="rounded bg-good-soft px-1.5 font-mono text-good">{answer}</code>
        </p>
      )}
    </div>
  )
}

// ---------- Steps: tap the right box at each step ----------

export function Steps({ ex, locked, reveal, register }: ExProps<StepsExercise>) {
  const [picks, setPicks] = useState<number[]>([])
  const at = Math.min(picks.length, ex.steps.length - 1)
  const finished = picks.length === ex.steps.length
  useEffect(() => register(finished ? () => picks.every((p, i) => p === ex.steps[i].answer) : null), [picks, finished, ex, register])
  const tap = (i: number) => {
    if (locked || finished) return
    setPicks([...picks, i])
  }
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      <ol className="space-y-2">
        {ex.steps.map((st, i) => {
          const done = i < picks.length
          const right = picks[i] === st.answer
          const current = i === picks.length && !locked
          if (i > picks.length) return null
          return (
            <li key={i} className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-[0.95rem] ${current ? 'bg-cobalt-soft font-medium' : 'text-ink-2'}`}>
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${locked && done ? (right ? 'bg-good text-white' : 'bg-bad text-white') : current ? 'bg-cobalt text-white' : 'bg-rule'}`}>{i + 1}</span>
              <span className="whitespace-pre-wrap">
                <Inline text={st.ask} />
                {done && <span className="ml-1.5 font-mono font-semibold text-ink">→ {ex.cells[picks[i]]}</span>}
                {locked && reveal && done && !right && <span className="ml-1.5 text-good">(should be {ex.cells[st.answer]})</span>}
              </span>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap justify-center gap-2">
        {ex.cells.map((c, i) => {
          const last = picks.at(-1) === i
          return (
            <button
              key={i}
              disabled={locked || finished}
              onClick={() => tap(i)}
              aria-label={`Box ${i + 1}: ${c}`}
              className={`tile flex min-w-12 flex-col items-center px-2.5 pt-1.5 pb-1 ${last ? '!border-cobalt !bg-cobalt-soft' : ''}`}
            >
              <span className="font-mono text-lg font-semibold">{c}</span>
              <span className="text-[0.65rem] text-ink-3">{i}</span>
            </button>
          )
        })}
      </div>
      {!locked && (
        <div className="flex items-center justify-between text-sm text-ink-3">
          <span>{finished ? 'All steps answered.' : `Step ${at + 1} of ${ex.steps.length}: tap a box.`}</span>
          {picks.length > 0 && (
            <button className="font-semibold text-cobalt" onClick={() => setPicks(picks.slice(0, -1))}>Undo</button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Type: a short typed answer ----------

const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')

export function TypeAnswer({ ex, locked, reveal, register }: ExProps<TypeExercise>) {
  const [v, setV] = useState('')
  useEffect(() => register(v.trim() ? () => ex.accept.some((a) => clean(a) === clean(v)) : null), [v, ex, register])
  const right = ex.accept.some((a) => clean(a) === clean(v))
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      {ex.code && <Code code={ex.code} lang={ex.language} />}
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        disabled={locked}
        autoFocus
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Your answer"
        placeholder="Type your answer"
        className={`w-full rounded-xl border-2 border-b-4 bg-white px-4 py-3.5 font-mono text-lg outline-none focus:border-cobalt ${
          locked ? (right ? '!border-good !bg-good-soft' : '!border-bad !bg-bad-soft') : 'border-rule'
        }`}
      />
      {locked && reveal && (
        <p className="text-sm text-ink-2">
          Answer: <code className="rounded bg-good-soft px-1.5 font-mono text-good">{ex.accept[0]}</code>
        </p>
      )}
    </div>
  )
}
