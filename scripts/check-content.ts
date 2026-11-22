// Validates course content: structure, unique ids, and that every `write`
// solution passes its own tests (Python + SQL run with the local Python).
// Usage: npx tsx scripts/check-content.ts [unitId ...]
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { units } from '../src/content/index.ts'
import type { Exercise, WriteExercise } from '../src/content/types.ts'

const only = process.argv.slice(2)
const errors: string[] = []
const warnings: string[] = []
const ids = new Set<string>()
const dir = mkdtempSync(join(tmpdir(), 'ltc-'))
const PY = process.platform === 'win32' ? 'python' : 'python3'

function runPython(code: string, stdin: string[] = []): { out: string; err: string } {
  const file = join(dir, 'prog.py')
  writeFileSync(file, code)
  const r = spawnSync(PY, ['-I', file], {
    input: stdin.map((l) => l + '\n').join(''),
    encoding: 'utf8',
    cwd: dir,
    timeout: 10_000,
  })
  return { out: r.stdout ?? '', err: r.stderr ?? '' }
}

// Mirrors public/js-worker.js: console.log is the output, input() reads test lines.
const JS_PRELUDE = `
const __lines = JSON.parse(process.argv[2] || '[]');
const __show = (v) => { if (typeof v === 'string') return v; if (v === undefined) return 'undefined'; if (typeof v === 'function') return '[Function]'; try { const s = JSON.stringify(v); return s === undefined ? String(v) : s } catch { return String(v) } };
let __out = '';
const __log = (...a) => { __out += a.map(__show).join(' ') + '\\n' };
const __console = { log: __log, info: __log, warn: __log, error: __log };
const __input = () => (__lines.length ? __lines.shift() : '');
const __code = require('fs').readFileSync(process.argv[3], 'utf8');
try { new Function('console', 'input', '"use strict";\\n' + __code)(__console, __input); process.stdout.write(__out) }
catch (e) { process.stdout.write(__out); process.stderr.write(String(e && e.message || e)); process.exit(1) }
`

function runJs(code: string, stdin: string[] = []): { out: string; err: string } {
  writeFileSync(join(dir, 'harness.cjs'), JS_PRELUDE)
  writeFileSync(join(dir, 'prog.js'), code)
  const r = spawnSync(process.execPath, [join(dir, 'harness.cjs'), JSON.stringify(stdin), join(dir, 'prog.js')], { encoding: 'utf8', cwd: dir, timeout: 10_000 })
  return { out: r.stdout ?? '', err: r.stderr ?? '' }
}

// Mirrors src/runners/sql.ts formatting: integers without ".0", NULL for null.
const SQL_HARNESS = `
import sqlite3, sys
db = sqlite3.connect(':memory:')
db.executescript(open(sys.argv[1]).read())
cur = db.execute(open(sys.argv[2]).read())
def fmt(v):
    if v is None: return 'NULL'
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    return str(v)
for row in cur.fetchall():
    print('|'.join(fmt(v) for v in row))
`

function runSql(setup: string, query: string): { out: string; err: string } {
  writeFileSync(join(dir, 'h.py'), SQL_HARNESS)
  writeFileSync(join(dir, 'setup.sql'), setup)
  writeFileSync(join(dir, 'q.sql'), query)
  const r = spawnSync(PY, ['-I', join(dir, 'h.py'), join(dir, 'setup.sql'), join(dir, 'q.sql')], {
    encoding: 'utf8',
    cwd: dir,
    timeout: 10_000,
  })
  return { out: r.stdout ?? '', err: r.stderr ?? '' }
}

const norm = (s: string) =>
  s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    // Drop blank lines at the start and end, but keep leading spaces: they matter (pyramids).
    .replace(/^\n+|\n+$/g, '')

function passes(ex: WriteExercise, code: string): string | null {
  for (const [i, t] of ex.tests.entries()) {
    let r: { out: string; err: string }
    if (ex.language === 'python') r = runPython(code, t.stdin)
    else if (ex.language === 'sql') r = runSql(ex.setup ?? '', code)
    else if (ex.language === 'javascript') r = runJs(code, t.stdin)
    else return null
    if (norm(r.out) !== norm(t.expected))
      return `test ${i}: expected ${JSON.stringify(norm(t.expected))}, got ${JSON.stringify(norm(r.out))}${r.err ? ' / ' + r.err.trim().split('\n').pop() : ''}`
  }
  return null
}

