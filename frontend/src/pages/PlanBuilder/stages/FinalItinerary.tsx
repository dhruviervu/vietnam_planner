import { Component, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTripStore, sanitizeTripItineraryPlans } from '../../../store/tripStore'
import { buildYourVietnam } from '../lib/yourVietnam/buildYourVietnam'
import { exportYourVietnamPdf } from '../lib/yourVietnam/exportPdf'
import { activitiesUrl, experiencesUrl } from '../lib/yourVietnam/links'
import { AddMoreSightsSection } from '../components/AddMoreSightsSection'
import { ItineraryCraftShell } from '../components/ItineraryCraftShell'
import { CraftedItineraryBoard } from '../components/CraftedItineraryBoard'
import { splitSourceIds } from '../../PackedItineraries/lib/packHighRoi'
import {
  daysForItineraryPlan,
  openItineraryTemplatesTab,
} from '../../../store/itineraryPlans'

class ItineraryErrorBoundary extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state = { message: null as string | null }
  static getDerivedStateFromError(err: Error) {
    return { message: err.message || 'The itinerary could not be shown.' }
  }
  componentDidCatch(err: Error) {
    console.error('[itinerary]', err)
  }
  render() {
    if (this.state.message) {
      return (
        <section className="rounded-[28px] border border-terracotta/25 bg-paper px-6 py-8 shadow-soft">
          <h1 className="font-serif text-[1.8rem] font-semibold text-ink">The itinerary hit a snag</h1>
          <p className="mt-2 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ message: null })}
            className="mt-5 rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper"
          >
            Try again
          </button>
        </section>
      )
    }
    return this.props.children
  }
}

export function FinalItinerary() {
  return (
    <ItineraryErrorBoundary>
      <FinalItineraryBody />
    </ItineraryErrorBoundary>
  )
}

