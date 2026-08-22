import type { ModeEvaluation, PlaceId, TransportMode, TravelProfile } from './types'
import { getRoute } from './routes'

export function pickRecommended(evals: ModeEvaluation[]): ModeEvaluation | null {
  const available = evals.filter((e) => e.availability.status !== 'unavailable')
  if (!available.length) return evals[0] ?? null
  return [...available].sort((a, b) => b.score - a.score)[0] ?? null
}

export function recommendationReasons(
  mode: TransportMode,
  profile: TravelProfile,
  originId: PlaceId | null,
  destinationId: PlaceId | null,
): string[] {
  const route = getRoute(originId, destinationId)
  const reasons: string[] = []

  if (mode.id === 'flight') {
    reasons.push(
      'Air time is short, but plan ~4h door-to-door once airport process and transfers are included.',
    )
  } else if (mode.id === 'train') {
    reasons.push(
      'Station-to-station travel keeps friction lower than airports — especially useful overnight.',
    )
  } else if (mode.id === 'coach') {
    reasons.push('Usually the strongest pure value on long trunk and secondary corridors.')
  } else if (mode.id === 'private-driver') {
    reasons.push('Best when flexibility, stops or group logistics matter more than fare.')
  } else if (mode.id === 'shared-transfer') {
    reasons.push('Practical on short–medium tourist corridors without paying for a private car.')
  } else if (mode.id === 'car-taxi') {
    reasons.push('Direct urban hops — traffic is the real variable, not the vehicle speed.')
  } else if (mode.id === 'ferry' || mode.id === 'fast-boat') {
    reasons.push('The realistic mainland ↔ island link when flying is unnecessary or unavailable.')
  } else if (mode.waterKind === 'experience') {
    reasons.push('Treat this as an experience product, not a pure transport substitute.')
  } else {
    reasons.push('Strong fit for how this kind of journey usually works in Vietnam.')
  }

  if (profile.luggage === 'heavy' && ['private-driver', 'train', 'car-taxi'].includes(mode.id)) {
    reasons.push('Handles heavier luggage more comfortably than scooters or packed fast boats.')
  }
  if (profile.budget && (mode.costUsd[0] + mode.costUsd[1]) / 2 < 30) {
    reasons.push('Keeps typical spend lower for this profile.')
  }
  if (route?.dayTrip) {
    reasons.push('For day-trip distances, prioritise usable time at the destination over headline speed.')
  }

  return reasons.slice(0, 4)
}

export function sectionPicks(evals: ModeEvaluation[]) {
  const available = evals.filter((e) => e.availability.status !== 'unavailable')
  const byDoor = [...available].sort(
    (a, b) =>
      a.mode.doorToDoorMinutes[0] +
      a.mode.doorToDoorMinutes[1] -
      (b.mode.doorToDoorMinutes[0] + b.mode.doorToDoorMinutes[1]),
  )
  const byCost = [...available].sort(
    (a, b) => a.mode.costUsd[0] + a.mode.costUsd[1] - (b.mode.costUsd[0] + b.mode.costUsd[1]),
  )
  const scenic = available.find((e) => e.mode.id === 'train' || e.mode.id === 'cruise')
  const flexible = available.find(
    (e) => e.mode.id === 'private-driver' || e.mode.id === 'urban-driver',
  )

  return {
    speed: byDoor[0]?.mode ?? null,
    value: byCost[0]?.mode ?? null,
    scenic: scenic?.mode ?? null,
    flexible: flexible?.mode ?? null,
  }
}
