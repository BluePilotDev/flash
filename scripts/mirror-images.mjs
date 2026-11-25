// Downloads every image archive referenced by the manifests into ./mirror/agnosupdate/ (gitignored),
// keeping comma's file names so URLs can later be rewritten by swapping the host/prefix only.
// Skips files that already exist with the right size. Usage: node scripts/mirror-images.mjs
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { VERSIONS } from '../src/versions.js'

const OUT = new URL('../mirror/agnosupdate/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const urls = new Map()
for (const v of VERSIONS) {
  const read = (f) => JSON.parse(readFileSync(new URL(`../public/manifests/${v.id}/${f}`, import.meta.url)))
  const agnos = read('agnos.json')
  for (const img of read('all-partitions.json')) {
    const u = (agnos.find((a) => a.name === img.name) ?? img).url
    if (!urls.has(u)) urls.set(u, [])
    urls.get(u).push(v.id)
  }
}

const list = [...urls.keys()]
console.log(`${list.length} files to mirror`)
let next = 0, done = 0, failed = 0
async function worker() {
  while (next < list.length) {
    const url = list[next++]
    const name = url.split('/').pop()
    const dest = OUT + name
    try {
      const head = await fetch(url, { method: 'HEAD' })
      const size = Number(head.headers.get('content-length'))
      if (existsSync(dest) && statSync(dest).size === size) { done++; continue }
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await pipeline(Readable.fromWeb(res.body), createWriteStream(dest + '.part'))
      if (statSync(dest + '.part').size !== size) throw new Error('size mismatch')
      renameSync(dest + '.part', dest)
      done++
      console.log(`[${done}/${list.length}] ${name}`)
    } catch (e) {
      failed++
      console.error(`FAILED ${name}: ${e.message}`)
    }
  }
}
await Promise.all(Array.from({ length: 3 }, worker))
console.log(`done: ${done} ok, ${failed} failed`)
process.exit(failed ? 1 : 0)
