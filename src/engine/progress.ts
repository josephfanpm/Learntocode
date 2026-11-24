import type { Lesson, Unit } from '../content/types'
import type { LearnerState } from './state'

/** skipped: in a unit the placement test skipped; open for review, not counted as done. */
/** open: would be locked, but the prototype "unlock all" setting is on. */
export type NodeStatus = 'done' | 'skipped' | 'current' | 'locked' | 'open'

export interface PathLesson {
  lesson: Lesson
  unit: Unit
  status: NodeStatus
}

/**
 * Lessons unlock strictly in order across the whole course: the first
 * lesson not yet completed is "current", everything after it is locked.
 * Finishing a unit's last lesson opens the next unit. Units skipped by the
 * placement test are open but don't hold the current lesson.
 */
export function path(units: Unit[], s: LearnerState): PathLesson[] {
  const out: PathLesson[] = []
  let foundCurrent = false
  // `units` is one course's path; each course has its own placement.
  const course = units[0]?.course ?? 'cs'
  const placed = s.placed?.[course] ?? (course === 'cs' ? (s.placedUnit ?? 0) : 0)
  units.forEach((unit, ui) => {
    for (const lesson of unit.lessons) {
      let status: NodeStatus
      if (s.completed[lesson.id]) status = 'done'
      else if (ui < placed) status = 'skipped'
      else if (!foundCurrent) {
        status = 'current'
        foundCurrent = true
      } else status = s.unlockAll ? 'open' : 'locked'
      out.push({ lesson, unit, status })
    }
  })
  return out
}

export function currentLesson(units: Unit[], s: LearnerState): PathLesson | undefined {
  return path(units, s).find((p) => p.status === 'current')
}

export function unitProgress(unit: Unit, s: LearnerState): { done: number; total: number } {
  return {
    done: unit.lessons.filter((l) => s.completed[l.id]).length,
    total: unit.lessons.length,
  }
}

export function isUnitDone(unit: Unit, s: LearnerState): boolean {
  return unit.lessons.length > 0 && unit.lessons.every((l) => s.completed[l.id])
}

export function findLesson(units: Unit[], id: string): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === id)
    if (lesson) return { unit, lesson }
  }
}

/** A completed lesson good for review: lowest accuracy first, then oldest. */
export function reviewPick(units: Unit[], s: LearnerState): Lesson | undefined {
  const done = units.flatMap((u) => u.lessons).filter((l) => s.completed[l.id])
  done.sort((a, b) => {
    const ra = s.completed[a.id]
    const rb = s.completed[b.id]
    return ra.bestAccuracy - rb.bestAccuracy || ra.lastAt.localeCompare(rb.lastAt)
  })
  return done[0]
}

export type BadgeTier = 'locked' | 'bronze' | 'silver' | 'gold'

export interface Badge {
  id: string
  icon: 'flame' | 'sword' | 'shield' | 'trophy' | 'star' | 'gem' | 'target' | 'moon' | 'sun' | 'bolt' | 'scroll' | 'wrench' | 'robot' | 'potion' | 'snow' | 'compass' | 'heart'
  name: string
  /** What earns the next tier, or what earned the top one. */
  goalText: string
  tier: BadgeTier
  /** Progress toward the next tier (or the top tier when maxed). */
  value: number
  goal: number
}

const TIER_NAMES: BadgeTier[] = ['bronze', 'silver', 'gold']

/** A badge with up to three tiers at rising thresholds. */
function tiered(id: string, icon: Badge['icon'], name: string, value: number, steps: number[], unit: (n: number) => string): Badge {
  const reached = steps.filter((t) => value >= t).length
  const maxed = reached === steps.length
  const goal = maxed ? steps[steps.length - 1] : steps[reached]
  // With fewer than three steps, the top step is always gold.
  const tier: BadgeTier = reached === 0 ? 'locked' : TIER_NAMES[TIER_NAMES.length - 1 - (steps.length - reached)]
  return { id, icon, name, goalText: unit(goal), tier, value: Math.min(value, goal), goal }
}

