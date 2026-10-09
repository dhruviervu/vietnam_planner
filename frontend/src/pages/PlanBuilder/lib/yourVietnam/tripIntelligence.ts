import { ACTIVITY_OWNED_SIGHT_IDS, EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES, type CityActivity } from '../../data/activities'
import { EXPLORE_CITIES } from '../../data/exploreCities'
import { RESTAURANTS } from '../../data/restaurants'
import { RESTAURANTS as TASTE_RESTAURANTS } from '../../../TasteOfVietnam/data/restaurants'
import { getExperiencePracticalInfo } from '../../services/experiencePracticalInfo'
import type { Experience, HolidayKind, TravelStyle } from '../../types'
import type { PlaceId } from '../../../GettingAround/data/types'
import type { PeriodId, TripIssue } from './types'
import { resolvePlaceId } from './cityPins'
import {
  addCapForKind,
  type DailyBand,
  hourBudgetForTrip,
  perDayCapacityForKind,
} from './holidayKind'

export type SuggestedExperience = {
  id: string
  name: string
  tag: string
  reason: string
  city: string
  region: string
}

export type SuggestedAdd = {
  kind: 'experience' | 'activity' | 'restaurant'
  id: string
  name: string
  tag: string
  reason: string
  city: string
  region: string
  hours: number
  costUsd: number
  period?: PeriodId
}

export type TripShapeInput = {
  holidayKind: HolidayKind
  groupSize: number
  dailyUsd: number
  band: DailyBand
}

export type CityDayWeight = {
  placeId: PlaceId
  city: string
  region: string
  weight: number
  selectedCount: number
  hours: number
  /** Nights needed to visit every saved sight without a leftover pile. */
  neededDays?: number
}

/** Higher = stronger keep-as-core signal for a packed day. Uses catalog popularityRank, not display totalScore. */
export function experiencePriority(e: Experience): number {
  let score = 120 - (e.popularityRank ?? 50)
  if (e.signal === 'must-do') score += 42
  if (e.vietnamBest) score += 28
  if (e.signal === 'vietnam-special') score += 16
  if (e.signal === 'adventure' || e.signal === 'picture-perfect') score += 8
  if (e.featured) score += 10
  score -= Math.max(0, (e.durationHours ?? 2) - 4) * 3
  return score
}

export function hourBudget(style: TravelStyle) {
  if (style === 'relaxed') return 5
  if (style === 'packed') return 10
  return 7.5
}

export function expectedExperiencesForStop(
  nights: number,
  style: TravelStyle,
  region: string,
): number {
  const city = EXPLORE_CITIES.find((c) => c.region === region || c.name === region)
  const density = city?.experienceDensity ?? 'Medium'
  const perNight = style === 'relaxed' ? 0.75 : style === 'packed' ? 2 : 1.25
  const densityPad = density === 'High' ? 0.75 : density === 'Low' ? -0.25 : 0.25
  return Math.max(1, Math.round(nights * perNight + densityPad))
}

export function activityHours(a: CityActivity): number {
  const label = a.durationLabel.toLowerCase()
  if (/half\s*day/.test(label)) return 4
  if (/full\s*day/.test(label)) return 7
  const nums = a.durationLabel.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? []
  if (/min/i.test(label)) {
    if (nums.length >= 2) return (nums[0] + nums[1]) / 2 / 60
    if (nums.length === 1) return nums[0] / 60
  }
  if (nums.length >= 2) return (nums[0] + nums[1]) / 2
  if (nums.length === 1) return nums[0]
  return 2.5
}

export function isMustKeep(e: Experience): boolean {
  return e.signal === 'must-do' || Boolean(e.vietnamBest)
}

export function walkingIntensityOf(e: Experience): number {
  return getExperiencePracticalInfo(e).physicalEffort.walkingIntensity
}

export function isCultureFoodItem(e: Experience): boolean {
  if (e.category === 'Food' || e.category === 'Culture' || e.category === 'History') return true
  return /cook|food|market|class|pagoda|temple|citadel|museum/i.test(`${e.id} ${e.name}`)
}

export function groupFitScore(e: Experience, groupSize: number): number {
  const intensity = walkingIntensityOf(e)
  if (groupSize >= 3) {
    if (e.category === 'Nightlife') return -22
    if (intensity >= 5) return -18
    if (e.category === 'Beaches' || e.category === 'Culture') return 8
  }
  if (groupSize === 2) {
    if (e.slotQuality.evening >= 4) return 8
    if (e.signal === 'slow-scenic') return 6
  }
  if (groupSize === 1) {
    if (e.category === 'Food' || e.signal === 'local-life') return 6
  }
  return 0
}

export function kindFitScore(e: Experience, kind: HolidayKind): number {
  if (kind === 'action') {
    let s = 0
    if (isMustKeep(e)) s += 30
    if (e.category === 'Adventure' || e.category === 'History' || e.category === 'Nature') s += 12
    s += Math.min(e.durationHours || 2, 8)
    return s
  }
  if (kind === 'leisure') {
    let s = 0
    if (e.signal === 'slow-scenic' || e.category === 'Beaches') s += 25
    s += (5 - walkingIntensityOf(e)) * 6
    if ((e.durationHours || 0) >= 6) s -= 15
    return s
  }
  let s = 0
  if (isCultureFoodItem(e)) s += 28
  if (/cook|food|market|class/i.test(`${e.id} ${e.name}`)) s += 10
  return s
}

