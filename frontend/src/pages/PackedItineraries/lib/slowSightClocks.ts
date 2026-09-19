import { getExperienceById } from '../../PlanBuilder/data/experiences'
import { getActivityById } from '../../PlanBuilder/data/activities'
import { bucketFromStart, formatClock } from '../../PlanBuilder/lib/yourVietnam/clockTimes'
import { DAY_CLOSE, EVENING_EARLIEST_START, parseDayStart } from '../../PlanBuilder/lib/yourVietnam/dayWindows'
import {
  catalogHoursForSource,
  earliestOpenAt,
  sightClosedAtTime,
  tripIsoDate,
  weekdayFromIso,
} from '../../PlanBuilder/lib/yourVietnam/openingHours'
import { timePreferenceForSourceId } from '../../PlanBuilder/lib/yourVietnam/sightTiming'
import type { PeriodId } from '../../PlanBuilder/lib/yourVietnam/types'
import type { PackedTemplate } from '../data/catalogTypes'
import { dwellHoursFor, independentUnhurriedStops, RELAXED_DAY_START, SLOW_GAP_HOURS } from './themeStayPack'

/** Floor idle time between two slow sights. */
export const SLOW_GAP_MIN_HOURS = 2
/** Preferred idle time. Opening hours can stretch this a little. */
export const SLOW_GAP_MAX_HOURS = 4

function kindOf(id: string): 'experience' | 'activity' | 'shopping' {
  if (getExperienceById(id)) return 'experience'
  if (getActivityById(id)) return 'activity'
  return 'shopping'
}

function dwellOf(id: string) {
  return Math.max(0.75, dwellHoursFor(id))
}

function floorStart(id: string, after: number): number {
  const pref = timePreferenceForSourceId(id)
  if (pref === 'EVENING') return Math.max(after, EVENING_EARLIEST_START)
  return Math.max(after, RELAXED_DAY_START)
}

function openStart(id: string, after: number, weekday: number): number {
  const hours = catalogHoursForSource(kindOf(id), id, weekday)
  const dur = dwellOf(id)
  const want = floorStart(id, after)
  let start = earliestOpenAt(hours, want, dur, DAY_CLOSE)
  if (!Number.isFinite(start)) {
    start = earliestOpenAt(hours, Math.max(RELAXED_DAY_START, want - (SLOW_GAP_HOURS - SLOW_GAP_MIN_HOURS)), dur, DAY_CLOSE)
  }
  if (!Number.isFinite(start) || hours.closedToday) return want
  if (sightClosedAtTime(hours, start)) return want
  return Math.max(start, RELAXED_DAY_START)
}

function idleHours(prevStart: number, prevId: string, nextStart: number) {
  return nextStart - (prevStart + dwellOf(prevId))
}

/** Pin each unhurried sight so the next cannot start until 2–4 idle hours later, still inside opening hours. */
export function slowStartOverridesForDay(ids: string[], weekday = 3): Record<string, string> {
  const out: Record<string, string> = {}
  const independents = independentUnhurriedStops(ids)
  let after = RELAXED_DAY_START
  let prevId = ''
  let prevStart = RELAXED_DAY_START
  for (const id of independents) {
    if (!id) continue
    let start = openStart(id, after, weekday)
    if (prevId) {
      const idle = idleHours(prevStart, prevId, start)
      if (idle > SLOW_GAP_MAX_HOURS + 0.05) {
        const pulled = openStart(id, prevStart + dwellOf(prevId) + SLOW_GAP_MIN_HOURS, weekday)
        if (idleHours(prevStart, prevId, pulled) <= SLOW_GAP_MAX_HOURS + 0.08) start = pulled
      }
    }
    out[id] = formatClock(start)
    prevId = id
    prevStart = start
    after = start + dwellOf(id) + SLOW_GAP_HOURS
  }
  return out
}

export function slowStartOverridesForTemplate(template: PackedTemplate, startDate = ''): Record<string, string> {
  if (template.pace !== 'slow' && template.pace !== 'relaxed') return {}
  const out: Record<string, string> = {}
  template.dayPlans.forEach((day, i) => {
    const weekday = startDate ? weekdayFromIso(tripIsoDate(startDate, i + 1)) : 3
    Object.assign(out, slowStartOverridesForDay(day.sourceIds, weekday))
  })
  return out
}

export function slowSlotOverridesFromClocks(clocks: Record<string, string>): Record<string, PeriodId> {
  const out: Record<string, PeriodId> = {}
  for (const [id, clock] of Object.entries(clocks)) {
    out[id] = bucketFromStart(parseDayStart(clock))
  }
  return out
}
