// Engagement messaging. Every rule is a pure function of a snapshot of the
// learner ("facts"), so the same engine drives in-app banners, browser
// notifications and the simulator in the Messaging lab.
//
// Policy:
// - Each rule has a dedupe key; a key is only ever sent once.
// - Caps: 1 push per day, 1 email per 3 days, 2 banners at a time.
// - Quiet hours for push: 21:00–08:00, except the learner's chosen reminder hour.
// - Lapsed learners get push for the first week, then email, then nothing after 30 days.

import type { Unit } from '../content/types'
import { addDays, dayKey, daysBetween, parseDay } from './dates'
import { currentLesson, isUnitDone, reviewPick } from './progress'
import {
  effectiveReminderHour,
  FREEZE_PRICE,
  lastPracticeDay,
  practicedToday,
  streak,
  type Channel,
  type LearnerState,
  type Motivation,
} from './state'

export type Tier = 'new' | 'active' | 'casual' | 'slipping' | 'dormant'

export const TIER_INFO: Record<Tier, string> = {
  new: 'Signed up in the last 7 days',
  active: 'Practiced 4+ of the last 7 days',
  casual: 'Practiced 1–3 of the last 7 days',
  slipping: 'No practice for 7–29 days',
  dormant: 'No practice for 30+ days',
}

export interface Facts {
  now: Date
  today: string
  hour: number
  name: string
  motivation: Motivation
  tier: Tier
  streak: number
  practicedToday: boolean
  todayXp: number
  goal: number
  freezes: number
  gems: number
  freezesUsedUnseen: number
  lostStreak?: { length: number; day: string }
  /** Days since the last practice; null if never practiced. */
  daysAway: number | null
  lastPractice: string | null
  daysSinceSignup: number
  lessonsDone: number
  activeDaysLast7: number
  xpThisWeek: number
  nextLesson?: { id: string; title: string; unit: string }
  reviewLesson?: { id: string; title: string }
  /** Current lesson with 4+ wrong answers since it was opened. */
  stuck?: { id: string; title: string; mistakes: number }
  unitsDone: number
  justFinishedUnit?: string
  pushEnabled: boolean
  /** Hour today's reminder is due (smart or fixed). */
  reminderHour: number
  smartReminder: boolean
  hasAvatar: boolean
}

export function facts(s: LearnerState, units: Unit[], now: Date): Facts {
  const today = dayKey(now)
  const last = lastPracticeDay(s)
  const daysAway = last ? daysBetween(last, today) : null
  const daysSinceSignup = daysBetween(dayKey(new Date(s.createdAt)), today)
  let activeDaysLast7 = 0
  let xpThisWeek = 0
  for (let i = 0; i < 7; i++) {
    const a = s.activity[addDays(today, -i)]
    if (a && a.xp > 0) {
      activeDaysLast7++
      xpThisWeek += a.xp
    }
  }
  let tier: Tier
  if (daysSinceSignup < 7 && (daysAway === null || daysAway < 7)) tier = 'new'
  else if (daysAway === null || daysAway >= 30) tier = 'dormant'
  else if (daysAway >= 7) tier = 'slipping'
  else if (activeDaysLast7 >= 4) tier = 'active'
  else tier = 'casual'

  const cur = currentLesson(units, s)
  const review = reviewPick(units, s)
  const mistakes = cur ? (s.struggles[cur.lesson.id] ?? 0) : 0
  const done = units.filter((u) => isUnitDone(u, s))
  const lastDone = done.at(-1)
  const finishedToday =
    lastDone && lastDone.lessons.some((l) => s.completed[l.id]?.lastAt && dayKey(new Date(s.completed[l.id].lastAt)) === today)

  return {
    now,
    today,
    hour: now.getHours(),
    name: s.name,
    motivation: s.motivation,
    tier,
    streak: streak(s, today),
    practicedToday: practicedToday(s, today),
    todayXp: s.activity[today]?.xp ?? 0,
    goal: s.dailyGoal,
    freezes: s.freezes,
    gems: s.gems,
    freezesUsedUnseen: s.freezesUsedUnseen,
    lostStreak: s.lostStreak,
    daysAway,
    lastPractice: last,
    daysSinceSignup,
    lessonsDone: Object.keys(s.completed).length,
    activeDaysLast7,
    xpThisWeek,
    nextLesson: cur && { id: cur.lesson.id, title: cur.lesson.title, unit: cur.unit.title },
    reviewLesson: review && { id: review.id, title: review.title },
    stuck: cur && mistakes >= 4 ? { id: cur.lesson.id, title: cur.lesson.title, mistakes } : undefined,
    unitsDone: done.length,
    justFinishedUnit: finishedToday ? lastDone.title : undefined,
    pushEnabled: s.pushEnabled,
    reminderHour: effectiveReminderHour(s),
    smartReminder: s.reminderMode === 'smart',
    hasAvatar: !!s.avatar,
  }
}

