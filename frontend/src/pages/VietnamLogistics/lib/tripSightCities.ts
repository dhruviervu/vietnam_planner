import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { useTripStore } from '../../../store/tripStore'

/** Cities that have dedicated exchange desks in our curated list. */
export const EXCHANGE_CITY_ORDER = [
  'Hanoi',
  'Ninh Binh',
  'Ha Long',
  'Cat Ba',
  'Sapa',
  'Ha Giang',
  'Dong Van',
  'Hue',
  'Da Nang',
  'Hoi An',
  'Phong Nha',
  'Nha Trang',
  'Da Lat',
  'Ho Chi Minh City',
  'Can Tho',
  'Phu Quoc',
] as const

export type ExchangeCity = (typeof EXCHANGE_CITY_ORDER)[number]

const CITY_ALIASES: Record<string, ExchangeCity> = {
  hanoi: 'Hanoi',
  'ha noi': 'Hanoi',
  'ninh binh': 'Ninh Binh',
  'ha long': 'Ha Long',
  halong: 'Ha Long',
  'cat ba': 'Cat Ba',
  'lan ha': 'Cat Ba',
  sapa: 'Sapa',
  'sa pa': 'Sapa',
  'ha giang': 'Ha Giang',
  'dong van': 'Dong Van',
  hue: 'Hue',
  'da nang': 'Da Nang',
  danang: 'Da Nang',
  'hoi an': 'Hoi An',
  'near hoi an': 'Hoi An',
  'phong nha': 'Phong Nha',
  'nha trang': 'Nha Trang',
  'da lat': 'Da Lat',
  dalat: 'Da Lat',
  'ho chi minh city': 'Ho Chi Minh City',
  saigon: 'Ho Chi Minh City',
  'sài gòn': 'Ho Chi Minh City',
  hcmc: 'Ho Chi Minh City',
  'can tho': 'Can Tho',
  'phu quoc': 'Phu Quoc',
}

function toExchangeCity(value: string | undefined | null): ExchangeCity | null {
  if (!value) return null
  const key = value.trim().toLowerCase()
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  return EXCHANGE_CITY_ORDER.find((city) => city.toLowerCase() === key) ?? null
}

/** Cities implied by sights already in the trip bag. */
export function getTripSightCities(): ExchangeCity[] {
  const { selectedExperienceIds } = useTripStore.getState()
  const cities = new Set<ExchangeCity>()
  for (const id of selectedExperienceIds) {
    const city = toExchangeCity(getExperienceById(id)?.city)
    if (city) cities.add(city)
  }
  return EXCHANGE_CITY_ORDER.filter((city) => cities.has(city))
}
