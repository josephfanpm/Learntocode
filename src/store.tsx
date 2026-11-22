import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { courseUnits } from './content'
import { dayKey } from './engine/dates'
import { decide, facts, type Message } from './engine/messaging'
import { load, reconcile, save, type LearnerState } from './engine/state'
import { setMotionPref } from './motion'
import { setSoundEnabled } from './sound'

interface Store {
  s: LearnerState
  update: (f: (s: LearnerState) => LearnerState) => void
  banners: Message[]
  dismiss: (m: Message) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<LearnerState>(() => ({ ...reconcile(load(new Date()), dayKey(new Date())), reminderMode: 'smart' }))
  const ref = useRef(s)
  ref.current = s
  setSoundEnabled(s.sound !== false)
  setMotionPref(s.motion)

  const update = useCallback((f: (s: LearnerState) => LearnerState) => {
    setS((prev) => {
      const next = f(prev)
      save(next)
      return next
    })
  }, [])

  useEffect(() => save(s), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scheduled checks while the app is open: new day → reconcile; push/email
  // decisions are logged, and push shows as a browser notification when allowed.
  // (A production version would run this on a server so it reaches closed apps.)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const cur = ref.current
      if (!cur.onboarded) return
      let next = cur.lastSeenDay !== dayKey(now) ? reconcile(cur, dayKey(now)) : cur
      const out = decide(facts(next, courseUnits(next.course ?? 'cs'), now), next.messages).sent.filter((m) => m.channel !== 'banner')
      if (out.length) {
        for (const m of out)
          if (m.channel === 'push' && typeof Notification !== 'undefined' && Notification.permission === 'granted')
            try {
              new Notification(m.title, { body: m.body, icon: `${import.meta.env.BASE_URL}favicon.svg`, tag: m.rule })
            } catch {
              /* some browsers only allow notifications from a service worker */
            }
        next = { ...next, messages: [...next.messages, ...out.map((m) => ({ rule: m.rule, key: m.key, channel: m.channel, at: now.toISOString() }))] }
      }
      if (next !== cur) update(() => next)
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [update])

  const banners = s.onboarded ? decide(facts(s, courseUnits(s.course ?? 'cs'), new Date()), [], s.dismissed).sent.filter((m) => m.channel === 'banner') : []

  const dismiss = useCallback(
    (m: Message) =>
      update((p) => ({
        ...p,
        dismissed: { ...p.dismissed, [m.key]: new Date().toISOString() },
        freezesUsedUnseen: m.rule === 'freeze_used' ? 0 : p.freezesUsedUnseen,
      })),
    [update],
  )

  return <Ctx.Provider value={{ s, update, banners, dismiss }}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore outside provider')
  return c
}
