import { RESTAURANTS as PLAN_RESTAURANTS } from '../../PlanBuilder/data/restaurants'
import type { PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'
import { resolvePlaceId } from '../../PlanBuilder/lib/yourVietnam/cityPins'
import {
  catalogHoursForSource,
  hoursOverlapPeriod,
  tripIsoDate,
  weekdayFromIso,
} from '../../PlanBuilder/lib/yourVietnam/openingHours'
import { useTripStore } from '../../../store/tripStore'
import { RESTAURANTS as TASTE_RESTAURANTS } from '../data/restaurants'

export type RestaurantMealSlot = 'breakfast' | 'lunch' | 'dinner'

export const RESTAURANT_MEAL_OPTIONS: { id: RestaurantMealSlot; label: string; hint: string }[] = [
  { id: 'breakfast', label: 'Breakfast', hint: 'Before the first sight' },
  { id: 'lunch', label: 'Lunch', hint: 'Around 13:00' },
  { id: 'dinner', label: 'Dinner', hint: 'Around 19:30' },
]

const MEAL_PERIOD: Record<RestaurantMealSlot, PeriodId> = {
  breakfast: 'morning',
  lunch: 'afternoon',
  dinner: 'night',
}

const MEAL_START: Record<RestaurantMealSlot, string> = {
  breakfast: '08:00',
  lunch: '13:00',
  dinner: '19:30',
}

function restaurantCity(id: string): string | undefined {
  const taste = TASTE_RESTAURANTS.find((r) => r.id === id)
  if (taste) return taste.city
  return PLAN_RESTAURANTS.find((r) => r.id === id)?.city
}

export function restaurantMealOpen(restaurantId: string, meal: RestaurantMealSlot): boolean {
  const store = useTripStore.getState()
  const placeId = resolvePlaceId(restaurantCity(restaurantId))
  const slots = store.itineraryDaySlots
  const hit =
    (placeId ? slots?.find((s) => !s.blank && s.placeId === placeId) : undefined) ??
    slots?.find((s) => !s.blank)
  const day = hit && slots ? slots.findIndex((s) => s.id === hit.id) + 1 : 1
  const weekday = weekdayFromIso(tripIsoDate(store.basics.startDate, day))
  const hours = catalogHoursForSource('meal', restaurantId, weekday)
  if (hours.unknown || hours.alwaysOpen) return true
  if (hours.closedToday) return false
  return hoursOverlapPeriod(hours, MEAL_PERIOD[meal], meal === 'breakfast' ? 0.75 : 0.6)
}

export function insertMealIdInTour(
  tour: string[],
  restaurantId: string,
  meal: RestaurantMealSlot,
) {
  const next = tour.filter((id) => id && id !== restaurantId)
  if (meal === 'breakfast') return [restaurantId, ...next]
  if (meal === 'dinner') return [...next, restaurantId]
  const idx = Math.min(next.length, Math.max(1, Math.ceil(next.length * 0.5)))
  return [...next.slice(0, idx), restaurantId, ...next.slice(idx)]
}

export function addRestaurantToItinerary(restaurantId: string, meal: RestaurantMealSlot) {
  if (!restaurantMealOpen(restaurantId, meal)) return
  const store = useTripStore.getState()
  if (!store.selectedRestaurantIds.includes(restaurantId)) {
    store.toggleRestaurant(restaurantId)
  }
  store.setRestaurantMealSlot(restaurantId, meal)
  store.setItinerarySlotOverride(restaurantId, MEAL_PERIOD[meal])
  store.setItineraryStartOverride(restaurantId, MEAL_START[meal])
  store.setItineraryDurationOverride(restaurantId, meal === 'breakfast' ? 1.5 : 1)
  store.markSightUserPinned(restaurantId)

  const placeId = resolvePlaceId(restaurantCity(restaurantId))
  const slots = store.itineraryDaySlots
  const hit =
    (placeId ? slots?.find((s) => !s.blank && s.placeId === placeId) : undefined) ??
    slots?.find((s) => !s.blank)
  if (!hit || !slots) return

  const day = slots.findIndex((s) => s.id === hit.id) + 1
  store.setItineraryDaySlotOverride(restaurantId, hit.id)
  store.setItineraryDayOverride(restaurantId, day)
  const tourKey = `${hit.id}:tour`
  const tour = store.itinerarySightOrder[tourKey] ?? []
  store.patchItinerarySightOrder({
    [tourKey]: insertMealIdInTour(tour, restaurantId, meal),
  })
}

export function removeRestaurantFromItinerary(restaurantId: string) {
  const store = useTripStore.getState()
  if (store.selectedRestaurantIds.includes(restaurantId)) {
    store.toggleRestaurant(restaurantId)
  }
}
