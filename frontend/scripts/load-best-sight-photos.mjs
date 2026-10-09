/**
 * City-batch sight photos: Commons/Wikidata candidates, title gate, Gemini vision check.
 *
 *   node scripts/load-best-sight-photos.mjs --city=Hanoi
 *   node scripts/load-best-sight-photos.mjs --high-roi
 *   node scripts/load-best-sight-photos.mjs --city=Hanoi --force
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data')
const OUT_JSON = path.join(DATA, 'experienceMedia.json')
const OUT_TS = path.join(DATA, 'experienceMedia.ts')
const INDEX_JSON = path.join(DATA, 'googlePlaceIndex.json')
const REPORT = path.join(ROOT, 'audit', 'reports', 'sight-photo-load.json')
const UA = 'VietnamPlannerPhotoBot/3.0 (travel planner; verified place photos)'
const WANT = 10
const EXTRA_QUERIES = {
  'old-quarter': [
    'Hang Ma street Hanoi',
    'Ta Hien Old Quarter Hanoi',
    'Hang Bac street Hanoi',
    'Hanoi tube house Old Quarter',
    'Hanoi Old Quarter night street',
    'Hang Gai Hanoi',
    'Old Quarter balcony Hanoi',
  ],
  'bia-hoi': ['bia hoi Hanoi Ta Hien', 'bia hoi corner Hanoi', 'Hanoi beer plastic stool'],
  'west-lake': ['West Lake Hanoi Tay Ho', 'West Lake Hanoi sunset', 'Thanh Nien road Hanoi lake'],
  'hanoi-weekend-night-market': [
    'Hanoi weekend night market Hang Dao',
    'Dong Xuan night market Hanoi',
    'Hang Dao night market Hanoi',
  ],
  'phu-tay-ho': ['Phu Tay Ho temple Hanoi', 'Tay Ho pagoda Hanoi'],
  'long-bien-bridge': ['Long Bien Bridge Hanoi', 'Long Bien Bridge walkway Hanoi', 'Long Bien Bridge sunset'],
  'hcm-stilt-house': ['Ho Chi Minh stilt house Hanoi', 'Uncle Ho wooden house Hanoi'],
  'bat-trang-pottery': ['Bat Trang pottery village kiln', 'Bat Trang ceramic Hanoi'],
  'perfume-pagoda': ['Perfume Pagoda Huong Tich', 'Perfume Pagoda boat Hanoi', 'Huong Tich cave shrine'],
}
const BAD =
  /logo|flag|map of|location map|icon|svg|coat of arms|diagram|signature|stamp|qr |selfie|screenshot|poster|floor plan|pictogram|infographic|signboard|coin|banknote|passport|wikipe?dia/i
const ELSEWHERE =
  /\b(iraq|baghdad|china|guangzhou|dingzhou|thailand|bangkok|cambodia|angkor|laos|vientiane|france|paris|india|japan|korea|seoul|myanmar|philippines|indonesia|malaysia|singapore|clinton|arkansas)\b/i

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    const fp = path.join(ROOT, name)
    if (!fs.existsSync(fp)) continue
    for (const raw of fs.readFileSync(fp, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!(key in process.env)) process.env[key] = value
    }
  }
}

function argValue(flag) {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`))
  if (hit) return hit.slice(flag.length + 1)
  const i = process.argv.indexOf(flag)
  return i === -1 ? undefined : process.argv[i + 1]
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

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
  const stop = new Set(['the', 'and', 'of', 'a', 'an', 'in', 'at', 'to', 'for', 'walk', 'tour', 'day'])
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

function fileNameFromUrl(url) {
  try {
    const u = decodeURIComponent(String(url).split('?')[0])
    const filePath = u.match(/Special:FilePath\/(.+)$/i)
    if (filePath) return filePath[1].replace(/\/$/, '')
    const thumb = u.match(/\/\d+px-(.+)$/)
    if (thumb) return thumb[1]
    const base = u.split('/').pop() || ''
    return base.replace(/^\d+px-/, '')
  } catch {
    return ''
  }
}

function fileKey(url) {
  return fold(fileNameFromUrl(url)).replace(/[^a-z0-9]+/g, '').slice(0, 80)
}

function displayUrl(file) {
  const name = String(file).replace(/^File:/i, '').replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1280`
}

function scoreTitle(title, exp, url = '') {
  const t = fold(`${title} ${fileNameFromUrl(url)}`)
  if (BAD.test(t)) return -80
  if (ELSEWHERE.test(t)) return -80
  const toks = tokens(exp.name)
  let s = 0
  let hits = 0
  for (const tok of toks) {
    if (t.includes(tok)) {
      hits += 1
      s += tok.length >= 5 ? 5 : 3
    }
  }
  const city = fold(exp.city)
  const inCity = city && t.includes(city)
  const inVn = t.includes('vietnam') || t.includes('viet nam') || t.includes('hanoi') || t.includes('ha noi')
  if (inCity) s += 3
  if (inVn) s += 2
  if (!inCity && !inVn && hits < 2) s -= 18
  const needed = toks.length <= 2 ? toks.length : Math.ceil(toks.length * 0.55)
  if (hits < needed) s -= 10
  if (hits === toks.length && toks.length) s += 6
  return s
}

async function wiki(url) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) return res.json()
    if (res.status === 429 || res.status === 503 || res.status === 502) {
      await sleep(400 * 2 ** attempt)
      continue
    }
    return null
  }
  return null
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
  return (entity?.claims?.[prop] ?? [])
    .map((c) => c?.mainsnak?.datavalue?.value)
    .filter((v) => typeof v === 'string' && v.length > 4)
}

async function wikipediaLead(title) {
  const json = await wiki(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
  const original = json?.originalimage?.source
  const out = []
  if (original) out.push({ url: original.split('?')[0], title: json.title ?? title, bonus: 36, size: 400000 })
  return out
}

function collectImageinfo(json, bonus) {
  const out = []
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    if (!info?.thumburl && !info?.url) continue
    if (info.mime?.startsWith('video/') || info.mime === 'image/svg+xml') continue
    if (BAD.test(page.title ?? '')) continue
    if ((info.size ?? 0) < 35000) continue
    const file = String(page.title ?? '').replace(/^File:/i, '')
    out.push({
      url: file ? displayUrl(file) : String(info.url || info.thumburl).split('?')[0],
      title: page.title ?? '',
      size: info.size ?? 0,
      bonus,
    })
  }
  return out
}

async function commonsSearch(query, limit = 24) {
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
  return collectImageinfo(json, 0)
}

async function commonsGeo(lat, lng, radius = 280) {
  if (lat == null || lng == null) return []
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${lat}|${lng}`,
    ggsradius: String(radius),
    ggsnamespace: '6',
    ggslimit: '24',
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1280',
    format: 'json',
    origin: '*',
  })
  const json = await wiki(`https://commons.wikimedia.org/w/api.php?${params}`)
  return collectImageinfo(json, 10)
}

function parseExperiences() {
  const files = fs.readdirSync(DATA).filter((f) => /^experiences.*\.ts$/.test(f) && !f.includes('.test'))
  const list = []
  for (const file of files) {
    const text = fs.readFileSync(path.join(DATA, file), 'utf8')
    const cityConst = text.match(/city: '([^']+)' as const/)
    const regionConst = text.match(/region: '([^']+)' as const/)
    const re =
      /id: '([^']+)',\s*\n\s*name: '([^']+)',(?:\s*\n\s*region: '([^']+)',\s*\n\s*city: '([^']+)')?/g
    let m
    while ((m = re.exec(text))) {
      list.push({
        id: m[1],
        name: m[2],
        city: m[4] ?? cityConst?.[1] ?? m[3] ?? regionConst?.[1] ?? '',
      })
    }
  }
  const seen = new Set()
  return list.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
}

function writeTs(media) {
  const body = `/** Auto-generated by scripts/load-best-sight-photos.mjs — do not edit by hand. */
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

