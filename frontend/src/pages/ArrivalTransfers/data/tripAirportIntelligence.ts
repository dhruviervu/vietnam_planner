import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { HOTELS } from '../../PlanBuilder/data/hotels'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import { STAY_CLUSTERS } from '../../WhereToStay/data/clusters'
import { mapPlaceToStayCity } from '../../WhereToStay/services/tripBagStayIntelligence'
import type { StayCityId } from '../../WhereToStay/data/types'
import { AIRPORTS, DESTINATIONS, getAirport, getDestination, getRoute } from './catalog'
import type { AirportId, ArrivalContext, TransportMode } from './types'

export type TripAirportCity = {
  /** Stable key for UI selection */
  id: string
  label: string
  airportId: AirportId
  airportName: string
  airportCode: AirportId
  defaultDestinationId: string
  transferHint: string
  /** Road distance airport → city hub (km) — informational only */
  distanceKm: number
  timeMin: [number, number]
  /** e.g. "≈ 30 km · 35–60 min" */
  distanceLabel: string
  cityHubLabel: string
  source: 'trip' | 'all'
  note?: string
  experienceCount: number
  activityCount: number
  stayCount: number
  /** Total selected trip items in this city */
  itemCount: number
  itemSummary: string
  /** Why this city ranks for flying in (item-based, not distance) */
  recommendReason: string
  recommendScore: number
  /** City with the most selected trip items — ideal starting point */
  isSmartPick: boolean
  isStartingCity: boolean
}

type CityAcc = {
  city: TripAirportCity
  experienceCount: number
  activityCount: number
  stayCount: number
}

/** StayCityId / place names → airport + default destination */
const STAY_CITY_AIRPORT: Record<
  StayCityId,
  { airportId: AirportId; defaultDestinationId: string; label: string }
> = {
  hanoi: { airportId: 'HAN', defaultDestinationId: 'han-old-quarter', label: 'Hanoi' },
  hcmc: { airportId: 'SGN', defaultDestinationId: 'sgn-d1', label: 'Ho Chi Minh City' },
  'da-nang': { airportId: 'DAD', defaultDestinationId: 'dad-city', label: 'Da Nang' },
  'hoi-an': { airportId: 'DAD', defaultDestinationId: 'dad-hoi-an', label: 'Hoi An' },
  hue: { airportId: 'DAD', defaultDestinationId: 'dad-hue', label: 'Hue' },
  'nha-trang': { airportId: 'CXR', defaultDestinationId: 'cxr-nha-trang', label: 'Nha Trang' },
  'phu-quoc': { airportId: 'PQC', defaultDestinationId: 'pqc-duong-dong', label: 'Phu Quoc' },
  dalat: { airportId: 'CXR', defaultDestinationId: 'cxr-nha-trang', label: 'Da Lat' },
}

function routeMetrics(airportId: AirportId, destinationId: string) {
  const route = getRoute(airportId, destinationId)
  const dest = getDestination(destinationId)
  const distanceKm = route?.distanceKm ?? dest?.distanceKm ?? 25
  const timeMin = route?.typicalTimeMin ?? dest?.typicalTimeMin ?? ([25, 50] as [number, number])
  return { distanceKm, timeMin }
}

function formatDistanceLabel(distanceKm: number, timeMin: [number, number]) {
  return `≈ ${distanceKm} km · ${timeMin[0]}–${timeMin[1]} min`
}

function formatItemSummary(exp: number, act: number, stay: number) {
  const parts: string[] = []
  if (exp) parts.push(`${exp} experience${exp === 1 ? '' : 's'}`)
  if (act) parts.push(`${act} activit${act === 1 ? 'y' : 'ies'}`)
  if (stay) parts.push(`${stay} stay${stay === 1 ? '' : 's'}`)
  return parts.join(' · ') || 'On your trip'
}

