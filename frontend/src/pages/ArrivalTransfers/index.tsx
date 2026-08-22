import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { useTripStore } from '../../store/tripStore'
import { HOTELS } from '../PlanBuilder/data/hotels'
import {
  AIRPORTS,
  DESTINATIONS,
  formatTimeRange,
  getAirport,
  getDefaultModes,
  getDefaultProviders,
  getDestination,
  getDestinationsForAirport,
  getModesForRoute,
  getProvidersForMode,
  getRoute,
} from './data/catalog'
import { withRouteJourneyLabels } from './data/modes'
import {
  alternativeModes,
  evaluateAvailability,
  suitabilityScore,
} from './data/availability'
import { pickOurMode, scoreMode, sortModes } from './data/recommendation'
import type {
  AirportId,
  ArrivalContext,
  DiscoveryFilters,
  ModeEvaluation,
  TransferDirection,
  TransportModeId,
} from './data/types'
import { ArrivalHero } from './components/ArrivalHero'
import { AirportCityPicker } from './components/AirportCityPicker'
import { RouteSelector } from './components/RouteSelector'
import { RouteContextBar } from './components/RouteContextBar'
import {
  RoutePreferenceChips,
  applyRoutePreference,
  type RoutePreference,
} from './components/RoutePreferenceChips'
import { DirectionSwitch } from './components/DirectionSwitch'
import { PlanningContext } from './components/PlanningContext'
import { JourneySummary } from './components/JourneySummary'
import { TravelProfile } from './components/TravelProfile'
import { SmartTransferGuide } from './components/SmartTransferGuide'
import { FilterRail } from './components/FilterRail'
import { ModeDiscovery } from './components/ModeDiscovery'
import { OurPick, type PickPanelKind } from './components/OurPick'
import { BeforeYouBook } from './components/BeforeYouBook'
import {
  buildSmartTransferAdvice,
  buildStayPathAdvice,
  buildStartingCityNudge,
  collectTripAirportCities,
  getSmartFlyIntoPick,
  resolveSelectedStay,
  type TripAirportCity,
} from './data/tripAirportIntelligence'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const EMPTY_FILTERS: DiscoveryFilters = {
  bestFit: false,
  cheapest: false,
  fastest: false,
  highestRated: false,
  availableNow: false,
  allDay: false,
  accessible: false,
  freeCancellation: false,
  direct: false,
}

