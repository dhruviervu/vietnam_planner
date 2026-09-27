import type { AirportId } from './types'

export type TransferCoord = { lat: number; lng: number }

export const AIRPORT_COORDS: Record<AirportId, TransferCoord & { mapsQuery: string }> = {
  HAN: { lat: 21.2212, lng: 105.8072, mapsQuery: 'Noi Bai International Airport, Hanoi' },
  DAD: { lat: 16.0439, lng: 108.1993, mapsQuery: 'Da Nang International Airport' },
  SGN: { lat: 10.8188, lng: 106.6519, mapsQuery: 'Tan Son Nhat International Airport, Ho Chi Minh City' },
  PQC: { lat: 10.1698, lng: 103.9934, mapsQuery: 'Phu Quoc International Airport' },
  CXR: { lat: 11.9983, lng: 109.2195, mapsQuery: 'Cam Ranh International Airport' },
}

export const DESTINATION_COORDS: Record<string, TransferCoord> = {
  'han-old-quarter': { lat: 21.0333, lng: 105.85 },
  'han-west-lake': { lat: 21.0556, lng: 105.8264 },
  'han-french-quarter': { lat: 21.0245, lng: 105.8558 },
  'han-ba-dinh': { lat: 21.0359, lng: 105.8342 },
  'dad-city': { lat: 16.0544, lng: 108.2022 },
  'dad-my-khe': { lat: 16.0598, lng: 108.2475 },
  'dad-hoi-an': { lat: 15.8801, lng: 108.338 },
  'dad-hoi-an-city': { lat: 15.8794, lng: 108.327 },
  'dad-an-bang': { lat: 15.9175, lng: 108.32 },
  'dad-marble': { lat: 16.0039, lng: 108.2633 },
  'dad-hue': { lat: 16.4637, lng: 107.5909 },
  'sgn-d1': { lat: 10.7769, lng: 106.7009 },
  'sgn-d3': { lat: 10.7828, lng: 106.6863 },
  'sgn-thu-duc': { lat: 10.8494, lng: 106.7538 },
  'sgn-d7': { lat: 10.7292, lng: 106.7216 },
  'pqc-duong-dong': { lat: 10.2171, lng: 103.959 },
  'pqc-long-beach': { lat: 10.191, lng: 103.9665 },
  'cxr-nha-trang': { lat: 12.2388, lng: 109.1967 },
  'cxr-beach': { lat: 12.245, lng: 109.196 },
}

export function destinationCoord(id: string): TransferCoord | null {
  return DESTINATION_COORDS[id] ?? null
}

export function googleDirectionsUrl(
  originQuery: string,
  destQuery: string,
  travelmode: 'driving' | 'transit' = 'driving',
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQuery)}&destination=${encodeURIComponent(destQuery)}&travelmode=${travelmode}`
}

/** Pin a known coordinate — Google always resolves lat,lng. */
export function mapsPinUrl(place: TransferCoord) {
  return `https://www.google.com/maps?q=${place.lat},${place.lng}`
}

/**
 * Directions between two coordinates (path form).
 * Named place queries often fail to geocode; lat,lng does not.
 */
export function mapsDirUrl(
  from: TransferCoord,
  to: TransferCoord,
  _travelmode: 'driving' | 'transit' = 'driving',
) {
  return `https://www.google.com/maps/dir/${from.lat},${from.lng}/${to.lat},${to.lng}`
}

/** Well-known pins used on airport-transfer guides. */
export const MAP_PLACES = {
  han: AIRPORT_COORDS.HAN,
  sgn: AIRPORT_COORDS.SGN,
  dad: AIRPORT_COORDS.DAD,
  cxr: AIRPORT_COORDS.CXR,
  pqc: AIRPORT_COORDS.PQC,
  district1: DESTINATION_COORDS['sgn-d1'],
  benThanh: { lat: 10.7726, lng: 106.698 },
  oldQuarter: DESTINATION_COORDS['han-old-quarter'],
  daNangCentre: DESTINATION_COORDS['dad-city'],
  hoiAnAncient: DESTINATION_COORDS['dad-hoi-an'],
  duongDong: DESTINATION_COORDS['pqc-duong-dong'],
  hanoiStation: { lat: 21.0244, lng: 105.8411 },
  quangTrung1: { lat: 21.0256, lng: 105.8542 },
  tranNhanTong: { lat: 21.0166, lng: 105.8494 },
  catLinh: { lat: 21.0288, lng: 105.8324 },
  cauGiay: { lat: 21.0308, lng: 105.7896 },
  nhaTrangCentre: DESTINATION_COORDS['cxr-nha-trang'],
  bus86T2: { lat: 21.2187, lng: 105.8042 },
  bus109Pillar: { lat: 10.8188, lng: 106.6519 },
} as const satisfies Record<string, TransferCoord>
