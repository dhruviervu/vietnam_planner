import { DESTINATIONS } from '../../BringHome/data/destinations'
import type { PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'
import { resolvePlaceId } from '../../PlanBuilder/lib/yourVietnam/cityPins'
import {
  hoursOverlapPeriod,
  parseGoogleWeekdayDescriptions,
  parseHoursLabel,
  parseOsmOpeningHours,
  tripIsoDate,
  weekdayFromIso,
  type PlaceHours,
} from '../../PlanBuilder/lib/yourVietnam/openingHours'
import { useTripStore } from '../../../store/tripStore'
import { insertSourceIdIntoTour } from '../../PlanBuilder/lib/yourVietnam/sightOrder'

export type ShopPeriodSlot = 'morning' | 'afternoon' | 'evening' | 'night'

export const SHOP_PERIOD_OPTIONS: { id: ShopPeriodSlot; label: string; hint: string }[] = [
  { id: 'morning', label: 'Morning', hint: '08:00–13:00' },
  { id: 'afternoon', label: 'Afternoon', hint: '13:00–17:30' },
  { id: 'evening', label: 'Evening', hint: '17:30–19:30' },
  { id: 'night', label: 'Night', hint: '19:30–22:00' },
]

const PERIOD_START: Record<ShopPeriodSlot, string> = {
  morning: '09:00',
  afternoon: '14:00',
  evening: '18:00',
  night: '20:00',
}

export function destinationByItineraryId(id: string) {
  return DESTINATIONS.find((d) => d.id === id || d.itineraryId === id)
}

export function catalogHoursForDestination(id: string, weekday: number): PlaceHours {
  const d = destinationByItineraryId(id)
  if (!d) return parseHoursLabel('', weekday)
  if (d.weekdayDescriptions?.length) {
    return parseGoogleWeekdayDescriptions(d.weekdayDescriptions, weekday)
  }
  if (d.hoursRaw) {
    if (/Mo|Tu|We|Th|Fr|Sa|Su|24\/7/i.test(d.hoursRaw)) {
      return parseOsmOpeningHours(d.hoursRaw, weekday)
    }
    return parseHoursLabel(d.hoursRaw, weekday)
  }
  if (d.hoursUnknown || /hours vary/i.test(d.openingHours)) {
    return parseHoursLabel('', weekday)
  }
  return parseHoursLabel(d.openingHours, weekday)
}

export function itineraryWeekdayForPlace(city?: string): { weekday: number; iso: string } {
  const store = useTripStore.getState()
  const start = store.basics.startDate
  const placeId = resolvePlaceId(city)
  const slots = store.itineraryDaySlots
  const hit =
    (placeId ? slots?.find((s) => !s.blank && s.placeId === placeId) : undefined) ??
    slots?.find((s) => !s.blank)
  const day = hit && slots ? slots.findIndex((s) => s.id === hit.id) + 1 : 1
  const iso = tripIsoDate(start, day)
  return { weekday: weekdayFromIso(iso), iso }
}

export function shopPeriodOpen(id: string, period: PeriodId): boolean {
  const d = destinationByItineraryId(id)
  const { weekday } = itineraryWeekdayForPlace(d?.city)
  const hours = catalogHoursForDestination(id, weekday)
  if (hours.unknown || hours.alwaysOpen) return true
  if (hours.closedToday) return false
  return hoursOverlapPeriod(hours, period, 0.4)
}

export function addShopToItinerary(shopId: string, period: ShopPeriodSlot) {
  if (!shopPeriodOpen(shopId, period)) return
  const store = useTripStore.getState()
  if (!store.selectedShoppingIds.includes(shopId)) {
    store.toggleShopping(shopId)
  }
  store.setItinerarySlotOverride(shopId, period)
  store.setItineraryStartOverride(shopId, PERIOD_START[period])
  store.setItineraryDurationOverride(shopId, period === 'night' ? 1 : 1.25)
  store.markSightUserPinned(shopId)

  const dest = destinationByItineraryId(shopId)
  const placeId = resolvePlaceId(dest?.city)
  const slots = store.itineraryDaySlots
  const hit =
    (placeId ? slots?.find((s) => !s.blank && s.placeId === placeId) : undefined) ??
    slots?.find((s) => !s.blank)
  if (!hit || !slots) return

  const day = slots.findIndex((s) => s.id === hit.id) + 1
  store.setItineraryDaySlotOverride(shopId, hit.id)
  store.setItineraryDayOverride(shopId, day)
  const tourKey = `${hit.id}:tour`
  const tour = store.itinerarySightOrder[tourKey] ?? []
  store.patchItinerarySightOrder({
    [tourKey]: insertSourceIdIntoTour(tour.filter((id) => id && id !== shopId), shopId),
  })
}

export function removeShopFromItinerary(shopId: string) {
  const store = useTripStore.getState()
  if (store.selectedShoppingIds.includes(shopId)) {
    store.toggleShopping(shopId)
  }
}
