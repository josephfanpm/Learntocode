import { Bell, Mail, PanelTop } from 'lucide-react'
import { useMemo, useState } from 'react'
import { units } from '../content'
import type { Channel } from '../engine/state'
import { decide, facts, RULES, TIER_INFO, type Message, type Tier } from '../engine/messaging'
import { PERSONAS, simulate } from '../engine/simulate'
import { useStore } from '../store'
import { hourLabel, HOURS } from './Onboarding'
import { MOODS, Pip, type Mood } from './Pip'

const CH: Record<Channel, { icon: typeof Bell; label: string; color: string }> = {
  banner: { icon: PanelTop, label: 'In-app', color: '#2d5be3' },
  push: { icon: Bell, label: 'Push', color: '#ff7a1a' },
  email: { icon: Mail, label: 'Email', color: '#7a4ff0' },
}

const PIP_USES: Record<Mood, string> = {
  happy: 'Profile on a day you’ve practiced, freeze saved your streak',
  wave: 'Welcome screen, first lesson, welcome back',
  cheer: 'Right answer, close to your daily goal',
  oops: 'Wrong answer, leaving a lesson, lost streak',
  think: 'Placement test, stuck on a lesson',
  sleepy: 'Profile when you haven’t practiced today',
  celebrate: 'Lesson done, placement result, milestones',
}

const TIER_COLOR: Record<Tier, string> = {
  new: '#2d5be3',
  active: '#12935a',
  casual: '#d6a200',
  slipping: '#ff7a1a',
  dormant: '#8691ad',
}

function ChannelTag({ ch }: { ch: Channel }) {
  const { icon: Icon, label, color } = CH[ch]
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-white" style={{ background: color }}>
      <Icon size={12} /> {label}
    </span>
  )
}

function Preview({ m }: { m: Message }) {
  if (m.channel === 'push')
    return (
      <div className="rounded-2xl bg-ink/90 p-3 text-white shadow-lg">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="size-4 rounded bg-cobalt" /> ByteQuest · now
        </div>
        <p className="mt-1 font-semibold">{m.title}</p>
        <p className="text-sm text-white/85">{m.body}</p>
      </div>
    )
  if (m.channel === 'email')
    return (
      <div className="rounded-2xl border-2 border-rule bg-white">
        <div className="border-b-2 border-rule px-4 py-2 text-xs text-ink-3">Subject: <span className="font-medium text-ink">{m.title}</span></div>
        <div className="space-y-3 p-4 text-sm">
          <p>{m.body}</p>
          {m.cta && <span className="inline-block rounded-lg bg-cobalt px-3 py-1.5 font-semibold text-white">{m.cta.label}</span>}
        </div>
      </div>
    )
  return (
    <div className="rounded-2xl border-2 border-rule bg-white p-4">
      <p className="font-display font-bold">{m.title}</p>
      <p className="text-sm text-ink-2">{m.body}</p>
    </div>
  )
}

