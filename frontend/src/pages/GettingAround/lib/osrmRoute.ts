export type LatLng = { lat: number; lng: number }

export type OsrmRouteResult = {
  drivingKm: number
  drivingMinutes: number
  footKm: number
  footMinutes: number
  /** Leaflet [lat, lng] pairs following streets */
  geometry: [number, number][]
}

type OsrmJson = {
  code?: string
  routes?: Array<{
    distance: number
    duration: number
    geometry?: { type: string; coordinates: [number, number][] }
  }>
}

const OSRM_BASE = 'https://router.project-osrm.org'

async function fetchProfile(
  profile: 'driving' | 'foot',
  from: LatLng,
  to: LatLng,
): Promise<{ km: number; minutes: number; geometry: [number, number][] } | null> {
  const url = `${OSRM_BASE}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as OsrmJson
    const route = data.routes?.[0]
    if (!route || data.code !== 'Ok') return null
    const coords = route.geometry?.coordinates ?? []
    return {
      km: route.distance / 1000,
      minutes: route.duration / 60,
      geometry: coords.map(([lng, lat]) => [lat, lng] as [number, number]),
    }
  } catch {
    return null
  }
}

/** Road geometry (driving) plus foot duration for walk/cycle ranking. */
export async function fetchOsrmRoutes(from: LatLng, to: LatLng): Promise<OsrmRouteResult | null> {
  const [driving, foot] = await Promise.all([
    fetchProfile('driving', from, to),
    fetchProfile('foot', from, to),
  ])
  if (!driving && !foot) return null
  const geometry = (driving?.geometry?.length ? driving.geometry : foot?.geometry) ?? []
  if (geometry.length < 2) return null
  return {
    drivingKm: driving?.km ?? foot?.km ?? 0,
    drivingMinutes: driving?.minutes ?? 0,
    footKm: foot?.km ?? driving?.km ?? 0,
    footMinutes: foot?.minutes ?? 0,
    geometry,
  }
}
