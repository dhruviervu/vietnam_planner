import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildItinerary, selectedRegionsFromExperiences } from '../pages/PlanBuilder/lib/buildItinerary'
import type {
  BudgetMode,
  BuilderStepId,
  CostTotals,
  DateMode,
  ExperienceSelectionMeta,
  HolidayKind,
  Interest,
  ItineraryDay,
  StayStyle,
  TransportMode,
  TravelStyle,
} from '../pages/PlanBuilder/types'
import { stepIndex } from '../pages/PlanBuilder/steps'
import type { StayProperty } from '../pages/WhereToStay/data/types'
import type { ItineraryBreak, ItineraryDaySlot, PeriodId } from '../pages/PlanBuilder/lib/yourVietnam/types'
import { newDaySlotId } from '../pages/PlanBuilder/lib/yourVietnam/layoutDay'
import { DEFAULT_DAY_START_TIME } from '../pages/PlanBuilder/lib/yourVietnam/dayWindows'
import type { HopTransportRule, TransportModeId } from '../pages/PlanBuilder/lib/yourVietnam/osrmRoute'
import {
  defaultItineraryPlans,
  emptyItineraryPlanning,
  type ItineraryPlan,
  type ItineraryPlanPlanning,
} from './itineraryPlans'
import { EXPERIENCES } from '../pages/PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../pages/PlanBuilder/data/activities'
import { SHOPPING_ITEMS } from '../pages/PlanBuilder/data/shopping'
import { resolvePlaceId } from '../pages/PlanBuilder/lib/yourVietnam/cityPins'

const PERSIST_KEY = 'vietnam-trip-builder'

function uniqueIds(ids: string[] | undefined, fallback: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids ?? fallback) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

export type TripBasics = {
  startDate: string
  endDate: string
  dateMode: DateMode
  flexibleMonth: number | null
  flexibleSeason: string | null
  days: number
  durationKnown: boolean
  budgetTarget: number
  budgetKnown: boolean
  budgetMode: BudgetMode
  /** legacy range fields kept in sync for itinerary cost framing */
  budgetMin: number
  budgetMax: number
  travelStyle: TravelStyle
  paceKnown: boolean
  interests: Interest[]
  groupSize: number
  groupSizeKnown: boolean
  holidayKind: HolidayKind
  holidayKindKnown: boolean
  /** Flights + stays, trip total */
  budgetFixedUsd: number
  /** Food + activities + local transit, per person per day */
  budgetDailyUsd: number
  budgetAllocationKnown: boolean
}

