import type { MonthId } from './months'
import { MONTH_PROFILES } from './months'

export type EventSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'year-round'

export const EVENT_SEASONS: EventSeason[] = [
  'spring',
  'summer',
  'autumn',
  'winter',
  'year-round',
]

export const SEASON_MONTHS: Record<EventSeason, MonthId[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10],
  winter: [11, 12, 1, 2],
  'year-round': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export const SEASON_META: Record<
  EventSeason,
  { id: EventSeason; filterLabel: string; title: string; intro: string; symbol: string }
> = {
  spring: {
    id: 'spring',
    filterLabel: 'Spring',
    title: 'Spring Festivals',
    symbol: '🌸',
    intro:
      'March through May is Vietnam’s most comfortable nationwide window — heritage days, highland gatherings, and pilgrimages before summer rain builds.',
  },
  summer: {
    id: 'summer',
    filterLabel: 'Summer',
    title: 'Summer Events',
    symbol: '☀️',
    intro:
      'June through August is wet, green, and festival-light on the coast — fireworks, sea festivals, and Vu Lan ceremonies carry the season.',
  },
  autumn: {
    id: 'autumn',
    filterLabel: 'Autumn',
    title: 'Autumn Festivals',
    symbol: '🍁',
    intro:
      'September and October clear after the rains — Mid-Autumn lanterns, Cham Kate rites, and returning Hoi An full-moon nights.',
  },
  winter: {
    id: 'winter',
    filterLabel: 'Winter',
    title: 'Winter Events',
    symbol: '❄️',
    intro:
      'November through February is Vietnam’s classic dry, festive stretch — Lunar New Year, lantern evenings, Khmer moon rites, and peak travel weather.',
  },
  'year-round': {
    id: 'year-round',
    filterLabel: 'Year round',
    title: 'Year Round cultural performances/events',
    symbol: '🎭',
    intro:
      'Lantern nights, folk opera, court music, and water puppetry run throughout the year — rain-proof culture and monthly rites in every travel month.',
  },
}

export function monthToSeason(month: MonthId): Exclude<EventSeason, 'year-round'> {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month === 9 || month === 10) return 'autumn'
  return 'winter'
}

export function seasonSectionId(season: EventSeason): string {
  return `event-${season}`
}

export function monthShortLabels(months: MonthId[]): string[] {
  return months.map((m) => MONTH_PROFILES[m - 1]?.short ?? String(m))
}

export function seasonsForMonths(months: MonthId[]): Exclude<EventSeason, 'year-round'>[] {
  const set = new Set<Exclude<EventSeason, 'year-round'>>()
  for (const month of months) set.add(monthToSeason(month))
  return EVENT_SEASONS.filter((s): s is Exclude<EventSeason, 'year-round'> => s !== 'year-round' && set.has(s))
}
