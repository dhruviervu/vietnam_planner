import { readFileSync, writeFileSync } from 'node:fs'
import { EXPERIENCES } from '../src/pages/PlanBuilder/data/experiences.ts'

function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function ok(title, e) {
  const t = fold(title)
  if (!t) return false
  if (t === fold(e.city) || t === fold(e.region) || t === 'vietnam') return false
  if (/^(list of|tourism in|geography of|history of vietnam)/.test(t)) return false
  const nameAll = fold(e.name)
    .replace(/[()]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
  if (!nameAll.length) return false
  return nameAll.filter((w) => t.includes(w)).length >= Math.min(2, nameAll.length)
}

const path = new URL('../src/pages/PlanBuilder/data/sightWikiBriefs.json', import.meta.url)
const data = JSON.parse(readFileSync(path, 'utf8'))
const byId = Object.fromEntries(EXPERIENCES.map((e) => [e.id, e]))
const out = {}
let keep = 0
let drop = 0
for (const [id, v] of Object.entries(data)) {
  const e = byId[id]
  if (e && v.title && v.extract && ok(v.title, e)) {
    out[id] = { title: v.title, extract: String(v.extract).slice(0, 8000) }
    keep++
  } else drop++
}
writeFileSync(path, JSON.stringify(out, null, 2))
console.log('keep', keep, 'drop', drop)