export function badges(units: Unit[], s: LearnerState, bestStreak: number): Badge[] {
  const records = Object.values(s.completed)
  const lessons = records.length
  const perfect = records.filter((r) => r.bestAccuracy === 1).length
  const inCourse = (c: 'cs' | 'dev' | 'ai') => units.filter((u) => (u.course ?? 'cs') === c)
  const doneIn = (c: 'cs' | 'dev' | 'ai') => inCourse(c).filter((u) => isUnitDone(u, s)).length
  const cs = inCourse('cs')

  const days = Object.entries(s.activity)
  const goalDays = days.filter(([, a]) => a.xp >= s.dailyGoal).length
  const busiestDay = Math.max(0, ...days.map(([, a]) => a.lessons))
  const frozenDays = days.filter(([, a]) => a.frozen).length
  const hours = records.map((r) => new Date(r.lastAt).getHours())
  const early = hours.filter((h) => h < 8).length
  const late = hours.filter((h) => h >= 21).length
  const repeats = records.reduce((n, r) => n + Math.max(0, r.times - 1), 0)

  // Lessons finished that include at least one write-code exercise.
  const writers = new Set(units.flatMap((u) => u.lessons).filter((l) => l.exercises.some((e) => e.kind === 'write')).map((l) => l.id))
  const codeLessons = Object.keys(s.completed).filter((id) => writers.has(id)).length

  // Comebacks: a practice day at least a week after the one before it.
  const practiced = days.filter(([, a]) => a.xp > 0).map(([d]) => d).sort()
  let comebacks = 0
  for (let i = 1; i < practiced.length; i++) {
    const gap = Math.round((new Date(practiced[i]).getTime() - new Date(practiced[i - 1]).getTime()) / 86_400_000)
    if (gap >= 7) comebacks++
  }

  const started = (['cs', 'dev', 'ai'] as const).filter((c) => inCourse(c).some((u) => u.lessons.some((l) => s.completed[l.id]))).length

  return [
    tiered('quest', 'sword', 'First Quest', lessons, [1], () => 'Finish your first lesson'),
    tiered('streak', 'flame', 'On Fire', bestStreak, [3, 7, 30], (n) => `Reach a ${n}-day streak`),
    tiered('lessons', 'shield', 'Adventurer', lessons, [10, 30, 100], (n) => `Finish ${n} lessons`),
    tiered('perfect', 'star', 'Flawless', perfect, [1, 10, 30], (n) => `Finish ${n} ${n === 1 ? 'lesson' : 'lessons'} with no mistakes`),
    tiered('legendary', 'trophy', 'Legend', Object.keys(s.legendary ?? {}).length, [1, 10, 30], (n) => `Pass ${n} ${n === 1 ? 'lesson' : 'lessons'} on legendary`),
    tiered('xp', 'gem', 'Treasure Hunter', s.xp, [100, 500, 1500], (n) => `Earn ${n.toLocaleString('en-US')} XP`),
    tiered('goal', 'target', 'Goal Getter', goalDays, [3, 10, 30], (n) => `Hit your daily goal on ${n} days`),
    tiered('marathon', 'bolt', 'Marathon', busiestDay, [3, 5, 10], (n) => `Finish ${n} lessons in one day`),
    tiered('code', 'scroll', 'Code Writer', codeLessons, [5, 25, 75], (n) => `Finish ${n} lessons where you write code`),
    tiered('repeat', 'potion', 'Practice Makes Perfect', repeats, [3, 10, 30], (n) => `Repeat lessons ${n} times`),
    tiered('early', 'sun', 'Early Bird', early, [1, 5, 20], (n) => `Finish ${n} ${n === 1 ? 'lesson' : 'lessons'} before 8am`),
    tiered('late', 'moon', 'Night Owl', late, [1, 5, 20], (n) => `Finish ${n} ${n === 1 ? 'lesson' : 'lessons'} after 9pm`),
    tiered('comeback', 'heart', 'Comeback', comebacks, [1, 3, 5], (n) => `Come back after a week away${n === 1 ? '' : `, ${n} times`}`),
    tiered('freeze', 'snow', 'Ice Cold', frozenDays, [1, 3, 7], (n) => `Have a freeze save ${n} ${n === 1 ? 'day' : 'days'}`),
    tiered('explorer', 'compass', 'Explorer', started, [1, 2, 3], (n) => (n === 1 ? 'Start a course' : `Start ${n} courses`)),
    tiered('units', 'trophy', 'Boss Slayer', doneIn('cs'), [1, 5, cs.length], (n) => `Complete ${n} Computer science ${n === 1 ? 'unit' : 'units'}`),
    tiered('dev', 'wrench', 'Craftsperson', doneIn('dev'), [1, 6, 12], (n) => `Complete ${n} Developer skills ${n === 1 ? 'chapter' : 'chapters'}`),
    tiered('ai', 'robot', 'AI Builder', doneIn('ai'), [1, 6, 12], (n) => `Complete ${n} Building with AI ${n === 1 ? 'chapter' : 'chapters'}`),
  ]
}
