/**
 * Fetch place facts for Where to Shop listings.
 * Prefers Google Places (hours, rating, photos, address, coords).
 * Falls back to Nominatim + Overpass + Wikimedia — never invents hours.
 *
 *   node scripts/fetch-shop-places.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'pages', 'BringHome', 'data', 'shopPlaceIntel.json')
const UA = 'VietnamPlannerShopBot/1.0 (travel planner; place research)'
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY || ''

const PLACES = [
  { id: 'tam-coc-night-market', name: 'Tam Coc Night Market', city: 'Ninh Binh', query: 'Tam Coc Night Market Ninh Binh' },
  { id: 'cho-rong-market', name: 'Cho Rong Market', city: 'Ninh Binh', query: 'Cho Rong Market Ninh Binh' },
  { id: 'van-lam-embroidery', name: 'Van Lam Embroidery Village', city: 'Ninh Binh', query: 'Van Lam Embroidery Village Ninh Binh' },
  { id: 'hoian-central-market', name: 'Hoi An Central Market', city: 'Hoi An', query: 'Hoi An Central Market' },
  { id: 'hoian-night-market', name: 'Hoi An Night Market', city: 'Hoi An', query: 'Hoi An Night Market Nguyen Hoang' },
  { id: 'hoian-silk-village', name: 'Hoi An Silk Village', city: 'Hoi An', query: 'Hoi An Silk Village' },
  { id: 'thanh-ha-pottery', name: 'Thanh Ha Pottery Village', city: 'Hoi An', query: 'Thanh Ha Pottery Village Hoi An' },
  { id: 'ben-thanh', name: 'Ben Thanh Market', city: 'Ho Chi Minh City', query: 'Ben Thanh Market Ho Chi Minh City' },
  { id: 'binh-tay', name: 'Binh Tay Market', city: 'Ho Chi Minh City', query: 'Binh Tay Market Cho Lon' },
  { id: 'saigon-square', name: 'Saigon Square', city: 'Ho Chi Minh City', query: 'Saigon Square Le Thanh Ton' },
  { id: 'vincom-dong-khoi', name: 'Vincom Center Dong Khoi', city: 'Ho Chi Minh City', query: 'Vincom Center Dong Khoi' },
  { id: 'takashimaya-saigon', name: 'Takashimaya Vietnam', city: 'Ho Chi Minh City', query: 'Takashimaya Saigon Centre' },
  { id: 'danang-han-market', name: 'Han Market', city: 'Da Nang', query: 'Han Market Da Nang' },
  { id: 'con-market', name: 'Con Market', city: 'Da Nang', query: 'Con Market Cho Con Da Nang' },
  { id: 'son-tra-night-market', name: 'Son Tra Night Market', city: 'Da Nang', query: 'Son Tra Night Market Da Nang' },
  { id: 'non-nuoc-stone', name: 'Non Nuoc Stone Carving Village', city: 'Da Nang', query: 'Non Nuoc Stone Carving Village Da Nang' },
  { id: 'phu-quoc-night-market', name: 'Phu Quoc Night Market', city: 'Phu Quoc', query: 'Phu Quoc Night Market Duong Dong' },
  { id: 'duong-dong-market', name: 'Duong Dong Market', city: 'Phu Quoc', query: 'Duong Dong Market Phu Quoc' },
  { id: 'kingkong-mart', name: 'Kingkong Mart Phu Quoc', city: 'Phu Quoc', query: 'Kingkong Mart Phu Quoc' },
  { id: 'sapa-night-market', name: 'Sapa Night Market', city: 'Sapa', query: 'Sapa Night Market' },
  { id: 'sapa-central-market', name: 'Sapa Central Market', city: 'Sapa', query: 'Sapa Market Sa Pa' },
  { id: 'bac-ha-market', name: 'Bac Ha Market', city: 'Sapa', query: 'Bac Ha Sunday Market Lao Cai' },
  { id: 'hue-dong-ba', name: 'Dong Ba Market', city: 'Hue', query: 'Dong Ba Market Hue' },
  { id: 'nguyen-dinh-chieu-hue', name: 'Nguyen Dinh Chieu Walking Street', city: 'Hue', query: 'Nguyen Dinh Chieu Walking Street Hue' },
  { id: 'phu-cam-hats', name: 'Phu Cam Conical Hat Village', city: 'Hue', query: 'Phu Cam conical hat village Hue' },
  { id: 'dam-nha-trang', name: 'Dam Market', city: 'Nha Trang', query: 'Dam Market Cho Dam Nha Trang' },
  { id: 'nhatrang-night-market', name: 'Nha Trang Night Market', city: 'Nha Trang', query: 'Nha Trang Night Market Tran Phu' },
  { id: 'xq-nha-trang', name: 'XQ Historical Village Nha Trang', city: 'Nha Trang', query: 'XQ Historical Village Nha Trang' },
  { id: 'ha-giang-central-market', name: 'Ha Giang Central Market', city: 'Ha Giang', query: 'Ha Giang Central Market' },
  { id: 'meo-vac-sunday-market', name: 'Meo Vac Sunday Market', city: 'Ha Giang', query: 'Meo Vac Sunday Market' },
  { id: 'can-tho-night-market', name: 'Can Tho Night Market', city: 'Can Tho', query: 'Can Tho Night Market Ninh Kieu' },
  { id: 'cai-rang-floating-market', name: 'Cai Rang Floating Market', city: 'Can Tho', query: 'Cai Rang Floating Market Can Tho' },
  { id: 'dalat-night-market', name: 'Da Lat Night Market', city: 'Da Lat', query: 'Da Lat Night Market' },
  { id: 'dalat-market', name: 'Da Lat Market', city: 'Da Lat', query: 'Da Lat Market Cho Da Lat' },
  { id: 'xq-da-lat', name: 'XQ Historical Village Da Lat', city: 'Da Lat', query: 'XQ Historical Village Da Lat' },
  { id: 'cat-ba-market', name: 'Cat Ba Market', city: 'Cat Ba', query: 'Cat Ba Market' },
  { id: 'cat-ba-night-market', name: 'Cat Ba Night Market', city: 'Cat Ba', query: 'Cat Ba Night Market' },
  { id: 'dong-van-market', name: 'Dong Van Market', city: 'Dong Van', query: 'Dong Van Market Ha Giang' },
  { id: 'dong-van-ancient-market', name: 'Dong Van Ancient Town Market', city: 'Dong Van', query: 'Dong Van Ancient Town Market' },
  { id: 'ha-long-night-market', name: 'Ha Long Night Market', city: 'Ha Long', query: 'Ha Long Night Market Bai Chay' },
  { id: 'hon-gai-market', name: 'Hon Gai Market', city: 'Ha Long', query: 'Hon Gai Market Ha Long' },
  { id: 'bai-chay-commercial', name: 'Bai Chay Commercial Center', city: 'Ha Long', query: 'Bai Chay Commercial Center Ha Long' },
  { id: 'phong-nha-main-street', name: 'Phong Nha Main Street Market', city: 'Phong Nha', query: 'Phong Nha town market Son Trach' },
  { id: 'son-trach-market', name: 'Son Trach Village Market', city: 'Phong Nha', query: 'Son Trach market Phong Nha' },
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function commonsFileUrl(title) {
  const file = title.replace(/^File:/i, '')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`
}

async function googlePlace(query, city) {
  if (!GOOGLE_KEY) return null
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos,places.googleMapsUri,places.primaryType',
    },
    body: JSON.stringify({
      textQuery: `${query} Vietnam`,
      languageCode: 'en',
      maxResultCount: 5,
    }),
  })
  if (!res.ok) {
    console.warn('Google search failed', res.status, query)
    return null
  }
  const json = await res.json()
  const want = normalize(`${query} ${city}`)
  const places = json.places ?? []
  let hit = places[0]
  let best = -1
  for (const p of places) {
    const got = normalize(`${p.displayName?.text ?? ''} ${p.formattedAddress ?? ''}`)
    let score = 0
    if (got.includes(normalize(city))) score += 4
    const name = normalize(p.displayName?.text ?? '')
    if (want.split(' ').filter((w) => w.length > 2).every((w) => name.includes(w) || got.includes(w)))
      score += 6
    if (score > best) {
      best = score
      hit = p
    }
  }
  if (!hit) return null
  const hours = hit.regularOpeningHours
  const photos = []
  for (const photo of (hit.photos ?? []).slice(0, 3)) {
    if (!photo.name) continue
    const media = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=900&key=${GOOGLE_KEY}`
    photos.push(media)
  }
  return {
    source: 'google',
    displayName: hit.displayName?.text ?? null,
    address: hit.formattedAddress ?? null,
    lat: hit.location?.latitude ?? null,
    lng: hit.location?.longitude ?? null,
    rating: hit.rating ?? null,
    reviewCount: hit.userRatingCount ?? null,
    openingHours: (hours?.weekdayDescriptions ?? []).join('; ') || null,
    weekdayDescriptions: hours?.weekdayDescriptions ?? [],
    periods: hours?.periods ?? [],
    googleMapsUri: hit.googleMapsUri ?? null,
    photos,
    primaryType: hit.primaryType ?? null,
  }
}

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: `${query}, Vietnam`,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '3',
  })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  const rows = await res.json()
  const hit = rows[0]
  if (!hit) return null
  return {
    displayName: hit.display_name,
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    address: hit.display_name,
  }
}

async function overpassHours(name, lat, lng) {
  if (lat == null || lng == null) return null
  const q = `[out:json][timeout:20];nwr(around:500,${lat},${lng})["opening_hours"];out tags center;`
  for (const url of [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent': UA,
        },
        body: `data=${encodeURIComponent(q)}`,
      })
      if (!res.ok) continue
      const data = await res.json()
      const want = normalize(name)
      let best = null
      for (const el of data.elements ?? []) {
        const hours = el.tags?.opening_hours
        if (!hours) continue
        const names = [el.tags?.name, el.tags?.['name:en'], el.tags?.['name:vi']].filter(Boolean)
        const hit = names.some((n) => {
          const got = normalize(n)
          return got.includes(want) || want.includes(got) || want.split(' ').filter((w) => w.length > 3).some((w) => got.includes(w))
        })
        if (hit) {
          best = hours
          break
        }
      }
      if (best) return best
    } catch {
      /* next */
    }
  }
  return null
}

