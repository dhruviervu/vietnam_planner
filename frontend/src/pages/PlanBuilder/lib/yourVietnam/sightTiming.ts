import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES, type CityActivity } from '../../data/activities'
import { SHOPPING_ITEMS } from '../../data/shopping'
import type { Experience, TimePreference } from '../../types'
import type { ItineraryItem } from './types'
import { sightPlanning } from './sightPlanning'
import { canonicalSightId } from './sightIntelligence'
import {
  DAYLIGHT_END,
  DAY_CLOSE,
  EVENING_EARLIEST_START,
} from './dayWindows'

export type { TimePreference }

/**
 * Time-of-day and duplicate-variant rules for catalog sights.
 *
 * Both are read from the catalog first (`timePreference` / `groupId`) and only
 * derived from the sight's own wording when the data does not say. That keeps a
 * single explicit tag authoritative while still classifying the whole catalog.
 */

const EVENING_RE =
  /lantern|night market|night walk|sunset|dusk|nightlife|bia.?hoi|beer|bar |rooftop|evening|by night|after dark|water puppet|show$/i
const MORNING_RE = /sunrise|dawn|breakfast|early morning|\bmorning\b|morning market|floating market/i
const DAYLIGHT_RE =
  /basket boat|eco.?tour|coconut|snorkel|dive|kayak|paddle|beach|cycling|bike|trek|hike|rice (field|paddy)|farm|buffalo|waterfall|cave|island|boat trip|day trip/i

function preferenceFromWording(name: string, extra = ''): TimePreference {
  const blob = `${name} ${extra}`
  const evening = EVENING_RE.test(blob)
  const morning = MORNING_RE.test(blob)
  if (evening && !morning) return 'EVENING'
  if (morning && !evening) return 'MORNING'
  if (morning && evening) return 'ANY'
  if (DAYLIGHT_RE.test(blob)) return 'AFTERNOON'
  return 'ANY'
}

/** "Hoi An Ancient Town Evening" -> "hoi-an-ancient-town": variants collapse together. */
function groupIdFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Drop the time-of-day and format words that distinguish variants of one place,
    // so "Hoi An Ancient Town (Day)" and "... Evening" collapse to one group.
    .replace(
      /\b(evening|morning|afternoon|night|day|daytime|sunset|sunrise|by night|after dark|tour|experience|visit|section|half|full)\b/g,
      ' ',
    )
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const expById = new Map<string, Experience>(EXPERIENCES.map((e) => [e.id, e]))
const actById = new Map<string, CityActivity>(CITY_ACTIVITIES.map((a) => [a.id, a]))
const shopById = new Map(SHOPPING_ITEMS.map((s) => [s.id, s]))

export function timePreferenceForSourceId(id: string): TimePreference {
  const exp = expById.get(id)
  if (exp) {
    return exp.timePreference ?? preferenceFromWording(exp.name, `${exp.category} ${exp.bestTime}`)
  }
  const act = actById.get(id)
  if (act) {
    return act.timePreference ?? preferenceFromWording(act.name, `${act.kind} ${act.bestTime}`)
  }
  const shop = shopById.get(id)
  if (shop) {
    if (shop.preferredPeriod === 'evening') return 'EVENING'
    if (shop.preferredPeriod === 'morning') return 'MORNING'
    if (shop.preferredPeriod === 'afternoon') return 'AFTERNOON'
    return preferenceFromWording(shop.name, `${shop.type} ${shop.blurb}`)
  }
  return 'ANY'
}

export function groupIdForSourceId(id: string): string {
  const canon = canonicalSightId(id)
  const exp = expById.get(canon) ?? expById.get(id)
  if (exp) return exp.groupId ?? groupIdFromName(exp.name)
  const act = actById.get(canon) ?? actById.get(id)
  if (act) return act.groupId ?? groupIdFromName(act.name)
  return canon
}

