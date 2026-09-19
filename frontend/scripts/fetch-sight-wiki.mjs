/**
 * Resume-friendly Wikipedia REST lookups for sights whose curated guide
 * is under 950 words. Title must match the sight — never the whole city page.
 */
import { writeFileSync, readFileSync } from 'node:fs'

const UA = {
  'User-Agent': 'VietnamPlanner/1.0 (visitor-guides; educational; contact: local-dev)',
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
  const hits = nameAll.filter((w) => t.includes(w)).length
  return hits >= Math.min(2, nameAll.length)
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
  if (extract.length < 120) return null
  return { title: j.title || title, extract }
}

async function wikiExtract(title) {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    explaintext: '1',
    redirects: '1',
    titles: title,
    format: 'json',
    origin: '*',
  })}`
  const r = await fetch(url, { headers: UA })
  if (r.status === 429) {
    const err = new Error('429')
    err.status = 429
    throw err
  }
  if (!r.ok) return ''
  const j = await r.json()
  const page = Object.values(j?.query?.pages || {})[0]
  if (!page || page.missing) return ''
  return String(page.extract || '').trim()
}

async function lookup(name, city, region) {
  const candidates = [
    name,
    `${name} (${city})`,
    `${name}, Vietnam`,
    `${name} Vietnam`,
  ]
  for (const c of candidates) {
    const sum = await restSummary(c)
    await new Promise((r) => setTimeout(r, 400))
    if (!sum || !titleMatches(sum.title, name, city, region)) continue
    const long = await wikiExtract(sum.title)
    await new Promise((r) => setTimeout(r, 400))
    const extract = long.length > sum.extract.length ? long.slice(0, 8000) : sum.extract
    return { title: sum.title, extract }
  }
  return { title: '', extract: '' }
}

const jsonUrl = new URL('../src/pages/PlanBuilder/data/sightWikiBriefs.json', import.meta.url)
let briefs = {}
try {
  briefs = JSON.parse(readFileSync(jsonUrl, 'utf8'))
} catch {
  briefs = {}
}

const { EXPERIENCES } = await import('../src/pages/PlanBuilder/data/experiences.ts')
const { EXPERIENCE_GUIDES, wordCount } = await import(
  '../src/pages/PlanBuilder/data/experienceGuides.ts'
)

const SKIP = 950
let skip = 0
let fetched = 0
let hit = 0
let backoff = 0

for (const e of EXPERIENCES) {
  const curated = EXPERIENCE_GUIDES[e.id] || ''
  if (wordCount(curated) >= SKIP) {
    skip++
    continue
  }
  const existing = briefs[e.id]
  if (existing?.title && titleMatches(existing.title, e.name, e.city, e.region) && existing.extract?.length > 120) {
    hit++
    continue
  }
  fetched++
  try {
    const found = await lookup(e.name, e.city, e.region)
    briefs[e.id] = found
    if (found.extract) hit++
    backoff = 0
  } catch (err) {
    if (err.status === 429 || /429/.test(err.message)) {
      backoff = Math.min((backoff || 20000) * 1.5, 120000)
      console.log('429 backoff', Math.round(backoff), 'at', e.id)
      await new Promise((r) => setTimeout(r, backoff))
      try {
        const found = await lookup(e.name, e.city, e.region)
        briefs[e.id] = found
        if (found.extract) hit++
      } catch {
        briefs[e.id] = { title: '', extract: '' }
      }
    } else {
      console.error('fail', e.id, err.message)
      briefs[e.id] = { title: '', extract: '' }
    }
  }
  if (fetched % 10 === 0) {
    writeFileSync(jsonUrl, JSON.stringify(briefs, null, 2))
    console.log(`looked ${fetched} hit ${hit} skip ${skip} last ${e.id} wiki=${briefs[e.id]?.title || '-'}`)
  }
}

writeFileSync(jsonUrl, JSON.stringify(briefs, null, 2))
console.log('done skip', skip, 'looked', fetched, 'wikiHits', hit)
