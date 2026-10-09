import { findLeg } from '../../data/transport'
import type { TransportLeg, TransportMode, TransportOption } from '../../types'
import type { PlaceId } from '../../../GettingAround/data/types'
import { placeCoords, placeLegRegion } from './cityPins'
import { hubSpokeTransferCopy } from './cityPlanning'
import { haversineKm } from './sightOrder'

/** Road distance above which flying beats a day on the road. */
const FLY_ABOVE_ROAD_KM = 420
/** Listed ground options longer than this lose to a flight unless they run overnight. */
const FLY_ABOVE_GROUND_MIN = 8 * 60
const ROAD_FACTOR = 1.3

export type CityHopPlan = {
  modeLabel: string
  icon: string
  /** Door to door, including getting to and through the airport for flights. */
  durationMinutes: number
  costUsd: number
  reason: string
  /** Traveller picked this mode in Getting Around. */
  chosen: boolean
  /** Hours of the travel day the move eats — an overnight sleeper barely touches it. */
  daytimeHours: number
}

function overnight(option: Pick<TransportOption, 'status' | 'mode'> | undefined, label = ''): boolean {
  return /overnight/i.test(`${option?.status ?? ''} ${label}`)
}

function roadKm(from: PlaceId, to: PlaceId): number {
  const a = placeCoords(from)
  const b = placeCoords(to)
  if (!a || !b) return 0
  return haversineKm(a, b) * ROAD_FACTOR
}

function roundQuarter(minutes: number): number {
  return Math.max(15, Math.round(minutes / 15) * 15)
}

function flightPlan(km: number, reason: string): Omit<CityHopPlan, 'chosen'> {
  // ~1h in the air for most domestic hops, plus transfers and check-in either side.
  const air = Math.max(60, (km / ROAD_FACTOR / 650) * 60)
  const minutes = roundQuarter(air + 150)
  return {
    modeLabel: 'Flight',
    icon: '✈️',
    durationMinutes: minutes,
    costUsd: 65,
    reason,
    daytimeHours: minutes / 60,
  }
}

function roadPlan(km: number, tight: boolean, reason: string): Omit<CityHopPlan, 'chosen'> {
  const minutes = roundQuarter((km / 45) * 60)
  const short = km < 60
  return {
    modeLabel: short ? 'Grab / taxi' : tight ? 'Limousine van' : 'Private car or limousine van',
    icon: short ? '🚕' : '🚐',
    durationMinutes: minutes,
    costUsd: Math.round(short ? km * 0.5 + 4 : tight ? 8 + km * 0.04 : 20 + km * 0.3),
    reason,
    daytimeHours: minutes / 60,
  }
}

function pickListed(leg: TransportLeg, tight: boolean, prefer?: TransportMode): TransportOption | undefined {
  if (prefer) {
    const hit = leg.options.find((o) => o.mode === prefer)
    if (hit) return hit
  }
  const score = (o: TransportOption) =>
    o.convenience - o.durationMinutes / 120 - o.costUsd / (tight ? 8 : 60)
  return [...leg.options].sort((a, b) => score(b) - score(a))[0]
}

/**
 * How the traveller gets from one city to the next when they have not chosen
 * yet: their own choice first, then the listed option that suits their budget,
 * then a flight or road estimate from the distance. Every hop gets a mode.
 */
export function planCityHop(opts: {
  from: PlaceId
  to: PlaceId
  fromRegion?: string
  toRegion?: string
  fromCity?: string
  toCity?: string
  transportChoices?: Record<string, TransportMode>
  tight: boolean
}): { leg?: TransportLeg; plan: CityHopPlan } {
  const { from, to, tight } = opts
  const leg =
    findLeg(placeLegRegion(from, opts.fromRegion), placeLegRegion(to, opts.toRegion)) ??
    (opts.fromRegion && opts.toRegion ? findLeg(opts.fromRegion, opts.toRegion) : undefined) ??
    (opts.fromCity && opts.toCity ? findLeg(opts.fromCity, opts.toCity) : undefined)
  const toLabel = opts.toCity ?? to
  const chosenMode = leg ? opts.transportChoices?.[leg.id] : undefined
  const chosen = chosenMode ? leg?.options.find((o) => o.mode === chosenMode) : undefined
  if (chosen) {
    return {
      leg,
      plan: {
        modeLabel: chosen.label,
        icon: chosen.icon,
        durationMinutes: chosen.durationMinutes,
        costUsd: chosen.costUsd,
        reason: `${chosen.status} · your chosen mode for this hop.`,
        chosen: true,
        daytimeHours: overnight(chosen) ? 0.5 : chosen.durationMinutes / 60,
      },
    }
  }

  const spine = hubSpokeTransferCopy(from, to)
  const km = roadKm(from, to)
  if (leg) {
    const pick = pickListed(leg, tight, spine?.preferMode)
    if (pick) {
      const sleeper = overnight(pick, spine?.modeLabel)
      if (pick.durationMinutes > FLY_ABOVE_GROUND_MIN && !sleeper) {
        return {
          leg,
          plan: {
            ...flightPlan(km, `Faster than ${Math.round(pick.durationMinutes / 60)}h on the ground to ${toLabel}. Change it in Getting Around.`),
            chosen: false,
          },
        }
      }
      return {
        leg,
        plan: {
          modeLabel: sleeper && spine ? spine.modeLabel : pick.label,
          icon: pick.icon,
          durationMinutes: pick.durationMinutes,
          costUsd: pick.costUsd,
          reason: spine?.reason ?? `${pick.status} · the usual way to ${toLabel}${tight ? ' on your budget' : ''}. Change it in Getting Around.`,
          chosen: false,
          daytimeHours: sleeper ? 0.5 : pick.durationMinutes / 60,
        },
      }
    }
  }

  const reason =
    spine?.reason ??
    (km > FLY_ABOVE_ROAD_KM
      ? `About ${Math.round(km)} km by road — flying saves most of a day. Change it in Getting Around.`
      : `About ${Math.round(km)} km by road to ${toLabel}. Change it in Getting Around.`)
  const flies = km > FLY_ABOVE_ROAD_KM || /flight/i.test(spine?.modeLabel ?? '')
  const base = flies ? flightPlan(km, reason) : roadPlan(km, tight, reason)
  const sleeper = overnight(undefined, spine?.modeLabel)
  return {
    leg,
    plan: {
      ...base,
      modeLabel: spine && !flies ? spine.modeLabel : base.modeLabel,
      icon: spine && !flies ? spine.icon : base.icon,
      chosen: false,
      daytimeHours: sleeper ? 0.5 : base.daytimeHours,
    },
  }
}
