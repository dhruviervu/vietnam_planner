import { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'
import { Link } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { createMemoryTripStore } from '../../store/tripStore'
import { ItineraryTripStoreProvider } from '../../store/itineraryTripStore'
import { buildYourVietnam } from '../PlanBuilder/lib/yourVietnam/buildYourVietnam'
import { exportYourVietnamPdf } from '../PlanBuilder/lib/yourVietnam/exportPdf'
import { ItineraryCraftShell } from '../PlanBuilder/components/ItineraryCraftShell'
import { CraftedItineraryBoard } from '../PlanBuilder/components/CraftedItineraryBoard'
import type { PackedTemplate } from './data/catalogTypes'
import { seedPackedTemplateState } from './lib/applyPackedTemplate'

export function PackedItineraryLive({ template }: { template: PackedTemplate }) {
  const previewStore = useMemo(() => createMemoryTripStore(seedPackedTemplateState(template)), [template])

  return (
    <ItineraryTripStoreProvider store={previewStore}>
      <PackedItineraryBody template={template} store={previewStore} />
    </ItineraryTripStoreProvider>
  )
}

function PackedItineraryBody({
  template,
  store,
}: {
  template: PackedTemplate
  store: ReturnType<typeof createMemoryTripStore>
}) {
  const basics = useStore(store, (s) => s.basics)
  const experienceIds = useStore(store, (s) => s.selectedExperienceIds)
  const activityIds = useStore(store, (s) => s.selectedActivityIds)
  const hotelIds = useStore(store, (s) => s.selectedHotelIds)
  const chosenStayId = useStore(store, (s) => s.chosenStayId)
  const restaurantIds = useStore(store, (s) => s.selectedRestaurantIds)
  const restaurantMealSlots = useStore(store, (s) => s.restaurantMealSlots)
  const shoppingIds = useStore(store, (s) => s.selectedShoppingIds)
  const transportChoices = useStore(store, (s) => s.transportChoices)
  const experienceMeta = useStore(store, (s) => s.experienceMeta)
  const breakfastAtHotel = useStore(store, (s) => s.breakfastAtHotel)
  const itineraryDaySlots = useStore(store, (s) => s.itineraryDaySlots)
  const itineraryDaySlotOverrides = useStore(store, (s) => s.itineraryDaySlotOverrides)
  const itinerarySightOrder = useStore(store, (s) => s.itinerarySightOrder)
  const userStartTime = useStore(store, (s) => s.userStartTime)
  const itineraryStartOverrides = useStore(store, (s) => s.itineraryStartOverrides)
  const setExperienceSlot = useStore(store, (s) => s.setExperienceSlot)

  const [activeDay, setActiveDay] = useState(1)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setActiveDay(1)
  }, [template.id])

  const trip = useMemo(
    () =>
      buildYourVietnam({
        days: Math.max(1, itineraryDaySlots?.length || template.days || basics.days),
        startDate: basics.startDate,
        endDate: basics.endDate,
        travelStyle: template.pace === 'slow' ? 'relaxed' : 'packed',
        holidayKind: template.pace === 'slow' ? 'leisure' : 'action',
        holidayKindKnown: true,
        paceKnown: true,
        groupSize: basics.groupSize,
        budgetDailyUsd: basics.budgetDailyUsd,
        budgetAllocationKnown: true,
        budgetKnown: true,
        budgetTarget: basics.budgetTarget,
        budgetMode: basics.budgetMode,
        experienceIds,
        activityIds,
        hotelIds,
        chosenStayId,
        restaurantIds,
        restaurantMealSlots,
        shoppingIds,
        transportChoices,
        experienceMeta,
        breakfastAtHotel,
        itineraryDaySlots,
        itineraryDaySlotOverrides,
        itinerarySightOrder,
        dayStartTime: userStartTime,
        itineraryStartOverrides,
        pinsAreSuggestions: true,
      }),
    [
      userStartTime,
      itineraryStartOverrides,
      basics,
      experienceIds,
      activityIds,
      hotelIds,
      chosenStayId,
      restaurantIds,
      restaurantMealSlots,
      shoppingIds,
      transportChoices,
      experienceMeta,
      breakfastAtHotel,
      itineraryDaySlots,
      itineraryDaySlotOverrides,
      itinerarySightOrder,
      template.days,
      template.pace,
    ],
  )

  useEffect(() => {
    if (trip.days.length === 0) return
    if (!trip.days.some((d) => d.day === activeDay)) {
      setActiveDay(trip.days[0].day)
    }
  }, [trip.days, activeDay])

  const itineraryExperienceIds: string[] = []
  const itineraryActivityIds: string[] = []
  for (const d of trip.days) {
    for (const period of d.periods) {
      for (const it of period.items) {
        if (!it.sourceId) continue
        if (it.kind === 'experience') itineraryExperienceIds.push(it.sourceId)
        if (it.kind === 'activity') itineraryActivityIds.push(it.sourceId)
      }
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <p className="mb-4">
          <Link to="/plan/itinerary-ideas" className="text-[0.82rem] font-semibold text-terracotta hover:underline">
            ← All itinerary ideas
          </Link>
        </p>

        <header className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero">
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 20% 0%, #c45c3a 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #7a8f72 0%, transparent 45%)',
            }}
          />
          <div className="relative px-5 py-4 sm:px-8 sm:py-5">
            <h1 className="font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
              {template.title}
            </h1>
            <p className="mt-2 max-w-[58ch] text-[1.02rem] leading-relaxed text-muted">
              {template.description}
            </p>
            <p className="mt-2 text-[0.88rem] font-medium text-muted">
              {template.days} days · {template.cities.join(' → ')}
            </p>
          </div>
        </header>

        <ItineraryCraftShell
          route={trip.route}
          mapOpen={mapOpen}
          onToggleMap={() => setMapOpen((v) => !v)}
          daysCount={trip.days.length || trip.daysCount}
          crafted={
            <>
              <CraftedItineraryBoard
                tripDays={trip.days}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                highlightId={highlightId}
                setHighlightId={setHighlightId}
                itineraryExperienceIds={itineraryExperienceIds}
                itineraryActivityIds={itineraryActivityIds}
                onMoveExperience={setExperienceSlot}
                unscheduledSights={trip.unscheduled}
                pinMoves={trip.pinMoves}
                mapOpen={mapOpen}
              />

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => exportYourVietnamPdf(trip)}
                  className="rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-3 text-[0.92rem] font-bold text-paper shadow-[0_10px_24px_rgba(196,92,58,0.28)] transition hover:scale-[1.01]"
                >
                  Download itinerary PDF ↓
                </button>
              </div>
            </>
          }
        />
      </main>
      <Footer />
    </>
  )
}