export function scoreExperienceForTrip(e: Experience, shape: TripShapeInput): number {
  let score = experiencePriority(e) + kindFitScore(e, shape.holidayKind) + groupFitScore(e, shape.groupSize)
  if (shape.band === 'tight' && e.costUsd >= 40) score -= 18
  if (shape.band === 'comfortable' && e.costUsd >= 20) score += 4
  return score
}

export function scoreActivityForTrip(a: CityActivity, shape: TripShapeInput): number {
  let score = 20
  if (shape.holidayKind === 'culture-food' && (a.kind === 'food' || a.kind === 'class' || a.kind === 'workshop')) {
    score += 24
  }
  if (shape.holidayKind === 'leisure' && (a.kind === 'beach' || a.kind === 'class')) score += 16
  if (shape.holidayKind === 'action' && (a.kind === 'adventure' || a.kind === 'sport')) score += 16
  if (shape.groupSize >= 3 && (a.kind === 'music' || a.kind === 'dance')) score -= 10
  if (shape.band === 'tight' && (a.priceFromUsd ?? 0) >= 40) score -= 12
  return score
}

/** Day occupancy families — similar things should not stack in one day/slot. */
export type OccupancyFamily =
  | 'cooking'
  | 'food-tour'
  | 'sit-down-lunch'
  | 'sit-down-dinner'
  | 'hands-on-class'
  | 'nightlife'
  | 'cafe'
  | 'boat'

function occupancyBlob(id: string, name: string, extra = ''): string {
  return `${id} ${name} ${extra}`.toLowerCase()
}

function isCafeBlob(blob: string): boolean {
  return /coffee|cafe|caf[eé]|egg coffee/.test(blob) && !/cook|kitchen|class/.test(blob)
}

export function occupancyFamilyExperience(e: Experience): OccupancyFamily | null {
  const blob = occupancyBlob(e.id, e.name, e.category)
  if (isCafeBlob(blob)) return 'cafe'
  if (/cook|kitchen/.test(blob)) return 'cooking'
  if (/boat|paddle|sampan|kayak|tam coc|trang an|van long/.test(blob)) return 'boat'
  if (e.category === 'Nightlife' || /bia.?hoi|beer corner/.test(blob)) return 'nightlife'
  if (e.category === 'Food' || /street food|food tour|market crawl|food crawl/.test(blob)) {
    return 'food-tour'
  }
  return null
}

export function occupancyFamilyActivity(a: CityActivity): OccupancyFamily | null {
  const blob = occupancyBlob(a.id, a.name, a.kind)
  if (isCafeBlob(blob)) return 'cafe'
  if (/cook|kitchen/.test(blob) || ((a.kind === 'class' || a.kind === 'workshop') && /food|cuisine/.test(blob))) {
    return 'cooking'
  }
  if (/boat|paddle|sampan|kayak/.test(blob)) return 'boat'
  if (/picnic|farm family|homestay|home-cooked/.test(blob)) return 'food-tour'
  if (a.kind === 'food') return 'food-tour'
  if (a.kind === 'class' || a.kind === 'workshop') return 'hands-on-class'
  if (a.kind === 'music' || a.kind === 'dance') return 'nightlife'
  return null
}

export function occupancyConflicts(
  family: OccupancyFamily | null,
  occupied: Set<string>,
  period?: PeriodId,
): boolean {
  if (!family) return false
  if (occupied.has(family)) return true
  if (family === 'cooking') {
    return occupied.has('sit-down-lunch')
  }
  if (family === 'food-tour') {
    if (period === 'evening' || period === 'night') return occupied.has('sit-down-dinner')
    return occupied.has('cooking') || occupied.has('sit-down-lunch')
  }
  if (family === 'cafe') {
    return period === 'afternoon' && occupied.has('sit-down-lunch')
  }
  if (family === 'sit-down-lunch') {
    return (
      occupied.has('cooking') ||
      (occupied.has('food-tour') && !occupied.has('food-tour-evening')) ||
      occupied.has('cafe-afternoon')
    )
  }
  if (family === 'sit-down-dinner') {
    return occupied.has('food-tour-evening')
  }
  return false
}

export function isCafeRestaurant(name: string, cuisine = ''): boolean {
  return /cafe|caf[eé]|coffee|giảng|giang/i.test(`${name} ${cuisine}`)
}

export function isSnackRestaurant(name: string, cuisine = ''): boolean {
  return /bánh mì|banh mi|sandwich/i.test(`${name} ${cuisine}`)
}

export function cityWeight(
  experiences: Experience[],
  activities: CityActivity[],
  kind: HolidayKind,
): number {
  const hours =
    experiences.reduce((s, e) => s + (e.durationHours || 2.5), 0) +
    activities.reduce((s, a) => s + activityHours(a), 0)
  const fit = experiences.reduce((s, e) => s + kindFitScore(e, kind), 0)
  let extra = activities.length * 8
  if (kind === 'leisure' && experiences.some((e) => e.category === 'Beaches')) extra += 20
  if (kind === 'culture-food' && experiences.some(isCultureFoodItem)) extra += 16
  return hours * 4 + fit + extra
}

