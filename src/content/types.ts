// Content schema. A course is a path of units (one per CS50 week); a unit is
// a row of short lessons; a lesson is 6–10 bite-sized exercises.
//
// Writing rules for every exercise:
// - One idea per exercise. A learner should finish it in under a minute.
// - Plain words. Assume the learner has never written code.
// - `explain` is shown after the answer (right or wrong). One or two sentences.

export type Language = 'python' | 'sql' | 'html' | 'javascript'

/** A short teaching card. No answer; the learner taps Continue. */
export interface ConceptExercise {
  kind: 'concept'
  title: string
  /** Markdown-lite: paragraphs separated by blank lines, `inline code`, **bold**. Keep under 60 words. */
  body: string
  code?: string
  language?: Language
}

/** Pick one answer. Use `code` for "what does this print?" questions. */
export interface ChoiceExercise {
  kind: 'choice'
  prompt: string
  code?: string
  language?: Language
  options: string[]
  /** Index into options. */
  answer: number
  explain: string
}

/**
 * Fill the gaps from a word bank. Each `___` (three underscores) in `code`
 * is one gap. `answers[i]` fills gap i and must appear in `bank`. The bank
 * should hold every answer plus 1–3 distractors.
 */
export interface BlankExercise {
  kind: 'blank'
  prompt: string
  code: string
  language?: Language
  bank: string[]
  answers: string[]
  explain: string
}

/**
 * Put lines in order (a Parsons problem). `lines` is the correct order,
 * including leading spaces for indentation. The app shuffles them.
 */
export interface OrderExercise {
  kind: 'order'
  prompt: string
  lines: string[]
  language?: Language
  explain: string
}

/** Match each left item to its right item. 3–5 pairs. */
export interface MatchExercise {
  kind: 'match'
  prompt: string
  pairs: [string, string][]
  explain: string
}

/**
 * Write real code and run it in the browser.
 *
 * python: each test runs the learner's code with `stdin` lines fed to input()
 *   and compares printed output to `expected` (trailing whitespace ignored).
 * sql: runs against `setup` (CREATE/INSERT statements); `expected` is the
 *   result rendered as rows of `|`-joined values, one row per line, no header.
 * html: rendered in a preview; each test's `expected` is a CSS selector that
 *   must match at least one element (e.g. "h1", "a[href]").
 * javascript: like python. Output is whatever the code passes to console.log
 *   (objects and arrays print as JSON); `stdin` lines are returned one at a
 *   time by a provided input() function. No DOM, no network, no timers.
 */
export interface WriteExercise {
  kind: 'write'
  prompt: string
  language: Language
  starter: string
  tests: { stdin?: string[]; expected: string }[]
  /** sql only: schema and rows the query runs against. */
  setup?: string
  hint: string
  solution: string
  explain: string
}

/**
 * Tap the one line that has the bug (or that the prompt asks for).
 * `answer` is the index into `lines`. Great for debugging practice.
 */
export interface SpotExercise {
  kind: 'spot'
  prompt: string
  lines: string[]
  language?: Language
  answer: number
  explain: string
}

/**
 * Flip bit switches to make a number in binary. `bits` is how many switches
 * (3–8); `target` must fit in that many bits.
 */
export interface BitsExercise {
  kind: 'bits'
  prompt: string
  target: number
  bits: number
  explain: string
}

/**
 * Step through a row of boxes, tapping the right box at each step. Use it to
 * act out an algorithm by hand: binary search ("which box do you check
 * next?"), walking a linked list, the order a stack pops, a sort's next swap.
 * `cells` is the row (3–9 short labels); each step has its own question and
 * the index of the box to tap. 2–5 steps.
 */
export interface StepsExercise {
  kind: 'steps'
  prompt: string
  cells: string[]
  steps: { ask: string; answer: number }[]
  explain: string
}

/**
 * Type a short answer (a number, a word, one line of output). Compared
 * ignoring case and surrounding spaces. `accept` lists every accepted answer.
 * Use when recalling beats recognising, e.g. "What does this print?".
 */
export interface TypeExercise {
  kind: 'type'
  prompt: string
  code?: string
  language?: Language
  accept: string[]
  explain: string
}

export type Exercise =
  | ConceptExercise
  | ChoiceExercise
  | BlankExercise
  | OrderExercise
  | MatchExercise
  | WriteExercise
  | SpotExercise
  | BitsExercise
  | StepsExercise
  | TypeExercise

export interface Lesson {
  /** Globally unique, kebab-case, prefixed with the unit id, e.g. "u1-print". */
  id: string
  title: string
  exercises: Exercise[]
}

export interface Unit {
  /** "u0" … "u10" */
  id: string
  /** The number shown on the path. For units 0–10 it is the CS50 week. */
  week: number
  /**
   * Which course the unit belongs to. Missing = 'cs', the CS50-based course.
   * 'dev' = Developer skills: the day-to-day craft CS50 doesn't cover.
   * 'ai' = Building with AI: LLMs, prompting, the Claude API, agents, Claude Code.
   */
  course?: 'cs' | 'dev' | 'ai'
  title: string
  /** One short line shown on the path, e.g. "Variables, input and decisions". */
  summary: string
  lessons: Lesson[]
}
