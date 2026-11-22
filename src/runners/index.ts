import type { WriteExercise } from '../content/types'

export interface RunResult {
  /** All tests passed. */
  pass: boolean
  /** Output of the first failing test (or the first test if all pass). */
  output: string
  expected?: string
  /** Friendly error, if the code crashed. */
  error?: string
  /** Index of the failing test. */
  failedTest?: number
  testCount: number
}

export const norm = (s: string) =>
  s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim()

// ---------- Python ----------

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, (r: { ok: boolean; stdout: string; error: string | null }) => void>()
let readyPromise: Promise<void> | null = null

function startWorker(): Promise<void> {
  worker = new Worker(`${import.meta.env.BASE_URL}py-worker.js`)
  readyPromise = new Promise((resolve, reject) => {
    worker!.onmessage = (ev) => {
      const d = ev.data
      if (d.ready) return resolve()
      if (d.loadError) return reject(new Error(d.loadError))
      pending.get(d.id)?.(d)
      pending.delete(d.id)
    }
  })
  return readyPromise
}

/** Start loading Python early (it's ~10 MB the first time). */
export function warmPython(): Promise<void> {
  return readyPromise ?? startWorker()
}

const TIMEOUT_MS = 6000

async function runPythonOnce(code: string, stdin: string[]) {
  try {
    await warmPython()
  } catch {
    // Let the next attempt start a fresh worker.
    worker?.terminate()
    worker = null
    readyPromise = null
    return { ok: false, stdout: '', error: 'Python couldn’t load. Check your internet connection and try again.' }
  }
  return new Promise<{ ok: boolean; stdout: string; error: string | null }>((resolve) => {
    const id = ++seq
    const timer = setTimeout(() => {
      pending.delete(id)
      worker?.terminate()
      worker = null
      readyPromise = null
      resolve({
        ok: false,
        stdout: '',
        error: 'Your code ran for too long and was stopped. Is there a loop that never ends?',
      })
    }, TIMEOUT_MS)
    pending.set(id, (r) => {
      clearTimeout(timer)
      resolve(r)
    })
    worker!.postMessage({ id, code, stdin })
  })
}

const HINTS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/NameError: name '(\w+)' is not defined/, (m) => `Python doesn't know the name "${m[1]}". Check the spelling, or create it before you use it. Text needs quotes around it.`],
  [/SyntaxError: unterminated string literal/, () => 'A piece of text is missing its closing quote mark.'],
  [/SyntaxError: '\(' was never closed/, () => 'An opening bracket "(" is missing its closing ")".'],
  [/SyntaxError: expected ':'/, () => 'Lines that start a block (if, for, while, def) need a colon ":" at the end.'],
  [/IndentationError: expected an indented block/, () => 'The line after a colon needs to be indented (4 spaces).'],
  [/IndentationError: unexpected indent/, () => 'A line is indented when it shouldn’t be. Line it up with the lines around it.'],
  [/IndentationError|TabError/, () => 'The spacing at the start of a line doesn’t line up. Use 4 spaces per level.'],
  [/SyntaxError/, () => 'Python couldn’t read this line. Look for a missing quote, bracket or colon.'],
  [/TypeError: can only concatenate str \(not "(\w+)"\) to str/, (m) => `You’re adding text and a ${m[1] === 'int' ? 'number' : m[1]}. Turn the number into text with str(), or use an f-string.`],
  [/TypeError: unsupported operand type\(s\) for .*: 'int' and 'str'|'str' and 'int'/, () => 'You’re doing maths with text. Use int() to turn text like "5" into the number 5.'],
  [/ValueError: invalid literal for int\(\) with base 10: '(.*)'/, (m) => `int() can't turn "${m[1]}" into a whole number.`],
  [/IndexError: list index out of range/, () => 'You asked for a position that isn’t in the list. Positions start at 0 and stop at len(list) - 1.'],
  [/IndexError: string index out of range/, () => 'You asked for a position that isn’t in the text. Positions start at 0.'],
  [/KeyError: (.*)/, (m) => `The dictionary has no key ${m[1]}. Check the spelling, or use .get().`],
  [/ZeroDivisionError/, () => 'Your code divided by zero, which has no answer.'],
  [/EOFError/, () => 'Your code asked for input() more times than this test gives answers.'],
  [/RecursionError/, () => 'Your function keeps calling itself forever. Does it have a base case that stops it?'],
  [/AttributeError: '(\w+)' object has no attribute '(\w+)'/, (m) => `A ${m[1]} doesn't have .${m[2]}. Check the spelling.`],
]