export type TripState = {
  basics: TripBasics
  selectedExperienceIds: string[]
  experienceMeta: Record<string, ExperienceSelectionMeta>
  selectedActivityIds: string[]
  selectedHotelIds: string[] // Stay Bag — multiple saved stays (not a single final hotel)
  comparisonStayIds: string[] // Active comparison shortlist (2–6+)
  chosenStayId: string | null // Final advisory choice from comparison
  /** Where-to-Stay listing cards set for the itinerary (StayProperty ids) */
  itineraryStayPropertyIds: string[]
  /** Stays typed in by the traveller and fetched from the web */
  customStayProperties: Record<string, StayProperty>
  startingPointBaseId: string | null
  preferredBaseId: string | null
  stayStyle: StayStyle | null
  selectedRestaurantIds: string[]
  restaurantMealSlots: Record<string, 'breakfast' | 'lunch' | 'dinner'>
  selectedShoppingIds: string[]
  transportChoices: Record<string, TransportMode>
  logisticsAcknowledged: string[]
  farthestStepIndex: number
  /** User-locked nights per Getting Around place id; other cities rebalance. */
  cityNightOverrides: Record<string, number>
  breakfastAtHotel: boolean
  cityTransferSlot: Record<string, 'morning' | 'afternoon' | 'evening'>
  itinerarySlotOverrides: Record<string, PeriodId>
  itineraryDayOverrides: Record<string, number>
  itineraryDaySlotOverrides: Record<string, string>
  /** Sights the traveller placed by hand; auto day-balancing must leave these alone. */
  itineraryUserPinnedIds: string[]
  itineraryDaySlots: ItineraryDaySlot[] | null
  itinerarySightOrder: Record<string, string[]>
  /** Visit duration the traveller set, in hours, keyed by source id. */
  itineraryDurationOverrides: Record<string, number>
  /** Per-sight start clock as "HH:MM". Later stops cascade from here. */
  itineraryStartOverrides: Record<string, string>
  itineraryNotes: Record<string, string>
  /** Custom lunch / coffee / rest blocks, keyed by day slot id. */
  itineraryBreaks: Record<string, ItineraryBreak[]>
  /** Walk / Grab / taxi choice between two stops, keyed by OSRM pair. */
  itineraryTransitModes: Record<string, TransportModeId>
  /** When each itinerary day begins, as "HH:MM". All start times derive from this. */
  userStartTime: string
  /** When set, the last sight on every day must end by this clock ("HH:MM"). */
  userLastSightEndTime: string | null
  /** If hops are longer than `overKm`, use this mode unless the traveller overrode that hop. */
  hopTransportRule: HopTransportRule | null
  vietnamArrivalSlot: PeriodId
  itineraryPlans: ItineraryPlan[]
  activeItineraryPlanId: string
  /**
   * True only after the user starts via "Build itinerary".
   * Browse links to the same builder URLs must not show the left progress rail.
   */
  itineraryPipelineActive: boolean
  enterItineraryPipeline: () => void
  exitItineraryPipeline: () => void
  setBasics: (patch: Partial<TripBasics>) => void
  toggleInterest: (interest: Interest) => void
  toggleExperience: (id: string) => void
  addExperience: (id: string, preferredSlot?: ExperienceSelectionMeta['preferredSlot']) => void
  removeExperience: (id: string) => void
  setExperienceSlot: (id: string, preferredSlot: ExperienceSelectionMeta['preferredSlot']) => void
  addActivity: (id: string) => void
  removeActivity: (id: string) => void
  toggleActivity: (id: string) => void
  toggleHotel: (id: string) => void
  toggleComparisonStay: (id: string) => void
  removeComparisonStay: (id: string) => void
  clearComparison: () => void
  setChosenStay: (id: string | null) => void
  toggleItineraryStayProperty: (id: string) => void
  upsertCustomStayProperty: (stay: StayProperty) => void
  setStartingPoint: (baseId: string | null) => void
  setPreferredBase: (baseId: string | null) => void
  setStayStyle: (style: StayStyle | null) => void
  toggleRestaurant: (id: string) => void
  setRestaurantMealSlot: (id: string, meal: 'breakfast' | 'lunch' | 'dinner') => void
  toggleShopping: (id: string) => void
  setTransportChoice: (legId: string, mode: TransportMode) => void
  toggleLogistics: (id: string) => void
  markStepVisited: (id: BuilderStepId) => void
  setCityNightOverride: (placeId: string, nights: number) => void
  setBreakfastAtHotel: (value: boolean) => void
  setCityTransferSlot: (placeId: string, slot: 'morning' | 'afternoon' | 'evening') => void
  setItinerarySlotOverride: (sourceId: string, slot: PeriodId) => void
  setItineraryDayOverride: (sourceId: string, day: number) => void
  setItineraryDaySlotOverride: (sourceId: string, slotId: string) => void
  patchItinerarySightOrder: (patch: Record<string, string[]>) => void
  setItineraryDurationOverride: (sourceId: string, hours: number | null) => void
  setItineraryStartOverride: (sourceId: string, hhmm: string | null) => void
  setItineraryNote: (sourceId: string, note: string) => void
  addItineraryBreak: (slotId: string, row: ItineraryBreak) => void
  updateItineraryBreak: (slotId: string, id: string, patch: Partial<ItineraryBreak>) => void
  removeItineraryBreak: (slotId: string, id: string) => void
  setItineraryTransitMode: (pairKey: string, mode: TransportModeId) => void
  pinSightsToSlots: (pins: Record<string, string>) => void
  markSightUserPinned: (sourceId: string) => void
  clearSightUserPin: (sourceId: string) => void
  setUserStartTime: (value: string) => void
  setUserLastSightEndTime: (value: string | null) => void
  setHopTransportRule: (rule: HopTransportRule | null) => void
  ensureItineraryDaySlots: (slots: ItineraryDaySlot[]) => void
  setItineraryDaySlots: (slots: ItineraryDaySlot[]) => void
  resetItineraryPlanning: () => void
  insertBlankItineraryDay: (afterSlotId: string, fallbackSlots?: ItineraryDaySlot[]) => void
  removeItineraryDaySlot: (slotId: string, fallbackSlots?: ItineraryDaySlot[]) => void
  setVietnamArrivalSlot: (slot: PeriodId) => void
  switchItineraryPlan: (id: string) => void
  createBlankItineraryPlan: () => void
  deleteItineraryPlan: (id: string) => void
  reorderItineraryDaySlots: (orderedIds: string[]) => void
  dropPlaceFromItinerary: (placeId: string) => void
  getSelectedRegions: () => string[]
  getItinerary: () => { days: ItineraryDay[]; totals: CostTotals }
}

const defaultBasics: TripBasics = {
  startDate: '',
  endDate: '',
  dateMode: 'unknown',
  flexibleMonth: null,
  flexibleSeason: null,
  days: 7,
  durationKnown: false,
  budgetTarget: 1200,
  budgetKnown: false,
  budgetMode: 'per-person',
  budgetMin: 800,
  budgetMax: 2000,
  travelStyle: 'balanced',
  paceKnown: false,
  interests: [],
  groupSize: 2,
  groupSizeKnown: false,
  holidayKind: 'leisure',
  holidayKindKnown: false,
  budgetFixedUsd: 600,
  budgetDailyUsd: 50,
  budgetAllocationKnown: false,
}

const PIPELINE_SESSION_KEY = 'vn-itinerary-pipeline'

