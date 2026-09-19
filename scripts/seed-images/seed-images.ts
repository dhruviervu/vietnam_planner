/**
 * Seed 5 place-matching photos per Vietnamese sight.
 *
 * Wikipedia / Wikimedia Commons only — no random stock filler.
 * Unsplash Source (source.unsplash.com) is shut down and returned random
 * photos; this script never uses it. Optional Unsplash Search needs
 * UNSPLASH_ACCESS_KEY and still filters by sight + destination tokens.
 *
 * Usage (from this folder):
 *   npm install
 *   copy .env.example to .env and fill Cloudinary keys
 *   npx tsx seed-images.ts
 *
 * Flags:
 *   --dry-run          fetch + score, skip Cloudinary
 *   --limit N          process first N sights
 *   --force            re-fetch sights that already have 5 Cloudinary URLs
 *   --from ID          skip until this sight id
 *   --only id,id       process only these sight ids
 *
 * Env:
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 *   UNSPLASH_ACCESS_KEY   optional matching search fallback
 *   LIMIT                 same as --limit
 */
import axios, { type AxiosInstance } from 'axios'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import aliasesJson from './place-aliases.json' with { type: 'json' }
import sightsJson from './sights_input.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname
const INPUT_PATH = path.join(ROOT, 'sights_input.json')
const OUTPUT_PATH = path.join(ROOT, 'sights_with_images.json')
const APP_DATA = path.resolve(ROOT, '../../frontend/src/pages/PlanBuilder/data')
const APP_MEDIA_JSON = path.join(APP_DATA, 'experienceMedia.json')
const APP_MEDIA_TS = path.join(APP_DATA, 'experienceMedia.ts')
const TARGET_PHOTOS = 5
const WIKI_DELAY_MS = 200
const USER_AGENT =
  'VietnamPlannerSightSeeder/1.0 (travel planner; Wikimedia image research)'

const PLACE_ALIASES = aliasesJson as Record<string, string[]>

type SightInput = {
  id: string
  name: string
  destination: string
}

type WikiImage = {
  url: string
  title: string
  size: number
  source: 'wikipedia-en' | 'wikipedia-vi' | 'commons' | 'openverse' | 'unsplash'
  score: number
}

type SightOutput = SightInput & {
  imageUrls: string[]
  sources: string[]
  wikipediaQueries: string[]
  matchedCount: number
  shortfall: number
}

const STOP = new Set([
  'the',
  'and',
  'of',
  'a',
  'an',
  'in',
  'at',
  'for',
  'to',
  'with',
  'from',
  'day',
  'walk',
  'evening',
  'morning',
  'afternoon',
  'class',
  'tour',
  'viewpoint',
  'peak',
  'hidden',
  'near',
])

const JUNK =
  /logo|flag|map of|location map|icon|svg|coat of arms|diagram|signature|stamp|qr code|wikimedia|commons-logo|edit-clear|question book|padlock|ambox|disambig|crystal_clear|nuvola|gnome-|tango|placeholder|pictogram|symbol of|coat_of_arms/i

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!fs.existsSync(envPath)) return
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/\p{M}+/gu, '')
}

function placeName(sight: SightInput) {
  return sight.name.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
}

function parentheticalNames(sight: SightInput) {
  return [...sight.name.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim()).filter(Boolean)
}

