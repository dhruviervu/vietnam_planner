import { getHub, getTopology } from '../../../GettingAround/data/transportNetwork'
import type { PlaceId } from '../../../GettingAround/data/types'
import { haversineKm } from './sightOrder'
import { northToSouth, placeCoords, placeLabel } from './cityPins'

/**
 * City-level facts the itinerary uses to pick an arrival city and write a
 * one-line briefing. Airports and “no airport here” notes match published
 * access (Sapa has no airfield — Vietnam Airlines and transfer operators
 * send travellers via Noi Bai / HAN; Ha Long day-trippers use HAN + van).
 */
export type CityPlanningContext = {
  placeId: PlaceId
  label: string
  hasOwnAirport: boolean
  airportName: string | null
  airportCode: string | null
  gatewayPlaceId: PlaceId | null
  howToArrive: string
  inCity: string
  note: string
}

const INTL_GATEWAYS = new Set<PlaceId>(['hanoi', 'hcmc', 'da-nang'])

/** Coarse bands used to keep the trip on a single north → south spine. */
export type MacroRegion = 'north' | 'central' | 'highlands' | 'south' | 'island'

export const MACRO_REGION: Partial<Record<PlaceId, MacroRegion>> = {
  hanoi: 'north',
  sapa: 'north',
  'ha-long': 'north',
  'ninh-binh': 'north',
  'ha-giang': 'north',
  hue: 'central',
  'da-nang': 'central',
  'hoi-an': 'central',
  'phong-nha': 'central',
  'nha-trang': 'central',
  dalat: 'highlands',
  hcmc: 'south',
  mekong: 'south',
  'can-tho': 'south',
  'ha-tien': 'south',
  'phu-quoc': 'island',
  'con-dao': 'island',
}

const IN_CITY: Partial<Record<PlaceId, string>> = {
  hanoi: 'Grab / taxi and walking in the Old Quarter; motorbike taxi for West Lake',
  'ha-long': 'Boat day from Tuan Chau; taxis between harbour and hotel',
  sapa: 'Walking in town; jeep or motorbike to villages and Fansipan',
  'ha-giang': 'Motorbike loop or private car with a local driver-guide',
  'ninh-binh': 'Private car / xe ôm between Hoa Lu, boats, and Hang Mua',
  hue: 'Taxi or cyclo inside the citadel; car to the tombs',
  'da-nang': 'Grab along the beach road; car to Marble Mountains or Hoi An',
  'hoi-an': 'Walk or cycle the Ancient Town; taxi from Da Nang Airport (~45 min)',
  'phong-nha': 'Car or tour van to the caves; limited evening transport',
  'nha-trang': 'Grab along the promenade; boat to the islands',
  dalat: 'Taxi or motorbike; cool highland roads between lakes and valleys',
  hcmc: 'Grab / metro for District 1; day-tour van for Cu Chi or the Mekong',
  mekong: 'Boat plus van from Can Tho or Saigon',
  'can-tho': 'Boat for markets; Grab in town',
  'phu-quoc': 'Taxi or rental bike; airport is on the island',
}

function airportCodeFromName(name: string | null): string | null {
  if (!name) return null
  const m = /\(([A-Z]{3})\)/.exec(name)
  return m?.[1] ?? null
}

function kmToGateway(placeId: PlaceId): number {
  const topo = getTopology(placeId)
  const hub = getHub(topo?.primaryAirportHubId)
  const here = placeCoords(placeId)
  if (!hub || !here) return 1e6
  return haversineKm({ lat: here.lat, lng: here.lng }, { lat: hub.lat, lng: hub.lng })
}

export function cityContext(placeId: PlaceId): CityPlanningContext {
  const topo = getTopology(placeId)
  const hub = getHub(topo?.primaryAirportHubId)
  const hasOwnAirport = Boolean(topo?.hasFlightAccess)
  const gatewayPlaceId = (hub?.placeId ?? null) as PlaceId | null
  const airportName = hub?.name ?? null
  const airportCode = airportCodeFromName(airportName)
  const label = placeLabel(placeId)
  const howToArrive = hasOwnAirport
    ? `Fly into ${airportName ?? 'the city airport'}`
    : airportName
      ? `No airport in ${label} — fly into ${airportName}, then van, bus, or train (~${Math.max(1, Math.round(kmToGateway(placeId) / 55))}h)`
      : `Overland to ${label}`
  const inCity = IN_CITY[placeId] ?? 'Taxi or Grab for in-city hops'
  return {
    placeId,
    label,
    hasOwnAirport,
    airportName,
    airportCode,
    gatewayPlaceId,
    howToArrive,
    inCity,
    note: `${howToArrive}. In town: ${inCity}.`,
  }
}

