// Two levels of hint for every exercise.
//   Level 1 explains the idea: the most recent concept card in the lesson.
//   Level 2 guides a bit more: a nudge built from the answer that narrows
//   things down without handing over the whole answer.
// Text uses the same inline formatting as lessons: `code` and **bold**.

import type { Exercise, Lesson } from '../content/types'

export interface Hint {
  title: string
  body: string
  code?: string
  language?: 'python' | 'sql' | 'html'
}

const oneLine = (s: string) => s.replace(/\s*\n\s*/g, ' / ').trim()
const quote = (s: string) => `"${oneLine(s)}"`

/** Level 1: the last concept card before this exercise, or a general prompt. */
export function conceptHint(lesson: Lesson, index: number): Hint {
  for (let i = index - 1; i >= 0; i--) {
    const ex = lesson.exercises[i]
    if (ex.kind === 'concept') return { title: ex.title, body: ex.body, code: ex.code, language: ex.language }
  }
  return { title: 'Take it one step at a time', body: 'Read the question again slowly, and say in your own words what it is asking for.' }
}

/** Level 2: a nudge that depends on the kind of exercise. */
export function nudgeHint(ex: Exercise): Hint {
  const title = 'A bit more help'
  switch (ex.kind) {
    case 'concept':
      return { title, body: 'Nothing to answer here. Read it through, then continue.' }
    case 'choice': {
      const wrong = ex.options.filter((_, i) => i !== ex.answer)
      if (ex.options.length <= 2) return { title, body: 'There are only two options. Test each one against the idea above: one of them breaks it.' }
      const out = wrong.slice(0, ex.options.length >= 4 ? 2 : 1).map(quote)
      return { title, body: `It isn’t ${out.join(' or ')}.` }
    }
    case 'blank': {
      if (ex.answers.length > 1) return { title, body: `The first gap is \`${ex.answers[0]}\`.` }
      const distractor = ex.bank.find((w) => !ex.answers.includes(w))
      return { title, body: distractor ? `It isn’t \`${distractor}\`.` : 'Read the line aloud with each word in the gap. Only one makes sense.' }
    }
    case 'order':
      return { title, body: `Start with: \`${ex.lines[0].trim()}\`${ex.lines.length >= 4 ? `\n\nEnd with: \`${ex.lines[ex.lines.length - 1].trim()}\`` : ''}` }
    case 'match':
      return { title, body: `${quote(ex.pairs[0][0])} goes with ${quote(ex.pairs[0][1])}.` }
    case 'spot': {
      // Count only real lines; blank spacer lines aren't tappable.
      const real = ex.lines.map((l, i) => ({ l, n: i + 1 })).filter((x) => x.l.trim())
      const pos = real.findIndex((x) => x.n === ex.answer + 1)
      if (real.length <= 3) {
        const not = real.find((x) => x.n !== ex.answer + 1)!
        return { title, body: `It isn’t line ${not.n}.` }
      }
      const half = Math.ceil(real.length / 2)
      const part = pos < half ? real.slice(0, half) : real.slice(half)
      return { title, body: `Look at lines ${part[0].n} to ${part[part.length - 1].n}.` }
    }
    case 'bits': {
      const bin = ex.target.toString(2)
      const on = [...bin].filter((b) => b === '1').length
      if (on === 0) return { title, body: 'Every switch stays off.' }
      const top = 2 ** (bin.length - 1)
      return { title, body: `You need ${on} ${on === 1 ? 'switch' : 'switches'} on.${on > 1 ? ` The biggest one is the ${top}.` : ''}` }
    }
    case 'steps':
      return { title, body: `For step 1, tap ${quote(ex.cells[ex.steps[0].answer])}.` }
    case 'type': {
      const a = ex.accept[0].trim()
      if (a.length <= 1) return { title, body: 'The answer is a single character.' }
      return { title, body: `The answer is ${a.length} characters long and starts with \`${a[0]}\`.` }
    }
    case 'write':
      return { title, body: ex.hint }
  }
}

export function hintFor(lesson: Lesson, index: number, level: 1 | 2): Hint {
  return level === 1 ? conceptHint(lesson, index) : nudgeHint(lesson.exercises[index])
}