/** First-trip night bands (Hanoi 2–4, Ninh Binh 1–2, Hoi An 2–3, etc.). */
const TYPICAL_NIGHTS: Partial<Record<PlaceId, { min: number; sweet: number; max: number }>> = {
  hanoi: { min: 2, sweet: 3, max: 4 },
  'ninh-binh': { min: 1, sweet: 1, max: 2 },
  'ha-long': { min: 1, sweet: 1, max: 2 },
  sapa: { min: 2, sweet: 3, max: 3 },
  hue: { min: 1, sweet: 2, max: 2 },
  'da-nang': { min: 1, sweet: 2, max: 2 },
  'hoi-an': { min: 2, sweet: 3, max: 3 },
  'nha-trang': { min: 2, sweet: 3, max: 3 },
  dalat: { min: 1, sweet: 2, max: 2 },
  'phu-quoc': { min: 3, sweet: 4, max: 5 },
  hcmc: { min: 2, sweet: 3, max: 4 },
}

function typicalBand(placeId: PlaceId) {
  return TYPICAL_NIGHTS[placeId] ?? { min: 1, sweet: 2, max: 3 }
}

/**
 * Spread `totalDays` across bag cities like a planner would: nights follow
 * selected hours/items, typical stop length, and a fair cap — leftover days
 * never dump onto the thinnest city.
 */
/**
 * Compute how many days each city needs based on the total sight hours and the
 * pace's daily sightseeing budget. A relaxed pace (3–5h/day) naturally needs
 * more days than an action pace (6–8h/day) for the same sight pool.
 *
 * The function first calculates the *minimum* days each city needs (ceil of
 * total sight hours ÷ max sightseeing hours per day), then distributes any
 * remaining days from `totalDays` proportionally.
 */
export function allocateCityDayCounts(
  cities: CityDayWeight[],
  totalDays: number,
  _kind: HolidayKind,
  hoursPerDay = 6.5,
  _itemCapacity = 2,
): Map<PlaceId, number> {
  const counts = new Map<PlaceId, number>()
  if (cities.length === 0) return counts

  const hp = Math.max(2.5, hoursPerDay)

  // Step 1: Prefer a packing-based night count (duration, travel, meals, hours).
  const profile = cities.map((c) => {
    const fromHours = Math.max(1, Math.ceil(c.hours / hp))
    const needed = Math.max(1, c.neededDays ?? fromHours)
    return { c, needed, hours: c.hours }
  })

  // Step 2: Sum up the minimum days all cities need
  const minTotal = profile.reduce((s, p) => s + p.needed, 0)

  // If the sum of needed days exceeds the user's requested days, use the larger
  const effectiveDays = Math.max(totalDays, minTotal)

  // Step 3: Assign each city its minimum needed days
  for (const p of profile) counts.set(p.c.placeId, p.needed)

  // Step 4: Distribute remaining days to cities with the most hours
  let remaining = effectiveDays - minTotal
  while (remaining > 0) {
    // Give extra days to cities where each day would still be over-packed
    const cands = [...profile].sort((a, b) => {
      const aPerDay = a.hours / (counts.get(a.c.placeId) ?? 1)
      const bPerDay = b.hours / (counts.get(b.c.placeId) ?? 1)
      return bPerDay - aPerDay
    })
    const pick = cands[0]
    if (!pick) break
    counts.set(pick.c.placeId, (counts.get(pick.c.placeId) ?? 0) + 1)
    remaining -= 1
  }

  return counts
}

export function styleFromKind(kind: HolidayKind): TravelStyle {
  if (kind === 'leisure') return 'relaxed'
  if (kind === 'action') return 'packed'
  return 'balanced'
}

export function suggestExperiencesForCity(
  region: string,
  selectedIds: Set<string>,
  limit = 3,
): SuggestedExperience[] {
  const pool = EXPERIENCES.filter(
    (e) =>
      (e.region === region || e.city === region) &&
      !selectedIds.has(e.id) &&
      (e.signal === 'must-do' ||
        e.vietnamBest ||
        e.signal === 'vietnam-special' ||
        e.signal === 'picture-perfect' ||
        e.popularityRank <= 15),
  )
    .sort((a, b) => experiencePriority(b) - experiencePriority(a))
    .slice(0, limit)

  return pool.map((e) => ({
    id: e.id,
    name: e.name,
    tag: e.popularityTag,
    city: e.city,
    region: e.region,
    reason:
      e.signal === 'must-do' || e.vietnamBest
        ? `A defining ${e.city} experience most first-timers don’t skip.`
        : e.signal === 'vietnam-special' || e.popularityTag === 'Unique'
          ? `A distinctive ${e.city} pick that makes the stop feel complete.`
          : `Popular in ${e.city} — a natural add if you have a free half-day.`,
  }))
}

function placeMatches(city: string, region: string, placeId: PlaceId): boolean {
  return resolvePlaceId(city, region) === placeId
}

