import '@fontsource/press-start-2p'
import { Check, Lock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../../sound'
import { setMotionPref, useDeviceReduces, useReducedMotion } from '../../motion'
import { useStore } from '../../store'
import { Pip } from '../Pip'
import { DRIFT, drift, easeOut, HERO, progress, twinkle, typed } from './timeline'

// A sample of the pixel-adventure direction: a welcome screen and one course
// "world" header, each shown with a free CC0 art pack and with scenery drawn
// in code, so the two can be compared before the whole app is restyled.

type Art = 'pack' | 'code'

/** Milliseconds since mount, updated every frame. Frozen at a late moment under reduced motion. */
function useClock(): number {
  const reduce = useReducedMotion()
  const [t, setT] = useState(reduce ? 60_000 : 0)
  useEffect(() => {
    if (reduce) return setT(60_000)
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      setT(now - start)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])
  return t
}

const W = 272
const H = 160
const BASE = import.meta.env.BASE_URL

// ---------- Scenery from the art pack ----------

function PackLayer({ src, t, speed, width = W }: { src: string; t: number; speed: number; width?: number }) {
  // Each layer is drawn in scene pixels and tiled; the whole scene is scaled up by its container.
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${BASE}art/${src})`,
        backgroundRepeat: 'repeat-x',
        // Fill the height and keep the art's proportions; the sides crop instead of stretching.
        backgroundSize: `${(width / H) * 100}cqh 100%`,
        backgroundPositionX: `${(-drift(t, speed, width) / H) * 100}cqh`,
        imageRendering: 'pixelated',
      }}
    />
  )
}

function PackMountains({ t }: { t: number }) {
  return (
    <>
      <PackLayer src="mountain/parallax-mountain-bg.png" t={0} speed={0} />
      <PackLayer src="mountain/parallax-mountain-montain-far.png" t={t} speed={DRIFT.far} />
      <PackLayer src="mountain/parallax-mountain-mountains.png" t={t} speed={DRIFT.mid} width={544} />
      <PackLayer src="mountain/parallax-mountain-trees.png" t={t} speed={DRIFT.near} width={544} />
      <PackLayer src="mountain/parallax-mountain-foreground-trees.png" t={t} speed={DRIFT.front} width={544} />
    </>
  )
}

function PackForest({ t }: { t: number }) {
  return (
    <>
      <PackLayer src="forest/parallax-forest-back-trees.png" t={t} speed={DRIFT.far} />
      <PackLayer src="forest/parallax-forest-lights.png" t={t} speed={DRIFT.mid} />
      <PackLayer src="forest/parallax-forest-middle-trees.png" t={t} speed={DRIFT.near} />
      <PackLayer src="forest/parallax-forest-front-trees.png" t={t} speed={DRIFT.front} />
    </>
  )
}

// ---------- Scenery drawn in code ----------

/** A ridge line that tiles every W pixels: a few sine waves, snapped to whole pixels. */
function ridge(base: number, waves: [amp: number, cycles: number, phase: number][]): number[] {
  return Array.from({ length: W }, (_, x) => Math.round(base + waves.reduce((s, [a, k, p]) => s + a * Math.sin((2 * Math.PI * k * x) / W + p), 0)))
}

/** Filled silhouette below a ridge, as merged pixel columns. */
function Ridge({ tops, fill, offset }: { tops: number[]; fill: string; offset: number }) {
  const rects = useMemo(() => {
    const out: { x: number; w: number; y: number }[] = []
    let start = 0
    for (let x = 1; x <= W; x++)
      if (x === W || tops[x] !== tops[start]) {
        out.push({ x: start, w: x - start, y: tops[start] })
        start = x
      }
    return out
  }, [tops])
  return (
    <g transform={`translate(${-offset} 0)`} fill={fill}>
      {[0, W].map((dx) => rects.map((r, i) => <rect key={`${dx}-${i}`} x={r.x + dx} y={r.y} width={r.w + 0.05} height={H - r.y} />))}
    </g>
  )
}

function Trees({ offset, color, y, step, tall }: { offset: number; color: string; y: number; step: number; tall: number }) {
  const trees = useMemo(() => Array.from({ length: Math.ceil(W / step) }, (_, i) => ({ x: i * step + ((i * 7) % 5), h: tall + ((i * 13) % 7) })), [step, tall])
  return (
    <g transform={`translate(${-offset} 0)`} fill={color}>
      {[0, W].map((dx) =>
        trees.map((tr, i) => (
          <g key={`${dx}-${i}`}>
            {Array.from({ length: Math.ceil(tr.h / 2) }, (_, r) => (
              <rect key={r} x={tr.x + dx - r * 0.5} y={y - tr.h + r * 2} width={1 + r} height={2.05} />
            ))}
            <rect x={tr.x + dx} y={y} width={1} height={3} />
          </g>
        )),
      )}
    </g>
  )
}

const SKY = ['#141a3c', '#1c2352', '#2a2c6b', '#44387f', '#6a4488', '#96528a', '#c96a80', '#ee8f77']
const STARS = Array.from({ length: 34 }, (_, i) => ({ x: (i * 53) % W, y: (i * 29) % 70, s: i }))

function CodeScene({ t, forest = false }: { t: number; forest?: boolean }) {
  const far = useMemo(() => ridge(96, [[14, 2, 0.4], [6, 5, 1.9], [3, 11, 0.2]]), [])
  const mid = useMemo(() => ridge(112, [[10, 3, 2.2], [5, 7, 0.7], [2, 13, 1.1]]), [])
  const hill = useMemo(() => ridge(136, [[5, 2, 1.0], [2, 6, 2.6]]), [])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" shapeRendering="crispEdges" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {SKY.map((c, i) => (
        <rect key={c} x="0" y={(i * H) / SKY.length - 0.5} width={W} height={H / SKY.length + 1} fill={forest ? ['#0e1f2b', '#11293a', '#143447', '#184153', '#1e4f5d', '#266067', '#33756f', '#4c8f78'][i] : c} />
      ))}
      {!forest && STARS.map((s) => <rect key={s.s} x={s.x} y={s.y} width="1" height="1" fill="#fff6d8" opacity={twinkle(t, s.s)} />)}
      {!forest && (
        <g fill="#fff3c9">
          <rect x="172" y="10" width="14" height="14" />
          <rect x="170" y="12" width="18" height="10" />
          <rect x="174" y="8" width="10" height="18" />
        </g>
      )}
      <Ridge tops={far} fill={forest ? '#1b4a55' : '#3c2f6e'} offset={drift(t, DRIFT.far, W)} />
      <Ridge tops={mid} fill={forest ? '#153a45' : '#2a2253'} offset={drift(t, DRIFT.mid, W)} />
      <Trees offset={drift(t, DRIFT.near, W)} color={forest ? '#0f2c35' : '#1b1640'} y={132} step={9} tall={forest ? 26 : 12} />
      <Ridge tops={hill} fill={forest ? '#0c232b' : '#141032'} offset={drift(t, DRIFT.front, W)} />
      <Trees offset={drift(t, DRIFT.front, W)} color={forest ? '#081a20' : '#0d0a25'} y={150} step={23} tall={forest ? 44 : 20} />
    </svg>
  )
}

// ---------- Ambient life: always moving, a little ----------

const SPARKS = [
  [22, 18], [70, 9], [118, 26], [160, 12], [205, 30], [240, 8], [48, 44], [186, 52],
]

/** Four-point pixel sparkles that fade in and out, each a beat after the last. */
function Sparkles() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" shapeRendering="crispEdges" preserveAspectRatio="xMidYMin slice" aria-hidden>
      {SPARKS.map(([x, y], i) => (
        <g key={i} className="px-spark" style={{ ['--i' as string]: i }} fill="#fff6d8">
          <rect x={x} y={y - 2} width="1" height="5" />
          <rect x={x - 2} y={y} width="5" height="1" />
        </g>
      ))}
    </svg>
  )
}

const CLOUDS = [
  { x: 10, y: 14, w: 34 }, { x: 96, y: 30, w: 26 }, { x: 170, y: 10, w: 40 }, { x: 236, y: 38, w: 22 },
]

/** Soft pixel clouds drifting across the sky. Drawn twice side by side so the loop has no seam. */
function Clouds() {
  return (
    <div className="px-clouds absolute inset-y-0 left-0 w-[200%]" aria-hidden>
      <svg viewBox={`0 0 ${W * 2} ${H}`} className="size-full" shapeRendering="crispEdges" preserveAspectRatio="none">
        {[0, W].map((dx) =>
          CLOUDS.map((c, i) => (
            <g key={`${dx}-${i}`} fill="#ffffff" opacity="0.22">
              <rect x={c.x + dx} y={c.y + 3} width={c.w} height="4" />
              <rect x={c.x + dx + 4} y={c.y} width={c.w - 12} height="3" />
              <rect x={c.x + dx + 8} y={c.y + 7} width={c.w - 14} height="2" />
            </g>
          )),
        )}
      </svg>
    </div>
  )
}

/** Fireflies near the ground, for the forest banner. */
function Fireflies() {
  const dots = [[30, 120], [78, 104], [122, 128], [164, 110], [210, 124], [250, 100]]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" shapeRendering="crispEdges" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {dots.map(([x, y], i) => (
        <rect key={i} className="px-firefly" style={{ ['--i' as string]: i }} x={x} y={y} width="2" height="2" fill="#fff3a6" />
      ))}
    </svg>
  )
}

// ---------- Shared pieces ----------

function Scene({ art, t, forest = false, children, className = '' }: { art: Art; t: number; forest?: boolean; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ containerType: 'size' }}>
      {art === 'code' ? <CodeScene t={t} forest={forest} /> : forest ? <PackForest t={t} /> : <PackMountains t={t} />}
      {children}
    </div>
  )
}

const pixelFont = { fontFamily: '"Press Start 2P", monospace' }

function GoldButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} onPointerDown={() => play('tap')} className={`px-gold ${className}`} style={pixelFont}>
      {children}
    </button>
  )
}

// ---------- The two sample screens ----------

function Welcome({ art, t }: { art: Art; t: number }) {
  const rise = (b: readonly [number, number]) => {
    const p = easeOut(progress(t, b))
    return { opacity: p, transform: `translateY(${Math.round((1 - p) * 14)}px)` }
  }
  const subtitle = 'Learn to code, a few minutes a day.'
  const said = typed(subtitle, progress(t, HERO.subtitle))
  return (
    <Scene art={art} t={t} className="aspect-[9/16] w-full rounded-[28px] border-4 border-[#0b0f24] sm:aspect-[4/5]">
      <Clouds />
      <Sparkles />
      <div className="absolute inset-0 flex flex-col items-center px-5 pt-[18%] text-center">
        <p className="text-[0.6rem] tracking-[0.3em] text-[#ffe9b0]" style={{ ...pixelFont, ...rise(HERO.line1) }}>START YOUR</p>
        <h2 className="mt-3 text-[1.7rem] leading-[1.25] text-white sm:text-[2.1rem]" style={{ ...pixelFont, ...rise(HERO.line2), textShadow: '0 4px 0 #0b0f24, 4px 0 0 #0b0f24, -4px 0 0 #0b0f24, 0 -4px 0 #0b0f24, 0 8px 0 #c2410c' }}>
          <span className="px-float inline-block">
            <span className="text-[#ffd166]">Byte</span>Quest
          </span>
        </h2>
        <p className="mt-5 min-h-10 max-w-64 text-[0.95rem] font-medium text-white" aria-label={subtitle} style={{ textShadow: '0 2px 0 #0b0f24' }}>
          <span aria-hidden>{said}</span>
          {said.length < subtitle.length && <span aria-hidden className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-white" />}
        </p>
        <div style={rise(HERO.cta)} className="mt-4">
          <GoldButton>Get started</GoldButton>
        </div>
      </div>
      <div className="absolute bottom-[7%] left-[9%]" style={rise(HERO.pip)}>
        {/* Pip waves when the button lands, then again every six seconds. */}
        <Pip mood={progress(t, HERO.cta) >= 1 && (t - HERO.cta[0]) % 6000 < 1600 ? 'wave' : 'happy'} size={86} />
      </div>
    </Scene>
  )
}

function World({ art, t }: { art: Art; t: number }) {
  const lessons = [
    { title: 'What is programming?', state: 'done' },
    { title: 'Bits and binary', state: 'done' },
    { title: 'Text and colour', state: 'now' },
    { title: 'Algorithms', state: 'locked' },
  ]
  return (
    <div className="w-full overflow-hidden rounded-[28px] border-4 border-[#0b0f24] bg-[#0f1535]">
      <Scene art={art} t={t} forest className="aspect-[16/7] w-full">
        <Fireflies />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f1535] to-transparent pt-10 pb-3 pl-4">
          <p className="text-[0.55rem] tracking-[0.25em] text-[#ffe9b0]" style={pixelFont}>WORLD 1</p>
          <h3 className="mt-1.5 text-[0.85rem] leading-relaxed text-white" style={{ ...pixelFont, textShadow: '0 3px 0 #0b0f24' }}>Thinking like a computer</h3>
        </div>
      </Scene>
      <div className="space-y-4 p-4">
        <div>
          <div className="flex justify-between text-xs text-[#aab3d8]">
            <span>2 of 8 lessons</span>
            <span style={pixelFont} className="text-[0.55rem] text-[#ffd166]">25 XP</span>
          </div>
          <div className="mt-1.5 h-4 border-2 border-[#0b0f24] bg-[#1c2552] p-0.5">
            <div className="h-full bg-[#ffd166]" style={{ width: '25%' }} />
          </div>
        </div>
        <ol className="space-y-2">
          {lessons.map((l, i) => (
            <li key={l.title} className={`px-row ${l.state === 'now' ? 'px-row-now' : ''} ${l.state === 'locked' ? 'opacity-50' : ''}`}>
              <span className={`grid size-8 shrink-0 place-items-center border-2 border-[#0b0f24] ${l.state === 'done' ? 'bg-[#5ad17a] text-[#0b0f24]' : l.state === 'now' ? 'bg-[#ffd166] text-[#0b0f24]' : 'bg-[#1c2552] text-[#aab3d8]'}`}>
                {l.state === 'done' ? <Check size={16} strokeWidth={3} /> : l.state === 'locked' ? <Lock size={14} /> : <span style={pixelFont} className="text-[0.6rem]">{i + 1}</span>}
              </span>
              <span className="flex-1 font-medium text-white">{l.title}</span>
              {l.state === 'now' && <span style={pixelFont} className="text-[0.55rem] text-[#ffd166]">START</span>}
            </li>
          ))}
        </ol>
        <GoldButton className="w-full">Continue</GoldButton>
      </div>
    </div>
  )
}

