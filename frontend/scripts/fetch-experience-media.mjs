/**
 * Fetch 10 relevant photos and 2–3 matching YouTube videos per experience.
 * Run: node scripts/fetch-experience-media.mjs
 * Force refresh: FORCE=1 node scripts/fetch-experience-media.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data')
const OUT_JSON = path.join(DATA_DIR, 'experienceMedia.json')
const OUT_TS = path.join(DATA_DIR, 'experienceMedia.ts')

const PHOTO_COUNT = 10
const UA = 'VietnamPlannerMediaBot/1.1 (travel planner; local research)'
const FORCE = process.env.FORCE === '1'

const PLACE_ALIASES = {
  'halong-cruise': ['Ha Long Bay', 'Halong Bay cruise', 'Ha Long Bay junk'],
  'temple-literature': ['Temple of Literature Hanoi', 'Van Mieu Quoc Tu Giam'],
  'old-quarter': ['Hanoi Old Quarter', 'Hang Ma Street Hanoi'],
  'ninh-binh': ['Trang An Ninh Binh', 'Trang An Landscape Complex'],
  'mua-cave': ['Hang Mua Ninh Binh', 'Mua Cave viewpoint'],
  'hoa-lu': ['Hoa Lu ancient capital', 'Hoa Lu Ninh Binh'],
  'hoi-an-lanterns': ['Hoi An lanterns night', 'Hoi An Ancient Town night'],
  'cooking-class': ['Hoi An cooking class', 'Vietnamese cooking class Hoi An'],
  'ha-giang-loop': ['Ha Giang Loop', 'Ma Pi Leng Pass'],
  'sapa-trek': ['Sa Pa rice terraces', 'Sapa trek Vietnam'],
  'hue-citadel': ['Hue Imperial Citadel', 'Imperial City Hue', 'Meridian Gate Hue'],
  'da-nang-beach': ['My Khe Beach Da Nang', 'China Beach Da Nang'],
  'phong-nha': ['Paradise Cave Phong Nha', 'Thien Duong Cave'],
  'war-remnants': ['War Remnants Museum Ho Chi Minh City'],
  'cu-chi': ['Cu Chi Tunnels', 'Củ Chi tunnels'],
  'mekong-delta': ['Cai Rang floating market', 'Mekong Delta floating market'],
  'phu-quoc-snorkel': ['Phu Quoc snorkeling', 'Phu Quoc coral'],
  'phu-quoc-sunset': ['Phu Quoc sunset beach', 'Long Beach Phu Quoc'],
  'egg-coffee': ['Vietnamese egg coffee', 'ca phe trung Hanoi'],
  'hanoi-food-tour': ['Hanoi street food', 'bun cha Hanoi'],
  'train-street': ['Hanoi Train Street', 'Train Street Hanoi'],
  'an-bang': ['An Bang Beach Hoi An'],
  'my-son': ['My Son Sanctuary', 'Mỹ Sơn Cham'],
  'marble-mountains': ['Marble Mountains Da Nang', 'Ngu Hanh Son'],
  'cat-ba': ['Cat Ba Island', 'Cat Ba National Park'],
  'lan-ha': ['Lan Ha Bay', 'Lan Ha Bay kayak'],
  'ben-thanh': ['Ben Thanh Market', 'Bến Thành Market'],
  'perfume-river': ['Perfume River Hue', 'Huong River Hue'],
  'dark-cave': ['Dark Cave Phong Nha', 'Hang Toi Phong Nha'],
  'dong-van': ['Dong Van Karst Plateau', 'Dong Van Vietnam'],
  'fansipan': ['Fansipan mountain', 'Fansipan cable car Sapa'],
  'bia-hoi': ['bia hoi Hanoi', 'bia hơi Hanoi'],
  'hoan-kiem-lake': ['Hoan Kiem Lake', 'Turtle Tower Hanoi'],
  'hoa-lo-prison': ['Hoa Lo Prison', 'Hỏa Lò Prison'],
  'ho-chi-minh-mausoleum': ['Ho Chi Minh Mausoleum', 'Ba Dinh Square'],
  'west-lake': ['West Lake Hanoi', 'Tran Quoc Pagoda'],
  'ethnology-museum': ['Vietnam Museum of Ethnology'],
  'thang-long-citadel': ['Imperial Citadel of Thang Long', 'Flag Tower of Hanoi'],
  'dong-xuan-market': ['Dong Xuan Market Hanoi'],
  'hanoi-opera-house': ['Hanoi Opera House'],
  'quan-thanh-temple': ['Quan Thanh Temple Hanoi'],
  'long-bien-bridge': ['Long Bien Bridge Hanoi'],
  'notre-dame-saigon': ['Notre-Dame Cathedral Basilica of Saigon'],
  'independence-palace': ['Independence Palace Saigon', 'Reunification Palace'],
  'landmark81-viewpoint': ['Landmark 81 Ho Chi Minh City'],
  'jade-emperor-pagoda': ['Jade Emperor Pagoda Saigon'],
  'nguyen-hue-walking': ['Nguyen Hue Boulevard', 'Nguyen Hue walking street'],
  'cho-lon': ['Cho Lon Saigon', 'Thien Hau Temple Ho Chi Minh', 'Binh Tay Market'],
  'apartment-cafes': ['Cafe apartment Ho Chi Minh', 'The Cafe Apartment District 1'],
  'hoi-an-ancient-town': ['Hoi An Ancient Town', 'Japanese Covered Bridge'],
  'cam-thanh-basket-boats': ['Cam Thanh basket boat', 'Hoi An coconut boat'],
  'tra-que-village': ['Tra Que Vegetable Village'],
  'thanh-ha-pottery': ['Thanh Ha Pottery Village Hoi An'],
  'thien-mu-pagoda': ['Thien Mu Pagoda Hue'],
  'tu-duc-tomb': ['Tomb of Tu Duc Hue'],
  'minh-mang-tomb': ['Tomb of Minh Mang Hue'],
  'dong-ba-market': ['Dong Ba Market Hue'],
  'dragon-bridge': ['Dragon Bridge Da Nang'],
  'son-tra': ['Son Tra Peninsula', 'Monkey Mountain Da Nang'],
  'linh-ung-pagoda': ['Linh Ung Pagoda Lady Buddha Da Nang'],
  'ba-na-hills': ['Golden Bridge Ba Na Hills', 'Ba Na Hills Da Nang'],
  'sung-sot-cave': ['Sung Sot Cave Ha Long', 'Surprise Cave Halong'],
  'ti-top-island': ['Ti Top Island Ha Long', 'Titov Island'],
  'trang-an-boats': ['Trang An boat Ninh Binh'],
  'tam-coc-boats': ['Tam Coc Ninh Binh', 'Tam Coc boat'],
  'van-long': ['Van Long Nature Reserve'],
  'bai-dinh': ['Bai Dinh Pagoda Ninh Binh'],
  'cat-cat-village': ['Cat Cat Village Sapa'],
  'sapa-market': ['Sa Pa market', 'Sapa town market'],
  'sao-beach': ['Sao Beach Phu Quoc', 'Bai Sao'],
  'duong-dong-night-market': ['Duong Dong night market Phu Quoc'],
  'dinh-cau': ['Dinh Cau Phu Quoc'],
  'paradise-cave': ['Paradise Cave Phong Nha', 'Thien Duong Cave'],
  'phong-nha-cave-boat': ['Phong Nha Cave boat'],
  'po-nagar': ['Po Nagar Cham Towers Nha Trang'],
  'nha-trang-promenade': ['Nha Trang Beach promenade'],
  'xuan-huong-lake': ['Xuan Huong Lake Da Lat'],
  'crazy-house': ['Hang Nga Crazy House Da Lat'],
  'valley-of-love': ['Valley of Love Da Lat'],
}

const STOP = new Set([
  'the', 'and', 'of', 'a', 'in', 'at', 'for', 'to', 'with', 'from', 'day',
  'walk', 'evening', 'morning', 'afternoon', 'class', 'tour', 'crawl', 'corner',
  'circuit', 'complex', 'escape', 'viewpoint', 'peak', 'section', 'hidden',
])

function placeName(exp) {
  return exp.name.replace(/\([^)]*\)/g, '').trim()
}

function tokens(exp) {
  return placeName(exp)
    .toLowerCase()
    .replace(/[^a-z0-9\sàáảãạăằắẩẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function aliases(exp) {
  return PLACE_ALIASES[exp.id] ?? [placeName(exp)]
}

function parseExperiences() {
  const files = ['experiences.ts', 'experiencesExtra.ts']
  const list = []
  const blobs = []
  for (const file of files) {
    const text = fs.readFileSync(path.join(DATA_DIR, file), 'utf8')
    blobs.push(text)
    const re = /id: '([^']+)',\s*\n\s*name: '([^']+)',\s*\n\s*region: '([^']+)',\s*\n\s*city: '([^']+)'/g
    let m
    while ((m = re.exec(text))) {
      list.push({ id: m[1], name: m[2], region: m[3], city: m[4] })
    }
  }
  const all = blobs.join('\n')
  for (const exp of list) {
    const idx = all.indexOf(`id: '${exp.id}'`)
    const slice = idx >= 0 ? all.slice(idx, idx + 2800) : ''
    const sm = slice.match(/signal: '([^']+)'/)
    const featured = /featured:\s*true/.test(slice)
    const hiddenGem = /hiddenGem:\s*true/.test(slice)
    const signal = sm?.[1] ?? ''
    let tag = 'Popular'
    if (signal === 'must-do' || featured) tag = 'Must do'
    else if (hiddenGem || signal === 'hidden-gem') tag = 'Hidden gem'
    else if (signal === 'vietnam-special' || signal === 'local-life') tag = 'Local favourite'
    else if (signal === 'adventure' || signal === 'picture-perfect') tag = 'Unique'
    exp.videoCount = tag === 'Must do' || tag === 'Popular' ? 3 : 2
  }
  return list
}

function cleanUrl(url) {
  return url?.split('?')[0] ?? url
}

function photoScore(title, exp) {
  const t = (title ?? '').toLowerCase()
  if (/logo|flag|map|icon|svg|coat of arms|location map|diagram|signature|stamp|qr /i.test(t)) return -100
  const toks = tokens(exp)
  let s = 0
  for (const tok of toks) if (t.includes(tok)) s += 3
  for (const a of aliases(exp)) {
    const parts = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    if (parts.every((p) => t.includes(p))) s += 6
  }
  if (t.includes(exp.city.toLowerCase())) s += 1
  if (t.includes('vietnam') || t.includes('viet nam')) s += 0.5
  return s
}

async function wikiJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  return res.json()
}

async function fetchCommonsHits(query, limit = 40) {
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
  const json = await wikiJson(`https://commons.wikimedia.org/w/api.php?${params}`)
  const out = []
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    if (!info?.thumburl) continue
    if (info.mime?.startsWith('video/')) continue
    if ((info.size ?? 0) < 50000) continue
    out.push({
      url: cleanUrl(info.thumburl),
      title: page.title ?? '',
      size: info.size ?? 0,
    })
  }
  return out
}

async function fetchWikipediaPageImages(query) {
  const search = await wikiJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`,
  )
  const hits = search?.query?.search ?? []
  const out = []
  for (const hit of hits.slice(0, 2)) {
    const params = new URLSearchParams({
      action: 'query',
      titles: hit.title,
      generator: 'images',
      gimlimit: '25',
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '1280',
      format: 'json',
      origin: '*',
    })
    const json = await wikiJson(`https://en.wikipedia.org/w/api.php?${params}`)
    for (const page of Object.values(json?.query?.pages ?? {})) {
      const info = page.imageinfo?.[0]
      if (!info?.thumburl) continue
      if (info.mime?.startsWith('video/') || info.mime === 'image/svg+xml') continue
      if ((info.size ?? 0) < 40000) continue
      out.push({
        url: cleanUrl(info.thumburl),
        title: page.title ?? '',
        size: info.size ?? 0,
      })
    }
    await sleep(200)
  }
  return out
}

async function fetchPhotosForExperience(exp, curated = []) {
  const queries = [
    ...aliases(exp).map((a) => `"${a}"`),
    ...aliases(exp),
    `${placeName(exp)} ${exp.city}`,
    `${placeName(exp)} Vietnam`,
  ]
  const scored = []
  const seen = new Set()

  for (const url of curated) {
    const clean = cleanUrl(url)
    if (seen.has(clean)) continue
    seen.add(clean)
    scored.push({ url: clean, title: url, size: 200000, score: 12 })
  }

  for (const q of queries) {
    const wiki = await fetchWikipediaPageImages(q.replace(/"/g, ''))
    for (const hit of wiki) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      if (score < 3) continue
      seen.add(hit.url)
      scored.push({ ...hit, score })
    }
    await sleep(200)
    const commons = await fetchCommonsHits(q, 30)
    for (const hit of commons) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      if (score < 3) continue
      seen.add(hit.url)
      scored.push({ ...hit, score })
    }
    await sleep(250)
    if (scored.length >= PHOTO_COUNT + 8) break
  }

  scored.sort((a, b) => b.score - a.score || b.size - a.size)
  let urls = scored.map((s) => s.url).slice(0, PHOTO_COUNT)

  if (urls.length < PHOTO_COUNT) {
    const extraQueries = [...aliases(exp), `${placeName(exp)} Vietnam`, `${exp.city} ${tokens(exp)[0] ?? ''}`]
    for (const q of extraQueries) {
      const extra = await fetchCommonsHits(q, 50)
      extra.sort((a, b) => photoScore(b.title, exp) - photoScore(a.title, exp) || b.size - a.size)
      for (const hit of extra) {
        if (urls.includes(hit.url)) continue
        if (photoScore(hit.title, exp) < 1) continue
        urls.push(hit.url)
        if (urls.length >= PHOTO_COUNT) break
      }
      if (urls.length >= PHOTO_COUNT) break
      await sleep(200)
    }
  }

  return urls.slice(0, PHOTO_COUNT)
}

async function fetchOpenversePhotos(query, limit = 20) {
  const urls = []
  const params = new URLSearchParams({
    q: query,
    page_size: String(Math.min(20, limit)),
    page: '1',
  })
  const res = await fetch(`https://api.openverse.engineering/v1/images?${params}`, {
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) return []
  const json = await res.json()
  for (const item of json.results ?? []) {
    const title = `${item.title ?? ''} ${item.tags?.map((t) => t.name).join(' ') ?? ''}`
    if (!item.url?.startsWith('http')) continue
    urls.push({ url: cleanUrl(item.url), title, size: 100000 })
  }
  return urls
}

async function padPhotos(exp, existing) {
  const urls = [...(existing ?? [])]
  const seen = new Set(urls)
  const queries = [...aliases(exp), placeName(exp), `${tokens(exp).slice(0, 2).join(' ')} Vietnam`]
  for (const q of queries) {
    const hits = await fetchCommonsHits(q, 50)
    hits.sort((a, b) => photoScore(b.title, exp) - photoScore(a.title, exp) || b.size - a.size)
    for (const hit of hits) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      const toks = tokens(exp)
      const hasToken = toks.some((t) => hit.title.toLowerCase().includes(t))
      if (score < 1 && !hasToken) continue
      seen.add(hit.url)
      urls.push(hit.url)
      if (urls.length >= PHOTO_COUNT) return urls.slice(0, PHOTO_COUNT)
    }
    await sleep(200)
  }
  for (const q of queries) {
    const ov = await fetchOpenversePhotos(q, 20)
    for (const hit of ov) {
      if (seen.has(hit.url)) continue
      const toks = tokens(exp)
      const hasToken = toks.some((t) => hit.title.toLowerCase().includes(t))
      if (photoScore(hit.title, exp) < 1 && !hasToken) continue
      seen.add(hit.url)
      urls.push(hit.url)
      if (urls.length >= PHOTO_COUNT) return urls.slice(0, PHOTO_COUNT)
    }
    await sleep(250)
  }
  return urls.slice(0, PHOTO_COUNT)
}

function extractCuratedImages() {
  const text = fs.readFileSync(path.join(DATA_DIR, 'experienceImages.ts'), 'utf8')
  const map = {}
  const blockRe = /'([^']+)':\s*\[([\s\S]*?)\]/g
  let m
  while ((m = blockRe.exec(text))) {
    const id = m[1]
    const files = [...m[2].matchAll(/w\('([^']+)'(?:,\s*(\d+))?\)/g)].map((x) => x[1])
    const urls = files.map(
      (file) =>
        `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`,
    )
    if (urls.length) map[id] = { urls, files }
  }
  return map
}

function videoScore(title, exp) {
  const t = (title ?? '').toLowerCase()
  const toks = tokens(exp)
  const city = exp.city.toLowerCase()
  const generic = /top \d+|things to do in|best of |what to do in|places to visit in/.test(t)
  const tokenHits = toks.filter((tok) => t.includes(tok)).length
  if (generic && tokenHits < Math.min(2, toks.length)) return -20
  let s = tokenHits * 5
  if (t.includes(city)) s += 1
  if (t.includes('vietnam') || t.includes('viet nam')) s += 1
  if (t.includes('tour') || t.includes('visit') || t.includes('guide')) s += 1
  return s
}

async function fetchYoutubeCandidates(page, query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(1800)
    const consent = page.locator('button:has-text("Accept all"), button:has-text("I agree"), button:has-text("Accept")')
    if (await consent.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await consent.first().click().catch(() => {})
      await page.waitForTimeout(1500)
    }
    await page.waitForTimeout(2000)
    return await page.evaluate(() => {
      const out = []
      const seen = new Set()
      const cards = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer')
      for (const card of cards) {
        const a =
          card.querySelector('a#video-title') ||
          card.querySelector('a#video-title-link') ||
          card.querySelector('a[href*="watch?v="]')
        if (!a) continue
        const href = a.getAttribute('href') ?? ''
        const m = href.match(/[?&]v=([\w-]{11})/)
        if (!m || seen.has(m[1])) continue
        const title = (
          a.getAttribute('title') ||
          a.getAttribute('aria-label') ||
          a.textContent ||
          ''
        )
          .replace(/by .*? \d+ (second|minute|hour|day|week|month|year)s? ago.*/i, '')
          .replace(/\s+/g, ' ')
          .trim()
        if (!title || /now playing/i.test(title)) continue
        seen.add(m[1])
        out.push({ youtubeId: m[1], title })
        if (out.length >= 12) break
      }
      return out
    })
  } catch {
    return []
  }
}