function tokens(sight: SightInput) {
  const raw = `${placeName(sight)} ${parentheticalNames(sight).join(' ')}`
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\sàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function aliases(sight: SightInput) {
  const extra = PLACE_ALIASES[sight.id] ?? []
  return [...new Set([placeName(sight), ...parentheticalNames(sight), ...extra].filter(Boolean))]
}

function searchQueries(sight: SightInput) {
  const dest = sight.destination
  const names = aliases(sight)
  const queries = [
    `${sight.name} ${dest}`,
    ...names.map((n) => `${n} ${dest}`),
    ...names.map((n) => `${n} Vietnam`),
    ...names,
  ]
  return [...new Set(queries.map((q) => q.replace(/\s+/g, ' ').trim()).filter(Boolean))]
}

function isUtilityFile(title: string, mime?: string) {
  const t = title.toLowerCase()
  if (mime === 'image/svg+xml' || t.endsWith('.svg')) return true
  if (mime?.startsWith('video/')) return true
  if (JUNK.test(t)) return true
  return false
}

function photoScore(title: string, sight: SightInput) {
  const t = `${title}`.toLowerCase()
  if (isUtilityFile(title)) return -100
  const toks = tokens(sight)
  let score = 0
  for (const tok of toks) {
    if (t.includes(tok.toLowerCase())) score += 4
    const ascii = stripDiacritics(tok).toLowerCase()
    if (ascii.length > 2 && t.includes(ascii)) score += 2
  }
  for (const alias of aliases(sight)) {
    const parts = alias
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
    if (parts.length && parts.every((p) => t.includes(p) || t.includes(stripDiacritics(p).toLowerCase()))) {
      score += 8
    }
  }
  const dest = sight.destination.toLowerCase()
  if (dest && t.includes(dest)) score += 2
  if (t.includes('vietnam') || t.includes('viet nam') || t.includes('việt nam')) score += 1
  return score
}

function cleanUrl(url: string) {
  return url.split('?')[0]
}

function wikiClient(origin: string): AxiosInstance {
  return axios.create({
    baseURL: origin,
    timeout: 25000,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  })
}

const enWiki = wikiClient('https://en.wikipedia.org')
const viWiki = wikiClient('https://vi.wikipedia.org')
const commons = wikiClient('https://commons.wikimedia.org')

async function wikiGet(client: AxiosInstance, params: Record<string, string>) {
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await client.get('/w/api.php', {
        params: { format: 'json', origin: '*', maxlag: '5', ...params },
      })
      return data
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const retryable = status === 429 || status === 503 || status === 502 || !status
      if (!retryable || attempt === maxAttempts) throw err
      const retryAfter = axios.isAxiosError(err)
        ? Number(err.response?.headers?.['retry-after'])
        : 0
      const wait = Math.max(retryAfter * 1000, WIKI_DELAY_MS * 2 ** attempt)
      console.warn(`    Wikimedia ${status ?? 'network'} — retry ${attempt}/${maxAttempts} in ${wait}ms`)
      await sleep(wait)
    }
  }
  return null
}

function collectImageinfo(
  json: { query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{ url?: string; thumburl?: string; mime?: string; size?: number }> }> } } | null,
  source: WikiImage['source'],
  sight: SightInput,
): WikiImage[] {
  const out: WikiImage[] = []
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    const title = page.title ?? ''
    const original = info?.url ?? info?.thumburl
    if (!original) continue
    if (isUtilityFile(title, info?.mime)) continue
    if (!info?.mime?.startsWith('image/')) continue
    if ((info.size ?? 0) < 40000) continue
    const score = photoScore(title, sight)
    if (score < 3) continue
    out.push({
      url: cleanUrl(original),
      title,
      size: info.size ?? 0,
      source,
      score,
    })
  }
  return out
}

/**
 * Search Wikipedia, take the best article, then pull full-size page photos
 * (lead image + files used on the page). Filters logos / SVGs / maps.
 */
