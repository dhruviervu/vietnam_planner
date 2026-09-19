import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { shoppingHoursForId } from '../../data/shopping'
import { activityHours, occupancyFamilyActivity, occupancyFamilyExperience } from './tripIntelligence'
import { sightRoi } from './sightSwap'
import {
  coordForItem,
  farHopKm,
  haversineKm,
  orderSightsByProximity,
  type PinCoord,
} from './sightOrder'
import {
  catalogHoursForItem,
  hoursOverlapPeriod,
  latestClose,
  mergeHours,
  type PlaceHours,
} from './openingHours'
import { PERIOD_FLOW } from './dayWindows'
import type { DayPeriod, ItineraryItem, PeriodId } from './types'

export type ArrivalSlot = 'morning' | 'afternoon' | 'evening' | 'night'

export const PERIOD_CAP: Record<PeriodId, number> = {
  morning: 12,
  afternoon: 12,
  evening: 12,
  night: 12,
}

export type TransferSlot = 'morning' | 'afternoon' | 'evening'

const EVENING_LIGHT_MAX = 2
const FOODISH = new Set(['cafe', 'cooking', 'food-tour'])
const SIGHTS_PER_PERIOD_MIN = 2
const SIGHTS_PER_PERIOD_MAX = 12

export function leftoverAfter(slot: TransferSlot): PeriodId[] {
  if (slot === 'morning') return ['afternoon', 'evening']
  if (slot === 'afternoon') return ['evening']
  return []
}

export function usablePeriods(slot: TransferSlot | null): PeriodId[] {
  if (slot === 'morning') return []
  if (slot === 'afternoon') return ['morning']
  return ['morning', 'afternoon', 'evening']
}

export function arrivalUsable(slot: ArrivalSlot): PeriodId[] {
  if (slot === 'morning') return ['morning', 'afternoon', 'evening']
  if (slot === 'afternoon') return ['afternoon', 'evening']
  if (slot === 'evening') return ['evening']
  return []
}

export function arrivalCaps(slot: ArrivalSlot): Partial<Record<PeriodId, number>> {
  if (slot === 'morning') return { morning: 2.5 }
  if (slot === 'afternoon') return { afternoon: 2.5 }
  return {}
}

export function intersectPeriods(a: PeriodId[], b: PeriodId[]): PeriodId[] {
  return a.filter((id) => b.includes(id))
}

export function windowHours(slot: TransferSlot | null, periods?: PeriodId[]): number {
  const list = periods ?? usablePeriods(slot)
  return list.reduce((sum, id) => sum + (PERIOD_CAP[id] ?? 0), 0)
}

export function itemHours(item: ItineraryItem): number {
  if (item.kind === 'meal') return /breakfast/i.test(item.name ?? '') ? 1.5 : 1
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp?.durationHours) return exp.durationHours
  }
  if (item.kind === 'activity' && item.sourceId) {
    const act = CITY_ACTIVITIES.find((a) => a.id === item.sourceId)
    if (act) return activityHours(act)
  }
  if (item.kind === 'shopping' && item.sourceId) {
    const shopHours = shoppingHoursForId(item.sourceId)
    if (shopHours != null) return shopHours
  }
  const label = item.durationLabel?.toLowerCase() ?? ''
  if (/half\s*day/.test(label)) return 4
  if (/full\s*day/.test(label)) return 7
  const nums = item.durationLabel?.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? []
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2
  if (nums.length === 1) return Math.max(nums[0], 1.25)
  return 1.5
}

export function itemRoi(item: ItineraryItem): number {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) return sightRoi(exp)
  }
  if (item.kind === 'activity') return 12
  return 0
}

export function reviewRoi(item: ItineraryItem): number {
  if (item.kind === 'experience' && item.sourceId) {
    return catalogReviewRoi('experience', item.sourceId)
  }
  if (item.kind === 'activity' && item.sourceId) {
    return catalogReviewRoi('activity', item.sourceId)
  }
  return 0
}