export type Action = 'lesson' | 'review' | 'shop' | 'settings' | 'avatar'

export interface Message {
  rule: string
  channel: Channel
  key: string
  priority: number
  title: string
  body: string
  cta?: { label: string; action: Action; lessonId?: string }
  /** Plain-language reason, shown in the Messaging lab. */
  why: string
}

interface Rule {
  id: string
  channel: Channel
  priority: number
  /** What the rule is for, shown in the lab. */
  about: string
  when: (f: Facts) => boolean
  /** Sent even if another push already went out today (the late streak saver). */
  extra?: boolean
  /** Dedupe key: a key is sent at most once. */
  key: (f: Facts) => string
  copy: (f: Facts) => Pick<Message, 'title' | 'body' | 'cta' | 'why'>
}

const hi = (f: Facts) => (f.name ? `${f.name}, ` : '')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

const WHY: Record<Motivation, string> = {
  career: 'Every lesson moves you closer to a new kind of job.',
  curious: 'A few minutes today and the next idea will click.',
  build: 'Each lesson gets you closer to building your own thing.',
  work: 'A little practice now saves hours at work later.',
}

const nextCta = (f: Facts) =>
  f.nextLesson ? { label: 'Start lesson', action: 'lesson' as const, lessonId: f.nextLesson.id } : undefined

const MILESTONES = [3, 7, 14, 30, 50, 100, 365]