export function suggestAddsForCity(
  placeId: PlaceId,
  selectedExpIds: Set<string>,
  selectedActIds: Set<string>,
  remainingHours: number,
  remainingDailyUsd: number,
  shape: TripShapeInput,
  skipped: Set<string>,
  limit?: number,
  occupiedFamilies: Set<string> = new Set(),
): SuggestedAdd[] {
  const cap = Math.min(limit ?? addCapForKind(shape.holidayKind), addCapForKind(shape.holidayKind))
  if (cap <= 0 || remainingHours < 1.5) return []
  const occupied = new Set(occupiedFamilies)

  const expPool = EXPERIENCES.filter((e) => {
    if (selectedExpIds.has(e.id) || skipped.has(`exp:${e.id}`) || skipped.has(e.id)) return false
    if (!placeMatches(e.city, e.region, placeId)) return false
    if (shape.holidayKind === 'leisure' && walkingIntensityOf(e) >= 4) return false
    if (shape.band === 'tight' && e.costUsd > Math.max(15, remainingDailyUsd * 0.7)) return false
    const hours = e.durationHours || 2.5
    return hours <= remainingHours + 0.5
  }).map((e) => {
    const hours = e.durationHours || 2.5
    const add: SuggestedAdd = {
      kind: 'experience',
      id: e.id,
      name: e.name,
      tag: e.popularityTag,
      city: e.city,
      region: e.region,
      hours,
      costUsd: e.costUsd,
      reason: addReason(e, shape),
      period: bestPeriod(e),
    }
    return { add, score: scoreExperienceForTrip(e, shape) }
  })

  const actPool = CITY_ACTIVITIES.filter((a) => {
    if (selectedActIds.has(a.id) || skipped.has(`act:${a.id}`) || skipped.has(a.id)) return false
    if (!placeMatches(a.cityName, a.cityId, placeId)) return false
    const hours = activityHours(a)
    if (hours > remainingHours + 0.5) return false
    if (shape.band === 'tight' && (a.priceFromUsd ?? 0) > Math.max(15, remainingDailyUsd * 0.7)) {
      return false
    }
    if (shape.holidayKind === 'leisure' && a.kind === 'adventure') return false
    return true
  }).map((a) => {
    const hours = activityHours(a)
    const add: SuggestedAdd = {
      kind: 'activity',
      id: a.id,
      name: a.name,
      tag: a.popularityTag,
      city: a.cityName,
      region: a.cityName,
      hours,
      costUsd: a.priceFromUsd ?? 0,
      reason: `${a.kindLabel} in ${a.cityName} — a natural fill for this kind of holiday.`,
      period:
        a.kind === 'music' || a.kind === 'dance' || a.kind === 'beach'
          ? 'evening'
          : a.kind === 'class' || a.kind === 'workshop'
            ? 'morning'
            : 'afternoon',
    }
    return { add, score: scoreActivityForTrip(a, shape) }
  })

  const ranked = [...expPool, ...actPool].sort((a, b) => b.score - a.score)
  const picked: SuggestedAdd[] = []
  let hoursLeft = remainingHours
  let spendLeft = remainingDailyUsd
  for (const row of ranked) {
    if (picked.length >= cap) break
    if (row.add.hours > hoursLeft + 0.25) continue
    if (shape.band === 'tight' && row.add.costUsd > spendLeft && row.add.costUsd > 12) continue
    const srcExp = row.add.kind === 'experience' ? EXPERIENCES.find((e) => e.id === row.add.id) : undefined
    const srcAct = row.add.kind === 'activity' ? CITY_ACTIVITIES.find((a) => a.id === row.add.id) : undefined
    const family = srcExp
      ? occupancyFamilyExperience(srcExp)
      : srcAct
        ? occupancyFamilyActivity(srcAct)
        : null
    if (family && occupancyConflicts(family, occupied, row.add.period)) continue
    picked.push(row.add)
    hoursLeft -= row.add.hours
    spendLeft -= row.add.costUsd
    if (family) occupied.add(family)
  }
  return picked
}

function addReason(e: Experience, shape: TripShapeInput): string {
  if (shape.holidayKind === 'culture-food' && isCultureFoodItem(e)) {
    return `Fits a culture/food trip in ${e.city}.`
  }
  if (shape.holidayKind === 'action' && (isMustKeep(e) || e.popularityRank <= 15)) {
    return `A core ${e.city} sight — worth adding while you’re here.`
  }
  if (shape.holidayKind === 'leisure') {
    return `A gentler ${e.city} stop that won’t blow a slow day.`
  }
  return `A natural add if you have a free half-day in ${e.city}.`
}

function bestPeriod(e: Experience): PeriodId {
  const q = e.slotQuality
  const ranked: Array<[PeriodId, number]> = [
    ['morning', q.morning],
    ['afternoon', q.afternoon],
    ['evening', q.evening],
  ]
  ranked.sort((a, b) => b[1] - a[1])
  return ranked[0][0]
}

export type DropDecision = {
  id: string
  reason: string
}

/**
 * Suggest dropping overflow items. Never includes must-do / vietnamBest.
 */
