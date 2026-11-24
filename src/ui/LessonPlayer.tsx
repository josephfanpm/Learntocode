import { Lightbulb, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lesson, Unit } from '../content/types'
import { hintFor } from '../engine/hints'
import { dayKey } from '../engine/dates'
import { addMistake, LEGENDARY_GEMS, LEGENDARY_MISTAKES, recordQuest, reviewable, reviewMistake, winLegendary, type MistakeItem } from '../engine/gamify'
import { completeLesson, completeReview, type LessonResult } from '../engine/state'
import { warmPython } from '../runners'
import { play } from '../sound'
import { useStore } from '../store'
import { AfterLesson } from './AfterLesson'
import { ExerciseView, ExampleOutput, type Grader } from './exercises'
import { Pip } from './Pip'
import { Code, Inline, Prose } from './text'

type Status = 'answering' | 'right' | 'wrong'

const PRAISE = ['Nice.', 'Correct.', 'That’s it.', 'Right.', 'Good work.']

/**
 * lesson: the normal run. legendary: a finished lesson replayed with no hints
 * and at most LEGENDARY_MISTAKES wrong answers. review: due mistakes from
 * many lessons (`reviewItems[i]` is where exercise i came from).
 */
export type PlayMode = 'lesson' | 'legendary' | 'review'

