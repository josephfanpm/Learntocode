import { addDays, dayKey, daysBetween } from './dates'
import { boosted, milestoneReward, type MistakeItem, type QuestDay } from './gamify'

export interface AvatarSpec {
  animal: 'redpanda' | 'cat' | 'bunny' | 'bear'
  fur: 'ginger' | 'grey' | 'cream' | 'brown' | 'black' | 'white'
  face: 'happy' | 'cheer' | 'think' | 'sleepy' | 'oops'
  accessory: 'none' | 'glasses' | 'beanie' | 'headphones' | 'bow' | 'crown'
  bg: string
}

export type Motivation = 'career' | 'curious' | 'build' | 'work'

export interface DayActivity {
  xp: number
  lessons: number
  /** A streak freeze covered this day. */
  frozen?: boolean
}

export interface LessonRecord {
  firstAt: string
  lastAt: string
  times: number
  bestAccuracy: number
}

export interface SentMessage {
  rule: string
  key: string
  channel: Channel
  at: string
}

export type Channel = 'banner' | 'push' | 'email'

export interface LearnerState {
  version: 1
  createdAt: string
  onboarded: boolean
  name: string
  motivation: Motivation
  /** Daily XP goal. */
  dailyGoal: number
  /** Hour (0–23, local) for the streak reminder. */
  reminderHour: number
  /**
   * smart: remind about 23.5 hours after the last lesson (when they usually
   * practice). fixed: remind at reminderHour. Missing (older saves) = fixed.
   */
  reminderMode?: 'smart' | 'fixed'
  pushEnabled: boolean
  /** Chapters skipped by each course's placement quiz (0 or missing = start at the beginning). */
  placed?: { cs?: number; dev?: number; ai?: number }
  /** Older saves stored the Computer science placement here. */
  placedUnit?: number
  /** Prototype setting: every lesson is open. Off by default. */
  unlockAll?: boolean
  /** The course shown on the Learn tab. Missing = 'cs'. */
  course?: 'cs' | 'dev' | 'ai'
  /** Where the learner heard about the app (asked in setup, skippable). */
  source?: string
  /** The create-your-profile step after lesson one has been shown. */
  profilePrompted?: boolean
  /** Pixel-art profile picture; unset until the learner makes one. */
  avatar?: AvatarSpec
  /** Interface sounds. Missing (older saves) means on. */
  sound?: boolean
  /** Animations: on unless set to 'off'. 'on' records that the learner chose to keep them. */
  motion?: 'on' | 'off'
  xp: number
  gems: number
  freezes: number
  completed: Record<string, LessonRecord>
  activity: Record<string, DayActivity>
  /** Wrong answers per lesson since it was last completed. Feeds the "stuck" message. */
  struggles: Record<string, number>
  /** Day of the last app open, for "welcome back" and freeze reconciliation. */
  lastSeenDay: string
  /** Day a streak of 3+ days was lost and not yet acknowledged. */
  lostStreak?: { length: number; day: string }
  /** Freezes used while away, not yet shown to the learner. */
  freezesUsedUnseen: number
  messages: SentMessage[]
  dismissed: Record<string, string>
  /** Today's quests and progress (replaced when the day changes). */
  quests?: QuestDay
  /** Questions answered wrong, waiting for spaced review. */
  mistakes?: MistakeItem[]
  /** Lessons passed in legendary mode. */
  legendary?: Record<string, true>
  /** Streak milestones already rewarded with gems. */
  milestones?: number[]
  /** Double XP runs until this time. */
  boostUntil?: string
}

export const MAX_FREEZES = 2
export const FREEZE_PRICE = 50

export function newLearner(now: Date): LearnerState {
  return {
    version: 1,
    createdAt: now.toISOString(),
    onboarded: false,
    name: '',
    motivation: 'curious',
    dailyGoal: 20,
    reminderHour: 19,
    reminderMode: 'smart',
    pushEnabled: false,
    xp: 0,
    gems: 0,
    freezes: 1,
    completed: {},
    activity: {},
    struggles: {},
    lastSeenDay: dayKey(now),
    freezesUsedUnseen: 0,
    messages: [],
    dismissed: {},
  }
}

