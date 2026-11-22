// Plays a learner persona through N days and records what the messaging
// engine would send each day. Powers the timeline in the Messaging lab.

import type { Unit } from '../content/types'
import { dayKey } from './dates'
import { decide, facts, type Message, type Tier } from './messaging'
import { currentLesson } from './progress'
import { completeLesson, newLearner, reconcile, type LearnerState, type Motivation } from './state'

export interface Persona {
  id: string
  label: string
  description: string
  /** Lessons done on day i (0 = didn't open the app). */
  lessonsOn: (day: number, weekday: number) => number
}

export const PERSONAS: Persona[] = [
  {
    id: 'steady',
    label: 'Steady',
    description: 'Two lessons every day.',
    lessonsOn: () => 2,
  },
  {
    id: 'weekdays',
    label: 'Weekdays only',
    description: 'Practices Monday to Friday, skips weekends.',
    lessonsOn: (_d, wd) => (wd === 0 || wd === 6 ? 0 : 2),
  },
  {
    id: 'fades',
    label: 'Fades out',
    description: 'Strong first five days, then stops.',
    lessonsOn: (d) => (d < 5 ? 2 : 0),
  },
  {
    id: 'returns',
    label: 'Comes back',
    description: 'One week on, two weeks away, then back.',
    lessonsOn: (d) => (d < 7 || d >= 21 ? 2 : 0),
  },
  {
    id: 'never',
    label: 'Never starts',
    description: 'Signs up and never finishes a lesson.',
    lessonsOn: () => 0,
  },
]

export interface SimDay {
  day: number
  date: string
  lessons: number
  streak: number
  tier: Tier
  freezes: number
  xp: number
  sent: Message[]
  held: { rule: string; channel: string; reason: string }[]
}

export interface SimOptions {
  days: number
  start: Date
  reminderHour: number
  pushEnabled: boolean
  motivation: Motivation
  dailyGoal: number
}

export function simulate(persona: Persona, units: Unit[], o: SimOptions): SimDay[] {
  const start = new Date(o.start)
  start.setHours(9, 0, 0, 0)
  let s: LearnerState = {
    ...newLearner(start),
    onboarded: true,
    reminderHour: o.reminderHour,
    reminderMode: 'fixed',
    pushEnabled: o.pushEnabled,
    motivation: o.motivation,
    dailyGoal: o.dailyGoal,
  }
  const out: SimDay[] = []
  for (let d = 0; d < o.days; d++) {
    const date = new Date(start)
    date.setDate(start.getDate() + d)
    const today = dayKey(date)
    // Overnight job: apply streak freezes for missed days.
    s = reconcile(s, today)

    const n = persona.lessonsOn(d, date.getDay())
    const sent: Message[] = []
    const held: SimDay['held'] = []
    if (n > 0) {
      // Learner opens the app at noon: banners they see first.
      const noon = new Date(date)
      noon.setHours(12, 0, 0, 0)
      const opened = decide(facts(s, units, noon), s.messages)
      sent.push(...opened.sent.filter((m) => m.channel === 'banner'))
      for (let i = 0; i < n; i++) {
        const cur = currentLesson(units, s)
        const id = cur?.lesson.id ?? `practice-${d}-${i}`
        noon.setMinutes(5 + i * 5)
        ;[s] = completeLesson(s, id, i % 2 ? 1 : 0.8, noon)
      }
    }
    // Scheduled job at the learner's reminder hour sends push and email.
    const evening = new Date(date)
    evening.setHours(o.reminderHour, 0, 0, 0)
    const f = facts(s, units, evening)
    const decision = decide(f, s.messages)
    const outbound = decision.sent.filter((m) => m.channel !== 'banner')
    sent.push(...outbound)
    held.push(...decision.held.filter((h) => h.channel !== 'banner'))
    s = {
      ...s,
      messages: [
        ...s.messages,
        ...outbound.map((m) => ({ rule: m.rule, key: m.key, channel: m.channel, at: evening.toISOString() })),
      ],
    }
    out.push({
      day: d,
      date: today,
      lessons: n,
      streak: f.streak,
      tier: f.tier,
      freezes: s.freezes,
      xp: s.xp,
      sent,
      held,
    })
  }
  return out
}