function pickArrivalCity(ids: PlaceId[]): PlaceId {
  const north = ids.filter((id) => MACRO_REGION[id] === 'north')
  const own = ids.filter((id) => getTopology(id)?.hasFlightAccess)
  const intl = own.filter((id) => INTL_GATEWAYS.has(id))
  if (intl.includes('hanoi') || north.includes('hanoi')) return 'hanoi'
  if (north.length) {
    // Northern stays use Hanoi as the hub even when the bag never sleeps there
    // (Sapa sleeper, Ha Long cruise shuttle). Do not fly into the south first.
    return northToSouth(north)[0] ?? ids[0]
  }
  const pool = intl.length ? intl : own
  if (pool.includes('da-nang') && !pool.includes('hcmc')) return 'da-nang'
  if (pool.length) return northToSouth(pool)[0] ?? pool[0]
  return [...ids].sort((a, b) => kmToGateway(a) - kmToGateway(b))[0] ?? ids[0]
}

/**
 * Land at a northern hub when the bag has the north, then visit the rest
 * north → south. Classic flow: Hanoi hub → Sapa / Ha Long spokes → fly south.
 * Never start on the coast and backtrack to Sapa.
 */
export function orderTripCities(placeIds: PlaceId[]): PlaceId[] {
  const unique = [...new Set(placeIds.filter(Boolean))]
  if (unique.length <= 1) return unique
  const start = pickArrivalCity(unique)
  const rest = northToSouth(unique.filter((id) => id !== start))
  if (!rest.every((id) => placeCoords(id)) || !placeCoords(start)) return [start, ...rest]
  return [start, ...shortestRoute(start, rest)]
}

/** Doubling back north costs a little extra so ties keep the classic north → south flow. */
const NORTHWARD_PENALTY = 0.3

/** Ninh Binh sits on the north–south railway; the other northern stays reach the rest of the country through Hanoi. */
function isNorthernSpoke(id: PlaceId): boolean {
  return MACRO_REGION[id] === 'north' && id !== 'hanoi' && id !== 'ninh-binh'
}

function straightKm(from: PlaceId, to: PlaceId): number {
  const a = placeCoords(from)
  const b = placeCoords(to)
  if (!a || !b) return 0
  return haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng })
}

function hopCost(from: PlaceId, to: PlaceId): number {
  const a = placeCoords(from)!
  const b = placeCoords(to)!
  const leavesNorth = MACRO_REGION[from] === 'north' ? MACRO_REGION[to] !== 'north' : MACRO_REGION[to] === 'north'
  const viaHanoi = leavesNorth && (isNorthernSpoke(from) || isNorthernSpoke(to))
  const km = viaHanoi ? straightKm(from, 'hanoi') + straightKm('hanoi', to) : straightKm(from, to)
  return km + Math.max(0, b.lat - a.lat) * 111 * NORTHWARD_PENALTY
}

function routeCost(start: PlaceId, path: PlaceId[]): number {
  let cost = 0
  let at = start
  for (const id of path) {
    cost += hopCost(at, id)
    at = id
  }
  return cost
}

/**
 * The least travel from the arrival city through every other stop, so the trip
 * never zig-zags (Da Nang → Hue → Hoi An) or skips past a city it returns to.
 */
function shortestRoute(start: PlaceId, rest: PlaceId[]): PlaceId[] {
  if (rest.length <= 7) {
    let best = rest
    let bestCost = routeCost(start, rest)
    const permute = (prefix: PlaceId[], left: PlaceId[]) => {
      if (!left.length) {
        const cost = routeCost(start, prefix)
        if (cost < bestCost - 1e-6) {
          best = prefix
          bestCost = cost
        }
        return
      }
      if (routeCost(start, prefix) >= bestCost) return
      for (let i = 0; i < left.length; i++) {
        permute([...prefix, left[i]], [...left.slice(0, i), ...left.slice(i + 1)])
      }
    }
    permute([], rest)
    return best
  }
  const path = [...rest]
  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < path.length - 1; i++) {
      for (let j = i + 1; j < path.length; j++) {
        const trial = [...path.slice(0, i), ...path.slice(i, j + 1).reverse(), ...path.slice(j + 1)]
        if (routeCost(start, trial) < routeCost(start, path) - 1e-6) {
          path.splice(0, path.length, ...trial)
          improved = true
        }
      }
    }
  }
  return path
}

