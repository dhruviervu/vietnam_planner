import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES, type CityActivity } from '../../data/activities'
import { HOTELS } from '../../data/hotels'
import { SHOPPING_ITEMS, shoppingDurationLabel, shoppingHours } from '../../data/shopping'
import { formatDuration } from '../../data/transport'
import { getExperienceImages } from '../pricing'
import { getActivityImages } from '../../data/activities'
import { MEAL_WINDOW, spanDays } from './itemKind'
import { canonicalSightId } from './sightIntelligence'
import { earliestOpenAt, parseHoursLabel, tripIsoDate, weekdayFromIso } from './openingHours'
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
  buildTripLevelIssues,
  decideOptionalItems,
  findThinCities,
  occupancyConflicts,
  occupancyFamilyActivity,
  occupancyFamilyExperience,
  isCafeRestaurant,
  isSnackRestaurant,
  restaurantsForPlace,
  suggestDropsForDay,
  suggestMissingCoreCities,
  CORE_CITY_META,
  type OccupancyFamily,
  type TripShapeInput,
} from './tripIntelligence'
import {
  dailySpendBand,
  effectiveDailyUsd,
  effectiveHolidayKind,
  hourBudgetForTrip,
  perDayCapacityForKind,
  styleFromHolidayKind,
} from './holidayKind'
import {
  placeLabel,
  placeLegRegion,
  resolvePlaceId,
  experienceCityForPlace,
} from './cityPins'
import { cityContext, orderTripCities } from './cityPlanning'
import { isIncludedCompanion, planningNoteFor } from './sightPlanning'
import { includesOnboardMeal } from './dayCapacity'
import { packTripStay, packVisitHours, type PackedTripCity } from './dayAllocation'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { haversineKm } from './sightOrder'
import { timePreferenceForSourceId } from './sightTiming'
import { planCityHop } from './cityHop'
import { fitCityDays, transferSpillsToNextMorning, type DayRole } from './dayFit'
import { DEFAULT_DAY_START_TIME } from './dayWindows'
import { mealWindowLabel } from './planningProfile'
import type { PlaceId } from '../../../GettingAround/data/types'
import {
  PERIOD_META,
  type CostSummaryBand,
  type DayAgenda,
  type DayCosts,
  type DayPeriod,
  type ItineraryDaySlot,
  type ItineraryItem,
  type LocalTransferHint,
  type PeriodId,
  type RouteStop,
  type UnscheduledSight,
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
  restaurantMealSlots?: Record<string, 'breakfast' | 'lunch' | 'dinner'>
  shoppingIds: string[]
  transportChoices: Record<string, TransportMode>
  experienceMeta: Record<string, ExperienceSelectionMeta>
  dismissedIssueIds?: string[]
  removedItemIds?: string[]
  skippedSuggestionIds?: string[]
  cityNightOverrides?: Record<string, number>
  itineraryDaySlots?: ItineraryDaySlot[] | null
  itineraryDaySlotOverrides?: Record<string, string>
  itinerarySightOrder?: Record<string, string[]>
  breakfastAtHotel?: boolean
  /** Clock the traveller's day starts ("HH:MM") — the board's `userStartTime`. */
  dayStartTime?: string
  itineraryStartOverrides?: Record<string, string>
  /** Authored template pins may still move off a date that makes them impossible. */
  pinsAreSuggestions?: boolean
}

type CityBucket = {
  placeId: PlaceId
  city: string
  region: string
  experiences: Experience[]
  activities: CityActivity[]
  hotels: Hotel[]
  shopping: (typeof SHOPPING_ITEMS)[number][]
  /** Places to eat the traveller chose here. */
  restaurants: Restaurant[]
}

function preferredDaysByPlace(slots?: ItineraryDaySlot[] | null): Record<string, number> {
  const out: Record<string, number> = {}
  for (const slot of slots ?? []) {
    if (!slot.placeId || slot.blank) continue
    out[slot.placeId] = (out[slot.placeId] ?? 0) + 1
  }
  return out
}

/**
 * Keep hand-pinned stops on an *existing* packed day. Leftover slot rows and
 * previous tour dumps must not invent extra hotel nights — those are the
 * packer's job, and only when the clock cannot hold the visit.
 */
