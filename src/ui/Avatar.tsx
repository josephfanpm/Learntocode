import { Dices } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AvatarSpec } from '../engine/state'
import { play } from '../sound'
import { useStore } from '../store'
import type { Go } from './Home'
import { PixelSprite } from './pixel/PixelSprite'
import { critter, type Pixel } from './pixel/sprites'

// Pixel-art profile pictures in the same style as Pip.

export const ANIMALS: { id: AvatarSpec['animal']; label: string; fur: AvatarSpec['fur'] }[] = [
  { id: 'redpanda', label: 'Red panda', fur: 'ginger' },
  { id: 'cat', label: 'Cat', fur: 'grey' },
  { id: 'bunny', label: 'Bunny', fur: 'white' },
  { id: 'bear', label: 'Bear', fur: 'brown' },
]
export const FUR_OPTIONS: { id: AvatarSpec['fur']; label: string; swatch: string }[] = [
  { id: 'ginger', label: 'Ginger', swatch: '#d9622b' },
  { id: 'grey', label: 'Grey', swatch: '#9aa3b5' },
  { id: 'cream', label: 'Cream', swatch: '#efd3a8' },
  { id: 'brown', label: 'Brown', swatch: '#8a5a3b' },
  { id: 'black', label: 'Black', swatch: '#3d3d4e' },
  { id: 'white', label: 'White', swatch: '#f4f4f7' },
]
export const FACES: { id: AvatarSpec['face']; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'cheer', label: 'Delighted' },
  { id: 'think', label: 'Curious' },
  { id: 'oops', label: 'Worried' },
  { id: 'sleepy', label: 'Sleepy' },
]
export const ACCESSORIES: { id: AvatarSpec['accessory']; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'bow', label: 'Bow' },
  { id: 'crown', label: 'Crown' },
]
export const BGS = ['#cfe0ff', '#ffe1c7', '#d6f3e4', '#efe1ff', '#ffd9e2', '#fff1b8']

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export function randomAvatar(): AvatarSpec {
  return {
    animal: pick(ANIMALS).id,
    fur: pick(FUR_OPTIONS).id,
    face: pick(FACES).id,
    accessory: pick(ACCESSORIES).id,
    bg: pick(BGS),
  }
}

const VIEW: [number, number, number, number] = [-2, -4, 24, 22]

function avatarPixels(a: AvatarSpec): Pixel[] {
  return critter({ animal: a.animal, fur: a.fur, face: a.face, accessory: a.accessory, body: true, effects: false })
}

/** Grey silhouette shown until the learner makes an avatar. */
const PLACEHOLDER: Pixel[] = critter({ animal: 'redpanda', fur: 'grey', face: 'happy', body: true, effects: false }).map(([x, y]) => [x, y, '#c3cad8'])

export function Avatar({ avatar, size = 40, className = '', label }: { avatar?: AvatarSpec; size?: number; className?: string; label?: string }) {
  const pixels = useMemo(() => (avatar ? avatarPixels(avatar) : PLACEHOLDER), [avatar])
  return (
    <span
      className={`relative inline-flex shrink-0 items-end justify-center overflow-hidden rounded-[28%] ${className}`}
      style={{ width: size, height: size, background: avatar?.bg ?? '#e4e9f2' }}
    >
      <PixelSprite pixels={pixels} view={VIEW} width={size * 0.98} label={label ?? (avatar ? 'Your avatar' : 'No avatar yet')} />
    </span>
  )
}

function Option({ selected, onClick, label, children }: { selected: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button aria-pressed={selected} aria-label={label} title={label} onClick={onClick} className="tile grid place-items-center p-1.5">
      {children}
    </button>
  )
}

export function AvatarBuilder({ go }: { go: Go }) {
  const { s, update } = useStore()
  const [a, setA] = useState<AvatarSpec>(() => s.avatar ?? { animal: 'redpanda', fur: 'ginger', face: 'happy', accessory: 'none', bg: BGS[0] })
  const set = (patch: Partial<AvatarSpec>) => setA((cur) => ({ ...cur, ...patch }))

  const save = () => {
    update((p) => ({ ...p, avatar: a }))
    play('complete')
    go('/me')
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-28">
      <h1 className="text-3xl font-bold">{s.avatar ? 'Edit your avatar' : 'Make your avatar'}</h1>
      <div className="mt-5 flex items-end gap-4">
        <Avatar avatar={a} size={148} className="border-4 border-white shadow-[0_6px_0_var(--color-rule)]" />
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => setA(randomAvatar())}>
          <Dices size={16} /> Surprise me
        </button>
      </div>

      <section className="mt-7" aria-labelledby="av-animal">
        <h2 id="av-animal" className="mb-2 text-lg font-bold">Animal</h2>
        <div className="grid grid-cols-4 gap-2">
          {ANIMALS.map((o) => (
            <Option key={o.id} selected={a.animal === o.id} onClick={() => set({ animal: o.id, fur: o.fur })} label={o.label}>
              <Avatar avatar={{ ...a, animal: o.id, fur: o.fur, accessory: 'none' }} size={60} label={o.label} />
              <span className="mt-1 text-xs font-medium">{o.label}</span>
            </Option>
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="av-fur">
        <h2 id="av-fur" className="mb-2 text-lg font-bold">Fur</h2>
        <div className="flex flex-wrap gap-2">
          {FUR_OPTIONS.map((o) => (
            <button
              key={o.id}
              aria-pressed={a.fur === o.id}
              aria-label={o.label}
              title={o.label}
              onClick={() => set({ fur: o.id })}
              className={`size-11 rounded-xl border-4 ${a.fur === o.id ? 'border-cobalt' : 'border-white shadow-[0_0_0_2px_var(--color-rule)]'}`}
              style={{ background: o.swatch }}
            />
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="av-face">
        <h2 id="av-face" className="mb-2 text-lg font-bold">Expression</h2>
        <div className="grid grid-cols-5 gap-2">
          {FACES.map((o) => (
            <Option key={o.id} selected={a.face === o.id} onClick={() => set({ face: o.id })} label={o.label}>
              <Avatar avatar={{ ...a, face: o.id }} size={52} label={o.label} />
            </Option>
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="av-acc">
        <h2 id="av-acc" className="mb-2 text-lg font-bold">Accessory</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ACCESSORIES.map((o) => (
            <Option key={o.id} selected={a.accessory === o.id} onClick={() => set({ accessory: o.id })} label={o.label}>
              <Avatar avatar={{ ...a, accessory: o.id }} size={56} label={o.label} />
              <span className="mt-1 text-xs font-medium">{o.label}</span>
            </Option>
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="av-bg">
        <h2 id="av-bg" className="mb-2 text-lg font-bold">Background</h2>
        <div className="flex flex-wrap gap-2">
          {BGS.map((c) => (
            <button
              key={c}
              aria-pressed={a.bg === c}
              aria-label={`Background ${c}`}
              onClick={() => set({ bg: c })}
              className={`size-11 rounded-xl border-4 ${a.bg === c ? 'border-cobalt' : 'border-white shadow-[0_0_0_2px_var(--color-rule)]'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button className="btn" onClick={save}>Save avatar</button>
        <button className="btn btn-ghost" onClick={() => go('/me')}>Cancel</button>
      </div>
    </div>
  )
}