async function wikimediaPhotos(query, city) {
  const urls = []
  const seen = new Set()
  const searches = [query, `${query} ${city}`, `${query} Vietnam`]
  for (const q of searches) {
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: q,
      srnamespace: '6',
      srlimit: '12',
      format: 'json',
      origin: '*',
    })
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) continue
    const json = await res.json()
    const tokens = normalize(query).split(' ').filter((w) => w.length > 2)
    for (const row of json.query?.search ?? []) {
      const title = row.title ?? ''
      const t = normalize(title)
      const hits = tokens.filter((tok) => t.includes(tok)).length
      if (hits < Math.min(2, tokens.length) && !t.includes(normalize(city))) continue
      if (/svg|icon|logo|flag|map of/i.test(title) && hits < 3) continue
      const url = commonsFileUrl(title)
      if (seen.has(url)) continue
      seen.add(url)
      urls.push(url)
      if (urls.length >= 3) return urls
    }
    await sleep(180)
  }
  return urls
}

async function wikiPageImage(query) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '5',
    prop: 'pageimages',
    piprop: 'original',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) return []
  const json = await res.json()
  const urls = []
  for (const page of Object.values(json.query?.pages ?? {})) {
    const url = page.original?.source
    if (url) urls.push(url)
  }
  return urls.slice(0, 2)
}

