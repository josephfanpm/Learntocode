import { ArrowLeft, Bell, Code2, Flame, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COURSES, courseUnits, type CourseId } from '../content'
import type { Motivation } from '../engine/state'
import { play } from '../sound'
import { useStore } from '../store'
import { randomAvatar } from './Avatar'
import type { Go } from './Home'
import { Pip, type Mood } from './Pip'
import { Scene, Sparkles } from './scene'
import { Placement } from './Placement'

// Setup, in the order that gets people to a first lesson fastest:
// welcome → Pip says hi → how you heard (skippable) → why → what you'll be
// able to do → daily goal → reminders → starting point → lesson one.
// Name and avatar are asked after the first lesson, not before it.

const SOURCES = ['A friend or family member', 'Social media', 'Search', 'A video or podcast', 'Work or school', 'Somewhere else']

const WHYS: { id: Motivation; label: string; reply: string }[] = [
  { id: 'career', label: 'Change careers or get a new job', reply: 'Good plan. Every lesson is a step toward it.' },
  { id: 'work', label: 'Get more done at my current job', reply: 'Smart. A little code saves a lot of clicking.' },
  { id: 'build', label: 'Build my own app or website', reply: 'Love it. We’ll get you building.' },
  { id: 'curious', label: 'I’m curious how it all works', reply: 'Same here. Curiosity is the best reason.' },
]

export const GOALS = [
  { xp: 10, label: 'Light', note: '1 lesson a day, about 3 minutes' },
  { xp: 20, label: 'Steady', note: '2 lessons a day, about 7 minutes' },
  { xp: 30, label: 'Focused', note: '3 lessons a day, about 10 minutes' },
  { xp: 50, label: 'All in', note: '5 lessons a day, about 20 minutes' },
]

