/**
 * Pull Google Maps opening hours for every sight and activity.
 * Incremental: re-run to fill gaps. FORCE=1 refetches everything.
 *
 *   npx tsx scripts/fetch-place-hours.ts
 *   LIMIT=8 npx tsx scripts/fetch-place-hours.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from 'playwright'
import { EXPERIENCES } from '../src/pages/PlanBuilder/data/experiences.ts'
import { CITY_ACTIVITIES } from '../src/pages/PlanBuilder/data/activities.ts'
import { PIN_BY_SOURCE_ID } from '../src/pages/PlanBuilder/lib/yourVietnam/itineraryPinCatalog.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'pages',
  'PlanBuilder',
  'data',
  'placeOpeningHours.json',
)
const FORCE = process.env.FORCE === '1'
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity
const WORKERS = Math.max(1, Number(process.env.WORKERS ?? 2))

type Row = {
  source: 'google'
  displayName?: string
  weekdayDescriptions: string[]
  alwaysOpen?: boolean
  fetchedAt?: string
  exceptionNotes?: string[]
}

type Job = {
  sourceId: string
  name: string
  city: string
  query: string
  lat?: number
  lng?: number
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function significantTokens(s: string) {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'from', 'vietnam', 'vietnamese', 'tour', 'visit',
    'street', 'city', 'class', 'workshop', 'making', 'lab',
  ])
  return normalizeName(s)
    .split(' ')
    .filter((w) => w.length > 3 && !stop.has(w))
}

function namesAlign(want: string, got: string) {
  const a = normalizeName(want)
  const b = normalizeName(got)
  if (!a || !b) return false
  if (a === b || b.includes(a) || a.includes(b)) return a.length >= 6 || b.length >= 6
  const wantTok = significantTokens(want)
  const gotTok = significantTokens(got)
  if (!wantTok.length || !gotTok.length) return false
  const hits = wantTok.filter((w) => gotTok.includes(w) || b.includes(w)).length
  return hits >= Math.min(2, wantTok.length)
}

function normalizeClockChunk(raw: string) {
  return raw
    .replace(/\u202f|\u00a0/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function toGoogleClock(token: string) {
  const t = token.trim()
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i)
  if (!m) return t
  const ap = m[3].toLowerCase() === 'p' ? 'PM' : 'AM'
  return `${Number(m[1])}:${m[2] ?? '00'} ${ap}`
}

function toGoogleRange(span: string) {
  const n = normalizeClockChunk(span)
  if (/^closed$/i.test(n)) return 'Closed'
  if (/open 24|24 hours|24\/7/i.test(n)) return 'Open 24 hours'
  return n
    .split(',')
    .map((part) => {
      const m = part.trim().match(
        /(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)\s*-\s*(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)/i,
      )
      if (!m) return part.trim()
      return `${toGoogleClock(m[1])} – ${toGoogleClock(m[2])}`
    })
    .join(', ')
}

function parseMapsHours(text: string): string[] | null {
  const body = text.replace(/\u202f|\u00a0/g, ' ')
  const found: Record<string, string> = {}
  const re =
    /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+((?:Closed|Open 24 hours|Open 24-hours|[\d:.\sapm,\-–to]+))/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    const day = m[1]
    const rest = toGoogleRange(m[2])
    if (rest && !/^suggest/i.test(rest)) found[day] = rest
  }
  if (Object.keys(found).length < 4) {
    for (const day of DAYS) {
      const lineRe = new RegExp(`${day}\\s*\\n\\s*([^\\n]+)`, 'i')
      const hit = body.match(lineRe)
      if (!hit) continue
      const rest = toGoogleRange(hit[1])
      if (rest && !/suggest|directions|website/i.test(rest)) found[day] = rest
    }
  }
  const lines = DAYS.map((d) => (found[d] ? `${d}: ${found[d]}` : ''))
  if (lines.filter(Boolean).length < 4) return null
  return DAYS.map((d) => `${d}: ${found[d] ?? 'Hours vary'}`)
}

function extractExceptionNotes(body: string): string[] {
  const text = body.replace(/\u202f|\u00a0/g, ' ')
  const notes = new Set<string>()
  const patterns = [
    /closed\s+(?:on\s+)?(?:the\s+)?(?:first|1st|second|2nd|third|3rd|fourth|4th|last)\s+(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)(?:\s+of\s+(?:each|every|the)\s+month)?/gi,
    /hours?\s+may\s+differ[^.!\n]{0,80}/gi,
    /closed\s+on\s+public\s+holidays[^.!\n]{0,40}/gi,
    /closed\s+\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/gi,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    const copy = new RegExp(re.source, re.flags)
    while ((m = copy.exec(text))) {
      const note = m[0].replace(/\s+/g, ' ').trim()
      if (note.length >= 12) notes.add(note[0].toUpperCase() + note.slice(1))
    }
  }
  return [...notes].slice(0, 4)
}

function isAlwaysOpen(lines: string[]) {
  return lines.length > 0 && lines.every((l) => /open 24/i.test(l))
}

async function dismissConsent(page: Page) {
  const consent = page.locator(
    'button:has-text("Accept all"), button:has-text("I agree"), button:has-text("Accept")',
  )
  if (await consent.first().isVisible({ timeout: 1200 }).catch(() => false)) {
    await consent.first().click().catch(() => {})
    await sleep(800)
  }
}

async function googleHoursFor(page: Page, job: Job): Promise<Row | null> {
  const pin = job.lat != null && job.lng != null ? `/@${job.lat},${job.lng},16z` : ''
  const url = `https://www.google.com/maps/search/${encodeURIComponent(job.query)}${pin}?hl=en`
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await dismissConsent(page)
  await page.waitForTimeout(1800)

  const result = page.locator('a[href*="/maps/place/"]').first()
  if (await result.isVisible({ timeout: 2000 }).catch(() => false)) {
    const listing = await page.locator('h1, div[role="article"]').first().innerText().catch(() => '')
    if (listing && !namesAlign(job.name, listing.split('\n')[0] ?? listing)) {
      await result.click().catch(() => {})
      await page.waitForTimeout(1400)
    }
  }

  const hoursHint = page.locator('text=/Opens |Closed ·|Open ·|Open 24 hours|Closed$/').first()
  if (await hoursHint.isVisible({ timeout: 2500 }).catch(() => false)) {
    await hoursHint.click().catch(() => {})
    await page.waitForTimeout(900)
  }

  const info = await page.evaluate(() => {
    const title = (document.title || '').replace(/\s*[-–].*Google Maps.*$/i, '').trim()
    const heading = document.querySelector('h1')?.textContent?.trim() || title
    return { heading, body: document.body.innerText || '' }
  })

  if (!namesAlign(job.name, info.heading) && !namesAlign(job.city, info.heading)) {
    const toks = significantTokens(job.name)
    const got = normalizeName(info.heading)
    const hits = toks.filter((t) => got.includes(t)).length
    if (hits < 1) return null
  }

  const weekdayDescriptions = parseMapsHours(info.body)
  if (!weekdayDescriptions) return null
  const exceptionNotes = extractExceptionNotes(info.body)
  return {
    source: 'google',
    displayName: info.heading,
    weekdayDescriptions,
    alwaysOpen: isAlwaysOpen(weekdayDescriptions),
    fetchedAt: new Date().toISOString().slice(0, 10),
    ...(exceptionNotes.length ? { exceptionNotes } : {}),
  }
}

function loadExisting(): Record<string, Row> {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8')) as Record<string, Row>
  } catch {
    return {}
  }
}

function jobsFromCatalog(existing: Record<string, Row>): Job[] {
  const jobs: Job[] = []
  for (const e of EXPERIENCES) {
    if (!FORCE && existing[e.id]?.weekdayDescriptions?.length) continue
    const pin = PIN_BY_SOURCE_ID[e.id]
    jobs.push({
      sourceId: e.id,
      name: e.name,
      city: e.city,
      query: `${e.name} ${e.city} Vietnam`,
      lat: pin?.lat,
      lng: pin?.lng,
    })
  }
  for (const a of CITY_ACTIVITIES) {
    if (!FORCE && existing[a.id]?.weekdayDescriptions?.length) continue
    const pin = PIN_BY_SOURCE_ID[a.id]
    jobs.push({
      sourceId: a.id,
      name: a.name,
      city: a.cityName,
      query: `${a.name} ${a.cityName} Vietnam`,
      lat: pin?.lat,
      lng: pin?.lng,
    })
  }
  return jobs.slice(0, Number.isFinite(LIMIT) ? LIMIT : jobs.length)
}

function writeOut(data: Record<string, Row>) {
  const ordered = Object.fromEntries(
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b)),
  )
  fs.writeFileSync(OUT, `${JSON.stringify(ordered, null, 2)}\n`)
}

const existing = loadExisting()
const jobs = jobsFromCatalog(existing)
console.log(`Places to fetch: ${jobs.length} (already have ${Object.keys(existing).length})`)

const browser = await chromium.launch({ headless: true })
let done = 0
let hits = 0
let misses = 0

async function worker(slice: Job[]) {
  const page = await browser.newPage({
    locale: 'en-US',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  })
  for (const job of slice) {
    try {
      const row = await googleHoursFor(page, job)
      if (row) {
        existing[job.sourceId] = row
        hits += 1
        console.log(`ok  ${job.sourceId}  ${row.weekdayDescriptions[1] ?? row.weekdayDescriptions[0]}`)
      } else {
        misses += 1
        console.log(`miss ${job.sourceId}`)
      }
    } catch (err) {
      misses += 1
      console.log(`err  ${job.sourceId}  ${(err as Error).message}`)
    }
    done += 1
    if (done % 5 === 0) writeOut(existing)
    await sleep(700 + Math.floor(Math.random() * 500))
  }
  await page.close()
}

const buckets: Job[][] = Array.from({ length: WORKERS }, () => [])
jobs.forEach((job, i) => buckets[i % WORKERS].push(job))
await Promise.all(buckets.map((slice) => worker(slice)))
writeOut(existing)
await browser.close()
console.log(`Done. google=${hits} miss=${misses} stored=${Object.keys(existing).length}`)
