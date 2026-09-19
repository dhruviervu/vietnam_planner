import { DESTINATIONS } from '../../../BringHome/data/destinations'
import { SIGHT_CATALOG } from '../../data/experiences'
import { SHOPPING_ITEMS, shoppingHours } from '../../data/shopping'
import { getBoundTripStore } from '../../../../store/itineraryTripStore'
import { bucketFromStart } from './clockTimes'
import { resolvePlaceId } from './cityPins'
import { catalogHoursForItem, type PlaceHours } from './openingHours'
import { hopHoursBetween } from './osrmRoute'
import {
  coordForSourceId,
  haversineKm,
  insertSourceIdBetween,
  type PinCoord,
} from './sightOrder'
import { timePreferenceForSourceId } from './sightTiming'
import type { ItineraryItem, PeriodId } from './types'

/** Wait after the hop, before the next sight can start (usually opening hours). */
export const MIN_FREE_MINUTES = 75
const MAX_NEAR_KM = 3.2
const WIDE_NEAR_KM = 10
const MAX_FILL_HOURS = 2.5
const MAX_SUGGESTIONS = 3

export type GapFillKind = 'experience' | 'shopping'

export type GapFillCandidate = {
  id: string
  kind: GapFillKind
  name: string
  city: string
  durationHours: number
  coord: PinCoord
  hours?: PlaceHours
  blurb?: string
}

export type GapFillSuggestion = {
  id: string
  kind: GapFillKind
  name: string
  durationMinutes: number
  kmFrom: number
  blurb: string
}

export function idleMinutesAfterTransit(transitEndHour: number, nextStartHour: number): number {
  return Math.round((nextStartHour - transitEndHour) * 60)
}

export function hasEnoughFreeTime(transitEndHour: number, nextStartHour: number): boolean {
  return idleMinutesAfterTransit(transitEndHour, nextStartHour) >= MIN_FREE_MINUTES
}

function stubItem(id: string, kind: GapFillKind, city: string): ItineraryItem {
  return {
    id,
    sourceId: id,
    kind,
    name: id,
    selectionState: 'selected',
    period: 'afternoon',
    timeLabel: '',
    city,
    region: city,
    costUsd: 0,
    icon: '',
  }
}

function coordForFillId(id: string): PinCoord | null {
  const dest = DESTINATIONS.find((d) => d.id === id || d.itineraryId === id)
  if (dest?.lat != null && dest?.lng != null) {
    return { lat: dest.lat, lng: dest.lng }
  }
  return coordForSourceId(id)
}

let catalogByPlace: Map<string, GapFillCandidate[]> | null = null

function fillCatalogByPlace(): Map<string, GapFillCandidate[]> {
  if (catalogByPlace) return catalogByPlace
  const map = new Map<string, GapFillCandidate[]>()
  const push = (placeId: string | null, row: GapFillCandidate) => {
    if (!placeId) return
    const list = map.get(placeId) ?? []
    list.push(row)
    map.set(placeId, list)
  }
  for (const exp of SIGHT_CATALOG) {
    const durationHours = exp.durationHours || 1.5
    if (durationHours > MAX_FILL_HOURS + 0.05) continue
    const coord = coordForFillId(exp.id)
    if (!coord) continue
    push(resolvePlaceId(exp.city, exp.region), {
      id: exp.id,
      kind: 'experience',
      name: exp.name,
      city: exp.city,
      durationHours: Math.max(0.5, durationHours),
      coord,
      blurb: exp.cardSummary || exp.hook,
    })
  }
  for (const shop of SHOPPING_ITEMS) {
    const coord = coordForFillId(shop.id)
    if (!coord) continue
    push(resolvePlaceId(shop.city, shop.region), {
      id: shop.id,
      kind: 'shopping',
      name: shop.name,
      city: shop.city,
      durationHours: Math.max(0.5, Math.min(MAX_FILL_HOURS, shoppingHours(shop))),
      coord,
      blurb: shop.blurb,
    })
  }
  catalogByPlace = map
  return map
}

export function gapFillCandidatesForCity(
  city: string,
  _weekday: number,
  _isoDate: string,
  excludeIds: Set<string>,
): GapFillCandidate[] {
  const placeId = resolvePlaceId(city)
  if (!placeId) return []
  const rows = fillCatalogByPlace().get(placeId) ?? []
  return rows.filter((row) => !excludeIds.has(row.id))
}

function hoursForCandidate(
  cand: GapFillCandidate,
  weekday: number,
  isoDate: string,
): PlaceHours {
  if (cand.hours) return cand.hours
  return catalogHoursForItem(stubItem(cand.id, cand.kind, cand.city), weekday, isoDate)
}