/** Turn a Python traceback into one plain sentence plus the line number. */
export function friendlyError(raw: string): string {
  const lines = raw.trim().split('\n')
  const last = lines.filter((l) => l.trim()).at(-1) ?? raw
  const lineNo = [...raw.matchAll(/File "<(?:your code|exec)>", line (\d+)/g)].at(-1)?.[1]
  for (const [re, f] of HINTS) {
    const m = raw.match(re)
    if (m) return `${lineNo ? `Line ${lineNo}: ` : ''}${f(m)}\n\n${last.trim()}`
  }
  return `${lineNo ? `Line ${lineNo}: ` : ''}${last.trim()}`
}

async function runPython(ex: WriteExercise, code: string): Promise<RunResult> {
  const tests = ex.tests.length ? ex.tests : [{ expected: '' }]
  let first: RunResult | null = null
  for (const [i, t] of tests.entries()) {
    const r = await runPythonOnce(code, t.stdin ?? [])
    const output = r.stdout
    if (!r.ok) return { pass: false, output, error: friendlyError(r.error ?? ''), failedTest: i, expected: t.expected, testCount: tests.length }
    if (norm(output) !== norm(t.expected)) return { pass: false, output, expected: t.expected, failedTest: i, testCount: tests.length }
    first ??= { pass: true, output, testCount: tests.length }
  }
  return first!
}

/** Run code without tests (the "Run" button). */
export async function runPythonFree(code: string, stdin: string[]): Promise<{ output: string; error?: string }> {
  const r = await runPythonOnce(code, stdin)
  return { output: r.stdout, error: r.ok ? undefined : friendlyError(r.error ?? '') }
}

// ---------- SQL ----------

type SqlJs = Awaited<ReturnType<typeof import('sql.js').default>>
let sqlPromise: Promise<SqlJs> | null = null

function loadSql(): Promise<SqlJs> {
  sqlPromise ??= Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')]).then(([m, wasm]) =>
    m.default({ locateFile: () => wasm.default, useOldExtensionFunctions: false }),
  )
  return sqlPromise
}

export function formatSqlValue(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  return String(v)
}

export async function runSqlQuery(setup: string, query: string): Promise<{ columns: string[]; rows: string[][]; error?: string }> {
  const SQL = await loadSql()
  const db = new SQL.Database()
  try {
    db.run(setup)
    const res = db.exec(query)
    const last = res.at(-1)
    return { columns: last?.columns ?? [], rows: (last?.values ?? []).map((r) => r.map(formatSqlValue)) }
  } catch (e) {
    return { columns: [], rows: [], error: `${(e as Error).message}. Check spelling of table and column names, and that text is in 'single quotes'.` }
  } finally {
    db.close()
  }
}

async function runSql(ex: WriteExercise, code: string): Promise<RunResult> {
  const r = await runSqlQuery(ex.setup ?? '', code)
  const output = r.rows.map((row) => row.join('|')).join('\n')
  const expected = ex.tests[0]?.expected ?? ''
  if (r.error) return { pass: false, output, error: r.error, expected, failedTest: 0, testCount: 1 }
  const pass = norm(output) === norm(expected)
  return { pass, output, expected, failedTest: pass ? undefined : 0, testCount: 1 }
}

// ---------- HTML ----------

function runHtml(ex: WriteExercise, code: string): RunResult {
  const doc = new DOMParser().parseFromString(code, 'text/html')
  for (const [i, t] of ex.tests.entries()) {
    let ok = false
    try {
      ok = !!doc.querySelector(t.expected)
    } catch {
      ok = false
    }
    if (!ok) return { pass: false, output: '', expected: t.expected, failedTest: i, testCount: ex.tests.length }
  }
  return { pass: true, output: '', testCount: ex.tests.length }
}

/** Describe an HTML selector test in plain words. */
export function describeSelector(sel: string): string {
  return `Your page needs an element matching \`${sel}\``
}

export async function check(ex: WriteExercise, code: string): Promise<RunResult> {
  if (ex.language === 'python') return runPython(ex, code)
  if (ex.language === 'sql') return runSql(ex, code)
  return runHtml(ex, code)
}
