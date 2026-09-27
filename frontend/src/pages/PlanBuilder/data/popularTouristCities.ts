/** Headline tourist cities — shown after Vietnam at its best, not by review volume. */
export const POPULAR_TOURIST_CITIES = [
  'Hanoi',
  'Ho Chi Minh City',
  'Hoi An',
  'Hue',
  'Da Nang',
  'Ha Long',
  'Ninh Binh',
  'Sapa',
  'Da Lat',
  'Nha Trang',
  'Phu Quoc',
  'Phong Nha',
] as const

export type PopularTouristCity = (typeof POPULAR_TOURIST_CITIES)[number]

export function popularCitiesPresent(available: string[]): string[] {
  const set = new Set(available)
  return POPULAR_TOURIST_CITIES.filter((city) => set.has(city))
}

export function compareCitiesByTouristPriority(a: string, b: string): number {
  const ia = POPULAR_TOURIST_CITIES.indexOf(a as PopularTouristCity)
  const ib = POPULAR_TOURIST_CITIES.indexOf(b as PopularTouristCity)
  const ra = ia === -1 ? 1000 : ia
  const rb = ib === -1 ? 1000 : ib
  if (ra !== rb) return ra - rb
  return a.localeCompare(b)
}
