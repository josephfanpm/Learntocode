import type { World } from './canvas'
import { scenes as a } from './scenes/a'
import { scenes as b } from './scenes/b'
import { scenes as c } from './scenes/c'
import { scenes as d } from './scenes/d'
import { tokyo } from './scenes/tokyo'

/** Every destination scene, one per unit. */
export const WORLDS: World[] = [tokyo, ...a, ...b, ...c, ...d]

const byUnit = new Map(WORLDS.map((w) => [w.unit, w]))

export function worldFor(unit: string): World | undefined {
  return byUnit.get(unit)
}
