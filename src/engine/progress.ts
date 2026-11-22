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
  const placed = s.placedUnit ?? 0
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

export interface Badge {
  id: string
  label: string
  earned: boolean
}

export function badges(units: Unit[], s: LearnerState, bestStreak: number): Badge[] {
  const lessons = Object.keys(s.completed).length
  return [
    { id: 'first', label: 'First lesson', earned: lessons >= 1 },
    { id: 'ten', label: '10 lessons', earned: lessons >= 10 },
    { id: 'streak3', label: '3-day streak', earned: bestStreak >= 3 },
    { id: 'streak7', label: '7-day streak', earned: bestStreak >= 7 },
    { id: 'streak30', label: '30-day streak', earned: bestStreak >= 30 },
    ...units.map((u) => ({ id: `unit-${u.id}`, label: u.title, earned: isUnitDone(u, s) })),
  ]
}