function applyUserPinsToPacked(
  packed: PackedTripCity[],
  slots: ItineraryDaySlot[] | null | undefined,
  pins?: Record<string, string>,
  tours?: Record<string, string[]>,
  opts?: { lockToPackedDays?: boolean },
): PackedTripCity[] {
  const reusable = (slots ?? []).filter((s) => Boolean(s.placeId) && !s.blank)
  if (reusable.length === 0) return packed
  const lockToPackedDays = Boolean(opts?.lockToPackedDays)
  return packed.map((city) => {
    const citySlots = reusable.filter((s) => s.placeId === city.placeId)
    if (citySlots.length === 0 || city.days.length === 0) return city
    const days = city.days.map((row) => [...row])
    const authoredTours = citySlots.some((s) => (tours?.[`${s.id}:tour`]?.length ?? 0) > 0)
    if (authoredTours && !lockToPackedDays) {
      while (days.length < citySlots.length) days.push([])
    }
    const last = Math.max(0, days.length - 1)
    const slotIndex = new Map(
      citySlots.map((s, i) => [
        s.id,
        authoredTours && !lockToPackedDays ? i : Math.min(i, last),
      ]),
    )
    const moveTo = (id: string, slotId: string) => {
      if (!id) return
      const dest = slotIndex.get(slotId)
      if (dest == null) return
      for (const row of days) {
        const j = row.indexOf(id)
        if (j >= 0) row.splice(j, 1)
      }
      if (!days[dest].includes(id)) days[dest].push(id)
    }
    for (const [id, slotId] of Object.entries(pins ?? {})) {
      if (slotIndex.has(slotId)) moveTo(id, slotId)
    }
    if (!lockToPackedDays) {
      for (const slot of citySlots) {
        for (const id of tours?.[`${slot.id}:tour`] ?? []) {
          if (slotIndex.has(slot.id)) moveTo(id, slot.id)
        }
      }
    }
    return { ...city, days: days.filter((row) => row.length > 0) }
  })
}

/** A city with only places to eat: about three meals a day, the rest of the day free. */
function foodOnlyDays(b: CityBucket | undefined): number {
  if (!b || b.experiences.length + b.activities.length + b.shopping.length > 0) return 0
  return Math.max(1, Math.ceil(b.restaurants.length / 3))
}

/**
 * Check every packed day against the same timed schedule the board draws, on
 * its real date, and repair it: closed or unfittable stops move, overloaded or
 * split-across-town days shed a stop, and a city gains a day only when no
 * existing day can take the stop. Cities are walked in order so each one sees
 * the real calendar after earlier cities grew or shrank.
 */
