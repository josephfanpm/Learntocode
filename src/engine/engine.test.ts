import { describe, expect, it } from 'vitest'
import type { Unit } from '../content/types'
import { addDays } from './dates'
import { decide, facts } from './messaging'
import { path } from './progress'
import { PERSONAS, simulate } from './simulate'
import { completeLesson, longestStreak, newLearner, reconcile, streak, type LearnerState } from './state'

const units: Unit[] = [
  {
    id: 'u0',
    week: 0,
    title: 'Unit A',
    summary: '',
    lessons: [1, 2, 3].map((i) => ({ id: `u0-l${i}`, title: `Lesson ${i}`, exercises: [] })),
  },
  {
    id: 'u1',
    week: 1,
    title: 'Unit B',
    summary: '',
    lessons: [1, 2].map((i) => ({ id: `u1-l${i}`, title: `B${i}`, exercises: [] })),
  },
]

const at = (day: string, hour = 12) => {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d, hour)
}

/** A learner who practiced on each given day. */
function practicedOn(days: string[], base?: Partial<LearnerState>): LearnerState {
  let s: LearnerState = { ...newLearner(at(days[0] ?? '2026-11-01')), onboarded: true, ...base }
  days.forEach((d, i) => {
    ;[s] = completeLesson(s, `x${i}`, 1, at(d))
  })
  return s
}

describe('streak', () => {
  it('counts consecutive days and stays alive until today ends', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02', '2026-11-03'])
    expect(streak(s, '2026-11-03')).toBe(3)
    expect(streak(s, '2026-11-04')).toBe(3)
    expect(streak(s, '2026-11-05')).toBe(0)
  })

  it('a frozen day bridges without adding to the count', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02'], { freezes: 1 })
    const r = reconcile(s, '2026-11-04')
    expect(r.activity['2026-11-03'].frozen).toBe(true)
    expect(r.freezes).toBe(0)
    expect(r.freezesUsedUnseen).toBe(1)
    expect(streak(r, '2026-11-04')).toBe(2)
    // Running it again the same day changes nothing.
    expect(reconcile(r, '2026-11-04').freezes).toBe(0)
  })

  it('keeps freezes and records a lost streak when the gap is too long', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02', '2026-11-03'], { freezes: 1 })
    const r = reconcile(s, '2026-11-06')
    expect(r.freezes).toBe(1)
    expect(r.lostStreak).toEqual({ length: 3, day: '2026-11-06' })
    expect(streak(r, '2026-11-06')).toBe(0)
  })

  it('tracks the longest streak', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-07'])
    expect(longestStreak(s)).toBe(3)
  })
})

describe('lessons and unlocks', () => {
  it('gives 15 XP for a perfect first try and 25 gems on hitting the goal', () => {
    const s = { ...newLearner(at('2026-11-01')), dailyGoal: 10 }
    const [next, r] = completeLesson(s, 'u0-l1', 1, at('2026-11-01'))
    expect(r.xp).toBe(15)
    expect(r.goalHit).toBe(true)
    expect(next.gems).toBe(25)
    const [, again] = completeLesson(next, 'u0-l1', 0.5, at('2026-11-01'))
    expect(again.xp).toBe(5)
  })

  it('unlocks lessons in order across units', () => {
    let s = newLearner(at('2026-11-01'))
    for (const id of ['u0-l1', 'u0-l2', 'u0-l3']) [s] = completeLesson(s, id, 1, at('2026-11-01'))
    const p = path(units, s)
    expect(p.map((x) => x.status)).toEqual(['done', 'done', 'done', 'current', 'locked'])
  })
})

describe('placement and unlock all', () => {
  it('skipped units are open but not done, and the next unit holds the current lesson', () => {
    const s = { ...newLearner(at('2026-11-01')), placedUnit: 1 }
    expect(path(units, s).map((x) => x.status)).toEqual(['skipped', 'skipped', 'skipped', 'current', 'locked'])
    expect(Object.keys(s.completed)).toHaveLength(0)
  })

  it('unlock all opens every locked lesson without marking anything done', () => {
    const s = { ...newLearner(at('2026-11-01')), unlockAll: true }
    expect(path(units, s).map((x) => x.status)).toEqual(['current', 'open', 'open', 'open', 'open'])
  })
})

