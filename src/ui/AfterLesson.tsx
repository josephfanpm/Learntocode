import { Check, Flame } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Lesson } from '../content/types'
import { addDays, dayKey, parseDay } from '../engine/dates'
import type { LessonResult } from '../engine/state'
import { play } from '../sound'
import { useStore } from '../store'
import { Dices } from 'lucide-react'
import { Avatar, randomAvatar } from './Avatar'
import { Pip, useReducedMotion } from './Pip'

// What happens after a lesson, in order:
//   1. Lesson done: stats count up, pixel confetti.
//   2. Streak (only when today extended it): the flame lights, the number
//      ticks up, today fills in on the week row.
//   3. Create your profile (once, after the first lesson, skippable).

/** Count from `from` to `to` over `ms`, after `delay`. */
function useCountUp(to: number, { from = 0, ms = 700, delay = 0 } = {}): number {
  const reduce = useReducedMotion()
  const [v, setV] = useState(reduce ? to : from)
  useEffect(() => {
    if (reduce) return setV(to)
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ms))
      // ease-out cubic
      setV(Math.round(from + (to - from) * (1 - (1 - t) ** 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, from, ms, delay, reduce])
  return v
}

const CONFETTI = ['#2d5be3', '#ff7a1a', '#ffd166', '#12935a', '#c2378b', '#7a4ff0']

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        d: 1.8 + Math.random() * 1.4,
        c: CONFETTI[i % CONFETTI.length],
      })),
    [],
  )
  return (
    <div aria-hidden>
      {bits.map((b, i) => (
        <span key={i} className="confetti" style={{ left: `${b.left}%`, background: b.c, ['--delay' as string]: `${b.delay}s`, ['--d' as string]: `${b.d}s` }} />
      ))}
    </div>
  )
}

const stagger = (i: number) => ({ ['--i' as string]: i })

