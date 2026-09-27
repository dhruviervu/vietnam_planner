import type { Airport, AirportId, Destination, TransferDirection } from './types'

export type BookingRoute = {
  airport: Airport
  destination: Destination
  direction: TransferDirection
}

const GO12_AIRPORT: Record<AirportId, string> = {
  HAN: 'hanoi-airport',
  SGN: 'ho-chi-minh-airport',
  DAD: 'da-nang-airport',
  PQC: 'phu-quoc-airport',
  CXR: 'cam-ranh-airport',
}

const WELCOME_CITY: Record<AirportId, string> = {
  HAN: 'hanoi',
  SGN: 'ho-chi-minh-city',
  DAD: 'da-nang',
  PQC: 'phu-quoc',
  CXR: 'nha-trang',
}

function slug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function go12Dest(dest: Destination): string {
  const blob = `${dest.city} ${dest.label}`.toLowerCase()
  if (blob.includes('hoi an')) return 'hoi-an'
  if (blob.includes('hue')) return 'hue'
  if (blob.includes('hanoi')) return 'hanoi'
  if (blob.includes('ho chi minh') || blob.includes('saigon')) return 'ho-chi-minh'
  if (blob.includes('da nang')) return 'da-nang'
  if (blob.includes('phu quoc')) return 'phu-quoc'
  if (blob.includes('nha trang')) return 'nha-trang'
  return slug(dest.city)
}

export function routePlate(route: BookingRoute): { from: string; to: string } {
  const airport = `${route.airport.name} (${route.airport.code})`
  const place = `${route.destination.label}, ${route.destination.city}`
  if (route.direction === 'outbound') return { from: place, to: airport }
  return { from: airport, to: place }
}

export function filledBookingUrl(url: string | undefined, route: BookingRoute): string | undefined {
  if (!url) return undefined
  const { from, to } = routePlate(route)
  const inbound = route.direction === 'inbound'
  const airportSlug = GO12_AIRPORT[route.airport.id]
  const destSlug = go12Dest(route.destination)
  const fromSlug = inbound ? airportSlug : destSlug
  const toSlug = inbound ? destSlug : airportSlug
  const q = encodeURIComponent(`${from} to ${to}`)

  if (url.includes('12go.asia')) return `https://12go.asia/en/travel/${fromSlug}/${toSlug}`
  if (url.includes('klook.com')) {
    return `https://www.klook.com/en-US/search/result/?query=${q}`
  }
  if (url.includes('welcomepickups.com')) {
    return `https://www.welcomepickups.com/${WELCOME_CITY[route.airport.id]}/`
  }
  if (url.includes('holidaytaxis.com')) {
    return `https://www.holidaytaxis.com/en/airport/${route.airport.code.toLowerCase()}`
  }
  if (url.includes('gettransfer.com')) {
    return `https://gettransfer.com/en/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  }
  if (url.includes('hertz.com')) {
    return `https://www.hertz.com/rentacar/location/search?keyword=${encodeURIComponent(`${route.airport.name} ${route.airport.code}`)}`
  }
  if (url.includes('avis.com')) {
    return `https://www.avis.com/en/search?location=${encodeURIComponent(`${route.airport.name} ${route.airport.code}`)}`
  }
  if (url.includes('budget.com')) {
    return `https://www.budget.com/en/location-finder?keyword=${encodeURIComponent(`${route.airport.name} ${route.airport.code}`)}`
  }
  if (url.includes('futabus.vn')) {
    return `https://futabus.vn/en-US?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  }
  return url
}

export function providerDetailHref(providerId: string, route: BookingRoute) {
  const q = new URLSearchParams({
    dest: route.destination.id,
    dir: route.direction,
  })
  return `/plan/builder/airport/provider/${encodeURIComponent(providerId)}?${q.toString()}`
}

export function modeDetailHref(modeId: string, route: BookingRoute) {
  const q = new URLSearchParams({
    dest: route.destination.id,
    dir: route.direction,
    airport: route.airport.id,
  })
  return `/plan/builder/airport/mode/${encodeURIComponent(modeId)}?${q.toString()}`
}
