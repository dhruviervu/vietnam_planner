import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SkipToMenu } from '../components/SkipToMenu'
import { stepPath } from '../steps'
import { useTripStore } from '../../../store/tripStore'
import { buildYourVietnam } from '../lib/yourVietnam/buildYourVietnam'
import { exportYourVietnamPdf } from '../lib/yourVietnam/exportPdf'
import {
  activitiesUrl,
  experiencesUrl,
  foodUrl,
  whereToStayUrl,
} from '../lib/yourVietnam/links'
import { buildCityPins } from '../lib/yourVietnam/cityPins'
import { agendaPinNumbers } from '../lib/yourVietnam/dayMapPins'
import type { ItineraryItem, PeriodId } from '../lib/yourVietnam/types'
import type { PlaceId } from '../../GettingAround/data/types'
import { TripVariablesBar } from '../components/TripVariablesBar'
import { DayToggleBar } from '../components/DayToggleBar'
import { DayAgendaList } from '../components/DayAgenda'
import { DayPlan } from '../components/DayPlan'
import { TripBagCityMap } from '../components/TripBagCityMap'
import { TripPlannerNotes } from '../components/TripPlannerNotes'
import { MustVisitCitiesSection } from '../components/MustVisitCitiesSection'
import { AddMoreSightsSection } from '../components/AddMoreSightsSection'
import { AddToDayDrawer } from '../components/AddToDayDrawer'