export async function fetchWikipediaImages(
  searchTerm: string,
  sight: SightInput,
  lang: 'en' | 'vi' = 'en',
): Promise<WikiImage[]> {
  const client = lang === 'vi' ? viWiki : enWiki
  const source: WikiImage['source'] = lang === 'vi' ? 'wikipedia-vi' : 'wikipedia-en'
  const search = await wikiGet(client, {
    action: 'query',
    list: 'search',
    srsearch: searchTerm,
    srlimit: '5',
    srprop: '',
  })
  const hits: Array<{ title: string }> = search?.query?.search ?? []
  if (!hits.length) return []

  const out: WikiImage[] = []
  for (const hit of hits.slice(0, 2)) {
    const pageTitle = hit.title
    const articleScore = photoScore(pageTitle, sight)
    if (articleScore < 1 && !pageTitle.toLowerCase().includes(sight.destination.toLowerCase())) {
      continue
    }

    const thumbs = await wikiGet(client, {
      action: 'query',
      titles: pageTitle,
      prop: 'pageimages|images',
      pithumbsize: '1000',
      piprop: 'thumbnail|name|original',
      imlimit: '50',
    })
    const pages = Object.values(thumbs?.query?.pages ?? {}) as Array<{
      thumbnail?: { source?: string }
      original?: { source?: string }
      images?: Array<{ title: string }>
      pageimage?: string
    }>
    for (const page of pages) {
      const lead = page.original?.source ?? page.thumbnail?.source
      const leadTitle = page.pageimage ? `File:${page.pageimage}` : pageTitle
      if (lead && photoScore(leadTitle, sight) >= 3) {
        out.push({
          url: cleanUrl(lead),
          title: leadTitle,
          size: 200000,
          source,
          score: photoScore(leadTitle, sight) + 2,
        })
      }
    }

    const images = await wikiGet(client, {
      action: 'query',
      titles: pageTitle,
      generator: 'images',
      gimlimit: '30',
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '1600',
    })
    out.push(...collectImageinfo(images, source, sight))
    await sleep(WIKI_DELAY_MS)
  }
  return out
}

async function fetchCommonsImages(query: string, sight: SightInput, limit = 40): Promise<WikiImage[]> {
  const json = await wikiGet(commons, {
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1600',
  })
  return collectImageinfo(json, 'commons', sight)
}

async function fetchOpenverseImages(query: string, sight: SightInput): Promise<WikiImage[]> {
  try {
    const { data } = await axios.get('https://api.openverse.org/v1/images/', {
      timeout: 20000,
      headers: { 'User-Agent': USER_AGENT },
      params: {
        q: query,
        page_size: 20,
        mature: false,
        license_type: 'all',
      },
    })
    const out: WikiImage[] = []
    for (const item of data?.results ?? []) {
      const title = `${item.title ?? ''} ${(item.tags ?? []).map((t: { name?: string }) => t.name).join(' ')}`
      const url = item.url as string | undefined
      if (!url?.startsWith('http')) continue
      if (isUtilityFile(title, item.filetype ? `image/${item.filetype}` : undefined)) continue
      const score = photoScore(`${title} ${query}`, sight)
      if (score < 4) continue
      out.push({
        url: cleanUrl(url),
        title,
        size: Number(item.filesize) || 100000,
        source: 'openverse',
        score,
      })
    }
    return out
  } catch {
    return []
  }
}

async function fetchUnsplashSearch(query: string, sight: SightInput): Promise<WikiImage[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return []
  try {
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      timeout: 20000,
      headers: { 'Accept-Version': 'v1' },
      params: { query, per_page: 10, orientation: 'landscape', client_id: key },
    })
    const out: WikiImage[] = []
    for (const item of data?.results ?? []) {
      const title = `${item.description ?? ''} ${item.alt_description ?? ''} ${(item.tags ?? []).map((t: { title?: string }) => t.title).join(' ')}`
      const url = item.urls?.regular as string | undefined
      if (!url) continue
      const score = photoScore(title, sight)
      if (score < 4) continue
      out.push({
        url,
        title,
        size: 200000,
        source: 'unsplash',
        score,
      })
    }
    return out
  } catch {
    return []
  }
}

function dedupeImages(images: WikiImage[]) {
  const seen = new Set<string>()
  const out: WikiImage[] = []
  for (const img of images.sort((a, b) => b.score - a.score || b.size - a.size)) {
    const key = cleanUrl(img.url)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...img, url: key })
  }
  return out
}

async function safeImages(label: string, fn: () => Promise<WikiImage[]>): Promise<WikiImage[]> {
  try {
    return await fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn(`    ${label} skipped: ${message}`)
    return []
  }
}