function fitTripToClock(
  packed: PackedTripCity[],
  ctx: {
    input: BuildYourVietnamInput
    byPlace: Map<PlaceId, CityBucket>
    chosen: Hotel | undefined
    tight: boolean
    experiences: Experience[]
    activities: CityActivity[]
    shopping: ShopRow[]
    reusableSlots: ItineraryDaySlot[]
    /** Every city in visiting order, including ones with only restaurants (they take calendar days too). */
    routeOrder: PlaceId[]
    /** Filled with pinned stops the date forced onto another day (sourceId → slot id). */
    pinMoves: Record<string, string>
    /** Filled with stops a fixed-length plan has no room for. */
    dropped: UnscheduledSight[]
  },
): PackedTripCity[] {
  const { input, byPlace, chosen, tight } = ctx
  if (!input.pinsAreSuggestions) return packed
  const expById = new Map(ctx.experiences.map((e) => [e.id, e]))
  const actById = new Map(ctx.activities.map((a) => [a.id, a]))
  const shopById = new Map(ctx.shopping.map((s) => [s.id, s]))
  const itemFor = (id: string, dayIds: string[]): ItineraryItem | null => {
    const exp = expById.get(id)
    if (exp) return experienceItem(exp, dayIds)
    const act = actById.get(id)
    if (act) return activityItem(act, dayIds)
    const shop = shopById.get(id)
    return shop ? shoppingItem(shop) : null
  }
  const tours = input.itinerarySightOrder ?? {}
  const pinnedIds = new Set<string>([
    ...Object.keys(input.itineraryDaySlotOverrides ?? {}),
    ...Object.entries(tours)
      .filter(([key]) => key.endsWith(':tour'))
      .flatMap(([, ids]) => ids),
  ])
  const rows = packed.filter((row) => row.days.some((d) => d.length > 0))
  const foodDaysBefore = new Map<string, number>()
  let foodDays = 0
  for (const id of ctx.routeOrder) {
    if (rows.some((row) => row.placeId === id)) {
      foodDaysBefore.set(id, foodDays)
      foodDays = 0
    } else foodDays += foodOnlyDays(byPlace.get(id))
  }
  const extraDaysAfter = (row: string[]) =>
    row.reduce((sum, id) => sum + spanDays(expById.get(id)?.durationHours) - 1, 0)
  let dayCursor = 1
  let morningTransfer = 0
  return rows.map((row, k) => {
    dayCursor += foodDaysBefore.get(row.placeId) ?? 0
    const arrivingHours = morningTransfer
    const placeId = row.placeId as PlaceId
    const bucket = byPlace.get(placeId)
    const next = rows[k + 1]
    const nextBucket = next ? byPlace.get(next.placeId as PlaceId) : undefined
    const hopHours = next
      ? planCityHop({
          from: placeId,
          to: next.placeId as PlaceId,
          fromRegion: bucket?.region,
          toRegion: nextBucket?.region,
          fromCity: bucket?.city,
          toCity: nextBucket?.city,
          transportChoices: input.transportChoices,
          tight,
        }).plan.daytimeHours
      : 0
    const citySlots = ctx.reusableSlots.filter((s) => s.placeId === placeId)
    const fixedDays = citySlots.some((s) => (tours[`${s.id}:tour`]?.length ?? 0) > 0)
    const hotel =
      (chosen && resolvePlaceId(chosen.city, chosen.region) === placeId ? chosen : undefined) ??
      bucket?.hotels[0]
    const first = dayCursor
    const isLastCity = k === rows.length - 1
    const fitted = fitCityDays({
      rows: row.days,
      firstDayNumber: first,
      env: {
        placeId,
        city: bucket?.city ?? placeLabel(placeId),
        startDate: input.startDate,
        dayStart: input.dayStartTime ?? DEFAULT_DAY_START_TIME,
        pace: input.travelStyle,
        hotelId: hotel?.id,
        startOverrides: input.itineraryStartOverrides ?? {},
        pinnedIds,
        itemFor,
      },
      roleFor: (i, count): DayRole => ({
        arrival: first + i === 1,
        departure: isLastCity && i === count - 1,
        transferHours: (next && i === count - 1 ? hopHours : 0) + (i === 0 ? arrivingHours : 0),
      }),
      fixedDays,
      softPins: Boolean(input.pinsAreSuggestions),
      dropOverflow: fixedDays && Boolean(input.pinsAreSuggestions),
      tourOrderFor: fixedDays ? (i) => tours[`${citySlots[i]?.id}:tour`] : undefined,
      extraDaysAfter,
    })
    dayCursor += fitted.rows.length + fitted.rows.reduce((sum, ids) => sum + extraDaysAfter(ids), 0)
    morningTransfer = transferSpillsToNextMorning(input.travelStyle, fitted.lastDayHours, hopHours) ? hopHours : 0
    for (const id of fitted.unfit) {
      const exp = expById.get(id)
      const act = actById.get(id)
      const shop = shopById.get(id)
      if (exp) ctx.dropped.push({ sourceId: id, kind: 'experience', name: exp.name, city: exp.city })
      else if (act) ctx.dropped.push({ sourceId: id, kind: 'activity', name: act.name, city: act.cityName })
      else if (shop) ctx.dropped.push({ sourceId: id, kind: 'shopping', name: shop.name, city: shop.city })
    }
    const authored = input.itineraryDaySlotOverrides ?? {}
    fitted.rows.forEach((ids, i) => {
      const slotId = citySlots[i]?.id
      if (!slotId || !fixedDays || !input.pinsAreSuggestions) return
      for (const id of ids) {
        if (authored[id] && authored[id] !== slotId) ctx.pinMoves[id] = slotId
      }
    })
    return { placeId: row.placeId, days: fitted.rows }
  })
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

/** The part of the day a stop runs in, for meal clashes (a night food tour is dinner, not lunch). */
function timeOfDay(id: string): PeriodId {
  return timePreferenceForSourceId(id) === 'EVENING' ? 'evening' : 'morning'
}

function noteFamily(family: OccupancyFamily | null, period: PeriodId, dayFamilies: Set<string>) {
  if (!family) return
  dayFamilies.add(family)
  if (family === 'food-tour' && period === 'evening') dayFamilies.add('food-tour-evening')
  if (family === 'cafe' && period === 'afternoon') dayFamilies.add('cafe-afternoon')
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
    timeLabel:
      mealLabel === 'Lunch'
        ? mealWindowLabel('lunch')
        : mealLabel === 'Breakfast'
          ? mealWindowLabel('breakfast')
          : mealLabel === 'Evening meal'
            ? mealWindowLabel('evening')
            : mealLabel === 'Coffee'
              ? '14:00–17:00'
              : mealWindowLabel('dinner'),
    durationLabel: state === 'recommended' && r.priceUsd <= 8 ? '~60–90 min' : '~45–75 min',
    locationLabel: r.city,
    city: r.city,
    region: r.region,
    description: r.blurb,
    costUsd: r.priceUsd,
    costBand: r.priceLabel,
    icon: '🍜',
    thumb: r.image,
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

function hotelBreakfast(city: string, region: string, dayNumber: number, hotelName?: string): ItineraryItem {
  return {
    id: `breakfast:hotel:${city}:${dayNumber}`,
    kind: 'meal',
    name: hotelName ? `Breakfast · ${hotelName}` : 'Breakfast · hotel',
    selectionState: 'system',
    period: 'morning',
    timeLabel: mealWindowLabel('breakfast'),
    durationLabel: '08:00–09:30',
    locationLabel: city,
    city,
    region,
    description: 'Hotel breakfast before the first sight. The day starts after this window.',
    costUsd: 0,
    icon: '🥐',
    tags: ['Food', 'Breakfast'],
    reason: 'Fixed breakfast 08:00–09:30 — sights begin after.',
  }
}

type ShopRow = (typeof SHOPPING_ITEMS)[number]

function experienceItem(
  exp: Experience,
  daySightIds: string[],
  optional?: { reason?: string },
  suggestDrop = false,
): ItineraryItem {
  const images = getExperienceImages(exp)
  return {
    id: `exp:${exp.id}`,
    kind: 'experience',
    name: exp.name,
    selectionState: optional ? 'optional' : 'selected',
    period: 'morning',
    timeLabel: exp.durationLabel,
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
    planningNote: planningNoteFor(exp.id, daySightIds),
    includedStop: isIncludedCompanion(exp.id, daySightIds),
  }
}

function activityItem(
  act: CityActivity,
  daySightIds: string[],
  optional?: { reason?: string },
  suggestDrop = false,
): ItineraryItem {
  return {
    id: `act:${act.id}`,
    kind: 'activity',
    name: act.name,
    selectionState: optional ? 'optional' : 'selected',
    period: 'morning',
    timeLabel: act.durationLabel,
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
    reason: optional?.reason ?? 'Selected as a hands-on activity — we fit this beside your experiences.',
    sourceId: act.id,
    suggestDrop,
    planningNote: planningNoteFor(act.id, daySightIds),
  }
}

function shoppingItem(shop: ShopRow): ItineraryItem {
  const hours = shoppingHours(shop)
  return {
    id: `shop:${shop.id}`,
    kind: 'shopping',
    name: shop.name,
    selectionState: 'selected',
    period: 'morning',
    timeLabel: shoppingDurationLabel(hours),
    durationLabel: shoppingDurationLabel(hours),
    locationLabel: shop.city,
    city: shop.city,
    region: shop.region,
    description: shop.blurb,
    costUsd: shop.costUsd,
    costBand: shop.costLabel,
    icon: '🛍',
    mapsUrl: placeMapsUrl(shop.shop || shop.name, shop.city),
    tags: ['Shopping', shop.type],
    reason: `Scheduled in ${shop.city}.`,
    sourceId: shop.id,
  }
}

/** Calendar days an overnight expedition takes (Hang Én 2, Sơn Đoòng 4); 1 for anything shorter. */
function expeditionDays(exp: Experience): number {
  return spanDays(exp.durationHours)
}

function expeditionDayItem(
  exp: Experience,
  part: number,
  of: number,
  city: string,
  region: string,
): ItineraryItem {
  const last = part === of
  return {
    id: `expedition:${exp.id}:${part}`,
    kind: 'experience',
    name: `${exp.name} · day ${part} of ${of}`,
    selectionState: 'system',
    period: 'morning',
    timeLabel: last ? 'Walk out, back by late afternoon' : 'All day with the expedition',
    durationLabel: last ? '7 hrs' : '10 hrs',
    locationLabel: exp.city,
    city,
    region,
    description: last
      ? 'Last expedition day: break camp, trek out and ride back to town.'
      : 'In the field with the expedition team. Meals and camp are provided by the operator.',
    costUsd: 0,
    icon: exp.signalEmoji || '⛺',
    tags: ['Expedition'],
    sourceId: `${exp.id}:day-${part}`,
    reason: `${exp.name} runs over ${of} days; this day stays with it.`,
  }
}

type MealSlot = 'breakfast' | 'lunch' | 'coffee' | 'dinner'

const FAR_LUNCH_KM = 20
/** Past this much touring the afternoon has no room for a café sit-down. */
const MAX_COFFEE_DAY_HOURS = 6

type DayMealProfile = {
  placeId?: PlaceId
  sightIds: string[]
  /** A cruise, food tour or full-day outing already covers midday. */
  fedAtLunch: boolean
  /** An evening food tour or similar already is dinner. */
  dinnerTaken: boolean
  touringHours: number
  /** Out on an expedition: the operator feeds the group. */
  away: boolean
  isoDate: string
}

/** The kitchen is open long enough for this meal inside its usual window (no dinner at a breakfast-only stall). */
function openForMeal(r: Restaurant, slot: MealSlot, isoDate: string): boolean {
  const hours = parseHoursLabel(r.hours ?? '', isoDate ? weekdayFromIso(isoDate) : 1)
  const w = MEAL_WINDOW[slot]
  return Number.isFinite(earliestOpenAt(hours, w.from, w.hours, w.latestStart + w.hours))
}

/**
 * Give every restaurant the traveller chose one day and one meal in its city:
 * next to that day's sights when the restaurant lists them, never over a lunch
 * an outing already serves, cafés in the afternoon coffee slot, and busier days
 * skipped for coffee. Whatever cannot be seated comes back as leftover.
 */
function planUserMeals(
  days: DayMealProfile[],
  restaurants: Restaurant[],
  chosenSlot: (id: string) => 'breakfast' | 'lunch' | 'dinner' | undefined,
): { byDay: Partial<Record<MealSlot, Restaurant>>[]; leftover: Restaurant[] } {
  const byDay: Partial<Record<MealSlot, Restaurant>>[] = days.map(() => ({}))
  const leftover: Restaurant[] = []
  const slotOk = (d: DayMealProfile, slot: MealSlot) =>
    !d.away &&
    (slot === 'lunch'
      ? !d.fedAtLunch
      : slot === 'dinner'
        ? !d.dinnerTaken
        : slot === 'coffee'
          ? d.touringHours <= MAX_COFFEE_DAY_HOURS
          : true)
  for (const r of restaurants) {
    const placeId = resolvePlaceId(r.city, r.region)
    const explicit = chosenSlot(r.id)
    const light = isCafeRestaurant(r.name, r.cuisine) || isSnackRestaurant(r.name, r.cuisine)
    const slots: MealSlot[] =
      explicit === 'breakfast'
        ? ['breakfast', 'coffee', 'lunch']
        : explicit === 'dinner'
          ? ['dinner', 'lunch']
          : explicit === 'lunch'
            ? ['lunch', 'dinner', 'breakfast']
            : light
              ? ['coffee', 'breakfast', 'lunch']
              : ['lunch', 'dinner', 'breakfast']
    const near = new Set(r.nearExperienceIds ?? [])
    const pin = PIN_BY_SOURCE_ID[r.id]
    const kmFrom = (d: DayMealProfile) => {
      const pins = d.sightIds.map((id) => PIN_BY_SOURCE_ID[id]).filter(Boolean)
      if (!pin || !pins.length) return 0
      return Math.min(...pins.map((p) => haversineKm(pin, p)))
    }
    let placed = false
    for (const slot of slots) {
      let best = -1
      let bestScore = Infinity
      days.forEach((d, i) => {
        if (d.placeId !== placeId || byDay[i][slot] || !slotOk(d, slot)) return
        if (!openForMeal(r, slot, d.isoDate)) return
        const nextTo = d.sightIds.some((id) => near.has(id)) ? -10 : 0
        const busy = Object.keys(byDay[i]).length
        const load = slot === 'coffee' ? d.touringHours : 0
        const km = kmFrom(d)
        // Lunch sits between sights; a far-off table only works as the evening outing.
        if (slot === 'lunch' && km > FAR_LUNCH_KM) return
        const score = nextTo + busy + load + km * 0.3 + i * 0.01
        if (score < bestScore) {
          bestScore = score
          best = i
        }
      })
      if (best >= 0) {
        byDay[best][slot] = r
        placed = true
        break
      }
    }
    if (!placed) leftover.push(r)
  }
  return { byDay, leftover }
}

/**
 * Map a trip-level day assignment back onto catalog rows for one city.
 */
function materializePackedDays(
  experiences: Experience[],
  activities: CityActivity[],
  shopping: (typeof SHOPPING_ITEMS)[number][],
  planned: string[][],
): {
  exps: Experience[][]
  acts: CityActivity[][]
  shops: (typeof SHOPPING_ITEMS)[number][][]
  ordered: string[][]
  unscheduled: { experiences: Experience[]; activities: CityActivity[] }
} {
  const expById = new Map(experiences.map((e) => [e.id, e]))
  const actById = new Map(activities.map((a) => [a.id, a]))
  const shopById = new Map(shopping.map((s) => [s.id, s]))
  const n = planned.length

  const exps: Experience[][] = []
  const acts: CityActivity[][] = []
  const shops: (typeof SHOPPING_ITEMS)[number][][] = []
  for (let i = 0; i < n; i++) {
    const ordered = planned[i] ?? []
    exps.push(ordered.map((id) => expById.get(id)).filter((e): e is Experience => Boolean(e)))
    acts.push(ordered.map((id) => actById.get(id)).filter((a): a is CityActivity => Boolean(a)))
    shops.push(
      ordered
        .map((id) => shopById.get(id))
        .filter((s): s is (typeof SHOPPING_ITEMS)[number] => Boolean(s)),
    )
  }

  return {
    exps,
    acts,
    shops,
    ordered: planned,
    unscheduled: { experiences: [], activities: [] },
  }
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

  // The same place listed on two city pages is visited once.
  const seenPlaces = new Set<string>()
  const experiences = EXPERIENCES.filter(
    (e) => input.experienceIds.includes(e.id) && !removed.has(`exp:${e.id}`),
  ).filter((e) => {
    const place = canonicalSightId(e.id)
    if (seenPlaces.has(place)) return false
    seenPlaces.add(place)
    return true
  })
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

  const catalogEmpty =
    experiences.length === 0 &&
    activities.length === 0 &&
    userRestaurants.length === 0 &&
    hotels.length === 0 &&
    shopping.length === 0
  const ownedSlots = (input.itineraryDaySlots ?? []).filter((s) => Boolean(s.placeId))

  if (catalogEmpty && ownedSlots.length === 0) {
    return {
      title: 'Your Vietnam',
      generatedAt: new Date().toISOString(),
      daysCount: 0,
      cityCount: 0,
      experienceCount: 0,
      activityCount: 0,
      foodCount: 0,
      stayCount: 0,
      transferCount: 0,
      travellersLabel: travellersLabel(groupSize),
      dateRangeLabel: dateRangeLabel(input.startDate, 0),
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
      unscheduled: [],
    }
  }

  const isEmpty = catalogEmpty

  const buckets = groupIntoCities(experiences, activities, hotels, shopping, userRestaurants)
  const orderedIds = orderTripCities(buckets.map((b) => b.placeId))
  const orderedBuckets = orderedIds
    .map((id) => buckets.find((b) => b.placeId === id)!)
    .filter(Boolean)
    .filter(
      (b) =>
        b.experiences.length + b.activities.length + b.shopping.length + b.restaurants.length > 0,
    )

  const byPlace = new Map(orderedBuckets.map((b) => [b.placeId, b]))
  const slotPlaceOrder = (input.itineraryDaySlots ?? [])
    .filter((s) => Boolean(s.placeId) && !s.blank)
    .reduce<PlaceId[]>((acc, s) => {
      const id = s.placeId as PlaceId
      if (acc[acc.length - 1] !== id) acc.push(id)
      return acc
    }, [])
  const orderedFromSlots = slotPlaceOrder.filter((id) => byPlace.has(id))
  const flowIds = orderedFromSlots.length >= 2 ? orderedFromSlots : orderedIds
  const flowBuckets = flowIds
    .map((id) => byPlace.get(id)!)
    .filter(Boolean)

  const packedByPlace = new Map<PlaceId, ReturnType<typeof materializePackedDays>>()
  const dayPlaceIds: PlaceId[] = []
  const slotMeta: {
    id: string
    blank: boolean
    /** Set on the days a multi-day expedition keeps after the day it starts. */
    expedition?: { exp: Experience; part: number; of: number }
  }[] = []
  const reusableSlots = (input.itineraryDaySlots ?? []).filter(
    (s) => Boolean(s.placeId) && !s.blank,
  )
  const claimedSlotIds = new Set<string>()

  const tripCities = (flowBuckets.length ? flowBuckets : orderedBuckets).map((b) => ({
    placeId: b.placeId,
    ids: [
      ...b.experiences.map((e) => e.id),
      ...b.activities.map((a) => a.id),
      ...b.shopping.map((s) => s.id),
    ],
  }))
  const pinMoves: Record<string, string> = {}
  const dropped: UnscheduledSight[] = []
  const tripPacked = fitTripToClock(
    applyUserPinsToPacked(
      packTripStay(
        tripCities.filter((c) => c.ids.length > 0),
        input.startDate,
        1,
        input.pinsAreSuggestions ? preferredDaysByPlace(input.itineraryDaySlots) : undefined,
      ),
      input.itineraryDaySlots,
      input.itineraryDaySlotOverrides,
      input.itinerarySightOrder,
      { lockToPackedDays: !input.pinsAreSuggestions },
    ),
    {
      input,
      byPlace,
      chosen,
      tight,
      experiences,
      activities,
      shopping,
      reusableSlots,
      routeOrder: tripCities.map((c) => c.placeId as PlaceId),
      pinMoves,
      dropped,
    },
  )

  const claimDay = (placeId: PlaceId, i: number) => {
    dayPlaceIds.push(placeId)
    const reuse = reusableSlots.find((s) => s.placeId === placeId && !claimedSlotIds.has(s.id))
    if (reuse) {
      claimedSlotIds.add(reuse.id)
      slotMeta.push({ id: reuse.id, blank: false })
    } else {
      slotMeta.push({ id: `auto:${placeId}:${i}`, blank: false })
    }
  }
  const rowsInRoute = [
    ...tripCities.map((c) => tripPacked.find((row) => row.placeId === c.placeId) ?? c.placeId),
    ...tripPacked.filter((row) => !tripCities.some((c) => c.placeId === row.placeId)),
  ]
  for (const entry of rowsInRoute) {
    if (typeof entry === 'string') {
      const b = byPlace.get(entry as PlaceId)
      const foodDays = foodOnlyDays(b)
      for (let i = 0; i < foodDays; i++) claimDay(b!.placeId, i)
      continue
    }
    const row = entry
    const b = byPlace.get(row.placeId as PlaceId)
    if (!b) continue
    const packed = materializePackedDays(b.experiences, b.activities, b.shopping, row.days)
    packedByPlace.set(b.placeId, packed)
    for (let i = 0; i < packed.exps.length; i++) {
      const has =
        (packed.exps[i]?.length ?? 0) +
        (packed.acts[i]?.length ?? 0) +
        (packed.shops[i]?.length ?? 0)
      if (has <= 0) continue
      claimDay(b.placeId, i)
      const slotId = slotMeta[slotMeta.length - 1].id
      for (const exp of packed.exps[i] ?? []) {
        const of = expeditionDays(exp)
        for (let part = 2; part <= of; part++) {
          dayPlaceIds.push(b.placeId)
          slotMeta.push({ id: `${slotId}:expedition-${part}`, blank: true, expedition: { exp, part, of } })
        }
      }
    }
  }

  if (dayPlaceIds.length === 0 && ownedSlots.length > 0) {
    for (const slot of ownedSlots) {
      dayPlaceIds.push(slot.placeId as PlaceId)
      slotMeta.push({ id: slot.id, blank: true })
    }
  }

  const dayCount = dayPlaceIds.length
  const cursor = new Map<PlaceId, number>()

  const mealCursor = new Map<PlaceId, number>()
  const mealProfiles: DayMealProfile[] = dayPlaceIds.map((placeId, i) => {
    const isBlank = slotMeta[i]?.blank ?? false
    const slot = mealCursor.get(placeId) ?? 0
    if (!isBlank) mealCursor.set(placeId, slot + 1)
    const packed = packedByPlace.get(placeId)
    const exps = isBlank ? [] : packed?.exps[slot] ?? []
    const acts = isBlank ? [] : packed?.acts[slot] ?? []
    const shops = isBlank ? [] : packed?.shops[slot] ?? []
    const sightIds = [...exps.map((e) => e.id), ...acts.map((a) => a.id), ...shops.map((s) => s.id)]
    const items = [
      ...exps.map((e) => experienceItem(e, sightIds)),
      ...acts.map((a) => activityItem(a, sightIds)),
    ]
    const families = new Set<string>()
    for (const e of exps) noteFamily(occupancyFamilyExperience(e), timeOfDay(e.id), families)
    for (const a of acts) noteFamily(occupancyFamilyActivity(a), timeOfDay(a.id), families)
    const hoursOf = (id: string) => packVisitHours(id, sightIds)
    return {
      placeId,
      sightIds,
      fedAtLunch:
        items.some((it) => includesOnboardMeal(it) || (it.sourceId && hoursOf(it.sourceId) >= 5)) ||
        occupancyConflicts('sit-down-lunch', families, 'afternoon'),
      dinnerTaken:
        exps.some((e) => expeditionDays(e) > 1) ||
        occupancyConflicts('sit-down-dinner', families, 'evening'),
      touringHours: sightIds.reduce((sum, id) => sum + hoursOf(id), 0),
      away: Boolean(slotMeta[i]?.expedition),
      isoDate: input.startDate ? tripIsoDate(input.startDate, i + 1) : '',
    }
  })
  const mealPlan = planUserMeals(
    mealProfiles,
    userRestaurants,
    (id) => input.restaurantMealSlots?.[id],
  )

  const usedRestaurantIds = new Set<string>(userRestaurants.map((r) => r.id))

  const fallbackCity = orderedBuckets[0]?.city ?? 'Hanoi'
  const fallbackRegion = orderedBuckets[0]?.region ?? 'Hanoi'
  const fallbackPlace = orderedBuckets[0]?.placeId

  const builtDays: YourVietnamDay[] = Array.from({ length: dayCount }, (_, i) => {
    const placeId = dayPlaceIds[i] ?? fallbackPlace
    const isBlank = slotMeta[i]?.blank ?? false
    const slotId = slotMeta[i]?.id ?? `auto:${placeId ?? 'day'}:${i}`
    const bucket = placeId ? byPlace.get(placeId) : undefined
    const city = bucket?.city ?? fallbackCity
    const region = bucket?.region ?? fallbackRegion
    const slot = placeId ? cursor.get(placeId) ?? 0 : 0
    if (placeId && !isBlank) cursor.set(placeId, slot + 1)
    const packed = placeId ? packedByPlace.get(placeId) : undefined
    const exps = isBlank ? [] : packed?.exps[slot] ?? []
    const acts = isBlank ? [] : packed?.acts[slot] ?? []
    const shops = isBlank ? [] : packed?.shops[slot] ?? []
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

    const daySightIds = [...exps.map((e) => e.id), ...acts.map((a) => a.id), ...shops.map((s) => s.id)]
    const orderedIds = isBlank
      ? []
      : packed?.ordered[slot] ?? daySightIds
    const expFor = new Map(exps.map((e) => [e.id, e]))
    const actFor = new Map(acts.map((a) => [a.id, a]))
    const shopFor = new Map(shops.map((s) => [s.id, s]))
    const period: PeriodId = 'morning'

    for (const id of orderedIds) {
      const exp = expFor.get(id)
      if (exp) {
        periodItems[period].push(
          experienceItem(exp, daySightIds, optionalMap.get(exp.id), dropMap.has(exp.id)),
        )
        noteFamily(occupancyFamilyExperience(exp), timeOfDay(exp.id), dayFamilies)
        continue
      }
      const act = actFor.get(id)
      if (act) {
        periodItems[period].push(
          activityItem(act, daySightIds, optionalMap.get(act.id), dropMap.has(act.id)),
        )
        noteFamily(occupancyFamilyActivity(act), timeOfDay(act.id), dayFamilies)
        continue
      }
      const shop = shopFor.get(id)
      if (shop) periodItems[period].push(shoppingItem(shop))
    }
    const expedition = slotMeta[i]?.expedition
    if (expedition) {
      periodItems.morning.push(
        expeditionDayItem(expedition.exp, expedition.part, expedition.of, city, region),
      )
    }
    // Nights in camp: no restaurant dinner and no hotel bed until the walk-out day.
    const campTonight =
      exps.some((e) => expeditionDays(e) > 1) ||
      (expedition != null && expedition.part < expedition.of)

    let lunch: Restaurant | undefined
    let dinner: Restaurant | undefined
    let lunchState: ItineraryItem['selectionState'] = 'selected'
    let dinnerState: ItineraryItem['selectionState'] = 'selected'
    const onboardLunch = [...periodItems.morning, ...periodItems.afternoon, ...periodItems.evening]
      .filter((it) => it.kind === 'experience' || it.kind === 'activity')
      .some((it) => includesOnboardMeal(it))
    const dayNumber = i + 1
    const wantBreakfast = !expedition
    const planned = mealPlan.byDay[i] ?? {}

    if (planned.breakfast) {
      periodItems.morning.unshift(
        mealItem(planned.breakfast, 'morning', 'Breakfast', 'selected', dayNumber),
      )
    } else if (input.breakfastAtHotel && wantBreakfast) {
      periodItems.morning.unshift(hotelBreakfast(city, region, dayNumber, hotel?.name))
    }

    if (planned.lunch) {
      lunch = planned.lunch
    }
    if (planned.dinner) {
      dinner = planned.dinner
    }
    if (planned.coffee) {
      periodItems.afternoon.push(mealItem(planned.coffee, 'afternoon', 'Coffee', 'selected', dayNumber))
      noteFamily('cafe', 'afternoon', dayFamilies)
    }

    if (lunch) {
      usedRestaurantIds.add(lunch.id)
      if (!skipped.has(lunch.id) || lunchState === 'selected') {
        periodItems.afternoon.push(mealItem(lunch, 'afternoon', 'Lunch', lunchState, dayNumber))
        noteFamily('sit-down-lunch', 'afternoon', dayFamilies)
      }
    } else if (onboardLunch) {
      periodItems.afternoon.push({
        id: `onboard-lunch:${city}:${dayNumber}`,
        kind: 'meal',
        name: 'Lunch · onboard',
        selectionState: 'system',
        period: 'afternoon',
        timeLabel: mealWindowLabel('lunch'),
        durationLabel: '13:00–14:00',
        locationLabel: city,
        city,
        region,
        description: 'Lunch is served on the cruise / full-day outing — no separate restaurant.',
        costUsd: 0,
        icon: '🛳️',
        tags: ['Food', 'Onboard'],
        reason: 'This outing includes lunch on board.',
      })
    }

    if (dinner && dinner.id !== lunch?.id) {
      usedRestaurantIds.add(dinner.id)
      if (!skipped.has(dinner.id) || dinnerState === 'selected') {
        periodItems.night.push(mealItem(dinner, 'night', 'Dinner', dinnerState, dayNumber))
        noteFamily('sit-down-dinner', 'evening', dayFamilies)
      }
    }

    if (hotel && !campTonight) {
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
      const hop = placeId
        ? planCityHop({
            from: placeId,
            to: nextPlace,
            fromRegion: region,
            toRegion,
            fromCity: city,
            toCity,
            transportChoices: input.transportChoices,
            tight,
          }).plan
        : null
      cityTransferOut = {
        toCity,
        toRegion,
        modeLabel: hop?.modeLabel ?? 'To be chosen',
        icon: hop?.icon ?? '🚐',
        durationLabel: hop ? formatDuration(hop.durationMinutes) : 'Choose a mode',
        costUsd: hop?.costUsd ?? 0,
        reason: hop?.reason ?? `You’re moving from ${city} to ${toCity} — pick how you’ll travel in Getting Around.`,
        externalUrl: gettingAroundUrl(),
        unset: !hop,
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
        description: placeId
          ? cityContext(placeId).howToArrive
          : 'Airport → city transfer once you land.',
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
      slotId,
      blank: isBlank,
      placeId,
      theme,
      blurb,
      nightsHere,
      experienceCount: exps.length + acts.length + shops.length,
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
      cityNote: placeId ? cityContext(placeId).note : undefined,
    }
  })

  const hasSights = (d: YourVietnamDay) =>
    d.periods.some((p) =>
      p.items.some(
        (it) => it.kind === 'experience' || it.kind === 'activity' || it.kind === 'shopping',
      ),
    )
  const foodOnly = (d: YourVietnamDay) => {
    const b = d.placeId ? byPlace.get(d.placeId as PlaceId) : undefined
    return Boolean(
      b && b.restaurants.length > 0 && b.experiences.length + b.activities.length + b.shopping.length === 0,
    )
  }
  let days = builtDays.filter((d) => hasSights(d) || d.blank || foodOnly(d))
  days = days.map((d, i) => ({
    ...d,
    day: i + 1,
    dateLabel: addDaysLabel(input.startDate, i),
    nightsHere: days.filter(
      (x) => (d.placeId && x.placeId === d.placeId) || x.city === d.city,
    ).length,
  }))

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

  const hasNoStays = hotels.length === 0 && days.some(hasSights)
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

  const tripEmpty = days.length === 0
  const issues = buildTripLevelIssues({
    isEmpty: tripEmpty,
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
    dateRangeLabel: dateRangeLabel(input.startDate, days.length),
    route,
    days,
    cost,
    issues,
    pinMoves,
    isEmpty: tripEmpty,
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
    // Bagged sights that no day in their city can hold under the daily caps.
    // Reported so the board can show them instead of dropping them quietly.
    unscheduled: [...packedByPlace.values()].flatMap<UnscheduledSight>((packed) => [
      ...packed.unscheduled.experiences.map((e) => ({
        sourceId: e.id,
        kind: 'experience' as const,
        name: e.name,
        city: e.city,
      })),
      ...packed.unscheduled.activities.map((a) => ({
        sourceId: a.id,
        kind: 'activity' as const,
        name: a.name,
        city: a.cityName,
      })),
    ]).concat(
      dropped,
      mealPlan.leftover.map((r) => ({
        sourceId: r.id,
        kind: 'restaurant' as const,
        name: r.name,
        city: r.city,
      })),
    ),
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
      restaurants: [],
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
    const existing = map.get(id)
    if (existing) existing.hotels.push(h)
  }
  for (const s of shopping) {
    const id = place(s.city, s.region)
    if (!id) continue
    bucket(id, s.city, s.region).shopping.push(s)
  }
  // A city the traveller only chose places to eat in is still a stop on the trip.
  for (const r of restaurants) {
    const id = place(r.city, r.region)
    if (!id) continue
    bucket(id, r.city, r.region).restaurants.push(r)
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
