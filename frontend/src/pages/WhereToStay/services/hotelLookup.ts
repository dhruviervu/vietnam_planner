import { getStayCity, STAY_CITIES } from '../data/cities'
import { getClusterById, getClustersForCity } from '../data/clusters'
import { getStaysForCity, isAttractionStayName } from '../data/stays'
import type { CostLevel, PropertyType, StayCityId, StayCluster, StayProperty } from '../data/types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

export type HotelLookupResult = {
  stay: StayProperty
  alreadyInCatalog: boolean
  resolvedCityId: StayCityId
  resolvedCityLabel: string
  resolvedClusterId: string
  resolvedClusterName: string
}

export const INVALID_HOTEL_LINK_MESSAGE = 'Please check the URL.'

const BLOCKED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'amazon.com',
  'wikipedia.org',
  'nytimes.com',
  'bbc.com',
  'bbc.co.uk',
  'cnn.com',
  'medium.com',
  'linkedin.com',
  'github.com',
  'pinterest.com',
]

const LODGING_HOST_HINT =
  /hotel|resort|inn|hostel|homestay|motel|suites|lodge|accor|marriott|hilton|hyatt|ihg|sheraton|westin|novotel|mercure|sofitel|pullman|radisson|intercontinental|melia|vinpearl|sixsenses|aman|banyan|anantara|citadines|oakwood|airbnb|vrbo|booking|agoda|expedia|hotels\.com|tripadvisor/i

const LODGING_PATH_HINT =
  /hotel|resort|inn|hostel|homestay|motel|villa|lodge|stay|rooms?|accommodation|property/i

function hostOf(url: URL) {
  return url.hostname.replace(/^www\./, '').toLowerCase()
}

function hostBlocked(host: string) {
  return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))
}

export function looksLikeWebUrl(raw: string) {
  const trimmed = raw.trim()
  return /^https?:\/\//i.test(trimmed) || /^(www\.)?[\w-]+(\.[\w-]+)+([/?#]|$)/i.test(trimmed)
}

