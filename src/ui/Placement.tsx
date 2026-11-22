import { useMemo, useState } from 'react'
import { COURSES, courseUnits, type CourseId } from '../content'
import { GATE, PLACEMENTS } from '../content/placement'
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
 * Find a starting point in one course by asking real questions instead of
 * "have you done this before?". One question per chapter, easiest first; the
 * first wrong answer or "I don't know" ends it. Calls onDone with how many
 * chapters to skip.
 *
 * Developer skills assumes the learner can already program, so it opens with
 * one Python question (the gate). Missing it suggests starting with Computer
 * science; `onSwitch` is called if they accept.
 */
export function Placement({ course, onDone, onSwitch }: { course: CourseId; onDone: (placed: number) => void; onSwitch?: (to: CourseId) => void }) {
  const units = useMemo(() => courseUnits(course), [course])
  const questions = PLACEMENTS[course]
  const gate = course === 'dev' ? GATE : null
  const word = course === 'cs' ? 'unit' : 'chapter'
  const [phase, setPhase] = useState<'intro' | 'gate' | 'gate-missed' | 'quiz' | 'result'>('intro')
  const [q, setQ] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [placed, setPlaced] = useState(0)
  const question = phase === 'gate' && gate ? gate : questions[q]
  const order = useMemo(() => shuffle(question.options.map((_, i) => i)), [question])

  const stop = (n: number) => {
    setPlaced(n)
    setPhase('result')
    // Let the answer sound finish before the result jingle.
    if (n > 0) setTimeout(() => play('complete'), 450)
  }

  const answer = (choice: number | null) => {
    const right = choice !== null && choice === question.answer
    if (right) play('correct', phase === 'gate' ? 1 : q + 1)
    else if (choice !== null) play('wrong') // "I don't know" stays silent
    setPick(null)
    if (phase === 'gate') return setPhase(right ? 'quiz' : 'gate-missed')
    if (!right) return stop(q)
    if (q + 1 >= questions.length) return stop(q + 1)
    setQ(q + 1)
  }

  if (phase === 'intro')
    return (
      <div className="flex flex-1 flex-col justify-center py-6">
        <div className="flex items-start gap-3">
          <Pip mood="think" size={84} className="shrink-0" />
          <h1 className="bubble mt-2 font-sans text-lg leading-snug font-semibold">Where should we start in {COURSES.find((c) => c.id === course)!.title}?</h1>
        </div>
        <div className="mt-6 grid gap-3">
          <button className="tile px-4 py-4 text-left" onClick={() => onDone(0)}>
            <span className="block font-semibold">{course === 'cs' ? 'Start from scratch' : 'Start at chapter 1'}</span>
            <span className="text-sm text-ink-2">{course === 'cs' ? 'I’m new to coding. Take me to the first lesson.' : 'This is new to me. Take me to the first lesson.'}</span>
          </button>
          <button className="tile px-4 py-4 text-left" onClick={() => setPhase(gate ? 'gate' : 'quiz')}>
            <span className="flex flex-wrap items-center gap-2 font-semibold">
              Find my level
              <span className="rounded-md bg-cobalt-soft px-1.5 py-0.5 text-xs font-semibold text-cobalt-deep">
                {course === 'cs' ? 'Recommended if you’ve coded before' : 'Recommended if you know some of this'}
              </span>
            </span>
            <span className="text-sm text-ink-2">Answer a few questions that get harder. Each one you get right skips a {word}.</span>
          </button>
        </div>
      </div>
    )

  if (phase === 'gate-missed')
    return (
      <div className="flex flex-1 flex-col justify-center py-6">
        <div className="flex items-start gap-3">
          <Pip mood="think" size={84} className="shrink-0" />
          <h1 className="bubble mt-2 font-sans text-lg leading-snug font-semibold">This course uses Python throughout. Computer science teaches it from zero.</h1>
        </div>
        <div className="mt-6 grid gap-3">
          {onSwitch && <button className="btn w-full" onClick={() => onSwitch('cs')}>Start with Computer science</button>}
          <button className="btn btn-ghost w-full" onClick={() => onDone(0)}>Continue with Developer skills anyway</button>
        </div>
      </div>
    )

  if (phase === 'result') {
    const start = units[Math.min(placed, units.length - 1)]
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Pip mood={placed > 0 ? 'celebrate' : 'happy'} size={120} />
        <h1 className="mt-6 text-3xl font-bold">{placed > 0 ? `You can skip ${placed} ${word}${placed === 1 ? '' : 's'}` : 'Start at the beginning'}</h1>
        <p className="mt-2 text-ink-2">
          {placed > 0
            ? `You’ll start at ${word === 'unit' ? 'Unit' : 'Chapter'} ${start.week}: ${start.title}. Skipped ${word}s stay open if you want to review.`
            : `You’ll start with ${start.title}.${course === 'cs' ? ' It moves fast once the basics click.' : ''}`}
        </p>
        {course === 'cs' && placed === questions.length && onSwitch ? (
          <>
            <p className="mt-4 rounded-2xl bg-flame-soft p-3 text-sm">You got every question right. One of the other courses may suit you better.</p>
            <div className="mt-5 grid w-full gap-3">
              <button className="btn w-full" onClick={() => onSwitch('ai')}>Try Building with AI</button>
              <button className="btn btn-ghost w-full" onClick={() => onSwitch('dev')}>Try Developer skills</button>
              <button className="btn btn-ghost w-full" onClick={() => onDone(placed)}>Stay in Computer science</button>
            </div>
          </>
        ) : (
          <button className="btn mt-8 w-full" onClick={() => onDone(placed)}>Continue</button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'gate' ? (
        <p className="mb-2 text-sm font-medium text-ink-3">First, a quick Python check</p>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-1.5" aria-label={`Question ${q + 1} of up to ${questions.length}`}>
            {questions.map((_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < q ? 'bg-good' : i === q ? 'bg-cobalt' : 'bg-rule'}`} />
            ))}
          </div>
          <p className="text-sm font-medium text-ink-3">
            {word === 'unit' ? 'Unit' : 'Chapter'} {units[q].week}: {units[q].title}
          </p>
        </>
      )}
      <h1 className="mt-1 text-2xl leading-snug font-semibold text-balance">
        <Inline text={question.prompt} />
      </h1>
      {question.code && <Code code={question.code} lang={question.language} className="mt-4" />}
      <div className="mt-5 grid gap-2.5">
        {order.map((i) => (
          <button
            key={`${phase}-${q}-${i}`}
            aria-pressed={pick === i}
            onClick={() => setPick(i)}
            className={`tile px-4 py-3 text-left ${question.code && question.options.every((o) => o.length < 24) ? 'font-mono text-[0.95rem] whitespace-pre-wrap' : ''}`}
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
