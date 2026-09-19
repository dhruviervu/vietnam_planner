import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(root, '../src/pages/WhenToGoDiscover/data/eventMedia.ts'), 'utf8')
const files = [...src.matchAll(/w\('([^']+)'\)/g)].map((m) => m[1])

const ua = { 'User-Agent': 'VietnamPlanner/1.0 (image-audit)' }

async function commonsExists(file) {
  const title = `File:${file}`
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime&format=json`
  const r = await fetch(api, { headers: ua })
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  if (!page || page.missing || page.invalid || !page.imageinfo?.[0]) return false
  return true
}

let fail = 0
for (const file of files) {
  const ok = await commonsExists(file)
  if (!ok) {
    fail += 1
    console.log('FAIL', file)
  }
}
console.log('checked', files.length, 'fail', fail)
