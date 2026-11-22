import { useMemo, useState } from 'react'
import { units } from '../content'
import { PLACEMENT } from '../content/placement'
import { play } from '../sound'
import { Pip } from './Pip'
import { Code, Inline } from './text'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Find a starting point by asking real questions instead of "have you coded
 * before?". One question per unit, easiest first; the first wrong answer or
 * "I don't know" ends it. Calls onDone with how many units to skip.
 */
export function Placement({ onDone }: { onDone: (placed: number) => void }) {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [q, setQ] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [placed, setPlaced] = useState(0)
  const order = useMemo(() => shuffle(PLACEMENT[q].options.map((_, i) => i)), [q])
  const question = PLACEMENT[q]

  const stop = (n: number) => {
    setPlaced(n)
    setPhase('result')
    if (n > 0) play('complete')
  }

  const answer = (choice: number | null) => {
    if (choice !== null && choice === question.answer) {
      if (q + 1 >= PLACEMENT.length) return stop(q + 1)
      setQ(q + 1)
      setPick(null)
    } else stop(q)
  }

  if (phase === 'intro')
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Pip mood="think" size={110} />
        <h1 className="mt-6 text-3xl font-bold">Let’s find your starting point</h1>
        <p className="mt-2 text-ink-2">A few quick questions that get harder. Each one you get right skips a unit. Stop whenever you’re not sure.</p>
        <div className="mt-8 grid w-full gap-3">
          <button className="btn w-full" onClick={() => setPhase('quiz')}>Start the questions</button>
          <button className="btn btn-ghost w-full" onClick={() => onDone(0)}>I’m new to coding, start at the beginning</button>
        </div>
      </div>
    )

  if (phase === 'result') {
    const start = units[placed]
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Pip mood={placed > 0 ? 'celebrate' : 'happy'} size={120} />
        <h1 className="mt-6 text-3xl font-bold">{placed > 0 ? `You can skip ${placed} unit${placed === 1 ? '' : 's'}` : 'Start at the beginning'}</h1>
        <p className="mt-2 text-ink-2">
          {placed > 0
            ? `You’ll start at Unit ${start.week}: ${start.title}. Skipped units stay open if you want to review.`
            : `You’ll start with ${start.title}. It moves fast once the basics click.`}
        </p>
        <button className="btn mt-8 w-full" onClick={() => onDone(placed)}>Continue</button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mb-5 flex items-center gap-1.5" aria-label={`Question ${q + 1} of up to ${PLACEMENT.length}`}>
        {PLACEMENT.map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < q ? 'bg-good' : i === q ? 'bg-cobalt' : 'bg-rule'}`} />
        ))}
      </div>
      <p className="text-sm font-medium text-ink-3">Unit {units[q].week}: {units[q].title}</p>
      <h1 className="mt-1 text-2xl leading-snug font-semibold text-balance">
        <Inline text={question.prompt} />
      </h1>
      {question.code && <Code code={question.code} lang={question.language} className="mt-4" />}
      <div className="mt-5 grid gap-2.5">
        {order.map((i) => (
          <button
            key={`${q}-${i}`}
            aria-pressed={pick === i}
            onClick={() => setPick(i)}
            className={`tile px-4 py-3 text-left ${question.code ? 'font-mono text-[0.95rem] whitespace-pre-wrap' : ''}`}
          >
            <Inline text={question.options[i]} />
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="btn btn-ghost" onClick={() => answer(null)}>I don’t know</button>
        <button className="btn" disabled={pick === null} onClick={() => answer(pick)}>Next</button>
      </div>
    </div>
  )
}