function check(where: string, ex: Exercise) {
  const err = (m: string) => errors.push(`${where}: ${m}`)
  switch (ex.kind) {
    case 'concept': {
      if (ex.body.split(/\s+/).length > 80) warnings.push(`${where}: concept body over 80 words`)
      if (ex.output === undefined) break
      if (!ex.code) { err('output needs code'); break }
      let r: { out: string; err: string } | null = null
      if (ex.language === 'python') r = runPython(ex.code)
      else if (ex.language === 'javascript') r = runJs(ex.code)
      else if (ex.language === 'sql') {
        if (!ex.setup) err('sql worked example needs setup')
        else r = runSql(ex.setup, ex.code)
      } else err('output needs language python, javascript or sql')
      if (r && norm(r.out) !== norm(ex.output))
        err(`worked example output is wrong: expected ${JSON.stringify(norm(ex.output))}, got ${JSON.stringify(norm(r.out))}${r.err ? ' / ' + r.err.trim().split('\n').pop() : ''}`)
      break
    }
    case 'choice':
      if (ex.options.length < 2) err('needs 2+ options')
      if (!(ex.answer >= 0 && ex.answer < ex.options.length)) err('answer index out of range')
      if (new Set(ex.options).size !== ex.options.length) err('duplicate options')
      break
    case 'blank': {
      const gaps = ex.code.split('___').length - 1
      if (gaps !== ex.answers.length) err(`${gaps} gaps but ${ex.answers.length} answers`)
      for (const a of ex.answers) if (!ex.bank.includes(a)) err(`answer "${a}" not in bank`)
      if (ex.bank.length <= new Set(ex.answers).size) warnings.push(`${where}: bank has no distractors`)
      break
    }
    case 'order':
      if (ex.lines.length < 3) err('order needs 3+ lines')
      if (new Set(ex.lines).size !== ex.lines.length) err('duplicate lines make order ambiguous')
      break
    case 'match':
      if (ex.pairs.length < 3 || ex.pairs.length > 5) err('match needs 3–5 pairs')
      if (new Set(ex.pairs.map((p) => p[0])).size !== ex.pairs.length) err('duplicate left items')
      if (new Set(ex.pairs.map((p) => p[1])).size !== ex.pairs.length) err('duplicate right items')
      break
    case 'spot':
      if (ex.lines.length < 3) err('spot needs 3+ lines')
      if (!(ex.answer >= 0 && ex.answer < ex.lines.length)) err('answer index out of range')
      break
    case 'bits':
      if (!(ex.bits >= 3 && ex.bits <= 8)) err('bits must be 3–8')
      if (!(Number.isInteger(ex.target) && ex.target >= 0 && ex.target < 2 ** ex.bits)) err('target does not fit in bits')
      break
    case 'steps':
      if (ex.cells.length < 3 || ex.cells.length > 9) err('steps needs 3–9 cells')
      if (ex.steps.length < 2 || ex.steps.length > 5) err('steps needs 2–5 steps')
      for (const st of ex.steps) if (!(st.answer >= 0 && st.answer < ex.cells.length)) err('step answer out of range')
      break
    case 'type':
      if (!ex.accept.length || ex.accept.some((a) => !a.trim())) err('type needs non-empty accepted answers')
      if (ex.accept.some((a) => a.length > 40)) err('typed answers should be short (40 chars max)')
      break
    case 'write': {
      if (!ex.tests.length) err('write needs tests')
      if (ex.language === 'sql' && !ex.setup) err('sql write needs setup')
      if (ex.language === 'html') break
      const fail = passes(ex, ex.solution)
      if (fail) err(`solution fails: ${fail}`)
      else if (!passes(ex, ex.starter)) warnings.push(`${where}: starter already passes`)
      break
    }
  }
}

for (const unit of units) {
  if (only.length && !only.includes(unit.id)) continue
  if (!unit.lessons.length) errors.push(`${unit.id}: no lessons`)
  for (const lesson of unit.lessons) {
    if (ids.has(lesson.id)) errors.push(`duplicate lesson id ${lesson.id}`)
    ids.add(lesson.id)
    if (!lesson.id.startsWith(unit.id + '-')) errors.push(`${lesson.id}: id must start with ${unit.id}-`)
    if (lesson.exercises.length < 5) warnings.push(`${lesson.id}: only ${lesson.exercises.length} exercises`)
    lesson.exercises.forEach((ex, i) => check(`${lesson.id}#${i} (${ex.kind})`, ex))
    if (lesson.exercises.length > 14) warnings.push(`${lesson.id}: ${lesson.exercises.length} exercises (14 max)`)
    // Show before you ask: a code question needs a card with code since the last code question's topic,
    // and no more than four questions run without a teaching card.
    let run = 0
    let shown = false
    lesson.exercises.forEach((ex, i) => {
      if (ex.kind === 'concept') {
        run = 0
        if (ex.code) shown = true
        return
      }
      run++
      if (run === 5) warnings.push(`${lesson.id}#${i}: five questions in a row with no teaching card`)
      if (ex.kind === 'write' && !shown) warnings.push(`${lesson.id}#${i}: write question before any worked example`)
    })
  }
}

for (const w of warnings) console.log('warn ', w)
for (const e of errors) console.log('ERROR', e)
const n = units.filter((u) => !only.length || only.includes(u.id)).reduce((a, u) => a + u.lessons.length, 0)
console.log(`\n${n} lessons checked, ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