export function catalogReviewRoi(kind: 'experience' | 'activity', id: string): number {
  if (kind === 'experience') {
    const exp = EXPERIENCES.find((e) => e.id === id)
    if (exp) return exp.rating * Math.log10(1 + (exp.reviewCount ?? 0))
  }
  if (kind === 'activity') {
    const act = CITY_ACTIVITIES.find((a) => a.id === id)
    if (act) return (act.rating ?? 4.5) * Math.log10(1 + 80)
  }
  return 0
}

export function catalogItemHours(kind: 'experience' | 'activity' | 'restaurant', id: string): number {
  if (kind === 'experience') {
    const exp = EXPERIENCES.find((e) => e.id === id)
    return exp?.durationHours || 2.5
  }
  if (kind === 'activity') {
    const act = CITY_ACTIVITIES.find((a) => a.id === id)
    return act ? activityHours(act) : 2.5
  }
  return 1
}

export function sumSightHours(items: ItineraryItem[]): number {
  return items
    .filter((it) => it.kind === 'experience' || it.kind === 'activity' || it.kind === 'shopping')
    .reduce((sum, it) => sum + itemHours(it), 0)
}

function itemFamily(item: ItineraryItem) {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    return exp ? occupancyFamilyExperience(exp) : null
  }
  if (item.kind === 'activity' && item.sourceId) {
    const act = CITY_ACTIVITIES.find((a) => a.id === item.sourceId)
    return act ? occupancyFamilyActivity(act) : null
  }
  return null
}

function isFoodish(item: ItineraryItem) {
  const fam = itemFamily(item)
  return Boolean(fam && FOODISH.has(fam))
}

function isCooking(item: ItineraryItem) {
  return itemFamily(item) === 'cooking'
}

export type LayoutOpts = {
  start?: PinCoord | null
  caps?: Partial<Record<PeriodId, number>>
  pinSourceIds?: Set<string>
  reserved?: Partial<Record<PeriodId, number>>
  occupiedCounts?: Partial<Record<PeriodId, number>>
  hoursBySourceId?: Record<string, PlaceHours>
  weekday?: number
}

export function pickAnchorSight(sights: ItineraryItem[]): ItineraryItem | null {
  if (sights.length === 0) return null
  return [...sights].sort((a, b) => {
    const dh = itemHours(b) - itemHours(a)
    if (Math.abs(dh) > 0.05) return dh
    return reviewRoi(b) - reviewRoi(a)
  })[0]
}

/** Shortest-travel tour of the day's pins so agenda and map follow the same path. */
export function orderDaySightsForDisplay(sights: ItineraryItem[]): ItineraryItem[] {
  if (sights.length === 0) return []
  return orderSightsByProximity(sights)
}

export function includesOnboardMeal(item: ItineraryItem): boolean {
  const hours = itemHours(item)
  let name = item.name
  let dna = ''
  let about = item.description ?? ''
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) {
      name = exp.name
      dna = (exp.dna ?? []).join(' ')
      about = `${exp.about} ${exp.cardSummary}`
    }
  }
  const blob = `${item.sourceId ?? ''} ${name} ${dna} ${about} ${item.durationLabel ?? ''}`.toLowerCase()
  if (/lunch on board|on.?board/.test(blob) && /lunch/.test(blob)) return true
  const cruiseOrFull = /cruise/.test(blob) || /full\s*day/.test(blob)
  return cruiseOrFull && hours > 5
}

export type LayoutPlacement = {
  item: ItineraryItem
  startPeriod: PeriodId
  hours: number
  continuesThrough: PeriodId[]
  overflow: boolean
}

export function spanNoteFor(placement: LayoutPlacement): string | undefined {
  if (placement.overflow || placement.continuesThrough.length === 0) return undefined
  const through = placement.continuesThrough.join(' and ')
  return `This takes ~${Math.round(placement.hours)} hrs — continues through the ${through}.`
}

