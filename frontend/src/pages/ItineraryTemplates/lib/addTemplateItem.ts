import type { TransportMode } from '../../PlanBuilder/types'
import { useTripStore } from '../../../store/tripStore'
import type { TemplateSlot, TemplateSlotKind } from './buildTemplateItinerary'

export type TemplateBagSlice = {
  selectedExperienceIds: string[]
  selectedActivityIds: string[]
  selectedRestaurantIds: string[]
  selectedShoppingIds: string[]
  selectedHotelIds: string[]
  itineraryStayPropertyIds: string[]
  transportChoices: Record<string, TransportMode>
}

export function isSlotInBag(slot: TemplateSlot, s: TemplateBagSlice = useTripStore.getState()): boolean {
  if (slot.kind === 'experience' && slot.sourceId) return s.selectedExperienceIds.includes(slot.sourceId)
  if (slot.kind === 'activity' && slot.sourceId) return s.selectedActivityIds.includes(slot.sourceId)
  if (slot.kind === 'meal' && slot.sourceId) return s.selectedRestaurantIds.includes(slot.sourceId)
  if (slot.kind === 'shopping' && slot.sourceId) return s.selectedShoppingIds.includes(slot.sourceId)
  if (slot.kind === 'stay') {
    const hotel = slot.hotelId ? s.selectedHotelIds.includes(slot.hotelId) : false
    const stay = slot.stayId ? s.itineraryStayPropertyIds.includes(slot.stayId) : false
    return hotel || stay
  }
  if (slot.kind === 'city-transfer' && slot.legId && slot.transportMode) {
    return s.transportChoices[slot.legId] === slot.transportMode
  }
  return false
}

export function addTemplateSlot(slot: TemplateSlot) {
  const store = useTripStore.getState()
  if (slot.kind === 'experience' && slot.sourceId) store.addExperience(slot.sourceId)
  if (slot.kind === 'activity' && slot.sourceId) store.addActivity(slot.sourceId)
  if (slot.kind === 'meal' && slot.sourceId && !store.selectedRestaurantIds.includes(slot.sourceId)) {
    store.toggleRestaurant(slot.sourceId)
  }
  if (slot.kind === 'shopping' && slot.sourceId && !store.selectedShoppingIds.includes(slot.sourceId)) {
    store.toggleShopping(slot.sourceId)
  }
  if (slot.kind === 'stay') {
    if (slot.hotelId && !store.selectedHotelIds.includes(slot.hotelId)) store.toggleHotel(slot.hotelId)
    if (slot.stayId && !store.itineraryStayPropertyIds.includes(slot.stayId)) {
      store.toggleItineraryStayProperty(slot.stayId)
    }
  }
  if (slot.kind === 'city-transfer' && slot.legId && slot.transportMode) {
    store.setTransportChoice(slot.legId, slot.transportMode)
  }
}

export function slotCanAdd(kind: TemplateSlotKind) {
  return (
    kind === 'experience' ||
    kind === 'activity' ||
    kind === 'meal' ||
    kind === 'stay' ||
    kind === 'shopping' ||
    kind === 'city-transfer'
  )
}

export function slotHasTarget(slot: TemplateSlot) {
  if (!slotCanAdd(slot.kind)) return false
  if (slot.kind === 'stay') return Boolean(slot.hotelId || slot.stayId)
  if (slot.kind === 'city-transfer') return Boolean(slot.legId && slot.transportMode)
  return Boolean(slot.sourceId)
}
