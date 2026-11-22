import { describe, expect, it } from 'vitest'
import type { Unit } from '../content/types'
import { addDays } from './dates'
import { decide, facts } from './messaging'
import { conceptHint, nudgeHint } from './hints'
import { badges, path } from './progress'
import { PERSONAS, simulate } from './simulate'
import { completeLesson, exportSave, importSave, longestStreak, newLearner, reconcile, streak, type LearnerState } from './state'

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
  let s: LearnerState = { ...newLearner(at(days[0] ?? '2026-11-01')), onboarded: true, reminderMode: 'fixed', ...base }
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

describe('hints', () => {
  const lesson = {
    id: 'x-1',
    title: 'T',
    exercises: [
      { kind: 'concept' as const, title: 'Loops', body: 'A loop repeats steps.' },
      { kind: 'choice' as const, prompt: 'Q', options: ['a', 'b', 'c', 'd'], answer: 2, explain: '' },
      { kind: 'concept' as const, title: 'Lists', body: 'A list holds many values.' },
      { kind: 'bits' as const, prompt: 'Make 5', target: 5, bits: 4, explain: '' },
    ],
  }

  it('the first hint is the most recent concept card', () => {
    expect(conceptHint(lesson, 1).title).toBe('Loops')
    expect(conceptHint(lesson, 3).title).toBe('Lists')
    expect(conceptHint(lesson, 0).title).toBe('Take it one step at a time')
  })

  it('the second hint narrows things down without giving the answer', () => {
    const choice = nudgeHint(lesson.exercises[1]).body
    expect(choice).toContain('"a"')
    expect(choice).not.toContain('"c"') // the right answer is never named
    expect(nudgeHint(lesson.exercises[3]).body).toBe('You need 2 switches on. The biggest one is the 4.')
    expect(nudgeHint({ kind: 'type', prompt: '', accept: ['hello'], explain: '' }).body).toContain('5 characters')
    expect(nudgeHint({ kind: 'spot', prompt: '', lines: ['a', 'b', 'c', 'd', 'e', 'f'], answer: 4, explain: '' }).body).toBe('Look at lines 4 to 6.')
    expect(nudgeHint({ kind: 'order', prompt: '', lines: ['x = 1', 'y = 2', 'print(x)'], explain: '' }).body).toBe('Start with: `x = 1`')
  })

  it('every exercise in the course has both hints', async () => {
    const { units: all } = await import('../content')
    for (const u of all)
      for (const l of u.lessons)
        l.exercises.forEach((ex, i) => {
          if (ex.kind === 'concept') return
          expect(conceptHint(l, i).body.length).toBeGreaterThan(0)
          expect(nudgeHint(ex).body.length).toBeGreaterThan(0)
        })
  })
})

describe('badges', () => {
  it('start locked and climb bronze, silver, gold', () => {
    const fresh = newLearner(at('2026-11-01'))
    expect(badges(units, fresh, 0).every((b) => b.tier === 'locked')).toBe(true)
    const byId = (st: LearnerState, streakBest: number) => Object.fromEntries(badges(units, st, streakBest).map((b) => [b.id, b]))
    const one = practicedOn(['2026-11-01'])
    expect(byId(one, 1).quest.tier).toBe('gold') // single-step badge goes straight to gold
    expect(byId(one, 1).streak).toMatchObject({ tier: 'locked', value: 1, goal: 3 })
    expect(byId(one, 3).streak).toMatchObject({ tier: 'bronze', goal: 7 })
    expect(byId(one, 8).streak.tier).toBe('silver')
    expect(byId(one, 30).streak).toMatchObject({ tier: 'gold', value: 30, goal: 30 })
    expect(byId(one, 1).perfect.tier).toBe('bronze')
  })
})

