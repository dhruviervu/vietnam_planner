import { getActivityById } from '../../PlanBuilder/data/activities'
import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { getHotelById } from '../../PlanBuilder/data/hotels'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { getClusterById } from '../../WhereToStay/data/clusters'
import { useTripStore } from '../../../store/tripStore'
import type { FoodCity } from '../data/types'

const FOOD_CITY_ORDER: FoodCity[] = [
  'Hanoi',
  'Ninh Binh',
  'Hue',
  'Da Nang',
  'Hoi An',
  'Ho Chi Minh City',
  'Nha Trang',
  'Da Lat',
]

const STAY_CITY_TO_FOOD: Record<string, FoodCity> = {
  hanoi: 'Hanoi',
  hcmc: 'Ho Chi Minh City',
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  hue: 'Hue',
  'nha-trang': 'Nha Trang',
  dalat: 'Da Lat',
}

const CITY_ALIASES: Record<string, FoodCity> = {
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
}

function toFoodCity(value: string | undefined | null): FoodCity | null {
  if (!value) return null
  const key = value.trim().toLowerCase()
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  return FOOD_CITY_ORDER.find((city) => city.toLowerCase() === key) ?? null
}

/** Cities implied by experiences, activities and stays already in the trip bag. */
export function getTripFoodCities(): FoodCity[] {
  const state = useTripStore.getState()
  const cities = new Set<FoodCity>()

  for (const id of state.selectedExperienceIds) {
    const city = toFoodCity(getExperienceById(id)?.city)
    if (city) cities.add(city)
  }
  for (const id of state.selectedActivityIds) {
    const city = toFoodCity(getActivityById(id)?.cityName)
    if (city) cities.add(city)
  }
  for (const id of state.selectedHotelIds) {
    const hotel = getHotelById(id)
    const city = toFoodCity(hotel?.city) ?? toFoodCity(hotel?.region)
    if (city) cities.add(city)
  }
  for (const stayId of state.itineraryStayPropertyIds) {
    const stay = STAY_PROPERTY_BY_ID[stayId] ?? state.customStayProperties[stayId]
    if (!stay) continue
    const cluster = getClusterById(stay.clusterId)
    const city = cluster ? STAY_CITY_TO_FOOD[cluster.cityId] : null
    if (city) cities.add(city)
  }

  return FOOD_CITY_ORDER.filter((city) => cities.has(city))
}

export function tripBagHasPlaces(): boolean {
  const state = useTripStore.getState()
  return (
    state.selectedExperienceIds.length > 0 ||
    state.selectedActivityIds.length > 0 ||
    state.selectedHotelIds.length > 0 ||
    state.itineraryStayPropertyIds.length > 0
  )
}