function FinalItineraryBody() {
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const restaurantMealSlots = useTripStore((s) => s.restaurantMealSlots)
  const shoppingIds = useTripStore((s) => s.selectedShoppingIds)
  const transportChoices = useTripStore((s) => s.transportChoices)
  const experienceMeta = useTripStore((s) => s.experienceMeta)
  const breakfastAtHotel = useTripStore((s) => s.breakfastAtHotel)
  const itineraryDaySlots = useTripStore((s) => s.itineraryDaySlots)
  const cityNightOverrides = useTripStore((s) => s.cityNightOverrides)
  const mark = useTripStore((s) => s.markStepVisited)
  const setExperienceSlot = useTripStore((s) => s.setExperienceSlot)
  const itineraryPlans = useTripStore((s) => s.itineraryPlans)
  const activeItineraryPlanId = useTripStore((s) => s.activeItineraryPlanId)
  const itinerarySightOrder = useTripStore((s) => s.itinerarySightOrder)
  const itineraryUserPinnedIds = useTripStore((s) => s.itineraryUserPinnedIds)
  const itineraryDaySlotOverrides = useTripStore((s) => s.itineraryDaySlotOverrides)

  const [activeDay, setActiveDay] = useState(1)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    mark('itinerary')
    try {
      history.scrollRestoration = 'manual'
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0)
    const s = useTripStore.getState()
    const patch = sanitizeTripItineraryPlans(s)
    const active = s.itineraryPlans.find((p) => p.id === s.activeItineraryPlanId)
    const needs =
      s.itineraryPlans.some((p) => p.id.startsWith('packed:')) ||
      !active ||
      s.activeItineraryPlanId.startsWith('packed:') ||
      Boolean(s.itineraryDaySlots?.some((slot) => String(slot.id).startsWith('packed:')))
    if (needs) useTripStore.setState(patch)
  }, [mark])

  const activePlan =
    itineraryPlans.find((p) => p.id === activeItineraryPlanId) ?? itineraryPlans[0]
  const isBlankPlan = activePlan?.source === 'blank'
  const extraKey = `${isBlankPlan ? 'blank' : 'bag'}|${itineraryUserPinnedIds.join(',')}|${Object.values(itinerarySightOrder).flat().join(',')}`

  const trip = useMemo(() => {
    const extra = splitSourceIds(
      isBlankPlan
        ? [...new Set([...itineraryUserPinnedIds, ...Object.values(itinerarySightOrder).flat()])]
        : [],
    )
    const useBagSights = !isBlankPlan
    return buildYourVietnam({
        days: useBagSights
          ? basics.days
          : Math.max(1, itineraryDaySlots?.length || 1),
        startDate: basics.startDate,
        endDate: basics.endDate,
        travelStyle: useBagSights ? basics.travelStyle : 'packed',
        holidayKind: useBagSights ? basics.holidayKind : 'action',
        holidayKindKnown: useBagSights ? basics.holidayKindKnown : true,
        paceKnown: useBagSights ? basics.paceKnown : true,
        groupSize: basics.groupSize,
        budgetDailyUsd: basics.budgetDailyUsd,
        budgetAllocationKnown: basics.budgetAllocationKnown,
        budgetKnown: basics.budgetKnown,
        budgetTarget: basics.budgetTarget,
        budgetMode: basics.budgetMode,
        experienceIds: useBagSights ? experienceIds : extra.experienceIds,
        activityIds: useBagSights ? activityIds : [],
        hotelIds: useBagSights ? hotelIds : [],
        chosenStayId: useBagSights ? chosenStayId : null,
        restaurantIds: useBagSights ? restaurantIds : [],
        restaurantMealSlots,
        shoppingIds: useBagSights ? shoppingIds : extra.shoppingIds,
        transportChoices,
        experienceMeta,
        breakfastAtHotel,
        itineraryDaySlots,
        itineraryDaySlotOverrides,
        itinerarySightOrder,
        cityNightOverrides: useBagSights ? cityNightOverrides : {},
      })
  }, [
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
      cityNightOverrides,
      isBlankPlan,
      extraKey,
    itineraryUserPinnedIds,
    itinerarySightOrder,
    ])

  const hasSightsInBag = experienceIds.length > 0 || activityIds.length > 0
  const displayDays = daysForItineraryPlan(trip.days, activePlan, {
    itinerarySightOrder,
    itineraryUserPinnedIds,
  })
  const day = displayDays.find((d) => d.day === activeDay) ?? displayDays[0]

  useEffect(() => {
    if (displayDays.length === 0) return
    if (!displayDays.some((d) => d.day === activeDay)) {
      setActiveDay(displayDays[0].day)
    }
  }, [activeItineraryPlanId, displayDays, activeDay])

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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-16">
      <header className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 0%, #c45c3a 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #7a8f72 0%, transparent 45%)',
          }}
        />
        <div className="relative px-5 py-4 sm:px-8 sm:py-5">
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
                The Itinerary
              </h1>
              {hasSightsInBag ? (
                <p className="mt-2 max-w-[54ch] text-[1.02rem] leading-relaxed text-muted">
                  Your itinerary, based on all the sights you have added. See itineraries for Vietnam
                  — packed city and country templates —{' '}
                  <button
                    type="button"
                    onClick={openItineraryTemplatesTab}
                    className="font-bold text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:text-terracotta-deep"
                  >
                    click here
                  </button>{' '}
                  to view them
                </p>
              ) : (
                <p className="mt-2 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted">
                  Add sights to your trip bag to shape a day-by-day plan — or{' '}
                  <button
                    type="button"
                    onClick={openItineraryTemplatesTab}
                    className="font-bold text-terracotta underline decoration-terracotta/40 underline-offset-2 hover:text-terracotta-deep"
                  >
                    see itineraries for Vietnam
                  </button>
                  .
                </p>
              )}
              {trip.dateRangeLabel && !trip.isEmpty ? (
                <p className="mt-2 text-[0.88rem] font-medium text-muted">{trip.dateRangeLabel}</p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {trip.isEmpty ? (
        <EmptySketch />
      ) : (
        <>
          <ItineraryCraftShell
            route={trip.route}
            mapOpen={mapOpen}
            onToggleMap={() => setMapOpen((v) => !v)}
            daysCount={displayDays.length || trip.daysCount}
            crafted={
              <>
                <CraftedItineraryBoard
                  key={activeItineraryPlanId}
                  tripDays={displayDays}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                  highlightId={highlightId}
                  setHighlightId={setHighlightId}
                  itineraryExperienceIds={itineraryExperienceIds}
                  itineraryActivityIds={itineraryActivityIds}
                  onMoveExperience={setExperienceSlot}
                  unscheduledSights={trip.unscheduled}
                  mapOpen={mapOpen}
                  seeVietnamItineraries={activePlan?.source === 'blank'}
                />

                <AddMoreSightsSection
                  thinCities={trip.thinCities.filter((c) => c.city === day?.city)}
                  selectedIds={[...experienceIds, ...itineraryExperienceIds]}
                  tripDate={
                    basics.dateMode === 'exact' && basics.startDate ? basics.startDate : null
                  }
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
        </>
      )}
    </motion.div>
  )
}

function EmptySketch() {
  return (
    <section className="mt-10 rounded-[28px] border border-ink/8 bg-paper px-6 py-10 text-center shadow-soft">
      <h2 className="font-serif text-[1.8rem] font-semibold text-ink">
        Your trip is still a sketch
      </h2>
      <p className="mx-auto mt-2 max-w-[42ch] text-muted">
        Add experiences or activities to the trip bag — then we&apos;ll pack a day-by-day
        plan from those sights and their opening hours.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={openItineraryTemplatesTab} className="btn-solid">
          View Itinerary Templates
        </button>
        <Link to={experiencesUrl()} className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink">
          Explore experiences
        </Link>
        <Link
          to={activitiesUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Hands-on activities
        </Link>
      </div>
    </section>
  )
}
