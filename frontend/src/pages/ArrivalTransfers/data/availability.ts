import type {
  ArrivalContext,
  ArrivalRoute,
  AvailabilityResult,
  AvailabilityStatus,
  TransportMode,
  TransportModeId,
} from './types'

const TIME_HOUR: Record<ArrivalContext['arrivalTime'], number | null> = {
  'not-set': null,
  morning: 9,
  afternoon: 15,
  evening: 19,
  late: 23,
}

const SCHEDULE: Record<TransportModeId, { open: number; close: number; allDay: boolean }> = {
  'car-taxi': { open: 0, close: 24, allDay: true },
  'private-transfer': { open: 0, close: 24, allDay: true },
  'public-bus': { open: 6, close: 22, allDay: false },
  'shared-transfer': { open: 6, close: 22, allDay: false },
  'rental-driver': { open: 7, close: 21, allDay: false },
}

function label(status: AvailabilityStatus) {
  if (status === 'available') return 'Available'
  if (status === 'limited') return 'Limited'
  if (status === 'unavailable') return 'Unavailable'
  return 'Unknown'
}

export function evaluateAvailability(
  mode: TransportMode,
  ctx: ArrivalContext,
  route: ArrivalRoute | null,
): AvailabilityResult {
  if (route && !route.modeIds.includes(mode.id)) {
    return {
      status: 'unavailable',
      label: label('unavailable'),
      note: `${mode.label} is not available for this airport → destination.`,
      confidence: 'typical',
    }
  }

  const schedule = SCHEDULE[mode.id]
  const hour = TIME_HOUR[ctx.arrivalTime]

  if (hour === null) {
    return {
      status: 'available',
      label: label('available'),
      note: schedule.allDay
        ? 'Typically available around the clock for this mode.'
        : `Typical window ${pad(schedule.open)}:00–${pad(schedule.close)}:00 (estimated).`,
      confidence: 'typical',
    }
  }

  if (schedule.allDay) {
    return {
      status: 'available',
      label: label('available'),
      note: 'Available for your selected timing (typical / estimated).',
      confidence: 'estimated',
    }
  }

  if (hour < schedule.open || hour >= schedule.close) {
    return {
      status: 'unavailable',
      label: label('unavailable'),
      note: `Not operating for your selected time. Typical final services end around ${pad(schedule.close)}:00.`,
      confidence: 'estimated',
    }
  }

  if (hour >= schedule.close - 2) {
    return {
      status: 'limited',
      label: label('limited'),
      note: 'Only a few services may remain near the end of the operating window.',
      confidence: 'estimated',
    }
  }

  if (mode.id === 'rental-driver' && (hour < 8 || hour >= 19)) {
    return {
      status: 'limited',
      label: label('limited'),
      note: 'Rental desk hours may be limited — confirm before late or early departures.',
      confidence: 'estimated',
    }
  }

  return {
    status: 'available',
    label: label('available'),
    note: 'Available for your selected route/time (estimated).',
    confidence: 'estimated',
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function suitabilityScore(mode: TransportMode, ctx: ArrivalContext): number {
  let score = 55
  score += mode.comfort * 4 + mode.reliability * 4 + mode.luggageStars * 3

  if (ctx.luggageLevel === 'heavy') score += mode.luggageStars >= 4 ? 14 : -20
  if (ctx.luggageLevel === 'light' && mode.id === 'public-bus') score += 12
  if (ctx.passengers >= 4) score += mode.groupFriendly ? 14 : -12
  if (ctx.passengers <= 2 && (mode.id === 'car-taxi' || mode.id === 'public-bus')) score += 10
  if (ctx.hasAccessibilityNeed) score += mode.accessible ? 22 : -28
  if (ctx.lateArrival || ctx.arrivalTime === 'late') score += mode.lateNightOk ? 18 : -24
  if (ctx.budgetPriority) {
    const mid = (mode.costUsd[0] + mode.costUsd[1]) / 2
    score += mid < 12 ? 20 : mid < 20 ? 6 : -12
  }
  if (ctx.direction === 'outbound') score += mode.reliability * 2
  return Math.max(5, Math.min(98, Math.round(score)))
}

export function alternativeModes(
  unavailableId: TransportModeId,
  available: TransportMode[],
): TransportModeId[] {
  const preferred: TransportModeId[] = [
    'private-transfer',
    'car-taxi',
    'shared-transfer',
    'public-bus',
  ]
  return preferred
    .filter((id) => id !== unavailableId && available.some((m) => m.id === id))
    .slice(0, 3)
}
