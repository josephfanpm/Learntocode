// Runs learner JavaScript in a worker so an endless loop can't freeze the page.
// Messages in:  { id, code, stdin: string[] }
// Messages out: { id, ok, stdout, error }
// The learner's code gets console.log (captured as output) and input(), which
// returns the next line of test input, like Python's input().
const show = (v) => {
  if (typeof v === 'string') return v
  if (v === undefined) return 'undefined'
  if (typeof v === 'function') return '[Function]'
  try {
    const s = JSON.stringify(v)
    return s === undefined ? String(v) : s
  } catch {
    return String(v)
  }
}

self.onmessage = (ev) => {
  const { id, code, stdin } = ev.data
  const lines = [...(stdin || [])]
  let out = ''
  const log = (...args) => {
    out += args.map(show).join(' ') + '\n'
  }
  const fakeConsole = { log, info: log, warn: log, error: log }
  const input = () => (lines.length ? lines.shift() : '')
  try {
    // "use strict" catches typos such as assigning to an undeclared name.
    new Function('console', 'input', '"use strict";\n' + code)(fakeConsole, input)
    self.postMessage({ id, ok: true, stdout: out, error: null })
  } catch (e) {
    self.postMessage({ id, ok: false, stdout: out, error: (e && e.name ? e.name + ': ' : '') + (e && e.message ? e.message : String(e)) })
  }
}
