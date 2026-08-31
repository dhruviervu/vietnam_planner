import type { MonthId } from './months'
import { getMonthProfile, type Level } from './months'

export type RainCategory = 'Low' | 'Moderate' | 'Heavy'

export type MonthVisitInsight = {
  /** Crisp visit pitch — places & events, not generic weather filler */
  visitDescription: string
  temperatureRange: string
  rainfallMm: number
  rainCategory: RainCategory
}

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

/** Country-level seasonal averages for the browse-month insight card */
const MONTH_VISIT_INSIGHTS: Record<MonthId, MonthVisitInsight> = {
  1: {
    visitDescription:
      'January suits Ha Long Bay cruises, Hoi An’s dry old town, and Mekong Delta boat days. Cool Hanoi markets and New Year energy open the festive season, while Da Nang and the south stay bright for beach time and easy multi-city travel.',
    temperatureRange: '18–26°C',
    rainfallMm: 28,
    rainCategory: 'Low',
  },
  2: {
    visitDescription:
      'February is Tết — lantern nights in Hanoi and Ho Chi Minh City, family festivals nationwide, and dry beaches in Da Nang and Hoi An. Plan stays early around closures, then enjoy quieter countryside days once the holiday peak eases.',
    temperatureRange: '19–27°C',
    rainfallMm: 24,
    rainCategory: 'Low',
  },
  3: {
    visitDescription:
      'March is prime for Ha Long, Ninh Binh’s spring rice landscapes, Hoi An beaches, and Hanoi flower season. It is one of the best months to stitch north-to-south sightseeing with comfortable days and strong outdoor conditions.',
    temperatureRange: '24–29°C',
    rainfallMm: 48,
    rainCategory: 'Low',
  },
  4: {
    visitDescription:
      'April keeps Hoi An, Da Nang, and Hue shining, with Hung Kings commemorations and easy Mekong days. Warm, settled weather still supports coast-and-city itineraries before summer heat and heavier showers settle in.',
    temperatureRange: '25–31°C',
    rainfallMm: 62,
    rainCategory: 'Low',
  },
  5: {
    visitDescription:
      'May is a transition month: heat builds in the lowlands, showers return, and the countryside turns greener. Da Lat and Sapa feel fresher, major sights quiet down, and central beaches still work if you keep outdoor plans to the cooler mornings — Buddha’s Birthday period often adds quieter temple days.',
    temperatureRange: '27–33°C',
    rainfallMm: 145,
    rainCategory: 'Moderate',
  },
  6: {
    visitDescription:
      'June brings summer heat, humidity, and more frequent afternoon showers. Landscapes look lush; Sapa and Da Lat stay cooler escapes, Hanoi food days stay easy, and Ha Long trips feel quieter. Beach weeks are less reliable than spring — plan flexible mornings and rain-smart city evenings.',
    temperatureRange: '28–34°C',
    rainfallMm: 195,
    rainCategory: 'Moderate',
  },
  7: {
    visitDescription:
      'July is deep wet season — heavy rainfall and stormy pockets, especially toward the central coast. Vietnam looks vividly green and major temples feel quieter; rain-smart days in Hanoi and Ho Chi Minh City, plus highland loops when skies clear, define the month more than fixed beach itineraries.',
    temperatureRange: '27–33°C',
    rainfallMm: 245,
    rainCategory: 'Heavy',
  },
  8: {
    visitDescription:
      'August stays in peak wet season, with the central coast especially weather-variable. Inland Vietnam carries the month: Vu Lan ceremonies, vivid northern rice terraces, and café-and-food days in Hanoi and Ho Chi Minh City, while rigid beach schedules along Da Nang and Hoi An are hard to lock in.',
    temperatureRange: '27–33°C',
    rainfallMm: 275,
    rainCategory: 'Heavy',
  },
  9: {
    visitDescription:
      'September is a clearing shoulder month — residual rain still appears, but skies and travel windows gradually improve. Mid-Autumn lantern evenings and National Day energy lift the cities, while Ninh Binh and the central coast start to open up again for outdoor days and photography.',
    temperatureRange: '26–32°C',
    rainfallMm: 185,
    rainCategory: 'Moderate',
  },
  10: {
    visitDescription:
      'October unlocks Hoi An lantern nights, clearer Hue heritage days, and strong Ha Long weather. Evenings and outdoor sightseeing feel especially rewarding as skies clear and multi-city coastal itineraries become easier again.',
    temperatureRange: '24–30°C',
    rainfallMm: 120,
    rainCategory: 'Moderate',
  },
  11: {
    visitDescription:
      'November is classic dry season — Hoi An lantern streets, Ha Long Bay, Hue citadel walks, and cooler Hanoi days. Peak festival evenings and clear-season bay trips make this one of Vietnam’s most reliable travel windows.',
    temperatureRange: '22–29°C',
    rainfallMm: 55,
    rainCategory: 'Low',
  },
  12: {
    visitDescription:
      'December mixes festive Hanoi and Ho Chi Minh City nights with peak beach season in Da Nang, Hoi An, and Phu Quoc. Expect bright coasts, year-end city energy, and higher demand — book popular stays early.',
    temperatureRange: '20–28°C',
    rainfallMm: 32,
    rainCategory: 'Low',
  },
}

export function getMonthVisitInsight(month: MonthId): MonthVisitInsight {
  return MONTH_VISIT_INSIGHTS[month]
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