function enrichCity(
  base: Omit<
    TripAirportCity,
    | 'distanceKm'
    | 'timeMin'
    | 'distanceLabel'
    | 'cityHubLabel'
    | 'recommendReason'
    | 'recommendScore'
    | 'isSmartPick'
    | 'isStartingCity'
    | 'experienceCount'
    | 'activityCount'
    | 'stayCount'
    | 'itemCount'
    | 'itemSummary'
  > &
    Partial<
      Pick<
        TripAirportCity,
        'experienceCount' | 'activityCount' | 'stayCount' | 'itemCount' | 'itemSummary'
      >
    >,
): TripAirportCity {
  const { distanceKm, timeMin } = routeMetrics(base.airportId, base.defaultDestinationId)
  const dest = getDestination(base.defaultDestinationId)
  const experienceCount = base.experienceCount ?? 0
  const activityCount = base.activityCount ?? 0
  const stayCount = base.stayCount ?? 0
  const itemCount = base.itemCount ?? experienceCount + activityCount + stayCount
  return {
    ...base,
    experienceCount,
    activityCount,
    stayCount,
    itemCount,
    itemSummary: base.itemSummary ?? formatItemSummary(experienceCount, activityCount, stayCount),
    distanceKm,
    timeMin,
    distanceLabel: formatDistanceLabel(distanceKm, timeMin),
    cityHubLabel: dest?.label ?? base.label,
    recommendReason: '',
    recommendScore: 0,
    isSmartPick: false,
    isStartingCity: false,
  }
}

function resolveAirportCity(place: string): TripAirportCity | null {
  const stayId = mapPlaceToStayCity(place)
  if (!stayId) return null
  const mapped = STAY_CITY_AIRPORT[stayId]
  if (!mapped) return null
  if (stayId === 'dalat') return null
  const airport = getAirport(mapped.airportId)
  if (!airport) return null
  return enrichCity({
    id: stayId,
    label: mapped.label,
    airportId: mapped.airportId,
    airportName: airport.name,
    airportCode: airport.code,
    defaultDestinationId: mapped.defaultDestinationId,
    transferHint: airport.transferHint,
    source: 'trip',
  })
}

function ensureAcc(map: Map<string, CityAcc>, city: TripAirportCity): CityAcc {
  let acc = map.get(city.id)
  if (!acc) {
    acc = { city, experienceCount: 0, activityCount: 0, stayCount: 0 }
    map.set(city.id, acc)
  }
  return acc
}

/**
 * Rank by selected trip items only — never by airport distance.
 * Starting city = the city with the most experiences, activities, and stays.
 */
function scoreAndRankCities(accs: CityAcc[], fromTrip: boolean): TripAirportCity[] {
  if (accs.length === 0) return []

  const scored = accs.map(({ city, experienceCount, activityCount, stayCount }) => {
    const itemCount = experienceCount + activityCount + stayCount
    const recommendScore = experienceCount * 10 + activityCount * 10 + stayCount * 14
    const enriched = enrichCity({
      ...city,
      experienceCount,
      activityCount,
      stayCount,
      itemCount,
      itemSummary: formatItemSummary(experienceCount, activityCount, stayCount),
      note:
        itemCount > 0
          ? formatItemSummary(experienceCount, activityCount, stayCount)
          : city.note,
    })
    return {
      ...enriched,
      recommendScore,
      recommendReason:
        !fromTrip || itemCount === 0
          ? `${city.airportName} · ${enriched.distanceLabel} to ${enriched.cityHubLabel}`
          : itemCount === 1
            ? 'You have 1 trip item here — a natural place to begin'
            : `You have ${itemCount} trip items here (${formatItemSummary(experienceCount, activityCount, stayCount)})`,
    }
  })

  scored.sort((a, b) => {
    if (b.itemCount !== a.itemCount) return b.itemCount - a.itemCount
    if (b.recommendScore !== a.recommendScore) return b.recommendScore - a.recommendScore
    return a.label.localeCompare(b.label)
  })

  const top = scored[0]
  const runnerUp = scored[1]
  const clearLead =
    fromTrip &&
    top &&
    top.itemCount > 0 &&
    (!runnerUp || top.itemCount > runnerUp.itemCount)

  return scored.map((c, i) => {
    const isStarting = i === 0 && fromTrip && c.itemCount > 0
    let recommendReason = c.recommendReason
    if (isStarting && clearLead && runnerUp && runnerUp.itemCount > 0) {
      recommendReason = `Start here — ${c.itemCount} trip items vs ${runnerUp.itemCount} in ${runnerUp.label}`
    } else if (isStarting && clearLead) {
      recommendReason = `Start here — most of your selected trip is in ${c.label} (${c.itemCount} items)`
    } else if (isStarting) {
      recommendReason = `Tied for most items (${c.itemCount}) — a strong place to start`
    } else if (fromTrip && top && c.itemCount < top.itemCount) {
      recommendReason = `${c.itemCount} item${c.itemCount === 1 ? '' : 's'} here · ${top.label} has more (${top.itemCount}) — start there first`
    }

    return {
      ...c,
      recommendReason,
      isSmartPick: isStarting,
      isStartingCity: isStarting,
    }
  })
}

