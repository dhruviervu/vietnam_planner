import { useTripStore, type TripState } from '../../../store/tripStore'
import { emptyItineraryPlanning } from '../../../store/itineraryPlans'
import { slotsForTemplate } from './slotsForTemplate'
import type { PackedTemplate } from '../data/catalogTypes'
import { slowSlotOverridesFromClocks, slowStartOverridesForTemplate } from './slowSightClocks'
import { splitSourceIds } from './packHighRoi'

/** In-memory seed only — never write packed sights into the persisted trip bag. */
export function seedPackedTemplateState(template: PackedTemplate): Partial<TripState> {
  const live = useTripStore.getState()
  const slots = slotsForTemplate(template)
  const itinerarySightOrder: Record<string, string[]> = {}
  const itineraryDaySlotOverrides: Record<string, string> = {}
  const pinned: string[] = []
  template.dayPlans.forEach((day, i) => {
    const slotId = slots[i].id
    itinerarySightOrder[`${slotId}:tour`] = [...day.sourceIds]
    for (const id of day.sourceIds) {
      itineraryDaySlotOverrides[id] = slotId
      pinned.push(id)
    }
  })
  const { experienceIds, shoppingIds, activityIds } = splitSourceIds(template.allIds)
  const itineraryStartOverrides = slowStartOverridesForTemplate(template, live.basics.startDate)
  const itinerarySlotOverrides = slowSlotOverridesFromClocks(itineraryStartOverrides)
  return {
    basics: {
      ...live.basics,
      days: template.days,
      durationKnown: true,
      holidayKind: template.pace === 'slow' ? 'leisure' : 'action',
      holidayKindKnown: true,
      travelStyle: template.pace === 'slow' ? 'relaxed' : 'packed',
      paceKnown: true,
    },
    selectedExperienceIds: experienceIds.length ? experienceIds : [...template.experienceIds],
    selectedShoppingIds: shoppingIds.length ? shoppingIds : [...template.shoppingIds],
    selectedActivityIds: activityIds,
    experienceMeta: {},
    itineraryDaySlots: slots,
    itineraryUserPinnedIds: [...new Set(pinned)],
    itinerarySightOrder,
    itineraryDaySlotOverrides,
    itinerarySlotOverrides,
    itineraryDayOverrides: {},
    itineraryDurationOverrides: {},
    itineraryStartOverrides,
    itineraryNotes: {},
    itineraryBreaks: {},
    itineraryTransitModes: {},
    ...(template.pace === 'slow' || template.pace === 'relaxed' ? { userStartTime: '10:00' } : {}),
    itineraryPlans: [
      {
        id: `packed:${template.id}`,
        name: template.title,
        source: 'blank',
        planning: {
          ...emptyItineraryPlanning(),
          itineraryDaySlots: slots,
          itineraryUserPinnedIds: [...new Set(pinned)],
          itinerarySightOrder,
          itineraryDaySlotOverrides,
          itineraryStartOverrides,
          itinerarySlotOverrides,
        },
      },
    ],
    activeItineraryPlanId: `packed:${template.id}`,
  }
}
