import type { ArrivalContext, TransferBudget, TransportMode, TransportModeId } from './types'

function budgetOf(ctx: ArrivalContext): TransferBudget {
  if (ctx.budget) return ctx.budget
  return ctx.budgetPriority ? 'saver' : 'typical'
}

function modeBias(id: TransportModeId, budget: TransferBudget, ctx: ArrivalContext): number {
  const heavy = ctx.luggageLevel === 'heavy'
  const late = ctx.lateArrival || ctx.arrivalTime === 'late'
  const group = ctx.passengers >= 4

  if (budget === 'saver') {
    const busPenalty = (late ? 48 : 0) + (heavy ? 34 : 0) + (ctx.hasAccessibilityNeed ? 40 : 0)
    switch (id) {
      case 'public-bus':
        return 46 - busPenalty
      case 'car-taxi':
        return 12 + (late || heavy ? 28 : 0)
      case 'rental-driver':
        return -26
      default:
        return -20
    }
  }

  if (budget === 'comfort') {
    switch (id) {
      case 'car-taxi':
        return 44
      case 'rental-driver':
        return group ? 24 : 10
      case 'public-bus':
        return -30
      default:
        return 0
    }
  }

  switch (id) {
    case 'car-taxi':
      return group || heavy || late || ctx.hasAccessibilityNeed ? 30 : 22
    case 'public-bus':
      return late || heavy ? -12 : 6
    case 'rental-driver':
      return group ? 8 : -10
    default:
      return 0
  }
}

export function scoreMode(mode: TransportMode, ctx: ArrivalContext): number {
  const budget = budgetOf(ctx)
  const midCost = (mode.costUsd[0] + mode.costUsd[1]) / 2
  const midTime = (mode.timeMin[0] + mode.timeMin[1]) / 2
  const access = ctx.hasAccessibilityNeed ? (mode.accessible ? 22 : -22) : 0
  const luggageBoost =
    ctx.luggageLevel === 'heavy'
      ? mode.luggageStars * 5
      : ctx.luggageLevel === 'medium'
        ? mode.luggageStars * 2
        : mode.luggageStars
  const paxBoost = ctx.passengers >= 4 && mode.groupFriendly ? 12 : ctx.passengers >= 3 ? 6 : 0
  const lateCtx = ctx.lateArrival || ctx.arrivalTime === 'late'
  const late = mode.lateNightOk ? 14 : -12
  const outbound = ctx.direction === 'outbound' ? mode.reliability * 3 : 0
  const costWeight = budget === 'saver' ? 1.45 : budget === 'comfort' ? 0.18 : 0.45
  const timeWeight = budget === 'comfort' ? 0.22 : 0.1

  return (
    mode.reliability * 3 +
    mode.comfort * 2 +
    luggageBoost +
    paxBoost +
    access +
    outbound +
    modeBias(mode.id, budget, ctx) +
    (lateCtx ? late : 4) -
    midCost * costWeight -
    midTime * timeWeight
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
  const budget = budgetOf(ctx)

  if (tripHint) list.push(tripHint)

  if (budget === 'saver') list.push('Keeps the fare down for this trip')
  if (budget === 'comfort') list.push('Favours a door-to-door ride over saving a few dollars')

  if (dest && mode.id === 'car-taxi') {
    list.push(
      ctx.direction === 'outbound'
        ? `Metered taxi or a pre-booked car toward ${code ?? 'the airport'}`
        : `Official taxi rank or a prepaid car with a name board into ${dest}`,
    )
  } else if (dest && mode.id === 'ride-hailing') {
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
  return [...new Set(list)].slice(0, 5)
}
