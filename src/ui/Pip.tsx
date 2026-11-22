// Pip, the ByteQuest mascot: a pixel-art red panda.
//
// Animation works like a tiny state machine (the pixel-art take on how
// character tools such as Rive are used): each mood is a state with its own
// frames, and an idle layer (blinking, a 1-pixel bob) runs underneath.
// Frame swaps are instant, as in sprite animation; whole-body moves (hop,
// shake, bob) are CSS on transform. Reduced motion: no frames, no moves.
import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '../motion'
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

/** Frame timing per mood: ms per frame, and how many frames to play (0 = loop). */
const FRAMES: Partial<Record<Mood, { ms: number; count: number }>> = {
  wave: { ms: 170, count: 8 },
  cheer: { ms: 130, count: 6 },
  celebrate: { ms: 240, count: 0 },
  sleepy: { ms: 1000, count: 0 },
  think: { ms: 700, count: 0 },
}

/** Whole-body motion per mood (CSS classes in index.css). */
const BODY: Record<Mood, string> = {
  happy: 'pip-bob',
  wave: 'pip-bob',
  think: 'pip-bob',
  sleepy: 'pip-bob pip-slow',
  cheer: 'pip-hop',
  celebrate: 'pip-hop pip-hop-loop',
  oops: 'pip-shake',
}

// Re-exported so existing imports keep working.
export { useReducedMotion }

export function Pip({ mood = 'happy', size = 96, className = '', title, still = false }: { mood?: Mood; size?: number; className?: string; title?: string; still?: boolean }) {
  const reduce = useReducedMotion()
  const animate = !still && !reduce
  const [blink, setBlink] = useState(false)
  const [frame, setFrame] = useState(0)

  // Idle layer: blink every few seconds, at slightly random intervals so it feels alive.
  useEffect(() => {
    if (!animate) return
    let open: ReturnType<typeof setTimeout>
    let close: ReturnType<typeof setTimeout>
    const schedule = () => {
      open = setTimeout(() => {
        setBlink(true)
        close = setTimeout(() => {
          setBlink(false)
          schedule()
        }, 130)
      }, 2400 + Math.random() * 2800)
    }
    schedule()
    return () => {
      clearTimeout(open)
      clearTimeout(close)
    }
  }, [animate])

  // Mood layer: play this mood's frames.
  useEffect(() => {
    setFrame(0)
    const f = FRAMES[mood]
    if (!animate || !f) return
    let n = 0
    const id = setInterval(() => {
      n++
      setFrame(n)
      if (f.count && n >= f.count) {
        clearInterval(id)
        setFrame(0)
      }
    }, f.ms)
    return () => clearInterval(id)
  }, [mood, animate])

  const pixels = useMemo(() => critter({ animal: 'redpanda', fur: 'ginger', face: mood, body: true, tail: true, blink, frame }), [mood, blink, frame])
  return (
    <span className={`inline-block ${className}`} style={{ lineHeight: 0, ['--u' as string]: `${size / 26}px` }}>
      <span key={mood} className={`inline-block ${animate ? BODY[mood] : ''}`}>
        <PixelSprite pixels={pixels} view={[-3, -4, 26, 24]} width={size} label={title ?? LABEL[mood]} />
      </span>
    </span>
  )
}
