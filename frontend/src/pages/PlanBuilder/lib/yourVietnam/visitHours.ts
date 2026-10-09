import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { isTimedLanding, selectionKeyFor, selectionMemo } from './sightPlanning'
import { canonicalSightId, complexFor, isAtomicExclusive } from './sightIntelligence'

/** Parse a catalog visit-time label into hours. "1.5–2 hrs" → { min: 1.5, max: 2 }. */
export function parseDurationRangeHours(
  label?: string,
  fallback = 1.5,
): { min: number; max: number } {
  const raw = (label ?? '').replace(/,/g, '.').trim()
  if (!raw) return { min: fallback, max: fallback }

  const clamp = (n: number) => Math.max(10 / 60, Math.min(14, n))
  const pair = (a: number, b: number) => {
    const min = clamp(Math.min(a, b))
    const max = clamp(Math.max(a, b))
    return { min, max }
  }

  const minSpan = raw.match(/(\d+(?:\.\d+)?)\s*[–\-to]+\s*(\d+(?:\.\d+)?)\s*min/i)
  if (minSpan) return pair(Number(minSpan[1]) / 60, Number(minSpan[2]) / 60)

  const hrSpan = raw.match(
    /(\d+(?:\.\d+)?)\s*[–\-to]+\s*(\d+(?:\.\d+)?)\s*(?:h|hrs?|hours?)\b/i,
  )
  if (hrSpan) return pair(Number(hrSpan[1]), Number(hrSpan[2]))

  const minOnly = raw.match(/(\d+(?:\.\d+)?)\s*min/i)
  if (minOnly) {
    const h = clamp(Number(minOnly[1]) / 60)
    return { min: h, max: h }
  }

  const hrOnly = raw.match(/(\d+(?:\.\d+)?)\s*(?:h|hrs?|hours?)\b/i)
  if (hrOnly) {
    const h = clamp(Number(hrOnly[1]))
    return { min: h, max: h }
  }

  if (/half\s*(?:to|-|–)\s*full/i.test(raw)) return { min: 4, max: 8 }
  if (/full\s*day/i.test(raw)) return { min: 6, max: 8 }
  if (/half\s*day/i.test(raw)) return { min: 3, max: 4 }

  const nums = raw.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? []
  if (nums.length >= 2) return pair(nums[0], nums[1])
  if (nums.length === 1) {
    const h = clamp(nums[0])
    return { min: h, max: h }
  }
  return { min: fallback, max: fallback }
}

/**
 * Booked outings (cruises, classes, day-trips) keep the catalog visit length.
 * Walk-up sights use the lower end of the published range.
 */
export function usesStandardVisitHours(id: string): boolean {
  if (CITY_ACTIVITIES.some((a) => a.id === id)) return true
  if (isAtomicExclusive(id)) return true
  const exp = EXPERIENCES.find((e) => e.id === id)
  if (!exp) return false
  const hours = exp.durationHours || 0
  if (hours >= 10) return true
  if (exp.dna?.includes('FULL DAY') && hours >= 6) return true
  const text = `${exp.name} ${exp.about ?? ''} ${exp.durationLabel ?? ''}`
  return (
    hours >= 6 &&
    /cruise|overnight|full[-\s]?day|day[-\s]?trip|trek|trekking|ha\s?giang|halong|ha long|mekong|snorkel/i.test(
      text,
    )
  )
}

export function catalogLabelForSourceId(id: string): string | undefined {
  return (
    EXPERIENCES.find((e) => e.id === id)?.durationLabel ??
    CITY_ACTIVITIES.find((a) => a.id === id)?.durationLabel
  )
}

/**
 * Visit lengths travellers see: 15 / 20 / 30 min, then 1h, 1.5h, 2h, …
 * Never leave 18 min or other leftover-window scraps on the board.
 */
export function snapVisitHours(hours: number): number {
  const raw = Number.isFinite(hours) ? hours : 0.5
  const mins = Math.max(15, raw * 60)
  if (mins < 52.5) {
    const steps = [15, 20, 30]
    let best = steps[0]
    let dist = Math.abs(mins - best)
    for (const step of steps) {
      const d = Math.abs(mins - step)
      if (d < dist - 0.01) {
        best = step
        dist = d
      }
    }
    return best / 60
  }
  const snapped = Math.round(mins / 30) * 30
  return Math.max(60, snapped) / 60
}

/** Parent island/cable card when a real park on that outing is also selected. */
export function isAccessShell(id: string, selectedIds: string[]): boolean {
  const complex = complexFor(id)
  if (!complex) return false
  if (canonicalSightId(id) !== canonicalSightId(complex.parentId)) return false
  const selected = new Set(selectedIds.map(canonicalSightId))
  return complex.members.some((member) => {
    if (canonicalSightId(member.id) === canonicalSightId(complex.parentId)) return false
    if (member.soft) return false
    if (!selected.has(canonicalSightId(member.id))) return false
    const hours = EXPERIENCES.find((e) => e.id === member.id)?.durationHours ?? 0
    return hours >= 6
  })
}

const VISIT_MEMO = new Map<string, number>()

export function defaultVisitHours(id: string, selectedIds: string[] = [], catalogHours: number): number {
  return selectionMemo(id, selectedIds, `visit:${catalogHours}`, () => memoVisitHours(id, selectedIds, catalogHours))
}

function memoVisitHours(id: string, selectedIds: string[], catalogHours: number): number {
  const key = `${catalogHours}\u0001${selectionKeyFor(id, selectedIds)}`
  const hit = VISIT_MEMO.get(key)
  if (hit !== undefined) return hit
  if (VISIT_MEMO.size > 50_000) VISIT_MEMO.clear()
  const out = computeVisitHours(id, selectedIds, catalogHours)
  VISIT_MEMO.set(key, out)
  return out
}

function computeVisitHours(id: string, selectedIds: string[], catalogHours: number): number {
  if (isTimedLanding(id, selectedIds)) return snapVisitHours(20 / 60)
  if (isAccessShell(id, selectedIds)) return snapVisitHours(0.5)
  const label = catalogLabelForSourceId(id)
  const range = parseDurationRangeHours(label, catalogHours)
  const complex = complexFor(id)
  const exclusiveOuting =
    isAtomicExclusive(id) ||
    Boolean(complex?.exclusive && (complex.access === 'boat' || complex.access === 'day-trip' || complex.access === 'trek'))
  if (exclusiveOuting && range.max > catalogHours + 0.05) {
    return snapVisitHours(range.max)
  }
  return snapVisitHours(Math.max(15 / 60, catalogHours))
}
