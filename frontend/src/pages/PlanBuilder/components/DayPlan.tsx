import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ExperienceSelectionMeta } from '../types'
import type {
  DayPeriod,
  ItineraryItem,
  PeriodId,
  YourVietnamDay,
} from '../lib/yourVietnam/types'
import {
  experiencesCitySectionTo,
  experiencesCityUrl,
  foodUrl,
  gettingAroundLongUrl,
  gettingAroundUrbanUrl,
  itineraryItemHref,
  openDetailHref,
  placeMapsUrl,
  whereToStayUrl,
} from '../lib/yourVietnam/links'
import { experienceCityForPlace } from '../lib/yourVietnam/cityPins'
import type { PlaceId } from '../../GettingAround/data/types'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { useTripStore } from '../../../store/tripStore'
import {
  applyDurationLayout,
  arrivalCaps,
  arrivalUsable,
  includesOnboardMeal,
  leftoverAfter,
  layoutSightsByDuration,
  intersectPeriods,
  sumSightHours,
  usablePeriods,
  windowHours,
  PERIOD_CAP,
  type ArrivalSlot,
  type TransferSlot,
} from '../lib/yourVietnam/dayCapacity'
import { SightSwapOverlay } from './SightSwapOverlay'
import { AddToDayDrawer } from './AddToDayDrawer'

const PERIOD_WINDOWS: Record<PeriodId, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

function isSight(item: ItineraryItem): item is ItineraryItem & {
  kind: 'experience' | 'activity' | 'shopping' | 'meal'
} {
  return (
    item.kind === 'experience' ||
    item.kind === 'activity' ||
    item.kind === 'shopping' ||
    (item.kind === 'meal' && Boolean(item.sourceId))
  )
}

function isArrivalItem(item: ItineraryItem, dayNumber: number) {
  return item.kind === 'airport-transfer' && (item.transferAccent === 'arrival' || dayNumber === 1)
}

function displayPeriodOf(
  item: ItineraryItem,
  overrides: Record<string, PeriodId>,
): PeriodId {
  if (item.sourceId && overrides[item.sourceId]) return overrides[item.sourceId]
  return item.period
}

function regroupPeriods(
  periods: DayPeriod[],
  overrides: Record<string, PeriodId>,
): DayPeriod[] {
  const buckets: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  for (const period of periods) {
    for (const item of period.items) {
      buckets[displayPeriodOf(item, overrides)].push(item)
    }
  }
  return periods.map((period) => ({ ...period, items: buckets[period.id] }))
}

function mergeCityDayPeriods(
  day: YourVietnamDay,
  cityDays: YourVietnamDay[],
  dayOverrides: Record<string, number>,
): DayPeriod[] {
  const kept = day.periods.map((period) => ({
    ...period,
    items: period.items.filter((it) => {
      if (!it.sourceId || dayOverrides[it.sourceId] == null) return true
      return dayOverrides[it.sourceId] === day.day
    }),
  }))
  const incoming = cityDays
    .filter((d) => d.day !== day.day)
    .flatMap((d) => d.periods.flatMap((p) => p.items))
    .filter((it) => it.sourceId && dayOverrides[it.sourceId] === day.day)
  if (incoming.length === 0) return kept
  const extra: Record<PeriodId, ItineraryItem[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  }
  for (const it of incoming) {
    extra[it.period]?.push(it)
  }
  return kept.map((period) => ({ ...period, items: [...period.items, ...extra[period.id]] }))
}

function pinSourceIdsFrom(periods: DayPeriod[], overrides: Record<string, PeriodId>) {
  const ids = new Set<string>()
  for (const period of periods) {
    for (const it of period.items) {
      if (isSight(it) && it.sourceId && overrides[it.sourceId]) ids.add(it.sourceId)
    }
  }
  return ids
}

function isLightWindow(sightCount: number, remaining: number) {
  if (remaining < 0.75) return false
  return sightCount < 2 || remaining >= 1.25
}

function hidePackedConnectors(items: ItineraryItem[]) {
  return items.filter((it) => it.kind !== 'local-transfer' && it.kind !== 'city-transfer')
}

function stubMeal(
  city: string,
  region: string,
  period: 'afternoon' | 'night',
  dayNumber: number,
): ItineraryItem {
  const lunch = period === 'afternoon'
  return {
    id: `simple-meal:${city}:${period}:${dayNumber}`,
    kind: 'meal',
    name: lunch ? 'Lunch · local meal' : 'Dinner · local meal',
    selectionState: 'recommended',
    period,
    timeLabel: lunch ? 'Around midday' : 'Night meal',
    durationLabel: '~60–90 min',
    locationLabel: city,
    city,
    region,
    description: lunch
      ? 'A sit-down or market lunch in the middle of the day.'
      : 'A sit-down dinner after you are back at your stay.',
    costUsd: 8,
    costBand: 'Mid',
    icon: '🍜',
    mapsUrl: placeMapsUrl(lunch ? 'lunch' : 'dinner', city),
    tags: ['Food', 'Recommended'],
    reason: lunch ? 'Lunch for this afternoon.' : 'Dinner for tonight.',
  }
}

function stubHaveLunch(
  city: string,
  region: string,
  dayNumber: number,
  onboard: boolean,
): ItineraryItem {
  return {
    id: `have-lunch:${city}:${dayNumber}`,
    kind: 'meal',
    name: 'Have Lunch',
    selectionState: 'recommended',
    period: 'afternoon',
    timeLabel: 'Midday',
    durationLabel: '~45–75 min',
    locationLabel: city,
    city,
    region,
    description: onboard
      ? 'Lunch is typically included on this outing.'
      : 'A simple lunch stop near today’s sights.',
    costUsd: 0,
    costBand: 'Mid',
    icon: '🍽️',
    mapsUrl: placeMapsUrl('lunch', city),
    tags: onboard ? ['HaveLunch', 'Onboard'] : ['HaveLunch'],
    reason: onboard ? 'Onboard meal day.' : 'Long-day lunch.',
  }
}

function stubSnack(city: string, region: string, dayNumber: number): ItineraryItem {
  return {
    id: `simple-snack:${city}:${dayNumber}`,
    kind: 'meal',
    name: 'Evening snack',
    selectionState: 'recommended',
    period: 'evening',
    timeLabel: 'Late afternoon · evening',
    durationLabel: '~20–40 min',
    locationLabel: city,
    city,
    region,
    description: 'A small bite between afternoon sights and dinner.',
    costUsd: 4,
    costBand: 'Low',
    icon: '🧋',
    mapsUrl: placeMapsUrl('snack', city),
    tags: ['Food', 'Recommended', 'Snack'],
    reason: 'A pause after 2–3 sights before dinner.',
  }
}