function capFor(
  period: PeriodId,
  caps: Partial<Record<PeriodId, number>> | undefined,
): number {
  return caps?.[period] ?? PERIOD_CAP[period] ?? 0
}

function fitOrder(item: ItineraryItem): PeriodId[] {
  if (isCooking(item)) return ['morning', 'afternoon', 'evening']
  if (isFoodish(item)) return ['morning', 'evening']
  if (itemFamily(item) === 'nightlife') return ['evening']
  return PERIOD_FLOW
}

function hoursFor(item: ItineraryItem, opts?: LayoutOpts): PlaceHours {
  const weekday = opts?.weekday ?? new Date().getDay()
  const catalog = catalogHoursForItem(item, weekday)
  const live = item.sourceId ? opts?.hoursBySourceId?.[item.sourceId] : undefined
  return mergeHours(live, catalog)
}

function slotQuality(item: ItineraryItem) {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) return exp.slotQuality
  }
  return { morning: 3, afternoon: 3, evening: 3 }
}

function allowedPeriods(item: ItineraryItem, usable: PeriodId[], opts?: LayoutOpts): PeriodId[] {
  const hours = hoursFor(item, opts)
  const dur = itemHours(item)
  const q = slotQuality(item)
  const order = fitOrder(item)
  return order.filter((period) => {
    if (!usable.includes(period)) return false
    if (period === 'evening' && dur > EVENING_LIGHT_MAX && dur <= 4.05) return false
    if (period === 'afternoon' && isFoodish(item) && !isCooking(item)) return false
    if (hours.closedToday) return hoursOverlapPeriod(hours, period, 0.5)
    if (!hoursOverlapPeriod(hours, period, Math.min(0.7, dur))) return false
    if (period === 'evening' && q.evening <= 2 && q.morning >= 4 && q.afternoon >= 3) return false
    return true
  })
}

function isLongSight(item: ItineraryItem) {
  return itemHours(item) > 4.05
}

function isMorningLocked(item: ItineraryItem, usable: PeriodId[], opts?: LayoutOpts) {
  const hours = hoursFor(item, opts)
  const allowed = allowedPeriods(item, usable, opts)
  const q = slotQuality(item)
  if (allowed.length === 1 && allowed[0] === 'morning') return true
  if (hours.intervals && latestClose(hours) <= 13.05 && allowed.includes('morning')) return true
  if (q.morning >= 4 && q.afternoon <= 2 && q.evening <= 2 && allowed.includes('morning')) return true
  return false
}

function isEveningLocked(item: ItineraryItem, usable: PeriodId[], opts?: LayoutOpts) {
  const allowed = allowedPeriods(item, usable, opts)
  const q = slotQuality(item)
  if (allowed.length > 0 && allowed.every((p) => p === 'evening')) return true
  if (q.evening >= 4 && q.morning <= 2 && q.afternoon <= 2 && allowed.includes('evening')) return true
  return false
}

function distTo(from: PinCoord | null, item: ItineraryItem) {
  const c = coordForItem(item)
  if (!from || !c) return 6
  return haversineKm(from, c)
}

function distributeCounts(n: number, periods: PeriodId[]): Record<PeriodId, number> {
  const out: Record<PeriodId, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  if (n <= 0 || periods.length === 0) return out
  let left = n
  for (const p of periods) {
    const give = Math.min(SIGHTS_PER_PERIOD_MIN, left)
    out[p] = give
    left -= give
  }
  for (const p of periods) {
    if (left <= 0) break
    if (out[p] > 0 && out[p] < SIGHTS_PER_PERIOD_MAX) {
      out[p] += 1
      left -= 1
    }
  }
  for (const p of periods) {
    while (left > 0 && out[p] < SIGHTS_PER_PERIOD_MAX) {
      out[p] += 1
      left -= 1
    }
  }
  return out
}

