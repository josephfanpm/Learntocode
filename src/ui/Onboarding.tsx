import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { units } from '../content'
import type { Motivation } from '../engine/state'
import { useStore } from '../store'
import type { Go } from './Home'
import { Pip } from './Pip'
import { Placement } from './Placement'

const WHYS: { id: Motivation; label: string }[] = [
  { id: 'career', label: 'Change careers or get a new job' },
  { id: 'work', label: 'Get more done at my current job' },
  { id: 'build', label: 'Build my own app or website' },
  { id: 'curious', label: 'I’m curious how it all works' },
]

export const GOALS = [
  { xp: 10, label: 'Light', note: '1 lesson a day, about 3 minutes' },
  { xp: 20, label: 'Steady', note: '2 lessons a day, about 7 minutes' },
  { xp: 30, label: 'Focused', note: '3 lessons a day, about 10 minutes' },
  { xp: 50, label: 'All in', note: '5 lessons a day, about 20 minutes' },
]

export const HOURS = [8, 12, 17, 19, 21]
export const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`

export function Onboarding({ go }: { go: Go }) {
  const { update } = useStore()
  const [step, setStep] = useState(0)
  const [why, setWhy] = useState<Motivation | null>(null)
  const [goal, setGoal] = useState(20)
  const [hour, setHour] = useState(19)
  const [name, setName] = useState('')
  const [placed, setPlaced] = useState(0)

  const finish = async (askPush: boolean) => {
    let push = false
    if (askPush && typeof Notification !== 'undefined') push = (await Notification.requestPermission()) === 'granted'
    update((s) => ({ ...s, onboarded: true, motivation: why ?? 'curious', dailyGoal: goal, reminderHour: hour, name: name.trim(), pushEnabled: push, placedUnit: placed }))
    go(`/lesson/${units[placed].lessons[0].id}`)
  }

  const lessons = units.reduce((a, u) => a + u.lessons.length, 0)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
      {step > 0 && step !== 2 && (
        <button aria-label="Back" onClick={() => setStep(step - 1)} className="-ml-1 self-start rounded-lg p-1 text-ink-3 hover:text-ink">
          <ArrowLeft size={24} />
        </button>
      )}
      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <Pip mood="wave" size={130} className="mb-6" />
            <h1 className="text-5xl leading-[1.02] font-extrabold">Learn to code from zero.</h1>
            <p className="mt-4 text-lg text-ink-2">
              A few minutes a day. {lessons} short lessons that follow Harvard’s CS50, from how computers think to building web pages. No experience or setup needed.
            </p>
          </div>
          <button className="btn mt-10 w-full" onClick={() => setStep(1)}>Get started</button>
        </div>
      )}
      {step === 1 && (
        <Step title="What brings you here?" onNext={() => setStep(2)} canNext={!!why}>
          {WHYS.map((w) => (
            <button key={w.id} aria-pressed={why === w.id} onClick={() => setWhy(w.id)} className="tile w-full px-4 py-4 text-left font-medium">
              {w.label}
            </button>
          ))}
        </Step>
      )}
      {step === 2 && (
        <Placement
          onDone={(n) => {
            setPlaced(n)
            setStep(3)
          }}
        />
      )}
      {step === 3 && (
        <Step title="Pick a daily goal" sub="You can change it any time." onNext={() => setStep(4)} canNext>
          {GOALS.map((g) => (
            <button key={g.xp} aria-pressed={goal === g.xp} onClick={() => setGoal(g.xp)} className="tile flex w-full items-center justify-between px-4 py-3.5 text-left">
              <span>
                <span className="block font-semibold">{g.label}</span>
                <span className="text-sm text-ink-2">{g.note}</span>
              </span>
              <span className="font-display font-bold text-ink-2">{g.xp} XP</span>
            </button>
          ))}
        </Step>
      )}
      {step === 4 && (
        <Step title="When should we remind you?" sub="One reminder, only on days you haven’t practiced yet." onNext={() => setStep(5)} canNext>
          <div className="grid grid-cols-3 gap-2.5">
            {HOURS.map((h) => (
              <button key={h} aria-pressed={hour === h} onClick={() => setHour(h)} className="tile py-3.5 font-semibold">
                {hourLabel(h)}
              </button>
            ))}
          </div>
        </Step>
      )}
      {step === 5 && (
        <div className="flex flex-1 flex-col justify-center">
          <h1 className="text-3xl font-bold">What should we call you?</h1>
          <p className="mt-1 text-ink-2">Optional.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="First name"
            autoFocus
            className="mt-6 w-full rounded-xl border-2 border-rule bg-white px-4 py-3.5 text-lg outline-none focus:border-cobalt"
          />
          <div className="mt-8 grid gap-3">
            {typeof Notification !== 'undefined' && Notification.permission !== 'denied' ? (
              <>
                <button className="btn w-full" onClick={() => finish(true)}>Turn on reminders and start</button>
                <button className="btn btn-ghost w-full" onClick={() => finish(false)}>Start without reminders</button>
              </>
            ) : (
              <button className="btn w-full" onClick={() => finish(false)}>Start lesson one</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Step({ title, sub, children, onNext, canNext }: { title: string; sub?: string; children: React.ReactNode; onNext: () => void; canNext: boolean }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      {sub && <p className="mt-1 text-ink-2">{sub}</p>}
      <div className="mt-6 space-y-3">{children}</div>
      <button className="btn mt-8 w-full" disabled={!canNext} onClick={onNext}>
        Continue
      </button>
    </div>
  )
}
