import { formatClock, roundToNearestMinutes } from './clockTimes'
import { DAY_CLOSE } from './dayWindows'
import { earliestOpenAt, visitDeadline, type PlaceHours } from './openingHours'

export function parseClockHourLoose(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hours = Number(m[1]) + Number(m[2]) / 60
  if (!Number.isFinite(hours) || hours < 0 || hours >= 24) return null
  return hours
}

export function sightStartBounds(opts: {
  currentStartHour: number
  durationHours: number
  hours: PlaceHours
  arriveHour: number
  dayStartHour: number
  dayEndHour: number
  lastSightEndHour: number
}): { minHour: number; maxHour: number } {
  const duration = Math.max(15 / 60, Number.isFinite(opts.durationHours) ? opts.durationHours : 1)
  const arrive = Number.isFinite(opts.arriveHour) ? opts.arriveHour : opts.dayStartHour
  const dayStart = Number.isFinite(opts.dayStartHour) ? opts.dayStartHour : 9
  const dayEnd = Number.isFinite(opts.dayEndHour) ? opts.dayEndHour : DAY_CLOSE
  const currentStart = Number.isFinite(opts.currentStartHour) ? opts.currentStartHour : dayStart
  const lastEnd = Number.isFinite(opts.lastSightEndHour) ? opts.lastSightEndHour : currentStart + duration
  const openAt = earliestOpenAt(opts.hours, arrive, duration, dayEnd)
  const earliest = Number.isFinite(openAt)
    ? Math.max(dayStart, arrive, openAt)
    : Math.max(dayStart, arrive)
  const closeBy = visitDeadline(opts.hours, dayEnd)
  const slack = Math.max(0, dayEnd - lastEnd)
  const latest = Math.min(
    (Number.isFinite(closeBy) ? closeBy : dayEnd) - duration,
    currentStart + slack,
  )
  const minHour = roundToNearestMinutes(Number.isFinite(earliest) ? earliest : currentStart)
  const maxHour = roundToNearestMinutes(
    Math.max(minHour, Number.isFinite(latest) ? latest : currentStart),
  )
  const current = roundToNearestMinutes(currentStart)
  if (!Number.isFinite(minHour) || !Number.isFinite(maxHour) || maxHour < minHour) {
    return { minHour: current, maxHour: current }
  }
  return {
    minHour: Math.min(minHour, DAY_CLOSE - 15 / 60),
    maxHour: Math.min(maxHour, DAY_CLOSE - 15 / 60),
  }
}

export function clampHhmmToBounds(hhmm: string, minHour: number, maxHour: number): string {
  const parsed = parseClockHourLoose(hhmm)
  if (parsed == null) return formatClock(minHour)
  const clamped = Math.min(maxHour, Math.max(minHour, parsed))
  return formatClock(roundToNearestMinutes(clamped))
}