export function isHotelRelatedUrl(raw: string) {
  let url: URL
  try {
    url = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`)
  } catch {
    return false
  }
  const host = hostOf(url)
  const path = url.pathname + url.search
  if (hostBlocked(host)) return false

  if (/booking\.com$/.test(host)) {
    if (/searchresults|index\.html/i.test(path) && !/\/hotel\//i.test(path)) return false
    return /\/hotel\//i.test(path) || LODGING_PATH_HINT.test(path)
  }
  if (/agoda\.com$/.test(host)) {
    if (/\/(search|city)\b/i.test(path) && !/hotel/i.test(path)) return false
    return /hotel/i.test(path) || LODGING_PATH_HINT.test(path)
  }
  if (/hotels\.com$/.test(host)) {
    if (/Hotel-Search/i.test(path) && !/\/ho\d+/i.test(path)) return false
    return /\/ho\d+/i.test(path) || /Hotel-Information/i.test(path)
  }
  if (/expedia\./.test(host)) {
    if (/Hotel-Search/i.test(path) && !/Hotel-Information|\/h\d+/i.test(path)) return false
    return /Hotel-Information|\/h\d+|hotels-/i.test(path)
  }
  if (/tripadvisor\./.test(host)) {
    if (/Restaurant_Review|Attraction_Review|Tourism-/i.test(path)) return false
    return /Hotel_Review|Hotels-/i.test(path)
  }
  if (/airbnb\./.test(host)) return /\/rooms\//i.test(path)
  if (host === 'google.com' || host.endsWith('.google.com') || host === 'maps.google.com') {
    return /\/maps|travel\/hotels|travel\/search/i.test(path + url.search)
  }
  if (LODGING_HOST_HINT.test(host) || LODGING_PATH_HINT.test(path)) return true
  if (url.pathname === '/' || url.pathname === '') {
    return !hostBlocked(host) && /\./.test(host)
  }
  return !/\/(flights?|cars?|attractions?|restaurants?|news|blog)\b/i.test(path)
}

/** @deprecated use isHotelRelatedUrl */
export function isHotelListingUrl(raw: string) {
  return isHotelRelatedUrl(raw)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function titleFromSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/\.html?$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(
      /\b(hotel|hotels|review|reviews|vietnam|viet nam|vn|hanoi|ha noi|saigon|ho chi minh|danang|da nang|hoi an|nha trang|phu quoc|dalat|da lat)\b/gi,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value.trim()) || /(?:booking|agoda|hotels|expedia|tripadvisor)\.com/i.test(value)
}

/** Pull a hotel name (and place, when present) from a pasted OTA URL. */
export function parseHotelQuery(
  raw: string,
  fallbackLocation: string,
): { name: string; location: string; listingUrl?: string } {
  const trimmed = raw.trim()
  if (!looksLikeUrl(trimmed)) {
    return { name: trimmed, location: fallbackLocation }
  }

  let url: URL
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
  } catch {
    return { name: trimmed, location: fallbackLocation }
  }

  const host = url.hostname.replace(/^www\./, '')
  const path = url.pathname
  let name = ''
  let location = fallbackLocation

  const ss = url.searchParams.get('ss') || url.searchParams.get('destination')
  if (ss) {
    const parts = ss.split(',').map((part) => part.trim()).filter(Boolean)
    name = parts[0] ?? ''
    if (parts[1]) location = parts.slice(1).join(', ')
  }

  if (!name && host.includes('booking.com')) {
    const match = path.match(/\/hotel\/[a-z]{2}\/([^/.]+)/i)
    if (match) name = titleFromSlug(match[1])
  }
  if (!name && host.includes('agoda.com')) {
    const match = path.match(/\/([^/]+)\/hotel\//i) || path.match(/\/hotel\/([^/]+)/i)
    if (match) name = titleFromSlug(match[1])
  }
  if (!name && host.includes('hotels.com')) {
    const match = path.match(/\/ho\d+-([^/?]+)/i)
    if (match) name = titleFromSlug(match[1])
  }
  if (!name && host.includes('expedia.')) {
    const match = path.match(/\/(?:[a-z-]+-)?hotels-([^/?]+?)(?:\.h\d+)?/i)
    if (match) name = titleFromSlug(match[1].replace(/\.hotel-information$/i, ''))
  }
  if (!name && /tripadvisor\.com/.test(host)) {
    const match =
      path.match(/Reviews-([^/]+?)(?:-Hotels)?\.html/i) ||
      path.match(/Hotel_Review-[^-]+-[^-]+-Reviews-([^/]+)/i)
    if (match) {
      const bits = match[1].split('-').filter(Boolean)
      name = titleFromSlug(bits.slice(0, -1).join(' ') || bits.join(' '))
    }
  }
  if (!name) {
    const segments = path.split('/').filter(Boolean)
    const last = segments[segments.length - 1] || ''
    name = titleFromSlug(last) || trimmed
  }

  return { name: name || trimmed, location, listingUrl: url.toString() }
}

type PageMeta = {
  title?: string
  description?: string
  image?: string
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function metaFromHtml(html: string): PageMeta {
  const ogTitle =
    html.match(/property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1]
  const ogDesc =
    html.match(/property=["']og:description["'][^>]*content=["']([^"']+)/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1]
  const ogImage =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1]
  const titleTag = html.match(/<title[^>]*>([^<]+)/i)?.[1]
  let jsonName = ''
  let jsonDesc = ''
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const block of ldBlocks) {
    try {
      const data = JSON.parse(block[1] ?? '') as unknown
      const nodes = Array.isArray(data) ? data : [data]
      for (const node of nodes) {
        if (!node || typeof node !== 'object') continue
        const row = node as Record<string, unknown>
        const type = String(row['@type'] ?? '')
        if (/Hotel|LodgingBusiness|Resort|Hostel/i.test(type)) {
          if (typeof row.name === 'string') jsonName = row.name
          if (typeof row.description === 'string') jsonDesc = row.description
        }
      }
    } catch {
      /* ignore malformed json-ld */
    }
  }
  return {
    title: decodeHtml(jsonName || ogTitle || titleTag || '').trim(),
    description: decodeHtml(jsonDesc || ogDesc || '').trim(),
    image: ogImage,
  }
}

async function fetchHotelPageMeta(listingUrl: string): Promise<PageMeta | null> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(listingUrl)}`,
    `https://r.jina.ai/${listingUrl}`,
  ]
  for (const href of proxies) {
    try {
      const res = await fetch(href, { headers: { Accept: 'text/html,text/plain,*/*' } })
      if (!res.ok) continue
      const text = await res.text()
      if (!text || text.length < 40) continue
      const meta = metaFromHtml(text)
      if (meta.title || meta.description) return meta
    } catch {
      /* try next proxy */
    }
  }
  return null
}

