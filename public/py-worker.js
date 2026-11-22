// Runs learner Python in a worker so an endless loop can't freeze the page.
// Messages in:  { id, code, stdin: string[] }
// Messages out: { id, ok, stdout, error } | { ready: true } | { loadError }
/* global loadPyodide, importScripts */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'
let py = null

const ready = (async () => {
  try {
    importScripts(PYODIDE + 'pyodide.js')
    py = await loadPyodide({ indexURL: PYODIDE })
    self.postMessage({ ready: true })
  } catch (e) {
    self.postMessage({ loadError: String(e) })
  }
})()

self.onmessage = async (ev) => {
  await ready
  const { id, code, stdin } = ev.data
  if (!py) return self.postMessage({ id, ok: false, stdout: '', error: 'Python could not load. Check your connection.' })
  let out = ''
  const dec = new TextDecoder()
  const lines = [...(stdin || [])]
  py.setStdout({ write: (buf) => ((out += dec.decode(buf)), buf.length) })
  py.setStderr({ write: (buf) => buf.length })
  py.setStdin({ stdin: () => (lines.length ? lines.shift() + '\n' : undefined) })
  try {
    // Fresh globals each run so earlier attempts don't leak in.
    // Some standard modules (sqlite3, for one) ship separately in Pyodide: load whatever the code imports.
    // Its progress messages are kept out of the learner's output.
    await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} })
    const globals = py.toPy({ __name__: '__main__' })
    await py.runPythonAsync(code, { globals, filename: '<your code>' })
    globals.destroy()
    self.postMessage({ id, ok: true, stdout: out, error: null })
  } catch (e) {
    self.postMessage({ id, ok: false, stdout: out, error: String(e.message || e) })
  }
}
