import type { ReactNode } from 'react'
import type { Language } from '../content/types'

const PY_KW = /^(def|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|class|pass|break|continue|lambda|None|True|False|is|global|yield)$/
const SQL_KW = /^(SELECT|FROM|WHERE|ORDER|BY|GROUP|HAVING|LIMIT|JOIN|ON|AS|AND|OR|NOT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|INTEGER|TEXT|REAL|COUNT|AVG|SUM|MIN|MAX|DISTINCT|LIKE|IN|IS|NULL|ASC|DESC|INNER|LEFT|FOREIGN|REFERENCES)$/i
const JS_KW = /^(let|const|var|function|return|if|else|for|while|document|true|false|null|new|this)$/

/** Tiny syntax highlighter: keywords, strings, numbers, comments, calls. */
export function highlight(code: string, lang?: Language): ReactNode[] {
  if (lang === 'html') {
    return code.split(/(<!--[\s\S]*?-->|<\/?[\w-]+|>|"[^"]*")/g).map((part, i) => {
      if (!part) return null
      if (part.startsWith('<!--')) return <span key={i} className="tok-c">{part}</span>
      if (part.startsWith('<') || part === '>') return <span key={i} className="tok-t">{part}</span>
      if (part.startsWith('"')) return <span key={i} className="tok-s">{part}</span>
      return part
    })
  }
  const kw = lang === 'sql' ? SQL_KW : lang === 'python' ? PY_KW : JS_KW
  const comment = lang === 'sql' ? '--[^\\n]*' : lang === 'python' ? '#[^\\n]*' : '//[^\\n]*'
  const re = new RegExp(`(${comment}|f?"(?:[^"\\\\\\n]|\\\\.)*"|f?'(?:[^'\\\\\\n]|\\\\.)*'|\\b\\d+(?:\\.\\d+)?\\b|\\b[A-Za-z_]\\w*\\b)`, 'g')
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index))
    const t = m[0]
    let cls = ''
    if (/^(#|--|\/\/)/.test(t)) cls = 'tok-c'
    else if (/^f?["']/.test(t)) cls = 'tok-s'
    else if (/^\d/.test(t)) cls = 'tok-n'
    else if (kw.test(t)) cls = 'tok-k'
    else if (code[re.lastIndex] === '(') cls = 'tok-f'
    out.push(cls ? <span key={i++} className={cls}>{t}</span> : t)
    last = re.lastIndex
  }
  out.push(code.slice(last))
  return out
}

export function Code({ code, lang, className = '' }: { code: string; lang?: Language; className?: string }) {
  return (
    <pre className={`code ${className}`}>
      <code>{highlight(code, lang)}</code>
    </pre>
  )
}

/** Inline formatting: `code` and **bold**. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 1 ? (
          <code key={i} className="rounded-md bg-cobalt-soft px-1.5 py-0.5 font-mono text-[0.88em] text-cobalt-deep">
            {p.slice(1, -1)}
          </code>
        ) : p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          p
        ),
      )}
    </>
  )
}

/** Paragraphs separated by blank lines. */
export function Prose({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>
          <Inline text={p} />
        </p>
      ))}
    </div>
  )
}
