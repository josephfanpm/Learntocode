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

// Order on the path. u13 (Systems design) was added later, so its id is out of
// sequence: lesson ids are what progress is saved under and must not change.
export const units: Unit[] = [ u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u13, u12 ]
