import type { PlaceId, RouteSeed, WaterModeId, UrbanModeId } from './types'
import { getPlace } from './places'
import {
  DEFAULT_URBAN,
  getMode,
  URBAN_MODES,
  WATER_MODES,
} from './modes'
import type { TransportMode } from './types'
import { resolveIntercityRoute } from './routeIntelligence'

export const ROUTE_SEEDS: RouteSeed[] = [
  {
    id: 'hanoi-danang',
    originId: 'hanoi',
    destinationId: 'da-nang',
    distanceKm: 760,
    typicalHours: [1.5, 17],
    typicalCostUsd: [20, 160],
    longModeIds: ['flight', 'train', 'coach', 'private-driver'],
    urbanFocus: 'da-nang',
    insights: [
      'Flight wins on air time; door-to-door often lands around 4h+.',
      'Overnight train can replace a hotel night on the spine.',
    ],
  },
  {
    id: 'hanoi-hcmc',
    originId: 'hanoi',
    destinationId: 'hcmc',
    distanceKm: 1700,
    typicalHours: [2, 36],
    typicalCostUsd: [30, 220],
    longModeIds: ['flight', 'train', 'coach', 'private-driver'],
    urbanFocus: 'hcmc',
    insights: [
      'Flight is the practical default for most travellers.',
      'Train is a multi-night journey — more experience than efficient hop.',
    ],
  },
  {
    id: 'hanoi-ninhbinh',
    originId: 'hanoi',
    destinationId: 'ninh-binh',
    distanceKm: 95,
    typicalHours: [1.5, 3],
    typicalCostUsd: [5, 80],
    longModeIds: ['train', 'coach', 'shared-transfer', 'private-driver'],
    urbanFocus: 'ninh-binh',
    waterModeIds: ['river-boat', 'sightseeing-boat'],
    dayTrip: true,
    insights: [
      'A classic day-trip distance — compare usable time on the ground, not only vehicle speed.',
      'Flights are not a practical option for this corridor.',
    ],
  },
  {
    id: 'danang-hoian',
    originId: 'da-nang',
    destinationId: 'hoi-an',
    distanceKm: 30,
    typicalHours: [0.5, 1.2],
    typicalCostUsd: [3, 45],
    longModeIds: ['shared-transfer', 'private-driver', 'coach'],
    urbanFocus: 'hoi-an',
    waterModeIds: ['sightseeing-boat', 'river-boat'],
    dayTrip: true,
    insights: ['Short hop — private or shared transfer usually beats complex long-distance modes.'],
  },
  {
    id: 'hcmc-phuquoc',
    originId: 'hcmc',
    destinationId: 'phu-quoc',
    distanceKm: 300,
    typicalHours: [1, 8],
    typicalCostUsd: [25, 120],
    longModeIds: ['flight', 'private-driver'],
    urbanFocus: 'phu-quoc',
    waterModeIds: ['ferry', 'fast-boat'],
    insights: [
      'Flight is common from HCMC; ferry/fast boat usually pair with Ha Tien or other ports.',
    ],
  },
  {
    id: 'phuquoc-hatien',
    originId: 'phu-quoc',
    destinationId: 'ha-tien',
    distanceKm: 45,
    typicalHours: [1, 3],
    typicalCostUsd: [10, 45],
    longModeIds: ['shared-transfer', 'private-driver'],
    urbanFocus: 'ha-tien',
    waterModeIds: ['ferry', 'fast-boat'],
    insights: ['Water transport is the core of this crossing — schedules and sea conditions matter.'],
  },
  {
    id: 'hanoi-halong',
    originId: 'hanoi',
    destinationId: 'ha-long',
    distanceKm: 160,
    typicalHours: [2, 4],
    typicalCostUsd: [10, 200],
    longModeIds: ['shared-transfer', 'private-driver', 'coach'],
    urbanFocus: 'ha-long',
    waterModeIds: ['cruise', 'sightseeing-boat'],
    dayTrip: true,
    insights: [
      'Many travellers combine road transfer with a bay cruise experience — not a pure ferry hop.',
    ],
  },
  {
    id: 'danang-hcmc',
    originId: 'da-nang',
    destinationId: 'hcmc',
    distanceKm: 960,
    typicalHours: [1.5, 20],
    typicalCostUsd: [25, 180],
    longModeIds: ['flight', 'train', 'coach', 'private-driver'],
    urbanFocus: 'hcmc',
    insights: ['Flight dominates for most itineraries; train remains scenic but long.'],
  },
  {
    id: 'hcmc-dalat',
    originId: 'hcmc',
    destinationId: 'dalat',
    distanceKm: 300,
    typicalHours: [0.9, 7],
    typicalCostUsd: [15, 120],
    longModeIds: ['flight', 'coach', 'private-driver', 'shared-transfer'],
    urbanFocus: 'dalat',
    insights: ['Coach and shared vans dominate; flight is useful when time is scarce.'],
  },
]

export function getRoute(originId: PlaceId | null, destinationId: PlaceId | null) {
  if (!originId || !destinationId) return null
  return (
    ROUTE_SEEDS.find(
      (r) =>
        (r.originId === originId && r.destinationId === destinationId) ||
        (r.originId === destinationId && r.destinationId === originId),
    ) ?? null
  )
}

export function routeDirectionMatches(
  route: RouteSeed,
  originId: PlaceId,
  destinationId: PlaceId,
) {
  return route.originId === originId && route.destinationId === destinationId
}

