import type { ItineraryDaySlot } from '../../PlanBuilder/lib/yourVietnam/types'
import type { PackedTemplate } from '../data/catalogTypes'

export function slotsForTemplate(template: PackedTemplate, ids?: string[]): ItineraryDaySlot[] {
  return template.dayPlans.map((day, i) => ({
    id: ids?.[i] ?? `packed:${template.id}:${i}:${day.placeId}`,
    placeId: day.placeId,
    blank: false,
  }))
}