export function collectTripAirportCities(input: {
  experienceIds: string[]
  activityIds: string[]
  hotelIds: string[]
  chosenStayId: string | null
  itineraryStayPropertyIds: string[]
}): TripAirportCity[] {
  const byId = new Map<string, CityAcc>()

  for (const e of EXPERIENCES.filter((x) => input.experienceIds.includes(x.id))) {
    const city = resolveAirportCity(e.city) ?? resolveAirportCity(e.region)
    if (!city) continue
    ensureAcc(byId, city).experienceCount += 1
  }

  for (const a of CITY_ACTIVITIES.filter((x) => input.activityIds.includes(x.id))) {
    const city = resolveAirportCity(a.cityId) ?? resolveAirportCity(a.cityName)
    if (!city) continue
    ensureAcc(byId, city).activityCount += 1
  }

  const hotelIds = [
    ...input.hotelIds,
    ...(input.chosenStayId && !input.hotelIds.includes(input.chosenStayId)
      ? [input.chosenStayId]
      : []),
  ]
  const countedStayHotels = new Set<string>()
  for (const h of HOTELS.filter((x) => hotelIds.includes(x.id))) {
    const city = resolveAirportCity(h.city)
    if (!city) continue
    if (countedStayHotels.has(h.id)) continue
    countedStayHotels.add(h.id)
    ensureAcc(byId, city).stayCount += 1
  }

  for (const stayId of input.itineraryStayPropertyIds) {
    const prop = STAY_PROPERTY_BY_ID[stayId]
    if (!prop) continue
    const cluster = STAY_CLUSTERS.find((c) => c.id === prop.clusterId)
    if (!cluster) continue
    const mapped = STAY_CITY_AIRPORT[cluster.cityId]
    if (!mapped || cluster.cityId === 'dalat') continue
    const airport = getAirport(mapped.airportId)
    if (!airport) continue
    const city = enrichCity({
      id: cluster.cityId,
      label: mapped.label,
      airportId: mapped.airportId,
      airportName: airport.name,
      airportCode: airport.code,
      defaultDestinationId: mapped.defaultDestinationId,
      transferHint: airport.transferHint,
      source: 'trip',
    })
    ensureAcc(byId, city).stayCount += 1
  }

  if (byId.size > 0) {
    const tripRanked = scoreAndRankCities([...byId.values()], true)
    return mergeAllAirports(tripRanked)
  }

  return mergeAllAirports([])
}

const HUB_CITY_ID: Partial<Record<AirportId, string>> = {
  HAN: 'hanoi',
  SGN: 'hcmc',
  DAD: 'da-nang',
  PQC: 'phu-quoc',
  CXR: 'nha-trang',
}

