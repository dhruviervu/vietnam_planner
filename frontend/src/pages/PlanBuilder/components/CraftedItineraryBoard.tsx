import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useTripStore as usePersistedTripStore } from '../../../store/tripStore'
import { getBoundTripStore, useItineraryTripStore } from '../../../store/itineraryTripStore'
import type { ExperienceSelectionMeta } from '../types'
import type {
  ItineraryBreak,
  ItineraryDaySlot,
  ItineraryItem,
  PeriodId,
  UnscheduledSight,
  YourVietnamDay,
} from '../lib/yourVietnam/types'
import type { PlaceId } from '../../GettingAround/data/types'
import { type TransferSlot } from '../lib/yourVietnam/dayCapacity'
import { agentDwellHours } from '../lib/yourVietnam/dayAllocation'
import {
  isSight,
  layoutCompactDay,
  redistributeClosedHourSights,
  sightSourceIds,
  derivedSlotsFromDays,
} from '../lib/yourVietnam/layoutDay'
import { coordForItem, insertSourceIdIntoTour } from '../lib/yourVietnam/sightOrder'
import { usePrefetchDurationMatrix } from '../lib/yourVietnam/osrmRoute'
import { planningProfile } from '../lib/yourVietnam/planningProfile'
import { dailySpendBand, effectiveDailyUsd } from '../lib/yourVietnam/holidayKind'
import { bucketFromStart } from '../lib/yourVietnam/clockTimes'
import { parseDayEndHour, parseDayStart } from '../lib/yourVietnam/dayWindows'
import { tripIsoDate } from '../lib/yourVietnam/openingHours'
import { resolvePlaceId } from '../lib/yourVietnam/cityPins'
import { useLiveOpeningHours } from '../lib/yourVietnam/liveOpeningHours'
import type { TransportModeId } from '../lib/yourVietnam/osrmRoute'
import { DayRail } from './DayRail'
import { DayReorderSheet } from './DayReorderSheet'
import { VisitCityTimeline, VisitCityCardPreview } from './VisitCityTimeline'
import { ItineraryCityStayMap } from './ItineraryCityStayMap'
import { openItineraryTemplatesTab } from '../../../store/itineraryPlans'
import { bagMapStopsForCity } from '../lib/yourVietnam/dayMapPins'

const collision: CollisionDetection = (args) => {
  const pointer = pointerWithin(args)
  if (pointer.length) return pointer
  const rects = rectIntersection(args)
  if (rects.length) return rects
  return closestCenter(args)
}

const PERIODS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']

type PlanningSnapshot = {
  itinerarySightOrder: Record<string, string[]>
  itinerarySlotOverrides: Record<string, PeriodId>
  itineraryDayOverrides: Record<string, number>
  itineraryDaySlotOverrides: Record<string, string>
  itineraryUserPinnedIds: string[]
  itineraryDurationOverrides: Record<string, number>
  itineraryStartOverrides: Record<string, string>
  itineraryNotes: Record<string, string>
  itineraryBreaks: Record<string, ItineraryBreak[]>
  itineraryTransitModes: Record<string, TransportModeId>
  itineraryDaySlots: ItineraryDaySlot[] | null
  cityNightOverrides: Record<string, number>
  basicsDays: number
  durationKnown: boolean
  selectedExperienceIds: string[]
  selectedActivityIds: string[]
  selectedShoppingIds: string[]
  experienceMeta: Record<string, ExperienceSelectionMeta>
}

function cloneSightOrder(order: Record<string, string[]>) {
  return Object.fromEntries(Object.entries(order).map(([k, v]) => [k, [...v]]))
}

function cloneBreaks(breaks: Record<string, ItineraryBreak[]>) {
  return Object.fromEntries(
    Object.entries(breaks).map(([k, rows]) => [k, rows.map((row) => ({ ...row }))]),
  )
}

function capturePlanningSnapshot(): PlanningSnapshot {
  const s = getBoundTripStore().getState()
  return {
    itinerarySightOrder: cloneSightOrder(s.itinerarySightOrder),
    itinerarySlotOverrides: { ...s.itinerarySlotOverrides },
    itineraryDayOverrides: { ...s.itineraryDayOverrides },
    itineraryDaySlotOverrides: { ...s.itineraryDaySlotOverrides },
    itineraryUserPinnedIds: [...s.itineraryUserPinnedIds],
    itineraryDurationOverrides: { ...s.itineraryDurationOverrides },
    itineraryStartOverrides: { ...s.itineraryStartOverrides },
    itineraryNotes: { ...s.itineraryNotes },
    itineraryBreaks: cloneBreaks(s.itineraryBreaks),
    itineraryTransitModes: { ...s.itineraryTransitModes },
    itineraryDaySlots: s.itineraryDaySlots?.map((row) => ({ ...row })) ?? null,
    cityNightOverrides: { ...s.cityNightOverrides },
    basicsDays: s.basics.days,
    durationKnown: s.basics.durationKnown,
    selectedExperienceIds: [...s.selectedExperienceIds],
    selectedActivityIds: [...s.selectedActivityIds],
    selectedShoppingIds: [...s.selectedShoppingIds],
    experienceMeta: { ...s.experienceMeta },
  }
}

function restorePlanningSnapshot(snap: PlanningSnapshot) {
  getBoundTripStore().setState((state) => ({
    itinerarySightOrder: cloneSightOrder(snap.itinerarySightOrder),
    itinerarySlotOverrides: { ...snap.itinerarySlotOverrides },
    itineraryDayOverrides: { ...snap.itineraryDayOverrides },
    itineraryDaySlotOverrides: { ...snap.itineraryDaySlotOverrides },
    itineraryUserPinnedIds: [...snap.itineraryUserPinnedIds],
    itineraryDurationOverrides: { ...snap.itineraryDurationOverrides },
    itineraryStartOverrides: { ...snap.itineraryStartOverrides },
    itineraryNotes: { ...snap.itineraryNotes },
    itineraryBreaks: cloneBreaks(snap.itineraryBreaks),
    itineraryTransitModes: { ...snap.itineraryTransitModes },
    itineraryDaySlots: snap.itineraryDaySlots?.map((row) => ({ ...row })) ?? null,
    cityNightOverrides: { ...snap.cityNightOverrides },
    basics: {
      ...state.basics,
      days: snap.basicsDays,
      durationKnown: snap.durationKnown,
    },
    selectedExperienceIds: [...snap.selectedExperienceIds],
    selectedActivityIds: [...snap.selectedActivityIds],
    selectedShoppingIds: [...snap.selectedShoppingIds],
    experienceMeta: { ...snap.experienceMeta },
  }))
}