export function layoutSightsByDuration(
  sights: ItineraryItem[],
  usable: PeriodId[],
  opts?: LayoutOpts,
): {
  placed: LayoutPlacement[]
  overflow: LayoutPlacement[]
  remaining: Record<PeriodId, number>
} {
  const remaining: Record<PeriodId, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  }
  for (const id of usable) {
    remaining[id] = Math.max(0, capFor(id, opts?.caps) - (opts?.reserved?.[id] ?? 0))
  }

  const placed: LayoutPlacement[] = []
  const overflow: LayoutPlacement[] = []
  const counts: Record<PeriodId, number> = {
    morning: opts?.occupiedCounts?.morning ?? 0,
    afternoon: opts?.occupiedCounts?.afternoon ?? 0,
    evening: opts?.occupiedCounts?.evening ?? 0,
    night: opts?.occupiedCounts?.night ?? 0,
  }

  const hops: number[] = []
  const geo = orderSightsByProximity(sights)
  for (let i = 1; i < geo.length; i++) {
    hops.push(distTo(coordForItem(geo[i - 1]), geo[i]))
  }
  const farKm = farHopKm(hops)

  const placeIn = (item: ItineraryItem, period: PeriodId, hours: number) => {
    remaining[period] -= hours
    counts[period] += 1
    placed.push({ item, startPeriod: period, hours, continuesThrough: [], overflow: false })
  }

  const placeSpan = (item: ItineraryItem): boolean => {
    const hours = itemHours(item)
    const allowed = allowedPeriods(item, usable, opts)
    const snapshot = { ...remaining }
    let need = hours
    let startPeriod: PeriodId | null = null
    const continuesThrough: PeriodId[] = []
    for (const period of PERIOD_FLOW) {
      if (!usable.includes(period) || remaining[period] <= 0.05) {
        if (startPeriod) break
        continue
      }
      if (!startPeriod) {
        if (!allowed.includes(period)) continue
        if (period === 'evening' && hours > EVENING_LIGHT_MAX) continue
        if (counts[period] >= SIGHTS_PER_PERIOD_MAX) continue
        startPeriod = period
      } else {
        continuesThrough.push(period)
      }
      const take = Math.min(remaining[period], need)
      remaining[period] -= take
      need -= take
      if (need <= 0.05) break
    }
    if (startPeriod && need <= 0.05) {
      counts[startPeriod] += 1
      placed.push({ item, startPeriod, hours, continuesThrough, overflow: false })
      return true
    }
    Object.assign(remaining, snapshot)
    return false
  }

  const nextPeriodOf = (period: PeriodId): PeriodId | null => {
    const i = PERIOD_FLOW.indexOf(period)
    const nxt = PERIOD_FLOW[i + 1]
    return nxt && usable.includes(nxt) ? nxt : null
  }

  const canShortSpan = (item: ItineraryItem, period: PeriodId) => {
    const hours = itemHours(item)
    const extra = hours - remaining[period]
    if (extra <= 0.08) return remaining[period] + 0.08 >= hours
    if (remaining[period] < 0.7 || extra > 1.4) return false
    const nxt = nextPeriodOf(period)
    if (!nxt || remaining[nxt] + 0.05 < extra) return false
    return allowedPeriods(item, usable, opts).includes(period)
  }

  const placeSpanFrom = (item: ItineraryItem, startAt: PeriodId): boolean => {
    const hours = itemHours(item)
    const snapshot = { ...remaining }
    let need = hours
    const continuesThrough: PeriodId[] = []
    let started = false
    for (const period of PERIOD_FLOW) {
      if (!usable.includes(period) || remaining[period] <= 0.05) {
        if (started) break
        continue
      }
      if (!started) {
        if (period !== startAt) continue
        started = true
      } else {
        continuesThrough.push(period)
      }
      const take = Math.min(remaining[period], need)
      remaining[period] -= take
      need -= take
      if (need <= 0.05) break
    }
    if (started && need <= 0.05) {
      counts[startAt] += 1
      placed.push({ item, startPeriod: startAt, hours, continuesThrough, overflow: false })
      return true
    }
    Object.assign(remaining, snapshot)
    return false
  }

  const canFit = (item: ItineraryItem, period: PeriodId) => {
    const hours = itemHours(item)
    if (!usable.includes(period)) return false
    if (!allowedPeriods(item, usable, opts).includes(period)) return false
    if (counts[period] >= SIGHTS_PER_PERIOD_MAX) return false
    if (period === 'evening' && hours > EVENING_LIGHT_MAX) return false
    if (remaining[period] + 0.08 >= hours) return true
    return false
  }

  const pickNearest = (pool: ItineraryItem[], period: PeriodId, from: PinCoord | null) => {
    const rows = pool
      .map((item, i) => ({ item, i, d: distTo(from, item) }))
      .filter(
        (row) =>
          allowedPeriods(row.item, usable, opts).includes(period) &&
          counts[period] < SIGHTS_PER_PERIOD_MAX &&
          !(period === 'evening' && itemHours(row.item) > EVENING_LIGHT_MAX),
      )
    if (rows.length === 0) return -1
    rows.sort((a, b) => a.d - b.d)
    const fully = rows.filter((row) => canFit(row.item, period))
    const nearest = rows[0]
    if (counts[period] < SIGHTS_PER_PERIOD_MIN) {
      if (canFit(nearest.item, period)) return nearest.i
      if (nearest.d < 2.5 && canShortSpan(nearest.item, period)) return nearest.i
      if (fully[0]) return fully[0].i
      if (canShortSpan(nearest.item, period)) return nearest.i
      return -1
    }
    if (fully[0]) return fully[0].i
    return -1
  }

  const packPeriod = (
    period: PeriodId,
    pool: ItineraryItem[],
    from: PinCoord | null,
    addTarget: number,
  ): PinCoord | null => {
    if (!usable.includes(period)) return from
    if (addTarget <= 0 && counts[period] >= SIGHTS_PER_PERIOD_MIN) return from
    let cursor = from
    let added = 0
    while (pool.length && counts[period] < SIGHTS_PER_PERIOD_MAX) {
      if (added >= addTarget && counts[period] >= SIGHTS_PER_PERIOD_MIN) break
      const idx = pickNearest(pool, period, cursor)
      if (idx < 0) break
      const item = pool[idx]
      const hop = distTo(cursor, item)
      if (added >= addTarget && hop > farKm * 0.85) break
      if (counts[period] >= SIGHTS_PER_PERIOD_MIN && hop > farKm) break
      pool.splice(idx, 1)
      const hours = itemHours(item)
      if (remaining[period] + 0.08 >= hours) {
        placeIn(item, period, hours)
      } else if (!placeSpanFrom(item, period)) {
        pool.splice(idx, 0, item)
        break
      }
      cursor = coordForItem(item) ?? cursor
      added += 1
    }
    return cursor
  }

  const pool = [...sights]
  const earlyMorning = pool.filter((it) => isMorningLocked(it, usable, opts) && !isLongSight(it))
  const longs = pool.filter(isLongSight).sort((a, b) => itemHours(b) - itemHours(a))
  const eveningLocked = pool.filter((it) => isEveningLocked(it, usable, opts) && !isLongSight(it))

  const take = (item: ItineraryItem) => {
    const i = pool.findIndex((x) => x.id === item.id)
    if (i >= 0) pool.splice(i, 1)
  }

  let cursor = opts?.start ?? null
  const morningTour = orderSightsByProximity(earlyMorning)
  const morningStart = morningTour[0] ?? null
  if (morningStart) cursor = coordForItem(morningStart) ?? cursor

  for (const item of morningTour) {
    take(item)
    if (canFit(item, 'morning')) {
      placeIn(item, 'morning', itemHours(item))
      cursor = coordForItem(item) ?? cursor
    } else if (placeSpan(item)) {
      cursor = coordForItem(item) ?? cursor
    } else {
      overflow.push({ item, startPeriod: 'morning', hours: itemHours(item), continuesThrough: [], overflow: true })
    }
  }

  for (const item of longs) {
    take(item)
    if (placeSpan(item)) {
      cursor = coordForItem(item) ?? cursor
    } else {
      overflow.push({ item, startPeriod: 'morning', hours: itemHours(item), continuesThrough: [], overflow: true })
    }
  }

  for (const item of eveningLocked) take(item)

  const packWindows = usable.filter((p) => p !== 'night')
  const addTargets = distributeCounts(pool.length + eveningLocked.length, packWindows)
  const dayUsable = usable.filter((p) => p === 'morning' || p === 'afternoon')
  for (const period of dayUsable) {
    cursor = packPeriod(period, pool, cursor, addTargets[period] ?? 0)
  }

  const eveningPool = [
    ...eveningLocked,
    ...pool.filter((it) => allowedPeriods(it, usable, opts).includes('evening')),
  ]
  for (const item of eveningPool) take(item)
  cursor = packPeriod('evening', eveningPool, cursor, addTargets.evening ?? SIGHTS_PER_PERIOD_MIN)
  for (const item of eveningPool) {
    overflow.push({
      item,
      startPeriod: 'evening',
      hours: itemHours(item),
      continuesThrough: [],
      overflow: true,
    })
  }

  for (const item of [...pool]) {
    take(item)
    const hours = itemHours(item)
    const order = allowedPeriods(item, usable, opts)
    const fit = order.find((period) => canFit(item, period))
    if (fit) placeIn(item, fit, hours)
    else if (isLongSight(item) && placeSpan(item)) continue
    else overflow.push({ item, startPeriod: 'morning', hours, continuesThrough: [], overflow: true })
  }

  return { placed, overflow, remaining: { ...remaining } }
}

