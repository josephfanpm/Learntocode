// Daily quests, mistake review, legendary lessons, streak milestone rewards
// and the double-XP boost. Pure functions over LearnerState; the UI calls them.
import type { Exercise, Lesson, Unit } from '../content/types'
import { addDays } from './dates'
import type { LearnerState } from './state'

// ---------- Daily quests ----------

export type QuestId = 'lessons2' | 'perfect' | 'combo5' | 'xp40' | 'review3' | 'code' | 'nohint'

export interface QuestDef {
  id: QuestId
  text: string
  goal: number
}

export const QUESTS: Record<QuestId, QuestDef> = {
  lessons2: { id: 'lessons2', text: 'Finish 2 lessons', goal: 2 },
  perfect: { id: 'perfect', text: 'Finish a lesson with no mistakes', goal: 1 },
  combo5: { id: 'combo5', text: 'Get 5 right in a row', goal: 5 },
  xp40: { id: 'xp40', text: 'Earn 40 XP', goal: 40 },
  review3: { id: 'review3', text: 'Fix 3 old mistakes', goal: 3 },
  code: { id: 'code', text: 'Finish a lesson where you write code', goal: 1 },
  nohint: { id: 'nohint', text: 'Finish a lesson without a hint', goal: 1 },
}

export const QUEST_CHEST = 30

export interface QuestDay {
  day: string
  ids: QuestId[]
  progress: Partial<Record<QuestId, number>>
  claimed: boolean
}

/** Small, stable hash so a day always gets the same quests. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Today's three quests. The mistake quest only appears when there are mistakes due. */
export function questsFor(s: LearnerState, today: string): QuestDay {
  if (s.quests?.day === today) return s.quests
  const pool: QuestId[] = ['lessons2', 'perfect', 'combo5', 'xp40', 'code', 'nohint']
  if (dueMistakes(s, today).length >= 3) pool.push('review3')
  const ids: QuestId[] = []
  let h = hash(today)
  // The first quest is always an easy one, so every day is winnable.
  ids.push((['lessons2', 'xp40', 'nohint'] as QuestId[])[h % 3])
  while (ids.length < 3) {
    h = hash(String(h))
    const q = pool[h % pool.length]
    if (!ids.includes(q)) ids.push(q)
  }
  return { day: today, ids, progress: {}, claimed: false }
}

export interface QuestEvent {
  lessonsDone?: number
  perfectLessons?: number
  bestCombo?: number
  xp?: number
  mistakesFixed?: number
  codeLessons?: number
  noHintLessons?: number
}

const EVENT_FOR: Record<QuestId, (e: QuestEvent) => number | undefined> = {
  lessons2: (e) => e.lessonsDone,
  perfect: (e) => e.perfectLessons,
  combo5: (e) => e.bestCombo,
  xp40: (e) => e.xp,
  review3: (e) => e.mistakesFixed,
  code: (e) => e.codeLessons,
  nohint: (e) => e.noHintLessons,
}

/** Add an event to today's quests. Combo is a best-of, everything else adds up. */
export function recordQuest(s: LearnerState, e: QuestEvent, today: string): LearnerState {
  const q = questsFor(s, today)
  const progress = { ...q.progress }
  for (const id of q.ids) {
    const v = EVENT_FOR[id](e)
    if (!v) continue
    const cur = progress[id] ?? 0
    progress[id] = Math.min(QUESTS[id].goal, id === 'combo5' ? Math.max(cur, v) : cur + v)
  }
  return { ...s, quests: { ...q, progress } }
}

export function questsDone(q: QuestDay): boolean {
  return q.ids.every((id) => (q.progress[id] ?? 0) >= QUESTS[id].goal)
}

export function claimChest(s: LearnerState, today: string): LearnerState | null {
  const q = questsFor(s, today)
  if (q.claimed || !questsDone(q)) return null
  return { ...s, gems: s.gems + QUEST_CHEST, quests: { ...q, claimed: true } }
}

// ---------- Mistake review (spaced: 1, 3, then 7 days) ----------

export interface MistakeItem {
  lessonId: string
  ex: number
  due: string
  /** Right answers in review so far. Three and it's learned. */
  box: number
}

