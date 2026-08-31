import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES, type CityActivity } from '../../data/activities'
import { HOTELS } from '../../data/hotels'
import { SHOPPING_ITEMS } from '../../data/shopping'
import { findLeg, formatDuration } from '../../data/transport'
import { getExperienceImages } from '../pricing'
import { getActivityImages } from '../../data/activities'
import type {
  Experience,
  ExperienceSelectionMeta,
  HolidayKind,
  Hotel,
  Restaurant,
  TransportMode,
} from '../../types'
import {
  airportTransfersUrl,
  gettingAroundUrl,
  hotelMapsUrl,
  placeMapsUrl,
  restaurantMapsUrl,
} from './links'
import {
  activityHours,
  allocateCityDayCounts,
  applyUserNightOverrides,
  buildTripLevelIssues,
  cityWeight,
  decideOptionalItems,
  findThinCities,
  occupancyConflicts,
  occupancyFamilyActivity,
  occupancyFamilyExperience,
  isCafeRestaurant,
  isSnackRestaurant,
  restaurantsForPlace,
  suggestAddsForCity,
  suggestDropsForDay,
  suggestMissingCoreCities,
  CORE_CITY_META,
  type CityDayWeight,
  type OccupancyFamily,
  type TripShapeInput,
} from './tripIntelligence'
import {
  dailySpendBand,
  effectiveDailyUsd,
  effectiveHolidayKind,
  addCapForKind,
  hourBudgetForTrip,
  perDayCapacityForKind,
  styleFromHolidayKind,
} from './holidayKind'
import {
  northToSouth,
  placeCoords,
  placeLabel,
  placeLegRegion,
  resolvePlaceId,
  experienceCityForPlace,
} from './cityPins'
import { clusterDaySightsByProximity } from './sightOrder'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import type { PlaceId } from '../../../GettingAround/data/types'
import {
  PERIOD_META,
  type CostSummaryBand,
  type DayAgenda,
  type DayCosts,
  type DayPeriod,
  type ItineraryItem,
  type LocalTransferHint,
  type PeriodId,
  type RouteStop,
  type YourVietnamDay,
  type YourVietnamTrip,
} from './types'

export type BuildYourVietnamInput = {
  days: number
  startDate: string
  endDate?: string
  travelStyle: ReturnType<typeof styleFromHolidayKind>
  holidayKind?: HolidayKind
  holidayKindKnown?: boolean
  paceKnown?: boolean
  groupSize?: number
  budgetDailyUsd?: number
  budgetAllocationKnown?: boolean
  budgetKnown?: boolean
  budgetTarget?: number
  budgetMode?: 'per-person' | 'total'
  experienceIds: string[]
  activityIds: string[]
  hotelIds: string[]
  chosenStayId: string | null
  restaurantIds: string[]
  shoppingIds: string[]
  transportChoices: Record<string, TransportMode>
  experienceMeta: Record<string, ExperienceSelectionMeta>
  dismissedIssueIds?: string[]
  removedItemIds?: string[]
  skippedSuggestionIds?: string[]
  cityNightOverrides?: Record<string, number>
}

type CityBucket = {
  placeId: PlaceId
  city: string
  region: string
  experiences: Experience[]
  activities: CityActivity[]
  hotels: Hotel[]
  shopping: (typeof SHOPPING_ITEMS)[number][]
}

