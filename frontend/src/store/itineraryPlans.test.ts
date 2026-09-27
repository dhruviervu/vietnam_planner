import { describe, expect, it } from 'vitest'
import { daysForItineraryPlan, emptyItineraryPlanning } from './itineraryPlans'
import { sanitizeTripItineraryPlans } from './tripStore'
import { buildYourVietnam } from '../pages/PlanBuilder/lib/yourVietnam/buildYourVietnam'
import type { YourVietnamDay } from '../pages/PlanBuilder/lib/yourVietnam/types'

function emptyDay(overrides: Partial<YourVietnamDay> = {}): YourVietnamDay {
  return {
    day: 1,
    dateLabel: 'Day 1',
    city: 'Hanoi',
    region: 'Hanoi',
    slotId: 'blank-1',
    blank: true,
    placeId: 'hanoi',
    theme: '',
    blurb: '',
    nightsHere: 1,
    experienceCount: 0,
    foodCount: 0,
    transferCount: 0,
    agenda: { sights: [], do: [], eat: [] },
    periods: [
      { id: 'morning', label: 'Morning', windowLabel: '', items: [] },
      { id: 'afternoon', label: 'Afternoon', windowLabel: '', items: [] },
      { id: 'evening', label: 'Evening', windowLabel: '', items: [] },
      { id: 'night', label: 'Night', windowLabel: '', items: [] },
    ],
    costs: { stay: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0, total: 0 },
    issues: [],
    ...overrides,
  }
}

describe('blank itinerary plans', () => {
  it('keeps an empty blank day instead of dropping it', () => {
    const plan = {
      id: 'plan-2',
      name: 'Itinerary 2',
      source: 'blank' as const,
      planning: emptyItineraryPlanning(),
    }
    const days = daysForItineraryPlan([emptyDay()], plan, {
      itinerarySightOrder: {},
      itineraryUserPinnedIds: [],
    })
    expect(days).toHaveLength(1)
    expect(days[0].blank).toBe(true)
  })

  it('does not switch an empty blank plan back to the bag itinerary', () => {
    const patch = sanitizeTripItineraryPlans({
      itineraryPlans: [
        {
          id: 'plan-1',
          name: 'Itinerary 1',
          source: 'bag',
          planning: emptyItineraryPlanning(),
        },
        {
          id: 'plan-2',
          name: 'Itinerary 2',
          source: 'blank',
          planning: {
            ...emptyItineraryPlanning(),
            itineraryDaySlots: [{ id: 'd1', placeId: 'hanoi', blank: true }],
          },
        },
      ],
      activeItineraryPlanId: 'plan-2',
      selectedExperienceIds: ['old-quarter'],
      selectedActivityIds: [],
      itineraryUserPinnedIds: [],
      itinerarySightOrder: {},
      itineraryDaySlots: [{ id: 'd1', placeId: 'hanoi', blank: true }],
    })
    expect(patch.activeItineraryPlanId).toBe('plan-2')
    expect(patch.itineraryDaySlots).toEqual([{ id: 'd1', placeId: 'hanoi', blank: true }])
  })

  it('builds one empty owned day when the bag is ignored', () => {
    const trip = buildYourVietnam({
      days: 14,
      startDate: '2026-09-07',
      travelStyle: 'packed',
      experienceIds: [],
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [{ id: 'blank-day', placeId: 'hanoi', blank: true }],
    })
    expect(trip.isEmpty).toBe(false)
    expect(trip.days).toHaveLength(1)
    expect(trip.days[0].blank).toBe(true)
    expect(trip.days[0].slotId).toBe('blank-day')
    const sightIds = trip.days.flatMap((d) =>
      d.periods.flatMap((p) => p.items.filter((it) => it.kind === 'experience').map((it) => it.sourceId)),
    )
    expect(sightIds).toEqual([])
  })
})