async function candidatesFor(exp, pin) {
  const pool = []
  const queries = [`${exp.name} ${exp.city}`, `${exp.name} Vietnam`, exp.name]
  let entity = null
  for (const q of queries) {
    const hits = await wikidataHits(q)
    await sleep(110)
    const hit =
      hits.find((h) =>
        /vietnam|viet nam|hanoi|saigon|hue|hoi an|da nang|sapa|ha long|ninh binh/i.test(
          `${h.description ?? ''} ${h.label ?? ''}`,
        ),
      ) ?? hits[0]
    if (!hit?.id) continue
    entity = await wikidataEntity(hit.id)
    await sleep(110)
    if (entity) break
  }
  for (const file of claimFiles(entity, 'P18')) {
    pool.push({ url: displayUrl(file), title: file, bonus: 70, size: 500000 })
  }
  const enwiki = entity?.sitelinks?.enwiki?.title
  if (enwiki) {
    pool.push(...(await wikipediaLead(enwiki)))
    await sleep(80)
  }
  const cat = claimFiles(entity, 'P373')[0]
  if (cat) {
    pool.push(...(await commonsSearch(`incategory:"${cat}"`, 28)).map((h) => ({ ...h, bonus: h.bonus + 12 })))
    await sleep(120)
  }
  for (const q of [`"${exp.name}" ${exp.city}`, `${exp.name} ${exp.city} Vietnam`]) {
    pool.push(...(await commonsSearch(q, 32)))
    await sleep(120)
  }
  for (const q of EXTRA_QUERIES[exp.id] ?? []) {
    pool.push(...(await commonsSearch(q, 24)).map((h) => ({ ...h, bonus: h.bonus + 16 })))
    await sleep(120)
  }
  if (pin?.lat != null && pin?.lng != null) {
    pool.push(...(await commonsGeo(pin.lat, pin.lng, 420)))
    await sleep(120)
  }

  const scored = []
  const seen = new Set()
  for (const item of pool) {
    const url = cleanPhotoUrl(item.url)
    if (!url || seen.has(url)) continue
    const s = scoreTitle(item.title, exp, item.url) + (item.bonus ?? 0)
    if (s < 4) continue
    seen.add(url)
    scored.push({ ...item, url, score: s })
  }
  scored.sort((a, b) => b.score - a.score || (b.size ?? 0) - (a.size ?? 0))
  return scored.slice(0, 22)
}