export function pickGapFillSuggestions(opts: {
  from: PinCoord | null
  to: PinCoord | null
  gapStartHour: number
  gapEndHour: number
  candidates: GapFillCandidate[]
  weekday?: number
  isoDate?: string
  limit?: number
  maxNearKm?: number
}): GapFillSuggestion[] {
  const from = opts.from
  if (!from) return []
  const to = opts.to ?? from
  const available = opts.gapEndHour - opts.gapStartHour
  if (available * 60 < MIN_FREE_MINUTES) return []
  const eveningGap = opts.gapEndHour >= 17.5
  const scored: Array<GapFillSuggestion & { score: number; kind: GapFillKind }> = []

  for (const cand of opts.candidates) {
    if (!eveningGap && timePreferenceForSourceId(cand.id) === 'EVENING') continue
    const kmFrom = haversineKm(from, cand.coord)
    if (kmFrom > (opts.maxNearKm ?? MAX_NEAR_KM)) continue
    const hopIn = hopHoursBetween(from, cand.coord)
    const hopOut = hopHoursBetween(cand.coord, to)
    const need = hopIn + cand.durationHours + hopOut
    if (need > available + 0.08) continue
    const arrive = opts.gapStartHour + hopIn
    const leave = arrive + cand.durationHours
    if (leave > opts.gapEndHour + 0.08) continue
    const hours = hoursForCandidate(cand, opts.weekday ?? 3, opts.isoDate ?? '')
    if (hours.closedToday) continue
    const openAt =
      hours.alwaysOpen || hours.unknown || !hours.intervals?.length
        ? arrive
        : hours.intervals.reduce((best, iv) => {
            const start = Math.max(arrive, iv.open)
            if (start + cand.durationHours <= Math.min(iv.close, opts.gapEndHour) + 0.05) {
              return Math.min(best, start)
            }
            return best
          }, Number.POSITIVE_INFINITY)
    if (!Number.isFinite(openAt) || openAt + cand.durationHours > opts.gapEndHour + 0.08) continue
    const durationMinutes = Math.round(cand.durationHours * 60)
    scored.push({
      id: cand.id,
      kind: cand.kind,
      name: cand.name,
      durationMinutes,
      kmFrom,
      blurb: cand.blurb || `${kmFrom.toFixed(1)} km away · ${durationMinutes} min`,
      score: kmFrom * 4 + cand.durationHours,
    })
    if (scored.length >= 24) break
  }

  scored.sort((a, b) => a.score - b.score || a.kmFrom - b.kmFrom)
  const limit = opts.limit ?? MAX_SUGGESTIONS
  const sights = scored.filter((s) => s.kind === 'experience')
  const shops = scored.filter((s) => s.kind === 'shopping')
  const mixed: typeof scored = []
  let i = 0
  let j = 0
  while (mixed.length < limit && (i < sights.length || j < shops.length)) {
    if (i <= j && i < sights.length) mixed.push(sights[i++])
    else if (j < shops.length) mixed.push(shops[j++])
    else if (i < sights.length) mixed.push(sights[i++])
    else break
  }
  return mixed.slice(0, limit).map(({ score: _s, ...row }) => row)
}

/** Prefer nearby; if the 2–4h window is empty, widen the walk. */
export function pickNearbyGapFills(opts: Parameters<typeof pickGapFillSuggestions>[0]): GapFillSuggestion[] {
  const near = pickGapFillSuggestions(opts)
  if (near.length) return near
  if ((opts.maxNearKm ?? MAX_NEAR_KM) >= WIDE_NEAR_KM) return near
  return pickGapFillSuggestions({ ...opts, maxNearKm: WIDE_NEAR_KM })
}

export function addGapFillToDay(opts: {
  sourceId: string
  kind: GapFillKind
  fromSourceId: string
  toSourceId: string
  slotId: string
  dayNumber: number
  orderedIds: string[]
  startHour: number
}) {
  const store = getBoundTripStore().getState()
  if (opts.kind === 'experience') {
    store.addExperience(opts.sourceId, 'later')
  } else if (!store.selectedShoppingIds.includes(opts.sourceId)) {
    store.toggleShopping(opts.sourceId)
  }
  const period: PeriodId = bucketFromStart(opts.startHour)
  store.setItinerarySlotOverride(opts.sourceId, period)
  store.setItineraryDayOverride(opts.sourceId, opts.dayNumber)
  store.setItineraryDaySlotOverride(opts.sourceId, opts.slotId)
  store.markSightUserPinned(opts.sourceId)
  if (opts.kind === 'experience' && period !== 'night') {
    store.setExperienceSlot(opts.sourceId, period)
  }
  const tourKey = `${opts.slotId}:tour`
  const current = store.itinerarySightOrder[tourKey]
  const base = current?.length ? current : opts.orderedIds
  store.patchItinerarySightOrder({
    [tourKey]: insertSourceIdBetween(base, opts.fromSourceId, opts.toSourceId, opts.sourceId),
  })
}
