import { Check, Crown, ExternalLink, FastForward, Flame, Map, Play, Gem, Lock, Snowflake, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { COURSES, courseUnits, units as allUnits } from '../content'
import { dayKey } from '../engine/dates'
import type { Message } from '../engine/messaging'
import { LEGENDARY_GEMS, LEGENDARY_MISTAKES } from '../engine/gamify'
import { path, unitProgress, type PathLesson } from '../engine/progress'
import { practicedToday, streak } from '../engine/state'
import { useDeviceReduces } from '../motion'
import { useStore } from '../store'
import { Scene, worldLook } from './scene'
import { worldFor } from './worlds'
import { WorldScene } from './worlds/WorldScene'
import { Avatar } from './Avatar'
import { Pip, type Mood } from './Pip'
import { BoostChip, Today } from './Today'

/** One transit-line colour per unit. */
export const LINE_COLORS = ['#5b8cff', '#ff8a2a', '#25c4d4', '#a98bff', '#f062b0', '#3ddc84', '#ffc531', '#ff6b72', '#69b0ff', '#e0a36a', '#9bd1c0']

export type Go = (route: string) => void

export function TopBar({ go }: { go: Go }) {
  const { s } = useStore()
  const today = dayKey(new Date())
  const st = streak(s, today)
  const lit = practicedToday(s, today)
  return (
    <header className="sticky top-0 z-10 border-b-2 border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-2.5">
        <button onClick={() => go('/')} className="pixel mr-auto text-[0.8rem] text-white">
          <span className="text-gold">Byte</span>Quest
        </button>
        <button onClick={() => go('/me')} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-semibold hover:bg-cobalt-soft" aria-label={`${st}-day streak${lit ? '' : ', not yet extended today'}`}>
          <Flame size={22} className={lit ? 'text-flame' : 'text-ink-3'} fill={lit ? 'currentColor' : 'none'} />
          {st}
        </button>
        <BoostChip />
        {s.freezes > 0 && (
          <span className="flex items-center gap-1 px-1 font-semibold text-[#7cc4f5]" aria-label={`${s.freezes} streak freezes`}>
            <Snowflake size={18} /> {s.freezes}
          </span>
        )}
        <button onClick={() => go('/me')} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-semibold hover:bg-cobalt-soft" aria-label={`${s.gems} gems`}>
          <Gem size={19} className="text-gem" /> {s.gems}
        </button>
        <button onClick={() => go('/me')} className="ml-1 rounded-[28%]" aria-label="Your profile">
          <Avatar avatar={s.avatar} size={36} />
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
  avatar_prompt: 'wave',
}

/** Bottom tabs: the lesson path and the profile. */
export function BottomNav({ route, go }: { route: string; go: Go }) {
  const { s } = useStore()
  const onProfile = route.startsWith('/me') || route === '/avatar' || route === '/settings'
  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-semibold transition-colors ${active ? 'bg-cobalt-soft text-cobalt-deep' : 'text-ink-3 hover:text-ink'}`
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl gap-2 px-4 py-2">
        <button className={tab(!onProfile)} aria-current={!onProfile ? 'page' : undefined} onClick={() => go('/')}>
          <Map size={24} />
          Learn
        </button>
        <button className={tab(onProfile)} aria-current={onProfile ? 'page' : undefined} onClick={() => go('/me')}>
          <Avatar avatar={s.avatar} size={24} />
          Profile
        </button>
      </div>
    </nav>
  )
}

export function Banner({ m, go, onDismiss }: { m: Message; go: Go; onDismiss: () => void }) {
  const act = () => {
    if (!m.cta) return
    if (m.cta.action === 'lesson' || m.cta.action === 'review') go(`/lesson/${m.cta.lessonId}`)
    else if (m.cta.action === 'shop') go('/me#shop')
    else if (m.cta.action === 'avatar') go('/avatar')
    else go('/settings')
  }
  const tone = m.rule === 'streak_milestone' || m.rule === 'unit_done' ? 'bg-flame-soft border-flame/30' : 'bg-card border-rule'
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
  const { s, update, banners, dismiss } = useStore()
  const course = s.course ?? 'cs'
  const deviceSaysReduce = useDeviceReduces()
  const units = courseUnits(course)
  const p = path(units, s)
  const current = useRef<HTMLButtonElement>(null)
  // A finished lesson tapped on the path: practice it again or go legendary.
  const [pick, setPick] = useState<PathLesson | null>(null)
  useEffect(() => {
    // On first load, jump to the current lesson unless it is the first one on the path.
    if (p[0]?.status !== 'current') current.current?.scrollIntoView({ block: 'center' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-xl px-4 pb-28">
      {deviceSaysReduce && s.motion === undefined && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-rule bg-card p-3 text-sm">
          <p className="flex-1 text-ink-2">Your device is set to reduce motion. ByteQuest has animations on.</p>
          <button className="btn btn-ghost !min-h-0 shrink-0 !px-3 !py-2 text-sm" onClick={() => update((p) => ({ ...p, motion: 'off' }))}>Turn off</button>
          <button className="shrink-0 font-semibold text-ink-3" onClick={() => update((p) => ({ ...p, motion: 'on' }))}>Keep on</button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Course">
        {COURSES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={course === c.id}
            aria-pressed={course === c.id}
            onClick={() => {
              update((prev) => ({ ...prev, course: c.id }))
              window.scrollTo(0, 0)
            }}
            className="tile px-2 py-2.5 text-center font-display text-[0.9rem] leading-tight font-bold"
          >
            {c.short}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-2">
        {COURSES.find((c) => c.id === course)!.blurb}.{COURSES.find((c) => c.id === course)!.note ? ` ${COURSES.find((c) => c.id === course)!.note}` : ''}
      </p>
      {!p.some((x) => x.status === 'done') && s.placed?.[course] === undefined && !(course === 'cs' && s.placedUnit !== undefined) && (
        <button className="mt-2 text-sm font-semibold text-cobalt" onClick={() => go(`/place/${course}`)}>
          Know some of this already? Find my level
        </button>
      )}
      <Today go={go} />
      {banners.length > 0 && (
        <div className="mt-4 space-y-3">
          {banners.map((m) => (
            <Banner key={m.key} m={m} go={go} onDismiss={() => dismiss(m)} />
          ))}
        </div>
      )}
      {units.map((unit) => {
        const color = LINE_COLORS[allUnits.indexOf(unit) % LINE_COLORS.length]
        const prog = unitProgress(unit, s)
        const world = worldFor(unit.id)
        const stations = p.filter((x) => x.unit.id === unit.id)
        const unitLocked = stations.every((x) => x.status === 'locked')
        const unitSkipped = stations.every((x) => x.status === 'skipped' || x.status === 'done') && stations.some((x) => x.status === 'skipped')
        return (
          <section key={unit.id} className="mt-8" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }} aria-labelledby={`h-${unit.id}`}>
            <div className="overflow-hidden rounded-2xl border-[3px] border-outline">
              {world ? (
                <WorldScene world={world} dim={unitLocked} className="aspect-[17/9] w-full">
                  {!unitLocked && (
                    <p className="absolute right-2 bottom-2 bg-[#060817]/80 px-2 py-1 text-[0.65rem] font-semibold text-white">
                      {world.landmark} · {world.place}
                    </p>
                  )}
                </WorldScene>
              ) : (
                <Scene {...worldLook(allUnits.indexOf(unit))} dim={unitLocked} className="aspect-[17/9] w-full" />
              )}
              <div className="border-t-[3px] border-outline bg-card px-4 py-3">
                <p className="pixel text-[0.55rem] tracking-[0.2em]" style={{ color: unitLocked ? 'var(--color-ink-3)' : 'var(--color-gold)' }}>
                  {(unit.course ?? 'cs') === 'cs' ? 'WORLD' : 'CHAPTER'} {unit.week}
                </p>
                <h2 id={`h-${unit.id}`} className="mt-1.5 text-xl leading-tight font-bold text-white">{unit.title}</h2>
                <p className="text-sm text-white/80">{unit.summary}</p>
                <p className="mt-1 text-xs text-white/65">
                  {unitSkipped ? 'Skipped by your placement test · open to review' : `${(unit.course ?? 'cs') !== 'cs' ? `Chapter ${unit.week} of ${units.length}` : unit.week < 10 ? `Week ${unit.week} of CS50` : unit.week === 10 ? 'CS50’s AI lecture' : unit.week === 11 ? 'From CS50 Cybersecurity' : unit.week === 12 ? 'Beyond CS50' : 'CS50’s final project'} · ${prog.done}/${prog.total} lessons`}
                </p>
                {unit.lecture && (
                  <a
                    href={unit.lecture}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                  >
                    <Play size={14} aria-hidden />
                    {unit.lectureFrom ?? (unit.week === 13 ? 'CS50 final project' : unit.week === 11 ? 'CS50 Cybersecurity' : 'Watch the CS50 lecture')}
                    {!unit.lectureFrom && unit.week >= 1 && unit.week <= 5 && <span className="font-normal text-white/65">(in C)</span>}
                    <ExternalLink size={13} aria-hidden className="text-white/65" />
                  </a>
                )}
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
                    <div className="relative flex flex-col items-center">
                      {isCur && <Pip mood="happy" size={64} className={`absolute top-2 ${x > 0 ? 'right-full mr-3' : 'left-full ml-3'}`} />}
                      <button
                        ref={isCur ? current : undefined}
                        disabled={st.status === 'locked'}
                        onClick={() => (st.status === 'done' ? setPick(st) : go(`/lesson/${st.lesson.id}`))}
                        aria-label={`${st.lesson.title}${st.status === 'done' ? s.legendary?.[st.lesson.id] ? ', legendary' : ', done' : st.status === 'locked' ? ', locked' : st.status === 'skipped' ? ', skipped, open to review' : st.status === 'open' ? ', open' : ', start'}`}
                        className={`grid place-items-center rounded-full border-4 transition-transform active:translate-y-1 ${
                          isCur ? 'anim-pulse size-20 bg-card' : 'size-16'
                        } ${st.status === 'done' ? 'text-white' : ''} ${st.status === 'locked' ? 'border-rule bg-card text-ink-3' : ''} ${st.status === 'skipped' ? 'border-dashed bg-card' : ''} ${st.status === 'open' ? 'bg-card' : ''}`}
                        style={
                          st.status === 'done' && s.legendary?.[st.lesson.id]
                            ? { background: color, borderColor: '#ffc531', boxShadow: '0 5px 0 #a87a00' }
                            : st.status === 'done'
                            ? { background: color, borderColor: color, boxShadow: `0 5px 0 color-mix(in srgb, ${color} 70%, black)` }
                            : isCur
                              ? { borderColor: color, color, boxShadow: `0 5px 0 color-mix(in srgb, ${color} 70%, black)` }
                              : st.status === 'skipped' || st.status === 'open'
                                ? { borderColor: color, color, boxShadow: '0 5px 0 var(--color-rule)' }
                              : { boxShadow: '0 5px 0 var(--color-rule)' }
                        }
                      >
                        {st.status === 'done' && s.legendary?.[st.lesson.id] ? <Crown size={26} strokeWidth={2.5} /> : st.status === 'done' ? <Check size={28} strokeWidth={3} /> : st.status === 'skipped' ? <FastForward size={24} /> : st.status === 'open' ? <Play size={24} /> : st.status === 'locked' ? <Lock size={22} /> : <span className="font-display text-lg font-extrabold">Start</span>}
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
      {pick && (
        <div className="fixed inset-0 z-20 grid place-items-end bg-ink/40 sm:place-items-center" onClick={() => setPick(null)}>
          <div className="anim-rise w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="pick-title">
            <h2 id="pick-title" className="text-2xl font-bold">{pick.lesson.title}</h2>
            {s.legendary?.[pick.lesson.id] ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gold"><Crown size={16} /> Legendary</p>
            ) : (
              <p className="mt-1 text-sm text-ink-2">Legendary: no hints, {LEGENDARY_MISTAKES} mistakes allowed. Win a gold crown and {LEGENDARY_GEMS} gems.</p>
            )}
            <div className="mt-5 grid gap-3">
              {!s.legendary?.[pick.lesson.id] && (
                <button className="btn" autoFocus onClick={() => go(`/lesson/${pick.lesson.id}?mode=legendary`)}>
                  <Crown size={18} /> Go legendary
                </button>
              )}
              <button className={`btn ${s.legendary?.[pick.lesson.id] ? '' : 'btn-ghost'}`} onClick={() => go(`/lesson/${pick.lesson.id}`)}>Practice again</button>
              <button className="btn btn-ghost" onClick={() => setPick(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