/**
 * The hour today's reminder is due. Smart mode: half an hour before the time
 * of the last lesson (so about 23.5 hours after it), kept between 8am and
 * 8pm; 7pm until there is a first lesson.
 */
export function effectiveReminderHour(s: LearnerState): number {
  if (s.reminderMode !== 'smart') return s.reminderHour
  const last = Object.values(s.completed)
    .map((c) => c.lastAt)
    .sort()
    .at(-1)
  if (!last) return 19
  const due = new Date(new Date(last).getTime() - 30 * 60_000)
  return Math.min(20, Math.max(8, due.getHours()))
}

const practiced = (a?: DayActivity) => !!a && (a.xp > 0 || !!a.frozen)

/**
 * Current streak: consecutive days with practice (or a freeze) ending today,
 * or ending yesterday if today isn't done yet — the streak is still alive
 * until the day ends.
 */
export function streak(s: LearnerState, today: string): number {
  let day = practiced(s.activity[today]) ? today : addDays(today, -1)
  let n = 0
  while (practiced(s.activity[day])) {
    // A frozen day keeps the chain alive but doesn't add to it.
    if (s.activity[day].xp > 0) n++
    day = addDays(day, -1)
  }
  return n
}

/** Longest run of practice days ever (frozen days bridge but don't count). */
export function longestStreak(s: LearnerState): number {
  const days = Object.keys(s.activity).sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const d of days) {
    const a = s.activity[d]
    if (!practiced(a)) continue
    if (prev && daysBetween(prev, d) !== 1) run = 0
    if (a.xp > 0) run++
    best = Math.max(best, run)
    prev = d
  }
  return best
}

export function practicedToday(s: LearnerState, today: string): boolean {
  return (s.activity[today]?.xp ?? 0) > 0
}

export function lastPracticeDay(s: LearnerState): string | null {
  const days = Object.keys(s.activity).filter((d) => s.activity[d].xp > 0)
  return days.length ? days.sort().at(-1)! : null
}

/**
 * Run on app open. Covers missed days with streak freezes, one per day.
 * Freezes are only spent when they cover the whole gap; otherwise the
 * streak is lost and the learner keeps their freezes.
 */
export function reconcile(s: LearnerState, today: string): LearnerState {
  const last = lastPracticeDay(s)
  const next: LearnerState = { ...s, activity: { ...s.activity }, lastSeenDay: today }
  if (!last) return next
  // Days strictly between the last practice (or freeze) and today.
  let lastCovered = last
  for (const d of Object.keys(s.activity).sort()) if (d > lastCovered && s.activity[d].frozen) lastCovered = d
  const gap = daysBetween(lastCovered, today) - 1
  if (gap <= 0) return next
  const before = streak(s, lastCovered)
  if (before > 0 && gap <= next.freezes) {
    let day = addDays(lastCovered, 1)
    for (let i = 0; i < gap; i++) {
      next.activity[day] = { xp: 0, lessons: 0, frozen: true }
      day = addDays(day, 1)
    }
    next.freezes -= gap
    next.freezesUsedUnseen = s.freezesUsedUnseen + gap
  } else if (before >= 3 && !s.lostStreak) {
    next.lostStreak = { length: before, day: today }
  }
  return next
}

/** XP for finishing a lesson. */
export function lessonXp(firstTime: boolean, accuracy: number): number {
  const base = firstTime ? 10 : 5
  return base + (accuracy === 1 ? 5 : 0)
}

export interface LessonResult {
  xp: number
  gems: number
  goalHit: boolean
  streakBefore: number
  streakAfter: number
  /** Gems for reaching a streak milestone with this lesson (0 if none). */
  milestoneGems: number
  /** Double XP was on. */
  boosted: boolean
}

