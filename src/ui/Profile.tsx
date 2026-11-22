import { ArrowLeft, Award, Copy, Download, Flame, Gem, Pencil, Settings as SettingsIcon, Snowflake, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { units } from '../content'
import { addDays, dayKey, parseDay } from '../engine/dates'
import { badges } from '../engine/progress'
import { buyFreeze, exportSave, FREEZE_PRICE, importSave, longestStreak, MAX_FREEZES, practicedToday, reset, streak } from '../engine/state'
import { useDeviceReduces, useReducedMotion } from '../motion'
import { play, setSoundEnabled } from '../sound'
import { useStore } from '../store'
import { Avatar } from './Avatar'
import { badgeBackground, badgePixels } from './pixel/icons'
import { PixelSprite } from './pixel/PixelSprite'
import { GOALS } from './Onboarding'
import type { Go } from './Home'

export function Profile({ go }: { go: Go }) {
  const { s, update } = useStore()
  const today = dayKey(new Date())
  const best = longestStreak(s)
  const xpToday = s.activity[today]?.xp ?? 0
  const all = badges(units, s, best)

  useEffect(() => {
    const id = location.hash.split('#')[2]
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  // Five weeks, Monday-first, ending this week.
  const end = parseDay(today)
  const mondayOffset = (end.getDay() + 6) % 7
  const start = addDays(today, -mondayOffset - 28)
  const days = Array.from({ length: 35 }, (_, i) => addDays(start, i))

  const stat = (label: string, value: React.ReactNode, icon: React.ReactNode) => (
    <div className="rounded-2xl border-2 border-rule bg-card p-4">
      <div className="flex items-center gap-2 font-display text-2xl font-bold">{icon}{value}</div>
      <p className="text-sm text-ink-3">{label}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-6 pb-28">
      <div className="flex items-center gap-4">
        <button onClick={() => go('/avatar')} className="group relative rounded-[28%]" aria-label={s.avatar ? 'Edit your avatar' : 'Make your avatar'}>
          <Avatar avatar={s.avatar} size={84} className="border-4 border-white shadow-[0_5px_0_var(--color-rule)]" />
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-white bg-cobalt text-white">
            <Pencil size={13} />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{s.name || 'Your progress'}</h1>
          <p className="text-ink-2">{practicedToday(s, today) ? 'Practiced today.' : 'No lesson yet today.'}</p>
          {!s.avatar && (
            <button className="mt-1 text-sm font-semibold text-cobalt" onClick={() => go('/avatar')}>Make your avatar</button>
          )}
        </div>
        <button onClick={() => go('/settings')} aria-label="Settings" className="self-start rounded-xl p-2 text-ink-2 hover:bg-cobalt-soft hover:text-ink">
          <SettingsIcon size={26} />
        </button>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {stat('Current streak', streak(s, today), <Flame className="text-flame" fill="currentColor" size={24} />)}
        {stat('Longest streak', best, <Flame className="text-ink-3" size={24} />)}
        {stat('Total XP', s.xp, <span className="text-cobalt">⚡</span>)}
        {stat('Lessons done', Object.keys(s.completed).length, <Award className="text-good" size={24} />)}
      </section>

      <section aria-label="Daily goal" className="rounded-2xl border-2 border-rule bg-card p-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Today’s goal</span>
          <span className="text-ink-2 tabular-nums">{Math.min(xpToday, s.dailyGoal)} / {s.dailyGoal} XP</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={Math.min(xpToday, s.dailyGoal)} aria-valuemin={0} aria-valuemax={s.dailyGoal}>
          <div className="bar-fill h-full rounded-full bg-flame" style={{ width: `${Math.min(100, (xpToday / s.dailyGoal) * 100)}%` }} />
        </div>
      </section>

      <section aria-labelledby="cal">
        <h2 id="cal" className="mb-3 text-xl font-bold">Last five weeks</h2>
        <div className="grid grid-cols-7 gap-1.5 rounded-2xl border-2 border-rule bg-card p-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="text-center text-xs text-ink-3">{d}</span>)}
          {days.map((d) => {
            const a = s.activity[d]
            const future = d > today
            const cls = future ? 'bg-transparent' : a?.xp ? (a.xp >= s.dailyGoal ? 'bg-flame text-white' : 'bg-flame/40') : a?.frozen ? 'bg-[#16385a] text-[#7cc4f5]' : 'bg-paper'
            return (
              <span key={d} title={`${d}: ${a?.xp ?? 0} XP${a?.frozen ? ' (freeze)' : ''}`} className={`grid aspect-square place-items-center rounded-lg text-xs ${cls} ${d === today ? 'ring-2 ring-ink' : ''}`}>
                {a?.frozen ? <Snowflake size={12} /> : future ? '' : parseDay(d).getDate()}
              </span>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-ink-3">Solid orange: daily goal met. Light: practiced. Blue: a freeze covered the day.</p>
      </section>

      <section id="shop" aria-labelledby="shop-h">
        <h2 id="shop-h" className="mb-3 text-xl font-bold">Shop</h2>
        <div className="flex items-center gap-4 rounded-2xl border-2 border-rule bg-card p-4">
          <Snowflake size={36} className="shrink-0 text-[#7cc4f5]" />
          <div className="flex-1">
            <p className="font-semibold">Streak freeze</p>
            <p className="text-sm text-ink-2">Covers one missed day. You can hold {MAX_FREEZES}. You have {s.freezes}.</p>
          </div>
          <button className="btn !px-3 !py-2 text-sm" disabled={s.gems < FREEZE_PRICE || s.freezes >= MAX_FREEZES} onClick={() => update((p) => buyFreeze(p) ?? p)}>
            <Gem size={15} /> {FREEZE_PRICE}
          </button>
        </div>
      </section>

      <section aria-labelledby="badges">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="badges" className="text-xl font-bold">Badges</h2>
          <p className="text-sm text-ink-2">{all.filter((b) => b.tier !== 'locked').length} of {all.length} earned</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...all.filter((b) => b.tier !== 'locked'), ...all.filter((b) => b.tier === 'locked')].map((b) => {
            const maxed = b.tier === 'gold' && b.value >= b.goal
            return (
              <li key={b.id} className={`flex flex-col items-center rounded-2xl border-2 p-3 text-center ${b.tier === 'locked' ? 'border-rule bg-card' : 'border-rule bg-card'}`}>
                <span className="grid size-20 place-items-center rounded-2xl" style={{ background: badgeBackground(b.tier) }}>
                  <PixelSprite pixels={badgePixels(b.icon, b.tier)} view={[-1, -1, 14, 14]} width={64} label={`${b.name} badge, ${b.tier === 'locked' ? 'locked' : b.tier}`} />
                </span>
                <p className={`mt-2 font-display leading-tight font-bold ${b.tier === 'locked' ? 'text-ink-3' : ''}`}>{b.name}</p>
                <p className="mt-0.5 text-xs font-semibold capitalize" style={{ color: b.tier === 'gold' ? '#ffc531' : b.tier === 'silver' ? '#c5cde0' : b.tier === 'bronze' ? '#e39a5c' : 'var(--color-ink-3)' }}>
                  {b.tier === 'locked' ? 'Locked' : b.tier}
                </p>
                <p className="mt-1 min-h-8 text-xs leading-tight text-ink-2">{maxed ? 'Top tier reached' : b.goalText}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-rule" role="progressbar" aria-valuenow={b.value} aria-valuemin={0} aria-valuemax={b.goal}>
                  <div className="h-full rounded-full" style={{ width: `${(b.value / b.goal) * 100}%`, background: maxed ? '#ffc531' : 'var(--color-cobalt)' }} />
                </div>
                <p className="mt-1 text-[0.7rem] text-ink-3 tabular-nums">{b.value.toLocaleString('en-US')} / {b.goal.toLocaleString('en-US')}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

/** Back up progress to a file or a save code, and restore it on any device. */
function SaveProgress() {
  const { s, update } = useStore()
  const [code, setCode] = useState('')
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const lessons = Object.keys(s.completed).length

  const download = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bytequest-save-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setNote({ ok: true, text: 'Backup file downloaded.' })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportSave(s))
      setNote({ ok: true, text: 'Save code copied. Paste it into ByteQuest on another device.' })
    } catch {
      setCode(exportSave(s))
      setNote({ ok: true, text: 'Copy the code from the box below.' })
    }
  }

  const restore = (text: string) => {
    const next = importSave(text)
    if (!next) return setNote({ ok: false, text: 'That isn’t a ByteQuest save. Check you copied the whole code.' })
    const n = Object.keys(next.completed).length
    if (lessons > n && !confirm(`This save has ${n} finished lessons; this device has ${lessons}. Replace this device’s progress?`)) return
    update(() => next)
    setCode('')
    setNote({ ok: true, text: `Restored: ${n} ${n === 1 ? "lesson" : "lessons"}, ${next.xp} XP.` })
  }

  return (
    <section id="save" aria-labelledby="save-h">
      <h2 id="save-h" className="mb-1 text-xl font-bold">Save your progress</h2>
      <p className="mb-3 text-sm text-ink-2">Progress is kept in this browser. Back it up, or move it to another device.</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <button className="btn btn-ghost !py-2.5 text-sm" onClick={download}><Download size={16} /> Backup file</button>
        <button className="btn btn-ghost !py-2.5 text-sm" onClick={copy}><Copy size={16} /> Copy save code</button>
        <button className="btn btn-ghost !py-2.5 text-sm" onClick={() => file.current?.click()}><Upload size={16} /> Restore from file</button>
      </div>
      <input
        ref={file}
        type="file"
        accept="application/json,.json,.txt"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) restore(await f.text())
          e.target.value = ''
        }}
      />
      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste a save code"
          aria-label="Save code"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border-2 border-rule bg-card px-3 py-2.5 font-mono text-sm outline-none focus:border-cobalt"
        />
        <button className="btn !py-2.5 text-sm" disabled={!code.trim()} onClick={() => restore(code)}>Restore</button>
      </div>
      {note && <p className={`mt-2 text-sm ${note.ok ? 'text-good' : 'text-bad'}`} role="status">{note.text}</p>}
    </section>
  )
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? 'bg-good' : 'bg-rule'}`}>
      <span className={`absolute top-1 size-6 rounded-full bg-[#fff] transition-[left] ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

function Row({ title, note, children, dashed = false }: { title: string; note: string; children: React.ReactNode; dashed?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl border-2 bg-card p-4 ${dashed ? 'border-dashed border-rule' : 'border-rule'}`}>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-ink-2">{note}</p>
      </div>
      {children}
    </div>
  )
}

/** Everything adjustable, kept off the profile: opened from the gear icon. */
export function Settings({ go }: { go: Go }) {
  const { s, update } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [notice, setNotice] = useState('')
  const motionReduced = useReducedMotion()
  const deviceSaysReduce = useDeviceReduces()

  const togglePush = async () => {
    if (s.pushEnabled) return update((p) => ({ ...p, pushEnabled: false }))
    if (typeof Notification === 'undefined') return setNotice('This browser doesn’t support notifications.')
    const perm = await Notification.requestPermission()
    if (perm === 'granted') update((p) => ({ ...p, pushEnabled: true }))
    else setNotice('Notifications are blocked. Allow them in your browser’s site settings.')
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-6 pb-28">
      <div className="flex items-center gap-2">
        <button onClick={() => go('/me')} aria-label="Back to profile" className="-ml-2 rounded-xl p-2 text-ink-2 hover:bg-cobalt-soft hover:text-ink">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input value={s.name} maxLength={30} onChange={(e) => update((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-xl border-2 border-rule bg-card px-3 py-2.5 outline-none focus:border-cobalt" />
      </label>

      <div>
        <p className="text-sm font-medium">Daily goal</p>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {GOALS.map((g) => (
            <button key={g.xp} aria-pressed={s.dailyGoal === g.xp} onClick={() => update((p) => ({ ...p, dailyGoal: g.xp }))} className="tile py-2 text-sm">
              <span className="block font-semibold">{g.label}</span>
              <span className="text-ink-3">{g.xp} XP</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Row title="Sound effects" note="Chimes for answers and finished lessons.">
          <Toggle
            on={s.sound !== false}
            label="Sound effects"
            onClick={() => {
              const on = s.sound === false
              update((p) => ({ ...p, sound: on }))
              if (on) {
                setSoundEnabled(true)
                play('correct')
              }
            }}
          />
        </Row>
        <Row title="Animations" note={deviceSaysReduce ? 'Your device asks for reduced motion. Turn this off if movement bothers you.' : 'Pip, scenery, confetti and screen transitions.'}>
          <Toggle on={!motionReduced} label="Animations" onClick={() => update((p) => ({ ...p, motion: motionReduced ? 'on' : 'off' }))} />
        </Row>
        <Row title="Reminders" note="One a day, around the time you usually practice.">
          <Toggle on={s.pushEnabled} label="Reminders" onClick={togglePush} />
        </Row>
        {notice && <p className="text-sm text-bad">{notice}</p>}
      </div>

      <SaveProgress />

      <section aria-labelledby="proto" className="space-y-3">
        <h2 id="proto" className="text-xl font-bold">Prototype</h2>
        <Row dashed title="Unlock all lessons" note="Open every lesson on the path so you can try any of them.">
          <Toggle on={!!s.unlockAll} label="Unlock all lessons" onClick={() => update((p) => ({ ...p, unlockAll: !p.unlockAll }))} />
        </Row>
        <button className="btn btn-ghost text-sm" onClick={() => go('/sample')}>See the pixel-adventure design sample</button>
        {!confirmReset ? (
          <button className="btn btn-ghost text-sm" onClick={() => setConfirmReset(true)}>Reset progress</button>
        ) : (
          <button className="btn btn-bad text-sm" onClick={() => { reset(); location.hash = '#/'; location.reload() }}>Erase everything</button>
        )}
      </section>
    </div>
  )
}