export function ArrivalTransfersPage({ embedded = false }: { embedded?: boolean }) {
  const basics = useTripStore((s) => s.basics)
  const selectedHotelIds = useTripStore((s) => s.selectedHotelIds)
  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedActivityIds = useTripStore((s) => s.selectedActivityIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const itineraryStayPropertyIds = useTripStore((s) => s.itineraryStayPropertyIds)

  const [direction, setDirection] = useState<TransferDirection>('inbound')
  const [airportId, setAirportId] = useState<AirportId | null>(null)
  const [destinationId, setDestinationId] = useState<string | null>(null)
  const [tripCityId, setTripCityId] = useState<string | null>(null)
  const [arrivalTime, setArrivalTime] = useState<ArrivalContext['arrivalTime']>('not-set')
  const [passengers, setPassengers] = useState(2)
  const [luggageLevel, setLuggageLevel] = useState<ArrivalContext['luggageLevel']>('medium')
  const [accessibility, setAccessibility] = useState(false)
  const [budgetPriority, setBudgetPriority] = useState(false)
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS)
  const [routePreference, setRoutePreference] = useState<RoutePreference>(null)
  const [selectedModeId, setSelectedModeId] = useState<TransportModeId | null>(null)
  const [expandedId, setExpandedId] = useState<TransportModeId | null>(null)
  const [userPickedMode, setUserPickedMode] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const tripAirportCities = useMemo(
    () =>
      collectTripAirportCities({
        experienceIds: selectedExperienceIds,
        activityIds: selectedActivityIds,
        hotelIds: selectedHotelIds,
        chosenStayId,
        itineraryStayPropertyIds,
      }),
    [
      selectedExperienceIds,
      selectedActivityIds,
      selectedHotelIds,
      chosenStayId,
      itineraryStayPropertyIds,
    ],
  )

  const citiesFromTrip = tripAirportCities.some((c) => c.source === 'trip')

  const selectedStay = useMemo(
    () =>
      resolveSelectedStay({
        chosenStayId,
        itineraryStayPropertyIds,
        hotelIds: selectedHotelIds,
        airportId,
      }),
    [chosenStayId, itineraryStayPropertyIds, selectedHotelIds, airportId],
  )

  const arrivalLabel = useMemo(() => {
    if (basics.dateMode === 'exact' && basics.startDate) {
      const d = new Date(`${basics.startDate}T12:00:00`)
      if (!Number.isNaN(d.getTime())) {
        return d
          .toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          .toUpperCase()
      }
    }
    return null
  }, [basics.dateMode, basics.startDate])

  const airport = airportId ? getAirport(airportId) ?? null : null
  const destinations = airportId ? getDestinationsForAirport(airportId) : DESTINATIONS
  const destination = destinationId ? getDestination(destinationId) ?? null : null
  const route =
    airportId && destinationId ? getRoute(airportId, destinationId) ?? null : null

  const cityLabel = airport
    ? destination && destination.id !== airport.defaultDestinationId
      ? destination.label
      : airport.cityHubLabel
    : 'Central city'

  const ctx: ArrivalContext = useMemo(
    () => ({
      passengers,
      luggageLevel,
      lateArrival: arrivalTime === 'late',
      arrivalTime,
      hasAccessibilityNeed: accessibility || filters.accessible,
      arrivalLabel,
      direction,
      budgetPriority: budgetPriority || filters.cheapest,
      routeAirportCode: airportId,
      routeDestinationLabel: destination?.label ?? null,
    }),
    [
      passengers,
      luggageLevel,
      arrivalTime,
      accessibility,
      filters.accessible,
      filters.cheapest,
      arrivalLabel,
      direction,
      budgetPriority,
      airportId,
      destination?.label,
    ],
  )

  function applyAirportAndDestination(
    nextAirportId: AirportId | null,
    preferredDestinationId?: string | null,
  ) {
    setAirportId(nextAirportId)
    if (!nextAirportId) {
      setDestinationId(null)
      return
    }
    const preferred = preferredDestinationId ? getDestination(preferredDestinationId) : null
    if (preferred && preferred.airportId === nextAirportId) {
      setDestinationId(preferred.id)
      return
    }
    setDestinationId(getAirport(nextAirportId)?.defaultDestinationId ?? null)
  }

  function handleAirport(id: AirportId | null) {
    applyAirportAndDestination(id)
    const match = tripAirportCities.find((c) => c.airportId === id)
    setTripCityId(match?.id ?? null)
    setUserPickedMode(false)
    setSelectedOptionId(null)
  }

  function handleTripCity(city: TripAirportCity) {
    setTripCityId(city.id)
    const stayForCity = resolveSelectedStay({
      chosenStayId,
      itineraryStayPropertyIds,
      hotelIds: selectedHotelIds,
      airportId: city.airportId,
    })
    applyAirportAndDestination(
      city.airportId,
      stayForCity?.destinationId ?? city.defaultDestinationId,
    )
    setUserPickedMode(false)
    setSelectedOptionId(null)
  }

  function handleDestination(id: string) {
    const dest = getDestination(id)
    if (dest && dest.airportId !== airportId) {
      setAirportId(dest.airportId)
      const match = tripAirportCities.find((c) => c.airportId === dest.airportId)
      setTripCityId(match?.id ?? null)
    }
    setDestinationId(id)
  }

  useEffect(() => {
    if (airportId || !citiesFromTrip || tripAirportCities.length === 0) return
    const pick = getSmartFlyIntoPick(tripAirportCities) ?? tripAirportCities[0]
    handleTripCity(pick)
    // Seed once when trip has airport cities and nothing selected yet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripAirportCities, citiesFromTrip, airportId])

  function handleSwap() {
    setDirection((d) => (d === 'inbound' ? 'outbound' : 'inbound'))
    setUserPickedMode(false)
    setSelectedOptionId(null)
  }

  function handleRoutePreference(pref: RoutePreference) {
    setRoutePreference(pref)
    setFilters((f) => applyRoutePreference(f, pref))
  }

  useEffect(() => {
    setUserPickedMode(false)
    setSelectedOptionId(null)
  }, [destinationId, arrivalTime, passengers, luggageLevel, accessibility, budgetPriority, direction])

  const tripSuggestions = useMemo(() => {
    const suggestions: { destinationId: string; label: string; note: string }[] = []

    if (selectedStay?.destinationId) {
      const dest = getDestination(selectedStay.destinationId)
      if (dest) {
        suggestions.push({
          destinationId: dest.id,
          label: dest.label,
          note: `Near ${selectedStay.stayName}`,
        })
      }
    }

    const hotels = HOTELS.filter((h) => selectedHotelIds.includes(h.id))
    for (const hotel of hotels) {
      const match = DESTINATIONS.find((d) => {
        const cityHit = d.city.toLowerCase() === hotel.city.toLowerCase()
        const areaHit =
          hotel.mapsQuery?.toLowerCase().includes(d.area.toLowerCase()) ||
          hotel.mapsQuery?.toLowerCase().includes(d.label.toLowerCase())
        return cityHit && (areaHit || d.popularBase)
      })
      if (match && !suggestions.some((s) => s.destinationId === match.id)) {
        suggestions.push({
          destinationId: match.id,
          label: match.label,
          note: 'From your stay bag',
        })
      }
    }

    for (const city of tripAirportCities.filter((c) => c.source === 'trip')) {
      if (!suggestions.some((s) => s.destinationId === city.defaultDestinationId)) {
        suggestions.push({
          destinationId: city.defaultDestinationId,
          label: city.label,
          note: city.note ?? 'From your trip',
        })
      }
    }

    return suggestions.slice(0, 4)
  }, [selectedHotelIds, selectedStay, tripAirportCities])

  const baseModes = useMemo(() => {
    let modes = route ? getModesForRoute(route, direction) : getDefaultModes(direction)
    if (airport) {
      const destLabel = destination?.label ?? airport.cityHubLabel
      const airportLabel = `${airport.name}`
      modes = modes.map((m) =>
        withRouteJourneyLabels(m, direction, airportLabel, destLabel),
      )
    }
    return modes
  }, [route, direction, airport, destination])

  const evaluations: ModeEvaluation[] = useMemo(() => {
    let modes = sortModes(baseModes, ctx)

    if (filters.fastest) {
      modes = [...modes].sort(
        (a, b) => a.timeMin[0] + a.timeMin[1] - (b.timeMin[0] + b.timeMin[1]),
      )
    } else if (filters.cheapest) {
      modes = [...modes].sort(
        (a, b) => a.costUsd[0] + a.costUsd[1] - (b.costUsd[0] + b.costUsd[1]),
      )
    }

    let evals: ModeEvaluation[] = modes.map((mode) => {
      const availability = evaluateAvailability(mode, ctx, route)
      const suitability = suitabilityScore(mode, ctx)
      return {
        mode,
        availability,
        suitability,
        score: scoreMode(mode, ctx) + suitability * 0.15,
        alternatives: [],
      }
    })

    evals = evals.map((ev) => ({
      ...ev,
      alternatives: alternativeModes(
        ev.mode.id,
        evals.filter((e) => e.availability.status !== 'unavailable').map((e) => e.mode),
      ),
    }))

    if (filters.accessible || accessibility) {
      evals = evals.filter(
        (e) => e.mode.accessible || e.mode.accessibilityLevel !== 'Not recommended',
      )
    }
    if (filters.allDay) evals = evals.filter((e) => e.mode.lateNightOk)
    if (filters.direct) {
      evals = evals.filter((e) =>
        ['private-transfer', 'car-taxi', 'rental-driver'].includes(e.mode.id),
      )
    }
    if (filters.availableNow) {
      evals = evals.filter((e) => e.availability.status === 'available')
    }
    if (filters.bestFit) {
      evals = [...evals].sort((a, b) => b.suitability - a.suitability)
    }

    return evals
  }, [baseModes, ctx, route, filters, accessibility])

  const availableForRec = evaluations
    .filter((e) => e.availability.status !== 'unavailable')
    .map((e) => e.mode)
  const recommendedMode =
    availableForRec.length > 0 ? pickOurMode(availableForRec, ctx) : evaluations[0]?.mode ?? null

  useEffect(() => {
    if (!evaluations.length) {
      setSelectedModeId(null)
      setExpandedId(null)
      return
    }
    const recId = recommendedMode?.id ?? evaluations[0].mode.id
    if (!userPickedMode) {
      setSelectedModeId(recId)
      setExpandedId(recId)
      return
    }
    if (!evaluations.some((e) => e.mode.id === selectedModeId)) {
      setSelectedModeId(recId)
      setExpandedId(recId)
      setUserPickedMode(false)
    }
  }, [evaluations, recommendedMode?.id, selectedModeId, userPickedMode])

  const selectedMode =
    evaluations.find((e) => e.mode.id === selectedModeId)?.mode ??
    recommendedMode ??
    evaluations[0]?.mode ??
    null

  const optionsByMode = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProvidersForMode>> = {}
    for (const ev of evaluations) {
      const timeLabel = formatTimeRange(ev.mode.timeMin)
      let list = route
        ? getProvidersForMode(route.id, ev.mode.id, direction, timeLabel)
        : getDefaultProviders(ev.mode.id, direction, timeLabel)
      if (filters.freeCancellation) {
        list = list.filter((o) => o.cancellationPolicy.toLowerCase().includes('free'))
      }
      if (filters.highestRated) {
        list = [...list].sort((a, b) => b.rating - a.rating)
      }
      map[ev.mode.id] = list
    }
    return map
  }, [evaluations, route, direction, filters.freeCancellation, filters.highestRated])

  const selectedOption =
    selectedMode && selectedOptionId
      ? (optionsByMode[selectedMode.id] ?? []).find((o) => o.id === selectedOptionId) ?? null
      : null

  const panelKind: PickPanelKind =
    userPickedMode &&
    recommendedMode &&
    selectedMode &&
    selectedMode.id !== recommendedMode.id
      ? 'selected-mode'
      : 'our-pick'

  function selectMode(id: TransportModeId) {
    setSelectedModeId(id)
    setExpandedId(id)
    setUserPickedMode(true)
    setSelectedOptionId(null)
  }

  function selectOption(id: string, modeId: TransportModeId) {
    setSelectedModeId(modeId)
    setExpandedId(modeId)
    setUserPickedMode(true)
    setSelectedOptionId((prev) => (prev === id ? null : id))
  }

  const journeyTime = route?.typicalTimeMin ?? selectedMode?.timeMin ?? ([25, 60] as [number, number])
  const planningDestinations = airportId ? getDestinationsForAirport(airportId) : []

  const selectedTripCity = useMemo(
    () => tripAirportCities.find((c) => c.id === tripCityId) ?? null,
    [tripAirportCities, tripCityId],
  )

  const startingCityNudge = useMemo(
    () => buildStartingCityNudge(selectedTripCity, tripAirportCities),
    [selectedTripCity, tripAirportCities],
  )

  const smartAdvice = useMemo(
    () =>
      buildSmartTransferAdvice(recommendedMode, ctx, selectedStay, {
        selectedCity: selectedTripCity,
        tripCities: tripAirportCities,
      }),
    [recommendedMode, ctx, selectedStay, selectedTripCity, tripAirportCities],
  )

  const stayPathAdvice = useMemo(() => {
    if (!selectedStay || !airport) return null
    return buildStayPathAdvice(selectedStay, ctx, airport.name, selectedTripCity)
  }, [selectedStay, airport, ctx, selectedTripCity])

  const ourPickTripHint = selectedTripCity?.isStartingCity
    ? `Fits starting in ${selectedTripCity.label}, where most of your trip items sit`
    : startingCityNudge
      ? startingCityNudge
      : null

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <ArrivalHero />

        <div className="mt-8 space-y-8">
          <AirportCityPicker
            cities={tripAirportCities}
            selectedId={tripCityId}
            onSelect={handleTripCity}
            fromTrip={citiesFromTrip}
          />

          <RouteSelector
            airports={AIRPORTS}
            airportId={airportId}
            destinationId={destinationId}
            destinations={destinations}
            direction={direction}
            tripSuggestions={tripSuggestions}
            onSelectAirport={handleAirport}
            onSelectDestination={handleDestination}
            onSwap={handleSwap}
          />

          <DirectionSwitch
            direction={direction}
            onChange={(d) => {
              setDirection(d)
              setUserPickedMode(false)
              setSelectedOptionId(null)
            }}
          />

          <PlanningContext
            airports={AIRPORTS}
            airportId={airportId}
            onSelectAirport={handleAirport}
            destinations={planningDestinations}
            destinationId={destinationId}
            onSelectDestination={handleDestination}
            direction={direction}
            arrivalTime={arrivalTime}
            onArrivalTime={setArrivalTime}
          />

          <JourneySummary
            airport={airport}
            destination={destination}
            cityLabel={cityLabel}
            direction={direction}
            arrivalTime={arrivalTime}
            distanceKm={route?.distanceKm ?? selectedTripCity?.distanceKm ?? null}
            timeMin={journeyTime}
            isTypical={!route}
            bufferHours={airport?.airportBufferHours}
            dataState={route?.dataState ?? 'typical'}
            tripHint={
              selectedTripCity?.isStartingCity
                ? `Starting city for your trip · ${selectedTripCity.itemCount} selected items`
                : startingCityNudge
            }
          />

          <TravelProfile
            passengers={passengers}
            luggageLevel={luggageLevel}
            accessibility={accessibility}
            budgetPriority={budgetPriority}
            onPassengers={setPassengers}
            onLuggage={setLuggageLevel}
            onAccessibility={setAccessibility}
            onBudget={setBudgetPriority}
          />

          {airportId ? (
            <SmartTransferGuide
              advice={smartAdvice}
              stay={selectedStay}
              stayPath={stayPathAdvice}
              recommendedMode={recommendedMode}
              direction={direction}
            />
          ) : null}
        </div>

        {selectedMode && recommendedMode ? (
          <motion.div
            key={`${airportId ?? 'vn'}-${destinationId ?? 'hub'}-${direction}-${arrivalTime}-${passengers}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-12"
          >
            <div className="gap-8 lg:grid lg:grid-cols-[minmax(9.5rem,0.22fr)_minmax(0,0.78fr)]">
              <FilterRail
                filters={filters}
                onToggle={(key) => {
                  setFilters((f) => {
                    const next = { ...f, [key]: !f[key] }
                    if (key === 'fastest' || key === 'cheapest' || key === 'direct') {
                      setRoutePreference(
                        next.fastest
                          ? 'fastest'
                          : next.cheapest
                            ? 'best-value'
                            : next.direct
                              ? 'fewest-connections'
                              : null,
                      )
                    }
                    return next
                  })
                }}
              />
              <div>
                <RouteContextBar
                  airport={airport}
                  destination={destination}
                  direction={direction}
                  arrivalTime={arrivalTime}
                />
                <RoutePreferenceChips value={routePreference} onChange={handleRoutePreference} />
                <ModeDiscovery
                  title={
                    direction === 'inbound'
                      ? `Ways Into ${cityLabel}`
                      : airport
                        ? `Ways Back To ${airport.name}`
                        : 'Ways Back To The Airport'
                  }
                  support={
                    direction === 'inbound'
                      ? selectedTripCity?.isStartingCity
                        ? `Start with modes into ${cityLabel} — where most of your selected trip lives (${selectedTripCity.itemCount} items).`
                        : startingCityNudge
                          ? startingCityNudge
                          : 'The legitimate ways to travel — what each mode is, who it suits, and which options are worth comparing.'
                      : selectedTripCity?.isStartingCity
                        ? `Returning from ${cityLabel}, your densest trip city — pick a mode that matches bags, party size, and timing.`
                        : 'Plan the return with schedules, buffers and the modes that actually work for your timing.'
                  }
                  evaluations={evaluations}
                  optionsByMode={optionsByMode}
                  selectedOptionId={selectedOptionId}
                  recommendedModeId={recommendedMode.id}
                  expandedId={expandedId}
                  onExpand={(id) => {
                    setExpandedId(id)
                    setSelectedModeId(id)
                    setUserPickedMode(true)
                    setSelectedOptionId(null)
                  }}
                  onSelectMode={selectMode}
                  onSelectOption={selectOption}
                  profile={{
                    passengers,
                    luggage: luggageLevel,
                    budget: budgetPriority || filters.cheapest,
                  }}
                  airportSelected={!!airportId}
                  destinationSelected={!!destinationId}
                  direction={direction}
                />
              </div>
            </div>

            <OurPick
              kind={panelKind}
              recommendedMode={recommendedMode}
              selectedMode={selectedMode}
              selectedOption={selectedOption}
              cityLabel={cityLabel}
              ctx={ctx}
              tripHint={ourPickTripHint}
              onBrowse={() => {
                setExpandedId(recommendedMode.id)
                scrollToId(`mode-${recommendedMode.id}`)
              }}
            />

            <BeforeYouBook />

            <p className="text-[0.78rem] font-medium text-muted">
              Airport-to-airport and intercity connections belong in a separate Getting Around
              planner — not on this page.
            </p>
          </motion.div>
        ) : null}
      </main>
      {!embedded && <Footer />}
    </>
  )
}