export function Sample() {
  const t = useClock()
  const [art, setArt] = useState<Art>('pack')
  const { s, update } = useStore()
  const still = useReducedMotion()
  const deviceSaysReduce = useDeviceReduces()
  const [run, setRun] = useState(0)
  const startedAt = useRef(0)
  // Replaying restarts the entrance beats without restarting the parallax.
  const local = t - startedAt.current
  const replay = () => {
    startedAt.current = t
    setRun((r) => r + 1)
  }
  return (
    <div className="px-shell min-h-dvh pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <p className="text-[0.6rem] tracking-[0.3em] text-[#ffd166]" style={pixelFont}>DESIGN SAMPLE</p>
        <h1 className="mt-3 text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-sans)', letterSpacing: 0 }}>The pixel-adventure direction</h1>
        <p className="mt-2 max-w-prose text-[#aab3d8]">
          A welcome screen and one course world, not yet applied to the app. Switch the scenery to compare a free art pack with scenery drawn in code.
        </p>
        {still && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-2 border-[#ffc531] bg-[#1c2552] p-3 text-sm text-[#ffe9a0]">
            <p className="flex-1">
              {deviceSaysReduce && s.motion !== 'off' ? 'Nothing is moving because your device is set to reduce motion.' : 'Animations are turned off in Settings.'}
            </p>
            <button
              className="px-tab px-tab-on"
              onClick={() => {
                setMotionPref('on')
                update((p) => ({ ...p, motion: 'on' }))
              }}
            >
              Play animations
            </button>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(['pack', 'code'] as const).map((a) => (
            <button key={a} aria-pressed={art === a} onClick={() => setArt(a)} className={`px-tab ${art === a ? 'px-tab-on' : ''}`}>
              {a === 'pack' ? 'Free art pack' : 'Drawn in code'}
            </button>
          ))}
          <button className="px-tab" onClick={replay}>Replay entrance</button>
        </div>
        <div className="mt-8 grid items-start gap-8 md:grid-cols-2">
          <section aria-label="Welcome screen sample">
            <Welcome key={run} art={art} t={local} />
          </section>
          <section aria-label="Course world sample">
            <World art={art} t={t} />
            <p className="mt-4 text-sm text-[#aab3d8]">
              {art === 'pack'
                ? 'Backdrops by Luis Zuno (ansimuz), released as CC0 on OpenGameArt. Pip and the interface are original.'
                : 'Everything here is generated in code: ridges from layered waves, trees and stars from pixel rects.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