async function run() {
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  const out = { ...existing }
  console.log(`Google Places key: ${GOOGLE_KEY ? 'yes' : 'no — using OSM/Wikimedia'}`)
  for (const place of PLACES) {
    if (out[place.id]?.lat != null && process.env.FORCE !== '1') {
      console.log('skip', place.id)
      continue
    }
    console.log('fetch', place.id)
    const google = await googlePlace(place.query, place.city)
    await sleep(google ? 120 : 0)
    const geo = google?.lat != null ? google : await nominatim(place.query)
    await sleep(1500)
    const osmHours = google?.openingHours ? null : await overpassHours(place.name, geo?.lat, geo?.lng)
    await sleep(800)
    const photos = google?.photos?.length ? google.photos : out[place.id]?.photos ?? []
    out[place.id] = {
      id: place.id,
      name: place.name,
      city: place.city,
      query: place.query,
      source: google ? 'google' : geo ? 'osm' : 'none',
      displayName: google?.displayName ?? geo?.displayName ?? place.name,
      address: google?.address ?? geo?.address ?? null,
      lat: google?.lat ?? geo?.lat ?? null,
      lng: google?.lng ?? geo?.lng ?? null,
      rating: google?.rating ?? null,
      reviewCount: google?.reviewCount ?? null,
      openingHours: google?.openingHours ?? osmHours ?? null,
      weekdayDescriptions: google?.weekdayDescriptions ?? [],
      periods: google?.periods ?? [],
      hoursSource: google?.openingHours ? 'google' : osmHours ? 'osm' : 'unknown',
      googleMapsUri:
        google?.googleMapsUri ??
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query + ', Vietnam')}`,
      photos,
      fetchedAt: new Date().toISOString(),
    }
    fs.writeFileSync(OUT, JSON.stringify(out, null, 2))
  }
  console.log('wrote', OUT)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
