import { EXPERIENCES } from '../../data/experiences'
import { EXPLORE_CITIES } from '../../data/exploreCities'
import type { Experience, TravelStyle } from '../../types'
import type { TripIssue } from './types'
import { experiencesUrl, whereToStayUrl, gettingAroundUrl } from './links'

export type SuggestedExperience = {
  id: string
  name: string
  tag: string
  reason: string
  city: string
  region: string
}

/** Higher = stronger keep-as-core signal for a packed day. */
export function experiencePriority(e: Experience): number {
  let score = 120 - (e.popularityRank ?? 50)
  if (e.signal === 'must-do') score += 42
  if (e.vietnamBest) score += 28
  if (e.signal === 'vietnam-special') score += 16
  if (e.signal === 'adventure' || e.signal === 'picture-perfect') score += 8
  if (e.featured) score += 10
  // Slight penalty for very long items when choosing what stays “core”
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

/**
 * Popular / must-do / unique picks for a city the traveller under-filled.
 */
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

export type OptionalDecision = {
  id: string
  reason: string
  preferredId?: string
  preferredName?: string
}

/**
 * Given a day’s experiences (+ optional activity ids), mark lower-priority
 * overflow as optional with a comparative reason vs a stronger keep.
 */
export function decideOptionalItems(
  dayExperiences: Experience[],
  activityHours: number,
  capacity: number,
  style: TravelStyle,
): Map<string, OptionalDecision> {
  const result = new Map<string, OptionalDecision>()
  if (dayExperiences.length === 0) return result

  const ranked = [...dayExperiences].sort(
    (a, b) => experiencePriority(b) - experiencePriority(a),
  )
  const budget = hourBudget(style)
  let usedHours = activityHours
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
}

export function findThinCities(
  route: { city: string; region: string; nights: number; experiences: number }[],
  selectedExperienceIds: string[],
  style: TravelStyle,
): RouteThinStop[] {
  const selected = new Set(selectedExperienceIds)
  const thin: RouteThinStop[] = []

  for (const stop of route) {
    if (stop.nights < 2) continue
    const expected = expectedExperiencesForStop(stop.nights, style, stop.region)
    // experiences on route includes activities mixed in build — use catalog count per region
    const regionSelected = EXPERIENCES.filter(
      (e) =>
        selected.has(e.id) && (e.region === stop.region || e.city === stop.city),
    ).length
    if (regionSelected >= expected) continue
    const suggestions = suggestExperiencesForCity(stop.region, selected, 3)
    if (suggestions.length === 0) continue
    thin.push({
      city: stop.city,
      region: stop.region,
      nights: stop.nights,
      selectedCount: regionSelected,
      expected,
      suggestions,
    })
  }
  return thin
}

/**
 * Trip-level flags only — short, obvious, no day-by-day checklist noise.
 */
export function buildTripLevelIssues(opts: {
  isEmpty: boolean
  hasNoStays: boolean
  hotelsCount: number
  thinCities: RouteThinStop[]
  packedDayCount: number
  emptyDayNumbers: number[]
  optionalItemCount: number
  unsetCityTransfers?: Array<{ from: string; to: string; dayNumber: number }>
  dismissed: Set<string>
}): TripIssue[] {
  const issues: TripIssue[] = []
  const { dismissed } = opts

  if (opts.isEmpty) return issues

  if (opts.hasNoStays) {
    const id = 'no-stays'
    if (!dismissed.has(id)) {
      issues.push({
        id,
        severity: 'warn',
        scope: 'trip',
        title: 'Stay not set',
        detail: 'You have plans, but no accommodation in the trip bag yet.',
        actionLabel: 'Explore stays',
        href: whereToStayUrl(),
      })
    }
  }

  const unsetHops = opts.unsetCityTransfers ?? []
  if (unsetHops.length > 0) {
    const id = 'city-transfers-unset'
    if (!dismissed.has(id)) {
      const sample = unsetHops
        .slice(0, 3)
        .map((h) => `${h.from} → ${h.to}`)
        .join('; ')
      const more =
        unsetHops.length > 3 ? ` (+${unsetHops.length - 3} more)` : ''
      issues.push({
        id,
        severity: 'warn',
        scope: 'trip',
        title: 'City transfers not set',
        detail: `${sample}${more}. Choose how you’ll move between cities so travel days don’t surprise you.`,
        actionLabel: 'Set transfers',
        href: gettingAroundUrl(),
        dayNumber: unsetHops[0]?.dayNumber,
      })
    }
  }

  for (const stop of opts.thinCities) {
    const id = `thin-city-${stop.region}`
    if (dismissed.has(id)) continue
    issues.push({
      id,
      severity: 'info',
      scope: 'trip',
      title: `${stop.city} looks light`,
      detail: `${stop.nights} night${stop.nights === 1 ? '' : 's'} with only ${stop.selectedCount} experience${stop.selectedCount === 1 ? '' : 's'} selected — popular picks below are optional adds.`,
      actionLabel: 'Browse experiences',
      href: experiencesUrl(),
      suggestions: stop.suggestions.map((s) => ({
        id: s.id,
        name: s.name,
        tag: s.tag,
        reason: s.reason,
      })),
    })
  }

  if (opts.packedDayCount > 0) {
    const id = 'trip-packed'
    if (!dismissed.has(id)) {
      issues.push({
        id,
        severity: 'warn',
        scope: 'trip',
        title:
          opts.packedDayCount === 1
            ? 'One day looks packed'
            : `${opts.packedDayCount} days look packed`,
        detail:
          opts.optionalItemCount > 0
            ? `We kept everything you chose, but marked ${opts.optionalItemCount} item${opts.optionalItemCount === 1 ? '' : 's'} optional — do those only if you still have time and energy on the day.`
            : 'A few days run long. Scan optional tags day-by-day and drop what feels hectic once you’re there.',
      })
    }
  }

  if (opts.emptyDayNumbers.length > 0) {
    const id = 'trip-empty-days'
    if (!dismissed.has(id)) {
      const sample = opts.emptyDayNumbers.slice(0, 3).map((n) => `Day ${n}`).join(', ')
      const more =
        opts.emptyDayNumbers.length > 3
          ? ` +${opts.emptyDayNumbers.length - 3} more`
          : ''
      issues.push({
        id,
        severity: 'info',
        scope: 'trip',
        title:
          opts.emptyDayNumbers.length === 1
            ? 'One day looks open'
            : `${opts.emptyDayNumbers.length} days look open`,
        detail: `${sample}${more} ${opts.emptyDayNumbers.length === 1 ? 'has' : 'have'} little locked in — fine for rest, or add a must-do if you prefer structure.`,
        actionLabel: 'Add experiences',
        href: experiencesUrl(),
      })
    }
  }

  // Cap length — never a long checklist
  return issues.slice(0, 5)
}

export function lightDaySuggestions(
  region: string,
  selectedIds: Set<string>,
  limit = 2,
): SuggestedExperience[] {
  return suggestExperiencesForCity(region, selectedIds, limit)
}
