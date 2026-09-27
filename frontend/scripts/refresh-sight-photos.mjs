/**
 * Pull the canonical / best-known photo for each sight:
 * Wikidata P18 (official image), Wikipedia lead, then matching Commons files.
 * Run: node scripts/refresh-sight-photos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data')
const OUT_JSON = path.join(DATA_DIR, 'experienceMedia.json')
const OUT_TS = path.join(DATA_DIR, 'experienceMedia.ts')
const UA = 'VietnamPlannerPhotoBot/2.0 (travel planner; wikidata+commons research)'
const WANT = 8
const BAD =
  /logo|flag|map|icon|svg|coat of arms|location map|diagram|signature|stamp|qr |selfie|screenshot|poster|floor plan/i

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function fold(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokens(name) {
  const stop = new Set(['the', 'and', 'of', 'a', 'an', 'in', 'at', 'to', 'for'])
  return fold(name)
    .split(' ')
    .filter((w) => w.length > 2 && !stop.has(w))
}

function cleanPhotoUrl(url) {
  if (!url) return ''
  let u = String(url).split('?')[0]
  if (/\/0px-/i.test(u)) return ''
  u = u.replace(/\/(\d{1,3})px-/g, '/1280px-')
  return u
}

function fileUrl(file, width = 1280) {
  const name = String(file).replace(/^File:/i, '').replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${width}`
}

function scoreTitle(title, exp) {
  const t = fold(title)
  if (BAD.test(t)) return -50
  const toks = tokens(exp.name)
  let s = 0
  for (const tok of toks) if (t.includes(tok)) s += tok.length >= 5 ? 4 : 2
  if (t.includes(fold(exp.city))) s += 1
  if (t.includes('vietnam') || t.includes('viet nam')) s += 0.5
  const needed = toks.length <= 2 ? toks.length : Math.ceil(toks.length * 0.6)
  if (toks.filter((tok) => t.includes(tok)).length < needed) s -= 6
  return s
}

async function wiki(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  return res.json()
}

async function wikidataHits(query) {
  const json = await wiki(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&limit=5&format=json&origin=*`,
  )
  return json?.search ?? []
}

async function wikidataEntity(id) {
  const json = await wiki(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims|sitelinks&format=json&origin=*`,
  )
  return json?.entities?.[id] ?? null
}

function claimFiles(entity, prop) {
  const claims = entity?.claims?.[prop] ?? []
  return claims
    .map((c) => c?.mainsnak?.datavalue?.value)
    .filter((v) => typeof v === 'string' && v.length > 4)
}

async function wikipediaLead(title) {
  const json = await wiki(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  )
  const original = json?.originalimage?.source
  const thumb = json?.thumbnail?.source
  const out = []
  if (original) out.push({ url: original.split('?')[0], title: json.title ?? title, bonus: 40 })
  if (thumb && thumb !== original) out.push({ url: thumb.split('?')[0], title: json.title ?? title, bonus: 20 })
  return out
}

async function commonsSearch(query, limit = 20) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1280',
    format: 'json',
    origin: '*',
  })
  const json = await wiki(`https://commons.wikimedia.org/w/api.php?${params}`)
  const out = []
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    if (!info?.thumburl) continue
    if (info.mime?.startsWith('video/') || info.mime === 'image/svg+xml') continue
    if (BAD.test(page.title ?? '')) continue
    out.push({
      url: String(info.thumburl).split('?')[0],
      title: page.title ?? '',
      size: info.size ?? 0,
      bonus: 0,
    })
  }
  return out
}

function parseExperiences() {
  const files = [
    'experiences.ts',
    'experiencesExtra.ts',
    'experiencesHoiAn.ts',
    'experiencesNinhBinh.ts',
    'experiencesDaLat.ts',
    'experiencesHue.ts',
    'experiencesSapa.ts',
    'experiencesPhuQuoc.ts',
    'experiencesHaLong.ts',
    'experiencesPhongNha.ts',
    'experiencesNhaTrang.ts',
    'experiencesCanTho.ts',
    'experiencesHaGiang.ts',
    'experiencesCatBa.ts',
    'experiencesDongVan.ts',
  ]
  const list = []
  for (const file of files) {
    const text = fs.readFileSync(path.join(DATA_DIR, file), 'utf8')
    const cityConst = text.match(/city: '([^']+)' as const/)
    const regionConst = text.match(/region: '([^']+)' as const/)
    const re =
      /id: '([^']+)',\s*\n\s*name: '([^']+)',(?:\s*\n\s*region: '([^']+)',\s*\n\s*city: '([^']+)')?/g
    let m
    while ((m = re.exec(text))) {
      list.push({
        id: m[1],
        name: m[2],
        region: m[3] ?? regionConst?.[1] ?? cityConst?.[1] ?? '',
        city: m[4] ?? cityConst?.[1] ?? m[3] ?? '',
      })
    }
  }
  return list
}

function writeTs(media) {
  const body = `/** Auto-generated by scripts/fetch-experience-media.mjs — do not edit by hand. */
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
  fs.writeFileSync(OUT_TS, body, 'utf8')
}

