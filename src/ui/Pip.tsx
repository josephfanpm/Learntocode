// Pip, the ByteQuest mascot: a round cobalt creature with a signal-light
// antenna. One SVG, seven moods. The antenna light follows the mood (bright
// when celebrating, dim when sleepy).

export type Mood = 'happy' | 'wave' | 'cheer' | 'oops' | 'think' | 'sleepy' | 'celebrate'

export const MOODS: Mood[] = ['happy', 'wave', 'cheer', 'oops', 'think', 'sleepy', 'celebrate']

const INK = '#16213e'
const BODY = '#2d5be3'
const BELLY = '#6f8ff0'
const LIGHT = '#ff7a1a'
const CHEEK = '#ff9bb0'

const LABEL: Record<Mood, string> = {
  happy: 'Pip smiling',
  wave: 'Pip waving hello',
  cheer: 'Pip cheering',
  oops: 'Pip looking sheepish',
  think: 'Pip thinking',
  sleepy: 'Pip asleep',
  celebrate: 'Pip celebrating',
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer' || mood === 'celebrate')
    return (
      <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
        <path d="M37 64 Q45 54 53 64" />
        <path d="M67 64 Q75 54 83 64" />
      </g>
    )
  if (mood === 'sleepy')
    return (
      <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
        <path d="M38 63 Q45 68 52 63" />
        <path d="M68 63 Q75 68 82 63" />
      </g>
    )
  // Open eyes; pupils shift with the mood.
  const look = mood === 'think' ? [3, -4] : mood === 'oops' ? [-2, 3] : [0, 1]
  return (
    <g>
      {[45, 75].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={62} r={11.5} fill="white" />
          <circle cx={cx + look[0]} cy={62 + look[1]} r={6} fill={INK} />
          <circle cx={cx + look[0] + 2.2} cy={62 + look[1] - 2.4} r={2.1} fill="white" />
        </g>
      ))}
      {mood === 'oops' && (
        <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <path d="M36 51 L50 46" />
          <path d="M84 51 L70 46" />
        </g>
      )}
      {mood === 'think' && <path d="M68 46 Q76 42 84 46" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />}
    </g>
  )
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'cheer':
    case 'celebrate':
      return <path d="M48 79 Q60 79 72 79 Q71 94 60 94 Q49 94 48 79 Z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    case 'oops':
      return <path d="M51 85 Q55 81 60 85 Q65 89 69 85" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    case 'think':
      return <path d="M54 85 L66 83" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    case 'sleepy':
      return <ellipse cx="60" cy="84" rx="3.5" ry="4" fill={INK} />
    default:
      return <path d="M50 80 Q60 91 70 80" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  }
}

function Arms({ mood }: { mood: Mood }) {
  const arm = { fill: 'none', stroke: BODY, strokeWidth: 9, strokeLinecap: 'round' as const }
  const down = { l: 'M26 86 Q16 94 19 103', r: 'M94 86 Q104 94 101 103' }
  const up = { l: 'M27 72 Q13 60 15 46', r: 'M93 72 Q107 60 105 46' }
  let l = down.l
  let r = down.r
  if (mood === 'cheer' || mood === 'celebrate') {
    l = up.l
    r = up.r
  } else if (mood === 'wave') r = up.r
  else if (mood === 'think') r = 'M94 88 Q84 100 72 96'
  else if (mood === 'oops') r = 'M94 80 Q104 66 96 54'
  return (
    <g>
      <path d={l} {...arm} className={mood === 'celebrate' ? 'pip-arm-l' : undefined} />
      <path d={r} {...arm} className={mood === 'wave' ? 'pip-wave' : mood === 'celebrate' ? 'pip-arm-r' : undefined} />
    </g>
  )
}

function Extras({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'oops':
      return <path d="M101 46 Q106 54 101 58 Q96 54 101 46 Z" fill="#7cc4f5" />
    case 'think':
      return (
        <g fill={INK} opacity="0.35">
          <circle cx="98" cy="30" r="3" />
          <circle cx="106" cy="20" r="4.5" />
        </g>
      )
    case 'sleepy':
      return (
        <g fill={INK} fontFamily="var(--font-display)" fontWeight="800" opacity="0.55">
          <text x="92" y="36" fontSize="14">z</text>
          <text x="102" y="24" fontSize="10">z</text>
        </g>
      )
    case 'celebrate':
      return (
        <g className="pip-sparkle">
          <path d="M12 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={LIGHT} />
          <path d="M104 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffd166" />
          <circle cx="22" cy="8" r="3" fill="#0f9fae" />
          <circle cx="110" cy="40" r="2.5" fill="#c2378b" />
        </g>
      )
    default:
      return null
  }
}

export function Pip({ mood = 'happy', size = 96, className = '', title }: { mood?: Mood; size?: number; className?: string; title?: string }) {
  const lit = mood === 'sleepy' ? 0.35 : 1
  const motion = mood === 'cheer' || mood === 'celebrate' ? 'pip-bounce' : mood === 'sleepy' ? 'pip-breathe' : ''
  return (
    <svg viewBox="0 0 120 124" width={size} height={(size * 124) / 120} className={`overflow-visible ${className}`} role="img" aria-label={title ?? LABEL[mood]}>
      <g className={motion} style={{ transformOrigin: '60px 118px' }}>
        {/* antenna */}
        <path d="M60 30 Q60 18 66 12" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {mood === 'celebrate' && <circle cx="67" cy="10" r="12" fill={LIGHT} opacity="0.25" />}
        <circle cx="67" cy="10" r="7" fill={LIGHT} opacity={lit} stroke={INK} strokeWidth="3" />
        {/* feet */}
        <ellipse cx="45" cy="116" rx="10" ry="6" fill={INK} />
        <ellipse cx="75" cy="116" rx="10" ry="6" fill={INK} />
        <Arms mood={mood} />
        {/* body */}
        <rect x="22" y="28" width="76" height="88" rx="38" fill={BODY} stroke={INK} strokeWidth="4" />
        <ellipse cx="60" cy="94" rx="24" ry="17" fill={BELLY} />
        <ellipse cx="34" cy="78" rx="6" ry="4" fill={CHEEK} opacity={mood === 'sleepy' ? 0.4 : 0.8} />
        <ellipse cx="86" cy="78" rx="6" ry="4" fill={CHEEK} opacity={mood === 'sleepy' ? 0.4 : 0.8} />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <Extras mood={mood} />
      </g>
    </svg>
  )
}