export async function collectSightImages(sight: SightInput): Promise<WikiImage[]> {
  const queries = searchQueries(sight)
  let pool: WikiImage[] = []

  const primary = `${placeName(sight)} ${sight.destination}`
  pool.push(...(await safeImages('wikipedia-en', () => fetchWikipediaImages(primary, sight, 'en'))))
  await sleep(WIKI_DELAY_MS)

  if (dedupeImages(pool).length < TARGET_PHOTOS) {
    pool.push(...(await safeImages('commons', () => fetchCommonsImages(primary, sight))))
    await sleep(WIKI_DELAY_MS)
  }

  if (dedupeImages(pool).length < TARGET_PHOTOS) {
    pool.push(...(await safeImages('wikipedia-vi', () => fetchWikipediaImages(primary, sight, 'vi'))))
    await sleep(WIKI_DELAY_MS)
  }

  if (dedupeImages(pool).length < TARGET_PHOTOS) {
    for (const q of queries.slice(0, 4)) {
      if (q === primary) continue
      pool.push(...(await safeImages('wikipedia-en', () => fetchWikipediaImages(q, sight, 'en'))))
      await sleep(WIKI_DELAY_MS)
      pool.push(...(await safeImages('commons', () => fetchCommonsImages(q, sight, 30))))
      await sleep(WIKI_DELAY_MS)
      if (dedupeImages(pool).length >= TARGET_PHOTOS + 4) break
    }
  }

  if (dedupeImages(pool).length < TARGET_PHOTOS) {
    for (const q of queries.slice(0, 3)) {
      pool.push(...(await safeImages('openverse', () => fetchOpenverseImages(q, sight))))
      await sleep(WIKI_DELAY_MS)
      if (dedupeImages(pool).length >= TARGET_PHOTOS) break
    }
  }

  if (dedupeImages(pool).length < TARGET_PHOTOS) {
    pool.push(...(await safeImages('unsplash', () => fetchUnsplashSearch(primary, sight))))
  }

  return dedupeImages(pool).slice(0, TARGET_PHOTOS)
}

function folderFor(destination: string) {
  return `vietnam_sights/${destination.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '')}`
}

async function uploadToCloudinary(sight: SightInput, images: WikiImage[], dryRun: boolean) {
  if (dryRun) return images.map((img) => img.url)
  const urls: string[] = []
  for (const [index, img] of images.entries()) {
    try {
      const uploaded = await cloudinary.uploader.upload(img.url, {
        folder: folderFor(sight.destination),
        public_id: `${sight.id}_photo_${index}`,
        overwrite: true,
        resource_type: 'image',
        quality: 'auto:good',
        fetch_format: 'auto',
      })
      urls.push(uploaded.secure_url)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`    upload failed for ${img.title}: ${message}`)
    }
    await sleep(150)
  }
  return urls
}

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      'Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (see .env.example).',
    )
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
}

function loadExisting(): Record<string, SightOutput> {
  if (!fs.existsSync(OUTPUT_PATH)) return {}
  try {
    const parsed = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8')) as SightOutput[]
    return Object.fromEntries(parsed.map((s) => [s.id, s]))
  } catch {
    return {}
  }
}

function writeOutput(rows: SightOutput[]) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(rows, null, 2) + '\n', 'utf8')
}

type AppMedia = {
  photos: string[]
  videos: Array<{ youtubeId: string; title?: string }>
}

function loadAppMedia(): Record<string, AppMedia> {
  if (!fs.existsSync(APP_MEDIA_JSON)) return {}
  try {
    return JSON.parse(fs.readFileSync(APP_MEDIA_JSON, 'utf8')) as Record<string, AppMedia>
  } catch {
    return {}
  }
}

function writeAppMedia(media: Record<string, AppMedia>, writeTs = true) {
  fs.writeFileSync(APP_MEDIA_JSON, JSON.stringify(media, null, 2) + '\n', 'utf8')
  if (!writeTs) return
  const body = `/** Auto-generated by scripts/seed-images/seed-images.ts — do not edit by hand. */
export type ExperienceVideo = {
  youtubeId: string
  title?: string
}

export type ExperienceMedia = {
  photos: string[]
  videos: ExperienceVideo[]
}

export const EXPERIENCE_MEDIA: Record<string, ExperienceMedia> = ${JSON.stringify(media, null, 2)}

export function getExperienceMedia(id: string): ExperienceMedia | null {
  return EXPERIENCE_MEDIA[id] ?? null
}
`
  fs.writeFileSync(APP_MEDIA_TS, body, 'utf8')
}

