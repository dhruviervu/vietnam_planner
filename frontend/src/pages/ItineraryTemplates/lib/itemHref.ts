import { experiencesCityPath } from '../../PlanBuilder/services/cityCatalog'
import type { TemplateSlot, TemplateSlotKind } from './buildTemplateItinerary'

export function slotKindHref(kind: TemplateSlotKind, city?: string) {
  if (kind === 'experience') return city ? experiencesCityPath(city) : '/plan/builder/experiences'
  if (kind === 'activity') return '/plan/builder/activities'
  if (kind === 'meal') return '/taste-of-vietnam'
  if (kind === 'stay') return '/where-to-stay'
  if (kind === 'shopping') return '/bring-home'
  return '/getting-around'
}

export function slotItemHref(slot: TemplateSlot): string | null {
  if (slot.kind === 'experience' && slot.sourceId) return `/plan/builder/experience/${slot.sourceId}`
  if (slot.kind === 'activity' && slot.sourceId) return `/plan/builder/activity/${slot.sourceId}`
  if (slot.kind === 'meal') return slot.listingUrl ?? '/taste-of-vietnam'
  if (slot.kind === 'stay') {
    if (slot.clusterId) return `/where-to-stay/neighbourhood/${slot.clusterId}`
    return '/where-to-stay'
  }
  if (slot.kind === 'shopping') return '/bring-home'
  if (slot.kind === 'local-move' || slot.kind === 'city-transfer') return '/getting-around'
  return null
}