function addDaysLabel(iso: string, offset: number) {
  if (!iso) return `Day ${offset + 1}`
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return `Day ${offset + 1}`
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function dateRangeLabel(start: string, days: number) {
  if (!start) return `${days} day${days === 1 ? '' : 's'}`
  const a = new Date(`${start}T12:00:00`)
  if (Number.isNaN(a.getTime())) return `${days} days`
  const b = new Date(a)
  b.setDate(b.getDate() + Math.max(0, days - 1))
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(a)} – ${fmt(b)}`
}

function slotPeriod(
  meta: ExperienceSelectionMeta | undefined,
  fallback: PeriodId,
  exp?: Experience,
): PeriodId {
  const slot = meta?.preferredSlot
  if (slot === 'morning' || slot === 'afternoon' || slot === 'evening') return slot
  if (exp) {
    const q = exp.slotQuality
    const ranked: Array<[PeriodId, number]> = [
      ['morning', q.morning],
      ['afternoon', q.afternoon],
      ['evening', q.evening],
    ]
    ranked.sort((a, b) => b[1] - a[1])
    return ranked[0][0]
  }
  return fallback
}

const PERIOD_CAP: Record<PeriodId, number> = {
  morning: 3.75,
  afternoon: 3.5,
  evening: 2.75,
  night: 10,
}

function hoursOfItem(it: ItineraryItem): number {
  const label = it.durationLabel?.toLowerCase() ?? ''
  if (/half\s*day/.test(label)) return 4
  if (/full\s*day/.test(label)) return 7
  const nums = it.durationLabel?.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? []
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2
  if (nums.length === 1) return Math.max(nums[0], 1.25)
  return 1.5
}

function usedPeriodHours(periodItems: Record<PeriodId, ItineraryItem[]>, p: PeriodId): number {
  return periodItems[p].reduce((s, it) => s + hoursOfItem(it), 0)
}

function familyOfPackedItem(it: ItineraryItem): OccupancyFamily | null {
  if (it.kind === 'meal') {
    return it.period === 'evening' || /^Dinner/.test(it.name) ? 'sit-down-dinner' : 'sit-down-lunch'
  }
  if (it.kind === 'experience' && it.sourceId) {
    const e = EXPERIENCES.find((x) => x.id === it.sourceId)
    return e ? occupancyFamilyExperience(e) : null
  }
  if (it.kind === 'activity' && it.sourceId) {
    const a = CITY_ACTIVITIES.find((x) => x.id === it.sourceId)
    return a ? occupancyFamilyActivity(a) : null
  }
  return null
}

function noteFamily(family: OccupancyFamily | null, period: PeriodId, dayFamilies: Set<string>) {
  if (!family) return
  dayFamilies.add(family)
  if (family === 'food-tour' && period === 'evening') dayFamilies.add('food-tour-evening')
  if (family === 'cafe' && period === 'afternoon') dayFamilies.add('cafe-afternoon')
}

function preferredActPeriod(act: CityActivity): PeriodId {
  const name = act.name.toLowerCase()
  if (/morning|dawn|sunrise/.test(name)) return 'morning'
  if (/evening|sunset|night|lantern/.test(name)) return 'evening'
  if (act.kind === 'music' || act.kind === 'dance' || act.kind === 'beach') return 'evening'
  if (act.kind === 'class' || act.kind === 'workshop' || occupancyFamilyActivity(act) === 'cooking') {
    return 'morning'
  }
  if (act.kind === 'food') return 'afternoon'
  return 'afternoon'
}

function pickOpenPeriod(
  preferred: PeriodId,
  itemHours: number,
  family: OccupancyFamily | null,
  periodItems: Record<PeriodId, ItineraryItem[]>,
  dayFamilies: Set<string>,
  reserved: (p: PeriodId) => number = () => 0,
): PeriodId | null {
  const fits = (p: PeriodId) =>
    usedPeriodHours(periodItems, p) + itemHours + reserved(p) <= PERIOD_CAP[p] + 0.6
  const order: PeriodId[] = [preferred, 'morning', 'afternoon', 'evening']
  const seen = new Set<PeriodId>()
  for (const p of order) {
    if (seen.has(p) || p === 'night') continue
    seen.add(p)
    if (family === 'nightlife' && p === 'morning') continue
    if (occupancyConflicts(family, dayFamilies, p)) continue
    if (fits(p)) return p
  }
  let least: PeriodId | null = null
  for (const p of ['morning', 'afternoon', 'evening'] as PeriodId[]) {
    if (family === 'nightlife' && p === 'morning') continue
    if (occupancyConflicts(family, dayFamilies, p)) continue
    if (!fits(p)) continue
    if (!least || usedPeriodHours(periodItems, p) < usedPeriodHours(periodItems, least)) least = p
  }
  return least
}

function sortAfternoon(items: ItineraryItem[]): ItineraryItem[] {
  const rank = (it: ItineraryItem) => {
    if (it.kind === 'check-in') return 0
    if (it.kind === 'meal') return 1
    return 2
  }
  return [...items].sort((a, b) => rank(a) - rank(b))
}

function costBand(usd: number): string {
  if (usd <= 0) return 'Free / included'
  if (usd < 15) return 'Low'
  if (usd < 40) return 'Low–moderate'
  if (usd < 80) return 'Moderate'
  return 'Higher'
}

function localTransfer(
  fromLabel: string,
  toLabel: string,
  sameCity: boolean,
  tight: boolean,
): LocalTransferHint {
  if (!sameCity) {
    return {
      mode: tight ? 'Coach / bus' : 'Grab App',
      icon: tight ? '🚐' : '🚕',
      durationLabel: tight ? '~30–55 min' : '~20–40 min',
      reason: tight
        ? 'Cross-neighbourhood hop — a coach or bus keeps daily spend down, and takes a little longer.'
        : 'Cross-neighbourhood move — a direct ride is usually the practical choice.',
      selectionState: 'recommended',
      costUsd: tight ? 3 : 8,
      externalUrl: gettingAroundUrl(),
      accent: 'city-hop',
    }
  }
  const short =
    fromLabel.toLowerCase().includes('old') && toLabel.toLowerCase().includes('old')
  if (short || tight) {
    return {
      mode: 'Walk',
      icon: '🚶',
      durationLabel: tight ? '~12–25 min' : '~8–15 min',
      reason: tight
        ? 'Walking saves the daily budget and is how most of this area is meant to be seen.'
        : 'Short enough to walk and better for experiencing the area.',
      selectionState: 'recommended',
      costUsd: 0,
      externalUrl: gettingAroundUrl(),
      accent: 'local',
    }
  }
  return {
    mode: 'Grab App',
    icon: '🚕',
    durationLabel: '~10–20 min',
    reason: 'A short ride between stops — walk it if the stretch is shaded and you have time.',
    selectionState: 'recommended',
    costUsd: 4,
    externalUrl: gettingAroundUrl(),
    accent: 'local',
  }
}

function emptyCosts(): DayCosts {
  return { stay: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0, total: 0 }
}

function sumCosts(c: DayCosts): DayCosts {
  return {
    ...c,
    total: c.stay + c.food + c.transport + c.experiences + c.shopping + c.other,
  }
}

function themeFromItems(city: string, names: string[]): { theme: string; blurb: string } {
  if (names.length === 0) {
    return {
      theme: `${city} · Open day`,
      blurb: 'Space to wander — nothing locked in yet.',
    }
  }
  if (names.length === 1) {
    return {
      theme: `${city} · ${names[0]}`,
      blurb: `Anchored around ${names[0]}.`,
    }
  }
  return {
    theme: `${city} · ${names[0]} + more`,
    blurb: `${names[0]} leads the day, with ${names[1]} and related stops nearby.`,
  }
}

function travellersLabel(n: number) {
  if (n <= 1) return '1 traveller'
  return `${n} travellers`
}

function mealItem(
  r: Restaurant,
  period: PeriodId,
  mealLabel: string,
  state: ItineraryItem['selectionState'] = 'selected',
  dayNumber = 1,
): ItineraryItem {
  return {
    id: `rest:${r.id}:${mealLabel}:${dayNumber}`,
    kind: 'meal',
    name: `${mealLabel} · ${r.name}`,
    selectionState: state,
    period,
    timeLabel: mealLabel === 'Lunch' ? 'Around midday' : 'Evening meal',
    durationLabel: state === 'recommended' && r.priceUsd <= 8 ? '~60–90 min' : '~45–75 min',
    locationLabel: r.city,
    city: r.city,
    region: r.region,
    description: r.blurb,
    costUsd: r.priceUsd,
    costBand: r.priceLabel,
    icon: '🍜',
    mapsUrl: restaurantMapsUrl(r.name, r.city, r.address),
    externalLabel: 'Open in Google Maps ↗',
    tags: ['Food', state === 'selected' ? 'Selected' : 'Recommended', r.cuisine],
    sourceId: r.id,
    reason:
      state === 'recommended'
        ? `Suggested to match this city’s food and your daily budget.`
        : undefined,
  }
}

function simpleMeal(city: string, region: string, period: PeriodId, dayNumber: number): ItineraryItem {
  const lunch = period === 'afternoon'
  return {
    id: `simple-meal:${city}:${period}:${dayNumber}`,
    kind: 'meal',
    name: lunch ? 'Market lunch · keep it simple' : 'Simple local dinner',
    selectionState: 'recommended',
    period,
    timeLabel: lunch ? 'Around midday' : 'Evening meal',
    durationLabel: '~60–90 min',
    locationLabel: city,
    city,
    region,
    description:
      'A stall or market meal — cheaper, a little slower than a sit-down, and how many travellers eat on a tight daily budget.',
    costUsd: 4,
    costBand: 'Low',
    icon: '🥢',
    mapsUrl: placeMapsUrl('street food', city),
    tags: ['Food', 'Recommended', 'Budget'],
    reason: 'Tight daily budget — cooking or markets save money and take a bit more of the day.',
  }
}

function pickRestaurant(
  userPool: Restaurant[],
  catalogPool: Restaurant[],
  used: Set<string>,
  excludeId: string | undefined,
  dayIndex: number,
  skipCafe = false,
  skipSnack = false,
): { restaurant: Restaurant; fromUser: boolean } | undefined {
  const allow = (r: Restaurant) =>
    r.id !== excludeId &&
    !(skipCafe && isCafeRestaurant(r.name, r.cuisine)) &&
    !(skipSnack && isSnackRestaurant(r.name, r.cuisine))
  const user = userPool.filter(allow)
  const catalog = catalogPool.filter(allow)
  const unusedUser = user.filter((r) => !used.has(r.id))
  const unusedCatalog = catalog.filter((r) => !used.has(r.id))
  if (unusedUser[0]) return { restaurant: unusedUser[0], fromUser: true }
  if (unusedCatalog[0]) return { restaurant: unusedCatalog[0], fromUser: false }
  const cycle = user.length > 0 ? user : catalog
  if (cycle.length === 0) return undefined
  return { restaurant: cycle[dayIndex % cycle.length], fromUser: user.length > 0 }
}

function packCityDays(
  experiences: Experience[],
  activities: CityActivity[],
  dayCount: number,
): { exps: Experience[][]; acts: CityActivity[][] } {
  const n = Math.max(1, dayCount)
  const slots = Array.from({ length: n }, () => ({
    exps: [] as Experience[],
    acts: [] as CityActivity[],
    hours: 0,
    families: new Set<string>(),
  }))
  type Row =
    | { kind: 'exp'; item: Experience; hours: number; family: OccupancyFamily | null }
    | { kind: 'act'; item: CityActivity; hours: number; family: OccupancyFamily | null }
  const rows: Row[] = [
    ...experiences.map((item) => ({
      kind: 'exp' as const,
      item,
      hours: item.durationHours || 2.5,
      family: occupancyFamilyExperience(item),
    })),
    ...activities.map((item) => ({
      kind: 'act' as const,
      item,
      hours: activityHours(item),
      family: occupancyFamilyActivity(item),
    })),
  ]
  rows.sort((a, b) => b.hours - a.hours)
  for (const row of rows) {
    let best = 0
    for (let i = 1; i < n; i++) {
      const clashI = row.family ? occupancyConflicts(row.family, slots[i].families) : false
      const clashB = row.family ? occupancyConflicts(row.family, slots[best].families) : false
      if (clashI !== clashB) {
        if (!clashI) best = i
        continue
      }
      if (slots[i].hours < slots[best].hours) best = i
    }
    if (row.kind === 'exp') slots[best].exps.push(row.item)
    else slots[best].acts.push(row.item)
    slots[best].hours += row.hours
    if (row.family) slots[best].families.add(row.family)
  }
  return { exps: slots.map((s) => s.exps), acts: slots.map((s) => s.acts) }
}

/**
 * Orchestrates trip bag selections into a day-by-day Your Vietnam plan.
 * Never silently drops user selections — only sequences and annotates.
 */
export function buildYourVietnam(input: BuildYourVietnamInput): YourVietnamTrip {
  const dismissed = new Set(input.dismissedIssueIds ?? [])
  const removed = new Set(input.removedItemIds ?? [])
  const skipped = new Set(input.skippedSuggestionIds ?? [])

  const groupSize = Math.max(1, input.groupSize ?? 2)
  const holidayKind = effectiveHolidayKind({
    holidayKindKnown: Boolean(input.holidayKindKnown),
    holidayKind: input.holidayKind ?? 'culture-food',
    paceKnown: Boolean(input.paceKnown),
    travelStyle: input.travelStyle,
  })
  const dailyUsd = effectiveDailyUsd({
    budgetAllocationKnown: Boolean(input.budgetAllocationKnown),
    budgetDailyUsd: input.budgetDailyUsd ?? 50,
    budgetKnown: Boolean(input.budgetKnown),
    budgetTarget: input.budgetTarget ?? 1200,
    budgetMode: input.budgetMode ?? 'per-person',
    days: Math.max(1, input.days),
    groupSize,
  })
  const band = dailySpendBand(dailyUsd)
  const hoursPerDay = hourBudgetForTrip(holidayKind, band)
  const capacity = perDayCapacityForKind(holidayKind)
  const travelStyle = styleFromHolidayKind(holidayKind)
  const tight = band === 'tight'
  const shape: TripShapeInput = { holidayKind, groupSize, dailyUsd, band }

  const experiences = EXPERIENCES.filter(
    (e) => input.experienceIds.includes(e.id) && !removed.has(`exp:${e.id}`),
  )
  const activities = CITY_ACTIVITIES.filter(
    (a) => input.activityIds.includes(a.id) && !removed.has(`act:${a.id}`),
  )
  const hotels = HOTELS.filter((h) => input.hotelIds.includes(h.id))
  const chosen = input.chosenStayId
    ? HOTELS.find((h) => h.id === input.chosenStayId)
    : undefined
  const userRestaurants = collectUserRestaurants(input.restaurantIds, removed)
  const shopping = SHOPPING_ITEMS.filter(
    (s) => input.shoppingIds.includes(s.id) && !removed.has(`shop:${s.id}`),
  )

  const isEmpty =
    experiences.length === 0 &&
    activities.length === 0 &&
    userRestaurants.length === 0 &&
    hotels.length === 0 &&
    shopping.length === 0

  if (isEmpty) {
    return {
      title: 'Your Vietnam',
      generatedAt: new Date().toISOString(),
      daysCount: Math.max(1, input.days || 7),
      cityCount: 0,
      experienceCount: 0,
      activityCount: 0,
      foodCount: 0,
      stayCount: 0,
      transferCount: 0,
      travellersLabel: travellersLabel(groupSize),
      dateRangeLabel: dateRangeLabel(input.startDate, Math.max(1, input.days || 7)),
      route: [],
      days: [],
      cost: {
        low: 0,
        mid: 0,
        high: 0,
        categories: {
          accommodation: 0,
          food: 0,
          transport: 0,
          experiences: 0,
          shopping: 0,
          other: 0,
        },
      },
      issues: [],
      isEmpty: true,
      hasNoStays: false,
      thinCities: [],
      mustVisit: [],
    }
  }

  const buckets = groupIntoCities(experiences, activities, hotels, shopping, userRestaurants)
  const orderedIds = northToSouth(buckets.map((b) => b.placeId))
  const orderedBuckets = orderedIds
    .map((id) => buckets.find((b) => b.placeId === id)!)
    .filter(Boolean)

  const requestedDays = Math.max(1, input.days || Math.max(experiences.length, 3))
  const cityCount = Math.max(1, orderedBuckets.length)
  const dayCount = Math.max(requestedDays, cityCount || 1)

  const weights: CityDayWeight[] = orderedBuckets.map((b) => ({
    placeId: b.placeId,
    city: b.city,
    region: b.region,
    weight: cityWeight(b.experiences, b.activities, holidayKind),
    selectedCount: b.experiences.length + b.activities.length,
    hours:
      b.experiences.reduce((s, e) => s + (e.durationHours || 2.5), 0) +
      b.activities.reduce((s, a) => s + activityHours(a), 0),
  }))

  const allocated =
    orderedBuckets.length === 0
      ? new Map<PlaceId, number>()
      : allocateCityDayCounts(weights, dayCount, holidayKind, hoursPerDay, capacity)
  const dayCounts = applyUserNightOverrides(
    allocated,
    orderedBuckets.map((b) => b.placeId),
    dayCount,
    input.cityNightOverrides,
    weights,
  )

  const dayPlaceIds: PlaceId[] = []
  for (const b of orderedBuckets) {
    const n = dayCounts.get(b.placeId) ?? 1
    for (let i = 0; i < n; i++) dayPlaceIds.push(b.placeId)
  }
  while (dayPlaceIds.length < dayCount && orderedBuckets[0]) {
    dayPlaceIds.push(orderedBuckets[0].placeId)
  }
  if (dayPlaceIds.length === 0) {
    // Empty trip still produces a single open day
  }

  const byPlace = new Map(orderedBuckets.map((b) => [b.placeId, b]))
  const packedByPlace = new Map<
    PlaceId,
    { exps: Experience[][]; acts: CityActivity[][] }
  >()
  for (const b of orderedBuckets) {
    const n = dayPlaceIds.filter((id) => id === b.placeId).length
    packedByPlace.set(b.placeId, packCityDays(b.experiences, b.activities, n))
  }
  const cursor = new Map<PlaceId, number>()

  const usedRestaurantIds = new Set<string>()
  const usedShopIds = new Set<string>()
  const selectedExpIdSet = new Set(experiences.map((e) => e.id))
  const selectedActIdSet = new Set(activities.map((a) => a.id))

  const fallbackCity = orderedBuckets[0]?.city ?? 'Hanoi'
  const fallbackRegion = orderedBuckets[0]?.region ?? 'Hanoi'
  const fallbackPlace = orderedBuckets[0]?.placeId

  const days: YourVietnamDay[] = Array.from({ length: dayCount }, (_, i) => {
    const placeId = dayPlaceIds[i] ?? fallbackPlace
    const bucket = placeId ? byPlace.get(placeId) : undefined
    const city = bucket?.city ?? fallbackCity
    const region = bucket?.region ?? fallbackRegion
    const slot = placeId ? cursor.get(placeId) ?? 0 : 0
    if (placeId) cursor.set(placeId, slot + 1)
    const packed = placeId ? packedByPlace.get(placeId) : undefined
    const exps = packed?.exps[slot] ?? []
    const acts = packed?.acts[slot] ?? []
    const nightsHere = placeId ? dayPlaceIds.filter((id) => id === placeId).length : 1

    const hotel: Hotel | undefined =
      (chosen && resolvePlaceId(chosen.city, chosen.region) === placeId ? chosen : undefined) ??
      bucket?.hotels[0] ??
      hotels.find((h) => resolvePlaceId(h.city, h.region) === placeId)

    const periodItems: Record<PeriodId, ItineraryItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    }
    const stayGap = !hotel

    const actHrs = acts.reduce((s, a) => s + activityHours(a), 0)
    const dropMap = suggestDropsForDay(exps, acts, shape, hoursPerDay, capacity)
    const optionalMap = decideOptionalItems(exps, actHrs, capacity, travelStyle, hoursPerDay)
    for (const [id, dec] of dropMap) {
      if (!optionalMap.has(id)) {
        optionalMap.set(id, { id, reason: dec.reason })
      }
    }

    const prevPlace = i > 0 ? dayPlaceIds[i - 1] : undefined
    const isArrival = !prevPlace || prevPlace !== placeId
    if (hotel && isArrival) {
      periodItems.afternoon.unshift({
        id: `checkin-${hotel.id}-${i}`,
        kind: 'check-in',
        name: `Check-in · ${hotel.name}`,
        selectionState: 'selected',
        period: 'afternoon',
        timeLabel: 'Afternoon · typical',
        durationLabel: '~30 min',
        locationLabel: hotel.neighborhood,
        city: hotel.city,
        region: hotel.region,
        description: hotel.blurb,
        costUsd: 0,
        icon: '🏨',
        mapsUrl: hotelMapsUrl(hotel),
        externalUrl: hotel.sourceUrl,
        externalLabel: 'View stay ↗',
        tags: ['Check-in'],
        sourceId: hotel.id,
      })
    }

    const dayFamilies = new Set<string>()
    const cityUserMeals = userRestaurants.filter(
      (r) => resolvePlaceId(r.city, r.region) === placeId,
    )
    const catalogMeals = placeId ? restaurantsForPlace(placeId) : []
    const wantDinner =
      holidayKind === 'action' || cityUserMeals.length >= 2 || band !== 'tight'
    const wantLunch = true
    const reserved = (p: PeriodId) => {
      if (p === 'afternoon') {
        if (dayFamilies.has('cooking')) return 1
        if (wantLunch && !occupancyConflicts('sit-down-lunch', dayFamilies, 'afternoon')) return 1.5
      }
      if (p === 'evening' && wantDinner && !occupancyConflicts('sit-down-dinner', dayFamilies, 'evening')) {
        return 1.5
      }
      return 0
    }

    const fallbacks: PeriodId[] = ['morning', 'afternoon', 'evening']
    exps.forEach((exp, ei) => {
      const family = occupancyFamilyExperience(exp)
      let preferred = slotPeriod(input.experienceMeta[exp.id], fallbacks[ei % fallbacks.length], exp)
      if (family === 'cafe' && preferred === 'afternoon') preferred = 'morning'
      const period =
        pickOpenPeriod(preferred, exp.durationHours || 2.5, family, periodItems, dayFamilies, () => 0) ??
        preferred
      const images = getExperienceImages(exp)
      const optional = optionalMap.get(exp.id)
      const suggestDrop = dropMap.has(exp.id)
      periodItems[period].push({
        id: `exp:${exp.id}`,
        kind: 'experience',
        name: exp.name,
        selectionState: optional ? 'optional' : 'selected',
        period,
        timeLabel: PERIOD_META[period].label,
        durationLabel: exp.durationLabel,
        locationLabel: exp.city,
        city: exp.city,
        region: exp.region,
        description: exp.hook,
        costUsd: exp.costUsd,
        costBand: costBand(exp.costUsd),
        icon: exp.signalEmoji || '✨',
        thumb: images[0],
        mapsUrl: placeMapsUrl(exp.name, exp.city),
        tags: optional
          ? [suggestDrop ? 'Consider dropping' : 'Optional', exp.popularityTag, exp.category]
          : [exp.popularityTag, exp.category],
        reason: optional?.reason,
        sourceId: exp.id,
        suggestDrop,
      })
      noteFamily(family, period, dayFamilies)
    })

    for (const act of acts) {
      const family = occupancyFamilyActivity(act)
      const preferred = preferredActPeriod(act)
      const period =
        pickOpenPeriod(preferred, activityHours(act), family, periodItems, dayFamilies, () => 0) ??
        preferred
      const optional = optionalMap.get(act.id)
      const suggestDrop = dropMap.has(act.id)
      periodItems[period].push({
        id: `act:${act.id}`,
        kind: 'activity',
        name: act.name,
        selectionState: optional ? 'optional' : 'selected',
        period,
        timeLabel: PERIOD_META[period].label,
        durationLabel: act.durationLabel,
        locationLabel: act.cityName,
        city: act.cityName,
        region: act.cityName,
        description: act.hook,
        costUsd: act.priceFromUsd ?? 0,
        costBand: act.priceLabel,
        icon: act.signalEmoji,
        thumb: getActivityImages(act)[0],
        mapsUrl: placeMapsUrl(act.name, act.cityName),
        tags: optional
          ? [suggestDrop ? 'Consider dropping' : 'Optional', act.popularityTag, act.kindLabel]
          : [act.popularityTag, act.kindLabel],
        reason:
          optional?.reason ??
          'Selected as a hands-on activity — we fit this beside your experiences.',
        sourceId: act.id,
        suggestDrop,
      })
      noteFamily(family, period, dayFamilies)
    }

    const usedHours =
      exps.filter((e) => !optionalMap.has(e.id)).reduce((s, e) => s + (e.durationHours || 2.5), 0) +
      acts.filter((a) => !optionalMap.has(a.id)).reduce((s, a) => s + activityHours(a), 0)
    const remainingHours = Math.max(0, hoursPerDay - usedHours)
    const spentToday =
      exps.reduce((s, e) => s + e.costUsd, 0) +
      acts.reduce((s, a) => s + (a.priceFromUsd ?? 0), 0)
    const remainingDaily = Math.max(0, dailyUsd - spentToday)
    const mainCount = exps.length + acts.length
    let addRoom = Math.max(
      0,
      Math.min(capacity - mainCount, Math.floor(remainingHours / (holidayKind === 'action' ? 1.6 : 2.2))),
    )
    if (holidayKind === 'action') {
      const actionCap = addCapForKind('action')
      if (remainingHours >= 1) addRoom = Math.max(addRoom, Math.min(actionCap, Math.floor(remainingHours / 1.5) || 1))
      if (remainingHours >= 1.25) addRoom = Math.max(addRoom, Math.min(actionCap, 2))
    }
    if (holidayKind === 'leisure') {
      addRoom = Math.min(addRoom, Math.max(0, 3 - mainCount))
    }
    if (dayFamilies.has('cooking')) addRoom = Math.min(addRoom, holidayKind === 'action' ? 2 : 1)

    const occupiedForAdds = new Set(dayFamilies)
    if (wantLunch && !occupancyConflicts('sit-down-lunch', occupiedForAdds, 'afternoon')) {
      occupiedForAdds.add('sit-down-lunch')
    }
    if (wantDinner && !occupancyConflicts('sit-down-dinner', occupiedForAdds, 'evening')) {
      occupiedForAdds.add('sit-down-dinner')
    }

    const addGateHours = holidayKind === 'action' ? 1 : holidayKind === 'leisure' ? 1.75 : 1.75
    if (placeId && addRoom > 0 && remainingHours >= addGateHours) {
      const addLimit =
        holidayKind === 'leisure' ? Math.min(addRoom, Math.max(0, 3 - mainCount)) : addRoom
      const adds = suggestAddsForCity(
        placeId,
        selectedExpIdSet,
        selectedActIdSet,
        remainingHours,
        remainingDaily,
        shape,
        skipped,
        addLimit,
        occupiedForAdds,
      )
      for (const add of adds) {
        if (skipped.has(add.id) || skipped.has(`${add.kind}:${add.id}`)) continue
        if (add.kind === 'experience') {
          const exp = EXPERIENCES.find((e) => e.id === add.id)
          if (!exp) continue
          const family = occupancyFamilyExperience(exp)
          let preferred = add.period ?? slotPeriod(undefined, 'afternoon', exp)
          if (family === 'cafe' && preferred === 'afternoon') preferred = 'morning'
          const period = pickOpenPeriod(
            preferred,
            exp.durationHours || 2.5,
            family,
            periodItems,
            dayFamilies,
            reserved,
          )
          if (!period) continue
          selectedExpIdSet.add(exp.id)
          const images = getExperienceImages(exp)
          periodItems[period].push({
            id: `rec-exp:${exp.id}`,
            kind: 'experience',
            name: exp.name,
            selectionState: 'recommended',
            period,
            timeLabel: PERIOD_META[period].label,
            durationLabel: exp.durationLabel,
            locationLabel: exp.city,
            city: exp.city,
            region: exp.region,
            description: exp.hook,
            costUsd: exp.costUsd,
            costBand: costBand(exp.costUsd),
            icon: exp.signalEmoji || '✨',
            thumb: images[0],
            mapsUrl: placeMapsUrl(exp.name, exp.city),
            tags: ['Recommended', exp.popularityTag, exp.category],
            reason: add.reason,
            sourceId: exp.id,
          })
          noteFamily(family, period, dayFamilies)
        } else if (add.kind === 'activity') {
          const act = CITY_ACTIVITIES.find((a) => a.id === add.id)
          if (!act) continue
          const family = occupancyFamilyActivity(act)
          const preferred = add.period ?? preferredActPeriod(act)
          const period = pickOpenPeriod(
            preferred,
            activityHours(act),
            family,
            periodItems,
            dayFamilies,
            reserved,
          )
          if (!period) continue
          selectedActIdSet.add(act.id)
          periodItems[period].push({
            id: `rec-act:${act.id}`,
            kind: 'activity',
            name: act.name,
            selectionState: 'recommended',
            period,
            timeLabel: PERIOD_META[period].label,
            durationLabel: act.durationLabel,
            locationLabel: act.cityName,
            city: act.cityName,
            region: act.cityName,
            description: act.hook,
            costUsd: act.priceFromUsd ?? 0,
            costBand: act.priceLabel,
            icon: act.signalEmoji,
            thumb: getActivityImages(act)[0],
            mapsUrl: placeMapsUrl(act.name, act.cityName),
            tags: ['Recommended', act.popularityTag, act.kindLabel],
            reason: add.reason,
            sourceId: act.id,
          })
          noteFamily(family, period, dayFamilies)
        }
      }
    }

    const geoStart =
      (hotel && PIN_BY_SOURCE_ID[hotel.id]
        ? PIN_BY_SOURCE_ID[hotel.id]
        : null) ?? (placeId ? placeCoords(placeId) : null)
    clusterDaySightsByProximity(periodItems, geoStart)

    let lunch: Restaurant | undefined
    let dinner: Restaurant | undefined
    let lunchState: ItineraryItem['selectionState'] = 'selected'
    let dinnerState: ItineraryItem['selectionState'] = 'selected'
    const skipLunch = occupancyConflicts('sit-down-lunch', dayFamilies, 'afternoon')
    const skipDinner = occupancyConflicts('sit-down-dinner', dayFamilies, 'evening')
    const dayNumber = i + 1

    if (wantLunch && !skipLunch) {
      const picked = pickRestaurant(
        cityUserMeals,
        catalogMeals,
        usedRestaurantIds,
        undefined,
        i,
        true,
        false,
      )
      lunch = picked?.restaurant
      lunchState = picked?.fromUser ? 'selected' : 'recommended'
    }
    if (wantDinner && !skipDinner) {
      const picked = pickRestaurant(
        cityUserMeals,
        catalogMeals,
        usedRestaurantIds,
        lunch?.id,
        i,
        true,
        true,
      )
      dinner = picked?.restaurant
      dinnerState = picked?.fromUser ? 'selected' : 'recommended'
    }

    if (lunch) {
      usedRestaurantIds.add(lunch.id)
      if (!skipped.has(lunch.id) || lunchState === 'selected') {
        periodItems.afternoon.push(mealItem(lunch, 'afternoon', 'Lunch', lunchState, dayNumber))
        noteFamily('sit-down-lunch', 'afternoon', dayFamilies)
      }
    } else if (wantLunch && !skipLunch && !skipped.has(`simple-meal:${city}:${dayNumber}`)) {
      periodItems.afternoon.push(simpleMeal(city, region, 'afternoon', dayNumber))
      noteFamily('sit-down-lunch', 'afternoon', dayFamilies)
    }

    if (dinner && dinner.id !== lunch?.id) {
      usedRestaurantIds.add(dinner.id)
      if (!skipped.has(dinner.id) || dinnerState === 'selected') {
        periodItems.evening.push(mealItem(dinner, 'evening', 'Dinner', dinnerState, dayNumber))
        noteFamily('sit-down-dinner', 'evening', dayFamilies)
      }
    } else if (wantDinner && !skipDinner && !dinner && !skipped.has(`simple-dinner:${city}:${dayNumber}`)) {
      periodItems.evening.push(simpleMeal(city, region, 'evening', dayNumber))
      noteFamily('sit-down-dinner', 'evening', dayFamilies)
    }

    const shop =
      bucket?.shopping.find((s) => !usedShopIds.has(s.id)) ??
      shopping.find((s) => resolvePlaceId(s.city, s.region) === placeId && !usedShopIds.has(s.id))
    if (shop) {
      usedShopIds.add(shop.id)
      const preferred = shop.preferredPeriod ?? 'afternoon'
      const period = pickOpenPeriod(preferred, 1.5, null, periodItems, dayFamilies, reserved) ?? preferred
      periodItems[period].push({
        id: `shop:${shop.id}`,
        kind: 'shopping',
        name: shop.name,
        selectionState: 'selected',
        period,
        timeLabel: PERIOD_META[period].label,
        durationLabel: '~1–2 hr',
        locationLabel: shop.city,
        city: shop.city,
        region: shop.region,
        description: shop.blurb,
        costUsd: shop.costUsd,
        costBand: shop.costLabel,
        icon: '🛍',
        mapsUrl: placeMapsUrl(shop.shop || shop.name, shop.city),
        tags: ['Shopping', shop.type],
        reason: `Scheduled in ${shop.city} for the ${period} — when this stop usually works best.`,
        sourceId: shop.id,
      })
    }

    if (hotel) {
      periodItems.night.push({
        id: `stay:${hotel.id}:${i}`,
        kind: 'stay',
        name: hotel.name,
        selectionState: 'selected',
        period: 'night',
        timeLabel: 'Overnight',
        locationLabel: hotel.neighborhood,
        city: hotel.city,
        region: hotel.region,
        description: hotel.blurb,
        costUsd: hotel.pricePerNight,
        costBand: costBand(hotel.pricePerNight),
        icon: '🏨',
        mapsUrl: hotelMapsUrl(hotel),
        externalUrl: hotel.sourceUrl,
        externalLabel: 'View stay ↗',
        tags: ['Stay'],
        sourceId: hotel.id,
      })
    }

    const nextPlace = dayPlaceIds[i + 1]
    let cityTransferOut: YourVietnamDay['cityTransferOut']
    if (nextPlace && nextPlace !== placeId) {
      const toCity = byPlace.get(nextPlace)?.city ?? placeLabel(nextPlace)
      const toRegion = byPlace.get(nextPlace)?.region ?? placeLegRegion(nextPlace)
      const fromLeg = placeId ? placeLegRegion(placeId, region) : region
      const toLeg = placeLegRegion(nextPlace, toRegion)
      const leg = findLeg(fromLeg, toLeg) ?? findLeg(region, toRegion) ?? findLeg(city, toCity)
      const chosenMode = leg ? input.transportChoices[leg.id] : undefined
      const option = chosenMode ? leg?.options.find((o) => o.mode === chosenMode) : undefined
      const budgetOption = tight
        ? leg?.options.find((o) => o.mode === 'bus') ?? leg?.options.find((o) => o.mode === 'train')
        : undefined

      if (leg && option && chosenMode) {
        cityTransferOut = {
          toCity,
          toRegion,
          modeLabel: option.label,
          icon: option.icon,
          durationLabel: formatDuration(option.durationMinutes),
          costUsd: option.costUsd,
          reason: `${option.status} · your chosen mode for this hop.`,
          externalUrl: gettingAroundUrl(),
          unset: false,
        }
      } else {
        cityTransferOut = {
          toCity,
          toRegion,
          modeLabel: budgetOption ? budgetOption.label : 'To be chosen',
          icon: budgetOption ? budgetOption.icon : '🚐',
          durationLabel: budgetOption
            ? formatDuration(budgetOption.durationMinutes)
            : 'Choose a mode',
          costUsd: budgetOption?.costUsd ?? 0,
          reason: tight
            ? `You’re moving from ${city} to ${toCity}. On a tight daily budget a bus or train is the usual fit — confirm it in Getting Around.`
            : `You’re moving from ${city} to ${toCity} — pick how you’ll travel in Getting Around.`,
          externalUrl: gettingAroundUrl(),
          unset: true,
        }
      }

      if (hotel) {
        periodItems.morning.unshift({
          id: `checkout-${hotel.id}-${i}`,
          kind: 'check-out',
          name: `Check-out · ${hotel.name}`,
          selectionState: 'system',
          period: 'morning',
          timeLabel: 'Before departure',
          locationLabel: hotel.neighborhood,
          city: hotel.city,
          region: hotel.region,
          costUsd: 0,
          icon: '🧳',
          reason: 'System-added so your city change has a clear start.',
          tags: ['Check-out'],
          sourceId: hotel.id,
        })
      }

    }

    if (i === 0 && (exps.length > 0 || acts.length > 0 || hotel || !isEmpty)) {
      periodItems.morning.unshift({
        id: `airport-in-${i}`,
        kind: 'airport-transfer',
        name: 'Arrival into Vietnam',
        selectionState: 'recommended',
        period: 'morning',
        timeLabel: 'On arrival',
        durationLabel: '~35–60 min typical',
        locationLabel: city,
        city,
        region,
        description: 'Airport → city transfer once you land.',
        costUsd: tight ? 8 : 18,
        costBand: 'Typical range',
        icon: '✈️',
        reason: 'Getting into Vietnam — recommended so day one starts smoothly.',
        externalUrl: airportTransfersUrl(),
        externalLabel: 'View airport options ↗',
        tags: ['Arrival', 'Airport'],
        transferAccent: 'arrival',
      })
    }

    if (i === dayCount - 1 && !isEmpty) {
      periodItems.evening.push({
        id: `airport-out-${i}`,
        kind: 'airport-transfer',
        name: 'Leaving Vietnam',
        selectionState: 'recommended',
        period: 'evening',
        timeLabel: 'Before your flight',
        durationLabel: '~35–60 min typical',
        locationLabel: city,
        city,
        region,
        description: 'City → airport transfer for your departure.',
        costUsd: tight ? 8 : 18,
        costBand: 'Typical range',
        icon: '🛫',
        reason: 'Leaving Vietnam — build buffer for traffic and check-in.',
        externalUrl: airportTransfersUrl(),
        externalLabel: 'View airport options ↗',
        tags: ['Departure', 'Airport'],
        transferAccent: 'departure',
      })
    }

    periodItems.afternoon = sortAfternoon(periodItems.afternoon)

    const flatOrder: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
    const flat: ItineraryItem[] = flatOrder.flatMap((p) => periodItems[p])
    for (let j = 0; j < flat.length - 1; j++) {
      const cur = flat[j]
      const next = flat[j + 1]
      if (cur.kind === 'local-transfer' || next.kind === 'check-in') continue
      if (cur.kind === 'stay' || cur.kind === 'check-out') continue
      if (['experience', 'activity', 'meal', 'shopping', 'check-in'].includes(cur.kind)) {
        cur.transferAfter = localTransfer(
          cur.locationLabel || cur.name,
          next.locationLabel || next.name,
          cur.city === next.city || cur.region === next.region,
          tight,
        )
      }
    }

    const periods: DayPeriod[] = (['morning', 'afternoon', 'evening', 'night'] as PeriodId[]).map(
      (pid) => {
        const items = periodItems[pid]
        const meta = PERIOD_META[pid]
        if (items.length === 0) {
          return {
            id: pid,
            label: meta.label,
            windowLabel: meta.windowLabel,
            items: [],
            openNote: 'Open',
          }
        }
        return { id: pid, label: meta.label, windowLabel: meta.windowLabel, items }
      },
    )

    const names = [...exps.map((e) => e.name), ...acts.map((a) => a.name)]
    const { theme, blurb } = themeFromItems(city, names)

    let costs = emptyCosts()
    for (const p of periods) {
      for (const item of p.items) {
        if (item.kind === 'experience' || item.kind === 'activity') costs.experiences += item.costUsd
        else if (item.kind === 'meal') costs.food += item.costUsd
        else if (item.kind === 'stay') costs.stay += item.costUsd
        else if (item.kind === 'shopping') costs.shopping += item.costUsd
        else if (
          item.kind === 'local-transfer' ||
          item.kind === 'city-transfer' ||
          item.kind === 'airport-transfer'
        )
          costs.transport += item.costUsd
        if (item.transferAfter) costs.transport += item.transferAfter.costUsd
      }
    }
    if (cityTransferOut) costs.transport += cityTransferOut.costUsd
    costs = sumCosts(costs)

    const agenda: DayAgenda = {
      sights: flat
        .filter((it) => it.kind === 'experience')
        .map((it) => ({
          id: it.id,
          name: it.name,
          kind: it.kind,
          sourceId: it.sourceId,
          recommended: it.selectionState === 'recommended',
          mapsUrl: it.mapsUrl,
        })),
      do: flat
        .filter((it) => it.kind === 'activity')
        .map((it) => ({
          id: it.id,
          name: it.name,
          kind: it.kind,
          sourceId: it.sourceId,
          recommended: it.selectionState === 'recommended',
          mapsUrl: it.mapsUrl,
        })),
      eat: flat
        .filter((it) => it.kind === 'meal')
        .map((it) => ({
          id: it.id,
          name: it.name,
          kind: it.kind,
          sourceId: it.sourceId,
          recommended: it.selectionState === 'recommended',
          mapsUrl: it.mapsUrl,
        })),
    }

    const banner =
      exps[0] ? getExperienceImages(exps[0])[0] : acts[0] ? getActivityImages(acts[0])[0] : undefined

    const lunchCount = periods.flatMap((p) => p.items).filter((it) => it.kind === 'meal').length

    return {
      day: i + 1,
      dateLabel: addDaysLabel(input.startDate, i),
      city,
      region,
      placeId,
      theme,
      blurb,
      nightsHere,
      experienceCount: exps.length + acts.length,
      foodCount: lunchCount,
      transferCount: cityTransferOut ? 1 : 0,
      agenda,
      periods,
      costs,
      issues: [],
      hotelName: hotel?.name,
      hotelId: hotel?.id,
      stayGap,
      cityTransferOut,
      bannerImage: banner,
    }
  })

  const route: RouteStop[] = []
  for (const d of days) {
    const last = route[route.length - 1]
    if (last && last.region === d.region) {
      last.nights += 1
      last.experiences += d.experienceCount
    } else {
      route.push({
        city: d.city,
        region: d.region,
        nights: 1,
        experiences: d.experienceCount,
        kind: 'stay',
        placeId: d.placeId,
      })
    }
  }

  const hasNoStays = hotels.length === 0 && !isEmpty
  const thinCities = findThinCities(
    route,
    experiences.map((e) => e.id),
    travelStyle,
  )
  const visitedPlaceIds = [
    ...new Set(
      days
        .map((d) => d.placeId)
        .filter((id): id is PlaceId => Boolean(id)),
    ),
  ]

  const issues = buildTripLevelIssues({
    isEmpty,
    thinCities,
    visitedPlaceIds,
    daysCount: days.length,
    dismissed,
  })

  const cat = days.reduce(
    (a, d) => ({
      accommodation: a.accommodation + d.costs.stay,
      food: a.food + d.costs.food,
      transport: a.transport + d.costs.transport,
      experiences: a.experiences + d.costs.experiences,
      shopping: a.shopping + d.costs.shopping,
      other: a.other + d.costs.other,
    }),
    { accommodation: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0 },
  )
  const mid = Object.values(cat).reduce((s, n) => s + n, 0)
  const cost: CostSummaryBand = {
    low: Math.round(mid * 0.88),
    mid: Math.round(mid),
    high: Math.round(mid * 1.18),
    categories: cat,
  }

  return {
    title: 'Your Vietnam',
    generatedAt: new Date().toISOString(),
    daysCount: days.length,
    cityCount: route.length,
    experienceCount: experiences.length,
    activityCount: activities.length,
    foodCount: userRestaurants.length,
    stayCount: hotels.length,
    transferCount: days.filter((d) => d.cityTransferOut).length,
    travellersLabel: travellersLabel(groupSize),
    dateRangeLabel: dateRangeLabel(input.startDate, dayCount),
    route,
    days,
    cost,
    issues,
    isEmpty,
    hasNoStays,
    thinCities: thinCities.map((s) => {
      const pid = s.placeId ?? (route.find((r) => r.city === s.city)?.placeId as PlaceId | undefined)
      return {
        city: s.city,
        nights: s.nights,
        selectedCount: s.selectedCount,
        catalogCity: pid ? experienceCityForPlace(pid, s.city) : s.city,
      }
    }),
    mustVisit: suggestMissingCoreCities(visitedPlaceIds, days.length)
      .filter((id) => !dismissed.has(`core-city-${id}`))
      .map((id) => ({
        placeId: id,
        label: CORE_CITY_META[id]?.label ?? placeLabel(id),
        catalogCity: experienceCityForPlace(id),
      })),
  }
}

function groupIntoCities(
  experiences: Experience[],
  activities: CityActivity[],
  hotels: Hotel[],
  shopping: (typeof SHOPPING_ITEMS)[number][],
  restaurants: Restaurant[],
): CityBucket[] {
  const map = new Map<PlaceId, CityBucket>()

  function bucket(placeId: PlaceId, city: string, region: string): CityBucket {
    const existing = map.get(placeId)
    if (existing) return existing
    const created: CityBucket = {
      placeId,
      city: placeLabel(placeId) || city,
      region,
      experiences: [],
      activities: [],
      hotels: [],
      shopping: [],
    }
    map.set(placeId, created)
    return created
  }

  function place(city: string, region: string): PlaceId | null {
    return resolvePlaceId(city, region)
  }

  for (const e of experiences) {
    const id = place(e.city, e.region) ?? place(e.region, e.city) ?? 'hanoi'
    bucket(id, e.city, e.region).experiences.push(e)
  }
  for (const a of activities) {
    const id = place(a.cityName, a.cityId) ?? place(a.cityId, a.cityName) ?? 'hanoi'
    bucket(id, a.cityName, a.cityName).activities.push(a)
  }
  for (const h of hotels) {
    const id = place(h.city, h.region)
    if (!id) continue
    bucket(id, h.city, h.region).hotels.push(h)
  }
  for (const s of shopping) {
    const id = place(s.city, s.region)
    if (!id) continue
    bucket(id, s.city, s.region).shopping.push(s)
  }
  for (const r of restaurants) {
    const id = place(r.city, r.region)
    if (!id) continue
    bucket(id, r.city, r.region)
  }
  return [...map.values()]
}

function collectUserRestaurants(ids: string[], removed: Set<string>): Restaurant[] {
  const fromAllPlaces = new Map<string, Restaurant>()
  const placeIds: PlaceId[] = [
    'hanoi',
    'ninh-binh',
    'ha-long',
    'hue',
    'da-nang',
    'hoi-an',
    'hcmc',
    'nha-trang',
    'dalat',
    'sapa',
    'phu-quoc',
    'phong-nha',
  ]
  for (const pid of placeIds) {
    for (const r of restaurantsForPlace(pid)) {
      fromAllPlaces.set(r.id, r)
    }
  }
  return ids
    .filter((id) => !removed.has(`rest:${id}`))
    .map((id) => fromAllPlaces.get(id))
    .filter((r): r is Restaurant => Boolean(r))
}
