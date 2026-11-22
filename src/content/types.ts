// Content schema. A course is a path of units (one per CS50 week); a unit is
// a row of short lessons; a lesson is 6–10 bite-sized exercises.
//
// Writing rules for every exercise:
// - One idea per exercise. A learner should finish it in under a minute.
// - Plain words. Assume the learner has never written code.
// - `explain` is shown after the answer (right or wrong). One or two sentences.

export type Language = 'python' | 'sql' | 'html'

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

export type Exercise =
  | ConceptExercise
  | ChoiceExercise
  | BlankExercise
  | OrderExercise
  | MatchExercise
  | WriteExercise

export interface Lesson {
  /** Globally unique, kebab-case, prefixed with the unit id, e.g. "u1-print". */
  id: string
  title: string
  exercises: Exercise[]
}

export interface Unit {
  /** "u0" … "u10" */
  id: string
  /** Matches the CS50 week this unit follows, e.g. 0 for Scratch. */
  week: number
  title: string
  /** One short line shown on the path, e.g. "Variables, input and decisions". */
  summary: string
  lessons: Lesson[]
}