export const HOURS = [8, 12, 17, 19, 21]
export const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`

type Level = 'new' | 'some' | 'can' | 'pro'

/** How much coding the learner says they have done, and the course it points to. */
const LEVELS: { id: Level; label: string; note: string; course: CourseId }[] = [
  { id: 'new', label: 'None yet', note: 'I’m starting from zero', course: 'cs' },
  { id: 'some', label: 'Some', note: 'A course, a tutorial or hobby projects', course: 'cs' },
  { id: 'can', label: 'I can program', note: 'But I haven’t worked as a developer', course: 'dev' },
  { id: 'pro', label: 'I write code for work', note: 'I’m a working developer', course: 'ai' },
]

const STEPS = 9

export function Onboarding({ go }: { go: Go }) {
  const { update } = useStore()
  const [step, setStep] = useState(0)
  const [source, setSource] = useState<string | null>(null)
  const [why, setWhy] = useState<Motivation | null>(null)
  const [goal, setGoal] = useState(20)
  const [push, setPush] = useState(false)
  const [course, setCourse] = useState<CourseId>('cs')
  const [level, setLevel] = useState<Level | null>(null)
  // The answer only sets the suggested course; the placement quiz decides where in it to start.
  const suggested = LEVELS.find((l) => l.id === level)?.course ?? 'cs'
  const next = () => setStep((s) => s + 1)

  // Tap sound on every option tile in setup, including the placement quiz.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest('.tile')
      if (t && !(t as HTMLButtonElement).disabled) play('tap')
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  const finish = (placed: number) => {
    const units = courseUnits(course)
    update((s) => ({
      ...s,
      onboarded: true,
      motivation: why ?? 'curious',
      dailyGoal: goal,
      reminderMode: 'smart',
      pushEnabled: push,
      course,
      placed: { ...s.placed, [course]: placed },
      source: source ?? undefined,
      // Everyone starts with a random pixel avatar; they can change it after lesson one.
      avatar: s.avatar ?? randomAvatar(),
    }))
    go(`/lesson/${units[Math.min(placed, units.length - 1)].lessons[0].id}`)
  }

  const askPush = async () => {
    if (typeof Notification !== 'undefined') setPush((await Notification.requestPermission()) === 'granted')
    next()
  }

  if (step === 0)
    return (
      <Scene kind="mountain" className="h-dvh w-full">
        <Sparkles />
        <div className="relative mx-auto flex h-full max-w-md flex-col items-center justify-center px-5 pb-[12vh] text-center">
          <div className="rise-in flex w-full flex-col items-center border-4 border-[#060817] bg-[#0b0f24]/85 px-6 py-8 shadow-[0_6px_0_#060817]">
            <p className="pixel text-[0.6rem] tracking-[0.3em] text-[#ffe9b0]">START YOUR</p>
            <h1 className="pixel mt-3 text-[1.9rem] text-white sm:text-[2.4rem]" style={{ textShadow: '0 4px 0 #060817, 4px 0 0 #060817, -4px 0 0 #060817, 0 -4px 0 #060817, 0 8px 0 #c2410c' }}>
              <span className="px-float inline-block">
                <span className="text-gold">Byte</span>Quest
              </span>
            </h1>
            <p className="mt-5 text-lg font-medium text-white">Learn to code, a few minutes a day.</p>
            <button className="btn px-glow mt-6 w-full max-w-xs" onClick={next}>Get started</button>
          </div>
        </div>
      </Scene>
    )

  const whyReply = WHYS.find((w) => w.id === why)?.reply
  const canPush = typeof Notification !== 'undefined' && Notification.permission !== 'denied'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6">
      <header className="flex items-center gap-3">
        <button aria-label="Back" onClick={() => setStep(step - 1)} className="-ml-1 rounded-lg p-1 text-ink-3 hover:text-ink">
          <ArrowLeft size={24} />
        </button>
        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={STEPS}>
          <div className="bar-fill h-full rounded-full bg-cobalt" style={{ width: `${(step / STEPS) * 100}%` }} />
        </div>
      </header>

      {step === 1 && (
        <Talk key={1} mood="wave" say="Hi there. I’m Pip!" onNext={next}>
          <p className="text-lg text-ink-2">A few quick questions, then your first lesson. It takes about a minute.</p>
        </Talk>
      )}

      {step === 2 && (
        <Talk key={2} mood="happy" say="How did you hear about ByteQuest?" onNext={next} canNext={!!source} onSkip={() => { setSource(null); next() }}>
          {SOURCES.map((o) => (
            <button key={o} aria-pressed={source === o} onClick={() => setSource(o)} className="tile w-full px-4 py-3.5 text-left font-medium">
              {o}
            </button>
          ))}
        </Talk>
      )}

      {step === 3 && (
        <Talk key={3} mood={why ? 'cheer' : 'think'} say={whyReply ?? 'Why do you want to learn to code?'} onNext={next} canNext={!!why}>
          {WHYS.map((w) => (
            <button key={w.id} aria-pressed={why === w.id} onClick={() => setWhy(w.id)} className="tile w-full px-4 py-3.5 text-left font-medium">
              {w.label}
            </button>
          ))}
        </Talk>
      )}

      {step === 4 && (
        <Talk key={4} mood="cheer" say="Here’s what you’ll be able to do." onNext={next}>
          {[
            { icon: Code2, title: 'Write real programs', note: 'Python from your first week, run right in the browser' },
            { icon: Globe, title: 'Understand how tech works', note: 'Apps, websites, databases and AI, following Harvard’s CS50' },
            { icon: Flame, title: 'Build a habit that sticks', note: 'Short lessons, a daily streak, and reminders when you want them' },
          ].map(({ icon: Icon, title, note }, i) => (
            <div key={title} className="rise-in flex items-start gap-3 rounded-2xl border-2 border-rule bg-card p-4" style={{ ['--i' as string]: i + 1 }}>
              <Icon className="mt-0.5 shrink-0 text-cobalt" size={24} />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-ink-2">{note}</p>
              </div>
            </div>
          ))}
        </Talk>
      )}

      {step === 5 && (
        <Talk key={5} mood="think" say="What’s your daily goal?" onNext={next}>
          {GOALS.map((g) => (
            <button key={g.xp} aria-pressed={goal === g.xp} onClick={() => setGoal(g.xp)} className="tile flex w-full items-center justify-between px-4 py-3 text-left">
              <span>
                <span className="block font-semibold">{g.label}</span>
                <span className="text-sm text-ink-2">{g.note}</span>
              </span>
              <span className="font-display font-bold text-ink-2">{g.xp} XP</span>
            </button>
          ))}
        </Talk>
      )}

      {step === 6 && (
        <Talk
          key={6}
          mood="happy"
          say="I’ll remind you to practice, so it becomes a habit."
          onNext={canPush ? askPush : next}
          nextLabel={canPush ? 'Remind me' : 'Continue'}
          onSkip={canPush ? next : undefined}
          skipLabel="Not now"
        >
          <div className="flex items-center gap-3 rounded-2xl border-2 border-rule bg-card p-4">
            <Bell className="shrink-0 text-flame" size={24} />
            <p className="text-sm text-ink-2">One reminder a day, around the time you usually practice, and only if you haven’t yet.</p>
          </div>
        </Talk>
      )}

      {step === 7 && (
        <Talk key={7} mood="think" say="How much coding have you done?" onNext={next} canNext={!!level}>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              aria-pressed={level === l.id}
              onClick={() => {
                setLevel(l.id)
                setCourse(l.course)
              }}
              className="tile w-full px-4 py-3 text-left"
            >
              <span className="block font-semibold">{l.label}</span>
              <span className="text-sm text-ink-2">{l.note}</span>
            </button>
          ))}
        </Talk>
      )}

      {step === 8 && (
        <Talk key={8} mood="think" say={level === 'pro' ? 'You already code, so I’d start with AI. Your call.' : level === 'can' ? 'You can program, so I’d start with the job skills. Your call.' : 'What do you want to learn first?'} onNext={next}>
          {COURSES.map((c) => (
            <button key={c.id} aria-pressed={course === c.id} onClick={() => setCourse(c.id)} className="tile w-full px-4 py-3 text-left">
              <span className="flex flex-wrap items-center gap-2 font-semibold">
                {c.title}
                {c.id === suggested && <span className="rounded-md bg-cobalt-soft px-1.5 py-0.5 text-xs font-semibold text-cobalt-deep">{level === 'pro' || level === 'can' ? 'Suggested for you' : 'Start here if you’re new to coding'}</span>}
              </span>
              <span className="text-sm text-ink-2">{c.blurb}</span>
            </button>
          ))}
          <p className="text-sm text-ink-3">You can switch courses any time.</p>
        </Talk>
      )}

      {step === 9 && (
        <Placement
          key={course}
          course={course}
          onDone={finish}
          onSwitch={(to) => setCourse(to)}
        />
      )}
    </div>
  )
}

/** One setup screen: Pip asks in a speech bubble, options below, action under the content. */
function Talk({
  mood,
  say,
  children,
  onNext,
  canNext = true,
  nextLabel = 'Continue',
  onSkip,
  skipLabel = 'Skip',
}: {
  mood: Mood
  say: string
  children: React.ReactNode
  onNext: () => void
  canNext?: boolean
  nextLabel?: string
  onSkip?: () => void
  skipLabel?: string
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-6">
      <div className="flex items-start gap-3">
        <Pip mood={mood} size={84} className="shrink-0" />
        <h1 key={say} className="bubble mt-2 font-sans text-lg leading-snug font-semibold">{say}</h1>
      </div>
      <div className="mt-6 space-y-2.5">{children}</div>
      <div className="mt-7 grid gap-3">
        <button className="btn w-full" disabled={!canNext} onClick={onNext}>{nextLabel}</button>
        {onSkip && <button className="btn btn-ghost w-full" onClick={onSkip}>{skipLabel}</button>}
      </div>
    </div>
  )
}
