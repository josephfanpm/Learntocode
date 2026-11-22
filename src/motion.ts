// One place decides whether the app animates.
//
// By default it follows the device ("reduce motion" in the system's
// accessibility settings). The learner can override that for ByteQuest in
// Settings: 'on' plays animations even when the device asks for less, 'off'
// stops them even when it doesn't. CSS reads the result from a class on
// <html>; components read it with useReducedMotion().

import { useSyncExternalStore } from 'react'

export type MotionPref = 'on' | 'off' | undefined

let pref: MotionPref
const listeners = new Set<() => void>()
const media = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : null

/** The device's own setting, ignoring any override. */
export function deviceReduces(): boolean {
  return !!media?.matches
}

/** True when animations should be reduced right now. */
export function reduced(): boolean {
  return pref === 'off' || (pref === undefined && deviceReduces())
}

function apply() {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduce-motion', reduced())
  for (const l of listeners) l()
}

export function setMotionPref(next: MotionPref) {
  if (next === pref) return
  pref = next
  apply()
}

media?.addEventListener('change', apply)
apply()

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, reduced, () => false)
}

/** True when the device asks for reduced motion (for the notice that offers the override). */
export function useDeviceReduces(): boolean {
  return useSyncExternalStore(subscribe, deviceReduces, () => false)
}
