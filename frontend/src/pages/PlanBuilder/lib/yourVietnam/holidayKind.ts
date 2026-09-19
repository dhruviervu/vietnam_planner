import type { HolidayKind, TravelStyle } from '../../types'

export type DailyBand = 'tight' | 'mid' | 'comfortable'

export const HOLIDAY_KIND_META: Record<
  HolidayKind,
  { label: string; line: string }
> = {
  action: {
    label: 'Action / sightseeing',
    line: 'See as much as you can — denser days, stronger add-ons.',
  },
  leisure: {
    label: 'Relaxation / leisure',
    line: 'Two or three sights a day, plus meals — leave room to breathe.',
  },
  'culture-food': {
    label: 'Relaxation / leisure',
    line: 'Two or three sights a day, plus meals — leave room to breathe.',
  },
}

export function holidayKindFromStyle(style: TravelStyle): HolidayKind {
  if (style === 'packed') return 'action'
  return 'leisure'
}

export function styleFromHolidayKind(kind: HolidayKind): TravelStyle {
  if (kind === 'leisure') return 'relaxed'
  if (kind === 'action') return 'packed'
  return 'balanced'
}

export function dailySpendBand(dailyUsd: number): DailyBand {
  if (dailyUsd <= 35) return 'tight'
  if (dailyUsd >= 70) return 'comfortable'
  return 'mid'
}

export function hourBudgetForTrip(kind: HolidayKind, _band: DailyBand): number {
  // Sightseeing-only hours per day. Action: 6–8h. Relaxed/leisure: 3–5h.
  return kind === 'action' ? 8 : 5
}

export function perDayCapacityForKind(kind: HolidayKind): number {
  return kind === 'action' ? 6 : 4
}

export function addCapForKind(kind: HolidayKind): number {
  return kind === 'action' ? 5 : 2
}

export function effectiveDailyUsd(opts: {
  budgetAllocationKnown: boolean
  budgetDailyUsd: number
  budgetKnown: boolean
  budgetTarget: number
  budgetMode: 'per-person' | 'total'
  days: number
  groupSize: number
}): number {
  if (opts.budgetAllocationKnown) return Math.max(0, opts.budgetDailyUsd)
  if (!opts.budgetKnown) return 50
  const days = Math.max(1, opts.days)
  const people = Math.max(1, opts.groupSize)
  if (opts.budgetMode === 'per-person') return Math.round(opts.budgetTarget / days)
  return Math.round(opts.budgetTarget / days / people)
}

export function effectiveHolidayKind(opts: {
  holidayKindKnown: boolean
  holidayKind: HolidayKind
  paceKnown: boolean
  travelStyle: TravelStyle
}): HolidayKind {
  const raw = opts.holidayKindKnown
    ? opts.holidayKind
    : opts.paceKnown
      ? holidayKindFromStyle(opts.travelStyle)
      : opts.holidayKind
  return raw === 'action' ? 'action' : 'leisure'
}
