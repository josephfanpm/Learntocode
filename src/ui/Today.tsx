import { Check, Gift, RotateCcw, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dayKey } from '../engine/dates'
import { boostActive, claimChest, dueMistakes, QUEST_CHEST, QUESTS, questsDone, questsFor, REVIEW_SIZE } from '../engine/gamify'
import { play } from '../sound'
import { useStore } from '../store'
import type { Go } from './Home'

/** Minutes left on the double-XP boost, ticking while it runs. */
export function useBoostLeft(): number {
  const { s } = useStore()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!s.boostUntil) return
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [s.boostUntil])
  return boostActive(s, now) ? Math.ceil((new Date(s.boostUntil!).getTime() - now.getTime()) / 60_000) : 0
}

/** Daily quests and the mistake review, above the lesson path. */
export function Today({ go }: { go: Go }) {
  const { s, update } = useStore()
  const today = dayKey(new Date())
  const q = questsFor(s, today)
  const done = questsDone(q)
  const due = dueMistakes(s, today).length

  return (
    <section aria-labelledby="today-h" className="mt-4 space-y-3">
      <div className="rounded-2xl border-2 border-rule bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="today-h" className="font-display text-lg font-bold">Daily quests</h2>
          <span className="text-xs text-ink-3">New ones tomorrow</span>
        </div>
        <ul className="space-y-2.5">
          {q.ids.map((id) => {
            const def = QUESTS[id]
            const v = q.progress[id] ?? 0
            const ok = v >= def.goal
            return (
              <li key={id} className="flex items-center gap-3">
                <span className={`grid size-6 shrink-0 place-items-center rounded-full ${ok ? 'bg-good text-white' : 'border-2 border-rule'}`} aria-hidden>
                  {ok && <Check size={14} strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${ok ? 'text-ink-3 line-through' : ''}`}>{def.text}</p>
                  {def.goal > 1 && !ok && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rule" role="progressbar" aria-label={def.text} aria-valuenow={v} aria-valuemin={0} aria-valuemax={def.goal}>
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(v / def.goal) * 100}%` }} />
                    </div>
                  )}
                </div>
                {def.goal > 1 && <span className="text-xs text-ink-3 tabular-nums">{v}/{def.goal}</span>}
              </li>
            )
          })}
        </ul>
        {q.claimed ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-3"><Gift size={16} /> Chest opened. +{QUEST_CHEST} gems.</p>
        ) : (
          <button
            className="btn mt-3 w-full !py-2 text-sm"
            disabled={!done}
            onClick={() => {
              play('complete')
              update((p) => claimChest(p, today) ?? p)
            }}
          >
            <Gift size={16} /> {done ? `Open chest: +${QUEST_CHEST} gems` : `Finish all three for ${QUEST_CHEST} gems`}
          </button>
        )}
      </div>

      {due > 0 && (
        <button onClick={() => go('/review')} className="tile flex w-full items-center gap-3 px-4 py-3 text-left">
          <RotateCcw size={22} className="shrink-0 text-gold" />
          <span className="flex-1">
            <span className="block font-semibold">Fix your mistakes</span>
            <span className="text-sm text-ink-2">
              {Math.min(due, REVIEW_SIZE)} {Math.min(due, REVIEW_SIZE) === 1 ? 'question' : 'questions'} to try again
            </span>
          </span>
        </button>
      )}
    </section>
  )
}

/** Small "2× XP" chip for the top bar while a boost runs. */
export function BoostChip() {
  const left = useBoostLeft()
  if (!left) return null
  return (
    <span className="flex items-center gap-0.5 rounded-lg bg-gold/15 px-1.5 py-1 text-xs font-bold text-gold" aria-label={`Double XP, ${left} minutes left`}>
      <Zap size={13} fill="currentColor" /> 2× {left}m
    </span>
  )
}