export function FinalItinerary() {
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const shoppingIds = useTripStore((s) => s.selectedShoppingIds)
  const transportChoices = useTripStore((s) => s.transportChoices)
  const experienceMeta = useTripStore((s) => s.experienceMeta)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const toggleRestaurant = useTripStore((s) => s.toggleRestaurant)
  const addExperience = useTripStore((s) => s.addExperience)
  const addActivity = useTripStore((s) => s.addActivity)
  const setExperienceSlot = useTripStore((s) => s.setExperienceSlot)
  const mark = useTripStore((s) => s.markStepVisited)
  const setCityNightOverride = useTripStore((s) => s.setCityNightOverride)
  const cityNightOverrides = useTripStore((s) => s.cityNightOverrides)

  const [dismissedIssueIds, setDismissedIssueIds] = useState<string[]>([])
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([])
  const [skippedSuggestionIds, setSkippedSuggestionIds] = useState<string[]>([])
  const [activeDay, setActiveDay] = useState(1)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [addPeriod, setAddPeriod] = useState<PeriodId | null>(null)

  useEffect(() => {
    mark('itinerary')
    try {
      history.scrollRestoration = 'manual'
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0)
  }, [mark])

  const trip = useMemo(
    () =>
      buildYourVietnam({
        days: basics.days,
        startDate: basics.startDate,
        endDate: basics.endDate,
        travelStyle: basics.travelStyle,
        holidayKind: basics.holidayKind,
        holidayKindKnown: basics.holidayKindKnown,
        paceKnown: basics.paceKnown,
        groupSize: basics.groupSize,
        budgetDailyUsd: basics.budgetDailyUsd,
        budgetAllocationKnown: basics.budgetAllocationKnown,
        budgetKnown: basics.budgetKnown,
        budgetTarget: basics.budgetTarget,
        budgetMode: basics.budgetMode,
        experienceIds,
        activityIds,
        hotelIds,
        chosenStayId,
        restaurantIds,
        shoppingIds,
        transportChoices,
        experienceMeta,
        dismissedIssueIds,
        removedItemIds,
        skippedSuggestionIds,
        cityNightOverrides,
      }),
    [
      basics,
      experienceIds,
      activityIds,
      hotelIds,
      chosenStayId,
      restaurantIds,
      shoppingIds,
      transportChoices,
      experienceMeta,
      dismissedIssueIds,
      removedItemIds,
      skippedSuggestionIds,
      cityNightOverrides,
    ],
  )

  const pins = useMemo(
    () => buildCityPins(experienceIds, activityIds),
    [experienceIds, activityIds],
  )

  useEffect(() => {
    if (trip.days.length === 0) return
    if (!trip.days.some((d) => d.day === activeDay)) {
      setActiveDay(trip.days[0].day)
    }
    void pins.length
  }, [trip.days, activeDay])

  const day = trip.days.find((d) => d.day === activeDay) ?? trip.days[0]

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

  const dayStops = (day?.periods ?? []).flatMap((p) =>
    p.items
      .filter(
        (it) =>
          it.kind === 'experience' ||
          it.kind === 'activity' ||
          it.kind === 'meal' ||
          it.kind === 'shopping' ||
          it.kind === 'stay' ||
          it.kind === 'check-in',
      )
      .map((it) => {
        const name = it.name.replace(/^(Lunch|Dinner|Check-in) · /, '')
        let query = `${name}, ${it.city}, Vietnam`
        if (it.mapsUrl) {
          try {
            const q = new URL(it.mapsUrl).searchParams.get('query')
            if (q?.trim()) query = q.trim()
          } catch {
            /* ignore */
          }
        }
        return {
          id: it.id,
          name,
          kind: it.kind,
          query,
          placeId: (day?.placeId as PlaceId | undefined) ?? undefined,
          sourceId: it.sourceId,
          locationHint: it.locationLabel,
        }
      }),
  )

  function skipSuggestion(sourceId: string) {
    setSkippedSuggestionIds((prev) => (prev.includes(sourceId) ? prev : [...prev, sourceId]))
  }

  function addSuggestion(id: string, kind?: 'experience' | 'activity' | 'restaurant') {
    if (kind === 'activity') addActivity(id)
    else if (kind === 'restaurant') {
      if (!restaurantIds.includes(id)) toggleRestaurant(id)
    } else addExperience(id)
  }

  function removeItem(item: ItineraryItem) {
    if (item.selectionState === 'recommended') {
      if (item.sourceId) skipSuggestion(item.sourceId)
      return
    }
    setRemovedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
    if (item.kind === 'experience' && item.sourceId) removeExperience(item.sourceId)
    if (item.kind === 'activity' && item.sourceId) removeActivity(item.sourceId)
    if (item.kind === 'meal' && item.sourceId && restaurantIds.includes(item.sourceId)) {
      toggleRestaurant(item.sourceId)
    }
  }

  function restoreItem(item: ItineraryItem) {
    setRemovedItemIds((prev) => prev.filter((id) => id !== item.id))
    if (item.sourceId) {
      setSkippedSuggestionIds((prev) =>
        prev.filter((id) => id !== item.sourceId && id !== `exp:${item.sourceId}` && id !== `act:${item.sourceId}`),
      )
    }
    if (item.selectionState === 'recommended') return
    if (item.kind === 'experience' && item.sourceId) addExperience(item.sourceId)
    if (item.kind === 'activity' && item.sourceId) addActivity(item.sourceId)
    if (item.kind === 'meal' && item.sourceId && !restaurantIds.includes(item.sourceId)) {
      toggleRestaurant(item.sourceId)
    }
  }

  function swapItem(from: ItineraryItem, toId: string) {
    removeItem(from)
    addExperience(toId)
  }

  function onAgendaSelect(id: string) {
    setHighlightId(id)
    document.getElementById(`yv-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
            Your trip · live plan
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
                Your Vietnam
              </h1>
              <p className="mt-2 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted">
                Set the shape, see the map, then curate each day.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.88rem] font-semibold text-ink">
                <span>
                  {trip.daysCount} day{trip.daysCount === 1 ? '' : 's'}
                </span>
                <span className="text-ink/25">·</span>
                <span>
                  {trip.cityCount} {trip.cityCount === 1 ? 'city' : 'cities'}
                </span>
                <span className="text-ink/25">·</span>
                <span>{trip.travellersLabel}</span>
                {trip.dateRangeLabel && !trip.isEmpty && (
                  <>
                    <span className="text-ink/25">·</span>
                    <span className="font-medium text-muted">{trip.dateRangeLabel}</span>
                  </>
                )}
              </div>
            </div>
            {!trip.isEmpty && (
              <button
                type="button"
                onClick={() => exportYourVietnamPdf(trip)}
                className="rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-3 text-[0.92rem] font-bold text-paper shadow-[0_10px_24px_rgba(196,92,58,0.28)] transition hover:scale-[1.01]"
              >
                Download itinerary PDF ↓
              </button>
            )}
          </div>
        </div>
      </header>

      {trip.isEmpty ? (
        <EmptySketch />
      ) : (
        <>
          <div className="mt-6">
            <TripVariablesBar />
          </div>

          <TripPlannerNotes
            stops={trip.route}
            daysCount={trip.daysCount}
            onNightChange={setCityNightOverride}
          />

          <MustVisitCitiesSection cities={trip.mustVisit} />

          <div className="mt-6">
            <DayToggleBar days={trip.days} activeDay={activeDay} onSelect={setActiveDay} />
          </div>

          {day ? (
            <>
              <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,42%)]">
                <div className="min-w-0">
                  <DayAgendaList
                    day={day}
                    activeId={highlightId}
                    onSelect={onAgendaSelect}
                    pinNumberById={agendaPinNumbers(dayStops)}
                    groupSize={basics.groupSize}
                  />
                </div>
                <aside className="order-first lg:order-none">
                  <TripBagCityMap
                    key={`${day.day}-${day.placeId ?? 'city'}`}
                    stops={dayStops}
                    cityLabel={day.city}
                    placeId={day.placeId as PlaceId | undefined}
                    activeStopId={highlightId}
                    onSelectStop={onAgendaSelect}
                  />
                  <p className="mt-2 text-[0.75rem] text-muted">
                    Day {day.day} in {day.city} — numbered pins match the agenda; the stay marker is your hotel.
                  </p>
                </aside>
              </div>
              <div className="mt-8">
                <DayPlan
                  day={day}
                  highlightId={highlightId}
                  itinerarySourceIds={[...itineraryExperienceIds, ...itineraryActivityIds]}
                  onRemoveItem={removeItem}
                  onRestoreItem={restoreItem}
                  onAddSuggestion={addSuggestion}
                  onSkipSuggestion={skipSuggestion}
                  onMoveExperience={setExperienceSlot}
                  onSwapItem={(from, to) => swapItem(from, to.id)}
                />
              </div>
            </>
          ) : (
            <p className="mt-6 text-muted">No days to show yet.</p>
          )}

          <AddMoreSightsSection
            thinCities={trip.thinCities.filter((c) => c.city === day?.city)}
            selectedIds={[...experienceIds, ...itineraryExperienceIds]}
            tripDate={basics.dateMode === 'exact' && basics.startDate ? basics.startDate : null}
          />
        </>
      )}

      {addPeriod && day?.placeId && (
        <AddToDayDrawer
          placeId={day.placeId as PlaceId}
          period={addPeriod}
          packedExperienceIds={itineraryExperienceIds}
          packedActivityIds={itineraryActivityIds}
          onClose={() => setAddPeriod(null)}
          onAdded={() => setAddPeriod(null)}
        />
      )}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-6">
        <SkipToMenu current="itinerary" />
        <div className="flex flex-wrap gap-3">
          <Link
            to={stepPath('experiences')}
            className="text-[0.88rem] font-semibold text-muted hover:text-ink"
          >
            Add more experiences
          </Link>
          {!trip.isEmpty && (
            <button
              type="button"
              onClick={() => exportYourVietnamPdf(trip)}
              className="btn-solid"
            >
              Download itinerary PDF ↓
            </button>
          )}
        </div>
      </div>
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
        Add experiences, activities or stays to the trip bag — then we&apos;ll shape a day-by-day
        plan around duration, group, holiday kind and budget.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={experiencesUrl()} className="btn-solid">
          Explore experiences
        </Link>
        <Link
          to={whereToStayUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Choose where to stay
        </Link>
        <Link
          to={foodUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Explore food
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
