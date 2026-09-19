import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import type { Experience, ExperiencePopularityTag, HolidayKind } from '../../types'
import type { ActivityPopularityTag, CityActivity } from '../../data/activities'
import type { PlaceId } from '../../../GettingAround/data/types'
import { getRoute } from '../../../GettingAround/data/routes'
import {
  experienceCityForPlace,
  placeLabel,
  resolvePlaceId,
} from './cityPins'
import { orderTripCities } from './cityPlanning'
import { dailySpendBand, hourBudgetForTrip } from './holidayKind'
import { activityHours } from './tripIntelligence'
import type { RouteStop } from './types'

export type BagItemKind = 'experience' | 'activity'

export type ScoredBagItem = {
  key: string
  kind: BagItemKind
  id: string
  name: string
  city: string
  placeId: PlaceId | null
  hours: number
  cost: number
  popularityTag: string
  utility: number
}

export type CitySightGroup = {
  placeId: PlaceId | null
  city: string
  catalogCity: string
  items: ScoredBagItem[]
}

export type CityRoiRow = {
  placeId: PlaceId
  city: string
  catalogCity: string
  roi: number
  utility: number
  transitHours: number
  sightHours: number
  nights: number
  items: ScoredBagItem[]
}

export type OptimizeResult = {
  groups: CitySightGroup[]
  items: ScoredBagItem[]
  cities: CityRoiRow[]
  recommendedDays: number
  currentDays: number
  extraDays: number
  maxDailyHours: number
  paceLabel: string
  groupSize: number
  tripCostNeeded: number
  currentTripCost: number
  extraCost: number
  budgetTarget: number
  budgetOverrun: boolean
  fits: boolean
  dropCandidate: CityRoiRow | null
  nextLowest: CityRoiRow | null
}

const COST_FLOOR = 8

function itemKey(kind: BagItemKind, id: string) {
  return `${kind}:${id}`
}

function mustSeeRating(
  tag: ExperiencePopularityTag | ActivityPopularityTag | string,
  signal?: Experience['signal'],
): number {
  if (signal === 'must-do' || tag === 'Must do') return 1
  if (tag === 'Popular') return 0.8
  if (signal === 'vietnam-special' || tag === 'Unique') return 0.75
  if (signal === 'local-life' || tag === 'Local favourite') return 0.65
  if (signal === 'hidden-gem' || tag === 'Hidden gem') return 0.55
  if (tag === 'Free time') return 0.5
  return 0.7
}

function timeWeight(kind: HolidayKind) {
  return kind === 'action' ? 0.7 : 1.25
}

function popularityScore(starRating: number, reviewCount: number, mustSee: number) {
  const volume = Math.log10(1 + Math.max(0, reviewCount))
  return mustSee * (Math.max(0, starRating) / 5) * volume
}

function utilityOf(popScore: number, cost: number, hours: number, tw: number) {
  const den = Math.max(COST_FLOOR, cost) + hours * tw
  return popScore / den
}

function scoreExperience(e: Experience, tw: number): ScoredBagItem {
  const placeId = resolvePlaceId(e.city, e.region)
  const cost = e.costUsd || e.price || 0
  const hours = e.durationHours || 2.5
  const mustSee = mustSeeRating(e.popularityTag, e.signal)
  const pop = popularityScore(e.rating, e.reviewCount ?? 0, mustSee)
  return {
    key: itemKey('experience', e.id),
    kind: 'experience',
    id: e.id,
    name: e.name,
    city: e.city,
    placeId,
    hours,
    cost,
    popularityTag: e.popularityTag,
    utility: utilityOf(pop, cost, hours, tw),
  }
}

function scoreActivity(a: CityActivity, tw: number): ScoredBagItem {
  const placeId = resolvePlaceId(a.cityName, a.cityId)
  const cost = a.priceFromUsd ?? 0
  const hours = activityHours(a)
  const mustSee = mustSeeRating(a.popularityTag)
  const pop = popularityScore(a.rating, 80, mustSee)
  return {
    key: itemKey('activity', a.id),
    kind: 'activity',
    id: a.id,
    name: a.name,
    city: a.cityName,
    placeId,
    hours,
    cost,
    popularityTag: a.popularityTag,
    utility: utilityOf(pop, cost, hours, tw),
  }
}

export function scoreBagItems(
  experienceIds: string[],
  activityIds: string[],
  holidayKind: HolidayKind,
): ScoredBagItem[] {
  const tw = timeWeight(holidayKind)
  const items: ScoredBagItem[] = []
  const expSet = new Set(experienceIds)
  const actSet = new Set(activityIds)
  for (const e of EXPERIENCES) {
    if (!expSet.has(e.id)) continue
    items.push(scoreExperience(e, tw))
  }
  for (const a of CITY_ACTIVITIES) {
    if (!actSet.has(a.id)) continue
    items.push(scoreActivity(a, tw))
  }
  return items
}