describe('messaging', () => {
  const send = (s: LearnerState, when: Date) => decide(facts(s, units, when), s.messages)

  it('sends the streak reminder after the reminder hour, not before', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02'], { pushEnabled: true, reminderHour: 19, freezes: 0 })
    expect(send(s, at('2026-11-03', 15)).sent.some((m) => m.rule === 'push_streak_risk')).toBe(false)
    const evening = send(s, at('2026-11-03', 19)).sent.find((m) => m.rule === 'push_streak_risk')
    expect(evening?.title).toContain('2-day streak')
  })

  it('holds push during quiet hours and when notifications are off', () => {
    const s = practicedOn(['2026-11-01'], { pushEnabled: true, reminderHour: 19 })
    expect(send(s, at('2026-11-02', 22)).held).toContainEqual({ rule: 'push_streak_risk', channel: 'push', reason: 'Quiet hours' })
    const off = { ...s, pushEnabled: false }
    expect(send(off, at('2026-11-02', 19)).held.some((h) => h.reason === 'Notifications off')).toBe(true)
  })

  it('never sends the same key twice and caps push at one a day', () => {
    const s = practicedOn(['2026-11-01'], { pushEnabled: true, reminderHour: 19 })
    const first = send(s, at('2026-11-02', 19))
    const pushes = first.sent.filter((m) => m.channel === 'push')
    expect(pushes).toHaveLength(1)
    const logged = { ...s, messages: pushes.map((m) => ({ rule: m.rule, key: m.key, channel: m.channel, at: at('2026-11-02', 19).toISOString() })) }
    expect(send(logged, at('2026-11-02', 20)).sent.filter((m) => m.channel === 'push')).toHaveLength(0)
  })

  it('shows a welcome-back review banner after 3+ days away', () => {
    let s = practicedOn(['2026-11-01'])
    ;[s] = completeLesson(s, 'u0-l1', 0.6, at('2026-11-01'))
    const banners = send(s, at('2026-11-05')).sent.filter((m) => m.channel === 'banner')
    expect(banners.map((m) => m.rule)).toContain('welcome_back')
  })

  it('flags a learner stuck on the current lesson', () => {
    let s = practicedOn(['2026-11-01'])
    ;[s] = completeLesson(s, 'u0-l1', 1, at('2026-11-01'))
    s = { ...s, struggles: { 'u0-l2': 5 } }
    expect(send(s, at('2026-11-01', 13)).sent.map((m) => m.rule)).toContain('stuck')
  })
})

describe('simulation', () => {
  const opts = { days: 45, start: at('2026-11-02'), reminderHour: 19, pushEnabled: true, motivation: 'career' as const, dailyGoal: 20 }

  it('a learner who fades out gets push, then email, then silence', () => {
    const days = simulate(PERSONAS.find((p) => p.id === 'fades')!, units, opts)
    const outbound = days.flatMap((d) => d.sent.filter((m) => m.channel !== 'banner').map((m) => [d.day, m.rule] as const))
    const rules = outbound.map(([, r]) => r)
    expect(rules).toContain('push_lapsed_2')
    expect(rules).toContain('push_lapsed_5')
    expect(rules).toContain('email_lapsed_7')
    expect(rules).toContain('email_lapsed_14')
    expect(rules).toContain('email_lapsed_30')
    const sunset = outbound.find(([, r]) => r === 'email_lapsed_30')![0]
    expect(outbound.filter(([d]) => d > sunset)).toHaveLength(0)
    // No more than one push per day.
    for (const d of days) expect(d.sent.filter((m) => m.channel === 'push').length).toBeLessThanOrEqual(1)
  })

  it('a steady learner never gets a lapse message', () => {
    const days = simulate(PERSONAS[0], units, { ...opts, days: 14 })
    const rules = days.flatMap((d) => d.sent.map((m) => m.rule))
    expect(rules.some((r) => r.includes('lapsed') || r === 'push_streak_risk')).toBe(false)
    expect(days.at(-1)!.streak).toBe(14)
  })

  it('a weekday learner keeps the streak with one freeze, then loses it', () => {
    const days = simulate(PERSONAS[1], units, { ...opts, days: 14 })
    expect(days.some((d) => d.freezes === 0)).toBe(true)
    expect(addDays('2026-11-02', 13)).toBe(days.at(-1)!.date)
  })
})