function readPipelineSession(): boolean {
  try {
    if (sessionStorage.getItem(PIPELINE_SESSION_KEY) === '1') return true
    // New tabs do not share sessionStorage — keep the trip pipeline across tabs.
    return localStorage.getItem(PIPELINE_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writePipelineSession(active: boolean) {
  try {
    if (active) {
      sessionStorage.setItem(PIPELINE_SESSION_KEY, '1')
      localStorage.setItem(PIPELINE_SESSION_KEY, '1')
    } else {
      sessionStorage.removeItem(PIPELINE_SESSION_KEY)
      localStorage.removeItem(PIPELINE_SESSION_KEY)
    }
  } catch {
    /* ignore */
  }
}

function syncFromDates(basics: TripBasics): TripBasics {
  if (basics.dateMode !== 'exact' || !basics.startDate || !basics.endDate) return basics
  const start = new Date(`${basics.startDate}T12:00:00`)
  const end = new Date(`${basics.endDate}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return basics
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  if (diff < 1) return basics
  return { ...basics, days: diff, durationKnown: true }
}

function syncBudgetRange(basics: TripBasics): TripBasics {
  const t = basics.budgetTarget
  return {
    ...basics,
    budgetMin: Math.max(200, Math.round(t * 0.75)),
    budgetMax: Math.round(t * 1.25),
  }
}

function holidayKindToStyle(kind: HolidayKind): TravelStyle {
  if (kind === 'leisure') return 'relaxed'
  if (kind === 'action') return 'packed'
  return 'balanced'
}

function syncTripShaping(basics: TripBasics): TripBasics {
  let next = {
    ...basics,
    groupSize: Math.min(12, Math.max(1, Math.round(basics.groupSize) || 2)),
    budgetFixedUsd: Math.max(0, Math.round(basics.budgetFixedUsd) || 0),
    budgetDailyUsd: Math.max(0, Math.round(basics.budgetDailyUsd) || 0),
  }
  if (next.holidayKindKnown) {
    next.travelStyle = holidayKindToStyle(next.holidayKind)
    next.paceKnown = true
  }
  if (next.budgetAllocationKnown) {
    const people = next.groupSize
    const days = Math.max(1, next.days)
    next.budgetTarget = Math.round(next.budgetFixedUsd + next.budgetDailyUsd * days * people)
    next.budgetKnown = true
    next.budgetMode = 'total'
    next = syncBudgetRange(next)
  }
  return next
}

function captureItineraryPlanning(state: {
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
}): ItineraryPlanPlanning {
  return {
    itinerarySlotOverrides: { ...state.itinerarySlotOverrides },
    itineraryDayOverrides: { ...state.itineraryDayOverrides },
    itineraryDaySlotOverrides: { ...state.itineraryDaySlotOverrides },
    itineraryUserPinnedIds: [...state.itineraryUserPinnedIds],
    itinerarySightOrder: Object.fromEntries(
      Object.entries(state.itinerarySightOrder).map(([k, v]) => [k, [...v]]),
    ),
    itineraryDurationOverrides: { ...state.itineraryDurationOverrides },
    itineraryStartOverrides: { ...state.itineraryStartOverrides },
    itineraryNotes: { ...state.itineraryNotes },
    itineraryBreaks: Object.fromEntries(
      Object.entries(state.itineraryBreaks).map(([k, rows]) => [k, rows.map((row) => ({ ...row }))]),
    ),
    itineraryTransitModes: { ...state.itineraryTransitModes },
    itineraryDaySlots: state.itineraryDaySlots?.map((row) => ({ ...row })) ?? null,
  }
}

function withSavedActivePlan<T extends {
  itineraryPlans: ItineraryPlan[]
  activeItineraryPlanId: string
}>(state: T): ItineraryPlan[] {
  const plans = state.itineraryPlans.length ? state.itineraryPlans : defaultItineraryPlans()
  const planning = captureItineraryPlanning(state as unknown as Parameters<typeof captureItineraryPlanning>[0])
  return plans.map((plan) =>
    plan.id === state.activeItineraryPlanId ? { ...plan, planning } : plan,
  )
}

function tripBagEmpty(experienceIds: string[], activityIds: string[]) {
  return experienceIds.length === 0 && activityIds.length === 0
}

function omitRecordKeys<T>(rec: Record<string, T>, drop: Set<string>): Record<string, T> {
  const next = { ...rec }
  for (const id of drop) delete next[id]
  return next
}

function bagPlaceId(city?: string, region?: string) {
  return resolvePlaceId(city, region) ?? resolvePlaceId(region, city)
}

function prunePlanningForSourceIds<T extends {
  itinerarySightOrder: Record<string, string[]>
  itineraryUserPinnedIds: string[]
  itinerarySlotOverrides: Record<string, PeriodId>
  itineraryDayOverrides: Record<string, number>
  itineraryDaySlotOverrides: Record<string, string>
  itineraryDurationOverrides: Record<string, number>
  itineraryStartOverrides: Record<string, string>
  itineraryNotes: Record<string, string>
}>(state: T, sourceIds: string[]): Partial<T> {
  const drop = new Set(sourceIds.filter(Boolean))
  if (drop.size === 0) return {}
  return {
    itinerarySightOrder: Object.fromEntries(
      Object.entries(state.itinerarySightOrder).map(([key, ids]) => [
        key,
        ids.filter((id) => !drop.has(id)),
      ]),
    ),
    itineraryUserPinnedIds: state.itineraryUserPinnedIds.filter((id) => !drop.has(id)),
    itinerarySlotOverrides: omitRecordKeys(state.itinerarySlotOverrides, drop),
    itineraryDayOverrides: omitRecordKeys(state.itineraryDayOverrides, drop),
    itineraryDaySlotOverrides: omitRecordKeys(state.itineraryDaySlotOverrides, drop),
    itineraryDurationOverrides: omitRecordKeys(state.itineraryDurationOverrides, drop),
    itineraryStartOverrides: omitRecordKeys(state.itineraryStartOverrides, drop),
    itineraryNotes: omitRecordKeys(state.itineraryNotes, drop),
  } as Partial<T>
}

/** Drop leftover day slots / pins when the traveller empties the trip bag. */
function withClearedPlanningIfBagEmpty<T extends {
  selectedExperienceIds: string[]
  selectedActivityIds: string[]
  itineraryPlans: ItineraryPlan[]
  activeItineraryPlanId: string
}>(state: T, next: Partial<T>): Partial<T> {
  const experienceIds = next.selectedExperienceIds ?? state.selectedExperienceIds
  const activityIds = next.selectedActivityIds ?? state.selectedActivityIds
  if (!tripBagEmpty(experienceIds, activityIds)) return next
  const planning = emptyItineraryPlanning()
  return {
    ...next,
    ...planning,
    cityNightOverrides: {},
    itineraryPlans: state.itineraryPlans.map((plan) =>
      plan.id === state.activeItineraryPlanId || plan.source === 'bag'
        ? { ...plan, planning }
        : plan,
    ),
  } as Partial<T>
}

/** Drop packed-template leftover plans/slots so the bag itinerary is visible again. */
export function sanitizeTripItineraryPlans(state: {
  itineraryPlans: ItineraryPlan[]
  activeItineraryPlanId: string
  selectedExperienceIds: string[]
  selectedActivityIds: string[]
  itineraryUserPinnedIds: string[]
  itinerarySightOrder: Record<string, string[]>
  itineraryDaySlots: ItineraryDaySlot[] | null
}): Partial<TripState> {
  let plans = state.itineraryPlans.filter((p) => !p.id.startsWith('packed:'))
  if (!plans.length) plans = defaultItineraryPlans()
  const bag = plans.find((p) => p.source === 'bag') ?? plans[0]
  const active = plans.find((p) => p.id === state.activeItineraryPlanId)
  const useBag =
    !active ||
    active.id.startsWith('packed:')

  const nextActive = useBag ? bag : active
  const packedSlots = Boolean(state.itineraryDaySlots?.some((s) => String(s.id).startsWith('packed:')))
  let slots = state.itineraryDaySlots?.filter((s) => !String(s.id).startsWith('packed:')) ?? null
  if (slots && slots.length === 0) slots = null

  if (useBag && nextActive.source === 'bag') {
    const dropStaleSlots =
      packedSlots || !active || active.source === 'blank' || active.id.startsWith('packed:')
    return {
      itineraryPlans: plans,
      activeItineraryPlanId: nextActive.id,
      ...nextActive.planning,
      itineraryDaySlots: dropStaleSlots
        ? nextActive.planning.itineraryDaySlots
        : (slots ?? nextActive.planning.itineraryDaySlots),
    }
  }
  return {
    itineraryPlans: plans,
    activeItineraryPlanId: nextActive.id,
    itineraryDaySlots: slots,
  }
}

const createTripSlice: StateCreator<TripState> = (set, get) => ({
      basics: defaultBasics,
      selectedExperienceIds: [],

      experienceMeta: {},
      selectedActivityIds: [],
      selectedHotelIds: [],
      comparisonStayIds: [],
      chosenStayId: null,
      itineraryStayPropertyIds: [],
      customStayProperties: {},
      startingPointBaseId: null,
      preferredBaseId: null,
      stayStyle: null,
      selectedRestaurantIds: [],
      restaurantMealSlots: {},
      selectedShoppingIds: [],
      transportChoices: {},
      logisticsAcknowledged: [],
      farthestStepIndex: 0,
      cityNightOverrides: {},
      breakfastAtHotel: true,
      cityTransferSlot: {},
      itinerarySlotOverrides: {},
      itineraryDayOverrides: {},
      itineraryDaySlotOverrides: {},
      itineraryUserPinnedIds: [],
      itineraryDaySlots: null,
      itinerarySightOrder: {},
      itineraryDurationOverrides: {},
      itineraryStartOverrides: {},
      itineraryNotes: {},
      itineraryBreaks: {},
      itineraryTransitModes: {},
      userStartTime: DEFAULT_DAY_START_TIME,
      userLastSightEndTime: null,
      hopTransportRule: null,
      vietnamArrivalSlot: 'morning',
      itineraryPlans: defaultItineraryPlans(),
      activeItineraryPlanId: 'plan-1',
      itineraryPipelineActive: readPipelineSession(),

      enterItineraryPipeline: () => {
        writePipelineSession(true)
        set({ itineraryPipelineActive: true })
      },
      exitItineraryPipeline: () => {
        writePipelineSession(false)
        set({ itineraryPipelineActive: false })
      },

      setBasics: (patch) =>
        set((state) => {
          let next = { ...state.basics, ...patch }
          if (patch.budgetTarget != null && patch.budgetAllocationKnown == null) {
            next = syncBudgetRange(next)
          }
          next = syncFromDates(next)
          next = syncTripShaping(next)
          const daysChanged = patch.days != null && patch.days !== state.basics.days
          return {
            basics: next,
            ...(daysChanged ? { cityNightOverrides: {}, itineraryDaySlots: null } : {}),
          }
        }),

      toggleInterest: (interest) =>
        set((state) => {
          const has = state.basics.interests.includes(interest)
          return {
            basics: {
              ...state.basics,
              interests: has
                ? state.basics.interests.filter((i) => i !== interest)
                : [...state.basics.interests, interest],
            },
          }
        }),

      toggleExperience: (id) =>
        set((state) => {
          if (state.selectedExperienceIds.includes(id)) {
            const { [id]: _removed, ...rest } = state.experienceMeta
            return withClearedPlanningIfBagEmpty(state, {
              selectedExperienceIds: state.selectedExperienceIds.filter((x) => x !== id),
              experienceMeta: rest,
              ...prunePlanningForSourceIds(state, [id]),
            })
          }
          return {
            selectedExperienceIds: uniqueIds([...state.selectedExperienceIds, id], []),
            experienceMeta: {
              ...state.experienceMeta,
              [id]: { preferredSlot: 'later', addedAt: Date.now() },
            },
          }
        }),

      addExperience: (id, preferredSlot = 'later') =>
        set((state) => {
          if (state.selectedExperienceIds.includes(id)) {
            return {
              experienceMeta: {
                ...state.experienceMeta,
                [id]: {
                  preferredSlot,
                  addedAt: state.experienceMeta[id]?.addedAt ?? Date.now(),
                },
              },
            }
          }
          return {
            selectedExperienceIds: uniqueIds([...state.selectedExperienceIds, id], []),
            experienceMeta: {
              ...state.experienceMeta,
              [id]: { preferredSlot, addedAt: Date.now() },
            },
          }
        }),

      removeExperience: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.experienceMeta
          return withClearedPlanningIfBagEmpty(state, {
            selectedExperienceIds: state.selectedExperienceIds.filter((x) => x !== id),
            experienceMeta: rest,
            ...prunePlanningForSourceIds(state, [id]),
          })
        }),

      setExperienceSlot: (id, preferredSlot) =>
        set((state) => ({
          experienceMeta: {
            ...state.experienceMeta,
            [id]: {
              preferredSlot,
              addedAt: state.experienceMeta[id]?.addedAt ?? Date.now(),
            },
          },
        })),

      addActivity: (id) =>
        set((state) => {
          if (state.selectedActivityIds.includes(id)) return state
          return { selectedActivityIds: uniqueIds([...state.selectedActivityIds, id], []) }
        }),

      removeActivity: (id) =>
        set((state) =>
          withClearedPlanningIfBagEmpty(state, {
            selectedActivityIds: state.selectedActivityIds.filter((x) => x !== id),
            ...prunePlanningForSourceIds(state, [id]),
          }),
        ),

      toggleActivity: (id) =>
        set((state) => {
          const on = state.selectedActivityIds.includes(id)
          return withClearedPlanningIfBagEmpty(state, {
            selectedActivityIds: on
              ? state.selectedActivityIds.filter((x) => x !== id)
              : [...state.selectedActivityIds, id],
            ...(on ? prunePlanningForSourceIds(state, [id]) : {}),
          })
        }),

      toggleHotel: (id) =>
        set((state) => ({
          selectedHotelIds: state.selectedHotelIds.filter((x) => x !== id).concat(
            state.selectedHotelIds.includes(id) ? [] : [id],
          ),
        })),

      toggleComparisonStay: (id) =>
        set((state) => {
          if (state.comparisonStayIds.includes(id)) {
            const next = state.comparisonStayIds.filter((x) => x !== id)
            return {
              comparisonStayIds: next,
              chosenStayId:
                state.chosenStayId && !next.includes(state.chosenStayId)
                  ? null
                  : state.chosenStayId,
            }
          }
          if (state.comparisonStayIds.length >= 8) return state
          return { comparisonStayIds: [...state.comparisonStayIds, id] }
        }),

      removeComparisonStay: (id) =>
        set((state) => {
          const next = state.comparisonStayIds.filter((x) => x !== id)
          return {
            comparisonStayIds: next,
            chosenStayId:
              state.chosenStayId && !next.includes(state.chosenStayId)
                ? null
                : state.chosenStayId,
          }
        }),

      clearComparison: () => set({ comparisonStayIds: [], chosenStayId: null }),

      setChosenStay: (id) => set({ chosenStayId: id }),

      toggleItineraryStayProperty: (id) =>
        set((state) => ({
          itineraryStayPropertyIds: state.itineraryStayPropertyIds.includes(id)
            ? state.itineraryStayPropertyIds.filter((x) => x !== id)
            : [...state.itineraryStayPropertyIds, id],
        })),

      upsertCustomStayProperty: (stay) =>
        set((state) => ({
          customStayProperties: { ...state.customStayProperties, [stay.id]: stay },
        })),

      setStartingPoint: (baseId) => set({ startingPointBaseId: baseId }),
      setPreferredBase: (baseId) => set({ preferredBaseId: baseId }),
      setStayStyle: (style) => set({ stayStyle: style }),

      toggleRestaurant: (id) =>
        set((state) => {
          const on = state.selectedRestaurantIds.includes(id)
          if (on) {
            const { [id]: _drop, ...slots } = state.restaurantMealSlots
            return {
              selectedRestaurantIds: state.selectedRestaurantIds.filter((x) => x !== id),
              restaurantMealSlots: slots,
            }
          }
          return {
            selectedRestaurantIds: [...state.selectedRestaurantIds, id],
          }
        }),

      setRestaurantMealSlot: (id, meal) =>
        set((state) => ({
          restaurantMealSlots: { ...state.restaurantMealSlots, [id]: meal },
          selectedRestaurantIds: state.selectedRestaurantIds.includes(id)
            ? state.selectedRestaurantIds
            : [...state.selectedRestaurantIds, id],
        })),

      toggleShopping: (id) =>
        set((state) => ({
          selectedShoppingIds: state.selectedShoppingIds.includes(id)
            ? state.selectedShoppingIds.filter((x) => x !== id)
            : [...state.selectedShoppingIds, id],
        })),

      setTransportChoice: (legId, mode) =>
        set((state) => ({
          transportChoices: { ...state.transportChoices, [legId]: mode },
        })),

      toggleLogistics: (id) =>
        set((state) => ({
          logisticsAcknowledged: state.logisticsAcknowledged.includes(id)
            ? state.logisticsAcknowledged.filter((x) => x !== id)
            : [...state.logisticsAcknowledged, id],
        })),

      markStepVisited: (id) =>
        set((state) => {
          const idx = stepIndex(id)
          return { farthestStepIndex: Math.max(state.farthestStepIndex, idx) }
        }),

      setCityNightOverride: (placeId, nights) =>
        set((state) => ({
          cityNightOverrides: {
            ...state.cityNightOverrides,
            [placeId]: Math.max(1, Math.round(nights)),
          },
        })),

      setBreakfastAtHotel: (value) => set({ breakfastAtHotel: value }),

      setCityTransferSlot: (placeId, slot) =>
        set((state) => ({
          cityTransferSlot: { ...state.cityTransferSlot, [placeId]: slot },
        })),

      setItinerarySlotOverride: (sourceId, slot) =>
        set((state) => ({
          itinerarySlotOverrides: { ...state.itinerarySlotOverrides, [sourceId]: slot },
        })),

      setItineraryDayOverride: (sourceId, day) =>
        set((state) => ({
          itineraryDayOverrides: { ...state.itineraryDayOverrides, [sourceId]: day },
        })),

      setItineraryDaySlotOverride: (sourceId, slotId) =>
        set((state) => ({
          itineraryDaySlotOverrides: { ...state.itineraryDaySlotOverrides, [sourceId]: slotId },
        })),

      patchItinerarySightOrder: (patch) =>
        set((state) => ({
          itinerarySightOrder: { ...state.itinerarySightOrder, ...patch },
        })),

      setItineraryDurationOverride: (sourceId, hours) =>
        set((state) => {
          if (hours == null || !Number.isFinite(hours)) {
            const { [sourceId]: _drop, ...rest } = state.itineraryDurationOverrides
            return { itineraryDurationOverrides: rest }
          }
          return {
            itineraryDurationOverrides: {
              ...state.itineraryDurationOverrides,
              [sourceId]: Math.max(15 / 60, hours),
            },
          }
        }),

      setItineraryStartOverride: (sourceId, hhmm) =>
        set((state) => {
          if (!hhmm) {
            const { [sourceId]: _drop, ...rest } = state.itineraryStartOverrides
            return { itineraryStartOverrides: rest }
          }
          return {
            itineraryStartOverrides: { ...state.itineraryStartOverrides, [sourceId]: hhmm },
          }
        }),

      setItineraryNote: (sourceId, note) =>
        set((state) => {
          const trimmed = note.trim()
          if (!trimmed) {
            const { [sourceId]: _drop, ...rest } = state.itineraryNotes
            return { itineraryNotes: rest }
          }
          return { itineraryNotes: { ...state.itineraryNotes, [sourceId]: note } }
        }),

      addItineraryBreak: (slotId, row) =>
        set((state) => ({
          itineraryBreaks: {
            ...state.itineraryBreaks,
            [slotId]: [...(state.itineraryBreaks[slotId] ?? []), row],
          },
        })),

      updateItineraryBreak: (slotId, id, patch) =>
        set((state) => ({
          itineraryBreaks: {
            ...state.itineraryBreaks,
            [slotId]: (state.itineraryBreaks[slotId] ?? []).map((row) =>
              row.id === id ? { ...row, ...patch, id: row.id } : row,
            ),
          },
        })),

      removeItineraryBreak: (slotId, id) =>
        set((state) => ({
          itineraryBreaks: {
            ...state.itineraryBreaks,
            [slotId]: (state.itineraryBreaks[slotId] ?? []).filter((row) => row.id !== id),
          },
        })),

      setItineraryTransitMode: (pairKey, mode) =>
        set((state) => ({
          itineraryTransitModes: { ...state.itineraryTransitModes, [pairKey]: mode },
        })),

      pinSightsToSlots: (pins) =>
        set((state) => ({
          itineraryDaySlotOverrides: { ...state.itineraryDaySlotOverrides, ...pins },
        })),

      markSightUserPinned: (sourceId) =>
        set((state) =>
          state.itineraryUserPinnedIds.includes(sourceId)
            ? state
            : { itineraryUserPinnedIds: [...state.itineraryUserPinnedIds, sourceId] },
        ),

      clearSightUserPin: (sourceId) =>
        set((state) => ({
          itineraryUserPinnedIds: state.itineraryUserPinnedIds.filter((id) => id !== sourceId),
        })),

      setUserStartTime: (value) => set({ userStartTime: value }),

      setUserLastSightEndTime: (value) => set({ userLastSightEndTime: value }),

      setHopTransportRule: (rule) => set({ hopTransportRule: rule }),

      ensureItineraryDaySlots: (slots) =>
        set((state) => {
          if (state.itineraryDaySlots && state.itineraryDaySlots.length > 0) return state
          return { itineraryDaySlots: slots }
        }),

      setItineraryDaySlots: (slots) => set({ itineraryDaySlots: slots }),

      resetItineraryPlanning: () =>
        set(() => ({
          cityNightOverrides: {},
          ...emptyItineraryPlanning(),
        })),

      insertBlankItineraryDay: (afterSlotId, fallbackSlots) =>
        set((state) => {
          const slots = state.itineraryDaySlots?.length
            ? state.itineraryDaySlots
            : fallbackSlots
          if (!slots?.length) return state
          const idx = slots.findIndex((s) => s.id === afterSlotId)
          if (idx < 0) return state
          const placeId = slots[idx].placeId
          const inserted: ItineraryDaySlot = {
            id: newDaySlotId(),
            placeId,
            blank: true,
          }
          const nextSlots = [...slots.slice(0, idx + 1), inserted, ...slots.slice(idx + 1)]
          const nights = nextSlots.filter((s) => s.placeId === placeId).length
          return {
            itineraryDaySlots: nextSlots,
            basics: { ...state.basics, days: nextSlots.length, durationKnown: true },
            cityNightOverrides: {
              ...state.cityNightOverrides,
              [placeId]: Math.max(1, nights),
            },
          }
        }),

      removeItineraryDaySlot: (slotId, fallbackSlots) =>
        set((state) => {
          const slots = state.itineraryDaySlots?.length
            ? state.itineraryDaySlots
            : fallbackSlots
          if (!slots || slots.length <= 1) return state
          const idx = slots.findIndex((s) => s.id === slotId)
          if (idx < 0) return state
          const placeId = slots[idx].placeId
          const nextSlots = slots.filter((s) => s.id !== slotId)
          if (nextSlots.length === 0) return state
          const nights = nextSlots.filter((s) => s.placeId === placeId).length
          const cityNightOverrides = { ...state.cityNightOverrides }
          if (nights <= 0) delete cityNightOverrides[placeId]
          else cityNightOverrides[placeId] = nights
          return {
            itineraryDaySlots: nextSlots,
            basics: { ...state.basics, days: nextSlots.length, durationKnown: true },
            cityNightOverrides,
          }
        }),

      setVietnamArrivalSlot: (slot) => set({ vietnamArrivalSlot: slot }),

      switchItineraryPlan: (id) =>
        set((state) => {
          if (id === state.activeItineraryPlanId) return state
          const plans = withSavedActivePlan(state)
          const next = plans.find((p) => p.id === id)
          if (!next) return { itineraryPlans: plans }
          return {
            itineraryPlans: plans,
            activeItineraryPlanId: next.id,
            ...next.planning,
            itineraryDaySlots: next.planning.itineraryDaySlots ?? null,
          }
        }),

      createBlankItineraryPlan: () =>
        set((state) => {
          const plans = withSavedActivePlan(state)
          const n = plans.length + 1
          const id = `plan-${Date.now()}`
          const planning = emptyItineraryPlanning()
          planning.itineraryDaySlots = [
            { id: newDaySlotId(), placeId: 'hanoi', blank: true },
          ]
          const created: ItineraryPlan = {
            id,
            name: `Itinerary ${n}`,
            source: 'blank',
            planning,
          }
          return {
            itineraryPlans: [...plans, created],
            activeItineraryPlanId: id,
            ...created.planning,
          }
        }),

      deleteItineraryPlan: (id) =>
        set((state) => {
          const target = state.itineraryPlans.find((p) => p.id === id)
          if (!target || target.source === 'bag' || target.id === 'plan-1') return state
          const remaining = state.itineraryPlans.filter((p) => p.id !== id)
          const plans = remaining.length ? remaining : defaultItineraryPlans()
          if (state.activeItineraryPlanId !== id) return { itineraryPlans: plans }
          const fallback = plans.find((p) => p.source === 'bag') ?? plans[0]
          return {
            itineraryPlans: plans,
            activeItineraryPlanId: fallback.id,
            ...fallback.planning,
            itineraryDaySlots: fallback.planning.itineraryDaySlots ?? null,
          }
        }),

      reorderItineraryDaySlots: (orderedIds) =>
        set((state) => {
          const current = state.itineraryDaySlots
          if (!current?.length) return state
          const byId = new Map(current.map((s) => [s.id, s]))
          const next = orderedIds.map((id) => byId.get(id)).filter((s): s is ItineraryDaySlot => Boolean(s))
          for (const slot of current) {
            if (!next.some((s) => s.id === slot.id)) next.push(slot)
          }
          if (next.length === 0) return state
          return {
            itineraryDaySlots: next,
            basics: { ...state.basics, days: next.length, durationKnown: true },
          }
        }),

      dropPlaceFromItinerary: (placeId) =>
        set((state) => {
          const { [placeId]: _nights, ...cityNightOverrides } = state.cityNightOverrides
          const { [placeId]: _transfer, ...cityTransferSlot } = state.cityTransferSlot
          const expDrop = state.selectedExperienceIds.filter((id) => {
            const e = EXPERIENCES.find((row) => row.id === id)
            return Boolean(e && bagPlaceId(e.city, e.region) === placeId)
          })
          const actDrop = state.selectedActivityIds.filter((id) => {
            const a = CITY_ACTIVITIES.find((row) => row.id === id)
            return Boolean(a && bagPlaceId(a.cityName, a.cityId) === placeId)
          })
          const shopDrop = state.selectedShoppingIds.filter((id) => {
            const s = SHOPPING_ITEMS.find((row) => row.id === id)
            return Boolean(s && bagPlaceId(s.city, s.region) === placeId)
          })
          const dropIds = [...expDrop, ...actDrop, ...shopDrop]
          const experienceMeta = { ...state.experienceMeta }
          for (const id of expDrop) delete experienceMeta[id]
          const slots = state.itineraryDaySlots
          const nextSlots = slots?.length ? slots.filter((s) => s.placeId !== placeId) : slots
          const next = withClearedPlanningIfBagEmpty(state, {
            selectedExperienceIds: state.selectedExperienceIds.filter((id) => !expDrop.includes(id)),
            selectedActivityIds: state.selectedActivityIds.filter((id) => !actDrop.includes(id)),
            selectedShoppingIds: state.selectedShoppingIds.filter((id) => !shopDrop.includes(id)),
            experienceMeta,
            cityNightOverrides,
            cityTransferSlot,
            itineraryDaySlots: nextSlots && nextSlots.length > 0 ? nextSlots : null,
            ...(nextSlots && nextSlots.length > 0
              ? { basics: { ...state.basics, days: nextSlots.length, durationKnown: true } }
              : {}),
            ...prunePlanningForSourceIds(state, dropIds),
          })
          return next
        }),

      getSelectedRegions: () => selectedRegionsFromExperiences(get().selectedExperienceIds),

      getItinerary: () => {
        const s = get()
        return buildItinerary({
          days: s.basics.days,
          startDate: s.basics.startDate,
          travelStyle: s.basics.travelStyle,
          experienceIds: s.selectedExperienceIds,
          hotelIds: s.selectedHotelIds,
          restaurantIds: s.selectedRestaurantIds,
          shoppingIds: s.selectedShoppingIds,
          transportChoices: s.transportChoices,
        })
      },
})

export function createMemoryTripStore(seed: Partial<TripState> = {}) {
  const store = create<TripState>()((set, get, api) => ({
    ...createTripSlice(set, get, api),
    ...seed,
  }))
  return store
}

export const useTripStore = create<TripState>()(
  persist(createTripSlice, {
      name: PERSIST_KEY,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TripState>
        return {
          ...current,
          ...p,
          basics: { ...current.basics, ...p.basics },
          cityNightOverrides: p.cityNightOverrides ?? current.cityNightOverrides,
          breakfastAtHotel: p.breakfastAtHotel ?? current.breakfastAtHotel,
          restaurantMealSlots: p.restaurantMealSlots ?? current.restaurantMealSlots,
          cityTransferSlot: p.cityTransferSlot ?? current.cityTransferSlot,
          itinerarySlotOverrides: p.itinerarySlotOverrides ?? current.itinerarySlotOverrides,
          itineraryDayOverrides: p.itineraryDayOverrides ?? current.itineraryDayOverrides,
          itineraryDaySlotOverrides:
            p.itineraryDaySlotOverrides ?? current.itineraryDaySlotOverrides,
          itineraryUserPinnedIds: p.itineraryUserPinnedIds ?? current.itineraryUserPinnedIds,
          itineraryDaySlots: p.itineraryDaySlots ?? current.itineraryDaySlots,
          itinerarySightOrder: p.itinerarySightOrder ?? current.itinerarySightOrder,
          itineraryDurationOverrides:
            p.itineraryDurationOverrides ?? current.itineraryDurationOverrides,
          itineraryStartOverrides: p.itineraryStartOverrides ?? current.itineraryStartOverrides,
          itineraryNotes: p.itineraryNotes ?? current.itineraryNotes,
          itineraryBreaks: p.itineraryBreaks ?? current.itineraryBreaks,
          itineraryTransitModes: p.itineraryTransitModes ?? current.itineraryTransitModes,
          // `dayStartTime` is the pre-rename key; keep reading it so saved trips survive.
          userStartTime:
            p.userStartTime ??
            (p as { dayStartTime?: string }).dayStartTime ??
            current.userStartTime,
          userLastSightEndTime: p.userLastSightEndTime ?? current.userLastSightEndTime,
          hopTransportRule: p.hopTransportRule ?? current.hopTransportRule,
          vietnamArrivalSlot: p.vietnamArrivalSlot ?? current.vietnamArrivalSlot,
          itineraryPlans: p.itineraryPlans?.length ? p.itineraryPlans : current.itineraryPlans,
          activeItineraryPlanId: p.activeItineraryPlanId ?? current.activeItineraryPlanId,
          selectedExperienceIds: Array.isArray(p.selectedExperienceIds)
            ? uniqueIds(p.selectedExperienceIds, [])
            : current.selectedExperienceIds,
          selectedActivityIds: Array.isArray(p.selectedActivityIds)
            ? uniqueIds(p.selectedActivityIds, [])
            : current.selectedActivityIds,
        }
      },
      partialize: (state) => ({
        basics: state.basics,
        selectedExperienceIds: state.selectedExperienceIds,
        experienceMeta: state.experienceMeta,
        selectedActivityIds: state.selectedActivityIds,
        selectedHotelIds: state.selectedHotelIds,
        comparisonStayIds: state.comparisonStayIds,
        chosenStayId: state.chosenStayId,
        itineraryStayPropertyIds: state.itineraryStayPropertyIds,
        customStayProperties: state.customStayProperties,
        startingPointBaseId: state.startingPointBaseId,
        preferredBaseId: state.preferredBaseId,
        stayStyle: state.stayStyle,
        selectedRestaurantIds: state.selectedRestaurantIds,
        restaurantMealSlots: state.restaurantMealSlots,
        selectedShoppingIds: state.selectedShoppingIds,
        transportChoices: state.transportChoices,
        logisticsAcknowledged: state.logisticsAcknowledged,
        farthestStepIndex: state.farthestStepIndex,
        cityNightOverrides: state.cityNightOverrides,
        breakfastAtHotel: state.breakfastAtHotel,
        cityTransferSlot: state.cityTransferSlot,
        itinerarySlotOverrides: state.itinerarySlotOverrides,
        itineraryDayOverrides: state.itineraryDayOverrides,
        itineraryDaySlotOverrides: state.itineraryDaySlotOverrides,
        itineraryUserPinnedIds: state.itineraryUserPinnedIds,
        itineraryDaySlots: state.itineraryDaySlots,
        itinerarySightOrder: state.itinerarySightOrder,
        itineraryDurationOverrides: state.itineraryDurationOverrides,
        itineraryStartOverrides: state.itineraryStartOverrides,
        itineraryNotes: state.itineraryNotes,
        itineraryBreaks: state.itineraryBreaks,
        itineraryTransitModes: state.itineraryTransitModes,
        userStartTime: state.userStartTime,
        userLastSightEndTime: state.userLastSightEndTime,
        hopTransportRule: state.hopTransportRule,
        vietnamArrivalSlot: state.vietnamArrivalSlot,
        itineraryPlans: state.itineraryPlans,
        activeItineraryPlanId: state.activeItineraryPlanId,
        // itineraryPipelineActive is session-only — not persisted (avoids rehydrate wiping it)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itineraryPipelineActive = readPipelineSession()
          Object.assign(state, sanitizeTripItineraryPlans(state))
        }
      },
    },
  ),
)