export function applyDurationLayout(
  periods: DayPeriod[],
  usable: PeriodId[],
  opts?: LayoutOpts,
): {
  periods: DayPeriod[]
  overflow: ItineraryItem[]
  spanNote: Record<string, string>
  remaining: Record<PeriodId, number>
} {
  const rest: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  const pinnedSights: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  const reserved: Record<PeriodId, number> = {
    morning: opts?.reserved?.morning ?? 0,
    afternoon: opts?.reserved?.afternoon ?? 0,
    evening: opts?.reserved?.evening ?? 0,
    night: opts?.reserved?.night ?? 0,
  }
  const occupiedCounts: Record<PeriodId, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  }
  const pinSourceIds = opts?.pinSourceIds
  const sights: ItineraryItem[] = []
  for (const period of periods) {
    for (const item of period.items) {
      const sight = item.kind === 'experience' || item.kind === 'activity' || item.kind === 'shopping'
      const pinned = Boolean(sight && item.sourceId && pinSourceIds?.has(item.sourceId))
      if (sight && period.id !== 'night' && !pinned) {
        sights.push(item)
      } else if (sight && pinned && period.id !== 'night') {
        pinnedSights[period.id].push(item)
        reserved[period.id] += itemHours(item)
        occupiedCounts[period.id] += 1
      } else {
        rest[period.id].push(item)
        if (sight) {
          reserved[period.id] += itemHours(item)
          occupiedCounts[period.id] += 1
        }
      }
    }
  }

  const { placed, overflow, remaining } = layoutSightsByDuration(sights, usable, {
    ...opts,
    reserved,
    occupiedCounts,
  })
  const sightBuckets: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  const spanNote: Record<string, string> = {}
  for (const row of placed) {
    sightBuckets[row.startPeriod].push(row.item)
    const note = spanNoteFor(row)
    if (note) spanNote[row.item.id] = note
  }

  return {
    periods: periods.map((period) => {
      const combined = [...pinnedSights[period.id], ...sightBuckets[period.id]]
      const ordered = combined.length > 1 ? orderSightsByProximity(combined) : combined
      return {
        ...period,
        items: [...rest[period.id], ...ordered],
      }
    }),
    overflow: overflow.map((row) => row.item).sort((a, b) => reviewRoi(a) - reviewRoi(b)),
    spanNote,
    remaining,
  }
}
