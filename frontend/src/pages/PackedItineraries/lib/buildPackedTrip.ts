import { buildYourVietnam } from '../../PlanBuilder/lib/yourVietnam/buildYourVietnam'
import type { PackedTemplate } from '../data/catalogTypes'
import { slotsForTemplate } from './slotsForTemplate'
import { splitSourceIds } from './packHighRoi'
import { slowStartOverridesForTemplate } from './slowSightClocks'

export { slotsForTemplate }

export function buildPackedTrip(template: PackedTemplate, startDate = '') {
  const itineraryDaySlots = slotsForTemplate(template)
  const itineraryDaySlotOverrides: Record<string, string> = {}
  const itinerarySightOrder: Record<string, string[]> = {}
  template.dayPlans.forEach((day, i) => {
    const slotId = itineraryDaySlots[i].id
    itinerarySightOrder[`${slotId}:tour`] = [...day.sourceIds]
    for (const id of day.sourceIds) itineraryDaySlotOverrides[id] = slotId
  })
  const { experienceIds, shoppingIds, activityIds } = splitSourceIds(template.allIds)
  return buildYourVietnam({
    days: template.days,
    startDate,
    travelStyle: template.pace === 'slow' ? 'relaxed' : 'packed',
    holidayKind: template.pace === 'slow' ? 'leisure' : 'action',
    holidayKindKnown: true,
    paceKnown: true,
    groupSize: 2,
    budgetDailyUsd: 60,
    budgetAllocationKnown: true,
    budgetKnown: true,
    experienceIds: experienceIds.length ? experienceIds : template.experienceIds,
    activityIds,
    hotelIds: [],
    chosenStayId: null,
    restaurantIds: [],
    shoppingIds: shoppingIds.length ? shoppingIds : template.shoppingIds,
    transportChoices: {},
    experienceMeta: {},
    itineraryDaySlots,
    itineraryDaySlotOverrides,
    itinerarySightOrder,
    itineraryStartOverrides: slowStartOverridesForTemplate(template, startDate),
    ...(template.pace === 'slow' || template.pace === 'relaxed' ? { dayStartTime: '10:00' } : {}),
    pinsAreSuggestions: true,
  })
}
