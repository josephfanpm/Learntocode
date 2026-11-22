import { Check, Flame, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lesson, Unit } from '../content/types'
import { dayKey } from '../engine/dates'
import { completeLesson, streak, type LessonResult } from '../engine/state'
import { warmPython } from '../runners'
import { useStore } from '../store'
import { ExerciseView, type Grader } from './exercises'
import { Inline } from './text'

type Status = 'answering' | 'right' | 'wrong'

const PRAISE = ['Nice.', 'Correct.', 'That’s it.', 'Right.', 'Good work.']

export function LessonPlayer({ lesson, unit, color, startAt = 0, onExit }: { lesson: Lesson; unit: Unit; color: string; startAt?: number; onExit: () => void }) {
  const { update, s } = useStore()
  const total = lesson.exercises.length
  // Queue of exercise indices; wrong answers go to the back for another try.
  const [queue, setQueue] = useState<number[]>(() => lesson.exercises.map((_, i) => i))
  // `startAt` jumps to an exercise (for reviewing content: #/lesson/<id>?at=5).
  const [pos, setPos] = useState(() => Math.min(startAt, total - 1))
  const [done, setDone] = useState<Set<number>>(new Set())
  const [missed, setMissed] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<Status>('answering')
  const [tries, setTries] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [grader, setGrader] = useState<Grader | null>(null)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ r: LessonResult; accuracy: number } | null>(null)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const praise = useRef(PRAISE[0])

  const idx = queue[pos]
  const ex = lesson.exercises[idx]

  useEffect(() => {
    if (lesson.exercises.some((e) => e.kind === 'write' && e.language === 'python')) warmPython().catch(() => {})
  }, [lesson])

  const register = useCallback((g: Grader | null) => setGrader(() => g), [])

  const finish = (finalMissed: Set<number>) => {
    const gradable = lesson.exercises.filter((e) => e.kind !== 'concept').length
    const accuracy = gradable ? (gradable - finalMissed.size) / gradable : 1
    const [nextState, r] = completeLesson(s, lesson.id, accuracy, new Date())
    // Jumping in part-way (content review) doesn't count as finishing.
    if (startAt === 0) update(() => nextState)
    setResult({ r, accuracy })
  }

  const next = (wasRight: boolean, queueNow = queue) => {
    const newDone = new Set(done)
    if (wasRight) newDone.add(idx)
    setDone(newDone)
    setStatus('answering')
    setTries(0)
    setReveal(false)
    setGrader(null)
    setAttempt((a) => a + 1)
    if (pos + 1 >= queueNow.length) finish(missed)
    else setPos(pos + 1)
  }

  const onCheck = async () => {
    if (!grader || checking) return
    if (ex.kind === 'concept') return next(true)
    setChecking(true)
    const ok = await grader()
    setChecking(false)
    praise.current = PRAISE[Math.floor(Math.random() * PRAISE.length)]
    if (ok) {
      setStatus('right')
      return
    }
    setStatus('wrong')
    setTries((t) => t + 1)
    setMissed((m) => new Set(m).add(idx))
    update((p) => ({ ...p, struggles: { ...p.struggles, [lesson.id]: (p.struggles[lesson.id] ?? 0) + 1 } }))
    if (ex.kind !== 'write') setReveal(true)
  }

  const onContinueWrong = () => {
    // Non-code exercises come back at the end of the lesson.
    const q = ex.kind === 'write' ? queue : [...queue, idx]
    setQueue(q)
    next(false, q)
  }

  // Enter = Check / Continue (not inside the code editor).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.target instanceof HTMLTextAreaElement || result) return
      e.preventDefault()
      if (status === 'answering') onCheck()
      else if (status === 'right') next(true)
      else if (ex.kind !== 'write') onContinueWrong()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (result) return <LessonDone result={result} lesson={lesson} onDone={onExit} streakNow={streak(s, dayKey(new Date()))} />

  const progress = done.size / total

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-4 px-4 pt-5 pb-3">
        <button aria-label="Quit lesson" onClick={() => setConfirmQuit(true)} className="rounded-lg p-1 text-ink-3 hover:text-ink">
          <X size={26} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.max(4, progress * 100)}%`, background: color }} />
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-56">
        <p className="mb-3 text-sm font-medium text-ink-3">
          {unit.title} · {lesson.title}
        </p>
        <div key={`${idx}-${attempt}`}>
          <ExerciseView ex={ex} locked={status !== 'answering'} reveal={reveal} register={register} />
        </div>
      </main>

      <footer
        className={`fixed inset-x-0 bottom-0 border-t-2 ${
          status === 'right' ? 'anim-rise border-good/30 bg-good-soft' : status === 'wrong' ? 'anim-rise border-bad/30 bg-bad-soft' : 'border-rule bg-paper'
        }`}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <div className="flex-1" aria-live="polite">
            {status === 'right' && (
              <div className="flex gap-3">
                <span className="anim-pop grid size-9 shrink-0 place-items-center rounded-full bg-good text-white"><Check size={22} strokeWidth={3} /></span>
                <div>
                  <p className="font-display text-xl font-bold text-good">{praise.current}</p>
                  {'explain' in ex && <p className="mt-0.5 text-sm text-ink-2"><Inline text={ex.explain} /></p>}
                </div>
              </div>
            )}
            {status === 'wrong' && (
              <div className="anim-shake flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bad text-white"><X size={22} strokeWidth={3} /></span>
                <div>
                  <p className="font-display text-xl font-bold text-bad">{ex.kind === 'write' ? 'Not quite yet' : 'Not quite'}</p>
                  <p className="mt-0.5 text-sm text-ink-2">
                    {ex.kind === 'write' ? 'Compare your output with the expected output above, then try again.' : 'explain' in ex ? <Inline text={ex.explain} /> : null}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 sm:w-auto">
            {status === 'answering' && (
              <button className="btn w-full sm:w-44" disabled={!grader || checking} onClick={onCheck}>
                {ex.kind === 'concept' ? 'Continue' : checking ? 'Checking…' : 'Check'}
              </button>
            )}
            {status === 'right' && (
              <button className="btn btn-good w-full sm:w-44" onClick={() => next(true)}>Continue</button>
            )}
            {status === 'wrong' && ex.kind !== 'write' && (
              <button className="btn btn-bad w-full sm:w-44" onClick={onContinueWrong}>Got it</button>
            )}
            {status === 'wrong' && ex.kind === 'write' && (
              <>
                {tries >= 2 && !reveal && (
                  <button className="btn btn-ghost flex-1 sm:w-40" onClick={() => setReveal(true)}>Show answer</button>
                )}
                {reveal ? (
                  <button className="btn btn-bad flex-1 sm:w-44" onClick={onContinueWrong}>Continue</button>
                ) : (
                  <button className="btn btn-bad flex-1 sm:w-44" onClick={() => setStatus('answering')}>Try again</button>
                )}
              </>
            )}
          </div>
        </div>
      </footer>

      {confirmQuit && (
        <div className="fixed inset-0 z-10 grid place-items-end bg-ink/40 sm:place-items-center" onClick={() => setConfirmQuit(false)}>
          <div className="anim-rise w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="quit-title">
            <h2 id="quit-title" className="text-2xl font-bold">Leave this lesson?</h2>
            <p className="mt-2 text-ink-2">You’ll lose progress in this lesson. Finished lessons are saved.</p>
            <div className="mt-6 grid gap-3">
              <button className="btn" autoFocus onClick={() => setConfirmQuit(false)}>Keep going</button>
              <button className="btn btn-ghost" onClick={onExit}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LessonDone({ result, lesson, onDone, streakNow }: { result: { r: LessonResult; accuracy: number }; lesson: Lesson; onDone: () => void; streakNow: number }) {
  const { r, accuracy } = result
  const { s } = useStore()
  const today = s.activity[dayKey(new Date())]?.xp ?? 0
  const grew = r.streakAfter > r.streakBefore
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-ink-3">{lesson.title}</p>
        <h1 className="anim-pop mt-1 text-5xl font-extrabold">Lesson done</h1>
        <div className="mt-10 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-rule bg-white p-4">
            <p className="text-sm text-ink-3">XP earned</p>
            <p className="font-display text-4xl font-bold text-cobalt">+{r.xp}</p>
          </div>
          <div className="rounded-2xl border-2 border-rule bg-white p-4">
            <p className="text-sm text-ink-3">First-try accuracy</p>
            <p className="font-display text-4xl font-bold text-good">{Math.round(accuracy * 100)}%</p>
          </div>
        </div>
        <div className={`mt-3 flex w-full items-center gap-4 rounded-2xl p-4 text-left ${grew ? 'bg-flame-soft' : 'border-2 border-rule bg-white'}`}>
          <Flame className={grew ? 'anim-pop text-flame' : 'text-flame'} size={40} fill="currentColor" />
          <div>
            <p className="font-display text-2xl font-bold">{streakNow}-day streak</p>
            <p className="text-sm text-ink-2">{grew ? 'Extended today. Come back tomorrow to keep it going.' : 'Already counted for today.'}</p>
          </div>
        </div>
        <div className="mt-3 w-full rounded-2xl border-2 border-rule bg-white p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Daily goal</span>
            <span className="text-ink-2">{Math.min(today, s.dailyGoal)} / {s.dailyGoal} XP</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-rule">
            <div className="h-full rounded-full bg-flame" style={{ width: `${Math.min(100, (today / s.dailyGoal) * 100)}%` }} />
          </div>
          {r.goalHit && <p className="mt-2 text-sm font-medium text-gem">Goal reached. +20 bonus gems.</p>}
        </div>
      </div>
      <button className="btn mt-8 w-full" autoFocus onClick={onDone}>Continue</button>
    </div>
  )
}