export type HubSpokeTransferHint = {
  modeLabel: string
  reason: string
  icon: string
  preferMode?: 'train' | 'bus' | 'driver' | 'taxi'
}

/**
 * Default hop copy for the north-to-south spine: overnight sleeper to Sapa,
 * cruise shuttle to Ha Long, fly south from Hanoi, overland Nha Trang → Da Lat.
 */
export function hubSpokeTransferCopy(
  fromPlaceId: PlaceId,
  toPlaceId: PlaceId,
): HubSpokeTransferHint | null {
  if (fromPlaceId === 'hanoi' && toPlaceId === 'sapa') {
    return {
      modeLabel: 'Overnight train',
      icon: '🚆',
      preferMode: 'train',
      reason:
        'Sleeper to Lào Cai, then a van up to Sapa. Overnight transit saves a daytime travel day and a hotel night; Hanoi stays the northern hub.',
    }
  }
  if (fromPlaceId === 'sapa' && toPlaceId === 'hanoi') {
    return {
      modeLabel: 'Overnight train',
      icon: '🚆',
      preferMode: 'train',
      reason:
        'Sleeper back to Hanoi. The capital stays the northern hub for the Ha Long cruise shuttle or the flight south.',
    }
  }
  if (toPlaceId === 'ha-long' && (fromPlaceId === 'hanoi' || fromPlaceId === 'sapa')) {
    return {
      modeLabel: 'Cruise shuttle',
      icon: '🚐',
      preferMode: 'bus',
      reason:
        fromPlaceId === 'sapa'
          ? 'Drop back toward Hanoi, then the Ha Long overnight-cruise transfer from the northern hub — no extra capital hotel night.'
          : 'Overnight cruise shuttle from Hanoi. Keep the capital as the hub and fly south only after the bay.',
    }
  }
  if (fromPlaceId === 'ha-long' && MACRO_REGION[toPlaceId] && MACRO_REGION[toPlaceId] !== 'north') {
    return {
      modeLabel: 'Flight',
      icon: '✈️',
      reason:
        'Back to Nội Bài (HAN), then fly south. Linear north-to-south spine — no bouncing back to the north.',
    }
  }
  if (fromPlaceId === 'hanoi' && MACRO_REGION[toPlaceId] && MACRO_REGION[toPlaceId] !== 'north') {
    return {
      modeLabel: 'Flight',
      icon: '✈️',
      reason: `Fly south from Hanoi. Northern side trips are done; the rest of the trip stays one-way south.`,
    }
  }
  if (fromPlaceId === 'nha-trang' && toPlaceId === 'dalat') {
    return {
      modeLabel: 'Overland',
      icon: '🚐',
      preferMode: 'bus',
      reason: 'Direct 3–4 hour road link from the coast into the highlands — a cool-climate breaker, not a backtrack.',
    }
  }
  if (fromPlaceId === 'dalat' && toPlaceId === 'nha-trang') {
    return {
      modeLabel: 'Overland',
      icon: '🚐',
      preferMode: 'bus',
      reason: 'Direct 3–4 hour road link between Da Lat and the Nha Trang coast.',
    }
  }
  if (fromPlaceId === 'dalat' && toPlaceId === 'phu-quoc') {
    return {
      modeLabel: 'Flight',
      icon: '✈️',
      reason: 'Fly Da Lat to Phu Quoc for a beach-centric finale — energy curve ends on rest, not another trek.',
    }
  }
  if (fromPlaceId === 'phu-quoc' || toPlaceId === 'phu-quoc') {
    const other = fromPlaceId === 'phu-quoc' ? toPlaceId : fromPlaceId
    if (other === 'ha-tien') {
      return {
        modeLabel: 'Ferry',
        icon: '⛴️',
        reason:
          'Taxi or scooter only to Bãi Vòng, then the Hà Tiên catamaran (45–80 min). You cannot ride a scooter to the mainland.',
      }
    }
    return {
      modeLabel: 'Flight or ferry mix',
      icon: '✈️',
      reason:
        'Fly SGN–PQC, or bus/car to Hà Tiên then the fast ferry. Scooter is the last mile to the pier, never the sea.',
    }
  }
  if (fromPlaceId === 'con-dao' || toPlaceId === 'con-dao') {
    return {
      modeLabel: 'Flight or ferry mix',
      icon: '✈️',
      reason:
        'Fly SGN–VCS, or taxi to Vũng Tàu / Trần Đề then the high-speed ferry. A scooter cannot cross to Côn Đảo.',
    }
  }
  return null
}