function localizeJourney(
  mode: TransportMode,
  originLabel: string,
  destLabel: string,
): TransportMode {
  const mapLabel = (label: string) => {
    if (label === 'City' || label === 'Origin' || label === 'Hotel / start' || label === 'Pickup area')
      return originLabel
    if (
      label === 'Destination' ||
      label === 'Arrival station' ||
      label === 'Drop area' ||
      label === 'Stops / return' ||
      label === 'Island port' ||
      label === 'Arrival port' ||
      label === 'Next pier' ||
      label === 'Return pier'
    )
      return destLabel
    if (label === 'Mainland port' || label === 'Port' || label === 'Pier' || label === 'River pier')
      return `${originLabel} port`
    if (label === 'Station') return `${originLabel} station`
    if (label === 'City / transfer') return originLabel
    if (label === 'Disembark') return destLabel
    return label
  }
  return {
    ...mode,
    journey: mode.journey.map((s) => ({ ...s, label: mapLabel(s.label) })),
  }
}

export function longModesForContext(
  originId: PlaceId | null,
  destinationId: PlaceId | null,
): TransportMode[] {
  return longModeIndexForPair(originId, destinationId)
    .filter(
      (row) =>
        row.availability === 'available' ||
        row.availability === 'limited' ||
        row.availability === 'requires-connection',
    )
    .map((row) => row.mode)
}

export type ModeAvailability =
  | 'available'
  | 'limited'
  | 'not-available'
  | 'requires-connection'
  | 'unknown'

export type LongModeIndexRow = {
  mode: TransportMode
  availability: ModeAvailability
  reason: string
  note?: string
}

/**
 * Route-aware mode index — delegates to the transport-network intelligence layer.
 */
export function longModeIndexForPair(
  originId: PlaceId | null,
  destinationId: PlaceId | null,
): LongModeIndexRow[] {
  const result = resolveIntercityRoute(originId, destinationId)
  if (!result) return []

  return result.journeys
    .filter((j) =>
      ['flight', 'train', 'coach', 'private-driver', 'shared-transfer'].includes(j.modeId),
    )
    .map((j) => {
      let availability: ModeAvailability = 'available'
      if (j.status === 'one-connection' || j.status === 'multi-leg') availability = 'requires-connection'
      if (j.status === 'not-available') availability = 'not-available'
      if (j.status === 'not-applicable') availability = 'not-available'
      if (j.status === 'unknown') availability = 'unknown'
      if (j.verificationStatus === 'estimated' && availability === 'available') availability = 'limited'

      return {
        mode: j.mode,
        availability,
        reason: j.direct ? 'Direct' : j.status === 'one-connection' ? '1 connection' : j.summary,
        note: j.why,
      }
    })
}

export function urbanModesForContext(focusId: PlaceId | null): {
  modes: TransportMode[]
  cityLabel: string
  impractical: UrbanModeId[]
} {
  const place = getPlace(focusId)
  const cityLabel = place?.label ?? 'Vietnam cities'
  const impractical: UrbanModeId[] = []

  let ids: UrbanModeId[] = [...DEFAULT_URBAN]
  if (place) {
    if (place.kind === 'island') {
      ids = ['car-taxi', 'scooter', 'walking', 'bicycle', 'urban-driver']
      impractical.push('public-transit')
    } else if (place.id === 'hoi-an' || place.id === 'ninh-binh') {
      ids = ['car-taxi', 'walking', 'bicycle', 'scooter', 'urban-driver', 'public-transit']
    } else if (place.id === 'hanoi' || place.id === 'hcmc' || place.id === 'da-nang') {
      ids = ['car-taxi', 'public-transit', 'scooter', 'walking', 'urban-driver', 'bicycle']
    }
  }

  const modes = URBAN_MODES.filter((m) => ids.includes(m.id as UrbanModeId)).map((m) =>
    place ? localizeJourney(m, place.label, 'Your stop') : m,
  )
  return { modes, cityLabel, impractical }
}

export function waterModesForContext(
  originId: PlaceId | null,
  destinationId: PlaceId | null,
): { modes: TransportMode[]; relevant: boolean; note: string } {
  const origin = getPlace(originId)
  const dest = getPlace(destinationId)
  const route = getRoute(originId, destinationId)

  if (!origin && !dest) {
    return {
      modes: WATER_MODES,
      relevant: true,
      note: 'Explore Vietnam’s ferries, boats and cruises — relevance sharpens once you pick a coastal or island context.',
    }
  }

  const waterPlace = [origin, dest].filter(Boolean).find((p) => p?.waterRelevant)
  if (!waterPlace && !route?.waterModeIds?.length) {
    return {
      modes: WATER_MODES.slice(0, 2),
      relevant: false,
      note: 'Not a practical transport option for this inland route — keep water travel for islands, bays and delta contexts.',
    }
  }

  let ids: WaterModeId[] = route?.waterModeIds ?? []
  if (!ids.length && waterPlace) {
    if (waterPlace.waterThemes.includes('ferry')) ids.push('ferry', 'fast-boat')
    if (waterPlace.waterThemes.includes('cruise')) ids.push('cruise', 'sightseeing-boat')
    if (waterPlace.waterThemes.includes('river') || waterPlace.waterThemes.includes('delta'))
      ids.push('river-boat', 'sightseeing-boat')
    if (waterPlace.waterThemes.includes('sightseeing')) ids.push('sightseeing-boat')
    if (waterPlace.waterThemes.includes('island') && !ids.includes('ferry'))
      ids.push('ferry', 'fast-boat')
  }
  if (!ids.length) ids = ['ferry', 'fast-boat', 'sightseeing-boat']

  const uniq = [...new Set(ids)]
  let modes = WATER_MODES.filter((m) => uniq.includes(m.id as WaterModeId))
  if (origin && dest) {
    modes = modes.map((m) => localizeJourney(m, origin.label, dest.label))
  }
  return {
    modes,
    relevant: true,
    note: 'Sea and river conditions can affect schedules — treat water timing as weather-aware.',
  }
}

export function getModeById(id: string) {
  return getMode(id as never)
}