export function suggestDropsForDay(
  dayExperiences: Experience[],
  activities: CityActivity[],
  shape: TripShapeInput,
  hourBudget: number,
  capacity: number,
): Map<string, DropDecision> {
  const result = new Map<string, DropDecision>()
  const usedHours =
    dayExperiences.reduce((s, e) => s + (e.durationHours || 2.5), 0) +
    activities.reduce((s, a) => s + activityHours(a), 0)
  const overHours = usedHours > hourBudget
  const overCount = dayExperiences.length + activities.length > capacity + 1
  if (!overHours && !overCount) return result

  const candidates: Array<{ id: string; score: number; reason: string; protected: boolean }> = []

  for (const e of dayExperiences) {
    const protectedKeep =
      isMustKeep(e) || (shape.holidayKind === 'culture-food' && isCultureFoodItem(e))
    let dropScore = 0
    const intensity = walkingIntensityOf(e)
    const hours = e.durationHours || 2.5
    if (shape.holidayKind === 'leisure') {
      if (hours >= 6) dropScore += 20
      if (intensity >= 4) dropScore += 22
    } else if (shape.holidayKind === 'action') {
      dropScore += 40 - Math.min(40, experiencePriority(e) / 4)
      if (isMustKeep(e)) dropScore -= 50
    } else {
      if (!isCultureFoodItem(e) && e.category === 'Nature') dropScore += 12
      if (/viewpoint|photo|picture/i.test(`${e.id} ${e.signal}`)) dropScore += 8
    }
    if (shape.band === 'tight' && e.costUsd >= 40) dropScore += 16
    candidates.push({
      id: e.id,
      score: dropScore,
      protected: protectedKeep,
      reason: dropReason(e, shape, intensity, hours),
    })
  }

  for (const a of activities) {
    let dropScore = 8
    if (shape.holidayKind === 'leisure' && a.kind === 'adventure') dropScore += 18
    if (shape.holidayKind === 'culture-food' && a.kind === 'food') dropScore -= 20
    if (shape.band === 'tight' && (a.priceFromUsd ?? 0) >= 40) dropScore += 12
    candidates.push({
      id: a.id,
      score: dropScore,
      protected: false,
      reason: `This day is already full — ${a.name} is the easier one to skip if you want breathing room.`,
    })
  }

  const ranked = candidates
    .filter((c) => !c.protected)
    .sort((a, b) => b.score - a.score)

  const needHours = Math.max(0, usedHours - hourBudget)
  let freed = 0
  for (const c of ranked) {
    if (freed >= needHours && result.size >= 1) break
    if (c.score < 8 && result.size > 0) break
    result.set(c.id, { id: c.id, reason: c.reason })
    const exp = dayExperiences.find((e) => e.id === c.id)
    freed += exp ? exp.durationHours || 2.5 : 2.5
    if (result.size >= 3) break
  }
  return result
}

function dropReason(e: Experience, shape: TripShapeInput, intensity: number, hours: number): string {
  if (shape.band === 'tight' && e.costUsd >= 40) {
    return `${e.name} is a higher-cost block on a tight daily budget. Keep it if it matters to you — otherwise a cheaper sight leaves more for food and transit.`
  }
  if (shape.holidayKind === 'leisure' && (hours >= 6 || intensity >= 4)) {
    return `${e.name} is long or physically hard for a leisure trip. We kept it because you chose it — treat it as optional unless it’s a must for you.`
  }
  if (shape.holidayKind === 'action') {
    return `${e.name} is a lighter filler next to stronger sights on this day. Keep it if you still have energy.`
  }
  return `Between your other ${e.city} picks, ${e.name} is the easier one to drop if the day runs long.`
}

export type OptionalDecision = {
  id: string
  reason: string
  preferredId?: string
  preferredName?: string
}

export function decideOptionalItems(
  dayExperiences: Experience[],
  activityHoursTotal: number,
  capacity: number,
  style: TravelStyle,
  hoursOverride?: number,
): Map<string, OptionalDecision> {
  const result = new Map<string, OptionalDecision>()
  if (dayExperiences.length === 0) return result

  const ranked = [...dayExperiences].sort(
    (a, b) => experiencePriority(b) - experiencePriority(a),
  )
  const budget = hoursOverride ?? hourBudget(style)
  let usedHours = activityHoursTotal
  const core: Experience[] = []

  for (const exp of ranked) {
    const hours = exp.durationHours || 2.5
    const overCount = core.length >= capacity
    const overHours = usedHours + hours > budget && core.length >= 1
    if (overCount || overHours) {
      const preferred = core[0]
      const angle =
        preferred.signal === 'must-do' || preferred.vietnamBest
          ? 'more essential / must-do'
          : preferred.signal === 'vietnam-special'
            ? 'more distinctly Vietnamese'
            : preferred.category === 'History'
              ? 'stronger historical fit'
              : preferred.category === 'Food'
                ? 'stronger food-culture fit'
                : 'a better pace fit'
      result.set(exp.id, {
        id: exp.id,
        preferredId: preferred.id,
        preferredName: preferred.name,
        reason: `Between ${preferred.name} and ${exp.name}, ${preferred.name} is ${angle} for this day. We still kept ${exp.name} — treat it as optional if you’re short on time or energy once you’re in Vietnam.`,
      })
    } else {
      core.push(exp)
      usedHours += hours
    }
  }

  return result
}

export type RouteThinStop = {
  city: string
  region: string
  nights: number
  selectedCount: number
  expected: number
  suggestions: SuggestedExperience[]
  placeId?: PlaceId
}

