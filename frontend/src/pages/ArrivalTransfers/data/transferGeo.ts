import type { AirportId } from './types'

export type TransferCoord = { lat: number; lng: number }

export const AIRPORT_COORDS: Record<AirportId, TransferCoord & { mapsQuery: string }> = {
  HAN: { lat: 21.2212, lng: 105.8072, mapsQuery: 'Noi Bai International Airport, Hanoi' },
  DAD: { lat: 16.0439, lng: 108.1993, mapsQuery: 'Da Nang International Airport' },
  SGN: { lat: 10.8188, lng: 106.6519, mapsQuery: 'Tan Son Nhat International Airport, Ho Chi Minh City' },
  PQC: { lat: 10.1698, lng: 103.9934, mapsQuery: 'Phu Quoc International Airport' },
  CXR: { lat: 11.9983, lng: 109.2195, mapsQuery: 'Cam Ranh International Airport' },
  HUI: { lat: 16.4015, lng: 107.7026, mapsQuery: 'Phu Bai International Airport, Hue' },
  VCA: { lat: 10.0851, lng: 105.7117, mapsQuery: 'Can Tho International Airport' },
  DLI: { lat: 11.7506, lng: 108.3672, mapsQuery: 'Lien Khuong Airport, Da Lat' },
  VII: { lat: 18.7376, lng: 105.6708, mapsQuery: 'Vinh International Airport' },
  UIH: { lat: 13.955, lng: 109.042, mapsQuery: 'Phu Cat Airport, Quy Nhon' },
  VDH: { lat: 17.515, lng: 106.5908, mapsQuery: 'Dong Hoi Airport' },
  VDO: { lat: 21.1178, lng: 107.4144, mapsQuery: 'Van Don International Airport' },
  BMV: { lat: 12.6683, lng: 108.1203, mapsQuery: 'Buon Ma Thuot Airport' },
  PXU: { lat: 14.0045, lng: 108.0172, mapsQuery: 'Pleiku Airport' },
  VKG: { lat: 9.958, lng: 105.132, mapsQuery: 'Rach Gia Airport' },
  DIN: { lat: 21.3975, lng: 103.0079, mapsQuery: 'Dien Bien Phu Airport' },
  VCL: { lat: 15.4059, lng: 108.571, mapsQuery: 'Chu Lai Airport' },
  TBB: { lat: 13.0496, lng: 109.334, mapsQuery: 'Tuy Hoa Airport' },
  THD: { lat: 19.9017, lng: 105.4678, mapsQuery: 'Tho Xuan Airport, Thanh Hoa' },
  CAH: { lat: 9.177, lng: 105.178, mapsQuery: 'Ca Mau Airport' },
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
  'hui-citadel': { lat: 16.4696, lng: 107.5794 },
  'vca-ninh-kieu': { lat: 10.034, lng: 105.788 },
  'dli-centre': { lat: 11.9404, lng: 108.4583 },
  'vii-centre': { lat: 18.6796, lng: 105.6813 },
  'uih-quy-nhon': { lat: 13.782, lng: 109.219 },
  'vdh-dong-hoi': { lat: 17.469, lng: 106.622 },
  'vdo-bai-chay': { lat: 20.962, lng: 107.045 },
  'bmv-centre': { lat: 12.666, lng: 108.038 },
  'pxu-centre': { lat: 13.983, lng: 108.0 },
  'vkg-centre': { lat: 10.012, lng: 105.084 },
  'din-centre': { lat: 21.387, lng: 103.023 },
  'vcl-tam-ky': { lat: 15.566, lng: 108.483 },
  'tbb-centre': { lat: 13.088, lng: 109.309 },
  'thd-centre': { lat: 19.807, lng: 105.776 },
  'cah-centre': { lat: 9.177, lng: 105.15 },
}

export function destinationCoord(id: string): TransferCoord | null {
  return DESTINATION_COORDS[id] ?? null
}

export function haversineKm(a: TransferCoord, b: TransferCoord) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)))
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