function isSnackMeal(item: ItineraryItem) {
  return item.kind === 'meal' && (/snack/i.test(item.name) || item.id.includes('snack'))
}

function isHaveLunch(item: ItineraryItem) {
  return item.kind === 'meal' && (item.tags?.includes('HaveLunch') || item.id.includes('have-lunch'))
}

function isDinnerMeal(item: ItineraryItem) {
  if (item.kind !== 'meal' || isSnackMeal(item) || isHaveLunch(item)) return false
  return item.period === 'evening' || item.period === 'night' || /dinner/i.test(item.name)
}

function isSitDownLunch(item: ItineraryItem) {
  if (item.kind !== 'meal' || isSnackMeal(item) || isHaveLunch(item) || isDinnerMeal(item)) return false
  return item.period === 'afternoon' || /lunch/i.test(item.name)
}

function isCookingItem(item: ItineraryItem) {
  return /cook|kitchen/i.test(`${item.name} ${item.sourceId ?? ''}`)
}

const PERIOD_RANK: Record<PeriodId, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
  night: 3,
}

function stubStay(
  city: string,
  hotelName: string | undefined,
  stayGap: boolean | undefined,
  dayNumber: number,
): ItineraryItem {
  return {
    id: `stay-gap:${city}:${dayNumber}`,
    kind: 'stay',
    name: 'Relax in your Hotel/Stay',
    selectionState: stayGap || !hotelName ? 'recommended' : 'selected',
    period: 'night',
    timeLabel: 'Overnight',
    locationLabel: hotelName ?? city,
    city,
    region: city,
    description: 'You can Order Food On These Apps',
    costUsd: 0,
    icon: '🏨',
    mapsUrl: placeMapsUrl(hotelName ?? 'hotels', city),
    tags: ['Stay'],
  }
}

function ensureDayRhythm(
  laid: {
    periods: DayPeriod[]
    overflow: ItineraryItem[]
    spanNote: Record<string, string>
    remaining: Record<PeriodId, number>
  },
  day: YourVietnamDay,
  opts?: { skipNight?: boolean; arrival?: ArrivalSlot },
) {
  const from = opts?.arrival
  const on = (id: PeriodId) => !from || PERIOD_RANK[id] >= PERIOD_RANK[from]
  const onboard = laid.periods
    .flatMap((p) => p.items)
    .some((it) => isSight(it) && includesOnboardMeal(it))
  const spanAfternoon = Object.values(laid.spanNote).some((note) => /afternoon/i.test(note))
  const haveLunchInstead = onboard || spanAfternoon
  const dinners = laid.periods
    .flatMap((p) => p.items)
    .filter(isDinnerMeal)
  const periods = laid.periods.map((period) => {
    let items = [...period.items]
    if (period.id === 'afternoon' && on('afternoon') && !items.some(isCookingItem)) {
      if (haveLunchInstead) {
        items = items.filter((it) => !isSitDownLunch(it))
        if (!items.some(isHaveLunch)) {
          items.unshift(stubHaveLunch(day.city, day.region, day.day, onboard))
        }
      } else if (!items.some((it) => it.kind === 'meal')) {
        items.unshift(stubMeal(day.city, day.region, 'afternoon', day.day))
      }
    }
    if (period.id === 'evening' && on('evening')) {
      items = items.filter((it) => !isDinnerMeal(it))
      if (!items.some(isSnackMeal)) {
        items.unshift(stubSnack(day.city, day.region, day.day))
      }
    }
    if (!opts?.skipNight && period.id === 'night') {
      for (const dinner of dinners) {
        if (!items.some((it) => it.id === dinner.id)) items.unshift(dinner)
      }
      if (!items.some((it) => it.kind === 'meal' && !isSnackMeal(it) && !isHaveLunch(it))) {
        items.unshift(stubMeal(day.city, day.region, 'night', day.day))
      }
      if (!items.some((it) => it.kind === 'stay')) {
        items.push(stubStay(day.city, day.hotelName, day.stayGap, day.day))
      }
    }
    return { ...period, items }
  })
  return { ...laid, periods }
}

function placeDay1Arrival(periods: DayPeriod[], slot: ArrivalSlot): DayPeriod[] {
  const arrivals: ItineraryItem[] = []
  const without = periods.map((period) => {
    const kept: ItineraryItem[] = []
    for (const it of period.items) {
      if (isArrivalItem(it, 1)) arrivals.push({ ...it, period: slot })
      else kept.push(it)
    }
    return { ...period, items: kept }
  })
  if (arrivals.length === 0) return periods
  return without.map((period) =>
    period.id === slot ? { ...period, items: [...arrivals, ...period.items] } : period,
  )
}

