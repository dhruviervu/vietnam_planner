import { useMemo, useRef } from 'react'
import {
  catalogHoursForSource,
  weekdayFromIso,
  type PlaceHours,
} from './openingHours'
import type { ItineraryItem } from './types'

export function hoursMapForItems(
  items: ItineraryItem[],
  isoDate: string,
): Record<string, PlaceHours> {
  const dated = Boolean(isoDate)
  const weekday = dated ? weekdayFromIso(isoDate) : 3
  const out: Record<string, PlaceHours> = {}
  for (const item of items) {
    if (!item.sourceId) continue
    const hours = catalogHoursForSource(
      item.kind,
      item.sourceId,
      weekday,
      dated ? isoDate : undefined,
    )
    out[item.sourceId] = dated ? hours : { ...hours, closedToday: false }
  }
  return out
}

/** Kept for callers; hours come from the static Google snapshot, not a live refetch. */
export async function prefetchTripOpeningHours(
  _experienceIds: string[],
  _activityIds: string[],
): Promise<void> {
  return
}

export function useLiveOpeningHours(items: ItineraryItem[], isoDate: string): Record<string, PlaceHours> {
  const ids = items
    .map((it) => it.sourceId)
    .filter(Boolean)
    .slice()
    .sort()
    .join('|')
  const itemsRef = useRef(items)
  itemsRef.current = items
  return useMemo(() => hoursMapForItems(itemsRef.current, isoDate), [ids, isoDate])
}