function sightIdFromOver(overId: unknown): string {
  return String(overId ?? '').replace(/^sight:/, '')
}

function sameCity(a: YourVietnamDay, b: YourVietnamDay) {
  if (a.placeId && b.placeId) return a.placeId === b.placeId
  return a.city === b.city
}

function formatSightList(names: string[]) {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

function useLg() {
  const [lg, setLg] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  )
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const on = () => setLg(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return lg
}

function useTripStoreCrossTabSync() {
  const store = useItineraryTripStore()
  useEffect(() => {
    if (!('persist' in store)) return
    function rehydrate() {
      void usePersistedTripStore.persist.rehydrate()
    }
    function onStorage(e: StorageEvent) {
      if (e.key !== 'vietnam-trip-builder') return
      rehydrate()
    }
    function onVisible() {
      if (document.visibilityState === 'visible') rehydrate()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', rehydrate)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', rehydrate)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [store])
}

type MovedSight = {
  seq: number
  sourceId: string
  item: ItineraryItem
  fromDay: YourVietnamDay
  fromOrder: string[]
  toDay: YourVietnamDay
  snapshot: PlanningSnapshot
}

type RemovedSight = {
  seq: number
  sourceId: string
  kind: 'experience' | 'activity' | 'shopping' | 'meal'
  period: PeriodId
  day: number
  slotId: string
  item: ItineraryItem
  snapshot: PlanningSnapshot
}

type PendingDeletedDay = {
  seq: number
  snapshot: PlanningSnapshot
  day: YourVietnamDay
  insertIndex: number
  sightItems: ItineraryItem[]
  sightNames: string[]
}

export function CraftedItineraryBoard({
  tripDays,
  activeDay,
  setActiveDay,
  highlightId,
  setHighlightId,
  onMoveExperience,
  mapOpen = false,
  seeVietnamItineraries = false,
  readOnly = false,
  pinMoves,
  unscheduledSights = [],
}: {
  tripDays: YourVietnamDay[]
  unscheduledSights?: UnscheduledSight[]
  pinMoves?: Record<string, string>
  activeDay: number
  setActiveDay: (day: number) => void
  highlightId: string | null
  setHighlightId: (id: string | null) => void
  itineraryExperienceIds: string[]
  itineraryActivityIds: string[]
  onMoveExperience: (id: string, slot: 'morning' | 'afternoon' | 'evening' | 'later') => void
  mapOpen?: boolean
  seeVietnamItineraries?: boolean
  readOnly?: boolean
}) {
  const useTripStore = useItineraryTripStore()
  useTripStoreCrossTabSync()

  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedActivityIds = useTripStore((s) => s.selectedActivityIds)
  const itinerarySlotOverrides = useTripStore((s) => s.itinerarySlotOverrides)
  const itineraryDayOverrides = useTripStore((s) => s.itineraryDayOverrides)
  const itineraryDaySlotOverrides = useTripStore((s) => s.itineraryDaySlotOverrides)
  const itineraryUserPinnedIds = useTripStore((s) => s.itineraryUserPinnedIds)
  const itinerarySightOrder = useTripStore((s) => s.itinerarySightOrder)
  const layoutSlotOverrides = readOnly ? {} : itinerarySlotOverrides
  const layoutDayOverrides = readOnly ? {} : itineraryDayOverrides
  const layoutDaySlotOverrides = useMemo(
    () => (readOnly ? {} : { ...itineraryDaySlotOverrides, ...pinMoves }),
    [readOnly, itineraryDaySlotOverrides, pinMoves],
  )
  const layoutSightOrder = readOnly ? {} : itinerarySightOrder
  const layoutPinnedIds = readOnly ? [] : itineraryUserPinnedIds
  const cityTransferSlot = useTripStore((s) => s.cityTransferSlot)
  const vietnamArrivalSlot = useTripStore((s) => s.vietnamArrivalSlot)
  const userStartTime = useTripStore((s) => s.userStartTime)
  const userLastSightEndTime = useTripStore((s) => s.userLastSightEndTime)
  const basics = useTripStore((s) => s.basics)

  // Pace, budget and group size all feed the schedule through one profile.
  const profile = useMemo(() => {
    const dailyUsd = effectiveDailyUsd({
      budgetAllocationKnown: basics.budgetAllocationKnown,
      budgetDailyUsd: basics.budgetDailyUsd,
      budgetKnown: basics.budgetKnown,
      budgetTarget: basics.budgetTarget,
      budgetMode: basics.budgetMode,
      days: basics.days,
      groupSize: basics.groupSize,
    })
    return planningProfile({
      pace: basics.travelStyle,
      userStartTime,
      band: dailySpendBand(dailyUsd),
      groupSize: basics.groupSize,
      dayEnd: parseDayEndHour(userLastSightEndTime) ?? undefined,
    })
  }, [basics, userStartTime, userLastSightEndTime])
  const startDate = useTripStore((s) => s.basics.startDate)
  const setItinerarySlotOverride = useTripStore((s) => s.setItinerarySlotOverride)
  const setItineraryDayOverride = useTripStore((s) => s.setItineraryDayOverride)
  const setItineraryDaySlotOverride = useTripStore((s) => s.setItineraryDaySlotOverride)
  const insertBlankItineraryDay = useTripStore((s) => s.insertBlankItineraryDay)
  const ensureItineraryDaySlots = useTripStore((s) => s.ensureItineraryDaySlots)
  const setItineraryDaySlots = useTripStore((s) => s.setItineraryDaySlots)
  const reorderItineraryDaySlots = useTripStore((s) => s.reorderItineraryDaySlots)
  const patchItinerarySightOrder = useTripStore((s) => s.patchItinerarySightOrder)
  const markSightUserPinned = useTripStore((s) => s.markSightUserPinned)

  const [docked, setDocked] = useState(false)
  const [blockedSlotId, setBlockedSlotId] = useState<string | null>(null)
  const [removedNotices, setRemovedNotices] = useState<Record<string, RemovedSight>>({})
  const [movedNotices, setMovedNotices] = useState<Record<string, MovedSight>>({})
  const [pendingDeletedDays, setPendingDeletedDays] = useState<Record<string, PendingDeletedDay>>(
    {},
  )
  const [pendingDelete, setPendingDelete] = useState<{
    target: YourVietnamDay
    sightItems: ItineraryItem[]
  } | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [dragSight, setDragSight] = useState<ItineraryItem | null>(null)
  const [reorderDaysOpen, setReorderDaysOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const opSeq = useRef(0)
  const lockGreedyRef = useRef(false)
  const lg = useLg()

  const displayDays = useMemo(() => {
    const pending = Object.values(pendingDeletedDays).sort((a, b) => a.insertIndex - b.insertIndex)
    const next = pending.length === 0 ? [...tripDays] : [...tripDays]
    for (const row of pending) {
      if (next.some((d) => d.slotId === row.day.slotId)) continue
      const idx = Math.max(0, Math.min(row.insertIndex, next.length))
      next.splice(idx, 0, row.day)
    }
    let n = 0
    return next.map((d) => {
      if (pendingDeletedDays[d.slotId]) return d
      n += 1
      return d.day === n ? d : { ...d, day: n }
    })
  }, [pendingDeletedDays, tripDays])

  useEffect(() => {
    const derived = derivedSlotsFromDays(tripDays)
    const current = useTripStore.getState().itineraryDaySlots
    if (derived.length === 0) return
    if (!current?.length) {
      ensureItineraryDaySlots(derived)
      return
    }
    if (current.length > derived.length) setItineraryDaySlots(derived)
  }, [ensureItineraryDaySlots, setItineraryDaySlots, tripDays])

  const day =
    displayDays.find((d) => d.slotId === (activeSlotId ?? '')) ??
    displayDays.find((d) => d.day === activeDay) ??
    displayDays[0]
  const cityDays = displayDays.filter(
    (d) =>
      day &&
      !pendingDeletedDays[d.slotId] &&
      ((day.placeId && d.placeId === day.placeId) || d.city === day.city),
  )
  const openHourCityDays = useMemo(
    () => redistributeClosedHourSights(cityDays, startDate, day?.placeId),
    [cityDays, day?.placeId, startDate],
  )
  const openHourDay =
    openHourCityDays.find((d) => d.slotId === day?.slotId) ?? day

  const bagSights = useMemo(
    () => tripDays.flatMap((d) => d.periods.flatMap((p) => p.items.filter(isSight))),
    [tripDays],
  )
  const dayPinCoords = useMemo(
    () =>
      (day ? cityDays : []).flatMap((d) =>
        d.periods.flatMap((p) => p.items.filter(isSight).map(coordForItem)),
      ),
    [cityDays, day],
  )
  const osrmTick = usePrefetchDurationMatrix(dayPinCoords)
  const userPinnedSet = useMemo(
    () => new Set(layoutPinnedIds),
    [layoutPinnedIds],
  )
  const isoDate = day ? tripIsoDate(startDate, day.day) : tripIsoDate(startDate, 1)
  const hoursBySourceId = useLiveOpeningHours(bagSights, isoDate)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setDocked(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const side = lg && docked
  lockGreedyRef.current =
    Object.keys(removedNotices).length > 0 ||
    Object.keys(movedNotices).length > 0 ||
    Object.keys(pendingDeletedDays).length > 0

  function ordersFor(target: YourVietnamDay): Record<PeriodId, string[]> {
    const transferSlot: TransferSlot | null =
      target.cityTransferOut && target.placeId
        ? (cityTransferSlot[target.placeId] ?? 'evening')
        : null
    const laid = layoutCompactDay({
      day: target,
      cityDays: tripDays.filter(
        (d) => (target.placeId && d.placeId === target.placeId) || d.city === target.city,
      ),
      slotOverrides: layoutSlotOverrides,
      dayOverrides: layoutDayOverrides,
      daySlotOverrides: layoutDaySlotOverrides,
        sightOrder: layoutSightOrder,
        transferSlot,
        arrivalSlot: vietnamArrivalSlot,
        hoursBySourceId,
        isoDate: tripIsoDate(startDate, target.day),
        startDate,
        profile,
        fillPool: [],
      })
    const out = { morning: [], afternoon: [], evening: [], night: [] } as Record<
      PeriodId,
      string[]
    >
    for (const p of laid.periods) {
      out[p.id] = sightSourceIds(p)
    }
    return out
  }

  const laidDay = useMemo(() => {
    if (!day) return null
    const transferSlot: TransferSlot | null =
      day.cityTransferOut && day.placeId ? (cityTransferSlot[day.placeId] ?? 'evening') : null
    const prev = tripDays.find((d) => d.day === day.day - 1)
    const prevTransferSlot: TransferSlot | null =
      prev?.cityTransferOut && prev.placeId
        ? (cityTransferSlot[prev.placeId] ?? 'evening')
        : null
    return layoutCompactDay({
      day: openHourDay,
      cityDays: openHourCityDays,
      slotOverrides: layoutSlotOverrides,
      dayOverrides: layoutDayOverrides,
      daySlotOverrides: layoutDaySlotOverrides,
      sightOrder: layoutSightOrder,
      transferSlot,
      prevTransferSlot: prev?.cityTransferOut ? prevTransferSlot : null,
      arrivalSlot: vietnamArrivalSlot,
      hoursBySourceId,
      isoDate,
      startDate,
      userPinnedIds: userPinnedSet,
      profile,
      fillPool: [],
    })
  }, [
    cityDays,
    openHourCityDays,
    openHourDay,
    cityTransferSlot,
    day,
    layoutDayOverrides,
    layoutDaySlotOverrides,
    layoutSightOrder,
    layoutSlotOverrides,
    tripDays,
    vietnamArrivalSlot,
    hoursBySourceId,
    isoDate,
    startDate,
    userPinnedSet,
    profile,
    osrmTick,
  ])

  const pendingDeletedDay = day?.slotId ? pendingDeletedDays[day.slotId] : undefined
  const isDeletedDay = Boolean(pendingDeletedDay)
  const laidSights = pendingDeletedDay
    ? pendingDeletedDay.sightItems
    : [
        ...(laidDay?.periods ?? []).flatMap((p) => p.items.filter(isSight)),
        ...(laidDay?.overflow ?? []).filter(isSight),
      ].filter((it) => it.selectionState !== 'recommended')
      .filter((it, i, all) => !it.sourceId || all.findIndex((row) => row.sourceId === it.sourceId) === i)
  const closedSights = laidSights.filter(
    (it) => Boolean(it.sourceId && hoursBySourceId[it.sourceId]?.closedToday),
  )
  const scheduledSights = laidSights.filter(
    (it) => !it.sourceId || !hoursBySourceId[it.sourceId]?.closedToday,
  )

  const ghostItems = useMemo(
    () => [
      ...Object.values(movedNotices)
        .filter((row) => row.fromDay.slotId === day?.slotId)
        .map((row) => row.item),
      ...Object.values(removedNotices)
        .filter((row) => row.slotId === day?.slotId)
        .map((row) => row.item),
    ],
    [day?.slotId, movedNotices, removedNotices],
  )
  const pendingMovedToDay = useMemo(
    () =>
      Object.fromEntries(
        Object.values(movedNotices)
          .filter((row) => row.fromDay.slotId === day?.slotId)
          .map((row) => [row.sourceId, row.toDay.day]),
      ) as Record<string, number>,
    [day?.slotId, movedNotices],
  )

  const cityMapStops = useMemo(
    () =>
      bagMapStopsForCity(
        selectedExperienceIds,
        selectedActivityIds,
        day?.placeId as PlaceId | undefined,
        day?.city ?? '',
      ),
    [day?.city, day?.placeId, selectedActivityIds, selectedExperienceIds],
  )

  function selectCityMapStop(id: string) {
    setHighlightId(id)
    const host = cityDays.find((cityDay) =>
      cityDay.periods.some((period) => period.items.some((it) => it.id === id || it.sourceId === id)),
    )
    if (host) {
      setActiveSlotId(host.slotId)
      setActiveDay(host.day)
    }
  }

  function commitSightMove(
    sourceId: string,
    fromDay: YourVietnamDay,
    fromPeriod: PeriodId,
    toDay: YourVietnamDay,
    toPeriod: PeriodId,
    toIndex: number,
    item: ItineraryItem,
  ) {
    if (!PERIODS.includes(fromPeriod) || !PERIODS.includes(toPeriod)) return
    if (!sameCity(fromDay, toDay)) return
    if (fromDay.slotId !== toDay.slotId) {
      moveSightToBestDay(sourceId, toDay, item, fromDay)
      return
    }
    const fromOrders = ordersFor(fromDay)
    const toOrders = fromDay.slotId === toDay.slotId ? fromOrders : ordersFor(toDay)
    const fromList = (fromOrders[fromPeriod] ?? []).filter((id) => id !== sourceId)
    const destList = (toOrders[toPeriod] ?? []).filter((id) => id !== sourceId)
    const idx = Math.max(0, Math.min(toIndex, destList.length))
    destList.splice(idx, 0, sourceId)
    fromOrders[fromPeriod] = fromList
    toOrders[toPeriod] = destList
    const fromTour = PERIODS.flatMap((p) => fromOrders[p] ?? []).filter(
      (id, i, arr) => arr.indexOf(id) === i,
    )
    const toTour = PERIODS.flatMap((p) => toOrders[p] ?? []).filter(
      (id, i, arr) => arr.indexOf(id) === i,
    )
    patchItinerarySightOrder({
      [`${fromDay.slotId}:${fromPeriod}`]: fromOrders[fromPeriod],
      [`${toDay.slotId}:${toPeriod}`]: toOrders[toPeriod],
      [`${fromDay.slotId}:tour`]: fromTour,
      [`${toDay.slotId}:tour`]: toTour,
    })
    setItinerarySlotOverride(sourceId, toPeriod)
    setItineraryDayOverride(sourceId, toDay.day)
    setItineraryDaySlotOverride(sourceId, toDay.slotId)
    markSightUserPinned(sourceId)
    if (item.kind === 'experience' && toPeriod !== 'night') {
      onMoveExperience(sourceId, toPeriod)
    }
  }

  function flattenDay(target: YourVietnamDay): string[] {
    const saved = itinerarySightOrder[`${target.slotId}:tour`]
    if (saved?.length) return [...new Set(saved)]
    const o = ordersFor(target)
    return PERIODS.flatMap((p) => o[p] ?? []).filter((id, i, arr) => arr.indexOf(id) === i)
  }

  function applyFlattenedOrderForDay(
    target: YourVietnamDay,
    orderedIds: string[],
    extraItems: ItineraryItem[] = [],
  ) {
    const next = [...new Set(orderedIds.filter(Boolean))]
    const durationOverrides = useTripStore.getState().itineraryDurationOverrides
    const startOverrides = useTripStore.getState().itineraryStartOverrides
    let t = parseDayStart(userStartTime)
    const byPeriod: Record<PeriodId, string[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    }
    const slotPatch: Record<string, PeriodId> = {}
    const byId = new Map(
      [...target.periods.flatMap((p) => p.items.filter(isSight)), ...extraItems].flatMap((it) =>
        it.sourceId ? [[it.sourceId, it] as const] : [],
      ),
    )
    for (const id of next) {
      if (startOverrides[id]) t = Math.max(t, parseDayStart(startOverrides[id]))
      const bucket = bucketFromStart(t)
      byPeriod[bucket].push(id)
      slotPatch[id] = bucket
      t += (durationOverrides[id] ?? agentDwellHours(id, next)) + 10 / 60
    }
    useTripStore.setState((state) => ({
      itinerarySightOrder: {
        ...state.itinerarySightOrder,
        [`${target.slotId}:morning`]: byPeriod.morning,
        [`${target.slotId}:afternoon`]: byPeriod.afternoon,
        [`${target.slotId}:evening`]: byPeriod.evening,
        [`${target.slotId}:night`]: byPeriod.night,
        [`${target.slotId}:tour`]: next,
      },
      itinerarySlotOverrides: { ...state.itinerarySlotOverrides, ...slotPatch },
      itineraryUserPinnedIds: [
        ...new Set([...state.itineraryUserPinnedIds, ...next]),
      ],
    }))
    for (const id of next) {
      const item = byId.get(id)
      const bucket = slotPatch[id]
      if (item?.kind === 'experience' && bucket && bucket !== 'night') {
        onMoveExperience(id, bucket)
      }
    }
  }

  function applyFlattenedDayOrder(orderedIds: string[]) {
    if (!day) return
    if (
      Object.values(removedNotices).some((row) => row.slotId === day.slotId) ||
      Object.keys(pendingMovedToDay).length > 0
    ) {
      return
    }
    const known = scheduledSights
      .map((it) => it.sourceId)
      .filter((id): id is string => Boolean(id))
    const next = orderedIds.filter((id) => known.includes(id))
    for (const id of known) {
      if (!next.includes(id)) next.push(id)
    }
    applyFlattenedOrderForDay(day, next)
  }

  function moveSightToBestDay(
    sourceId: string,
    toDay: YourVietnamDay,
    item: ItineraryItem,
    fromDay = day,
    snapshot?: PlanningSnapshot,
  ) {
    if (
      !fromDay ||
      fromDay.slotId === toDay.slotId ||
      pendingDeletedDays[toDay.slotId] ||
      !sameCity(fromDay, toDay)
    )
      return
    const fromOrder = flattenDay(fromDay)
    const originTourKey = `${fromDay.slotId}:tour`
    if (!useTripStore.getState().itinerarySightOrder[originTourKey]?.length) {
      patchItinerarySightOrder({ [originTourKey]: fromOrder })
    }
    const captured = snapshot ?? capturePlanningSnapshot()
    const toOrder = flattenDay(toDay).filter((id) => id !== sourceId)
    const seq = ++opSeq.current
    setMovedNotices((prev) => ({
      ...prev,
      [sourceId]: {
        seq,
        sourceId,
        item,
        fromDay,
        fromOrder,
        toDay,
        snapshot: captured,
      },
    }))
    setItineraryDayOverride(sourceId, toDay.day)
    setItineraryDaySlotOverride(sourceId, toDay.slotId)
    markSightUserPinned(sourceId)
    patchItinerarySightOrder({
      [`${toDay.slotId}:tour`]: insertSourceIdIntoTour(toOrder, sourceId),
    })
  }

  function dropNoticesFrom(seq: number) {
    setMovedNotices((prev) => {
      const next = { ...prev }
      for (const [id, row] of Object.entries(next)) {
        if (row.seq >= seq) delete next[id]
      }
      return next
    })
    setRemovedNotices((prev) => {
      const next = { ...prev }
      for (const [id, row] of Object.entries(next)) {
        if (row.seq >= seq) delete next[id]
      }
      return next
    })
    setPendingDeletedDays((prev) => {
      const next = { ...prev }
      for (const [id, row] of Object.entries(next)) {
        if (row.seq >= seq) delete next[id]
      }
      return next
    })
  }

  function undoMove(sourceId: string) {
    const row = movedNotices[sourceId]
    if (!row) return
    restorePlanningSnapshot(row.snapshot)
    dropNoticesFrom(row.seq)
  }

  function addEmptyDayAfter(
    afterSlotId: string,
    focus = true,
  ): { slotId: string; day: number } | null {
    insertBlankItineraryDay(afterSlotId, derivedSlotsFromDays(tripDays))
    const slots = useTripStore.getState().itineraryDaySlots
    if (!slots?.length) return null
    const idx = slots.findIndex((s) => s.id === afterSlotId)
    const inserted = idx >= 0 ? slots[idx + 1] : null
    if (!inserted) return null
    const dayNum = idx + 2
    if (focus) setActiveDay(dayNum)
    return { slotId: inserted.id, day: dayNum }
  }

  function moveSightToNewDay(sourceId: string, item: ItineraryItem) {
    if (!day) return
    const last = cityDays[cityDays.length - 1] ?? day
    const fromOrder = flattenDay(day)
    const originTourKey = `${day.slotId}:tour`
    if (!useTripStore.getState().itinerarySightOrder[originTourKey]?.length) {
      patchItinerarySightOrder({ [originTourKey]: fromOrder })
    }
    const snapshot = capturePlanningSnapshot()
    const created = addEmptyDayAfter(last.slotId, false)
    if (!created) return
    const stub: YourVietnamDay = {
      ...day,
      day: created.day,
      slotId: created.slotId,
      blank: true,
      periods: PERIODS.map((id) => ({
        id,
        label: id,
        windowLabel: '',
        items: [],
      })),
    }
    moveSightToBestDay(sourceId, stub, item, day, snapshot)
  }

  function moveUnplacedSightsToNewDay(items: ItineraryItem[]) {
    if (!day) return
    const rows = items.filter((it) => Boolean(it.sourceId))
    if (rows.length === 0) return
    const last = cityDays[cityDays.length - 1] ?? day
    const fromOrder = flattenDay(day)
    const originTourKey = `${day.slotId}:tour`
    if (!useTripStore.getState().itinerarySightOrder[originTourKey]?.length) {
      patchItinerarySightOrder({ [originTourKey]: fromOrder })
    }
    const snapshot = capturePlanningSnapshot()
    const created = addEmptyDayAfter(last.slotId, false)
    if (!created) return
    const stub: YourVietnamDay = {
      ...day,
      day: created.day,
      slotId: created.slotId,
      blank: true,
      periods: PERIODS.map((id) => ({
        id,
        label: id,
        windowLabel: '',
        items: [],
      })),
    }
    for (const item of rows) {
      if (item.sourceId) moveSightToBestDay(item.sourceId, stub, item, day, snapshot)
    }
    setActiveDay(created.day)
    setActiveSlotId(created.slotId)
  }

  const addDayCities = useMemo(() => {
    const seen = new Set<string>()
    const out: { city: string; afterSlotId: string }[] = []
    for (const d of tripDays) {
      const key = d.placeId || d.city
      if (seen.has(key)) continue
      const block = tripDays.filter(
        (x) => (d.placeId && x.placeId === d.placeId) || x.city === d.city,
      )
      const hasSights = block.some((x) =>
        x.periods.some((p) => p.items.some(isSight)),
      )
      if (!hasSights) continue
      seen.add(key)
      out.push({ city: d.city, afterSlotId: block[block.length - 1].slotId })
    }
    return out
  }, [tripDays])

  function onDragStart(event: DragStartEvent) {
    if (readOnly) return
    const data = event.active.data.current
    if (data?.type === 'reorder') return
    if (data?.type === 'sight') {
      setDragSight(data.item as ItineraryItem)
    }
  }

  function onDragOver(event: DragOverEvent) {
    if (readOnly) return
    if (!day) return
    const data = event.active.data.current
    if (data?.type === 'reorder') return
    const over = event.over?.data.current
    if (data?.type !== 'sight') {
      setBlockedSlotId(null)
      return
    }

    const overDay =
      over?.type === 'day' || over?.type === 'day-drop'
        ? tripDays.find((d) => d.slotId === over.slotId)
        : over?.type === 'period' || over?.type === 'sight'
          ? tripDays.find((d) => d.slotId === over.slotId)
          : null

    if (overDay && (pendingDeletedDays[overDay.slotId] || !sameCity(day, overDay))) {
      setBlockedSlotId(overDay.slotId)
      return
    }
    setBlockedSlotId(null)
  }

  function onDragEnd(event: DragEndEvent) {
    if (readOnly) {
      setDragSight(null)
      setBlockedSlotId(null)
      return
    }
    setBlockedSlotId(null)
    const { active, over } = event
    const a = active.data.current
    if (a?.type === 'reorder') {
      setDragSight(null)
      return
    }
    const o = over?.data.current
    const sourceId = a?.sourceId as string | undefined
    const item = a?.item as ItineraryItem | undefined
    const fromDay =
      tripDays.find((d) => d.slotId === a?.slotId) ??
      tripDays.find((d) => d.day === a?.dayNumber) ??
      day
    setDragSight(null)
    if (!over || !day || a?.type !== 'sight' || !sourceId || !item || !fromDay || !isSight(item)) {
      return
    }

    try {
      if (o?.type === 'day' || o?.type === 'day-drop') {
        const toDay = tripDays.find((d) => d.slotId === o.slotId)
        if (!toDay || pendingDeletedDays[toDay.slotId] || !sameCity(fromDay, toDay)) return
        const destOrders = ordersFor(toDay)
        const fromPeriod = PERIODS.includes(a.period as PeriodId)
          ? (a.period as PeriodId)
          : 'morning'
        commitSightMove(
          sourceId,
          fromDay,
          fromPeriod,
          toDay,
          fromPeriod,
          destOrders[fromPeriod]?.length ?? 0,
          item,
        )
        return
      }

      if (o?.type !== 'period' && o?.type !== 'sight') return
      const toPeriod = o.period as PeriodId
      if (!PERIODS.includes(toPeriod)) return
      const toDay = tripDays.find((d) => d.slotId === o.slotId) ?? fromDay
      if (!sameCity(fromDay, toDay)) return
      const fromPeriod = PERIODS.includes(a.period as PeriodId)
        ? (a.period as PeriodId)
        : 'morning'
      const destOrders = ordersFor(toDay)
      const dest = destOrders[toPeriod] ?? []
      let toIndex = dest.filter((id) => id !== sourceId).length
      if (o.type === 'sight') {
        const overId = sightIdFromOver(over.id)
        if (fromDay.slotId === toDay.slotId) {
          const ids = scheduledSights
            .map((it) => it.sourceId)
            .filter((id): id is string => Boolean(id))
          const oldIndex = ids.indexOf(sourceId)
          const newIndex = ids.indexOf(overId)
          if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
            applyFlattenedDayOrder(arrayMove(ids, oldIndex, newIndex))
            return
          }
        }
        if (fromPeriod === toPeriod && fromDay.slotId === toDay.slotId) {
          const oldIndex = dest.indexOf(sourceId)
          const newIndex = dest.indexOf(overId)
          if (oldIndex >= 0 && newIndex >= 0) {
            if (oldIndex === newIndex) return
            const moved = arrayMove(dest, oldIndex, newIndex)
            patchItinerarySightOrder({ [`${toDay.slotId}:${toPeriod}`]: moved })
            markSightUserPinned(sourceId)
            if (item.kind === 'experience' && toPeriod !== 'night') {
              onMoveExperience(sourceId, toPeriod)
            }
            return
          }
        }
        const idx = dest.filter((id) => id !== sourceId).findIndex((id) => id === overId)
        toIndex = idx < 0 ? dest.filter((id) => id !== sourceId).length : idx
      }
      commitSightMove(sourceId, fromDay, fromPeriod, toDay, toPeriod, toIndex, item)
    } catch {
      /* keep the day plan mounted if a drop lands in a bad state */
    }
  }

  function undoParked(sourceId: string) {
    const moved = movedNotices[sourceId]
    if (moved) {
      undoMove(sourceId)
      return
    }
    const removed = removedNotices[sourceId]
    if (!removed) return
    restorePlanningSnapshot(removed.snapshot)
    setRemovedNotices((prev) => {
      const { [sourceId]: _drop, ...rest } = prev
      return rest
    })
  }

  function removeSight(item: ItineraryItem, period: PeriodId) {
    if (!item.sourceId || !day || !isSight(item)) return
    const sourceId = item.sourceId
    const fromOrder = flattenDay(day)
    const idx = fromOrder.indexOf(sourceId)
    const later = (idx >= 0 ? fromOrder.slice(idx + 1) : fromOrder.filter((id) => id !== sourceId))
    const snapshot = capturePlanningSnapshot()
    const originTourKey = `${day.slotId}:tour`
    const nextTour = fromOrder.filter((id) => id !== sourceId)
    const starts = { ...useTripStore.getState().itineraryStartOverrides }
    delete starts[sourceId]
    for (const id of later) delete starts[id]
    useTripStore.setState({ itineraryStartOverrides: starts })
    patchItinerarySightOrder({ [originTourKey]: nextTour })
    const store = useTripStore.getState()
    if (item.kind === 'experience') store.removeExperience(sourceId)
    else if (item.kind === 'activity') store.removeActivity(sourceId)
    else if (item.kind === 'shopping' && store.selectedShoppingIds.includes(sourceId)) {
      store.toggleShopping(sourceId)
    }
    setRemovedNotices((prev) => ({
      ...prev,
      [sourceId]: {
        seq: ++opSeq.current,
        sourceId,
        kind: item.kind,
        period,
        day: day.day,
        slotId: day.slotId,
        item,
        snapshot,
      },
    }))
  }

  function sightsForTarget(target: YourVietnamDay): ItineraryItem[] {
    if (target.slotId === day?.slotId) {
      return scheduledSights.filter((it) => it.sourceId && isSight(it))
    }
    const transferSlot: TransferSlot | null =
      target.cityTransferOut && target.placeId
        ? (cityTransferSlot[target.placeId] ?? 'evening')
        : null
    const laid = layoutCompactDay({
      day: target,
      cityDays: tripDays.filter(
        (d) => (target.placeId && d.placeId === target.placeId) || d.city === target.city,
      ),
      slotOverrides: layoutSlotOverrides,
      dayOverrides: layoutDayOverrides,
      daySlotOverrides: layoutDaySlotOverrides,
      sightOrder: layoutSightOrder,
      transferSlot,
      arrivalSlot: vietnamArrivalSlot,
      hoursBySourceId,
      isoDate: tripIsoDate(startDate, target.day),
      startDate,
      userPinnedIds: userPinnedSet,
      profile,
      fillPool: [],
    })
    return laid.periods
      .flatMap((p) => p.items.filter(isSight))
      .filter((it) => it.selectionState !== 'recommended' && it.sourceId)
  }

  function requestDeleteDay(slotId: string) {
    const liveCount = displayDays.filter((d) => !pendingDeletedDays[d.slotId]).length
    if (liveCount <= 1 || pendingDeletedDays[slotId]) return
    const target = displayDays.find((d) => d.slotId === slotId)
    if (!target) return
    setActiveSlotId(target.slotId)
    setActiveDay(target.day)
    const sightItems = sightsForTarget(target)
    const names = sightItems.map((it) => it.name).filter(Boolean)
    if (names.length > 0) {
      setPendingDelete({ target, sightItems })
      return
    }
    confirmDeleteDayFor(target, sightItems)
  }

  function confirmDeleteDayFor(target: YourVietnamDay, sightItems: ItineraryItem[]) {
    const liveCount = displayDays.filter((d) => !pendingDeletedDays[d.slotId]).length
    if (liveCount <= 1 || pendingDeletedDays[target.slotId]) return
    const snapshot = capturePlanningSnapshot()
    const insertIndex = displayDays.findIndex((d) => d.slotId === target.slotId)
    const seq = ++opSeq.current
    const store = useTripStore.getState()
    for (const it of sightItems) {
      if (!it.sourceId) continue
      if (it.kind === 'experience') store.removeExperience(it.sourceId)
      else if (it.kind === 'activity') store.removeActivity(it.sourceId)
    }
    store.ensureItineraryDaySlots(derivedSlotsFromDays(tripDays))
    store.removeItineraryDaySlot(target.slotId, derivedSlotsFromDays(tripDays))
    setPendingDelete(null)
    setPendingDeletedDays((prev) => ({
      ...prev,
      [target.slotId]: {
        seq,
        snapshot,
        day: target,
        insertIndex: insertIndex < 0 ? displayDays.length : insertIndex,
        sightItems,
        sightNames: sightItems.map((it) => it.name),
      },
    }))
    setActiveSlotId(target.slotId)
    setActiveDay(target.day)
  }

  function confirmDeleteDay() {
    if (pendingDelete) {
      confirmDeleteDayFor(pendingDelete.target, pendingDelete.sightItems)
      return
    }
    if (!day) return
    confirmDeleteDayFor(day, sightsForTarget(day))
  }

  function undoDeletedDay() {
    if (!day) return
    const row = pendingDeletedDays[day.slotId]
    if (!row) return
    restorePlanningSnapshot(row.snapshot)
    setPendingDeletedDays((prev) => {
      const { [day.slotId]: _drop, ...rest } = prev
      return rest
    })
    setActiveSlotId(row.day.slotId)
    setActiveDay(row.day.day)
    setPendingDelete(null)
  }

  const rail = (
    <DayRail
      days={displayDays}
      activeDay={day?.day ?? activeDay}
      activeSlotId={day?.slotId ?? activeSlotId}
      onSelect={(num, slotId) => {
        setActiveDay(num)
        setActiveSlotId(slotId)
        if (!pendingDeletedDays[slotId]) setPendingDelete(null)
      }}
      variant={side ? 'side' : 'top'}
      blockedSlotId={blockedSlotId}
      addDayCities={readOnly ? [] : addDayCities}
      onAddEmptyDay={
        readOnly
          ? undefined
          : (afterSlotId) => {
              addEmptyDayAfter(afterSlotId)
            }
      }
      onDeleteDay={readOnly ? undefined : requestDeleteDay}
      canDeleteDay={!readOnly && displayDays.filter((d) => !pendingDeletedDays[d.slotId]).length > 1}
      deletedSlotIds={Object.keys(pendingDeletedDays)}
      onChangeDayOrder={readOnly ? undefined : () => setReorderDaysOpen(true)}
    />
  )

  if (!day) {
    return (
      <div className="mt-6 rounded-[16px] border border-dashed border-ink/15 bg-paper px-4 py-8 text-center">
        <p className="text-[0.92rem] font-semibold text-ink">No days to show yet.</p>
        {seeVietnamItineraries ? (
          <button
            type="button"
            onClick={openItineraryTemplatesTab}
            className="mt-4 rounded-full bg-terracotta px-3.5 py-1.5 text-[0.78rem] font-bold text-paper hover:bg-ink"
          >
            See Itineraries for Vietnam
          </button>
        ) : null}
      </div>
    )
  }

  const cityLeftovers = unscheduledSights.filter(
    (s) =>
      s.city === day.city ||
      (day.placeId != null && resolvePlaceId(s.city) === day.placeId),
  )
  const leftoverSights = cityLeftovers.filter((s) => s.kind !== 'restaurant')
  const leftoverMeals = cityLeftovers.filter((s) => s.kind === 'restaurant')

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setDragSight(null)
        setBlockedSlotId(null)
      }}
    >
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

        {!side ? (
          <div className="sticky top-16 z-30 mt-5 space-y-2 bg-cream/90 py-2 backdrop-blur-sm">
            {rail}
          </div>
        ) : null}

        <div
          className={`mt-4 ${
            side ? 'grid items-start gap-5 lg:grid-cols-[7.75rem_minmax(0,1fr)]' : ''
          }`}
        >
          {side ? rail : null}
          <div className="min-w-0">
            <div className="relative z-10">
                {mapOpen && day ? (
                  <ItineraryCityStayMap
                    key={`${day.placeId ?? day.city}-open`}
                    stops={cityMapStops}
                    cityLabel={day.city}
                    placeId={day.placeId as PlaceId | undefined}
                    activeStopId={highlightId}
                    onSelectStop={selectCityMapStop}
                  />
                ) : null}
            </div>
            {pendingDelete && pendingDelete.target.slotId === day.slotId ? (
              <div className="mt-3 mb-1 rounded-[16px] border border-terracotta/25 bg-terracotta/8 px-4 py-3">
                <p className="text-[0.86rem] leading-relaxed text-ink">
                  On this day you are visiting{' '}
                  {formatSightList(pendingDelete.sightItems.map((it) => it.name).filter(Boolean))}.
                  Move these sights to another Day or they will be deleted.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="rounded-full border border-ink/12 bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteDay}
                    className="rounded-full bg-ink px-3 py-1.5 text-[0.72rem] font-bold text-paper hover:bg-terracotta"
                  >
                    Delete day
                  </button>
                </div>
              </div>
            ) : null}
            <VisitCityTimeline
              day={day}
              displayDayNumber={isDeletedDay ? undefined : day.day}
              cityDays={cityDays}
              deletedSlotIds={Object.keys(pendingDeletedDays)}
              sights={scheduledSights}
              closedSights={closedSights}
              tourOrder={flattenDay(day)}
              hoursBySourceId={hoursBySourceId}
              isoDate={isoDate}
              highlightId={highlightId}
              onHighlight={setHighlightId}
              onRemoveSight={removeSight}
              onUndoSight={undoParked}
              pendingRemovedIds={
                isDeletedDay
                  ? scheduledSights
                      .map((it) => it.sourceId)
                      .filter((id): id is string => Boolean(id))
                  : Object.keys(removedNotices).filter(
                      (id) => removedNotices[id].slotId === day.slotId,
                    )
              }
              pendingMovedToDay={pendingMovedToDay}
              ghostItems={ghostItems}
              onReorder={applyFlattenedDayOrder}
              onMoveToDay={(sourceId, toDay, item) =>
                moveSightToBestDay(sourceId, toDay, item)
              }
              onMoveToNewDay={moveSightToNewDay}
              onMoveUnplacedToNewDay={moveUnplacedSightsToNewDay}
              dayDeleted={Boolean(isDeletedDay)}
              onUndoDeletedDay={undoDeletedDay}
              seeVietnamItineraries={seeVietnamItineraries}
              readOnly={readOnly}
            />
            {leftoverSights.length > 0 ? (
              <p className="mt-3 rounded-[14px] border border-ink/10 bg-paper px-4 py-3 text-[0.8rem] leading-relaxed text-ink/75">
                <span className="font-bold text-ink">No room at this pace in {day.city}:</span>{' '}
                {formatSightList(leftoverSights.map((s) => s.name))}. Every day here is already full, so
                these are left off rather than squeezed in.
              </p>
            ) : null}
            {leftoverMeals.length > 0 ? (
              <p className="mt-3 rounded-[14px] border border-ink/10 bg-paper px-4 py-3 text-[0.8rem] leading-relaxed text-ink/75">
                <span className="font-bold text-ink">More places to eat than meals in {day.city}:</span>{' '}
                {formatSightList(leftoverMeals.map((s) => s.name))}. Every meal here is already taken by
                another pick of yours; swap one in if you prefer it.
              </p>
            ) : null}
          </div>
        </div>

      <DayReorderSheet
        open={reorderDaysOpen}
        days={displayDays.filter((d) => !pendingDeletedDays[d.slotId])}
        onClose={() => setReorderDaysOpen(false)}
        onReorder={(orderedIds) => {
          ensureItineraryDaySlots(derivedSlotsFromDays(tripDays))
          reorderItineraryDaySlots(orderedIds)
        }}
      />
      <DragOverlay dropAnimation={null}>
        {dragSight ? <VisitCityCardPreview item={dragSight} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