export function Lab() {
  const { s } = useStore()
  const now = new Date()
  const f = facts(s, units, now)
  const live = decide(f, s.messages, s.dismissed)

  const [persona, setPersona] = useState(PERSONAS[2].id)
  const [push, setPush] = useState(true)
  const [hour, setHour] = useState(19)
  const [open, setOpen] = useState<string | null>(null)
  const sim = useMemo(
    () =>
      simulate(PERSONAS.find((p) => p.id === persona)!, units, {
        days: 42,
        start: new Date(2026, 0, 5),
        reminderHour: hour,
        pushEnabled: push,
        motivation: 'career',
        dailyGoal: 20,
      }),
    [persona, push, hour],
  )
  const counts = sim.reduce(
    (a, d) => {
      for (const m of d.sent) a[m.channel]++
      return a
    },
    { banner: 0, push: 0, email: 0 } as Record<Channel, number>,
  )

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-6 pb-24">
      <header>
        <h1 className="text-4xl font-extrabold">Messaging lab</h1>
        <p className="mt-2 max-w-prose text-ink-2">
          Every reminder, banner and email comes from {RULES.length} rules that read the learner’s activity. Each message is sent at most once,
          push is capped at one a day, email at one every three days, and someone who stays away for 30 days stops hearing from us.
        </p>
      </header>

      <section aria-labelledby="sim">
        <h2 id="sim" className="text-2xl font-bold">Play a learner through six weeks</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {PERSONAS.map((p) => (
            <button key={p.id} aria-pressed={persona === p.id} onClick={() => setPersona(p.id)} className="tile px-3 py-2 text-sm font-medium">
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-2">{PERSONAS.find((p) => p.id === persona)!.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="size-4 accent-cobalt" /> Notifications allowed
          </label>
          <label className="flex items-center gap-2">
            Reminder at
            <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="rounded-lg border-2 border-rule bg-white px-2 py-1">
              {HOURS.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
            </select>
          </label>
          <span className="text-ink-3">
            Sent: {counts.push} push · {counts.email} email · {counts.banner} in-app
          </span>
        </div>

        <ol className="mt-5 overflow-hidden rounded-2xl border-2 border-rule bg-white">
          {sim.map((d) => {
            const date = new Date(d.date + 'T12:00')
            return (
              <li key={d.day} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-rule px-3 py-2 last:border-0 sm:grid-cols-[5.5rem_7rem_1fr]">
                <div className="text-sm">
                  <span className="font-medium">Day {d.day + 1}</span>
                  <span className="block text-xs text-ink-3">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                </div>
                <div className="hidden items-center gap-2 text-sm sm:flex">
                  <span className={`size-3 rounded-full ${d.lessons ? 'bg-flame' : 'bg-rule'}`} title={d.lessons ? `${d.lessons} lessons` : 'No practice'} />
                  <span className="tabular-nums">🔥{d.streak}</span>
                  <span className="rounded px-1 text-[0.7rem] font-semibold text-white" style={{ background: TIER_COLOR[d.tier] }}>{d.tier}</span>
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs sm:hidden">
                    <span className={`size-2.5 rounded-full ${d.lessons ? 'bg-flame' : 'bg-rule'}`} />🔥{d.streak}
                    <span className="rounded px-1 font-semibold text-white" style={{ background: TIER_COLOR[d.tier] }}>{d.tier}</span>
                  </div>
                  {d.sent.length === 0 && <span className="text-sm text-ink-3">—</span>}
                  {d.sent.map((m) => {
                    const id = `${d.day}-${m.rule}`
                    return (
                      <div key={id}>
                        <button onClick={() => setOpen(open === id ? null : id)} className="flex w-full items-start gap-2 text-left text-sm hover:underline" aria-expanded={open === id}>
                          <ChannelTag ch={m.channel} />
                          <span className="min-w-0">{m.title}</span>
                        </button>
                        {open === id && (
                          <div className="my-2 max-w-sm space-y-2">
                            <Preview m={m} />
                            <p className="text-xs text-ink-3">Rule <code>{m.rule}</code>: {m.why}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-2 text-xs text-ink-3">
          The learner opens the app at noon on practice days and sees in-app banners. Push and email are decided once a day at the reminder time. Streak freezes apply overnight.
        </p>
      </section>

      <section aria-labelledby="you">
        <h2 id="you" className="text-2xl font-bold">You, right now</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border-2 border-rule bg-white p-4 text-sm sm:grid-cols-3">
          {[
            ['Group', <span key="t"><span className="rounded px-1.5 font-semibold text-white" style={{ background: TIER_COLOR[f.tier] }}>{f.tier}</span> <span className="text-ink-3">{TIER_INFO[f.tier]}</span></span>],
            ['Streak', `${f.streak} days`],
            ['Practiced today', f.practicedToday ? 'Yes' : 'No'],
            ['Days away', f.daysAway ?? 'Never practiced'],
            ['Active days, last 7', f.activeDaysLast7],
            ['Lessons done', f.lessonsDone],
            ['Freezes', f.freezes],
            ['Notifications', f.pushEnabled ? 'On' : 'Off'],
            ['Reminder', hourLabel(f.reminderHour)],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-ink-3">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {live.sent.map((m) => (
            <div key={m.key} className="space-y-1.5">
              <ChannelTag ch={m.channel} />
              <Preview m={m} />
              <p className="text-xs text-ink-3">{m.why}</p>
            </div>
          ))}
          {live.sent.length === 0 && <p className="text-sm text-ink-3">Nothing would be sent right now.</p>}
        </div>
        {live.held.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-ink-2">
            {live.held.map((h) => (
              <li key={h.rule}>
                Held back: <code>{h.rule}</code> ({h.reason})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="pip">
        <h2 id="pip" className="text-2xl font-bold">Pip’s expressions</h2>
        <p className="mt-1 text-sm text-ink-2">The mascot, and where each mood shows up.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOODS.map((m) => (
            <li key={m} className="flex flex-col items-center rounded-2xl border-2 border-rule bg-white p-4 text-center">
              <Pip mood={m} size={84} />
              <p className="mt-2 font-display font-bold capitalize">{m}</p>
              <p className="text-xs text-ink-3">{PIP_USES[m]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules">
        <h2 id="rules" className="text-2xl font-bold">All rules</h2>
        <p className="mt-1 text-sm text-ink-2">The number is priority: higher wins when a cap allows only one message.</p>
        <ul className="mt-4 divide-y divide-rule rounded-2xl border-2 border-rule bg-white">
          {RULES.map((r) => (
            <li key={r.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_12rem_1fr] sm:gap-3">
              <span><ChannelTag ch={r.channel} /></span>
              <span className="font-mono text-xs leading-6">
                {r.id} <span className="text-ink-3">· {r.priority}</span>
              </span>
              <span className="text-sm text-ink-2">{r.about}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
