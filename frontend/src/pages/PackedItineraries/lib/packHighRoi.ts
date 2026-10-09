import { SIGHT_CATALOG, getExperienceById } from '../../PlanBuilder/data/experiences'
import { getActivityById } from '../../PlanBuilder/data/activities'
import { SHOPPING_ITEMS } from '../../PlanBuilder/data/shopping'
import { rankCityExperiences } from '../../PlanBuilder/services/cityCatalog'
import { planCityStay } from '../../PlanBuilder/lib/yourVietnam/dayAllocation'
import { alternativesOf, parentTourIdOf } from '../../PlanBuilder/lib/yourVietnam/sightIntelligence'
import { groupIdForSourceId } from '../../PlanBuilder/lib/yourVietnam/sightTiming'
import { spanDays } from '../../PlanBuilder/lib/yourVietnam/itemKind'
import { resolvePlaceId } from '../../PlanBuilder/lib/yourVietnam/cityPins'
import type { PlaceId } from '../../GettingAround/data/types'
import { CITY_STAY_CORES } from '../data/cityStayCores'
import { ensureStayDays } from './themeStayPack'

const TARGET_STOPS = 8

export function cityMatchKeys(city: string): string[] {
  if (city === 'Hoi An') return ['Hoi An', 'Near Hoi An']
  if (city === 'Ho Chi Minh City') return ['Ho Chi Minh City', 'Saigon']
  if (city === 'Can Tho') return ['Can Tho', 'Mekong']
  return [city]
}

export function isCityMatch(itemCity: string | undefined, city: string): boolean {
  if (!itemCity) return false
  const keys = cityMatchKeys(city)
  const fold = (s: string) => s.trim().toLowerCase()
  return keys.some((k) => fold(itemCity) === fold(k))
}

function shoppingForCity(city: string) {
  return SHOPPING_ITEMS.filter((s) => isCityMatch(s.city, city) || isCityMatch(s.region, city))
}

/** Independent high-ROI outings — skip inner landings so a complex is one stop, not a hollow morning. */
export function highRoiPool(city: string, days: number): string[] {
  const ranked = rankCityExperiences(SIGHT_CATALOG.filter((e) => isCityMatch(e.city, city)))
  const shops = shoppingForCity(city)
  const out: string[] = []
  const groups = new Set<string>()
  const names = new Set<string>()

  const consider = (id: string, label: string) => {
    if (out.includes(id)) return
    if (!fitsOneDay(id)) return
    if (parentTourIdOf(id)) return
    if (alternativesOf(id).some((alt) => out.includes(alt))) return
    const group = groupIdForSourceId(id)
    if (groups.has(group)) return
    const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (key && names.has(key)) return
    out.push(id)
    groups.add(group)
    if (key) names.add(key)
  }

  for (const sight of ranked) consider(sight.id, sight.name)
  for (const shop of shops) consider(shop.id, shop.name)

  return out.slice(0, Math.max(14, days * TARGET_STOPS + 6))
}

function poolCap(days: number, coreCount: number) {
  if (days <= 1) return 8
  if (days === 2) return 16
  if (days === 3) return Math.max(22, coreCount + 6)
  if (days === 4) return Math.max(28, coreCount + 8)
  return Math.max(36, coreCount + 10)
}

function catalogIdExists(id: string) {
  return Boolean(getExperienceById(id) || SHOPPING_ITEMS.some((s) => s.id === id))
}

/** A template day holds its own sights; multi-day expeditions would stretch the promised length. */
function fitsOneDay(id: string) {
  return spanDays(getExperienceById(id)?.durationHours) === 1
}

/**
 * Pack a city stay with the same engine as Your Itinerary.
 * Curated cores first, then high-ROI fill. Never score-slice days
 * (that scrambled neighbourhoods and dropped must-dos).
 */
function packIds(city: string, ids: string[], want: number): string[][] {
  if (!ids.length) return []
  const packed = planCityStay(ids, placeIdForCity(city), undefined, { targetDays: want }).days.filter(
    (row) => row.length > 0,
  )
  if (!packed.length) return [ids.slice(0, Math.min(6, ids.length))]
  if (packed.length > want) return packed.slice(0, want)
  return packed
}

/**
 * Pack a city stay with the same engine as Your Itinerary.
 * Cities with curated cores use that must-do list for a 3-day stay.
 * Shorter stays are the first days of that 3-day shape (not a score-sliced scramble).
 */
export function packCityStayDays(city: string, days: number): string[][] {
  const want = Math.max(1, days)
  const ranked = highRoiPool(city, Math.max(want, 5))
  const cores = (CITY_STAY_CORES[city] ?? []).filter(catalogIdExists)
  const pool: string[] = []
  const add = (id: string, { allowInner }: { allowInner: boolean }) => {
    if (!id || pool.includes(id)) return
    if (!catalogIdExists(id) || !fitsOneDay(id)) return
    if (!allowInner && parentTourIdOf(id)) return
    if (alternativesOf(id).some((alt) => pool.includes(alt))) return
    pool.push(id)
  }

  if (cores.length) {
    for (const id of cores) add(id, { allowInner: true })
    const three = packIds(city, pool, 3)
    if (want <= 3) {
      const leftover = ranked.filter((id) => !three.flat().includes(id))
      return ensureStayDays(city, three.slice(0, want), leftover, want, 'packed')
    }
    for (const id of ranked) add(id, { allowInner: false })
    const long = packIds(city, pool.slice(0, poolCap(want, pool.length)), want)
    return ensureStayDays(city, long, pool, want, 'packed')
  }

  for (const id of ranked) add(id, { allowInner: false })
  const rows = packIds(city, pool.slice(0, poolCap(want, 0)), want)
  return ensureStayDays(city, rows, pool, want, 'packed')
}

export function placeIdForCity(city: string): PlaceId {
  return resolvePlaceId(city) ?? 'hanoi'
}

export function classifySourceId(id: string): 'experience' | 'activity' | 'shopping' | null {
  if (getExperienceById(id)) return 'experience'
  if (getActivityById(id)) return 'activity'
  if (SHOPPING_ITEMS.some((s) => s.id === id)) return 'shopping'
  return null
}

export function splitSourceIds(ids: string[]) {
  const experienceIds: string[] = []
  const shoppingIds: string[] = []
  const activityIds: string[] = []
  for (const id of ids) {
    const kind = classifySourceId(id)
    if (kind === 'experience') experienceIds.push(id)
    if (kind === 'shopping') shoppingIds.push(id)
    if (kind === 'activity') activityIds.push(id)
  }
  return { experienceIds, shoppingIds, activityIds }
}

export function sightName(id: string): string {
  return getExperienceById(id)?.name ?? getActivityById(id)?.name ?? SHOPPING_ITEMS.find((s) => s.id === id)?.name ?? id
}