function cityFromPoint(lng: number, lat: number, fallback: StayCityId): StayCityId {
  for (const city of STAY_CITIES) {
    const { west, south, east, north } = city.bounds
    if (lng >= west && lng <= east && lat >= south && lat <= north) return city.id
  }
  let best: { id: StayCityId; dist: number } | null = null
  for (const city of STAY_CITIES) {
    const midLng = (city.bounds.west + city.bounds.east) / 2
    const midLat = (city.bounds.south + city.bounds.north) / 2
    const dist = (lng - midLng) ** 2 + (lat - midLat) ** 2
    if (!best || dist < best.dist) best = { id: city.id, dist }
  }
  return best?.id ?? fallback
}

function pointInRing(lng: number, lat: number, ring: [number, number][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function clusterForPoint(
  clusters: StayCluster[],
  lng: number,
  lat: number,
  fallbackId: string,
) {
  const hit = clusters.find(
    (cluster) => cluster.polygon.length > 3 && pointInRing(lng, lat, cluster.polygon),
  )
  return hit?.id ?? fallbackId
}

function locationFromCluster(clusterId: string, fallbackCityId: StayCityId) {
  const cluster = getClusterById(clusterId)
  const cityId = cluster?.cityId ?? fallbackCityId
  const city = getStayCity(cityId)
  return {
    cityId,
    cityLabel: city.label,
    clusterId: cluster?.id ?? city.defaultClusterId,
    clusterName: cluster?.name ?? city.label,
  }
}

const CATALOG_GENERIC_WORDS = new Set([
  'hotel',
  'hotels',
  'spa',
  'resort',
  'inn',
  'the',
  'and',
  'of',
  'at',
  'vietnam',
  'viet',
  'nam',
  'hanoi',
  'saigon',
  'danang',
  'hue',
  'dalat',
  'city',
  'ho',
  'chi',
  'minh',
  'nha',
  'trang',
  'phu',
  'quoc',
  'hoi',
  'an',
  'da',
  'nang',
  'grand',
  'luxury',
  'boutique',
  'house',
])

function scoreCatalogStay(query: string, stay: StayProperty): number {
  const q = normalize(query)
  const name = normalize(stay.name)
  if (name === q) return 100
  if (q.length >= 6 && (name.includes(q) || q.includes(name))) return 80
  const words = q.split(' ').filter((word) => word.length > 2 && !CATALOG_GENERIC_WORDS.has(word))
  if (!words.length) return 0
  const hits = words.filter((word) => name.includes(word)).length
  if (words.length === 1) return hits && words[0].length >= 5 ? 70 : 0
  if (hits && hits >= Math.ceil(words.length * 0.6)) return 50 + hits
  return 0
}

function catalogMatch(query: string, cityId: StayCityId): StayProperty | null {
  const q = normalize(query)
  if (q.length < 3) return null
  let best: { stay: StayProperty; score: number } | null = null
  for (const stay of getStaysForCity(cityId)) {
    const score = scoreCatalogStay(q, stay)
    if (score && (!best || score > best.score)) best = { stay, score }
  }
  return best && best.score >= 50 ? best.stay : null
}

function catalogMatchAny(query: string): StayProperty | null {
  const q = normalize(query)
  if (q.length < 3) return null
  let best: { stay: StayProperty; score: number } | null = null
  for (const city of STAY_CITIES) {
    for (const stay of getStaysForCity(city.id)) {
      const score = scoreCatalogStay(q, stay)
      if (score && (!best || score > best.score)) best = { stay, score }
    }
  }
  return best && best.score >= 50 ? best.stay : null
}

type NominatimHit = {
  display_name?: string
  lat?: string
  lon?: string
  name?: string
  type?: string
  class?: string
  extratags?: Record<string, string>
  namedetails?: Record<string, string>
  address?: Record<string, string>
}

function looksLikeStayName(name: string) {
  return /hotel|resort|inn|hostel|homestay|guest|motel|villa|residence|suites|lodge|boutique|palace|metropole/i.test(
    name,
  )
}

function pointInSelectedCity(lng: number, lat: number, cityId: StayCityId): boolean {
  const city = getStayCity(cityId)
  const { west, south, east, north } = city.bounds
  if (lng >= west && lng <= east && lat >= south && lat <= north) return true
  return getClustersForCity(cityId).some(
    (cluster) => cluster.polygon.length > 3 && pointInRing(lng, lat, cluster.polygon),
  )
}

function isLodging(hit: NominatimHit) {
  const kind = `${hit.class ?? ''} ${hit.type ?? ''} ${hit.name ?? ''}`.toLowerCase()
  if (/theatre|theater|attraction|museum|gallery|artwork|viewpoint|theme_park/.test(kind)) {
    return false
  }
  return (
    /hotel|guest_house|hostel|motel|resort|apartment|chalet|motel|guest_house/.test(kind) ||
    looksLikeStayName(hit.name ?? '')
  )
}

async function searchNominatim(
  query: string,
  place: string,
  cityId: StayCityId,
): Promise<NominatimHit | null> {
  const city = getStayCity(cityId)
  const { west, south, east, north } = city.bounds
  const params = new URLSearchParams({
    q: `${query}, ${place}, Vietnam`,
    format: 'jsonv2',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    limit: '10',
    viewbox: `${west},${north},${east},${south}`,
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as NominatimHit[]
  if (!Array.isArray(rows) || !rows.length) return null

  const inCity = rows.filter((row) => {
    const lng = Number(row.lon)
    const lat = Number(row.lat)
    return Number.isFinite(lng) && Number.isFinite(lat) && pointInSelectedCity(lng, lat, cityId)
  })
  if (!inCity.length) return null
  return inCity.find(isLodging) ?? (looksLikeStayName(query) ? inCity[0] : null) ?? inCity[0]
}

type WikiSummary = {
  title: string
  extract: string
  thumbnail?: string
}

async function searchWikipedia(query: string, place: string): Promise<WikiSummary | null> {
  const searchParams = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `${query} ${place} Vietnam hotel`,
    srlimit: '5',
    format: 'json',
    origin: '*',
  })
  const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`)
  if (!searchRes.ok) return null
  const searchJson = (await searchRes.json()) as {
    query?: { search?: { title: string }[] }
  }
  const title = searchJson.query?.search?.find(
    (row) => !isAttractionStayName(row.title),
  )?.title
  if (!title || isAttractionStayName(title)) return null

  const summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } },
  )
  if (!summaryRes.ok) return null
  const summary = (await summaryRes.json()) as {
    title?: string
    extract?: string
    thumbnail?: { source?: string }
  }
  if (!summary.extract) return null
  return {
    title: summary.title || title,
    extract: summary.extract,
    thumbnail: summary.thumbnail?.source,
  }
}

function inferPropertyType(name: string, osmType?: string): PropertyType {
  const hay = `${name} ${osmType ?? ''}`.toLowerCase()
  if (/resort/.test(hay)) return 'resort'
  if (/villa/.test(hay)) return 'villa'
  if (/apartment|residenc/.test(hay)) return 'apartment'
  if (/airbnb|homestay|guest/.test(hay)) return 'airbnb'
  return 'hotel'
}

function amenitiesFromTags(tags: Record<string, string> | undefined): string[] {
  if (!tags) return []
  const out: string[] = []
  if (tags.internet_access || tags.wifi) out.push('Wifi')
  if (tags.swimming_pool === 'yes' || tags.leisure === 'swimming_pool') out.push('Pool')
  if (tags.spa === 'yes') out.push('Spa')
  if (tags.parking) out.push('Parking')
  if (tags.restaurant === 'yes') out.push('Restaurant')
  if (tags.bar === 'yes') out.push('Bar')
  return out.slice(0, 6)
}

function formatAddress(hit: NominatimHit, place: string) {
  if (hit.display_name) {
    return hit.display_name
      .split(',')
      .map((part) => part.trim())
      .slice(0, 4)
      .join(', ')
  }
  const address = hit.address ?? {}
  return [address.road, address.suburb, address.city || address.town, place].filter(Boolean).join(', ')
}

function costFromStars(stars: number): CostLevel {
  if (stars >= 5) return 4
  if (stars >= 4) return 3
  if (stars >= 3) return 2
  return 1
}

function bookingSearchUrl(name: string, place: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${name}, ${place}, Vietnam`)}&nflt=ht_id%3D204`
}

function mapsSearchUrl(name: string, place: string, lat?: number, lng?: number) {
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${place}, Vietnam`)}`
}

async function searchNominatimAnywhere(query: string, place: string): Promise<NominatimHit | null> {
  const params = new URLSearchParams({
    q: `${query}, ${place}, Vietnam`,
    format: 'jsonv2',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    limit: '8',
    countrycodes: 'vn',
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as NominatimHit[]
  if (!Array.isArray(rows) || !rows.length) return null
  return rows.find(isLodging) ?? (looksLikeStayName(query) ? rows[0] : null) ?? rows[0]
}

function resolveClusterId(cityId: StayCityId, preferredClusterId?: string) {
  const city = getStayCity(cityId)
  const clusters = getClustersForCity(cityId)
  if (preferredClusterId && clusters.some((cluster) => cluster.id === preferredClusterId)) {
    return preferredClusterId
  }
  return city.defaultClusterId
}

export function buildManualStay(input: {
  name: string
  place: string
  cityId: StayCityId
  listingUrl?: string
  preferredClusterId?: string
}): StayProperty {
  const name = input.name.trim()
  return {
    id: `lookup-${input.cityId}-${slugify(name)}`,
    clusterId: resolveClusterId(input.cityId, input.preferredClusterId),
    name,
    image: FALLBACK_IMAGE,
    rating: 0,
    reviewCount: 0,
    costLevel: 2,
    typicalNightlyRange: null,
    distanceLabel: input.place,
    amenities: [],
    bestFor: [],
    reason: `Added from ${input.listingUrl ? 'a hotel listing' : 'your search'}. Confirm details and rates on the booking site before you commit.`,
    bookingUrl: input.listingUrl || bookingSearchUrl(name, input.place),
    mapsUrl: mapsSearchUrl(name, input.place),
    sourceLabel: input.listingUrl ? 'Your listing link' : 'Added by you',
    addedByYou: true,
    propertyType: inferPropertyType(name),
    petsAllowed: false,
    caretaker: true,
    smokingAllowed: false,
    drinkingAllowed: false,
    quietHours: false,
    flexibleCancel: true,
    instantBook: false,
  }
}

export async function lookupHotel(input: {
  query: string
  cityId: StayCityId
  location: string
  preferredClusterId?: string
}): Promise<HotelLookupResult> {
  const city = getStayCity(input.cityId)
  if (!looksLikeWebUrl(input.query) || !isHotelRelatedUrl(input.query)) {
    throw new Error(INVALID_HOTEL_LINK_MESSAGE)
  }

  const parsed = parseHotelQuery(input.query, input.location.trim() || city.label)
  let name = parsed.name.trim()
  const listingUrl = parsed.listingUrl

  const pageMeta = listingUrl ? await fetchHotelPageMeta(listingUrl).catch(() => null) : null
  if (pageMeta?.title) {
    const cleaned = pageMeta.title
      .replace(/\s*[|\-–].*$/, '')
      .replace(/\s+(booking\.com|agoda|hotels\.com|expedia|tripadvisor).*$/i, '')
      .trim()
    if (cleaned.length >= 3 && !/^(home|index|hotels?)$/i.test(cleaned)) {
      name = cleaned
    }
  }

  if (name.length < 3 || looksLikeUrl(name) || /^(www|index|home|hotel|hotels)$/i.test(name)) {
    try {
      const raw = input.query.trim().startsWith('http') ? input.query.trim() : `https://${input.query.trim()}`
      const host = new URL(raw).hostname.replace(/^www\./, '').split('.')[0]?.replace(/-/g, ' ') ?? ''
      if (host.length >= 3) name = host
    } catch {
      /* keep name */
    }
  }

  if (name.length < 3 || /^(searchresults?|hotel|hotels|index|home)$/i.test(normalize(name).replace(/\s/g, ''))) {
    throw new Error(INVALID_HOTEL_LINK_MESSAGE)
  }
  if (isAttractionStayName(name)) {
    throw new Error(INVALID_HOTEL_LINK_MESSAGE)
  }

  const place = parsed.location || input.location.trim() || city.label

  const localCatalog = catalogMatch(name, input.cityId) ?? catalogMatchAny(name)
  if (localCatalog) {
    const located = locationFromCluster(localCatalog.clusterId, input.cityId)
    return {
      stay: {
        ...localCatalog,
        bookingUrl: listingUrl || localCatalog.bookingUrl,
      },
      alreadyInCatalog: true,
      resolvedCityId: located.cityId,
      resolvedCityLabel: located.cityLabel,
      resolvedClusterId: located.clusterId,
      resolvedClusterName: located.clusterName,
    }
  }

  const osm =
    (await searchNominatim(name, place, input.cityId).catch(() => null)) ||
    (await searchNominatimAnywhere(name, place).catch(() => null))
  const wiki = await searchWikipedia(name, place).catch(() => null)

  const lng = osm?.lon ? Number(osm.lon) : NaN
  const lat = osm?.lat ? Number(osm.lat) : NaN
  const resolvedCityId =
    Number.isFinite(lng) && Number.isFinite(lat) ? cityFromPoint(lng, lat, input.cityId) : input.cityId
  const resolvedCity = getStayCity(resolvedCityId)
  const clusters = getClustersForCity(resolvedCityId)
  const fallbackCluster = resolveClusterId(
    resolvedCityId,
    resolvedCityId === input.cityId ? input.preferredClusterId : undefined,
  )

  const wikiTitle = wiki?.title && !isAttractionStayName(wiki.title) ? wiki.title : ''
  const osmName = osm?.namedetails?.name || osm?.name || ''
  const resolvedName =
    (looksLikeStayName(wikiTitle) ? wikiTitle : '') ||
    (looksLikeStayName(osmName) ? osmName : '') ||
    osmName ||
    wikiTitle ||
    name

  const clusterId =
    Number.isFinite(lng) && Number.isFinite(lat)
      ? clusterForPoint(clusters, lng, lat, fallbackCluster)
      : fallbackCluster
  const resolved = locationFromCluster(clusterId, resolvedCityId)
  const tags = osm?.extratags ?? {}
  const stars = Number(tags.stars)
  const propertyType = inferPropertyType(resolvedName, osm?.type)
  const amenities = amenitiesFromTags(tags)
  const address = osm ? formatAddress(osm, place) : `${resolved.clusterName}, ${resolvedCity.label}`
  const extract =
    pageMeta?.description ||
    wiki?.extract ||
    `${resolvedName} is a stay in ${resolvedCity.label}${resolved.clusterName ? `, around ${resolved.clusterName}` : ''}. Confirm live rates on the listing you pasted.`

  const stay: StayProperty = {
    id: `lookup-${resolved.cityId}-${slugify(resolvedName)}`,
    clusterId: resolved.clusterId,
    name: resolvedName,
    image: wiki?.thumbnail || pageMeta?.image || FALLBACK_IMAGE,
    rating: Number.isFinite(stars) ? Math.min(5, Math.round((3 + stars * 0.4) * 10) / 10) : 0,
    reviewCount: 0,
    costLevel: Number.isFinite(stars) ? costFromStars(stars) : 2,
    typicalNightlyRange: null,
    distanceLabel: address,
    amenities,
    bestFor: [],
    reason: extract,
    bookingUrl: listingUrl || tags.website || bookingSearchUrl(resolvedName, place),
    mapsUrl: mapsSearchUrl(resolvedName, place, lat, lng),
    sourceLabel: 'Added by you',
    addedByYou: true,
    propertyType,
    petsAllowed: false,
    caretaker: propertyType === 'hotel' || propertyType === 'resort',
    smokingAllowed: false,
    drinkingAllowed: false,
    quietHours: false,
    flexibleCancel: true,
    instantBook: false,
  }

  return {
    stay,
    alreadyInCatalog: false,
    resolvedCityId: resolved.cityId,
    resolvedCityLabel: resolved.cityLabel,
    resolvedClusterId: resolved.clusterId,
    resolvedClusterName: resolved.clusterName,
  }
}

