// Renders world scenes to PNG files so they can be checked by eye.
// Usage: npx tsx scripts/render-worlds.ts <out-dir> [unit ...]
// Writes <unit>.png (3x scale) for each scene, and sheet.png with all of them.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { crc32, deflateSync } from 'node:zlib'
import { H, paint, W } from '../src/ui/worlds/canvas.ts'
import { WORLDS } from '../src/ui/worlds/index.ts'

const [out, ...only] = process.argv.slice(2)
if (!out) throw new Error('usage: render-worlds.ts <out-dir> [unit ...]')
mkdirSync(out, { recursive: true })

function png(width: number, height: number, rgb: Uint8Array): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const head = Buffer.alloc(4)
    head.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const tail = Buffer.alloc(4)
    tail.writeUInt32BE(crc32(body))
    return Buffer.concat([head, body, tail])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.set([8, 2, 0, 0, 0], 8)
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y++) Buffer.from(rgb.buffer, y * width * 3, width * 3).copy(raw, y * (width * 3 + 1) + 1)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]

function pixels(unit: string): Uint8Array {
  const world = WORLDS.find((w) => w.unit === unit)!
  const c = paint(world)
  const rgb = new Uint8Array(W * H * 3)
  let unpainted = 0
  c.px.forEach((col, i) => {
    if (!col) unpainted++
    if (col && !/^#[0-9a-fA-F]{6}$/.test(col)) throw new Error(`${unit}: colours must be #rrggbb, got ${col}`)
    rgb.set(col ? hex(col) : [255, 0, 255], i * 3)
  })
  if (unpainted) console.log(`warn  ${unit}: ${unpainted} pixels never painted (shown magenta)`)
  return rgb
}

function scale(rgb: Uint8Array, s: number): Uint8Array {
  const o = new Uint8Array(W * s * H * s * 3)
  for (let y = 0; y < H * s; y++) for (let x = 0; x < W * s; x++) o.set(rgb.subarray((Math.floor(y / s) * W + Math.floor(x / s)) * 3, (Math.floor(y / s) * W + Math.floor(x / s)) * 3 + 3), (y * W * s + x) * 3)
  return o
}

const list = WORLDS.filter((w) => !only.length || only.includes(w.unit))
const seen = new Set<string>()
for (const w of WORLDS) {
  if (seen.has(w.unit)) throw new Error(`two scenes for ${w.unit}`)
  seen.add(w.unit)
}
for (const w of list) {
  writeFileSync(join(out, `${w.unit}.png`), png(W * 3, H * 3, scale(pixels(w.unit), 3)))
  console.log(`${w.unit}  ${w.landmark} (${w.place})`)
}
// Contact sheet, 4 across, at 1x.
const cols = 4
const rows = Math.ceil(list.length / cols)
const sheet = new Uint8Array(cols * W * rows * H * 3)
list.forEach((w, i) => {
  const rgb = pixels(w.unit)
  const ox = (i % cols) * W
  const oy = Math.floor(i / cols) * H
  for (let y = 0; y < H; y++) sheet.set(rgb.subarray(y * W * 3, (y + 1) * W * 3), ((oy + y) * cols * W + ox) * 3)
})
if (list.length) writeFileSync(join(out, 'sheet.png'), png(cols * W, rows * H, sheet))
console.log(`${list.length} scenes written to ${out}`)