/** Always surface every Vietnam airport we support, then extra trip cities (Hoi An, Hue). */
function mergeAllAirports(tripRanked: TripAirportCity[]): TripAirportCity[] {
  const hubs = AIRPORTS.map((a) => {
    const preferred = HUB_CITY_ID[a.id]
    const match =
      tripRanked.find((c) => c.id === preferred) ??
      tripRanked.find((c) => c.airportId === a.id && c.label === a.city)
    if (match) return match
    return enrichCity({
      id: preferred ?? a.id.toLowerCase(),
      label: a.city,
      airportId: a.id,
      airportName: a.name,
      airportCode: a.code,
      defaultDestinationId: a.defaultDestinationId,
      transferHint: a.transferHint,
      source: 'all',
    })
  })
  const extras = tripRanked.filter((c) => !hubs.some((h) => h.id === c.id))
  return [...hubs, ...extras]
}

export function getSmartFlyIntoPick(cities: TripAirportCity[]): TripAirportCity | null {
  return cities.find((c) => c.isStartingCity || c.isSmartPick) ?? null
}

/** Trip-aware tip when the user selected a city that isn't their densest one. */
export function buildStartingCityNudge(
  selected: TripAirportCity | null,
  cities: TripAirportCity[],
): string | null {
  const start = getSmartFlyIntoPick(cities)
  if (!start || !selected || selected.id === start.id) return null
  if (start.itemCount <= selected.itemCount) return null
  return `Most of your trip is in ${start.label} (${start.itemCount} items vs ${selected.itemCount} here). Ideally start by flying into ${start.label}.`
}

export type StayTransferContext = {
  stayName: string
  stayArea: string
  city: string
  destinationId: string | null
}

/** Resolve a selected stay for arrival advice (prefer chosen, then itinerary property, then bag). */
export function resolveSelectedStay(input: {
  chosenStayId: string | null
  itineraryStayPropertyIds: string[]
  hotelIds: string[]
  airportId: AirportId | null
}): StayTransferContext | null {
  const matchesAirport = (destinationId: string | null, cityLabel: string) => {
    if (!input.airportId) return true
    if (destinationId) {
      const dest = getDestination(destinationId)
      if (dest) return dest.airportId === input.airportId
    }
    const mapped = resolveAirportCity(cityLabel)
    return !mapped || mapped.airportId === input.airportId
  }

  if (input.chosenStayId) {
    const hotel = HOTELS.find((h) => h.id === input.chosenStayId)
    if (hotel) {
      const dest = matchDestinationForHotel(hotel.city, hotel.neighborhood ?? hotel.mapsQuery)
      if (matchesAirport(dest?.id ?? null, hotel.city)) {
        return {
          stayName: hotel.name,
          stayArea: hotel.neighborhood || hotel.city,
          city: hotel.city,
          destinationId: dest?.id ?? null,
        }
      }
    }
  }

  for (const id of input.itineraryStayPropertyIds) {
    const prop = STAY_PROPERTY_BY_ID[id]
    if (!prop) continue
    const cluster = STAY_CLUSTERS.find((c) => c.id === prop.clusterId)
    if (!cluster) continue
    const mapped = STAY_CITY_AIRPORT[cluster.cityId]
    const destId = mapped?.defaultDestinationId ?? null
    if (input.airportId && mapped && mapped.airportId !== input.airportId) continue
    return {
      stayName: prop.name,
      stayArea: cluster.name,
      city: mapped?.label ?? cluster.cityId,
      destinationId: destId,
    }
  }

  for (const hotelId of input.hotelIds) {
    const hotel = HOTELS.find((h) => h.id === hotelId)
    if (!hotel) continue
    const dest = matchDestinationForHotel(hotel.city, hotel.neighborhood ?? hotel.mapsQuery)
    if (!matchesAirport(dest?.id ?? null, hotel.city)) continue
    return {
      stayName: hotel.name,
      stayArea: hotel.neighborhood || hotel.city,
      city: hotel.city,
      destinationId: dest?.id ?? null,
    }
  }

  return null
}