export function completeLesson(
  s: LearnerState,
  lessonId: string,
  accuracy: number,
  now: Date,
): [LearnerState, LessonResult] {
  const today = dayKey(now)
  const prev = s.completed[lessonId]
  const baseXp = lessonXp(!prev, accuracy)
  const xp = boosted(s, now, baseXp)
  const day = s.activity[today] ?? { xp: 0, lessons: 0 }
  const goalBefore = day.xp >= s.dailyGoal
  const newDay = { xp: day.xp + xp, lessons: day.lessons + 1 }
  const goalHit = !goalBefore && newDay.xp >= s.dailyGoal
  const gems = 5 + (goalHit ? 20 : 0)
  const streakBefore = streak(s, today)
  const struggles = { ...s.struggles }
  delete struggles[lessonId]
  const next: LearnerState = {
    ...s,
    xp: s.xp + xp,
    gems: s.gems + gems,
    activity: { ...s.activity, [today]: newDay },
    completed: {
      ...s.completed,
      [lessonId]: {
        firstAt: prev?.firstAt ?? now.toISOString(),
        lastAt: now.toISOString(),
        times: (prev?.times ?? 0) + 1,
        bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy),
      },
    },
    struggles,
    lostStreak: undefined,
    freezesUsedUnseen: 0,
  }
  const streakAfter = streak(next, today)
  const [rewarded, milestoneGems] = milestoneReward(next, streakBefore, streakAfter)
  return [rewarded, { xp, gems, goalHit, streakBefore, streakAfter, milestoneGems, boosted: xp > baseXp }]
}

/** A mistake-review session: XP and a practice day, but no lesson record. */
export function completeReview(s: LearnerState, fixed: number, now: Date): [LearnerState, LessonResult] {
  const today = dayKey(now)
  const baseXp = 5 + fixed * 2
  const xp = boosted(s, now, baseXp)
  const day = s.activity[today] ?? { xp: 0, lessons: 0 }
  const goalHit = day.xp < s.dailyGoal && day.xp + xp >= s.dailyGoal
  const gems = goalHit ? 20 : 0
  const streakBefore = streak(s, today)
  const next: LearnerState = {
    ...s,
    xp: s.xp + xp,
    gems: s.gems + gems,
    activity: { ...s.activity, [today]: { ...day, xp: day.xp + xp } },
    lostStreak: undefined,
    freezesUsedUnseen: 0,
  }
  const streakAfter = streak(next, today)
  const [rewarded, milestoneGems] = milestoneReward(next, streakBefore, streakAfter)
  return [rewarded, { xp, gems, goalHit, streakBefore, streakAfter, milestoneGems, boosted: xp > baseXp }]
}

export function buyFreeze(s: LearnerState): LearnerState | null {
  if (s.gems < FREEZE_PRICE || s.freezes >= MAX_FREEZES) return null
  return { ...s, gems: s.gems - FREEZE_PRICE, freezes: s.freezes + 1 }
}

const KEY = 'learntocode:v1'

export function load(now: Date): LearnerState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LearnerState
  } catch {
    /* private mode or corrupt: start fresh */
  }
  return newLearner(now)
}

export function save(s: LearnerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage full or blocked: progress lives for this session only */
  }
}

/** A save code: the whole learner state as text that can be pasted on another device. */
export function exportSave(s: LearnerState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(s))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return 'BQ1.' + btoa(bin)
}

/** Read a save code or backup file. Returns null if it isn't a valid save. */
export function importSave(text: string): LearnerState | null {
  try {
    const t = text.trim()
    let json = t
    if (t.startsWith('BQ1.')) {
      const bin = atob(t.slice(4))
      json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
    }
    const s = JSON.parse(json) as LearnerState
    const ok =
      s && s.version === 1 && typeof s.xp === 'number' && typeof s.completed === 'object' && s.completed !== null && typeof s.activity === 'object' && s.activity !== null
    return ok ? s : null
  } catch {
    return null
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