export function findThinCities(
  route: { city: string; region: string; nights: number; experiences: number; placeId?: string }[],
  selectedExperienceIds: string[],
  style: TravelStyle,
): RouteThinStop[] {
  const selected = new Set(selectedExperienceIds)
  const thin: RouteThinStop[] = []

  for (const stop of route) {
    if (stop.nights < 1) continue
    const expected = expectedExperiencesForStop(stop.nights, style, stop.region)
    const placeId = (stop.placeId as PlaceId | undefined) ?? undefined
    const regionSelected = EXPERIENCES.filter((e) => {
      if (!selected.has(e.id)) return false
      if (placeId && resolvePlaceId(e.city, e.region) === placeId) return true
      return e.region === stop.region || e.city === stop.city
    }).length
    if (stop.nights < 2 && regionSelected > 0) continue
    if (regionSelected >= expected) continue
    thin.push({
      city: stop.city,
      region: stop.region,
      nights: stop.nights,
      selectedCount: regionSelected,
      expected,
      suggestions: suggestExperiencesForCity(stop.region, selected, 3),
      placeId,
    })
  }
  return thin
}

/** First-trip cores, north → south. People will not hit all eight. */
export const CORE_PLACE_IDS: PlaceId[] = [
  'sapa',
  'hanoi',
  'ha-long',
  'ninh-binh',
  'hue',
  'da-nang',
  'hoi-an',
  'hcmc',
]

const CORE_NOTE: Partial<Record<PlaceId, { label: string; line: string }>> = {
  sapa: {
    label: 'Sapa',
    line: 'Sapa is a core highland stop most first trips add when the north has room.',
  },
  hanoi: {
    label: 'Hanoi',
    line: 'Hanoi is a core stop most first trips include — the north usually starts here.',
  },
  'ha-long': {
    label: 'Ha Long Bay',
    line: 'Ha Long Bay is a core stop most first trips include — an easy hop from Hanoi.',
  },
  'ninh-binh': {
    label: 'Ninh Binh',
    line: 'Ninh Binh is a core stop most first trips include — a natural next beat after Hanoi.',
  },
  hue: {
    label: 'Hue',
    line: 'Hue is a core stop most first trips include when the centre is on the route.',
  },
  'da-nang': {
    label: 'Da Nang',
    line: 'Da Nang is a core coastal hub most first trips use between Hue and Hoi An.',
  },
  'hoi-an': {
    label: 'Hoi An',
    line: 'Hoi An is a core stop most first trips include — the classic central pause.',
  },
  hcmc: {
    label: 'Ho Chi Minh City',
    line: 'Ho Chi Minh City is a core stop most first trips include — the usual southern close.',
  },
}

/** About 3 / 4 / 5 / 6 cores for 5 / 7 / 10 / 14 days. */
export function expectedCoreCount(days: number): number {
  if (days <= 5) return 3
  if (days <= 7) return 4
  if (days <= 10) return 5
  if (days <= 14) return 6
  return 7
}

export const CORE_CITY_META = CORE_NOTE

const TRAVEL_HUBS = new Set<PlaceId>(['hanoi', 'hcmc', 'da-nang', 'hue', 'hoi-an'])

export type NightsShiftAdvice = {
  keepCity: string
  trimCity: string
  keepPlaceId: PlaceId
  trimPlaceId: PlaceId
  message: string
}

function cityStayWorth(placeId: PlaceId) {
  const items = EXPERIENCES.filter((e) => resolvePlaceId(e.city, e.region) === placeId)
  const explore = EXPLORE_CITIES.find((c) => c.id === placeId)
  const band = typicalBand(placeId)

  let popularity = 0
  const sample = items
    .slice()
    .sort((a, b) => experiencePriority(b) - experiencePriority(a))
    .slice(0, 12)
  for (const e of sample) {
    popularity += experiencePriority(e)
    popularity += Math.min(14, (e.reviewCount ?? 0) / 600)
  }
  if (sample.length) popularity /= Math.max(4, sample.length)

  let ease = 8
  if (explore?.arrivalHub) ease += 28
  if (explore?.experienceDensity === 'High') ease += 18
  else if (explore?.experienceDensity === 'Medium') ease += 10
  if (TRAVEL_HUBS.has(placeId)) ease += 16

  let timeWorth = band.sweet * 14 + band.max * 6
  if (CORE_PLACE_IDS.includes(placeId)) timeWorth += 22
  if (items.some((e) => e.vietnamBest || e.signal === 'must-do')) timeWorth += 12

  return {
    score: popularity + ease + timeWorth,
    sweet: band.sweet,
    max: band.max,
  }
}

/** When a high-worth city is short on nights vs a lower-worth stop that is long. */
export function nightsShiftAdvice(
  stops: { city: string; nights: number; placeId?: string }[],
): NightsShiftAdvice | null {
  const cities = stops.filter(
    (s): s is { city: string; nights: number; placeId: PlaceId } => Boolean(s.placeId) && s.nights >= 1,
  )
  if (cities.length < 2) return null

  const scored = cities.map((s) => ({ ...s, worth: cityStayWorth(s.placeId) }))
  let best: NightsShiftAdvice | null = null
  let bestGap = 0

  for (const keep of scored) {
    if (keep.nights > keep.worth.sweet) continue
    for (const trim of scored) {
      if (trim.placeId === keep.placeId) continue
      const overSweet = trim.nights > trim.worth.sweet
      const overMax = trim.nights >= trim.worth.max
      if (!overSweet && !overMax) continue
      const gap = keep.worth.score - trim.worth.score
      if (gap < 12) continue
      if (gap <= bestGap) continue
      bestGap = gap
      best = {
        keepCity: keep.city,
        trimCity: trim.city,
        keepPlaceId: keep.placeId,
        trimPlaceId: trim.placeId,
        message: `If you need to shorten the trip, ${trim.city} is the gentler place to drop a night. ${keep.city} usually repays extra time more — denser sights, easier days, and a stronger return on the stay.`,
      }
    }
  }
  return best
}

