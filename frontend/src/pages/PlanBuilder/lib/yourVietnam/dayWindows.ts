import type { PeriodId } from './types'

/** Clock windows the crafted itinerary must fit into. */
export const PERIOD_WINDOW: Record<PeriodId, { start: number; end: number }> = {
  morning: { start: 8, end: 13 },
  afternoon: { start: 13, end: 17.5 },
  evening: { start: 17.5, end: 19.5 },
  night: { start: 19.5, end: 24 },
}

/**
 * A sight tagged EVENING (night markets, lanterns, sunset spots) may not start
 * before this, even though the Evening block label opens at 16:00.
 */
export const EVENING_EARLIEST_START = 17.5

/** Daylight sights (eco-tours, basket boats) must run inside these hours. */
export const DAYLIGHT_START = 9
export const DAYLIGHT_END = 17

export const PERIOD_FLOW: PeriodId[] = ['morning', 'afternoon', 'evening']

/** Sights are only ever scheduled inside this clock window — never past 22:00. */
export const DAY_OPEN = 9
export const DAY_CLOSE = 22

/** Default last-sight end when a traveller sets a hard cap. Unset means the day ends with the last visit. */
export const DEFAULT_DAY_END = 22

/** Default value of the user-adjustable `userStartTime`. */
export const DEFAULT_DAY_START_TIME = '09:00'

/** Start times offered in the itinerary UI. */
export const DAY_START_CHOICES = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00']

/** Last-sight end times offered in itinerary settings. */
export const DAY_LAST_SIGHT_END_CHOICES = [
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
]

/** "09:30" -> 9.5. Falls back to DAY_OPEN for anything unparseable. */
export function parseDayStart(value?: string | null): number {
  if (!value) return DAY_OPEN
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return DAY_OPEN
  const hours = Number(m[1]) + Number(m[2]) / 60
  if (!Number.isFinite(hours) || hours < 0 || hours >= DAY_CLOSE) return DAY_OPEN
  return hours
}

/** "18:00" -> 18. Returns null when unset or invalid. */
export function parseDayEndHour(value?: string | null): number | null {
  if (!value) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hours = Number(m[1]) + Number(m[2]) / 60
  if (!Number.isFinite(hours) || hours <= DAY_OPEN || hours > DAY_CLOSE) return null
  return hours
}