export function timePreferenceForItem(item: ItineraryItem): TimePreference {
  if (item.sourceId) return timePreferenceForSourceId(item.sourceId)
  return 'ANY'
}

export function groupIdForItem(item: ItineraryItem): string {
  if (item.sourceId) return groupIdForSourceId(item.sourceId)
  return item.id
}

export function bestPeriodForSourceId(
  id: string,
): 'morning' | 'afternoon' | 'evening' | 'any' {
  const ctx = sightPlanning(id)
  const pref = timePreferenceForSourceId(id)
  const exp = expById.get(id)
  const when = `${ctx.bestWhen} ${exp?.bestTime ?? ''}`.toLowerCase()
  const sq = exp?.slotQuality ?? { morning: 3, afternoon: 3, evening: 3 }

  const morningHint = /morning|dawn|sunrise|early/i.test(when)
  const afternoonHint = /afternoon|midday|late afternoon/i.test(when)
  const eveningOnly = /lantern|night market|after dark|by night|nightlife|bia.?hoi/i.test(when)
  const duskHint = /dusk|sunset|evening/i.test(when)

  if ((pref === 'EVENING' || eveningOnly) && !morningHint && !afternoonHint) return 'evening'

  const morning = sq.morning + (morningHint ? 2 : 0)
  const afternoon = sq.afternoon + (afternoonHint ? 2 : 0)
  const evening = sq.evening + (duskHint && !morningHint ? 1 : 0) + (eveningOnly ? 2 : 0)

  if (evening >= 6 && evening > morning + 0.5 && evening > afternoon + 0.5) return 'evening'
  if (morning >= afternoon && morning >= evening - 0.5 && morning >= 4) {
    if (morningHint && !afternoonHint) return 'morning'
    if (morning > afternoon && morning > evening) return 'morning'
  }
  if (afternoon >= morning && afternoon >= 4) return 'afternoon'
  if (morning >= 4 && morning >= afternoon) return 'morning'
  if (pref === 'MORNING') return 'morning'
  if (pref === 'AFTERNOON') return 'afternoon'
  return 'any'
}

export function bestPeriodForItem(item: ItineraryItem): 'morning' | 'afternoon' | 'evening' | 'any' {
  if (item.sourceId) return bestPeriodForSourceId(item.sourceId)
  return 'any'
}

/** True when a morning-tagged sight can still sit after lunch without fighting its context. */
export function canFlexToAfternoon(id: string): boolean {
  const sq = expById.get(id)?.slotQuality
  if (!sq) return true
  return sq.afternoon >= 3
}

/**
 * The clock range a sight of this preference may occupy. EVENING is held past
 * 17:30; MORNING and AFTERNOON are kept inside daylight so eco-tours and boat
 * rides never land at dusk.
 */
export function allowedWindowFor(
  pref: TimePreference,
  dayStart: number,
  dayEnd: number = DAY_CLOSE,
): { earliest: number; latest: number } {
  if (pref === 'EVENING') {
    return { earliest: Math.max(dayStart, EVENING_EARLIEST_START), latest: dayEnd }
  }
  return { earliest: dayStart, latest: dayEnd }
}

/** True when a sight placed at this start time is at odds with its context. */
export function timePreferenceViolation(
  pref: TimePreference,
  startHour: number,
  endHour: number,
  sourceId?: string,
): string | null {
  if (pref === 'EVENING' && startHour < EVENING_EARLIEST_START - 0.01) {
    return 'Better after 17:30 — this one is at its best in the evening.'
  }
  if ((pref === 'MORNING' || pref === 'AFTERNOON') && endHour > DAYLIGHT_END + 0.01) {
    return 'Better in daylight — this one wants to finish by 17:00.'
  }
  if (pref === 'MORNING' && startHour >= 12) {
    if (sourceId && canFlexToAfternoon(sourceId) && startHour < 17) return null
    return 'Better in the morning.'
  }
  return null
}