/**
 * Missing first-trip cores to suggest (does not add days). Prefer the classic
 * complements — Ha Long, Hue, HCMC — not only the geographically nearest hub.
 */
export function suggestMissingCoreCities(
  visitedPlaceIds: PlaceId[],
  daysCount: number,
): PlaceId[] {
  const visited = new Set(visitedPlaceIds)
  const priority: PlaceId[] = [
    'hanoi',
    'hcmc',
    'ha-long',
    'hue',
    'hoi-an',
    'ninh-binh',
    'sapa',
    'da-nang',
  ]
  // Only classics on the part of the country the trip already covers.
  const bands = new Set(visitedPlaceIds.map((id) => CORE_BAND[id]).filter(Boolean))
  let missing = priority.filter(
    (id) => !visited.has(id) && CORE_PLACE_IDS.includes(id) && bands.has(CORE_BAND[id]),
  )
  if (visited.has('hoi-an')) missing = missing.filter((id) => id !== 'da-nang')
  if (daysCount <= 3) return []
  const cap = daysCount <= 7 ? 1 : 2
  return missing.slice(0, cap)
}

const CORE_BAND: Partial<Record<PlaceId, 'north' | 'central' | 'south'>> = {
  hanoi: 'north',
  sapa: 'north',
  'ha-long': 'north',
  'ninh-binh': 'north',
  'ha-giang': 'north',
  hue: 'central',
  'da-nang': 'central',
  'hoi-an': 'central',
  'phong-nha': 'central',
  hcmc: 'south',
  mekong: 'south',
  'can-tho': 'south',
  'phu-quoc': 'south',
}

export function applyUserNightOverrides(
  counts: Map<PlaceId, number>,
  orderedIds: PlaceId[],
  totalDays: number,
  overrides: Record<string, number> | undefined,
  weights: CityDayWeight[],
): Map<PlaceId, number> {
  if (!overrides || orderedIds.length === 0) return counts
  const lockedIds = orderedIds.filter((id) => overrides[id] != null)
  if (lockedIds.length === 0) return counts

  const days = Math.max(totalDays, orderedIds.length)
  const minEach = 1
  const maxOne = days - (orderedIds.length - 1)
  const hoursOf = (id: PlaceId) => weights.find((w) => w.placeId === id)?.hours ?? 0
  const next = new Map<PlaceId, number>()
  const unlockedIds = orderedIds.filter((id) => !lockedIds.includes(id))

  for (const id of lockedIds) {
    next.set(id, Math.max(minEach, Math.min(maxOne, Math.round(overrides[id]))))
  }

  let lockedSum = lockedIds.reduce((s, id) => s + (next.get(id) ?? minEach), 0)
  let overflow = lockedSum + unlockedIds.length * minEach - days
  if (overflow > 0) {
    const shrink = [...lockedIds].sort((a, b) => (next.get(b) ?? 0) - (next.get(a) ?? 0))
    for (const id of shrink) {
      if (overflow <= 0) break
      const cur = next.get(id) ?? minEach
      const take = Math.min(overflow, cur - minEach)
      next.set(id, cur - take)
      overflow -= take
    }
    lockedSum = lockedIds.reduce((s, id) => s + (next.get(id) ?? minEach), 0)
  }

  if (unlockedIds.length === 0) {
    const extra = days - lockedSum
    if (extra !== 0) {
      const id = [...lockedIds].sort((a, b) => hoursOf(b) - hoursOf(a))[0]
      if (id) next.set(id, Math.max(minEach, (next.get(id) ?? minEach) + extra))
    }
  } else {
    for (const id of unlockedIds) next.set(id, minEach)
    let remaining = days - lockedSum - unlockedIds.length
    const extras = unlockedIds.map((id) => Math.max(0, (counts.get(id) ?? minEach) - minEach))
    const extraSum = extras.reduce((s, n) => s + n, 0)
    const hourW = unlockedIds.map((id) => hoursOf(id) + 0.1)
    const hourSum = hourW.reduce((s, n) => s + n, 0)
    const raw = unlockedIds.map((_, i) => {
      const w = extraSum > 0 ? extras[i] / extraSum : hourW[i] / hourSum
      return w * Math.max(0, remaining)
    })
    const floors = raw.map((x) => Math.floor(x + 1e-9))
    floors.forEach((f, i) => {
      next.set(unlockedIds[i], minEach + f)
      remaining -= f
    })
    const fracOrder = unlockedIds
      .map((id, i) => ({ id, frac: raw[i] - floors[i] }))
      .sort((a, b) => b.frac - a.frac)
    for (const { id } of fracOrder) {
      if (remaining <= 0) break
      next.set(id, (next.get(id) ?? minEach) + 1)
      remaining -= 1
    }
  }

  const ordered = new Map<PlaceId, number>()
  for (const id of orderedIds) ordered.set(id, next.get(id) ?? counts.get(id) ?? minEach)
  return ordered
}