export const RULES: Rule[] = [
  // ---------- In-app banners ----------
  {
    id: 'first_lesson',
    channel: 'banner',
    priority: 95,
    about: 'Gets a new learner through lesson one, the biggest drop-off point.',
    when: (f) => f.lessonsDone === 0,
    key: (f) => `first_lesson:${f.today}`,
    copy: (f) => ({
      title: `${cap(hi(f))}your first lesson takes about 3 minutes`,
      body: 'No setup. You will write your first line of code in your browser.',
      cta: nextCta(f),
      why: 'No lessons finished yet.',
    }),
  },
  {
    id: 'freeze_used',
    channel: 'banner',
    priority: 90,
    about: 'Tells the learner a streak freeze saved their streak while they were away.',
    when: (f) => f.freezesUsedUnseen > 0,
    key: (f) => `freeze_used:${f.today}`,
    copy: (f) => ({
      title: `A streak freeze saved your ${plural(f.streak, 'day')} streak`,
      body: `It covered ${plural(f.freezesUsedUnseen, 'missed day')}. Practice today to keep it going.`,
      cta: nextCta(f),
      why: `${plural(f.freezesUsedUnseen, 'freeze')} used since the last visit.`,
    }),
  },
  {
    id: 'streak_lost',
    channel: 'banner',
    priority: 85,
    about: 'Softens a lost streak and turns it into a fresh start instead of a reason to quit.',
    when: (f) => !!f.lostStreak && !f.practicedToday,
    key: (f) => `streak_lost:${f.lostStreak?.day}`,
    copy: (f) => ({
      title: `Your ${f.lostStreak!.length}-day streak ended`,
      body: 'Your progress is all still here. One lesson starts a new streak today.',
      cta: nextCta(f),
      why: `Streak of ${f.lostStreak!.length} broke with no freezes left.`,
    }),
  },
  {
    id: 'welcome_back',
    channel: 'banner',
    priority: 80,
    about: 'Eases a returning learner back in with a review of something they already know.',
    when: (f) => f.daysAway !== null && f.daysAway >= 3 && !f.practicedToday && !f.lostStreak && !!f.reviewLesson,
    key: (f) => `welcome_back:${f.lastPractice}`,
    copy: (f) => ({
      title: `Welcome back${f.name ? ', ' + f.name : ''}`,
      body: `It has been ${f.daysAway} days. Warm up with a quick review of "${f.reviewLesson!.title}".`,
      cta: { label: 'Quick review', action: 'review', lessonId: f.reviewLesson!.id },
      why: `${f.daysAway} days since the last lesson.`,
    }),
  },
  {
    id: 'stuck',
    channel: 'banner',
    priority: 75,
    about: 'Spots a learner struggling with a lesson and offers a review before they give up.',
    when: (f) => !!f.stuck && !!f.reviewLesson,
    key: (f) => `stuck:${f.stuck?.id}:${f.today}`,
    copy: (f) => ({
      title: `"${f.stuck!.title}" is a tricky one`,
      body: 'Lots of people need two tries here. A short review first often helps it click.',
      cta: { label: 'Review first', action: 'review', lessonId: f.reviewLesson!.id },
      why: `${f.stuck!.mistakes} wrong answers in the current lesson.`,
    }),
  },
  {
    id: 'unit_done',
    channel: 'banner',
    priority: 72,
    about: 'Celebrates finishing a unit and points to what it unlocked.',
    when: (f) => !!f.justFinishedUnit,
    key: (f) => `unit_done:${f.justFinishedUnit}`,
    copy: (f) => ({
      title: `You finished ${f.justFinishedUnit}`,
      body: f.nextLesson ? `Unlocked: ${f.nextLesson.unit}.` : 'That was the last unit. You finished the course.',
      cta: nextCta(f),
      why: 'Last lesson of a unit completed today.',
    }),
  },
  {
    id: 'streak_milestone',
    channel: 'banner',
    priority: 70,
    about: 'Marks streak milestones (3, 7, 14, 30 … days).',
    when: (f) => f.practicedToday && MILESTONES.includes(f.streak),
    key: (f) => `milestone:${f.streak}:${f.today}`,
    copy: (f) => ({
      title: `${f.streak}-day streak`,
      body: f.streak >= 30 ? 'That is a real habit now.' : WHY[f.motivation],
      why: `Streak reached ${f.streak} today.`,
    }),
  },
  {
    id: 'goal_close',
    channel: 'banner',
    priority: 60,
    about: 'Nudges toward the daily goal when the learner is part way there.',
    when: (f) => f.todayXp > 0 && f.todayXp < f.goal,
    key: (f) => `goal_close:${f.today}:${f.todayXp}`,
    copy: (f) => ({
      title: `${f.goal - f.todayXp} XP to your daily goal`,
      body: 'One more lesson should do it.',
      cta: nextCta(f),
      why: `${f.todayXp} of ${f.goal} XP today.`,
    }),
  },
  {
    id: 'freeze_offer',
    channel: 'banner',
    priority: 50,
    about: 'Offers a streak freeze to learners with a streak worth protecting and none equipped.',
    when: (f) => f.streak >= 3 && f.freezes === 0 && f.gems >= FREEZE_PRICE,
    key: (f) => `freeze_offer:${f.today}`,
    copy: (f) => ({
      title: 'Protect your streak',
      body: `A streak freeze covers one missed day. You have ${f.gems} gems; it costs ${FREEZE_PRICE}.`,
      cta: { label: 'Get a freeze', action: 'shop' },
      why: `Streak ${f.streak}, no freezes, enough gems.`,
    }),
  },

  {
    id: 'avatar_prompt',
    channel: 'banner',
    priority: 45,
    about: 'After the first finished lesson, invites the learner to make a pixel avatar. Asked after the first win, not during sign-up.',
    when: (f) => f.lessonsDone >= 1 && !f.hasAvatar,
    key: () => 'avatar_prompt',
    copy: () => ({
      title: 'Make your avatar',
      body: 'Pick an animal, a look and an accessory. It shows on your profile.',
      cta: { label: 'Make my avatar', action: 'avatar' },
      why: 'Finished a lesson, no avatar yet.',
    }),
  },

  // ---------- Push notifications ----------
  {
    id: 'push_first_lesson',
    channel: 'push',
    priority: 90,
    about: 'Reminds someone who signed up but never finished a lesson (days 1–3 only).',
    when: (f) => f.lessonsDone === 0 && f.daysSinceSignup >= 1 && f.daysSinceSignup <= 3 && f.hour >= f.reminderHour,
    key: (f) => `push_first_lesson:${f.today}`,
    copy: (f) => ({
      title: 'Your first lesson is waiting',
      body: `About 3 minutes. ${WHY[f.motivation]}`,
      cta: nextCta(f),
      why: `Signed up ${plural(f.daysSinceSignup, 'day')} ago, no lessons yet.`,
    }),
  },
  {
    id: 'push_streak_risk',
    channel: 'push',
    priority: 85,
    about: 'Daily reminder when the streak is at risk: about 23.5 hours after the last lesson (or at a fixed time the learner chose). Wording rotates so no two days in a row match.',
    when: (f) => f.streak >= 1 && !f.practicedToday && f.hour >= f.reminderHour,
    key: (f) => `push_streak_risk:${f.today}`,
    copy: (f) => {
      if (f.freezes > 0 && f.streak < 7)
        return {
          title: `Keep your ${f.streak}-day streak`,
          body: 'A freeze would cover today, but a 3-minute lesson keeps it honest.',
          cta: nextCta(f),
          why: `Streak ${f.streak}, nothing today, past reminder time, freeze equipped.`,
        }
      // Rotate wording by day so yesterday's message is never repeated.
      const variants = [
        { title: `Your ${f.streak}-day streak ends at midnight`, body: f.nextLesson ? `Next up: ${f.nextLesson.title}. About 3 minutes.` : 'One review lesson keeps it alive.' },
        { title: `Keep your ${f.streak}-day streak going`, body: 'Three minutes now, and tomorrow you start ahead.' },
        { title: `Your ${f.streak}-day streak is on the line`, body: 'One quick lesson keeps it.' },
        { title: `Pip is guarding your ${f.streak}-day streak`, body: f.nextLesson ? `"${f.nextLesson.title}" is ready when you are.` : 'A quick review is ready when you are.' },
      ]
      const v = variants[Math.abs(daysBetween('2026-01-01', f.today)) % variants.length]
      return {
        ...v,
        cta: nextCta(f),
        why: `Streak ${f.streak}, nothing today, past reminder time (${f.smartReminder ? 'smart: when they usually practice' : 'fixed'})${f.freezes ? '' : ', no freeze'}.`,
      }
    },
  },
  {
    id: 'push_streak_saver',
    channel: 'push',
    priority: 84,
    extra: true,
    about: 'Late streak saver: one more nudge at 8pm if a streak of 3+ days is still at risk after the daily reminder.',
    when: (f) => f.streak >= 3 && !f.practicedToday && f.hour >= 20 && f.reminderHour < 20,
    key: (f) => `push_streak_saver:${f.today}`,
    copy: (f) => ({
      title: `Last call for your ${f.streak}-day streak`,
      body: 'A few hours left today. One lesson saves it.',
      cta: nextCta(f),
      why: `Streak ${f.streak}, still nothing today at 8pm.`,
    }),
  },
  {
    id: 'push_lapsed_2',
    channel: 'push',
    priority: 70,
    about: 'Day 2–4 away: the streak just broke; invite a fresh start.',
    when: (f) => f.daysAway !== null && f.daysAway >= 2 && f.daysAway <= 4 && f.hour >= f.reminderHour,
    key: (f) => `push_lapsed_2:${f.lastPractice}`,
    copy: (f) => ({
      title: 'Start a new streak today',
      body: f.nextLesson ? `Pick up at "${f.nextLesson.title}".` : 'A quick review is ready.',
      cta: nextCta(f),
      why: `${f.daysAway} days away.`,
    }),
  },
  {
    id: 'push_lapsed_5',
    channel: 'push',
    priority: 65,
    about: 'Day 5–6 away: last push before handing over to email.',
    when: (f) => f.daysAway !== null && f.daysAway >= 5 && f.daysAway <= 6 && f.hour >= f.reminderHour,
    key: (f) => `push_lapsed_5:${f.lastPractice}`,
    copy: (f) => ({
      title: `You have finished ${plural(f.lessonsDone, 'lesson')}`,
      body: 'That progress is saved. Ten minutes this week keeps it fresh.',
      cta: nextCta(f),
      why: `${f.daysAway} days away.`,
    }),
  },

  // ---------- Email ----------
  {
    id: 'email_welcome',
    channel: 'email',
    priority: 80,
    about: 'Day after sign-up: what the course covers, framed by why they joined.',
    when: (f) => f.daysSinceSignup >= 1 && f.daysSinceSignup <= 3,
    key: () => 'email_welcome',
    copy: (f) => ({
      title: 'Here is where this goes',
      body: `${WHY[f.motivation]} The course follows Harvard’s CS50: from how computers think, through Python, to databases, web pages and AI. ${f.lessonsDone ? `You have done ${plural(f.lessonsDone, 'lesson')} already.` : 'Lesson one takes 3 minutes.'}`,
      cta: nextCta(f),
      why: `Day ${f.daysSinceSignup} after sign-up.`,
    }),
  },
  {
    id: 'email_weekly',
    channel: 'email',
    priority: 60,
    about: 'Sunday recap for anyone who practiced this week.',
    when: (f) => parseDay(f.today).getDay() === 0 && f.activeDaysLast7 >= 1,
    key: (f) => `email_weekly:${f.today}`,
    copy: (f) => ({
      title: `Your week: ${f.xpThisWeek} XP over ${plural(f.activeDaysLast7, 'day')}`,
      body: `Streak: ${plural(f.streak, 'day')}. ${f.nextLesson ? `Next up: ${f.nextLesson.title} in ${f.nextLesson.unit}.` : ''}`,
      cta: nextCta(f),
      why: 'Sunday, practiced this week.',
    }),
  },
  {
    id: 'email_lapsed_7',
    channel: 'email',
    priority: 75,
    about: 'One week away: progress summary and the exact next step.',
    when: (f) => f.daysAway !== null && f.daysAway >= 7 && f.daysAway < 14,
    key: (f) => `email_lapsed_7:${f.lastPractice}`,
    copy: (f) => ({
      title: 'Your progress is saved',
      body: `You have finished ${plural(f.lessonsDone, 'lesson')} and ${plural(f.unitsDone, 'unit')}. ${f.nextLesson ? `Next is "${f.nextLesson.title}".` : ''} Start with a quick review so it feels familiar.`,
      cta: f.reviewLesson ? { label: 'Quick review', action: 'review', lessonId: f.reviewLesson.id } : nextCta(f),
      why: `${f.daysAway} days away.`,
    }),
  },
  {
    id: 'email_lapsed_14',
    channel: 'email',
    priority: 70,
    about: 'Two weeks away: suggest a smaller daily goal instead of more pressure.',
    when: (f) => f.daysAway !== null && f.daysAway >= 14 && f.daysAway < 30,
    key: (f) => `email_lapsed_14:${f.lastPractice}`,
    copy: (f) => ({
      title: 'Would a smaller goal help?',
      body: `Your goal is ${f.goal} XP a day. Ten XP is one lesson, about 3 minutes. You can change it any time.`,
      cta: { label: 'Change my goal', action: 'settings' },
      why: `${f.daysAway} days away; goal ${f.goal} XP may feel too big.`,
    }),
  },
  {
    id: 'email_lapsed_30',
    channel: 'email',
    priority: 65,
    about: 'Day 30: the last message. After this the learner hears nothing until they come back.',
    when: (f) => f.daysAway !== null && f.daysAway >= 30,
    key: (f) => `email_lapsed_30:${f.lastPractice}`,
    copy: (f) => ({
      title: 'We will stop sending reminders',
      body: `Your ${plural(f.lessonsDone, 'lesson')} stay saved. Come back whenever you like and pick up where you left off.`,
      cta: nextCta(f),
      why: `${f.daysAway} days away. Last message in the sequence.`,
    }),
  },
]

