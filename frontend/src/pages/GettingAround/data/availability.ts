import type {
  AvailabilityResult,
  ModeEvaluation,
  TimeBucket,
  TransportMode,
  TravelProfile,
} from './types'

export function evaluateAvailability(
  mode: TransportMode,
  time: TimeBucket,
): AvailabilityResult {
  if (time === 'late') {
    if (mode.world === 'water' && mode.id !== 'cruise') {
      return {
        status: 'unavailable',
        label: 'Not available late',
        note: 'Most ferry and boat services are daytime. Late crossings are uncommon.',
        confidence: 'typical',
      }
    }
    if (mode.id === 'public-transit' || mode.id === 'bicycle') {
      return {
        status: 'limited',
        label: 'Limited late',
        note: 'Coverage thins after evening — car/taxi is usually more reliable late.',
        confidence: 'typical',
      }
    }
    if (mode.id === 'flight' && time === 'late') {
      return {
        status: 'limited',
        label: 'Limited late departures',
        note: 'Domestic late flights exist on some trunks but are thinner than daytime.',
        confidence: 'typical',
      }
    }
  }
  if (mode.weatherSensitive) {
    return {
      status: 'available',
      label: 'Available · weather-aware',
      note: 'Sea or river conditions can delay or cancel sailings — keep a buffer.',
      confidence: 'typical',
    }
  }
  return {
    status: 'available',
    label: 'Typically available',
    note: 'Typical / estimated prototype data — not live inventory.',
    confidence: 'typical',
  }
}

export function suitabilityScore(mode: TransportMode, profile: TravelProfile): number {
  let score = 55
  if (profile.budget) {
    const mid = (mode.costUsd[0] + mode.costUsd[1]) / 2
    score += mid < 25 ? 18 : mid < 80 ? 6 : -12
  }
  if (profile.luggage === 'heavy') {
    if (['flight', 'train', 'private-driver', 'urban-driver', 'car-taxi'].includes(mode.id))
      score += 12
    if (['scooter', 'walking', 'bicycle', 'fast-boat'].includes(mode.id)) score -= 18
  }
  if (profile.accessibility) {
    if (['private-driver', 'urban-driver', 'car-taxi', 'flight'].includes(mode.id)) score += 16
    if (['scooter', 'bicycle', 'walking', 'public-transit'].includes(mode.id)) score -= 20
  }
  if (profile.passengers >= 4) {
    if (['private-driver', 'urban-driver', 'car-taxi', 'coach'].includes(mode.id)) score += 10
    if (['scooter', 'bicycle'].includes(mode.id)) score -= 15
  }
  return Math.max(5, Math.min(98, score))
}

export function scoreMode(
  mode: TransportMode,
  profile: TravelProfile,
  relevance: number,
): number {
  const suit = suitabilityScore(mode, profile)
  const midDoor = (mode.doorToDoorMinutes[0] + mode.doorToDoorMinutes[1]) / 2
  const midCost = (mode.costUsd[0] + mode.costUsd[1]) / 2
  return relevance * 20 + suit * 0.7 - midDoor * 0.01 - midCost * 0.08
}

export function evaluateModes(
  modes: TransportMode[],
  profile: TravelProfile,
  time: TimeBucket,
  relevanceById: Record<string, number>,
): ModeEvaluation[] {
  const evals: ModeEvaluation[] = modes.map((mode) => {
    const availability = evaluateAvailability(mode, time)
    const suitability = suitabilityScore(mode, profile)
    const relevance = relevanceById[mode.id] ?? 50
    return {
      mode,
      availability,
      suitability,
      relevance,
      score: scoreMode(mode, profile, relevance),
      alternatives: [],
    }
  })

  const available = evals.filter((e) => e.availability.status !== 'unavailable')
  return evals
    .map((ev) => ({
      ...ev,
      alternatives: available
        .filter((a) => a.mode.id !== ev.mode.id)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((a) => a.mode.id),
    }))
    .sort((a, b) => b.score - a.score)
}

export function defaultRelevance(modeIds: string[]): Record<string, number> {
  const map: Record<string, number> = {}
  modeIds.forEach((id, i) => {
    map[id] = 90 - i * 8
  })
  return map
}
