import { Lightbulb, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  BlankExercise,
  ChoiceExercise,
  ConceptExercise,
  Exercise,
  OrderExercise,
  WriteExercise,
} from '../content/types'
import { check, runPythonFree, runSqlQuery, warmPython, type RunResult } from '../runners'
import { Match } from './match'
import { Code, highlight, Inline, Prose } from './text'

export type Grader = () => boolean | Promise<boolean>

export interface ExProps<E extends Exercise> {
  ex: E
  /** Answer checked; inputs frozen. */
  locked: boolean
  /** Correct answer has been revealed (after a wrong answer). */
  reveal: boolean
  register: (g: Grader | null) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Shuffle, but never leave it already solved. */
function shuffleApart<T>(arr: T[]): T[] {
  if (arr.length < 2) return arr
  for (let k = 0; k < 10; k++) {
    const s = shuffle(arr)
    if (s.some((x, i) => x !== arr[i])) return s
  }
  return [...arr].reverse()
}

const Prompt = ({ text }: { text: string }) => (
  <h2 className="text-[1.35rem] leading-snug font-semibold text-balance">
    <Inline text={text} />
  </h2>
)

// ---------- Concept ----------

export function Concept({ ex, register }: ExProps<ConceptExercise>) {
  useEffect(() => register(() => true), [register])
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-bold text-balance">{ex.title}</h2>
      <Prose text={ex.body} className="text-lg leading-relaxed text-ink-2" />
      {ex.code && <Code code={ex.code} lang={ex.language} />}
    </div>
  )
}

// ---------- Choice ----------

