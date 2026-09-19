import { getActivityById } from '../../PlanBuilder/data/activities'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { getHotelById } from '../../PlanBuilder/data/hotels'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { getClusterById } from '../../WhereToStay/data/clusters'
import { useTripStore } from '../../../store/tripStore'
import type { ShopCity } from '../data/types'

const SHOP_CITY_ORDER: ShopCity[] = [
  'Hanoi',
  'Ninh Binh',
  'Sapa',
  'Ha Giang',
  'Dong Van',
  'Ha Long',
  'Cat Ba',
  'Hue',
  'Da Nang',
  'Hoi An',
  'Phong Nha',
  'Nha Trang',
  'Da Lat',
  'Ho Chi Minh City',
  'Can Tho',
  'Phu Quoc',
]

const STAY_CITY_TO_SHOP: Record<string, ShopCity> = {
  hanoi: 'Hanoi',
  hcmc: 'Ho Chi Minh City',
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  hue: 'Hue',
  'nha-trang': 'Nha Trang',
  dalat: 'Da Lat',
  'phu-quoc': 'Phu Quoc',
  sapa: 'Sapa',
  'ha-giang': 'Ha Giang',
  'ha-long': 'Ha Long',
  'ninh-binh': 'Ninh Binh',
  'phong-nha': 'Phong Nha',
  'can-tho': 'Can Tho',
  'cat-ba': 'Cat Ba',
  'dong-van': 'Dong Van',
}

const CITY_ALIASES: Record<string, ShopCity> = {
  hanoi: 'Hanoi',
  'ha noi': 'Hanoi',
  'ninh binh': 'Ninh Binh',
  hue: 'Hue',
  'da nang': 'Da Nang',
  danang: 'Da Nang',
  'hoi an': 'Hoi An',
  'ho chi minh city': 'Ho Chi Minh City',
  saigon: 'Ho Chi Minh City',
  'sài gòn': 'Ho Chi Minh City',
  hcmc: 'Ho Chi Minh City',
  'nha trang': 'Nha Trang',
  'da lat': 'Da Lat',
  dalat: 'Da Lat',
  'phu quoc': 'Phu Quoc',
  sapa: 'Sapa',
  'sa pa': 'Sapa',
  'ha giang': 'Ha Giang',
  'can tho': 'Can Tho',
  'cat ba': 'Cat Ba',
  'dong van': 'Dong Van',
  'ha long': 'Ha Long',
  halong: 'Ha Long',
  'phong nha': 'Phong Nha',
}

function toShopCity(value: string | undefined | null): ShopCity | null {
  if (!value) return null
  const key = value.trim().toLowerCase()
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  return SHOP_CITY_ORDER.find((city) => city.toLowerCase() === key) ?? null
}

/** Cities implied by experiences, activities and stays already in the trip bag. */
export function getTripShopCities(): ShopCity[] {
  const state = useTripStore.getState()
  const cities = new Set<ShopCity>()

  for (const id of state.selectedExperienceIds) {
    const city = toShopCity(getExperienceById(id)?.city)
    if (city) cities.add(city)
  }
  for (const id of state.selectedActivityIds) {
    const city = toShopCity(getActivityById(id)?.cityName)
    if (city) cities.add(city)
  }
  for (const id of state.selectedHotelIds) {
    const hotel = getHotelById(id)
    const city = toShopCity(hotel?.city) ?? toShopCity(hotel?.region)
    if (city) cities.add(city)
  }
  for (const stayId of state.itineraryStayPropertyIds) {
    const stay = STAY_PROPERTY_BY_ID[stayId] ?? state.customStayProperties[stayId]
    if (!stay) continue
    const cluster = getClusterById(stay.clusterId)
    const city = cluster ? STAY_CITY_TO_SHOP[cluster.cityId] : null
    if (city) cities.add(city)
  }

  return SHOP_CITY_ORDER.filter((city) => cities.has(city))
}
