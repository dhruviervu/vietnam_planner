import type { TravelStyle } from '../../types'
import type { DailyBand } from './holidayKind'
import { DAY_CLOSE, parseDayStart } from './dayWindows'

/**
 * Single source of truth for how the traveller's answers change the schedule.
 * Pace sets how many hours of sights a day may hold, budget sets how fast they
 * get between them, and group size sets how long each hand-over takes.
 */

/**
 * Hours of sight duration a single day may hold, by pace.
 * Action (packed): 6–8h. Relaxed: 3–5h. Balanced stays in the middle.
 */
export const PACE_DAY_HOURS: Record<TravelStyle, number> = {
  relaxed: 5,     // relaxed: 3-5h of sights, cap at 5
  balanced: 7,    // balanced: middle ground
  packed: 8,      // action: 6-8h of sights, cap at 8
}

/** Floor we try to fill toward from leftover / Doesn't Fit sights. */
export const PACE_DAY_HOURS_MIN: Record<TravelStyle, number> = {
  relaxed: 3,     // relaxed: minimum 3h sights
  balanced: 5,    // balanced: minimum 5h
  packed: 6,      // action: minimum 6h sights
}

/** Fixed meal windows — sights may not run through these clocks. */
export const MEAL_BREAKS = {
  breakfast: { start: 8, duration: 1.5, label: 'Breakfast' },
  lunch: { start: 13, duration: 1, label: 'Lunch' },
  evening: { start: 17.5, duration: 1, label: 'Evening meal' },
  dinner: { start: 19.5, duration: 1, label: 'Dinner' },
} as const

export type MealBreak = keyof typeof MEAL_BREAKS

function clockHm(hours: number): string {
  const total = Math.round((((hours % 24) + 24) % 24) * 60)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function mealWindowLabel(key: MealBreak): string {
  const meal = MEAL_BREAKS[key]
  return `${clockHm(meal.start)}–${clockHm(meal.start + meal.duration)}`
}

export const PACE_LABEL: Record<TravelStyle, string> = {
  relaxed: 'Relaxed',
  balanced: 'Moderate',
  packed: 'Action-Packed',
}

/**
 * Door-to-door travel scales with how the traveller gets around: a tight daily
 * budget means walking and public transit, a comfortable one means taxis and
 * private transfers over the same distance.
 */
export const TRANSIT_MULTIPLIER: Record<DailyBand, number> = {
  tight: 1.35,
  mid: 1,
  comfortable: 0.78,
}

/**
 * Regrouping, ordering and paying all take longer with more people.
 * Anything above four travellers adds a quarter hour between stops.
 */
export function groupBufferHours(groupSize: number): number {
  const people = Math.max(1, Math.round(groupSize) || 1)
  if (people <= 4) return 0
  if (people <= 8) return 15 / 60
  return 25 / 60
}

/** Sit-down stops lose the most time to a big group, so they get a longer tail. */
export function mealBufferHours(groupSize: number): number {
  return groupBufferHours(groupSize) * 2
}

export type PlanningProfile = {
  /** Hours of sight duration one day may hold. Drives every capacity decision. */
  dayMaxHours: number
  /** Try to fill at least this many sight hours before leaving a day sparse. */
  dayMinHours: number
  /** Clock hour the day begins, from `userStartTime`. */
  dayStart: number
  /** Latest clock a stop may end at. */
  dayEnd: number
  /** Scales door-to-door travel time between stops. */
  transitMultiplier: number
  /** Added between consecutive stops for group hand-over. */
  groupBuffer: number
  /** Added after a meal-style stop instead of `groupBuffer`. */
  mealBuffer: number
  pace: TravelStyle
  groupSize: number
}

export const DEFAULT_PROFILE: PlanningProfile = {
  dayMaxHours: PACE_DAY_HOURS.balanced,
  dayMinHours: PACE_DAY_HOURS_MIN.balanced,
  dayStart: parseDayStart(),
  dayEnd: DAY_CLOSE,
  transitMultiplier: 1,
  groupBuffer: 0,
  mealBuffer: 0,
  pace: 'balanced',
  groupSize: 2,
}

export function planningProfile(opts: {
  pace?: TravelStyle
  /** "HH:MM" — the `userStartTime` state. */
  userStartTime?: string
  band?: DailyBand
  groupSize?: number
  dayEnd?: number
}): PlanningProfile {
  const pace = opts.pace ?? 'balanced'
  const groupSize = Math.max(1, Math.round(opts.groupSize ?? 2) || 1)
  return {
    dayMaxHours: PACE_DAY_HOURS[pace] ?? PACE_DAY_HOURS.balanced,
    dayMinHours: PACE_DAY_HOURS_MIN[pace] ?? PACE_DAY_HOURS_MIN.balanced,
    dayStart: parseDayStart(opts.userStartTime),
    dayEnd: opts.dayEnd ?? DAY_CLOSE,
    transitMultiplier: TRANSIT_MULTIPLIER[opts.band ?? 'mid'] ?? 1,
    groupBuffer: groupBufferHours(groupSize),
    mealBuffer: mealBufferHours(groupSize),
    pace,
    groupSize,
  }
}