export function Choice({ ex, locked, reveal, register }: ExProps<ChoiceExercise>) {
  const [pick, setPick] = useState<number | null>(null)
  const order = useMemo(() => shuffle(ex.options.map((_, i) => i)), [ex])
  useEffect(() => register(pick === null ? null : () => pick === ex.answer), [pick, ex, register])
  useEffect(() => {
    if (locked) return
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= order.length && !(e.target instanceof HTMLTextAreaElement)) setPick(order[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [order, locked])
  const mono = ex.options.every((o) => o.length < 40) && !!ex.code
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      {ex.code && <Code code={ex.code} lang={ex.language} />}
      <div className="grid gap-3">
        {order.map((i, n) => {
          const isAnswer = i === ex.answer
          const state = locked && isAnswer && (reveal || pick === i) ? 'good' : locked && pick === i ? 'bad' : null
          return (
            <button
              key={i}
              disabled={locked}
              aria-pressed={pick === i}
              onClick={() => setPick(i)}
              className={`tile flex items-center gap-3 px-4 py-3 text-left ${
                state === 'good' ? '!border-good !bg-good-soft' : state === 'bad' ? '!border-bad !bg-bad-soft' : ''
              }`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-rule text-sm font-semibold text-ink-3">
                {n + 1}
              </span>
              <span className={mono ? 'font-mono text-[0.95rem] whitespace-pre-wrap' : ''}>
                <Inline text={ex.options[i]} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Blank ----------

export function Blank({ ex, locked, reveal, register }: ExProps<BlankExercise>) {
  const bank = useMemo(() => shuffle(ex.bank.map((w, i) => ({ w, i }))), [ex])
  const [fill, setFill] = useState<(number | null)[]>(() => ex.answers.map(() => null))
  useEffect(
    () => register(fill.every((f) => f !== null) ? () => fill.every((f, i) => ex.bank[f!] === ex.answers[i]) : null),
    [fill, ex, register],
  )
  const used = new Set(fill.filter((f) => f !== null))
  const place = (bi: number) => {
    const slot = fill.indexOf(null)
    if (slot < 0) return
    setFill(fill.map((f, i) => (i === slot ? bi : f)))
  }
  const parts = ex.code.split('___')
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      <pre className="code !whitespace-pre-wrap">
        <code>
          {parts.map((p, i) => (
            <span key={i}>
              {highlight(p, ex.language)}
              {i < parts.length - 1 && (
                <button
                  disabled={locked || fill[i] === null}
                  onClick={() => setFill(fill.map((f, j) => (j === i ? null : f)))}
                  className={`mx-0.5 inline-block min-w-14 rounded-t-md border-b-2 px-2 align-baseline font-mono ${
                    locked
                      ? ex.bank[fill[i]!] === ex.answers[i]
                        ? 'border-good bg-good/25 text-white'
                        : 'border-bad bg-bad/30 text-white'
                      : fill[i] === null
                        ? 'border-dashed border-ink-3 bg-white/5 text-transparent'
                        : 'border-cobalt bg-cobalt/30 text-white'
                  }`}
                  aria-label={fill[i] === null ? `Gap ${i + 1}, empty` : `Gap ${i + 1}: ${ex.bank[fill[i]!]}. Tap to remove.`}
                >
                  {fill[i] === null ? '____' : ex.bank[fill[i]!]}
                </button>
              )}
            </span>
          ))}
        </code>
      </pre>
      {locked && reveal && (
        <p className="text-sm text-ink-2">
          Answer: {ex.answers.map((a, i) => <code key={i} className="mx-1 rounded bg-good-soft px-1.5 font-mono text-good">{a}</code>)}
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        {bank.map(({ w, i }) => (
          <button
            key={i}
            disabled={locked || used.has(i)}
            onClick={() => place(i)}
            className={`tile px-3.5 py-2 font-mono ${used.has(i) ? 'opacity-30' : ''}`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------- Order ----------

export function Order({ ex, locked, reveal, register }: ExProps<OrderExercise>) {
  const pool = useMemo(() => shuffleApart(ex.lines.map((_, i) => i)), [ex])
  const [picked, setPicked] = useState<number[]>([])
  useEffect(
    () => register(picked.length === ex.lines.length ? () => picked.every((p, i) => ex.lines[p] === ex.lines[i]) : null),
    [picked, ex, register],
  )
  return (
    <div className="space-y-5">
      <Prompt text={ex.prompt} />
      <div className="min-h-24 space-y-2 rounded-2xl border-2 border-dashed border-rule p-2">
        {picked.length === 0 && <p className="p-3 text-ink-3">Tap the lines below in order.</p>}
        {picked.map((p, i) => {
          const ok = ex.lines[p] === ex.lines[i]
          return (
            <button
              key={p}
              disabled={locked}
              onClick={() => setPicked(picked.filter((x) => x !== p))}
              className={`tile block w-full px-3 py-2 text-left font-mono text-[0.92rem] whitespace-pre ${
                locked ? (ok ? '!border-good !bg-good-soft' : '!border-bad !bg-bad-soft') : ''
              }`}
            >
              {highlight(ex.lines[p], ex.language)}
            </button>
          )
        })}
      </div>
      <div className="space-y-2">
        {pool
          .filter((p) => !picked.includes(p))
          .map((p) => (
            <button
              key={p}
              disabled={locked}
              onClick={() => setPicked([...picked, p])}
              className="tile block w-full px-3 py-2 text-left font-mono text-[0.92rem] whitespace-pre"
            >
              {highlight(ex.lines[p].trimStart(), ex.language)}
            </button>
          ))}
      </div>
      {locked && reveal && <Code code={ex.lines.join('\n')} lang={ex.language} />}
    </div>
  )
}

// ---------- Write ----------

function Editor({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const lines = value.split('\n').length
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const { selectionStart: a, selectionEnd: b } = el
      onChange(value.slice(0, a) + '    ' + value.slice(b))
      requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4))
    } else if (e.key === 'Enter') {
      // Keep indentation; indent once more after a colon.
      const a = el.selectionStart
      const lineStart = value.lastIndexOf('\n', a - 1) + 1
      const line = value.slice(lineStart, a)
      const indent = line.match(/^\s*/)![0] + (line.trimEnd().endsWith(':') ? '    ' : '')
      e.preventDefault()
      onChange(value.slice(0, a) + '\n' + indent + value.slice(el.selectionEnd))
      requestAnimationFrame(() => el.setSelectionRange(a + 1 + indent.length, a + 1 + indent.length))
    }
  }
  return (
    <div className="code flex !p-0">
      <div aria-hidden className="py-3.5 pr-3 pl-3 text-right text-ink-3 select-none">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={ta}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        spellCheck={false}
        wrap="off"
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="Your code"
        rows={Math.max(5, lines + 1)}
        className="min-w-0 flex-1 resize-none overflow-x-auto bg-transparent py-3.5 pr-4 whitespace-pre font-mono text-[0.9rem] leading-[1.6] text-[#e6ebf5] outline-none"
      />
    </div>
  )
}

function Output({ result, ex }: { result: RunResult; ex: WriteExercise }) {
  if (ex.language === 'html') {
    if (result.pass) return null
    return (
      <div className="rounded-xl bg-bad-soft p-3 text-sm">
        Not there yet. Your page needs something matching <code className="font-mono font-semibold">{result.expected}</code>.
      </div>
    )
  }
  const test = result.failedTest !== undefined ? ex.tests[result.failedTest] : undefined
  return (
    <div className="space-y-3 text-sm">
      {result.error && <div className="rounded-xl bg-bad-soft p-3 whitespace-pre-wrap">{result.error}</div>}
      {!result.pass && test?.stdin && test.stdin.length > 0 && (
        <p className="text-ink-2">
          Typed in: {test.stdin.map((s, i) => <code key={i} className="mx-1 rounded bg-white px-1.5 font-mono">{s}</code>)}
        </p>
      )}
      {!result.pass && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-medium text-ink-2">Your output</p>
            <pre className="code min-h-12 !py-2 text-[0.82rem]">{result.output || ' '}</pre>
          </div>
          <div>
            <p className="mb-1 font-medium text-ink-2">Expected</p>
            <pre className="code min-h-12 !py-2 text-[0.82rem]">{result.expected}</pre>
          </div>
        </div>
      )}
      {result.pass && result.output && <pre className="code !py-2 text-[0.82rem]">{result.output}</pre>}
    </div>
  )
}

export function Write({ ex, locked, reveal, register }: ExProps<WriteExercise>) {
  const [code, setCode] = useState(ex.starter)
  const [result, setResult] = useState<RunResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(ex.language === 'python')
  const [hint, setHint] = useState(false)
  const [scratch, setScratch] = useState<{ output: string; error?: string; table?: { columns: string[]; rows: string[][] } } | null>(null)

  useEffect(() => {
    if (ex.language !== 'python') return
    warmPython().then(
      () => setLoading(false),
      () => setLoading(false),
    )
  }, [ex.language])

  useEffect(
    () =>
      register(
        code.trim()
          ? async () => {
              setBusy(true)
              setScratch(null)
              const r = await check(ex, code)
              setResult(r)
              setBusy(false)
              return r.pass
            }
          : null,
      ),
    [code, ex, register],
  )

  const run = async () => {
    setBusy(true)
    setResult(null)
    if (ex.language === 'python') setScratch(await runPythonFree(code, ex.tests[0]?.stdin ?? []))
    else if (ex.language === 'sql') {
      const r = await runSqlQuery(ex.setup ?? '', code)
      setScratch({ output: '', error: r.error, table: r })
    }
    setBusy(false)
  }

  const tables = useMemo(() => (ex.setup ? [...ex.setup.matchAll(/CREATE TABLE\s+(\w+)\s*\(([^;]*)\)/gi)].map((m) => ({ name: m[1], cols: m[2].split(',').map((c) => c.trim().split(/\s+/)[0]).filter((c) => !/^(PRIMARY|FOREIGN)$/i.test(c)) })) : []), [ex.setup])

  return (
    <div className="space-y-4">
      <Prompt text={ex.prompt} />
      {tables.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {tables.map((t) => (
            <div key={t.name} className="rounded-xl border-2 border-rule bg-white px-3 py-2">
              <span className="font-mono font-semibold">{t.name}</span>
              <span className="font-mono text-ink-2"> ({t.cols.join(', ')})</span>
            </div>
          ))}
        </div>
      )}
      <Editor value={code} onChange={(v) => { setCode(v); setResult(null) }} disabled={locked} />
      <div className="flex flex-wrap gap-2">
        {ex.language !== 'html' && (
          <button className="btn btn-ghost !py-2 text-sm" onClick={run} disabled={busy || locked || loading}>
            <Play size={16} /> {loading ? 'Loading Python…' : busy ? 'Running…' : 'Run'}
          </button>
        )}
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => setHint(true)} disabled={hint}>
          <Lightbulb size={16} /> Hint
        </button>
        <button className="btn btn-ghost !py-2 text-sm" onClick={() => { setCode(ex.starter); setResult(null); setScratch(null) }} disabled={locked}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      {hint && (
        <p className="rounded-xl bg-flame-soft p-3 text-sm">
          <Inline text={ex.hint} />
        </p>
      )}
      {scratch && (
        <div className="space-y-2 text-sm">
          {scratch.error && <div className="rounded-xl bg-bad-soft p-3 whitespace-pre-wrap">{scratch.error}</div>}
          {scratch.table && !scratch.error && (
            <div className="overflow-x-auto rounded-xl border-2 border-rule bg-white">
              <table className="w-full font-mono text-[0.82rem]">
                <thead>
                  <tr>{scratch.table.columns.map((c) => <th key={c} className="border-b-2 border-rule px-3 py-1.5 text-left">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {scratch.table.rows.map((r, i) => (
                    <tr key={i}>{r.map((v, j) => <td key={j} className="border-b border-rule px-3 py-1">{v}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {scratch.table.rows.length === 0 && <p className="p-3 text-ink-3">No rows.</p>}
            </div>
          )}
          {!scratch.table && <pre className="code !py-2 text-[0.82rem]">{scratch.output || '(nothing printed)'}</pre>}
        </div>
      )}
      {ex.language === 'html' && (
        <iframe title="Preview" sandbox="" srcDoc={code} className="h-48 w-full rounded-xl border-2 border-rule bg-white" />
      )}
      {result && <Output result={result} ex={ex} />}
      {reveal && (
        <div>
          <p className="mb-1 text-sm font-medium text-ink-2">One way to solve it</p>
          <Code code={ex.solution} lang={ex.language} />
        </div>
      )}
    </div>
  )
}

export function ExerciseView(props: ExProps<Exercise>) {
  const { ex } = props
  switch (ex.kind) {
    case 'concept':
      return <Concept {...props} ex={ex} />
    case 'choice':
      return <Choice {...props} ex={ex} />
    case 'blank':
      return <Blank {...props} ex={ex} />
    case 'order':
      return <Order {...props} ex={ex} />
    case 'match':
      return <Match {...props} ex={ex} />
    case 'write':
      return <Write {...props} ex={ex} />
  }
}