function Done({ result, lesson, onNext }: { result: { r: LessonResult; accuracy: number; notes?: string[] }; lesson: Lesson; onNext: () => void }) {
  const { r, accuracy } = result
  const { s } = useStore()
  const today = s.activity[dayKey(new Date())]?.xp ?? 0
  const xp = useCountUp(r.xp, { delay: 300 })
  const acc = useCountUp(Math.round(accuracy * 100), { delay: 450 })
  useEffect(() => play('complete'), [])
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <Confetti />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Pip mood="celebrate" size={130} className="mb-4" />
        <p className="text-ink-3">{lesson.title}</p>
        <h1 className="pixel rise-in mt-3 text-[1.5rem] text-gold" style={{ textShadow: '0 4px 0 #060817' }}>LESSON DONE</h1>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <div className="rise-in rounded-2xl border-2 border-rule bg-card p-4" style={stagger(1)}>
            <p className="text-sm text-ink-3">XP earned</p>
            <p className="font-display text-4xl font-bold text-cobalt tabular-nums">+{xp}</p>
          </div>
          <div className="rise-in rounded-2xl border-2 border-rule bg-card p-4" style={stagger(2)}>
            <p className="text-sm text-ink-3">First-try accuracy</p>
            <p className="font-display text-4xl font-bold text-good tabular-nums">{acc}%</p>
          </div>
        </div>
        <div className="rise-in mt-3 w-full rounded-2xl border-2 border-rule bg-card p-4 text-left" style={stagger(3)}>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Daily goal</span>
            <span className="text-ink-2">{Math.min(today, s.dailyGoal)} / {s.dailyGoal} XP</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-rule">
            <div className="h-full rounded-full bg-flame" style={{ width: `${Math.min(100, (today / s.dailyGoal) * 100)}%` }} />
          </div>
          {r.goalHit && <p className="mt-2 text-sm font-medium text-gem">Goal reached. +20 bonus gems.</p>}
        </div>
        {!!result.notes?.length && (
          <ul className="rise-in mt-3 w-full space-y-1 rounded-2xl border-2 border-gold/40 bg-card p-4 text-left text-sm font-medium text-gold" style={stagger(4)}>
            {result.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
      </div>
      <button className="btn mt-8 w-full" autoFocus onClick={onNext}>Continue</button>
    </div>
  )
}

function StreakScreen({ r, onNext }: { r: LessonResult; onNext: () => void }) {
  const { s } = useStore()
  const n = useCountUp(r.streakAfter, { from: r.streakBefore, ms: 500, delay: 650 })
  useEffect(() => {
    const id = setTimeout(() => play('streak'), 400)
    return () => clearTimeout(id)
  }, [])
  const today = dayKey(new Date())
  const monday = addDays(today, -((parseDay(today).getDay() + 6) % 7))
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Flame className="ignite text-flame" size={120} fill="currentColor" strokeWidth={1.5} />
        <p className="pixel mt-4 text-6xl leading-none text-flame tabular-nums" style={{ textShadow: '0 5px 0 #060817' }}>{n}</p>
        <h1 className="pixel mt-4 text-sm text-white">DAY STREAK</h1>
        <ol className="rise-in mt-8 flex w-full justify-between rounded-2xl border-2 border-rule bg-card p-4" style={stagger(2)} aria-label="This week">
          {week.map((d) => {
            const done = (s.activity[d]?.xp ?? 0) > 0
            const isToday = d === today
            return (
              <li key={d} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs ${isToday ? 'font-bold text-flame' : 'text-ink-3'}`}>{'MTWTFSS'[(parseDay(d).getDay() + 6) % 7]}</span>
                <span className={`grid size-8 place-items-center rounded-full ${done ? 'bg-flame text-white' : 'bg-rule'} ${isToday ? 'day-fill' : ''}`}>
                  {done && <Check size={16} strokeWidth={3} />}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="rise-in mt-4 text-ink-2" style={stagger(3)}>
          {r.streakAfter === 1 ? 'Your streak has started. Practice tomorrow to make it two.' : 'Practice again tomorrow to keep it going.'}
        </p>
      </div>
      <button className="btn mt-8 w-full" autoFocus onClick={onNext}>Continue</button>
    </div>
  )
}

function ProfilePrompt({ onAvatar, onLater }: { onAvatar: () => void; onLater: () => void }) {
  const { s, update } = useStore()
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex items-start gap-3">
          <Pip mood="wave" size={84} className="shrink-0" />
          <p className="bubble mt-2 font-medium">Nice first lesson. Here’s your avatar. What should I call you?</p>
        </div>
        <h1 className="mt-8 text-3xl font-bold">Create your profile</h1>
        <div className="mt-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar avatar={s.avatar} size={84} className="border-4 border-white shadow-[0_5px_0_var(--color-rule)]" />
            <button
              aria-label="Shuffle avatar"
              title="Shuffle"
              onClick={() => update((p) => ({ ...p, avatar: randomAvatar() }))}
              className="absolute -right-2 -bottom-2 grid size-8 place-items-center rounded-full border-2 border-white bg-cobalt text-white"
            >
              <Dices size={15} />
            </button>
          </div>
          <input
            value={s.name}
            onChange={(e) => update((p) => ({ ...p, name: e.target.value }))}
            maxLength={30}
            placeholder="First name"
            aria-label="First name"
            className="min-w-0 flex-1 rounded-xl border-2 border-rule bg-card px-4 py-3.5 text-lg outline-none focus:border-cobalt"
          />
        </div>
        <div className="mt-8 grid gap-3">
          <button className="btn w-full" onClick={onLater}>Looks good</button>
          <button className="btn btn-ghost w-full" onClick={onAvatar}>Customise my avatar</button>
        </div>
      </div>
    </div>
  )
}

export function AfterLesson({
  result,
  lesson,
  saved,
  onExit,
  onAvatar,
}: {
  result: { r: LessonResult; accuracy: number; notes?: string[] }
  lesson: Lesson
  /** False in review mode (?at=), where nothing was recorded. */
  saved: boolean
  onExit: () => void
  onAvatar: () => void
}) {
  const { s, update } = useStore()
  const [phase, setPhase] = useState<'done' | 'streak' | 'profile'>('done')
  const grew = saved && result.r.streakAfter > result.r.streakBefore
  const askProfile = saved && !s.profilePrompted && Object.keys(s.completed).length === 1

  const afterStreak = () => {
    if (askProfile) setPhase('profile')
    else onExit()
  }
  const closeProfile = (next: () => void) => {
    update((p) => ({ ...p, profilePrompted: true, name: p.name.trim() }))
    next()
  }

  if (phase === 'done') return <Done result={result} lesson={lesson} onNext={() => (grew ? setPhase('streak') : afterStreak())} />
  if (phase === 'streak') return <StreakScreen r={result.r} onNext={afterStreak} />
  return <ProfilePrompt onAvatar={() => closeProfile(onAvatar)} onLater={() => closeProfile(onExit)} />
}
