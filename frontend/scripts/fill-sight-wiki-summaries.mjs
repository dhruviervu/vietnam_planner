/**
 * Fill empty Wikipedia extracts for catalog card blurbs (2–3 sentence summaries).
 * Run: node scripts/fill-sight-wiki-summaries.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const UA = {
  'User-Agent': 'VietnamPlanner/1.1 (sight-cards; educational; contact: local-dev)',
  Accept: 'application/json',
}

function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function titleMatches(title, name, city, region) {
  const t = fold(title)
  if (!t) return false
  if (t === fold(city) || t === fold(region) || t === 'vietnam' || t === 'viet nam') return false
  if (/^(list of|tourism in|geography of|history of vietnam)\b/.test(t)) return false
  const nameAll = fold(name)
    .replace(/[()]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
  if (!nameAll.length) return false
  return nameAll.filter((w) => t.includes(w)).length >= Math.min(2, nameAll.length)
}

async function restSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const r = await fetch(url, { headers: UA })
  if (r.status === 429) {
    const err = new Error('429')
    err.status = 429
    throw err
  }
  if (!r.ok) return null
  const j = await r.json()
  if (j.type === 'disambiguation') return null
  const extract = String(j.extract || '').trim()
  if (extract.length < 80) return null
  return { title: j.title || title, extract }
}

const jsonUrl = new URL('../src/pages/PlanBuilder/data/sightWikiBriefs.json', import.meta.url)
let briefs = {}
try {
  briefs = JSON.parse(readFileSync(jsonUrl, 'utf8'))
} catch {
  briefs = {}
}

const { SIGHT_CATALOG } = await import('../src/pages/PlanBuilder/data/experiences.ts')

let fetched = 0
let hit = 0
for (const e of SIGHT_CATALOG) {
  const existing = briefs[e.id]
  if (existing?.title && existing?.extract?.length > 80 && titleMatches(existing.title, e.name, e.city, e.region)) {
    continue
  }
  fetched += 1
  const candidates = [e.name, `${e.name} (${e.city})`, `${e.name}, Vietnam`]
  let found = { title: existing?.title || '', extract: existing?.extract || '' }
  try {
    for (const c of candidates) {
      const sum = await restSummary(c)
      await new Promise((r) => setTimeout(r, 280))
      if (!sum || !titleMatches(sum.title, e.name, e.city, e.region)) continue
      found = sum
      hit += 1
      break
    }
  } catch (err) {
    if (err.status === 429) {
      await new Promise((r) => setTimeout(r, 20000))
    }
  }
  briefs[e.id] = found
  if (fetched % 15 === 0) {
    writeFileSync(jsonUrl, JSON.stringify(briefs, null, 2))
    console.log(`looked ${fetched} hit ${hit} last ${e.id} wiki=${briefs[e.id]?.title || '-'}`)
  }
}

writeFileSync(jsonUrl, JSON.stringify(briefs, null, 2))
console.log(`Done. looked ${fetched} hit ${hit}`)
