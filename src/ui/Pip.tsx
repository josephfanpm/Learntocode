// Pip, the ByteQuest mascot: a pixel-art red panda. Seven moods share one
// body; the face, paws and little effects change.
import { useMemo } from 'react'
import { PixelSprite } from './pixel/PixelSprite'
import { critter, type Face } from './pixel/sprites'

export type Mood = Face

export const MOODS: Mood[] = ['happy', 'wave', 'cheer', 'oops', 'think', 'sleepy', 'celebrate']

const LABEL: Record<Mood, string> = {
  happy: 'Pip the red panda, smiling',
  wave: 'Pip the red panda, waving hello',
  cheer: 'Pip the red panda, cheering',
  oops: 'Pip the red panda, looking sheepish',
  think: 'Pip the red panda, thinking',
  sleepy: 'Pip the red panda, asleep',
  celebrate: 'Pip the red panda, celebrating',
}

export function Pip({ mood = 'happy', size = 96, className = '', title }: { mood?: Mood; size?: number; className?: string; title?: string }) {
  const pixels = useMemo(() => critter({ animal: 'redpanda', fur: 'ginger', face: mood, body: true, tail: true }), [mood])
  const motion = mood === 'cheer' || mood === 'celebrate' ? 'pip-bounce' : mood === 'sleepy' ? 'pip-breathe' : mood === 'wave' ? 'pip-sway' : ''
  return (
    <span className={`inline-block ${className}`} style={{ lineHeight: 0 }}>
      <span className={`inline-block ${motion}`} style={{ transformOrigin: '50% 100%' }}>
        <PixelSprite pixels={pixels} view={[-3, -4, 26, 24]} width={size} label={title ?? LABEL[mood]} />
      </span>
    </span>
  )
}
