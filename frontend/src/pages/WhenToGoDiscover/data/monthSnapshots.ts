import type { MonthId } from './months'
import { getMonthProfile, type Level } from './months'

export type MonthHappenSnapshot = {
  temperature: string
  rain: string
  crowds: string
  cost: string
  majorEventsLabel: string
  bestRegions: string[]
  monthSummary: string
  /** Honesty label for prototype climate/crowd figures */
  dataQuality: 'Seasonal estimate' | 'Mock data'
}

const RAIN_LABEL: Record<Level, string> = {
  1: 'Dry / Clear',
  2: 'Light / Mixed',
  3: 'Wet / Green',
  4: 'Wetter / Lush',
  5: 'Peak wet',
}

const CROWD_LABEL: Record<Level, string> = {
  1: 'Very low overall',
  2: 'Low overall',
  3: 'Moderate overall',
  4: 'Busy overall',
  5: 'Very high overall',
}

const COST_LABEL: Record<Level, string> = {
  1: '$',
  2: '$$',
  3: '$$',
  4: '$$$',
  5: '$$$',
}

/** Curated month decision copy — complements MonthProfile, not hardcoded in UI. */
const SNAPSHOT_OVERRIDES: Partial<
  Record<
    MonthId,
    Partial<Pick<MonthHappenSnapshot, 'rain' | 'bestRegions' | 'monthSummary' | 'majorEventsLabel' | 'temperature'>>
  >
> = {
  1: {
    bestRegions: ['Northern Vietnam', 'Mekong Delta', 'South-Central Coast'],
    monthSummary:
      'January mixes festive northern markets with reliable dry-season travel in the south.',
    majorEventsLabel: '2 worth planning around',
  },
  2: {
    bestRegions: ['Hanoi', 'Ho Chi Minh City', 'Central Coast'],
    monthSummary:
      'February centres on Tết energy — plan around closures, peak demand and festive city nights.',
    majorEventsLabel: '1–2 major festive peaks',
  },
  3: {
    rain: 'Light / Comfortable',
    bestRegions: ['Nationwide', 'Ha Long', 'Central Coast'],
    monthSummary:
      'March is one of the strongest all-round windows — comfortable sightseeing across multiple regions.',
    majorEventsLabel: '2–3 seasonal highlights',
  },
  4: {
    rain: 'Light / Comfortable',
    bestRegions: ['Central Coast', 'Mekong Delta', 'Northern Vietnam'],
    monthSummary:
      'April keeps strong nationwide conditions with reliable coastal days and easy multi-stop pacing.',
    majorEventsLabel: '2 worth noting',
  },
  5: {
    bestRegions: ['Central Coast', 'Highlands', 'Northern Vietnam'],
    monthSummary:
      'May turns greener with softer demand — strong value if you pace around midday heat.',
    majorEventsLabel: '1–2 local highlights',
  },
  6: {
    temperature: '27–33°C',
    rain: 'Wet / Green',
    bestRegions: ['Central Coast', 'Highlands'],
    monthSummary:
      'June is greener and wetter — best for flexible city days, central-coast escapes and cooler highland trips.',
    majorEventsLabel: 'Few major events',
  },
  7: {
    rain: 'Wetter / Lush',
    bestRegions: ['Highlands', 'Hanoi', 'Ho Chi Minh City'],
    monthSummary:
      'July is lush and quieter at major sites — reward flexible plans and rain-smart city evenings.',
    majorEventsLabel: 'Few major events',
  },
  8: {
    rain: 'Wetter / Lush',
    bestRegions: ['Highlands', 'Hanoi', 'Ho Chi Minh City'],
    monthSummary:
      'August favours cooler inland escapes and rain-flexible food-and-city days over rigid outdoor schedules.',
    majorEventsLabel: 'Few major events',
  },
  9: {
    rain: 'Mixed / Clearing',
    bestRegions: ['Northern Mountains', 'Ninh Binh', 'Central Coast'],
    monthSummary:
      'September can surprise with photography conditions and shoulder-season space as weather begins to settle.',
    majorEventsLabel: '1–2 seasonal peaks',
  },
  10: {
    rain: 'Clearing / Mild',
    bestRegions: ['Central Coast', 'Hanoi', 'Ninh Binh'],
    monthSummary:
      'October is especially strong for evening events and seasonal outdoor experiences as rains ease.',
    majorEventsLabel: '2 worth planning around',
  },
  11: {
    rain: 'Dry / Clear',
    bestRegions: ['Central Coast', 'Ha Long', 'Northern Vietnam'],
    monthSummary:
      'November brings peak lantern evenings and clear-season bay trips — a prime dry-season stretch.',
    majorEventsLabel: '2 worth planning around',
  },
  12: {
    rain: 'Dry / Festive',
    bestRegions: ['South-Central Coast', 'Ho Chi Minh City', 'Hanoi'],
    monthSummary:
      'December mixes festive city energy with strong beach-season conditions and higher demand.',
    majorEventsLabel: '1–2 festive peaks',
  },
}

export function getMonthHappenSnapshot(month: MonthId): MonthHappenSnapshot {
  const p = getMonthProfile(month)
  const o = SNAPSHOT_OVERRIDES[month] ?? {}
  const eventCount = p.majorEvents.length
  const defaultEventsLabel =
    eventCount === 0
      ? 'Few major events'
      : eventCount === 1
        ? '1 worth planning around'
        : `${eventCount} worth planning around`

  return {
    temperature: o.temperature ?? p.temperatureRange,
    rain: o.rain ?? RAIN_LABEL[p.rainLevel],
    crowds: CROWD_LABEL[p.crowdLevel],
    cost: COST_LABEL[p.costLevel],
    majorEventsLabel: o.majorEventsLabel ?? defaultEventsLabel,
    bestRegions: o.bestRegions ?? ['Nationwide'],
    monthSummary: o.monthSummary ?? p.whatItOffers,
    dataQuality: 'Seasonal estimate',
  }
}