async function fetchVideoForExperience(page, exp) {
  if (!page) return []
  const queries = [
    `"${aliases(exp)[0]}" Vietnam`,
    `${placeName(exp)} ${exp.city} Vietnam`,
    `${aliases(exp)[0]} visit`,
  ]
  const pool = []
  for (const q of queries) {
    const batch = await fetchYoutubeCandidates(page, q)
    for (const item of batch) {
      if (!pool.some((p) => p.youtubeId === item.youtubeId)) pool.push(item)
    }
    await sleep(700)
  }
  pool.sort((a, b) => videoScore(b.title, exp) - videoScore(a.title, exp))
  const want = exp.videoCount ?? 2
  const picked = pool.filter((v) => videoScore(v.title, exp) >= 0).slice(0, want)
  if (picked.length) return picked
  return pool.slice(0, want)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
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

async function main() {
  const experiences = parseExperiences()
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : experiences.length
  const slice = experiences.slice(0, limit)
  const curated = extractCuratedImages()
  console.log(`Fetching focused media for ${slice.length} experiences…`)

  const media = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : {}

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

  let i = 0
  for (const exp of slice) {
    const existing = media[exp.id]
    const photosOk = !FORCE && existing?.photos?.length >= PHOTO_COUNT
    const wantVideos = exp.videoCount ?? 2
    const videosOk = !FORCE && (existing?.videos?.length ?? 0) >= wantVideos
    if (photosOk && videosOk) {
      console.log(`[skip] ${exp.id}`)
      continue
    }
    i += 1
    console.log(`[${i}] ${exp.id} — ${exp.name}`)
    const curatedEntry = curated[exp.id]
    let photos = existing?.photos ?? []
    if (!photosOk) {
      photos =
        photos.length > 0
          ? await padPhotos(exp, photos)
          : await fetchPhotosForExperience(exp, curatedEntry?.urls ?? [])
    }
    const videos = videosOk ? existing.videos : await fetchVideoForExperience(page, exp)
    media[exp.id] = { photos, videos }
    console.log(`  → ${photos.length} photos, ${videos.length} video${videos[0]?.title ? ` (${videos[0].title.slice(0, 70)})` : ''}`)
    fs.writeFileSync(OUT_JSON, JSON.stringify(media, null, 2), 'utf8')
    writeTs(media)
  }

  await browser.close()
  writeTs(media)
  console.log(`Done. Wrote ${OUT_TS}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