function writeMerged(existing: Record<string, SightOutput>, updates: Map<string, SightOutput>) {
  const merged: Record<string, SightOutput> = { ...existing }
  for (const [id, row] of updates) merged[id] = row
  const catalog = sightsJson as SightInput[]
  const ordered = catalog.map((s) => merged[s.id]).filter((row): row is SightOutput => Boolean(row))
  for (const row of Object.values(merged)) {
    if (!ordered.some((s) => s.id === row.id)) ordered.push(row)
  }
  writeOutput(ordered)
}

async function main() {
  loadDotEnv()
  const dryRun = hasFlag('--dry-run')
  const force = hasFlag('--force')
  const fromId = argValue('--from')
  const only = (argValue('--only') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const limit = Number(argValue('--limit') ?? process.env.LIMIT ?? 0) || 0
  const allSights = sightsJson as SightInput[]
  const filtered = only.length ? allSights.filter((s) => only.includes(s.id)) : allSights
  const sights = filtered.slice(0, limit || undefined)

  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Missing ${INPUT_PATH}`)
  }
  if (!dryRun) configureCloudinary()

  const existing = loadExisting()
  const appMedia = loadAppMedia()
  const byId = new Map<string, SightOutput>()

  let started = !fromId
  let processed = 0
  const total = sights.length
  console.log(
    `${dryRun ? 'Dry-run' : 'Seeding'} ${total} sights → ${TARGET_PHOTOS} matching photos each (Wikipedia / Commons).`,
  )
  console.log(`Writing catalog photos to ${APP_MEDIA_TS}`)

  for (const [i, sight] of sights.entries()) {
    if (!started) {
      if (sight.id === fromId) started = true
      else continue
    }
    const inApp = appMedia[sight.id]?.photos.length ?? 0
    if (!force && inApp >= TARGET_PHOTOS) {
      console.log(`[${i + 1}/${total}] skip ${sight.name} (catalog already ${inApp} images)`)
      continue
    }

    try {
      const found = await collectSightImages(sight)
      const uploaded = await uploadToCloudinary(sight, found, dryRun)
      const row: SightOutput = {
        ...sight,
        imageUrls: uploaded,
        sources: found.map((img) => img.source),
        wikipediaQueries: searchQueries(sight).slice(0, 4),
        matchedCount: uploaded.length,
        shortfall: Math.max(0, TARGET_PHOTOS - uploaded.length),
      }
      byId.set(sight.id, row)
      existing[sight.id] = row
      writeMerged(existing, byId)
      if (uploaded.length) {
        const prev = appMedia[sight.id]
        appMedia[sight.id] = {
          photos: uploaded,
          videos: prev?.videos ?? [],
        }
        writeAppMedia(appMedia, processed % 12 === 0)
      }

      const verb = dryRun ? 'matched' : 'uploaded'
      const status =
        row.shortfall === 0
          ? `${uploaded.length} images ${verb}`
          : `${uploaded.length} matching images (short ${row.shortfall} — not padded with random photos)`
      console.log(`[${i + 1}/${total}] Processed ${sight.name} -> ${status}`)
      if (dryRun) {
        for (const img of found) {
          console.log(`    [${img.score}] ${img.source} ${img.title}`)
        }
      }
      processed += 1
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[${i + 1}/${total}] FAILED ${sight.name}: ${message}`)
      writeMerged(existing, byId)
    }

    await sleep(WIKI_DELAY_MS)
  }

  writeMerged(existing, byId)
  writeAppMedia(appMedia)
  const short = Object.values(existing).filter((s) => s.shortfall > 0)
  console.log(`Done. Wrote ${OUTPUT_PATH} and ${APP_MEDIA_TS}`)
  console.log(`Processed this run: ${processed}. Shortfalls (matching photos < 5): ${short.length}`)
  if (short.length) {
    console.log('Sights still short:')
    for (const s of short.slice(0, 30)) {
      console.log(`  - ${s.id} (${s.name}): ${s.matchedCount}/5`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
