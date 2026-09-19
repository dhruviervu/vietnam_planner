import { experiencesCityPath } from '../../services/citySlug'
import { experiencesUrl } from './links'
import type { PeriodId } from './types'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { haversineKm, insertSourceIdIntoTour } from './sightOrder'
import { getBoundTripStore } from '../../../../store/itineraryTripStore'

const TARGET_KEY = 'yv-itinerary-add-target'
const OCC_KEY = 'yv-itinerary-add-occupancy'
const PERIODS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
const WINDOWS: PeriodId[] = ['morning', 'afternoon', 'evening']

export type PeriodOccupancy = Record<PeriodId, { ids: string[]; leftover: number }>

export type ItineraryAddTarget = {
  day: number
  slotId: string
  period?: PeriodId
}

export function writeItineraryAddTarget(target: ItineraryAddTarget) {
  try {
    localStorage.setItem(TARGET_KEY, JSON.stringify(target))
  } catch {
    /* ignore */
  }
}

export function readItineraryAddTarget(search = window.location.search): ItineraryAddTarget | null {
  const q = new URLSearchParams(search)
  const day = Number(q.get('itineraryDay'))
  const slotId = q.get('itinerarySlot')
  const period = q.get('itineraryPeriod') as PeriodId | null
  if (slotId && Number.isFinite(day) && day > 0) {
    const target: ItineraryAddTarget = {
      day,
      slotId,
      period: period && PERIODS.includes(period) ? period : undefined,
    }
    writeItineraryAddTarget(target)
    return target
  }
  try {
    const raw = localStorage.getItem(TARGET_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ItineraryAddTarget
    if (parsed?.slotId && Number.isFinite(parsed.day) && parsed.day > 0) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function itineraryTargetQuery(target: ItineraryAddTarget): string {
  const q = new URLSearchParams()
  q.set('itineraryDay', String(target.day))
  q.set('itinerarySlot', target.slotId)
  if (target.period) q.set('itineraryPeriod', target.period)
  return q.toString()
}

export function itineraryCityAddHref(
  city: string,
  opts: ItineraryAddTarget,
): string {
  writeItineraryAddTarget(opts)
  return `${experiencesCityPath(city)}?${itineraryTargetQuery(opts)}`
}

export function openCitySightsForItinerary(
  city: string,
  opts: ItineraryAddTarget,
  occupancy?: PeriodOccupancy,
) {
  if (occupancy) writeItineraryPeriodOccupancy(opts.slotId, occupancy)
  window.open(itineraryCityAddHref(city, opts), '_blank')
}

export function openExperiencesForItinerary(opts: ItineraryAddTarget) {
  writeItineraryAddTarget(opts)
  window.open(`${experiencesUrl()}?${itineraryTargetQuery(opts)}`, '_blank')
}

export function writeItineraryPeriodOccupancy(slotId: string, occ: PeriodOccupancy) {
  try {
    localStorage.setItem(OCC_KEY, JSON.stringify({ slotId, occ }))
  } catch {
    /* ignore */
  }
}

function readPeriodOccupancy(slotId: string): PeriodOccupancy | null {
  try {
    const raw = localStorage.getItem(OCC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { slotId?: string; occ?: PeriodOccupancy }
    if (parsed.slotId !== slotId || !parsed.occ) return null
    return parsed.occ
  } catch {
    return null
  }
}

function idsForPeriod(
  period: PeriodId,
  slotId: string,
  occ: PeriodOccupancy | null,
  order: Record<string, string[]>,
  excludeId: string,
) {
  const ids = occ?.[period]?.ids ?? order[`${slotId}:${period}`] ?? []
  return ids.filter((id) => id && id !== excludeId)
}

function pickPeriodForNewSight(sourceId: string, slotId: string, preferred?: PeriodId): PeriodId {
  if (preferred && PERIODS.includes(preferred)) return preferred
  const order = getBoundTripStore().getState().itinerarySightOrder
  const occ = readPeriodOccupancy(slotId)
  const empty = WINDOWS.find((p) => idsForPeriod(p, slotId, occ, order, sourceId).length === 0)
  if (empty) return empty
  const here = PIN_BY_SOURCE_ID[sourceId]
  if (here) {
    let best: PeriodId = 'morning'
    let bestD = Number.POSITIVE_INFINITY
    let bestLeft = Number.NEGATIVE_INFINITY
    for (const p of WINDOWS) {
      const leftover = occ?.[p]?.leftover ?? 0
      for (const id of idsForPeriod(p, slotId, occ, order, sourceId)) {
        const c = PIN_BY_SOURCE_ID[id]
        if (!c) continue
        const d = haversineKm(here, c)
        if (d < bestD - 0.05 || (Math.abs(d - bestD) < 0.05 && leftover > bestLeft)) {
          bestD = d
          best = p
          bestLeft = leftover
        }
      }
    }
    if (bestD < Number.POSITIVE_INFINITY) return best
  }
  if (occ) {
    return WINDOWS.reduce((a, b) => ((occ[a]?.leftover ?? 0) >= (occ[b]?.leftover ?? 0) ? a : b))
  }
  let light: PeriodId = 'morning'
  let n = Number.POSITIVE_INFINITY
  for (const p of WINDOWS) {
    const c = idsForPeriod(p, slotId, occ, order, sourceId).length
    if (c < n) {
      n = c
      light = p
    }
  }
  return light
}

/** Pin a newly bagged sight into the itinerary slot opened from the crafted board. */
export function pinNewSightToItinerary(sourceId: string) {
  const target = readItineraryAddTarget()
  if (!target) return
  const store = getBoundTripStore().getState()
  const period = pickPeriodForNewSight(sourceId, target.slotId, target.period)
  const occ = readPeriodOccupancy(target.slotId)
  const existing = WINDOWS.flatMap((p) => occ?.[p]?.ids ?? [])
  const tourKey = `${target.slotId}:tour`
  const currentTour = store.itinerarySightOrder[tourKey] ?? existing
  const without = currentTour.filter((id) => id && id !== sourceId)
  const spliced = insertSourceIdIntoTour(without, sourceId)
  store.setItinerarySlotOverride(sourceId, period)
  store.setItineraryDayOverride(sourceId, target.day)
  store.setItineraryDaySlotOverride(sourceId, target.slotId)
  // Chosen for this day by hand, so auto day-balancing must not move it later.
  store.markSightUserPinned(sourceId)
  store.patchItinerarySightOrder({
    [tourKey]: spliced,
  })
  if (
    store.selectedExperienceIds.includes(sourceId) &&
    (period === 'morning' || period === 'afternoon' || period === 'evening')
  ) {
    store.setExperienceSlot(sourceId, period)
  }
}
