import type { Unit } from './types'
import { u0 } from './units/u0'
import { u1 } from './units/u1'
import { u2 } from './units/u2'
import { u3 } from './units/u3'
import { u4 } from './units/u4'
import { u5 } from './units/u5'
import { u6 } from './units/u6'
import { u7 } from './units/u7'
import { u8 } from './units/u8'
import { u9 } from './units/u9'
import { u10 } from './units/u10'
import { u11 } from './units/u11'
import { u12 } from './units/u12'
import { u13 } from './units/u13'
import { u14 } from './units/u14'
import { u15 } from './units/u15'
import { u16 } from './units/u16'
import { u17 } from './units/u17'
import { u18 } from './units/u18'
import { u19 } from './units/u19'
import { u20 } from './units/u20'
import { u21 } from './units/u21'
import { u22 } from './units/u22'
import { u23 } from './units/u23'
import { u24 } from './units/u24'
import { u25 } from './units/u25'
import { u26 } from './units/u26'
import { u27 } from './units/u27'
import { u28 } from './units/u28'
import { u29 } from './units/u29'
import { u30 } from './units/u30'
import { u31 } from './units/u31'
import { u32 } from './units/u32'
import { u33 } from './units/u33'
import { u34 } from './units/u34'
import { u35 } from './units/u35'
import { u36 } from './units/u36'
import { u37 } from './units/u37'

// Order on the path. u13 (Systems design) was added later, so its id is out of
// sequence: lesson ids are what progress is saved under and must not change.
export const units: Unit[] = [ u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u13, u12,
  // The Developer skills course.
  u14, u15, u16, u17, u18, u19, u20, u21, u22, u23, u24, u25,
  // The Building with AI course.
  u26, u27, u28, u29, u30, u31, u32, u33, u34, u35, u36, u37,
]

export type CourseId = 'cs' | 'dev' | 'ai'

export const COURSES: { id: CourseId; title: string; short: string; blurb: string; note?: string }[] = [
  { id: 'cs', title: 'Computer science', short: 'Computer science', blurb: 'Harvard’s CS50, from zero, in small steps' },
  { id: 'dev', title: 'Developer skills', short: 'Developer skills', blurb: 'The day-to-day craft of working as a developer', note: 'Best after the Computer science units on Python, SQL and web pages, but open to start any time.' },
  { id: 'ai', title: 'Building with AI', short: 'Building with AI', blurb: 'Language models, agents and Claude Code, from the ground up', note: 'Uses Python from the Computer science course. The first two chapters need no code.' },
]

export function courseUnits(course: CourseId): Unit[] {
  // A chapter with no lessons yet is left off the path.
  return units.filter((u) => (u.course ?? 'cs') === course && u.lessons.length > 0)
}
