import { Check, FastForward, Flame, Play, Gem, Lock, Snowflake, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { units } from '../content'
import { dayKey } from '../engine/dates'
import type { Message } from '../engine/messaging'
import { path, unitProgress } from '../engine/progress'
import { practicedToday, streak } from '../engine/state'
import { useStore } from '../store'
import { Pip, type Mood } from './Pip'

/** One transit-line colour per unit. */
export const LINE_COLORS = ['#2d5be3', '#ff7a1a', '#0f9fae', '#7a4ff0', '#c2378b', '#12935a', '#d6a200', '#e0483e', '#3a7bd5', '#8a5a2b', '#16213e']

export type Go = (route: string) => void

export function TopBar({ go }: { go: Go }) {
  const { s } = useStore()
  const today = dayKey(new Date())
  const st = streak(s, today)
  const lit = practicedToday(s, today)
  const xpToday = s.activity[today]?.xp ?? 0
  const pct = Math.min(1, xpToday / s.dailyGoal)
  return (
    <header className="sticky top-0 z-10 border-b-2 border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-2.5">
        <button onClick={() => go('/')} className="mr-auto font-display text-xl font-extrabold tracking-tight">
          Line by Line
        </button>
        <button onClick={() => go('/me')} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-semibold hover:bg-white" aria-label={`${st}-day streak${lit ? '' : ', not yet extended today'}`}>
          <Flame size={22} className={lit ? 'text-flame' : 'text-ink-3'} fill={lit ? 'currentColor' : 'none'} />
          {st}
        </button>
        {s.freezes > 0 && (
          <span className="flex items-center gap-1 px-1 font-semibold text-[#3a9ad9]" aria-label={`${s.freezes} streak freezes`}>
            <Snowflake size={18} /> {s.freezes}
          </span>
        )}
        <button onClick={() => go('/me')} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-semibold hover:bg-white" aria-label={`${s.gems} gems`}>
          <Gem size={19} className="text-gem" /> {s.gems}
        </button>
        <button onClick={() => go('/me')} className="relative size-9" aria-label={`Daily goal: ${xpToday} of ${s.dailyGoal} XP`}>
          <svg viewBox="0 0 36 36" className="size-9 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-rule)" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-flame)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${pct * 94.2} 94.2`} />
          </svg>
          {pct >= 1 && <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-flame" />}
        </button>
      </div>
    </header>
  )
}

const BANNER_MOOD: Record<string, Mood> = {
  first_lesson: 'wave',
  freeze_used: 'happy',
  streak_lost: 'oops',
  welcome_back: 'wave',
  stuck: 'think',
  unit_done: 'celebrate',
  streak_milestone: 'celebrate',
  goal_close: 'cheer',
  freeze_offer: 'think',
}

export function Banner({ m, go, onDismiss }: { m: Message; go: Go; onDismiss: () => void }) {
  const act = () => {
    if (!m.cta) return
    if (m.cta.action === 'lesson' || m.cta.action === 'review') go(`/lesson/${m.cta.lessonId}`)
    else if (m.cta.action === 'shop') go('/me#shop')
    else go('/me#settings')
  }
  const tone = m.rule === 'streak_milestone' || m.rule === 'unit_done' ? 'bg-flame-soft border-flame/30' : 'bg-white border-rule'
  return (
    <div className={`relative flex gap-3 rounded-2xl border-2 p-4 pr-11 ${tone}`}>
      <Pip mood={BANNER_MOOD[m.rule] ?? 'happy'} size={52} className="shrink-0" />
      <div className="min-w-0">
      <p className="font-display text-lg leading-tight font-bold">{m.title}</p>
      <p className="mt-1 text-sm text-ink-2">{m.body}</p>
      {m.cta && (
        <button className="btn mt-3 !py-2 text-sm" onClick={act}>
          {m.cta.label}
        </button>
      )}
      </div>
      <button aria-label="Dismiss" onClick={onDismiss} className="absolute top-3 right-3 rounded-lg p-1 text-ink-3 hover:text-ink">
        <X size={18} />
      </button>
    </div>
  )
}

/** Stations zig-zag gently down the line. */
const OFFSETS = [0, 34, 52, 34, 0, -34, -52, -34]

export function Home({ go }: { go: Go }) {
  const { s, banners, dismiss } = useStore()
  const p = path(units, s)
  const current = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    current.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="mx-auto max-w-xl px-4 pb-24">
      {banners.length > 0 && (
        <div className="mt-4 space-y-3">
          {banners.map((m) => (
            <Banner key={m.key} m={m} go={go} onDismiss={() => dismiss(m)} />
          ))}
        </div>
      )}
      {units.map((unit, ui) => {
        const color = LINE_COLORS[ui % LINE_COLORS.length]
        const prog = unitProgress(unit, s)
        const stations = p.filter((x) => x.unit.id === unit.id)
        const unitLocked = stations.every((x) => x.status === 'locked')
        const unitSkipped = stations.every((x) => x.status === 'skipped' || x.status === 'done') && stations.some((x) => x.status === 'skipped')
        return (
          <section key={unit.id} className="mt-8" aria-labelledby={`h-${unit.id}`}>
            <div className="flex items-stretch gap-3 rounded-2xl p-4 text-white" style={{ background: unitLocked ? '#8691ad' : color }}>
              <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-white/20 font-display text-2xl font-extrabold">
                {unit.week}
              </div>
              <div className="min-w-0">
                <h2 id={`h-${unit.id}`} className="text-xl leading-tight font-bold">{unit.title}</h2>
                <p className="text-sm text-white/85">{unit.summary}</p>
                <p className="mt-1 text-xs text-white/75">
                  {unitSkipped ? 'Skipped by your placement test · open to review' : `Week ${unit.week} of CS50 · ${prog.done}/${prog.total} lessons`}
                </p>
              </div>
            </div>
            <ol className="relative py-6">
              {/* The line itself */}
              <div aria-hidden className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 rounded-full" style={{ background: unitLocked ? 'var(--color-rule)' : color, opacity: unitLocked ? 1 : 0.25 }} />
              {stations.map((st, i) => {
                const x = OFFSETS[i % OFFSETS.length]
                const isCur = st.status === 'current'
                return (
                  <li key={st.lesson.id} className="relative flex justify-center py-3" style={{ transform: `translateX(${x}px)` }}>
                    <div className="flex flex-col items-center">
                      <button
                        ref={isCur ? current : undefined}
                        disabled={st.status === 'locked'}
                        onClick={() => go(`/lesson/${st.lesson.id}`)}
                        aria-label={`${st.lesson.title}${st.status === 'done' ? ', done, practice again' : st.status === 'locked' ? ', locked' : st.status === 'skipped' ? ', skipped, open to review' : st.status === 'open' ? ', open' : ', start'}`}
                        className={`grid place-items-center rounded-full border-4 transition-transform active:translate-y-1 ${
                          isCur ? 'anim-pulse size-20 bg-white' : 'size-16'
                        } ${st.status === 'done' ? 'text-white' : ''} ${st.status === 'locked' ? 'border-rule bg-paper text-ink-3' : ''} ${st.status === 'skipped' ? 'border-dashed bg-white' : ''} ${st.status === 'open' ? 'bg-white' : ''}`}
                        style={
                          st.status === 'done'
                            ? { background: color, borderColor: color, boxShadow: `0 5px 0 color-mix(in srgb, ${color} 70%, black)` }
                            : isCur
                              ? { borderColor: color, color, boxShadow: `0 5px 0 color-mix(in srgb, ${color} 70%, black)` }
                              : st.status === 'skipped' || st.status === 'open'
                                ? { borderColor: color, color, boxShadow: '0 5px 0 var(--color-rule)' }
                              : { boxShadow: '0 5px 0 var(--color-rule)' }
                        }
                      >
                        {st.status === 'done' ? <Check size={28} strokeWidth={3} /> : st.status === 'skipped' ? <FastForward size={24} /> : st.status === 'open' ? <Play size={24} /> : st.status === 'locked' ? <Lock size={22} /> : <span className="font-display text-lg font-extrabold">Start</span>}
                      </button>
                      <span className={`mt-2 max-w-40 rounded-lg bg-paper px-1.5 text-center text-sm leading-tight ${isCur ? 'font-semibold' : st.status === 'locked' ? 'text-ink-3' : 'text-ink-2'}`}>
                        {st.lesson.title}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
