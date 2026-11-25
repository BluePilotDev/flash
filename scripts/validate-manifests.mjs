// Validates every manifest in public/manifests against versions.js:
//  - files exist and merge (all-partitions.json + agnos.json overlay, like getManifest())
//  - every image archive URL answers HEAD with 200 (skip with --offline)
//  - prints bootloader hash differences against the newest version
// Usage: node scripts/validate-manifests.mjs [--offline]
import { readFileSync } from 'node:fs'
import { VERSIONS } from '../src/versions.js'

const offline = process.argv.includes('--offline')
const BOOTLOADER = ['xbl', 'xbl_config', 'abl', 'aop', 'devcfg']
const read = (id, f) => JSON.parse(readFileSync(new URL(`../public/manifests/${id}/${f}`, import.meta.url)))

function merged(id) {
  const agnos = read(id, 'agnos.json')
  return read(id, 'all-partitions.json').map((img) => agnos.find((a) => a.name === img.name) ?? img)
}

let failures = 0
const fail = (msg) => { failures++; console.error('FAIL', msg) }

const newest = Object.fromEntries(merged(VERSIONS[0].id).map((i) => [i.name, i]))
const seen = new Map()

for (const v of VERSIONS) {
  const images = merged(v.id)
  const byName = Object.fromEntries(images.map((i) => [i.name, i]))
  const gpt = images.filter((i) => i.gpt).length
  if (gpt !== 6) fail(`${v.id}: expected 6 GPT images, found ${gpt}`)
  for (const n of ['boot', 'system', ...BOOTLOADER]) if (!byName[n]) fail(`${v.id}: missing ${n}`)
  if (!images.some((i) => i.name.startsWith('userdata_'))) fail(`${v.id}: no userdata image`)
  const older = BOOTLOADER.filter((n) => byName[n]?.hash !== newest[n]?.hash)
  console.log(`${v.id} (AGNOS ${v.agnos}): ${images.length} images, bootloader differs from ${VERSIONS[0].id}: ${older.join(', ') || 'no'}`)
  for (const i of images) seen.set(i.url, `${v.id}/${i.name}`)
}

if (!offline) {
  console.log(`Checking ${seen.size} unique image URLs...`)
  const urls = [...seen.entries()]
  let next = 0
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < urls.length) {
      const [url, label] = urls[next++]
      try {
        const res = await fetch(url, { method: 'HEAD' })
        if (res.status !== 200) fail(`${label}: HTTP ${res.status} ${url}`)
      } catch (e) {
        fail(`${label}: ${e.message} ${url}`)
      }
    }
  }))
}

if (failures) {
  console.error(`${failures} problem(s)`)
  process.exit(1)
}
console.log('All manifests OK')
