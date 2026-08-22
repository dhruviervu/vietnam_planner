import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildItinerary, selectedRegionsFromExperiences } from '../pages/PlanBuilder/lib/buildItinerary'
import type {
  BudgetMode,
  BuilderStepId,
  CostTotals,
  DateMode,
  ExperienceSelectionMeta,
  Interest,
  ItineraryDay,
  StayStyle,
  TransportMode,
  TravelStyle,
} from '../pages/PlanBuilder/types'
import { stepIndex } from '../pages/PlanBuilder/steps'

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
}

type TripState = {
  basics: TripBasics
  selectedExperienceIds: string[]
  experienceMeta: Record<string, ExperienceSelectionMeta>
  selectedActivityIds: string[]
  selectedHotelIds: string[] // Stay Bag — multiple saved stays (not a single final hotel)
  comparisonStayIds: string[] // Active comparison shortlist (2–6+)
  chosenStayId: string | null // Final advisory choice from comparison
  /** Where-to-Stay listing cards set for the itinerary (StayProperty ids) */
  itineraryStayPropertyIds: string[]
  startingPointBaseId: string | null
  preferredBaseId: string | null
  stayStyle: StayStyle | null
  selectedRestaurantIds: string[]
  selectedShoppingIds: string[]
  transportChoices: Record<string, TransportMode>
  logisticsAcknowledged: string[]
  farthestStepIndex: number
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
  setStartingPoint: (baseId: string | null) => void
  setPreferredBase: (baseId: string | null) => void
  setStayStyle: (style: StayStyle | null) => void
  toggleRestaurant: (id: string) => void
  toggleShopping: (id: string) => void
  setTransportChoice: (legId: string, mode: TransportMode) => void
  toggleLogistics: (id: string) => void
  markStepVisited: (id: BuilderStepId) => void
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
}

const PIPELINE_SESSION_KEY = 'vn-itinerary-pipeline'

function readPipelineSession(): boolean {
  try {
    return sessionStorage.getItem(PIPELINE_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writePipelineSession(active: boolean) {
  try {
    if (active) sessionStorage.setItem(PIPELINE_SESSION_KEY, '1')
    else sessionStorage.removeItem(PIPELINE_SESSION_KEY)
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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      basics: defaultBasics,
      selectedExperienceIds: [],
      experienceMeta: {},
      selectedActivityIds: [],
      selectedHotelIds: [],
      comparisonStayIds: [],
      chosenStayId: null,
      itineraryStayPropertyIds: [],
      startingPointBaseId: null,
      preferredBaseId: null,
      stayStyle: null,
      selectedRestaurantIds: [],
      selectedShoppingIds: [],
      transportChoices: {},
      logisticsAcknowledged: [],
      farthestStepIndex: 0,
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
          if (patch.budgetTarget != null) next = syncBudgetRange(next)
          next = syncFromDates(next)
          return { basics: next }
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
            return {
              selectedExperienceIds: state.selectedExperienceIds.filter((x) => x !== id),
              experienceMeta: rest,
            }
          }
          return {
            selectedExperienceIds: [...state.selectedExperienceIds, id],
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
            selectedExperienceIds: [...state.selectedExperienceIds, id],
            experienceMeta: {
              ...state.experienceMeta,
              [id]: { preferredSlot, addedAt: Date.now() },
            },
          }
        }),

      removeExperience: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.experienceMeta
          return {
            selectedExperienceIds: state.selectedExperienceIds.filter((x) => x !== id),
            experienceMeta: rest,
          }
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
          return { selectedActivityIds: [...state.selectedActivityIds, id] }
        }),

      removeActivity: (id) =>
        set((state) => ({
          selectedActivityIds: state.selectedActivityIds.filter((x) => x !== id),
        })),

      toggleActivity: (id) =>
        set((state) => ({
          selectedActivityIds: state.selectedActivityIds.includes(id)
            ? state.selectedActivityIds.filter((x) => x !== id)
            : [...state.selectedActivityIds, id],
        })),

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

      setStartingPoint: (baseId) => set({ startingPointBaseId: baseId }),
      setPreferredBase: (baseId) => set({ preferredBaseId: baseId }),
      setStayStyle: (style) => set({ stayStyle: style }),

      toggleRestaurant: (id) =>
        set((state) => ({
          selectedRestaurantIds: state.selectedRestaurantIds.includes(id)
            ? state.selectedRestaurantIds.filter((x) => x !== id)
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
    }),
    {
      name: 'vietnam-trip-builder',
      partialize: (state) => ({
        basics: state.basics,
        selectedExperienceIds: state.selectedExperienceIds,
        experienceMeta: state.experienceMeta,
        selectedActivityIds: state.selectedActivityIds,
        selectedHotelIds: state.selectedHotelIds,
        comparisonStayIds: state.comparisonStayIds,
        chosenStayId: state.chosenStayId,
        itineraryStayPropertyIds: state.itineraryStayPropertyIds,
        startingPointBaseId: state.startingPointBaseId,
        preferredBaseId: state.preferredBaseId,
        stayStyle: state.stayStyle,
        selectedRestaurantIds: state.selectedRestaurantIds,
        selectedShoppingIds: state.selectedShoppingIds,
        transportChoices: state.transportChoices,
        logisticsAcknowledged: state.logisticsAcknowledged,
        farthestStepIndex: state.farthestStepIndex,
        // itineraryPipelineActive is session-only — not persisted (avoids rehydrate wiping it)
      }),
      onRehydrateStorage: () => (state) => {
        // After persist rehydrate, restore pipeline flag from sessionStorage
        if (state) {
          state.itineraryPipelineActive = readPipelineSession()
        }
      },
    },
  ),
)