describe('save codes', () => {
  it('a save code restores the same progress', () => {
    const s = { ...practicedOn(['2026-11-01', '2026-11-02']), name: 'Zoë' }
    const back = importSave(exportSave(s))
    expect(back).toEqual(s)
    expect(streak(back!, '2026-11-02')).toBe(2)
  })

  it('rejects text that is not a save', () => {
    expect(importSave('hello')).toBeNull()
    expect(importSave('BQ1.not-base64!')).toBeNull()
    expect(importSave('{"version":2}')).toBeNull()
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

  it('smart mode reminds about when they practiced yesterday', () => {
    // Lessons at noon: reminder due from 11am (11:30 rounded down to the hour).
    const s = practicedOn(['2026-11-01', '2026-11-02'], { pushEnabled: true, reminderMode: 'smart', freezes: 0 })
    expect(send(s, at('2026-11-03', 10)).sent.some((m) => m.rule === 'push_streak_risk')).toBe(false)
    expect(send(s, at('2026-11-03', 11)).sent.some((m) => m.rule === 'push_streak_risk')).toBe(true)
  })

  it('sends a late streak saver even after the daily reminder', () => {
    const s = practicedOn(['2026-11-01', '2026-11-02', '2026-11-03'], { pushEnabled: true, reminderHour: 17, freezes: 0 })
    const first = send(s, at('2026-11-04', 17)).sent.filter((m) => m.channel === 'push')
    expect(first.map((m) => m.rule)).toEqual(['push_streak_risk'])
    const logged = { ...s, messages: first.map((m) => ({ rule: m.rule, key: m.key, channel: m.channel, at: at('2026-11-04', 17).toISOString() })) }
    expect(send(logged, at('2026-11-04', 20)).sent.filter((m) => m.channel === 'push').map((m) => m.rule)).toEqual(['push_streak_saver'])
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

  it('a learner who fades out gets two pushes, one email, a last message, then silence', () => {
    const days = simulate(PERSONAS.find((p) => p.id === 'fades')!, units, opts)
    const outbound = days.flatMap((d) => d.sent.filter((m) => m.channel !== 'banner').map((m) => [d.day, m.rule] as const))
    const rules = outbound.map(([, r]) => r)
    for (const r of ['push_lapsed_2', 'push_lapsed_4', 'email_lapsed_5', 'push_last_call']) expect(rules).toContain(r)
    // The last message goes out exactly a week after the last lesson (day index 4).
    const last = outbound.find(([, r]) => r === 'push_last_call')!
    expect(last[0]).toBe(11)
    expect(days[11].sent.find((m) => m.rule === 'push_last_call')!.body).toContain('stop sending')
    // The promise is kept: nothing at all after it, for the remaining five weeks.
    expect(outbound.filter(([d]) => d > last[0])).toHaveLength(0)
    for (const d of days) expect(d.sent.filter((m) => m.channel === 'push').length).toBeLessThanOrEqual(1)
  })

  it('with notifications off, the last message comes by email and is still the last', () => {
    const days = simulate(PERSONAS.find((p) => p.id === 'fades')!, units, { ...opts, pushEnabled: false })
    const outbound = days.flatMap((d) => d.sent.filter((m) => m.channel !== 'banner').map((m) => [d.day, m.rule] as const))
    const last = outbound.find(([, r]) => r === 'email_last_call')!
    expect(last).toBeDefined()
    expect(outbound.some(([, r]) => r.startsWith('push'))).toBe(false)
    expect(outbound.filter(([d]) => d > last[0])).toHaveLength(0)
  })

  it('reminders start again once a silenced learner comes back', () => {
    const days = simulate(PERSONAS.find((p) => p.id === 'returns')!, units, { ...opts, days: 30 })
    const before = days.slice(0, 21).flatMap((d) => d.sent.map((m) => m.rule))
    expect(before).toContain('push_last_call')
    // Back on day 21 and practicing daily: no lapse messages, and the weekly recap resumes.
    const after = days.slice(21).flatMap((d) => d.sent.filter((m) => m.channel !== 'banner').map((m) => m.rule))
    expect(after.some((r) => r.includes('lapsed') || r.includes('last_call'))).toBe(false)
    expect(after).toContain('email_weekly')
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