function matchDestinationForHotel(city: string, areaHint?: string) {
  const hint = (areaHint ?? '').toLowerCase()
  const cityLc = city.toLowerCase()
  return (
    DESTINATIONS.find((d) => {
      const cityHit = d.city.toLowerCase() === cityLc || cityLc.includes(d.city.toLowerCase())
      if (!cityHit) return false
      if (!hint) return d.popularBase
      return (
        hint.includes(d.area.toLowerCase()) ||
        hint.includes(d.label.toLowerCase()) ||
        d.mapsQuery.toLowerCase().includes(hint.slice(0, 12))
      )
    }) ?? DESTINATIONS.find((d) => d.city.toLowerCase() === cityLc && d.popularBase)
  )
}

export type SmartAdvice = {
  headline: string
  summary: string
  bullets: string[]
  modeHint: string
  tripNudge: string | null
}

export function buildSmartTransferAdvice(
  mode: TransportMode | null,
  ctx: ArrivalContext,
  stay: StayTransferContext | null,
  opts?: {
    selectedCity?: TripAirportCity | null
    tripCities?: TripAirportCity[]
  },
): SmartAdvice {
  const inbound = ctx.direction === 'inbound'
  const pax = ctx.passengers
  const luggage = ctx.luggageLevel
  const late = ctx.lateArrival || ctx.arrivalTime === 'late'
  const early = ctx.arrivalTime === 'morning'
  const dest = ctx.routeDestinationLabel ?? 'the city'
  const code = ctx.routeAirportCode ?? 'the airport'
  const selectedCity = opts?.selectedCity ?? null
  const tripNudge = buildStartingCityNudge(selectedCity, opts?.tripCities ?? [])

  const bullets: string[] = []

  if (selectedCity?.isStartingCity && selectedCity.itemCount > 0) {
    bullets.push(
      inbound
        ? `${selectedCity.label} holds most of your trip (${selectedCity.itemCount} items) — flying in here first keeps your itinerary in order.`
        : `Leaving from ${selectedCity.label} makes sense when this is where most of your trip lives (${selectedCity.itemCount} items).`,
    )
  } else if (tripNudge) {
    bullets.push(tripNudge)
  }

  if (pax >= 4) {
    bullets.push(
      inbound
        ? `With ${pax} travellers, a private transfer or large taxi usually costs less stress than stacking ride-hails.`
        : `A group of ${pax} is easier with one pre-booked vehicle back to ${code} than splitting across apps.`,
    )
  } else if (pax === 1) {
    bullets.push(
      inbound
        ? 'Solo arrivals can use ride-hail or a shared transfer when luggage is light and timing is daytime.'
        : 'Solo departures work well with ride-hail if you leave a generous airport buffer.',
    )
  } else {
    bullets.push(
      inbound
        ? `For ${pax} people, door-to-door car or private transfer keeps the group together after landing.`
        : `For ${pax} people, one vehicle to ${code} is usually cleaner than coordinating separate pickups.`,
    )
  }

  if (luggage === 'heavy') {
    bullets.push(
      'Heavy luggage favours private transfer or a spacious taxi — skip crowded buses and tiny cars.',
    )
  } else if (luggage === 'light') {
    bullets.push(
      'Light bags open bus and shared options if you want to save, especially in daytime traffic.',
    )
  } else {
    bullets.push('Medium luggage fits most taxis and private cars; confirm boot space if you have hard cases.')
  }

  if (late) {
    bullets.push(
      inbound
        ? 'Late arrivals: pre-book private or confirmed taxi — public options thin out and queues grow.'
        : 'Late departures still need an early buffer; overnight traffic is lighter but check-in is not.',
    )
  } else if (early) {
    bullets.push(
      inbound
        ? 'Early landings are calm for transfers — a good window to go straight to your base and rest.'
        : 'Early flights: leave with your airport buffer; city traffic can still surprise morning departures.',
    )
  } else if (ctx.arrivalTime === 'afternoon') {
    bullets.push('Midday and afternoon can mean heavier traffic — bake in the upper end of the time range.')
  }

  if (selectedCity) {
    bullets.push(
      `Transfer context: ${selectedCity.airportCode} is ≈ ${selectedCity.distanceKm} km from ${selectedCity.cityHubLabel} (${selectedCity.timeMin[0]}–${selectedCity.timeMin[1]} min by road).`,
    )
  }

  if (mode) {
    bullets.push(
      `Right now we lean toward ${mode.label} for this profile — you can still browse every option below.`,
    )
  }

  const modeHint = mode
    ? `${mode.symbol} ${mode.label}`
    : inbound
      ? 'Private transfer or taxi'
      : 'Pre-booked car to the airport'

  const headline = inbound
    ? `Smart way into ${dest}`
    : `Smart way back to ${code}`

  const summary = inbound
    ? stay
      ? selectedCity?.isStartingCity
        ? `You are starting in ${selectedCity.label}, where most of your trip sits. Land, then go to ${stay.stayName} to drop bags — or take one calm sight on the way if energy allows.`
        : `Land, then choose: go straight to ${stay.stayName} to drop bags, or take a gentle sight on the way if energy allows.`
      : selectedCity?.isStartingCity
        ? `Start in ${selectedCity.label} — it has the most of what you selected. Match the ride to party, bags, and timing below.`
        : `Match the ride to your party, bags, and timing — then refine the exact option below.`
    : `Plan the return with the same profile in mind: luggage, group size, and a calm buffer before check-in.`

  return {
    headline,
    summary,
    bullets: bullets.slice(0, 6),
    modeHint,
    tripNudge,
  }
}