const GAPS = [1, 3, 7]

/** Kinds worth bringing back on their own (concepts teach, code takes too long). */
export const reviewable = (e: Exercise) => e.kind !== 'concept' && e.kind !== 'write'

export function addMistake(s: LearnerState, lessonId: string, ex: number, today: string): LearnerState {
  const rest = (s.mistakes ?? []).filter((m) => !(m.lessonId === lessonId && m.ex === ex))
  return { ...s, mistakes: [...rest, { lessonId, ex, due: addDays(today, GAPS[0]), box: 0 }] }
}

export function dueMistakes(s: LearnerState, today: string): MistakeItem[] {
  return (s.mistakes ?? []).filter((m) => m.due <= today)
}

/** Right: wait longer, and drop it after the last gap. Wrong: back to tomorrow. */
export function reviewMistake(s: LearnerState, item: MistakeItem, right: boolean, today: string): LearnerState {
  const rest = (s.mistakes ?? []).filter((m) => !(m.lessonId === item.lessonId && m.ex === item.ex))
  if (!right) return { ...s, mistakes: [...rest, { ...item, box: 0, due: addDays(today, GAPS[0]) }] }
  const box = item.box + 1
  if (box >= GAPS.length) return { ...s, mistakes: rest }
  return { ...s, mistakes: [...rest, { ...item, box, due: addDays(today, GAPS[box]) }] }
}

export const REVIEW_SIZE = 8

/** A practice "lesson" of due mistakes, oldest first, with where each came from. */
export function reviewLesson(units: Unit[], s: LearnerState, today: string): { lesson: Lesson; items: MistakeItem[] } | null {
  const byId = new Map(units.flatMap((u) => u.lessons).map((l) => [l.id, l]))
  const items = dueMistakes(s, today)
    .filter((m) => byId.get(m.lessonId)?.exercises[m.ex])
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, REVIEW_SIZE)
  if (!items.length) return null
  return {
    lesson: { id: 'review', title: 'Fix your mistakes', exercises: items.map((m) => byId.get(m.lessonId)!.exercises[m.ex]) },
    items,
  }
}

// ---------- Legendary lessons ----------

/** Wrong answers allowed in a legendary run; one more and it fails. */
export const LEGENDARY_MISTAKES = 2
export const LEGENDARY_GEMS = 30

export function isLegendary(s: LearnerState, lessonId: string): boolean {
  return !!s.legendary?.[lessonId]
}

export function winLegendary(s: LearnerState, lessonId: string): LearnerState {
  if (isLegendary(s, lessonId)) return s
  return { ...s, gems: s.gems + LEGENDARY_GEMS, legendary: { ...s.legendary, [lessonId]: true } }
}

// ---------- Streak milestones ----------

export const MILESTONE_GEMS: Record<number, number> = { 3: 10, 7: 25, 14: 40, 30: 100, 50: 150, 100: 300, 365: 1000 }

/** Gems for reaching a milestone today (once per milestone length). */
export function milestoneReward(s: LearnerState, before: number, after: number): [LearnerState, number] {
  const gems = after > before ? (MILESTONE_GEMS[after] ?? 0) : 0
  if (!gems || s.milestones?.includes(after)) return [s, 0]
  return [{ ...s, gems: s.gems + gems, milestones: [...(s.milestones ?? []), after] }, gems]
}

// ---------- Double XP boost ----------

export const BOOST_PRICE = 100
export const BOOST_MINUTES = 15

export function boostActive(s: LearnerState, now: Date): boolean {
  return !!s.boostUntil && new Date(s.boostUntil) > now
}

export function boosted(s: LearnerState, now: Date, xp: number): number {
  return boostActive(s, now) ? xp * 2 : xp
}

export function buyBoost(s: LearnerState, now: Date): LearnerState | null {
  if (s.gems < BOOST_PRICE || boostActive(s, now)) return null
  return { ...s, gems: s.gems - BOOST_PRICE, boostUntil: new Date(now.getTime() + BOOST_MINUTES * 60_000).toISOString() }
}
