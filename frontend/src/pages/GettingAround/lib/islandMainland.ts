import { PLACES } from '../data/places'
import { getMode } from '../data/modes'
import { getTopology } from '../data/transportNetwork'
import { plainConnectionExplain, resolveIntercityRoute } from '../data/routeIntelligence'
import type { Place, PlaceId } from '../data/types'
import { haversineKm } from '../maps/project'
import type { UrbanModeOption, UrbanRecommendation, UrbanSelection } from '../data/urbanIntelligence'

export function nearestPlaceTo(lat: number, lng: number): Place | null {
  let best: Place | null = null
  let bestKm = Infinity
  for (const place of PLACES) {
    const km = haversineKm({ lat, lng }, { lat: place.lat, lng: place.lng })
    if (km < bestKm) {
      best = place
      bestKm = km
    }
  }
  return best
}

function isIslandPlace(place: Place) {
  return place.kind === 'island' || Boolean(getTopology(place.id)?.isIsland)
}

export function detectUrbanSeaHop(origin: UrbanSelection, destination: UrbanSelection) {
  const km = haversineKm(origin, destination)
  const fromPlace = nearestPlaceTo(origin.lat, origin.lng)
  const toPlace = nearestPlaceTo(destination.lat, destination.lng)
  if (!fromPlace || !toPlace) return null

  const fromIsland = isIslandPlace(fromPlace)
  const toIsland = isIslandPlace(toPlace)
  const differentPlaces = fromPlace.id !== toPlace.id
  const seaCrossing = fromIsland !== toIsland || (fromIsland && toIsland && differentPlaces)
  const farSearch = km > 80

  if (seaCrossing && km >= 18) {
    return { fromPlace, toPlace, km, reason: 'island-mainland' as const }
  }
  if (farSearch && differentPlaces) {
    return { fromPlace, toPlace, km, reason: 'too-far-for-urban' as const }
  }
  return null
}

function markImpractical(option: UrbanModeOption, why: string): UrbanModeOption {
  if (option.modeId === 'ferry' || option.modeId === 'flight' || option.modeId === 'fast-boat') {
    return option
  }
  return {
    ...option,
    practical: false,
    suitability: 'not-ideal',
    why,
    trafficNote: 'Not a sea crossing',
  }
}

export function overlaySeaHopOnUrbanOptions(
  origin: UrbanSelection,
  destination: UrbanSelection,
  options: UrbanModeOption[],
): { options: UrbanModeOption[]; insight: string; recommendations: UrbanRecommendation[] } | null {
  const hop = detectUrbanSeaHop(origin, destination)
  if (!hop) return null

  const intel = resolveIntercityRoute(hop.fromPlace.id as PlaceId, hop.toPlace.id as PlaceId)
  const seaOptions: UrbanModeOption[] = []

  for (const journey of intel?.journeys ?? []) {
    if (
      journey.status !== 'direct' &&
      journey.status !== 'one-connection' &&
      journey.status !== 'multi-leg'
    ) {
      continue
    }
    if (!['flight', 'ferry', 'fast-boat'].includes(journey.modeId)) continue
    const mode = journey.mode ?? getMode(journey.modeId)
    if (!mode) continue
    const steps = plainConnectionExplain(journey)
    const mixNote =
      journey.modeId === 'ferry' || journey.modeId === 'fast-boat'
        ? ` Taxi or scooter only as far as the pier — never across the water.`
        : ''
    seaOptions.push({
      id: `sea-${journey.id}`,
      modeId: journey.modeId,
      mode,
      status: 'typical',
      typicalDurationLabel: journey.displayTitle.includes('+')
        ? `${journey.displayTitle} · ${journey.typicalDurationLabel}`
        : journey.typicalDurationLabel,
      typicalCostLabel: journey.typicalCostLabel,
      typicalMinutes: journey.typicalMinutes ?? [60, 240],
      typicalCostUsd: journey.typicalCostUsd,
      trafficNote: journey.pathLabel,
      why: `${steps ? `${journey.why} ${steps}` : journey.why}${mixNote}`,
      practical: true,
      complexity: journey.complexity,
      scrollTargetId: journey.scrollTargetId,
      score: journey.modeId === 'flight' ? 96 : 82,
      suitability: 'recommended',
      experienceValue: 0.4,
      confidence: 'curated',
    })
  }

  if (!seaOptions.length) {
    const ferry = getMode('ferry')
    if (ferry) {
      seaOptions.push({
        id: 'sea-ferry-fallback',
        modeId: 'ferry',
        mode: ferry,
        status: 'typical',
        typicalDurationLabel: 'Port taxi + ferry',
        typicalCostLabel: '$$',
        typicalMinutes: [60, 240],
        typicalCostUsd: [10, 50],
        trafficNote: `${hop.fromPlace.label} ↔ ${hop.toPlace.label}`,
        why: `This is a water crossing, not an in-city ride. Taxi or scooter only as far as the ferry port, then the boat. You cannot ride a scooter from ${hop.fromPlace.label} to ${hop.toPlace.label}.`,
        practical: true,
        complexity: 3,
        scrollTargetId: 'mode-water-ferry',
        score: 80,
        suitability: 'recommended',
        confidence: 'curated',
      })
    }
  }

  const blockedWhy = `You cannot scooter, cycle, or walk this ${hop.km.toFixed(0)} km water crossing. Use a flight when it exists, or taxi/scooter only to the pier then a ferry.`
  const rest = options.map((o) => markImpractical(o, blockedWhy))
  const merged = [...seaOptions, ...rest]
  const insight =
    hop.reason === 'island-mainland'
      ? `${hop.fromPlace.label} and ${hop.toPlace.label} are separated by water. Best realistic move: ${seaOptions[0]?.mode.shortLabel ?? 'ferry or flight'} — scooter is only the last mile to the port, never the sea itself.`
      : `This pin sits ~${hop.km.toFixed(0)} km away — that is an inter-city hop, not an urban scooter ride.`

  const recommendations: UrbanRecommendation[] = seaOptions.map((o, i) => ({
    id: `sea-rec-${o.id}`,
    label: i === 0 ? 'Best realistic' : o.modeId === 'flight' ? 'Fastest' : 'Sea mix',
    symbol: o.mode.symbol,
    optionId: o.id,
    note: o.why,
  }))

  return { options: merged, insight, recommendations }
}
