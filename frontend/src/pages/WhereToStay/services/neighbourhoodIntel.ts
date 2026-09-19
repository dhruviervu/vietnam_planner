import { getClusterById } from '../data/clusters'
import { getStayCity } from '../data/cities'
import { getClusterDescription } from '../data/clusterDescriptions'

export type NeighbourhoodIntel = {
  clusterId: string
  title: string
  extract: string
  source: 'wikipedia' | 'catalog'
  mapsEmbedUrl: string
  mapsSearchUrl: string
  googleHotelsUrl: string
  wikiUrl?: string
}

const CACHE_PREFIX = 'stay-nb-intel:'

function centroid(ring: [number, number][]): { lat: number; lng: number } | null {
  if (ring.length < 3) return null
  let lat = 0
  let lng = 0
  let n = 0
  for (const [x, y] of ring) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    lng += x
    lat += y
    n += 1
  }
  if (!n) return null
  return { lat: lat / n, lng: lng / n }
}

function queryFor(clusterName: string, cityLabel: string) {
  return `${clusterName}, ${cityLabel}, Vietnam`
}

export function neighbourhoodLinkSet(clusterId: string) {
  const cluster = getClusterById(clusterId)
  if (!cluster) return null
  const city = getStayCity(cluster.cityId)
  const q = queryFor(cluster.name, city.label)
  const encoded = encodeURIComponent(q)
  const center = centroid(cluster.polygon)
  const mapsSearchUrl = center
    ? `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encoded}&z=14&output=embed`
  const googleHotelsUrl = `https://www.google.com/travel/search?q=${encoded}&ved=0`
  return { q, mapsSearchUrl, mapsEmbedUrl, googleHotelsUrl, city, cluster }
}

function catalogFallback(clusterId: string): NeighbourhoodIntel | null {
  const links = neighbourhoodLinkSet(clusterId)
  if (!links) return null
  const essay = getClusterDescription(clusterId)
  return {
    clusterId,
    title: links.cluster.name,
    extract: essay.text.split('\n\n')[0]?.trim() || links.cluster.baseYourselfIf,
    source: 'catalog',
    mapsEmbedUrl: links.mapsEmbedUrl,
    mapsSearchUrl: links.mapsSearchUrl,
    googleHotelsUrl: links.googleHotelsUrl,
  }
}

function readCache(clusterId: string): NeighbourhoodIntel | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${clusterId}`)
    if (!raw) return null
    return JSON.parse(raw) as NeighbourhoodIntel
  } catch {
    return null
  }
}

function writeCache(intel: NeighbourhoodIntel) {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${intel.clusterId}`, JSON.stringify(intel))
  } catch {
    /* ignore quota */
  }
}

async function wikipediaSummary(query: string): Promise<{ title: string; extract: string; url?: string } | null> {
  const searchParams = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: `${query} neighbourhood district`,
    srlimit: '5',
    format: 'json',
    origin: '*',
  })
  const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`)
  if (!searchRes.ok) return null
  const searchJson = (await searchRes.json()) as {
    query?: { search?: { title: string }[] }
  }
  const title = searchJson.query?.search?.[0]?.title
  if (!title) return null
  const summaryRes = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } },
  )
  if (!summaryRes.ok) return null
  const summary = (await summaryRes.json()) as {
    title?: string
    extract?: string
    content_urls?: { desktop?: { page?: string } }
  }
  if (!summary.extract) return null
  return {
    title: summary.title || title,
    extract: summary.extract,
    url: summary.content_urls?.desktop?.page,
  }
}

export async function loadNeighbourhoodIntel(clusterId: string): Promise<NeighbourhoodIntel | null> {
  const cached = readCache(clusterId)
  if (cached?.source === 'wikipedia') return cached
  const fallback = catalogFallback(clusterId)
  const links = neighbourhoodLinkSet(clusterId)
  if (!links || !fallback) return cached ?? fallback

  try {
    const wiki = await wikipediaSummary(links.q)
    const intel: NeighbourhoodIntel = wiki
      ? {
          ...fallback,
          title: wiki.title,
          extract: wiki.extract,
          source: 'wikipedia',
          wikiUrl: wiki.url,
        }
      : fallback
    writeCache(intel)
    return intel
  } catch {
    writeCache(fallback)
    return fallback
  }
}

export function prefetchNeighbourhoodIntel(clusterId: string) {
  void loadNeighbourhoodIntel(clusterId)
}