export function groupScoredItems(items: ScoredBagItem[]): CitySightGroup[] {
  const byKey = new Map<string, CitySightGroup>()
  for (const item of items) {
    const key = item.placeId ?? `city:${item.city}`
    let group = byKey.get(key)
    if (!group) {
      const catalogCity = item.placeId
        ? experienceCityForPlace(item.placeId, item.city)
        : item.city
      group = {
        placeId: item.placeId,
        city: item.placeId ? placeLabel(item.placeId) : item.city,
        catalogCity,
        items: [],
      }
      byKey.set(key, group)
    }
    group.items.push(item)
  }
  for (const g of byKey.values()) {
    g.items.sort((a, b) => b.utility - a.utility)
  }
  const withPlace = [...byKey.values()].filter((g) => g.placeId)
  const without = [...byKey.values()].filter((g) => !g.placeId)
  const ordered = orderTripCities(withPlace.map((g) => g.placeId as PlaceId))
    .map((id) => withPlace.find((g) => g.placeId === id)!)
    .filter(Boolean)
  return [...ordered, ...without]
}

function nightsFor(route: RouteStop[], placeId: PlaceId | null, city: string) {
  const stop = route.find((s) => (placeId ? s.placeId === placeId : s.city === city))
  return Math.max(1, stop?.nights ?? 1)
}

function transitBetween(from: PlaceId | null, to: PlaceId | null) {
  if (!from || !to || from === to) return { hours: 0, cost: 0 }
  const seed = getRoute(from, to)
  if (!seed) return { hours: 4, cost: 40 }
  return { hours: seed.typicalHours[0], cost: seed.typicalCostUsd[0] }
}

function visitDifficulty(opts: {
  sightHours: number
  nights: number
  maxDailyHours: number
  transitHours: number
  accCost: number
  groupSize: number
}) {
  const capacity = Math.max(1, opts.nights * opts.maxDailyHours)
  const overcrowding = Math.max(0, opts.sightHours / capacity - 1)
  return (
    1 +
    overcrowding * 1.4 +
    opts.transitHours / 8 +
    opts.accCost / 200 +
    Math.max(0, opts.groupSize - 1) * 0.08
  )
}

export function optimizeItinerary(opts: {
  experienceIds: string[]
  activityIds: string[]
  holidayKind: HolidayKind
  days: number
  dailyUsd: number
  budgetTarget: number
  budgetKnown: boolean
  groupSize: number
  route: RouteStop[]
  keptPlaceIds?: Set<PlaceId>
}): OptimizeResult {
  const items = scoreBagItems(opts.experienceIds, opts.activityIds, opts.holidayKind)
  const groups = groupScoredItems(items)
  const maxDailyHours = hourBudgetForTrip(
    opts.holidayKind,
    dailySpendBand(opts.dailyUsd),
  )
  const paceLabel = opts.holidayKind === 'action' ? 'Action / sightseeing' : 'Relaxed / leisure'
  const groupSize = Math.max(1, opts.groupSize)
  const currentDays = Math.max(1, opts.days)

  const placed = groups.filter((g): g is CitySightGroup & { placeId: PlaceId } => Boolean(g.placeId))
  const cities: CityRoiRow[] = []
  let transitHoursTotal = 0
  for (let i = 0; i < placed.length; i++) {
    const g = placed[i]
    const prev = i > 0 ? placed[i - 1] : null
    const transit = transitBetween(prev?.placeId ?? null, g.placeId)
    transitHoursTotal += transit.hours
    const nights = nightsFor(opts.route, g.placeId, g.city)
    const utility = g.items.reduce((s, it) => s + it.utility, 0)
    const sightHours = g.items.reduce((s, it) => s + it.hours, 0)
    const accCost = opts.dailyUsd * nights * 0.35
    const difficulty = visitDifficulty({
      sightHours,
      nights,
      maxDailyHours,
      transitHours: transit.hours,
      accCost,
      groupSize,
    })
    cities.push({
      placeId: g.placeId,
      city: g.city,
      catalogCity: g.catalogCity,
      roi: utility / Math.max(0.35, difficulty),
      utility,
      transitHours: transit.hours,
      sightHours,
      nights,
      items: g.items,
    })
  }

  const sightHoursTotal = items.reduce((s, it) => s + it.hours, 0)
  const recommendedDays = Math.max(
    Math.max(1, groups.length),
    Math.ceil((sightHoursTotal + transitHoursTotal) / Math.max(3, maxDailyHours)),
  )
  const extraDays = Math.max(0, recommendedDays - currentDays)
  const tripCostNeeded = recommendedDays * opts.dailyUsd * groupSize
  const currentTripCost = currentDays * opts.dailyUsd * groupSize
  const extraCost = extraDays * opts.dailyUsd * groupSize
  const budgetCap =
    opts.budgetKnown && opts.budgetTarget > 0 ? opts.budgetTarget : Infinity
  const budgetOverrun = Number.isFinite(budgetCap) && tripCostNeeded > budgetCap * 1.05
  const fits = extraDays === 0 && !budgetOverrun

  const byRoiAsc = [...cities].sort((a, b) => a.roi - b.roi)
  const kept = opts.keptPlaceIds ?? new Set<PlaceId>()
  const droppable = byRoiAsc.filter((c) => !kept.has(c.placeId))
  const canDrop = !fits && cities.length > 1 && droppable.length > 0
  const dropCandidate = canDrop ? droppable[0] : null
  const nextLowest = canDrop && droppable.length > 1 ? droppable[1] : null

  return {
    groups,
    items,
    cities: [...cities].sort((a, b) => b.roi - a.roi),
    recommendedDays,
    currentDays,
    extraDays,
    maxDailyHours,
    paceLabel,
    groupSize,
    tripCostNeeded,
    currentTripCost,
    extraCost,
    budgetTarget: opts.budgetTarget,
    budgetOverrun,
    fits,
    dropCandidate,
    nextLowest,
  }
}
