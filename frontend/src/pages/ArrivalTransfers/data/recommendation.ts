import type { ArrivalContext, TransportMode } from './types'

export function scoreMode(mode: TransportMode, ctx: ArrivalContext): number {
  const midCost = (mode.costUsd[0] + mode.costUsd[1]) / 2
  const midTime = (mode.timeMin[0] + mode.timeMin[1]) / 2
  const convenience =
    (mode.comfort + mode.reliability + mode.luggageStars) * 3 + (mode.lateNightOk ? 8 : 0)
  const access = ctx.hasAccessibilityNeed ? (mode.accessible ? 22 : -22) : 0
  const luggageBoost =
    ctx.luggageLevel === 'heavy'
      ? mode.luggageStars * 5
      : ctx.luggageLevel === 'medium'
        ? mode.luggageStars * 2
        : mode.luggageStars
  const paxBoost = ctx.passengers >= 4 && mode.groupFriendly ? 14 : ctx.passengers >= 3 ? 8 : 0
  const lateCtx = ctx.lateArrival || ctx.arrivalTime === 'late'
  const late = mode.lateNightOk ? 14 : -10
  const outbound = ctx.direction === 'outbound' ? mode.reliability * 4 : 0
  const budget = ctx.budgetPriority ? (midCost < 12 ? 20 : midCost < 20 ? 8 : -12) : 0

  return (
    convenience +
    luggageBoost +
    paxBoost +
    access +
    outbound +
    budget +
    (lateCtx ? late : 6) -
    midCost * 0.55 -
    midTime * 0.12
  )
}

export function sortModes(modes: TransportMode[], ctx: ArrivalContext): TransportMode[] {
  return [...modes].sort((a, b) => scoreMode(b, ctx) - scoreMode(a, ctx))
}

export function pickOurMode(modes: TransportMode[], ctx: ArrivalContext): TransportMode | null {
  if (!modes.length) return null
  return sortModes(modes, ctx)[0] ?? null
}

export function ourPickReasons(
  mode: TransportMode,
  ctx: ArrivalContext,
  tripHint?: string | null,
): string[] {
  const list: string[] = []
  const dest = ctx.routeDestinationLabel
  const code = ctx.routeAirportCode

  if (tripHint) list.push(tripHint)

  if (dest && mode.id === 'private-transfer') {
    list.push(
      ctx.direction === 'outbound'
        ? `Direct pickup toward ${code ?? 'the airport'} without shared stops`
        : `Avoids a final connection into ${dest} and stays available later in the day`,
    )
  } else if (dest && mode.id === 'car-taxi') {
    list.push(
      ctx.direction === 'outbound'
        ? `Flexible city pickup for the run back to ${code ?? 'the airport'}`
        : `Straightforward door-to-door run into ${dest}`,
    )
  } else if (dest && mode.id === 'public-bus') {
    list.push(`Works the main corridor toward ${dest} at a low fare`)
  }

  if (ctx.arrivalTime !== 'not-set') list.push('Available for your selected timing')
  if (mode.luggageStars >= 4) list.push('Strong luggage handling')
  if (!list.some((r) => r.toLowerCase().includes('direct'))) {
    list.push('Direct or low-friction journey')
  }
  if (mode.reliability >= 4) list.push('Predictable travel time')
  if (mode.lateNightOk && (ctx.lateArrival || ctx.arrivalTime === 'late')) {
    list.push('Reliable late coverage')
  }
  if (ctx.budgetPriority && (mode.costUsd[0] + mode.costUsd[1]) / 2 < 12) {
    list.push('Strong value for this profile')
  }
  return [...new Set(list)].slice(0, 5)
}