export function LessonPlayer({
  lesson,
  unit,
  color,
  startAt = 0,
  mode = 'lesson',
  reviewItems = [],
  onExit,
  onAvatar,
  onRetry,
}: {
  lesson: Lesson
  unit?: Unit
  color: string
  startAt?: number
  mode?: PlayMode
  reviewItems?: MistakeItem[]
  onExit: () => void
  onAvatar: () => void
  onRetry?: () => void
}) {
  const { update, s } = useStore()
  const total = lesson.exercises.length
  // Queue of exercise indices; wrong answers go to the back for another try.
  const [queue, setQueue] = useState<number[]>(() => lesson.exercises.map((_, i) => i))
  // `startAt` jumps to an exercise (for reviewing content: #/lesson/<id>?at=5).
  const [pos, setPos] = useState(() => Math.min(startAt, total - 1))
  const [done, setDone] = useState<Set<number>>(new Set())
  const [missed, setMissed] = useState<Set<number>>(new Set())
  // Wrong answers per exercise. After the second, the worked example opens by itself.
  const misses = useRef(new Map<number, number>())
  const [status, setStatus] = useState<Status>('answering')
  const [tries, setTries] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [grader, setGrader] = useState<Grader | null>(null)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{ r: LessonResult; accuracy: number; notes: string[] } | null>(null)
  const [failed, setFailed] = useState(false)
  const wrongs = useRef(0)
  const bestCombo = useRef(0)
  const usedHint = useRef(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const [attempt, setAttempt] = useState(0)
  // Hints shown for the current exercise: 0 none, 1 the concept, 2 a nudge as well.
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0)
  const praise = useRef(PRAISE[0])
  // Right answers in a row, for the climbing correct sound.
  const combo = useRef(0)

  const idx = queue[pos]
  const ex = lesson.exercises[idx]

  useEffect(() => {
    if (lesson.exercises.some((e) => e.kind === 'write' && e.language === 'python')) warmPython().catch(() => {})
  }, [lesson])

  const register = useCallback((g: Grader | null) => setGrader(() => g), [])

  const finish = (finalMissed: Set<number>) => {
    const gradable = lesson.exercises.filter((e) => e.kind !== 'concept').length
    const accuracy = gradable ? (gradable - finalMissed.size) / gradable : 1
    const now = new Date()
    const today = dayKey(now)
    const notes: string[] = []
    let nextState: typeof s
    let r: LessonResult
    if (mode === 'review') {
      // Right first time moves a question further out; a miss brings it back tomorrow.
      let st = s
      reviewItems.forEach((item, i) => (st = reviewMistake(st, item, !finalMissed.has(i), today)))
      const fixed = reviewItems.length - finalMissed.size
      ;[nextState, r] = completeReview(st, fixed, now)
      nextState = recordQuest(nextState, { mistakesFixed: fixed, bestCombo: bestCombo.current, xp: r.xp }, today)
      notes.push(fixed === reviewItems.length ? 'Every mistake fixed.' : `${fixed} of ${reviewItems.length} fixed. The rest come back tomorrow.`)
    } else {
      ;[nextState, r] = completeLesson(s, lesson.id, accuracy, now)
      nextState = recordQuest(
        nextState,
        {
          lessonsDone: 1,
          perfectLessons: accuracy === 1 ? 1 : 0,
          bestCombo: bestCombo.current,
          xp: r.xp,
          codeLessons: lesson.exercises.some((e) => e.kind === 'write') ? 1 : 0,
          noHintLessons: usedHint.current ? 0 : 1,
        },
        today,
      )
      if (mode === 'legendary' && !s.legendary?.[lesson.id]) {
        nextState = winLegendary(nextState, lesson.id)
        notes.push(`Legendary. +${LEGENDARY_GEMS} gems.`)
      }
    }
    if (r.milestoneGems) notes.push(`${r.streakAfter}-day streak. +${r.milestoneGems} gems.`)
    if (r.boosted) notes.push('Double XP was on.')
    // Jumping in part-way (content review) doesn't count as finishing.
    if (startAt === 0) update(() => nextState)
    setResult({ r, accuracy, notes })
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
    if (pos + 1 >= queueNow.length) return finish(missed)
    // A question that has been missed twice comes back with its example already open.
    setHintLevel((misses.current.get(queueNow[pos + 1]) ?? 0) >= 2 ? 1 : 0)
    setPos(pos + 1)
  }

  const onCheck = async () => {
    if (!grader || checking) return
    if (ex.kind === 'concept') return next(true)
    setChecking(true)
    const ok = await grader()
    setChecking(false)
    praise.current = PRAISE[Math.floor(Math.random() * PRAISE.length)]
    if (ok) {
      combo.current++
      bestCombo.current = Math.max(bestCombo.current, combo.current)
      play('correct', combo.current)
      setStatus('right')
      return
    }
    combo.current = 0
    play('wrong')
    setStatus('wrong')
    setTries((t) => t + 1)
    setMissed((m) => new Set(m).add(idx))
    const n = (misses.current.get(idx) ?? 0) + 1
    misses.current.set(idx, n)
    // Code questions are retried in place, so the example opens right here (not in legendary).
    if (ex.kind === 'write' && n >= 2 && mode !== 'legendary') setHintLevel((h) => (h === 0 ? 1 : h))
    if (startAt === 0 && mode !== 'review') {
      // First miss on a question queues it for spaced review.
      const first = n === 1 && reviewable(ex)
      update((p) => {
        const q = first ? addMistake(p, lesson.id, idx, dayKey(new Date())) : p
        return mode === 'lesson' ? { ...q, struggles: { ...q.struggles, [lesson.id]: (q.struggles[lesson.id] ?? 0) + 1 } } : q
      })
    }
    if (mode === 'legendary') {
      wrongs.current++
      if (wrongs.current > LEGENDARY_MISTAKES) setFailed(true)
    }
    if (ex.kind !== 'write') setReveal(true)
  }

  const onContinueWrong = () => {
    // Non-code exercises come back at the end of the lesson.
    const q = ex.kind === 'write' ? queue : [...queue, idx]
    setQueue(q)
    next(false, q)
  }

  // A tiny tick when an answer tile is tapped (one listener for every exercise type).
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest('.tile')
      if (t && !(t as HTMLButtonElement).disabled) play('tap')
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

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

  if (result) return <AfterLesson result={result} lesson={lesson} saved={startAt === 0} onExit={onExit} onAvatar={onAvatar} />

  if (failed)
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Pip mood="oops" size={110} className="mb-4" />
          <h1 className="text-3xl font-bold">Out of tries</h1>
          <p className="mt-2 text-ink-2">Legendary allows {LEGENDARY_MISTAKES} mistakes. Your progress is safe.</p>
        </div>
        <div className="grid gap-3">
          {onRetry && <button className="btn" autoFocus onClick={onRetry}>Try again</button>}
          <button className="btn btn-ghost" onClick={onExit}>Leave</button>
        </div>
      </div>
    )

  const progress = done.size / total

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-4 px-4 pt-5 pb-3">
        <button aria-label="Quit lesson" onClick={() => setConfirmQuit(true)} className="rounded-lg p-1 text-ink-3 hover:text-ink">
          <X size={26} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="bar-fill h-full rounded-full" style={{ width: `${Math.max(4, progress * 100)}%`, background: color }} />
        </div>
        <button
          aria-label={s.sound === false ? 'Turn sound on' : 'Turn sound off'}
          aria-pressed={s.sound !== false}
          onClick={() => update((p) => ({ ...p, sound: p.sound === false }))}
          className="rounded-lg p-1 text-ink-3 hover:text-ink"
        >
          {s.sound === false ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </header>

      <main className="flex-1 px-4 pt-4 pb-56">
        <p className="mb-3 flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink-3">
          <span>{unit ? `${unit.title} · ` : ''}{lesson.title}</span>
          {mode === 'legendary' && (
            <span className="pixel text-[0.55rem] text-gold" aria-label={`Legendary, ${LEGENDARY_MISTAKES - wrongs.current} mistakes left`}>
              LEGENDARY · {LEGENDARY_MISTAKES - wrongs.current} LEFT
            </span>
          )}
        </p>
        <div key={`${idx}-${attempt}`}>
          <ExerciseView ex={ex} locked={status !== 'answering'} reveal={reveal} register={register} />
        </div>
        {hintLevel > 0 && (
          <aside aria-label="Hint" aria-live="polite" className="mt-6 flex items-start gap-3">
            <Pip mood="think" size={52} className="mt-1 shrink-0" />
            <div className="min-w-0 flex-1 space-y-3">
              {([1, 2] as const)
                .filter((lv) => lv <= hintLevel)
                .map((lv) => {
                  const h = hintFor(lesson, idx, lv)
                  return (
                    <div key={lv} className="bubble !animate-none rounded-2xl bg-flame-soft !border-flame/30 text-[0.95rem] before:!hidden">
                      <p className="font-display font-bold">{h.title}</p>
                      <Prose text={h.body} className="mt-1 text-ink-2" />
                      {h.code && <Code code={h.code} lang={h.language} className="mt-2 text-[0.82rem]" />}
                      {h.output !== undefined && <ExampleOutput text={h.output} className="mt-2 text-[0.82rem]" />}
                    </div>
                  )
                })}
            </div>
          </aside>
        )}
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
                <Pip key={`c${idx}-${attempt}`} mood="cheer" size={54} className="-my-2 shrink-0" />
                <div>
                  <p className="font-display text-xl font-bold text-good">{praise.current}</p>
                  {'explain' in ex && <p className="mt-0.5 text-sm text-ink-2"><Inline text={ex.explain} /></p>}
                </div>
              </div>
            )}
            {status === 'wrong' && (
              <div className="anim-shake flex gap-3">
                <Pip mood="oops" size={54} className="-my-2 shrink-0" />
                <div>
                  <p className="font-display text-xl font-bold text-bad">{ex.kind === 'write' ? 'Not quite yet' : 'Not quite'}</p>
                  <p className="mt-0.5 text-sm text-ink-2">
                    {ex.kind === 'write' ? (tries >= 2 ? 'A worked example is open below. Compare it with your code, then try again.' : 'Compare your output with the expected output above, then try again.') : 'explain' in ex ? <Inline text={ex.explain} /> : null}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 sm:w-auto">
            {/* Hints quote the lesson's own cards, so only a normal lesson has them. */}
            {status === 'answering' && ex.kind !== 'concept' && mode === 'lesson' && (
              <button
                className="btn btn-ghost shrink-0 !px-4"
                disabled={hintLevel >= 2}
                onClick={() => {
                  play('tap')
                  usedHint.current = true
                  setHintLevel((h) => (h === 0 ? 1 : 2))
                  requestAnimationFrame(() => document.querySelector('aside[aria-label="Hint"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
                }}
              >
                <Lightbulb size={18} /> {hintLevel === 0 ? 'Hint' : hintLevel === 1 ? 'More help' : 'No more hints'}
              </button>
            )}
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
          <div className="anim-rise w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="quit-title">
            <Pip mood="oops" size={72} className="mb-3" />
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