export type StayPathAdvice = {
  title: string
  directTitle: string
  directBody: string
  exploreTitle: string
  exploreBody: string
  tip: string
}

/** Only call when a stay is selected. */
export function buildStayPathAdvice(
  stay: StayTransferContext,
  ctx: ArrivalContext,
  airportLabel: string,
  selectedCity?: TripAirportCity | null,
): StayPathAdvice {
  const inbound = ctx.direction === 'inbound'
  const late = ctx.lateArrival || ctx.arrivalTime === 'late'
  const heavy = ctx.luggageLevel === 'heavy'
  const startBit =
    selectedCity?.isStartingCity && selectedCity.itemCount > 0
      ? ` This is also where most of your trip begins (${selectedCity.itemCount} items).`
      : ''

  if (!inbound) {
    return {
      title: `Leaving from near ${stay.stayName}`,
      directTitle: 'Straight to the airport',
      directBody: `Ask your hotel for a reliable pickup toward ${airportLabel}. Depart with the full buffer — traffic and security queues are the usual surprises.${startBit}`,
      exploreTitle: 'One last stop?',
      exploreBody: `Only add a café or short sight if it sits on the way and you still keep your airport buffer intact.`,
      tip: 'Confirm luggage load time with reception the evening before.',
    }
  }

  const directBody = heavy || late
    ? `With ${heavy ? 'heavier bags' : 'a late landing'}, go directly to ${stay.stayName} in ${stay.stayArea}. Drop luggage, shower, and let the city wait an hour — you will enjoy it more.${startBit}`
    : `The simplest luxury after a flight is arriving at ${stay.stayName}, leaving bags safely, and only then deciding what to see.${startBit}`

  const exploreBody = late || heavy
    ? `Sightseeing before check-in is usually a poor trade when you are tired or loaded with bags. Save the neighbourhood walk for after you settle.`
    : `If you land fresh and travel light, you can pause for one calm stop between ${airportLabel} and ${stay.stayArea} — a lake edge, a café, or a landmark on the natural drive — then continue to ${stay.stayName} to drop bags.`

  return {
    title: `From the airport to ${stay.stayName}`,
    directTitle: 'Go straight to your stay',
    directBody,
    exploreTitle: 'Or see something on the way',
    exploreBody,
    tip: late || heavy
      ? 'Our recommendation: direct to stay first.'
      : 'Either path works — choose based on energy, not FOMO.',
  }
}