async function photosFor(exp) {
  const pool = []
  const queries = [`${exp.name} ${exp.city}`, `${exp.name} Vietnam`, exp.name]
  let entity = null
  for (const q of queries) {
    const hits = await wikidataHits(q)
    await sleep(120)
    const hit = hits.find((h) => /vietnam|viet nam|hanoi|saigon|hue|hoi an|da nang|sapa|ha long|ninh binh/i.test(`${h.description ?? ''} ${h.label ?? ''}`)) ?? hits[0]
    if (!hit?.id) continue
    entity = await wikidataEntity(hit.id)
    await sleep(120)
    if (entity) break
  }

  for (const file of claimFiles(entity, 'P18')) {
    pool.push({ url: fileUrl(file), title: file, bonus: 80 })
  }

  const enwiki = entity?.sitelinks?.enwiki?.title
  if (enwiki) {
    pool.push(...(await wikipediaLead(enwiki)))
    await sleep(80)
  } else {
    pool.push(...(await wikipediaLead(`${exp.name} (${exp.city})`).catch(() => [])))
    pool.push(...(await wikipediaLead(exp.name)))
    await sleep(80)
  }

  const cat = claimFiles(entity, 'P373')[0]
  if (cat) {
    const catHits = await commonsSearch(`incategory:"${cat}"`, 24)
    pool.push(...catHits.map((h) => ({ ...h, bonus: h.bonus + 8 })))
    await sleep(150)
  }

  for (const q of [`"${exp.name}" ${exp.city}`, `${exp.name} ${exp.city} Vietnam`]) {
    const hits = await commonsSearch(q, 24)
    pool.push(...hits)
    await sleep(150)
  }

  const scored = []
  const seen = new Set()
  for (const item of pool) {
    const url = cleanPhotoUrl(item.url)
    if (!url || seen.has(url)) continue
    const s = scoreTitle(item.title, exp) + (item.bonus ?? 0)
    if (s < 1 && (item.bonus ?? 0) < 20) continue
    seen.add(url)
    scored.push({ ...item, score: s })
  }
  scored.sort((a, b) => b.score - a.score || (b.size ?? 0) - (a.size ?? 0))
  return scored.map((s) => s.url).slice(0, WANT)
}

async function main() {
  const catalog = parseExperiences()
  const media = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : catalog.length
  const slice = catalog.slice(0, limit)
  let updated = 0

  for (let i = 0; i < slice.length; i++) {
    const exp = slice[i]
    process.stdout.write(`[${i + 1}/${slice.length}] ${exp.id} … `)
    try {
      const photos = await photosFor(exp)
      const prev = media[exp.id] ?? { photos: [], videos: [] }
      const merged = []
      const seen = new Set()
      for (const url of [...photos, ...(prev.photos ?? [])]) {
        const clean = cleanPhotoUrl(url)
        if (!clean || seen.has(clean)) continue
        seen.add(clean)
        merged.push(clean)
        if (merged.length >= WANT) break
      }
      if (merged.length) {
        media[exp.id] = { photos: merged, videos: prev.videos ?? [] }
        updated += 1
        console.log((photos[0] ?? merged[0]).slice(-70))
      } else {
        console.log('NO PHOTO')
      }
    } catch (err) {
      console.log('error', err?.message ?? err)
    }
    if (i % 20 === 0) fs.writeFileSync(OUT_JSON, JSON.stringify(media, null, 2), 'utf8')
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(media, null, 2), 'utf8')
  writeTs(media)
  console.log(`Done. updated=${updated}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
