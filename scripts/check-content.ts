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
    .trim()

function passes(ex: WriteExercise, code: string): string | null {
  for (const [i, t] of ex.tests.entries()) {
    let r: { out: string; err: string }
    if (ex.language === 'python') r = runPython(code, t.stdin)
    else if (ex.language === 'sql') r = runSql(ex.setup ?? '', code)
    else return null
    if (norm(r.out) !== norm(t.expected))
      return `test ${i}: expected ${JSON.stringify(norm(t.expected))}, got ${JSON.stringify(norm(r.out))}${r.err ? ' / ' + r.err.trim().split('\n').pop() : ''}`
  }
  return null
}

function check(where: string, ex: Exercise) {
  const err = (m: string) => errors.push(`${where}: ${m}`)
  switch (ex.kind) {
    case 'concept':
      if (ex.body.split(/\s+/).length > 80) warnings.push(`${where}: concept body over 80 words`)
      break
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
  }
}

for (const w of warnings) console.log('warn ', w)
for (const e of errors) console.log('ERROR', e)
const n = units.filter((u) => !only.length || only.includes(u.id)).reduce((a, u) => a + u.lessons.length, 0)
console.log(`\n${n} lessons checked, ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