async function fetchThumb(url) {
  const file = fileNameFromUrl(url)
  const thumb = file
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=420`
    : url
  const res = await fetch(thumb, { headers: { 'User-Agent': UA, Accept: 'image/*' }, redirect: 'follow' })
  if (!res.ok) return null
  const mime = res.headers.get('content-type') || ''
  if (!mime.startsWith('image/')) return null
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 4000 || buf.length > 2_500_000) return null
  const resolved = fileNameFromUrl(res.url || url) || file
  const hot = String(res.url || '')
  const live = /upload\.wikimedia\.org|thumb\.wikimedia\.org/.test(hot)
    ? hot.split('?')[0].replace(/\/\d+px-/, '/1280px-')
    : resolved
      ? displayUrl(resolved)
      : url.split('?')[0]
  return {
    mime: mime.split(';')[0],
    b64: buf.toString('base64'),
    displayUrl: live,
  }
}

function geminiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim()
}

async function visionKeep(exp, title, thumb, takenAspects) {
  const key = geminiKey()
  if (!key) return { keep: true, score: 3, reason: 'no-gemini', aspect: 'unknown', skipped: true }
  const covered = takenAspects.length ? takenAspects.join(', ') : 'none yet'
  const prompt = `You pick travel-guide photos for "${exp.name}" in ${exp.city}, Vietnam.
File title: ${title}
Aspects already in the gallery: ${covered}

Be easygoing. This is a travel gallery, not a museum archive.
KEEP if it is a decent photo of this place (or of the activity there) in Vietnam.
REJECT only maps, logos, flags, diagrams, other countries, or an obvious near-copy of a shot we already kept.
A different building face, interior, crowd, night, detail, or street around the sight is enough variety.

JSON: {"keep":true|false,"score":1-5,"aspect":"short-label","reason":"short"}`
  const models = ['gemini-3.5-flash', 'gemini-3.8-flash']
  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inline_data: { mime_type: thumb.mime, data: thumb.b64 } },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 256,
                responseMimeType: 'application/json',
              },
            }),
          },
        )
        if (res.status === 503 || res.status === 429) {
          await sleep(600 * attempt)
          continue
        }
        if (!res.ok) break
        const json = await res.json()
        const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
        const m = text.match(/\{[\s\S]*\}/)
        if (!m) break
        const parsed = JSON.parse(m[0])
        const aspect = fold(parsed.aspect || parsed.reason || 'scene')
        return {
          keep: Boolean(parsed.keep) && Number(parsed.score) >= 3,
          score: Number(parsed.score) || 0,
          aspect,
          reason: String(parsed.reason || ''),
          skipped: false,
        }
      } catch {
        await sleep(400 * attempt)
      }
    }
  }
  return { keep: false, score: 0, aspect: '', reason: 'vision-failed', skipped: false }
}

async function verifyPhotos(exp, candidates, claimed) {
  const kept = []
  const aspects = []
  for (const item of candidates) {
    if (kept.length >= WANT) break
    const key = fileKey(item.url)
    if (key && claimed.has(key)) continue
    const thumb = await fetchThumb(item.url)
    await sleep(80)
    if (!thumb) continue
    const display = thumb.displayUrl || item.url
    const displayKey = fileKey(display)
    if (displayKey && claimed.has(displayKey)) continue
    const verdict = await visionKeep(exp, item.title, thumb, aspects)
    await sleep(280)
    const aspect = fold(verdict.aspect || '')
    const sameAspectCount = aspect ? aspects.filter((a) => a === aspect).length : 0
    if (aspect && sameAspectCount >= 2 && kept.length >= 7) continue
    const accept =
      verdict.keep ||
      (verdict.reason === 'vision-failed' && item.score >= 8) ||
      (item.score >= 14 && kept.length < 7)
    if (accept) {
      kept.push(display)
      if (aspect) aspects.push(aspect)
      if (displayKey) claimed.add(displayKey)
      if (key) claimed.add(key)
    }
  }
  return kept
}

function writeMedia(media) {
  fs.writeFileSync(OUT_JSON, JSON.stringify(media, null, 2) + '\n', 'utf8')
  writeTs(media)
}

async function main() {
  loadDotEnv()
  const cityFilter = argValue('--city')
  const only = (argValue('--only') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const force = hasFlag('--force')
  const highRoiOnly = hasFlag('--high-roi')
  const catalog = parseExperiences()
  const index = fs.existsSync(INDEX_JSON) ? JSON.parse(fs.readFileSync(INDEX_JSON, 'utf8')) : {}
  const media = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
  const report = { ranAt: new Date().toISOString(), city: cityFilter ?? (highRoiOnly ? 'high-roi' : 'all'), sights: [] }

  let sights = catalog
  if (only.length) sights = catalog.filter((e) => only.includes(e.id))
  if (cityFilter) {
    const want = fold(cityFilter)
    sights = catalog.filter((e) => fold(e.city) === want || fold(e.city).includes(want))
  }
  if (highRoiOnly) {
    const byCity = new Map()
    for (const e of sights) {
      const list = byCity.get(e.city) ?? []
      list.push(e)
      byCity.set(e.city, list)
    }
    const keep = new Set()
    for (const list of byCity.values()) {
      for (const e of list.slice(0, 3)) keep.add(e.id)
    }
    sights = catalog.filter((e) => keep.has(e.id) || (cityFilter && sights.some((s) => s.id === e.id)))
    if (cityFilter) sights = catalog.filter((e) => fold(e.city) === fold(cityFilter) || fold(e.city).includes(fold(cityFilter)))
  }

  const grouped = new Map()
  for (const e of sights) {
    const list = grouped.get(e.city) ?? []
    list.push(e)
    grouped.set(e.city, list)
  }

  console.log(`Gemini vision: ${geminiKey() ? 'on' : 'off (title score only)'}`)
  console.log(`Want ${WANT} verified photos. Cities: ${[...grouped.keys()].join(', ') || '(none)'}`)

  let n = 0
  const total = sights.length
  for (const [city, list] of grouped) {
    const claimed = new Set()
    if (!force) {
      for (const exp of list) {
        for (const url of media[exp.id]?.photos ?? []) {
          const key = fileKey(url)
          if (key) claimed.add(key)
        }
      }
    }
    console.log(`\n=== ${city} (${list.length}) ===`)
    for (const exp of list) {
      n += 1
      const prev = media[exp.id] ?? { photos: [], videos: [] }
      if (!force && (prev.photos?.length ?? 0) >= 7) {
        console.log(`[${n}/${total}] skip ${exp.id} (already ${prev.photos.length})`)
        continue
      }
      process.stdout.write(`[${n}/${total}] ${exp.id} … `)
      try {
        const pin = index[exp.id]
        const cands = await candidatesFor(exp, pin)
        const photos = await verifyPhotos(exp, cands, claimed)
        const merged = []
        const seen = new Set()
        for (const url of photos) {
          if (!url || seen.has(url)) continue
          seen.add(url)
          merged.push(url)
        }
        const prevLen = prev.photos?.length ?? 0
        if (merged.length >= 7 || (merged.length > 0 && merged.length >= prevLen)) {
          media[exp.id] = { photos: merged, videos: prev.videos ?? [] }
          console.log(`${merged.length} kept / ${cands.length} cands`)
        } else {
          console.log(`keep previous ${prevLen} (new ${merged.length}, cands=${cands.length})`)
        }
        report.sights.push({ id: exp.id, city, kept: merged.length, candidates: cands.length })
        writeMedia(media)
      } catch (err) {
        console.log('error', err?.message ?? err)
        report.sights.push({ id: exp.id, city, error: String(err?.message ?? err) })
      }
    }
    writeMedia(media)
  }

  writeMedia(media)
  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + '\n')
  const short = report.sights.filter((s) => (s.kept ?? 0) < WANT && !s.error)
  console.log(`\nDone. Wrote media. Short of ${WANT}: ${short.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
