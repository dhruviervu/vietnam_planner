import type {
  ItineraryBreak,
  ItineraryDaySlot,
  PeriodId,
  YourVietnamDay,
} from '../pages/PlanBuilder/lib/yourVietnam/types'
import { isSight } from '../pages/PlanBuilder/lib/yourVietnam/layoutDay'
import type { TransportModeId } from '../pages/PlanBuilder/lib/yourVietnam/osrmRoute'

export type ItineraryPlanSource = 'bag' | 'blank'

export type ItineraryPlanPlanning = {
  itinerarySlotOverrides: Record<string, PeriodId>
  itineraryDayOverrides: Record<string, number>
  itineraryDaySlotOverrides: Record<string, string>
  itineraryUserPinnedIds: string[]
  itinerarySightOrder: Record<string, string[]>
  itineraryDurationOverrides: Record<string, number>
  itineraryStartOverrides: Record<string, string>
  itineraryNotes: Record<string, string>
  itineraryBreaks: Record<string, ItineraryBreak[]>
  itineraryTransitModes: Record<string, TransportModeId>
  itineraryDaySlots: ItineraryDaySlot[] | null
}

export type ItineraryPlan = {
  id: string
  name: string
  source: ItineraryPlanSource
  planning: ItineraryPlanPlanning
}

export function emptyItineraryPlanning(): ItineraryPlanPlanning {
  return {
    itinerarySlotOverrides: {},
    itineraryDayOverrides: {},
    itineraryDaySlotOverrides: {},
    itineraryUserPinnedIds: [],
    itinerarySightOrder: {},
    itineraryDurationOverrides: {},
    itineraryStartOverrides: {},
    itineraryNotes: {},
    itineraryBreaks: {},
    itineraryTransitModes: {},
    itineraryDaySlots: null,
  }
}

export function defaultItineraryPlans(): ItineraryPlan[] {
  return [
    {
      id: 'plan-1',
      name: 'Itinerary 1',
      source: 'bag',
      planning: emptyItineraryPlanning(),
    },
  ]
}

export const ITINERARY_TEMPLATES_TAB = '/plan/itinerary-ideas'

export function openItineraryTemplatesTab() {
  window.open(ITINERARY_TEMPLATES_TAB, '_blank', 'noopener,noreferrer')
}

/** Blank workspaces start empty; only sights the traveller added to that plan stay. */
export function daysForItineraryPlan(
  days: YourVietnamDay[],
  plan: ItineraryPlan | undefined,
  livePlanning: Pick<ItineraryPlanPlanning, 'itinerarySightOrder' | 'itineraryUserPinnedIds'>,
  bagSourceIds?: Set<string>,
): YourVietnamDay[] {
  if (!plan || plan.source === 'bag') {
    if (!bagSourceIds) return days
    const mapped = days.map((day) => ({
      ...day,
      periods: day.periods.map((period) => ({
        ...period,
        items: period.items.filter((item) => !isSight(item) || Boolean(item.sourceId && bagSourceIds.has(item.sourceId))),
      })),
      agenda: {
        sights: day.agenda.sights.filter((row) => row.sourceId && bagSourceIds.has(row.sourceId)),
        do: day.agenda.do.filter((row) => row.sourceId && bagSourceIds.has(row.sourceId)),
        eat: day.agenda.eat,
      },
    }))
    return mapped.filter((day) =>
      day.periods.some((period) =>
        period.items.some(
          (item) =>
            item.kind === 'experience' || item.kind === 'activity' || item.kind === 'shopping',
        ),
      ),
    )
  }
  const allowed = new Set<string>([
    ...livePlanning.itineraryUserPinnedIds,
    ...Object.values(livePlanning.itinerarySightOrder).flat(),
  ])
  const mapped = days.map((day) => ({
    ...day,
    periods: day.periods.map((period) => ({
      ...period,
      items: period.items.filter((item) => !isSight(item) || Boolean(item.sourceId && allowed.has(item.sourceId))),
    })),
    agenda: {
      sights: day.agenda.sights.filter((row) => row.sourceId && allowed.has(row.sourceId)),
      do: day.agenda.do.filter((row) => row.sourceId && allowed.has(row.sourceId)),
      eat: day.agenda.eat,
    },
  }))
  if (plan.source === 'blank') return mapped
  const kept = mapped.filter((day) =>
    day.periods.some((period) =>
      period.items.some(
        (item) =>
          item.kind === 'experience' || item.kind === 'activity' || item.kind === 'shopping',
      ),
    ),
  )
  return kept
}