export function DayPlan({
  day,
  nextDay,
  prevDay,
  cityDays,
  highlightId,
  itinerarySourceIds,
  onRemoveItem,
  onRestoreItem,
  onAddSuggestion,
  onSkipSuggestion,
  onMoveExperience,
  onSwapItem,
  onAddPeriod,
}: {
  day: YourVietnamDay
  nextDay?: YourVietnamDay
  prevDay?: YourVietnamDay
  cityDays?: YourVietnamDay[]
  highlightId: string | null
  itinerarySourceIds: string[]
  onRemoveItem: (item: ItineraryItem) => void
  onRestoreItem: (item: ItineraryItem) => void
  onAddSuggestion: (id: string, kind?: 'experience' | 'activity' | 'restaurant') => void
  onSkipSuggestion: (sourceId: string) => void
  onMoveExperience: (experienceId: string, slot: ExperienceSelectionMeta['preferredSlot']) => void
  onSwapItem: (from: ItineraryItem, to: { kind: 'experience' | 'activity'; id: string }) => void
  onAddPeriod?: (period: PeriodId) => void
}) {
  void onAddSuggestion
  void onSkipSuggestion

  const breakfastAtHotel = useTripStore((s) => s.breakfastAtHotel)
  const setBreakfastAtHotel = useTripStore((s) => s.setBreakfastAtHotel)
  const cityTransferSlot = useTripStore((s) => s.cityTransferSlot)
  const setCityTransferSlot = useTripStore((s) => s.setCityTransferSlot)
  const itinerarySlotOverrides = useTripStore((s) => s.itinerarySlotOverrides)
  const setItinerarySlotOverride = useTripStore((s) => s.setItinerarySlotOverride)
  const itineraryDayOverrides = useTripStore((s) => s.itineraryDayOverrides)
  const setItineraryDayOverride = useTripStore((s) => s.setItineraryDayOverride)
  const vietnamArrivalSlot = useTripStore((s) => s.vietnamArrivalSlot)

  const sameCityDays = cityDays?.length ? cityDays : [day]
  const siblingDays = sameCityDays.filter((d) => d.day !== day.day)

  const [swapItem, setSwapItem] = useState<ItineraryItem | null>(null)
  const [swapOriginals, setSwapOriginals] = useState<Record<string, ItineraryItem>>({})
  const [ghosts, setGhosts] = useState<{ day: number; item: ItineraryItem }[]>([])
  const [lastMove, setLastMove] = useState<{
    sourceId: string
    from: PeriodId
    fromDay: number
    kind: 'experience' | 'activity' | 'shopping' | 'meal'
  } | null>(null)
  const [localAdd, setLocalAdd] = useState<{ period: PeriodId; placeId: PlaceId } | null>(null)
  const [pendingSlot, setPendingSlot] = useState<TransferSlot | null>(null)

  const taken = new Set(itinerarySourceIds)
  const transferSlot: TransferSlot | null =
    day.cityTransferOut && day.placeId ? (cityTransferSlot[day.placeId] ?? 'evening') : null
  const prevTransferSlot: TransferSlot | null =
    prevDay?.cityTransferOut && prevDay.placeId
      ? (cityTransferSlot[prevDay.placeId] ?? 'evening')
      : null
  const urbanHref = gettingAroundUrbanUrl()
  const longHref = gettingAroundLongUrl()
  const catalogCity = day.placeId
    ? experienceCityForPlace(day.placeId as PlaceId, day.city)
    : day.city
  const nextCatalogCity = nextDay?.placeId
    ? experienceCityForPlace(nextDay.placeId as PlaceId, nextDay.city)
    : nextDay?.city ?? ''

  const originLayout = useMemo(() => {
    const cityList = cityDays?.length ? cityDays : [day]
    let periods = mergeCityDayPeriods(day, cityList, itineraryDayOverrides)
    periods = regroupPeriods(periods, itinerarySlotOverrides).map((period) => ({
      ...period,
      items: hidePackedConnectors(period.items),
    }))
    if (day.day === 1) periods = placeDay1Arrival(periods, vietnamArrivalSlot)
    if (transferSlot) {
      const hide = new Set(leftoverAfter(transferSlot))
      periods = periods.map((period) =>
        hide.has(period.id)
          ? { ...period, items: period.items.filter((it) => !isSight(it)) }
          : period,
      )
    }
    if (prevDay?.cityTransferOut) {
      const hide = new Set(leftoverAfter(prevTransferSlot ?? 'evening'))
      periods = periods.filter((period) => !hide.has(period.id))
    }
    const transferUsable = usablePeriods(transferSlot)
    const usable =
      day.day === 1 ? intersectPeriods(transferUsable, arrivalUsable(vietnamArrivalSlot)) : transferUsable
    const caps = day.day === 1 ? arrivalCaps(vietnamArrivalSlot) : undefined
    const pinSourceIds = pinSourceIdsFrom(periods, itinerarySlotOverrides)
    return ensureDayRhythm(applyDurationLayout(periods, usable, { caps, pinSourceIds }), day, {
      arrival: day.day === 1 ? vietnamArrivalSlot : undefined,
    })
  }, [
    day,
    itineraryDayOverrides,
    itinerarySlotOverrides,
    prevDay?.cityTransferOut,
    prevTransferSlot,
    cityDays,
    transferSlot,
    vietnamArrivalSlot,
  ])

  const originPeriods = originLayout.periods
  const originOverflow = originLayout.overflow
  const originSpanNote = originLayout.spanNote
  const originCaps = day.day === 1 ? arrivalCaps(vietnamArrivalSlot) : undefined

  const lightHints = useMemo(() => {
    const hints: string[] = []
    const seen = new Set<string>()
    const push = (label: string) => {
      if (seen.has(label)) return
      seen.add(label)
      hints.push(label)
    }
    for (const period of originPeriods) {
      const count = period.items.filter(isSight).length
      const rem = originLayout.remaining[period.id] ?? 0
      if (isLightWindow(count, rem)) push(PERIOD_WINDOWS[period.id])
    }
    for (const other of siblingDays) {
      let periods = mergeCityDayPeriods(other, cityDays?.length ? cityDays : [other], itineraryDayOverrides)
      periods = regroupPeriods(periods, itinerarySlotOverrides).map((period) => ({
        ...period,
        items: hidePackedConnectors(period.items),
      }))
      const tslot: TransferSlot | null =
        other.cityTransferOut && other.placeId ? (cityTransferSlot[other.placeId] ?? 'evening') : null
      const usable =
        other.day === 1
          ? intersectPeriods(usablePeriods(tslot), arrivalUsable(vietnamArrivalSlot))
          : usablePeriods(tslot)
      const caps = other.day === 1 ? arrivalCaps(vietnamArrivalSlot) : undefined
      const pinSourceIds = pinSourceIdsFrom(periods, itinerarySlotOverrides)
      const laid = applyDurationLayout(periods, usable, { caps, pinSourceIds })
      for (const period of laid.periods) {
        const count = period.items.filter(isSight).length
        const rem = laid.remaining[period.id] ?? 0
        if (isLightWindow(count, rem)) {
          push(`Day ${other.day} ${period.id}`)
        }
      }
    }
    return hints
  }, [
    cityDays,
    cityTransferSlot,
    itineraryDayOverrides,
    itinerarySlotOverrides,
    originLayout.remaining,
    originPeriods,
    siblingDays,
    vietnamArrivalSlot,
  ])

  const leftoverLayout = useMemo(() => {
    const emptyRemaining: Record<PeriodId, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    }
    if (!nextDay || !transferSlot) {
      return {
        periods: [] as DayPeriod[],
        overflow: [] as ItineraryItem[],
        spanNote: {} as Record<string, string>,
        remaining: emptyRemaining,
      }
    }
    const leftover = leftoverAfter(transferSlot)
    if (leftover.length === 0) {
      return {
        periods: [] as DayPeriod[],
        overflow: [] as ItineraryItem[],
        spanNote: {} as Record<string, string>,
        remaining: emptyRemaining,
      }
    }
    const grouped = regroupPeriods(
      mergeCityDayPeriods(nextDay, [nextDay], itineraryDayOverrides),
      itinerarySlotOverrides,
    ).map((period) => ({
      ...period,
      items: hidePackedConnectors(period.items),
    }))
    const slice = grouped.filter((period) => leftover.includes(period.id))
    const pinSourceIds = pinSourceIdsFrom(slice, itinerarySlotOverrides)
    return ensureDayRhythm(applyDurationLayout(slice, leftover, { pinSourceIds }), nextDay, {
      skipNight: true,
    })
  }, [itineraryDayOverrides, itinerarySlotOverrides, nextDay, transferSlot])

  const leftoverPeriods = leftoverLayout.periods

  function applySightMove(item: ItineraryItem, slot: PeriodId, opts?: { toDay?: number; trackUndo?: boolean }) {
    if (!item.sourceId || !isSight(item)) return
    const from = displayPeriodOf(item, itinerarySlotOverrides)
    const fromDay = itineraryDayOverrides[item.sourceId] ?? day.day
    if (opts?.trackUndo !== false) {
      setLastMove({ sourceId: item.sourceId, from, fromDay, kind: item.kind })
    }
    setItinerarySlotOverride(item.sourceId, slot)
    if (opts?.toDay != null) setItineraryDayOverride(item.sourceId, opts.toDay)
    if (item.kind === 'experience' && slot !== 'night') onMoveExperience(item.sourceId, slot)
  }

  function moveItem(item: ItineraryItem, slot: PeriodId, displayPeriod: PeriodId) {
    if (!item.sourceId || !isSight(item)) return
    if (slot === displayPeriod) return
    applySightMove(item, slot)
  }

  function moveItemToDay(item: ItineraryItem, toDay: number, slot: PeriodId) {
    if (!item.sourceId || !isSight(item)) return
    applySightMove(item, slot, { toDay })
  }

  function undoMove() {
    if (!lastMove) return
    setItinerarySlotOverride(lastMove.sourceId, lastMove.from)
    setItineraryDayOverride(lastMove.sourceId, lastMove.fromDay)
    if (lastMove.kind === 'experience' && lastMove.from !== 'night') {
      onMoveExperience(lastMove.sourceId, lastMove.from)
    }
    setLastMove(null)
  }

  function requestAdd(period: PeriodId, placeId?: string) {
    if (placeId && day.placeId && placeId !== day.placeId) {
      setLocalAdd({ period, placeId: placeId as PlaceId })
      return
    }
    onAddPeriod?.(period)
  }

  function pickTransferSlot(next: TransferSlot) {
    if (!day.placeId) return
    if (next === 'evening') {
      setPendingSlot(null)
      setCityTransferSlot(day.placeId, 'evening')
      return
    }
    setPendingSlot(next)
  }

  function confirmMorningLeave() {
    if (!day.placeId) return
    setCityTransferSlot(day.placeId, 'morning')
    setPendingSlot(null)
  }

  function travelNextMorning() {
    if (!day.placeId) return
    setCityTransferSlot(day.placeId, 'evening')
    setPendingSlot(null)
  }

  function confirmAfternoonLeave() {
    if (!day.placeId) return
    const sights = regroupPeriods(day.periods, itinerarySlotOverrides)
      .flatMap((p) => p.items)
      .filter(isSight)
    const { placed } = layoutSightsByDuration(sights, ['morning'])
    for (const row of placed) {
      if (!row.item.sourceId) continue
      setItinerarySlotOverride(row.item.sourceId, 'morning')
      if (row.item.kind === 'experience') onMoveExperience(row.item.sourceId, 'morning')
    }
    setCityTransferSlot(day.placeId, 'afternoon')
    setPendingSlot(null)
  }

  function cancelPendingSlot() {
    setPendingSlot(null)
  }

  const selectSlot = pendingSlot ?? transferSlot ?? 'evening'
  const usedWindowHours = sumSightHours(originPeriods.flatMap((p) => p.items))

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Day {String(day.day).padStart(2, '0')} · {day.dateLabel}
          </p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight text-ink">
            {day.theme}
          </h2>
          <p className="mt-1 max-w-[48ch] text-[0.92rem] text-muted">{day.blurb}</p>
        </div>
        {day.bannerImage && (
          <img
            src={day.bannerImage}
            alt=""
            loading="lazy"
            className="h-20 w-28 rounded-2xl object-cover shadow-soft sm:h-24 sm:w-36"
          />
        )}
      </div>

      {day.cityTransferOut && transferSlot && day.placeId && (
        <div className="mt-6 rounded-[24px] border border-amber-700/25 bg-gradient-to-br from-amber-50 to-cream px-5 py-5 sm:px-6">
          <p className="font-serif text-[1.35rem] font-semibold leading-snug text-ink sm:text-[1.5rem]">
            On this Day You will be Going From {day.city} to {day.cityTransferOut.toCity}
          </p>
          <p className="mt-2 max-w-[54ch] text-[0.9rem] text-ink/80">
            You choose the time of day and how you travel. This itinerary keeps origin-city sights
            before you leave, then picks up the next city after you arrive.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={longHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openDetailHref(longHref, e)}
              className="inline-flex rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper"
            >
              How do I Move Between Cities
            </a>
            <label className="text-[0.8rem] font-bold text-muted">
              Leave in the{' '}
              <select
                className="ml-1 rounded-md border border-ink/10 bg-paper px-2 py-1 text-[0.8rem] text-ink"
                value={selectSlot}
                onChange={(e) => pickTransferSlot(e.target.value as TransferSlot)}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </label>
          </div>
          {pendingSlot === 'morning' && (
            <div className="mt-4 rounded-[16px] border border-amber-700/20 bg-paper/80 px-4 py-3">
              <p className="text-[0.9rem] font-semibold text-ink">
                You will miss sights in {day.city} — you can travel on the next day morning instead.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmMorningLeave}
                  className="rounded-full bg-ink px-4 py-2 text-[0.8rem] font-bold text-paper"
                >
                  Leave this morning
                </button>
                <button
                  type="button"
                  onClick={travelNextMorning}
                  className="rounded-full bg-paper px-4 py-2 text-[0.8rem] font-bold text-ink ring-1 ring-ink/10"
                >
                  Travel next morning instead
                </button>
              </div>
            </div>
          )}
          {pendingSlot === 'afternoon' && (
            <div className="mt-4 rounded-[16px] border border-amber-700/20 bg-paper/80 px-4 py-3">
              <p className="text-[0.9rem] font-semibold text-ink">
                You may have to skip sights in {day.city}. Are you sure?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmAfternoonLeave}
                  className="rounded-full bg-ink px-4 py-2 text-[0.8rem] font-bold text-paper"
                >
                  Yes, leave in the afternoon
                </button>
                <button
                  type="button"
                  onClick={cancelPendingSlot}
                  className="rounded-full bg-paper px-4 py-2 text-[0.8rem] font-bold text-ink ring-1 ring-ink/10"
                >
                  No, keep evening
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 space-y-8">
        {originPeriods.map((period) => (
          <PeriodBlock
            key={period.id}
            periodId={period.id}
            label={period.label}
            windowLabel={period.windowLabel}
            items={period.items}
            ghosts={ghosts
              .filter((g) => g.day === day.day && g.item.period === period.id)
              .map((g) => g.item)}
            catalogCity={catalogCity}
            dayNumber={day.day}
            hotelName={day.hotelName}
            breakfastAtHotel={breakfastAtHotel}
            onBreakfastChange={setBreakfastAtHotel}
            highlightId={highlightId}
            swapOriginals={swapOriginals}
            lastMoveId={lastMove?.sourceId ?? null}
            suppressBreakfast={day.day === 1 && vietnamArrivalSlot !== 'morning'}
            spanNote={originSpanNote}
            remainingHours={originLayout.remaining[period.id] ?? 0}
            overloaded={
              sumSightHours(period.items) > (originCaps?.[period.id] ?? PERIOD_CAP[period.id]) + 0.05
            }
            lightHints={lightHints.filter((h) => h.toLowerCase() !== PERIOD_WINDOWS[period.id].toLowerCase())}
            siblingDays={siblingDays}
            onRemoveItem={onRemoveItem}
            onRestoreItem={onRestoreItem}
            onMoveItem={(item, slot) => moveItem(item, slot, period.id)}
            onMoveItemToDay={moveItemToDay}
            onUndoMove={undoMove}
            onOpenSwap={setSwapItem}
            onAddPeriod={(period) => requestAdd(period, day.placeId)}
            onGhost={(item) =>
              setGhosts((prev) => [...prev.filter((g) => g.item.id !== item.id), { day: day.day, item }])
            }
            onClearGhost={(id) => setGhosts((prev) => prev.filter((g) => g.item.id !== id))}
            onUndoSwap={(current) => {
              const original = current.sourceId ? swapOriginals[current.sourceId] : undefined
              if (!original) return
              onRemoveItem(current)
              onRestoreItem(original)
              setSwapOriginals((prev) => {
                const next = { ...prev }
                if (current.sourceId) delete next[current.sourceId]
                return next
              })
            }}
          />
        ))}
      </div>

      {originOverflow.length > 0 && (
        <div className="mt-8 space-y-3 rounded-[22px] border border-terracotta/25 bg-terracotta/8 px-4 py-4 sm:px-5">
          <h3 className="font-serif text-[1.2rem] font-semibold text-ink">
            Visit this Sight If You Have Time and Energy
          </h3>
          <p className="text-[0.88rem] text-ink/80">
            These do not fit today&apos;s windows. We are not dropping them. Lowest review volume is
            listed first — skip yourself if you prefer.
          </p>
          <ul className="space-y-3">
            {originOverflow.map((item) => {
              const photos = itemPhotos(item)
              return (
              <li key={`overflow-${item.id}`}>
                <div className="rounded-[18px] border border-ink/8 bg-paper px-4 py-3">
                  <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)]">
                    <div>
                      <p className="font-serif text-[1.1rem] font-semibold text-ink">{item.name}</p>
                      <p className="mt-1 text-[0.8rem] text-muted">
                        {item.durationLabel ?? 'Longer than this part of the day'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGhosts((prev) => [
                              ...prev.filter((g) => g.item.id !== item.id),
                              { day: day.day, item },
                            ])
                            onRemoveItem(item)
                          }}
                          className="rounded-full bg-cream px-3.5 py-1.5 text-[0.78rem] font-bold text-ink"
                        >
                          I’ll skip this
                        </button>
                      </div>
                    </div>
                    {photos.length > 0 && (
                      <div
                        className="grid min-h-[5.5rem] gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, minmax(0, 1fr))`,
                        }}
                      >
                        {photos.slice(0, 3).map((src) => (
                          <div
                            key={src}
                            className="relative min-h-[5.5rem] overflow-hidden rounded-[12px] bg-cream"
                          >
                            <img
                              src={src}
                              alt=""
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
              )
            })}
          </ul>
        </div>
      )}

      {day.cityTransferOut && (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-amber-700/25 bg-gradient-to-br from-amber-50 to-cream px-5 py-5 sm:px-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-800">
            City transfer
          </p>
          <h3 className="mt-1 font-serif text-[1.5rem] font-semibold text-ink">
            {day.city} → {day.cityTransferOut.toCity}
          </h3>
          <p className="mt-1 text-[0.9rem] text-muted">
            {day.cityTransferOut.icon} {day.cityTransferOut.modeLabel} ·{' '}
            {day.cityTransferOut.durationLabel}
          </p>
          <p className="mt-2 max-w-[48ch] text-[0.88rem] italic text-ink/80">
            {day.cityTransferOut.reason}
          </p>
          <a
            href={longHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openDetailHref(longHref, e)}
            className="mt-3 inline-block text-[0.84rem] font-bold text-amber-800 hover:underline"
          >
            How do I Move Between Cities
          </a>
        </div>
      )}

      {leftoverPeriods.length > 0 && nextDay && (
        <div className="mt-8 space-y-8">
          <p className="font-serif text-[1.25rem] font-semibold text-ink">
            After you arrive in {nextDay.city}
          </p>
          {leftoverPeriods.map((period) => (
            <PeriodBlock
              key={`next-${period.id}`}
              periodId={period.id}
              label={period.label}
              windowLabel={period.windowLabel}
              items={period.items}
              ghosts={ghosts
                .filter((g) => g.day === nextDay.day && g.item.period === period.id)
                .map((g) => g.item)}
              catalogCity={nextCatalogCity}
              dayNumber={nextDay.day}
              hotelName={nextDay.hotelName}
              breakfastAtHotel={breakfastAtHotel}
              onBreakfastChange={setBreakfastAtHotel}
              highlightId={highlightId}
              swapOriginals={swapOriginals}
              lastMoveId={lastMove?.sourceId ?? null}
              suppressBreakfast
              spanNote={leftoverLayout.spanNote}
              remainingHours={leftoverLayout.remaining[period.id] ?? 0}
              overloaded={sumSightHours(period.items) > PERIOD_CAP[period.id] + 0.05}
              lightHints={[]}
              siblingDays={[]}
              onRemoveItem={onRemoveItem}
              onRestoreItem={onRestoreItem}
              onMoveItem={(item, slot) => moveItem(item, slot, period.id)}
              onMoveItemToDay={moveItemToDay}
              onUndoMove={undoMove}
              onOpenSwap={setSwapItem}
              onAddPeriod={(period) => requestAdd(period, nextDay.placeId)}
              onGhost={(item) =>
                setGhosts((prev) => [
                  ...prev.filter((g) => g.item.id !== item.id),
                  { day: nextDay.day, item },
                ])
              }
              onClearGhost={(id) => setGhosts((prev) => prev.filter((g) => g.item.id !== id))}
              onUndoSwap={(current) => {
                const original = current.sourceId ? swapOriginals[current.sourceId] : undefined
                if (!original) return
                onRemoveItem(current)
                onRestoreItem(original)
                setSwapOriginals((prev) => {
                  const next = { ...prev }
                  if (current.sourceId) delete next[current.sourceId]
                  return next
                })
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <a
          href={urbanHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openDetailHref(urbanHref, e)}
          className="inline-flex rounded-full bg-ink px-5 py-3 text-[0.88rem] font-bold text-paper"
        >
          How Will I Travel Inside the City
        </a>
      </div>

      {swapItem && (
        <SightSwapOverlay
          item={swapItem}
          itinerarySourceIds={taken}
          sameDaySourceIds={
            new Set(
              [
                ...day.periods.flatMap((p) => p.items),
                ...(leftoverPeriods.flatMap((p) => p.items) ?? []),
              ].flatMap((it) =>
                (it.kind === 'experience' || it.kind === 'activity') && it.sourceId
                  ? [it.sourceId]
                  : [],
              ),
            )
          }
          onClose={() => setSwapItem(null)}
          onSwap={(candidate) => {
            onSwapItem(swapItem, candidate)
            if (candidate.id) {
              setSwapOriginals((prev) => ({ ...prev, [candidate.id]: swapItem }))
            }
            setSwapItem(null)
          }}
        />
      )}

      {localAdd && (
        <AddToDayDrawer
          placeId={localAdd.placeId}
          period={localAdd.period}
          packedExperienceIds={itinerarySourceIds}
          packedActivityIds={itinerarySourceIds}
          city={localAdd.placeId === day.placeId ? day.city : nextDay?.city}
          nightsHere={localAdd.placeId === day.placeId ? day.nightsHere : nextDay?.nightsHere}
          usedPeriodHours={sumSightHours(
            (localAdd.placeId === day.placeId ? originPeriods : leftoverPeriods).find(
              (p) => p.id === localAdd.period,
            )?.items ?? [],
          )}
          usedWindowHours={
            localAdd.placeId === day.placeId
              ? usedWindowHours
              : sumSightHours(leftoverPeriods.flatMap((p) => p.items))
          }
          windowHoursTotal={
            localAdd.placeId === day.placeId
              ? windowHours(transferSlot)
              : windowHours(null, leftoverAfter(transferSlot ?? 'evening'))
          }
          isTransferDay={Boolean(day.cityTransferOut) && localAdd.placeId === day.placeId}
          onClose={() => setLocalAdd(null)}
          onAdded={() => setLocalAdd(null)}
        />
      )}
    </section>
  )
}

function PeriodBlock({
  periodId,
  label,
  windowLabel,
  items,
  ghosts,
  catalogCity,
  dayNumber,
  hotelName,
  breakfastAtHotel,
  onBreakfastChange,
  highlightId,
  swapOriginals,
  lastMoveId,
  suppressBreakfast,
  spanNote = {},
  remainingHours = 0,
  overloaded = false,
  lightHints = [],
  siblingDays = [],
  onRemoveItem,
  onRestoreItem,
  onMoveItem,
  onMoveItemToDay,
  onUndoMove,
  onOpenSwap,
  onAddPeriod,
  onGhost,
  onClearGhost,
  onUndoSwap,
}: {
  periodId: PeriodId
  label: string
  windowLabel: string
  items: ItineraryItem[]
  ghosts: ItineraryItem[]
  catalogCity: string
  dayNumber: number
  hotelName?: string
  breakfastAtHotel: boolean
  onBreakfastChange: (value: boolean) => void
  highlightId: string | null
  swapOriginals: Record<string, ItineraryItem>
  lastMoveId: string | null
  suppressBreakfast?: boolean
  spanNote?: Record<string, string>
  remainingHours?: number
  overloaded?: boolean
  lightHints?: string[]
  siblingDays?: YourVietnamDay[]
  onRemoveItem: (item: ItineraryItem) => void
  onRestoreItem: (item: ItineraryItem) => void
  onMoveItem: (item: ItineraryItem, slot: PeriodId) => void
  onMoveItemToDay: (item: ItineraryItem, toDay: number, slot: PeriodId) => void
  onUndoMove: () => void
  onOpenSwap: (item: ItineraryItem) => void
  onAddPeriod?: (period: PeriodId) => void
  onGhost: (item: ItineraryItem) => void
  onClearGhost: (id: string) => void
  onUndoSwap: (item: ItineraryItem) => void
}) {
  const cityTo = experiencesCitySectionTo(catalogCity)
  const showBreakfast = periodId === 'morning' && !suppressBreakfast
  const showAddCta = periodId !== 'night'
  const arrivals = items.filter((item) => isArrivalItem(item, dayNumber))
  const rest = items.filter((item) => !isArrivalItem(item, dayNumber))
  const sightItems = rest.filter(isSight)
  const otherRest = rest.filter((item) => !isSight(item))
  const showLessSights = sightItems.length === 0 && periodId !== 'night'
  const tooLight = isLightWindow(sightItems.length, remainingHours)
  const cityHref = experiencesCityUrl(catalogCity)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/8 pb-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{label}</h3>
          <span className="text-[0.78rem] text-muted">{windowLabel}</span>
        </div>
      </div>

      {overloaded ? (
        <div className="mt-3 rounded-[16px] border border-terracotta/25 bg-terracotta/8 px-4 py-3">
          <p className="text-[0.9rem] font-semibold text-ink">
            Too Many Sights - move some sights to other parts of the day
          </p>
          {lightHints.length > 0 ? (
            <p className="mt-1 text-[0.82rem] text-ink/80">
              Light windows: {lightHints.join(', ')}
            </p>
          ) : null}
        </div>
      ) : null}

      {arrivals.length > 0 && (
        <ul className="mt-3 space-y-3">
          {arrivals.map((item) => (
            <li key={item.id} id={`yv-item-${item.id}`}>
              <ArrivalCard item={item} highlighted={highlightId === item.id} />
            </li>
          ))}
        </ul>
      )}

      {showBreakfast && (
        <BreakfastCard
          hotelName={hotelName}
          atHotel={breakfastAtHotel}
          onChange={onBreakfastChange}
        />
      )}

      {otherRest.length > 0 || ghosts.length > 0 || sightItems.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {otherRest.map((item) => (
            <li key={item.id} id={`yv-item-${item.id}`}>
              {item.kind === 'stay' ? (
                <StayNightCard item={item} hotelName={hotelName} />
              ) : isHaveLunch(item) ? (
                <HaveLunchCard item={item} />
              ) : (
                <ItemCard
                  item={item}
                  displayPeriod={periodId}
                  highlighted={highlightId === item.id}
                  swappedFrom={item.sourceId ? swapOriginals[item.sourceId] : undefined}
                  showMoveUndo={Boolean(item.sourceId && lastMoveId === item.sourceId)}
                  spanNote={spanNote[item.id]}
                  onRemove={() => {
                    onGhost(item)
                    onRemoveItem(item)
                  }}
                  onOpenSwap={() => onOpenSwap(item)}
                  onUndoSwap={() => onUndoSwap(item)}
                  onMove={(slot) => onMoveItem(item, slot)}
                  onUndoMove={onUndoMove}
                />
              )}
            </li>
          ))}
          {sightItems.map((item) => (
            <li key={item.id} id={`yv-item-${item.id}`}>
              <ItemCard
                item={item}
                displayPeriod={periodId}
                highlighted={highlightId === item.id}
                swappedFrom={item.sourceId ? swapOriginals[item.sourceId] : undefined}
                showMoveUndo={Boolean(item.sourceId && lastMoveId === item.sourceId)}
                spanNote={spanNote[item.id]}
                siblingDays={siblingDays}
                onRemove={() => {
                  onGhost(item)
                  onRemoveItem(item)
                }}
                onOpenSwap={() => onOpenSwap(item)}
                onUndoSwap={() => onUndoSwap(item)}
                onMove={(slot) => onMoveItem(item, slot)}
                onMoveToDay={(toDay, slot) => onMoveItemToDay(item, toDay, slot)}
                onUndoMove={onUndoMove}
              />
            </li>
          ))}
          {ghosts.map((item) => (
            <li key={`ghost-${item.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-ink/8 bg-cream/70 px-4 py-3">
                <p className="text-[0.88rem] text-muted">
                  Removed <span className="font-semibold text-ink">{item.name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onRestoreItem(item)
                    onClearGhost(item.id)
                  }}
                  className="rounded-full bg-paper px-3 py-1 text-[0.78rem] font-bold text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-paper"
                >
                  Undo
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {showLessSights ? (
        <p className="mt-3 text-[0.9rem] text-muted">
          There Are less Sights For Today -{' '}
          <Link
            to={cityTo}
            title={experiencesCityUrl(catalogCity)}
            className="font-bold text-terracotta hover:underline"
          >
            Add More Sights if you&apos;re upto it!
          </Link>
        </p>
      ) : null}

      {showAddCta && (
        <button
          type="button"
          onClick={() => {
            if (tooLight) {
              openDetailHref(cityHref)
              return
            }
            onAddPeriod?.(periodId)
          }}
          className="mt-4 w-full rounded-[18px] border border-dashed border-terracotta/40 bg-terracotta/8 px-4 py-3.5 text-[0.92rem] font-bold text-terracotta hover:bg-terracotta/14"
        >
          Add more sights in the {PERIOD_WINDOWS[periodId].toLowerCase()}
        </button>
      )}
    </div>
  )
}

function StayNightCard({
  item,
  hotelName,
}: {
  item: ItineraryItem
  hotelName?: string
}) {
  const grabHref = 'https://www.grab.com/vn/food/'
  const shopeeHref = 'https://shopeefood.vn/'
  const place = hotelName || (item.locationLabel && item.locationLabel !== item.city ? item.locationLabel : null)
  return (
    <article className="rounded-[22px] border border-ink/8 bg-paper p-4 shadow-soft sm:p-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Night stay</p>
      <h4 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">Relax in your Hotel/Stay</h4>
      {place ? <p className="mt-1 text-[0.82rem] text-muted">{place}</p> : null}
      <p className="mt-2 text-[0.9rem] font-semibold text-ink">You can Order Food On These Apps</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={grabHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openDetailHref(grabHref, e)}
          className="inline-flex rounded-full bg-ink px-3.5 py-1.5 text-[0.78rem] font-bold text-paper"
        >
          GrabFood
        </a>
        <a
          href={shopeeHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openDetailHref(shopeeHref, e)}
          className="inline-flex rounded-full bg-ink px-3.5 py-1.5 text-[0.78rem] font-bold text-paper"
        >
          ShopeeFood
        </a>
      </div>
    </article>
  )
}

function HaveLunchCard({ item }: { item: ItineraryItem }) {
  const onboard = Boolean(item.tags?.includes('Onboard'))
  const nearby = foodUrl()
  return (
    <article className="rounded-[22px] border border-ink/8 bg-paper p-4 shadow-soft sm:p-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Afternoon</p>
      <h4 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">Have Lunch</h4>
      <p className="mt-1.5 max-w-[52ch] text-[0.88rem] leading-relaxed text-ink/80">
        {item.description}
      </p>
      {!onboard && (
        <a
          href={nearby}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openDetailHref(nearby, e)}
          className="mt-3 inline-flex rounded-full bg-ink px-3.5 py-1.5 text-[0.78rem] font-bold text-paper"
        >
          See Options nearby
        </a>
      )}
    </article>
  )
}

function BreakfastCard({
  hotelName,
  atHotel,
  onChange,
}: {
  hotelName?: string
  atHotel: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <article className="mt-3 rounded-[22px] border border-ink/8 bg-paper px-4 py-4 shadow-soft sm:px-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Breakfast</p>
      <h4 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
        {atHotel
          ? hotelName
            ? `Breakfast at ${hotelName}`
            : 'Breakfast at your hotel'
          : 'Breakfast nearby'}
      </h4>
      <p className="mt-1.5 max-w-[52ch] text-[0.88rem] leading-relaxed text-ink/80">
        {atHotel
          ? 'Most travellers eat at the hotel — it is the easy, usual start before you head out.'
          : 'Cafes around the hotel work if you want to wander first. The hotel breakfast is still the norm.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold ${
            atHotel ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-ink/10'
          }`}
        >
          At the hotel · recommended
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold ${
            !atHotel ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-ink/10'
          }`}
        >
          Nearby
        </button>
      </div>
    </article>
  )
}

function ArrivalCard({
  item,
  highlighted,
}: {
  item: ItineraryItem
  highlighted: boolean
}) {
  const hotelsHref = whereToStayUrl()
  const slot = useTripStore((s) => s.vietnamArrivalSlot)
  const setSlot = useTripStore((s) => s.setVietnamArrivalSlot)
  const slots: ArrivalSlot[] = ['morning', 'afternoon', 'evening', 'night']
  const labels: Record<ArrivalSlot, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  }
  return (
    <article
      className={`rounded-[22px] border border-sage/40 bg-sage/10 px-4 py-4 shadow-soft sm:px-5 ${
        highlighted ? 'ring-1 ring-terracotta/25' : ''
      }`}
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Arrival</p>
      <h4 className="mt-1 font-serif text-[1.35rem] font-semibold text-ink">Your Arrival In Vietnam</h4>
      <p className="mt-1.5 max-w-[52ch] text-[0.9rem] leading-relaxed text-ink/80">
        Set when you land. Day 1 sights fit around this window — we only use what is already in your
        bag.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {slots.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSlot(id)}
            className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold ${
              slot === id ? 'bg-ink text-paper' : 'bg-paper text-ink ring-1 ring-ink/10 hover:bg-ink/10'
            }`}
          >
            {labels[id]}
          </button>
        ))}
      </div>
      <a
        href={hotelsHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => openDetailHref(hotelsHref, e)}
        className="mt-3 inline-flex rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper"
      >
        View Some Hotels
      </a>
      <p className="mt-3 text-[0.88rem] font-semibold text-ink">
        After checking in this is you itinerary.
      </p>
      {item.timeLabel && (
        <p className="mt-1 text-[0.78rem] text-muted">{item.timeLabel}</p>
      )}
    </article>
  )
}

function itemPhotos(item: ItineraryItem): string[] {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) return getExperienceImages(exp).slice(0, 3)
  }
  if (item.kind === 'activity' && item.sourceId) {
    const act = CITY_ACTIVITIES.find((a) => a.id === item.sourceId)
    if (act) return getActivityImages(act).slice(0, 3)
  }
  return item.thumb ? [item.thumb] : []
}

function ItemCard({
  item,
  displayPeriod,
  highlighted,
  swappedFrom,
  showMoveUndo,
  spanNote,
  siblingDays = [],
  onRemove,
  onOpenSwap,
  onUndoSwap,
  onMove,
  onMoveToDay,
  onUndoMove,
}: {
  item: ItineraryItem
  displayPeriod: PeriodId
  highlighted: boolean
  swappedFrom?: ItineraryItem
  showMoveUndo: boolean
  spanNote?: string
  siblingDays?: YourVietnamDay[]
  onRemove: () => void
  onOpenSwap: () => void
  onUndoSwap: () => void
  onMove: (slot: PeriodId) => void
  onMoveToDay?: (toDay: number, slot: PeriodId) => void
  onUndoMove: () => void
}) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [otherDayOpen, setOtherDayOpen] = useState(false)
  const [pickedDay, setPickedDay] = useState<number | null>(null)
  const photos = itemPhotos(item)
  const sight = isSight(item)
  const detailHref =
    item.kind === 'experience' ||
    item.kind === 'activity' ||
    item.kind === 'meal' ||
    item.kind === 'shopping'
      ? itineraryItemHref({ kind: item.kind, sourceId: item.sourceId, mapsUrl: item.mapsUrl })
      : undefined
  const slotValue = otherDayOpen ? 'another-day' : displayPeriod
  const moveSlots: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']

  return (
    <article
      className={`rounded-[22px] border border-ink/8 bg-paper p-4 shadow-soft sm:p-5 ${
        highlighted ? 'ring-1 ring-terracotta/30' : ''
      }`}
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[1.25rem]" aria-hidden="true">
              {item.icon}
            </span>
            {detailHref ? (
              <h4 className="font-serif text-[1.18rem] font-semibold leading-snug">
                <a
                  href={detailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openDetailHref(detailHref, e)}
                  className="text-ink underline-offset-2 hover:underline"
                >
                  {item.name}
                </a>
              </h4>
            ) : (
              <h4 className="font-serif text-[1.18rem] font-semibold leading-snug text-ink">
                {item.name}
              </h4>
            )}
            {sight &&
              (swappedFrom ? (
                <button
                  type="button"
                  onClick={onUndoSwap}
                  className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                >
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSwap}
                  className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                >
                  Swap
                </button>
              ))}
          </div>
          <p className="mt-1 text-[0.82rem] text-muted">
            {item.timeLabel}
            {item.durationLabel ? ` · ${item.durationLabel}` : ''}
            {item.locationLabel ? ` · ${item.locationLabel}` : ''}
          </p>
          {item.description && (
            <p className="mt-2 max-w-[52ch] text-[0.9rem] leading-relaxed text-ink/80">
              {item.description}
            </p>
          )}
          {spanNote && (
            <p className="mt-2 text-[0.82rem] font-semibold text-sage">{spanNote}</p>
          )}
          {sight && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.sourceId && (
                <label className="text-[0.78rem] font-bold text-muted">
                  Move{' '}
                  <select
                    className="ml-1 rounded-md border border-ink/10 bg-cream px-1 py-0.5 text-[0.75rem] text-ink"
                    value={slotValue}
                    onChange={(e) => {
                      const next = e.target.value
                      if (next === 'another-day') {
                        setOtherDayOpen(true)
                        setPickedDay(siblingDays[0]?.day ?? null)
                        return
                      }
                      setOtherDayOpen(false)
                      setPickedDay(null)
                      onMove(next as PeriodId)
                    }}
                  >
                    {moveSlots.map((id) => (
                      <option key={id} value={id}>
                        {PERIOD_WINDOWS[id]}
                      </option>
                    ))}
                    {siblingDays.length > 0 ? (
                      <option value="another-day">Another day</option>
                    ) : null}
                  </select>
                </label>
              )}
              {otherDayOpen && siblingDays.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-1.5">
                  {siblingDays.map((d) => (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setPickedDay(d.day)}
                      className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${
                        pickedDay === d.day
                          ? 'bg-ink text-paper'
                          : 'bg-cream text-ink hover:bg-ink/10'
                      }`}
                    >
                      Day {d.day}
                    </button>
                  ))}
                  {pickedDay != null &&
                    moveSlots.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          onMoveToDay?.(pickedDay, id)
                          setOtherDayOpen(false)
                          setPickedDay(null)
                        }}
                        className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                      >
                        {PERIOD_WINDOWS[id]}
                      </button>
                    ))}
                </div>
              )}
              {showMoveUndo && (
                <button
                  type="button"
                  onClick={onUndoMove}
                  className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                >
                  Undo
                </button>
              )}
              {confirmRemove ? (
                <span className="flex flex-wrap items-center gap-1.5 text-[0.72rem]">
                  <span className="text-muted">
                    Are you Sure. This sight will be removed from the itinerary.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmRemove(false)
                      onRemove()
                    }}
                    className="rounded-full bg-terracotta/15 px-2 py-1 font-bold text-terracotta"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(false)}
                    className="rounded-full px-2 py-1 font-bold text-muted hover:text-ink"
                  >
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  className="rounded-full px-2.5 py-1 text-[0.72rem] font-bold text-muted hover:text-ink"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
        {photos.length > 0 && (
          <div
            className="grid min-h-[8.5rem] gap-1.5 self-stretch"
            style={{
              gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {photos.slice(0, 3).map((src) => {
              const photo = (
                <div key={src} className="relative min-h-[8.5rem] overflow-hidden rounded-[14px] bg-cream shadow-soft">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )
              if (!detailHref) return photo
              return (
                <a
                  key={src}
                  href={detailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openDetailHref(detailHref, e)}
                  className="relative min-h-[8.5rem] overflow-hidden rounded-[14px] bg-cream shadow-soft"
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}