function quiet(f: Facts): boolean {
  return (f.hour >= 21 || f.hour < 8) && f.hour !== f.reminderHour
}

export interface Decision {
  sent: Message[]
  /** Rules whose condition held but were held back, with the reason. */
  held: { rule: string; channel: Channel; reason: string }[]
}

/**
 * Decide what to send now. `log` is what has already been sent; the caller
 * appends `sent` to it. Banners are re-shown until dismissed, so they are
 * not deduped against the log here; the caller filters dismissed ones.
 */
export function decide(f: Facts, log: { rule: string; channel: Channel; at: string; key?: string }[], dismissed: Record<string, string> = {}): Decision {
  const sent: Message[] = []
  const held: Decision['held'] = []
  const keys = new Set(log.map((m) => m.key))
  const sentOn = (ch: Channel, sinceDays: number) =>
    log.some((m) => m.channel === ch && daysBetween(dayKey(new Date(m.at)), f.today) < sinceDays)

  const matches = RULES.filter((r) => r.when(f)).sort((a, b) => b.priority - a.priority)
  let pushSent = sentOn('push', 1)
  let emailSent = sentOn('email', 3)
  let banners = 0
  for (const r of matches) {
    const key = r.key(f)
    const msg: Message = { rule: r.id, channel: r.channel, key, priority: r.priority, ...r.copy(f) }
    if (r.channel === 'banner') {
      if (dismissed[key]) held.push({ rule: r.id, channel: r.channel, reason: 'Dismissed' })
      else if (banners >= 2) held.push({ rule: r.id, channel: r.channel, reason: 'Two banners already showing' })
      else {
        sent.push(msg)
        banners++
      }
      continue
    }
    if (keys.has(key)) {
      held.push({ rule: r.id, channel: r.channel, reason: 'Already sent' })
      continue
    }
    if (r.channel === 'push') {
      if (!f.pushEnabled) held.push({ rule: r.id, channel: r.channel, reason: 'Notifications off' })
      else if (quiet(f)) held.push({ rule: r.id, channel: r.channel, reason: 'Quiet hours' })
      else if (pushSent && !r.extra) held.push({ rule: r.id, channel: r.channel, reason: 'Daily push cap (1)' })
      else {
        sent.push(msg)
        pushSent = true
      }
    } else {
      if (emailSent) held.push({ rule: r.id, channel: r.channel, reason: 'Email cap (1 per 3 days)' })
      else {
        sent.push(msg)
        emailSent = true
      }
    }
  }
  return { sent, held }
}