export function buildTripLevelIssues(opts: {
  isEmpty: boolean
  thinCities: RouteThinStop[]
  visitedPlaceIds: PlaceId[]
  daysCount: number
  dismissed: Set<string>
}): TripIssue[] {
  const issues: TripIssue[] = []
  const { dismissed } = opts

  if (opts.isEmpty) return issues

  for (const stop of opts.thinCities) {
    const id = `thin-city-${stop.region}`
    if (dismissed.has(id)) continue
    issues.push({
      id,
      severity: 'info',
      scope: 'trip',
      title: `${stop.city} looks light`,
      detail: `${stop.nights} night${stop.nights === 1 ? '' : 's'} with only ${stop.selectedCount} experience${stop.selectedCount === 1 ? '' : 's'} selected.`,
    })
  }

  for (const placeId of suggestMissingCoreCities(opts.visitedPlaceIds, opts.daysCount)) {
    const id = `core-city-${placeId}`
    if (dismissed.has(id)) continue
    const meta = CORE_NOTE[placeId]
    if (!meta) continue
    issues.push({
      id,
      severity: 'info',
      scope: 'trip',
      title: `Worth a thought: ${meta.label}`,
      detail: meta.line,
    })
  }

  return issues.slice(0, 6)
}

export function lightDaySuggestions(
  region: string,
  selectedIds: Set<string>,
  limit = 2,
): SuggestedExperience[] {
  return suggestExperiencesForCity(region, selectedIds, limit)
}

export type CatalogAdd = {
  kind: 'experience' | 'activity' | 'restaurant'
  id: string
  name: string
  tag: string
  reason: string
  costLabel: string
  durationLabel?: string
}

export function rankCatalogForCity(
  placeId: PlaceId,
  selectedExpIds: Set<string>,
  selectedActIds: Set<string>,
  selectedRestIds: Set<string>,
  shape: TripShapeInput,
  preferredPeriod?: PeriodId,
): CatalogAdd[] {
  const out: Array<CatalogAdd & { score: number }> = []

  for (const e of EXPERIENCES) {
    if (selectedExpIds.has(e.id)) continue
    if (ACTIVITY_OWNED_SIGHT_IDS.has(e.id)) continue
    if (!placeMatches(e.city, e.region, placeId)) continue
    if (shape.holidayKind === 'leisure' && walkingIntensityOf(e) >= 5) continue
    let score = scoreExperienceForTrip(e, shape)
    if (preferredPeriod && bestPeriod(e) === preferredPeriod) score += 8
    out.push({
      kind: 'experience',
      id: e.id,
      name: e.name,
      tag: e.popularityTag,
      reason: e.hook,
      costLabel: e.costLabel,
      durationLabel: e.durationLabel,
      score,
    })
  }

  for (const a of CITY_ACTIVITIES) {
    if (selectedActIds.has(a.id)) continue
    if (!placeMatches(a.cityName, a.cityId, placeId)) continue
    out.push({
      kind: 'activity',
      id: a.id,
      name: a.name,
      tag: a.popularityTag,
      reason: a.hook,
      costLabel: a.priceLabel,
      durationLabel: a.durationLabel,
      score: scoreActivityForTrip(a, shape),
    })
  }

  for (const r of RESTAURANTS) {
    if (selectedRestIds.has(r.id)) continue
    if (!placeMatches(r.city, r.region, placeId)) continue
    let score = 12 + r.rating
    if (shape.holidayKind === 'culture-food') score += 10
    if (shape.band === 'tight' && r.priceUsd > 15) score -= 8
    out.push({
      kind: 'restaurant',
      id: r.id,
      name: r.name,
      tag: r.cuisine,
      reason: r.blurb,
      costLabel: r.priceLabel,
      score,
    })
  }

  return out.sort((a, b) => b.score - a.score).slice(0, 18)
}

export function restaurantsForPlace(placeId: PlaceId) {
  const pb = RESTAURANTS.filter((r) => placeMatches(r.city, r.region, placeId)).map((r) => ({
    ...r,
    source: 'plan' as const,
  }))
  const taste = TASTE_RESTAURANTS.filter((r) => placeMatches(r.city, r.city, placeId)).map((r) => ({
    id: r.id,
    name: r.name,
    region: r.city,
    city: r.city,
    cuisine: r.neighborhood,
    seed: r.id,
    rating: r.rating,
    priceUsd: r.priceLevel === 1 ? 5 : r.priceLevel === 2 ? 12 : r.priceLevel === 3 ? 22 : 40,
    priceLabel: '$'.repeat(r.priceLevel),
    hours: r.openingHours,
    blurb: r.menuOrReviews,
    nearExperienceIds: [] as string[],
    address: r.address,
    image: r.images[0],
    source: 'taste' as const,
  }))
  const seen = new Set(pb.map((r) => r.name.toLowerCase()))
  return [...pb, ...taste.filter((r) => !seen.has(r.name.toLowerCase()))]
}

export { hourBudgetForTrip, perDayCapacityForKind, addCapForKind }
