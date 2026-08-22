import type { MonthId, Level } from './months'
import { getMonthProfile } from './months'
import {
  getMonthEventProfile,
  type EventActivity,
} from './monthEventProfiles'
import {
  getItemsForMonth,
  type CrowdBand,
  type HappenItem,
  type HappenType,
} from './monthEvents'

export type FeelHighlightType =
  | 'festival'
  | 'seasonal'
  | 'vietnam-special'
  | 'regional'
  | 'atmosphere'

export type MonthFeel = {
  month: MonthId
  monthLabel: string
  railDescriptor: string
  monthPersonality: string
  compactDescriptor: string
  summary: string
  temperature: {
    range: string
    travelerImplication: string
    mapTarget: 'temperature'
  }
  touristActivity: {
    level: CrowdBand
    meter: string
    label: string
    travelerImplication: string
  }
  travelCost: {
    level: Level
    symbol: string
    meter: string
    label: string
    travelerImplication: string
  }
  eventActivity: {
    level: EventActivity
    meter: string
    label: string
    travelerImplication: string
  }
  seasonalCharacter: {
    label: string
    travelerImplication: string
  }
}

const TOURIST_LABEL: Record<Level, CrowdBand> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Very High',
}

const TOURIST_IMPLICATION: Record<CrowdBand, string> = {
  'Very Low': 'Major sights feel open — easy flexible pacing.',
  Low: 'Quieter than peak season, with room to roam.',
  Moderate: 'Popular places are active, but not peak-season pressure.',
  High: 'Expect queues at icons — book popular stays earlier.',
  'Very High': 'Peak visitor pressure — plan ahead for hotels and tickets.',
}

const COST_SYMBOL: Record<Level, string> = {
  1: '$',
  2: '$$',
  3: '$$',
  4: '$$$',
  5: '$$$$',
}

const COST_WORD: Record<Level, string> = {
  1: 'Lower-cost period',
  2: 'Good value',
  3: 'Typical pricing',
  4: 'Higher demand',
  5: 'Peak pricing',
}

const COST_IMPLICATION: Record<Level, string> = {
  1: 'Typical costs sit well below the busiest windows.',
  2: 'Good balance of stays, food and activity spend.',
  3: 'Pricing feels average for a normal travel window.',
  4: 'Expect higher rates for hotels and popular routes.',
  5: 'Peak demand pushes stays and flights upward.',
}

const EVENT_IMPLICATION: Record<EventActivity, string> = {
  1: 'Few headline festivals — lean on seasonal experiences.',
  2: 'A lighter calendar; selective events still appear.',
  3: 'Several cultural and seasonal events are worth planning around.',
  4: 'More events across destinations, especially weekends.',
  5: 'Festival energy dominates — plan evenings and bookings early.',
}

const TEMP_IMPLICATION: Record<MonthId, string> = {
  1: 'Cooler north, warm dry south — pack for both.',
  2: 'Mild nationwide feel with cooler northern mornings.',
  3: 'Comfortable range for multi-region outdoor days.',
  4: 'Warm but workable — start outdoor plans early.',
  5: 'Heat builds — prioritize mornings and shade.',
  6: 'Hot and humid lowlands — highland escapes help.',
  7: 'Warm and wetter — keep outdoor blocks flexible.',
  8: 'Similar heat with showers — plan rain-smart days.',
  9: 'Still warm, with clearer cultural evening windows.',
  10: 'Easing heat in places — evenings feel stronger.',
  11: 'Clearer dry-season comfort for outdoor exploring.',
  12: 'Warm coasts and cooler north in the festive window.',
}

type FeelCopy = Pick<
  MonthFeel,
  'monthLabel' | 'railDescriptor' | 'monthPersonality' | 'compactDescriptor' | 'summary'
> & {
  seasonalCharacter: string
  seasonalImplication: string
}

/** Curated pulse copy — independent of presentation. */
const FEEL_COPY: Record<MonthId, FeelCopy> = {
  1: {
    monthLabel: 'Festive dry-season opener',
    railDescriptor: 'Festive',
    monthPersonality: 'January feels festive and dry-season ready.',
    compactDescriptor: 'Festive opener · dry coasts · cooler north',
    seasonalCharacter: 'Crisp north · dry coasts',
    seasonalImplication: 'Clear winter light for cities and beaches.',
    summary:
      'January feels festive and dry-season ready — strong for beaches and city energy, with cooler northern mornings.',
  },
  2: {
    monthLabel: 'Peak celebration month',
    railDescriptor: 'Tết peak',
    monthPersonality: 'February feels intensely festive.',
    compactDescriptor: 'Peak celebration · high demand · dry coasts',
    seasonalCharacter: 'Tết energy · dry coasts',
    seasonalImplication: 'Festive evenings reshape city atmospheres.',
    summary:
      'February feels intensely festive — plan around Tết closures and demand while coasts stay dry and inviting.',
  },
  3: {
    monthLabel: 'Strong all-round month',
    railDescriptor: 'Strong overall',
    monthPersonality: 'March feels lively without being overwhelming.',
    compactDescriptor: 'Strong all-round month · active events · multi-region',
    seasonalCharacter: 'Clear skies · spring landscapes',
    seasonalImplication: 'Good conditions for outdoor sightseeing and photography.',
    summary:
      'March feels lively without being overwhelming — a strong month for moving between regions, exploring outdoors and catching cultural events.',
  },
  4: {
    monthLabel: 'Outdoor-friendly month',
    railDescriptor: 'Outdoor',
    monthPersonality: 'April still feels open and workable nationwide.',
    compactDescriptor: 'Outdoor-friendly · moderate activity · late spring',
    seasonalCharacter: 'Warm days · late-spring green',
    seasonalImplication: 'Outdoor days stay rewarding before peak heat.',
    summary:
      'April still feels open and workable nationwide — outdoor days stay rewarding before heat and showers intensify.',
  },
  5: {
    monthLabel: 'Greener value month',
    railDescriptor: 'Value',
    monthPersonality: 'May feels greener and quieter.',
    compactDescriptor: 'Greener value · quieter events · rising heat',
    seasonalCharacter: 'Lusher landscapes · rising heat',
    seasonalImplication: 'Greener scenery if you pace around midday heat.',
    summary:
      'May feels greener and quieter — strong value if you pace around midday heat and keep plans flexible.',
  },
  6: {
    monthLabel: 'Quieter flexible month',
    railDescriptor: 'Flexible',
    monthPersonality: 'June feels greener and wetter.',
    compactDescriptor: 'Quieter events · flexible pacing · wetter afternoons',
    seasonalCharacter: 'Greener landscapes · wetter afternoons',
    seasonalImplication: 'Lush scenery, but keep plans flexible around rain.',
    summary:
      'June feels greener and wetter — best when you stay flexible, lean on city evenings and cooler highland escapes.',
  },
  7: {
    monthLabel: 'Lush & flexible month',
    railDescriptor: 'Lush',
    monthPersonality: 'July feels lush and quieter at major sites.',
    compactDescriptor: 'Lush landscapes · light events · rain-smart',
    seasonalCharacter: 'Deep greens · stormier pockets',
    seasonalImplication: 'Deep greens reward rain-smart daily pacing.',
    summary:
      'July feels lush and quieter at major sites — reward rain-smart pacing rather than a packed outdoor schedule.',
  },
  8: {
    monthLabel: 'Rain-smart city month',
    railDescriptor: 'City nights',
    monthPersonality: 'August feels softer on festivals.',
    compactDescriptor: 'Rain-smart cities · inland escapes · light calendar',
    seasonalCharacter: 'Wet afternoons · cooler highlands',
    seasonalImplication: 'City evenings and highlands outperform rigid outdoor days.',
    summary:
      'August feels softer on festivals — food-led evenings and inland escapes carry the month more than headline events.',
  },
  9: {
    monthLabel: 'Cultural return month',
    railDescriptor: 'Cultural',
    monthPersonality: 'September feels culturally brighter again.',
    compactDescriptor: 'Cultural return · Mid-Autumn · seasonal colour',
    seasonalCharacter: 'Mid-Autumn evenings · late-summer colour',
    seasonalImplication: 'Evenings and seasonal colour define the feel.',
    summary:
      'September feels culturally brighter again — Mid-Autumn evenings and seasonal landscapes give the month a clearer pulse.',
  },
  10: {
    monthLabel: 'Evening festival month',
    railDescriptor: 'Lanterns',
    monthPersonality: 'October feels increasingly eventful after dark.',
    compactDescriptor: 'Evening festivals · clearing skies · multi-city',
    seasonalCharacter: 'Clearing skies · lantern evenings',
    seasonalImplication: 'Evenings become the strongest seasonal window.',
    summary:
      'October feels increasingly eventful after dark — lantern nights and outdoor evenings define the month’s character.',
  },
  11: {
    monthLabel: 'Festival-heavy month',
    railDescriptor: 'Most eventful',
    monthPersonality: 'November feels festival-forward and clear.',
    compactDescriptor: 'Festival-heavy · culturally active · dry evenings',
    seasonalCharacter: 'Dry evenings · clear-season views',
    seasonalImplication: 'Dry evenings suit festivals and outdoor views.',
    summary:
      'November feels festival-forward and clear — evenings matter more, and multi-city cultural energy is easy to catch.',
  },
  12: {
    monthLabel: 'Festive high-demand month',
    railDescriptor: 'Year-end',
    monthPersonality: 'December feels bright and busy.',
    compactDescriptor: 'Festive year-end · high demand · beach season',
    seasonalCharacter: 'Year-end lights · beach season',
    seasonalImplication: 'Festive cities and beach weather peak together.',
    summary:
      'December feels bright and busy — festive city nights and peak beach demand shape a high-energy close to the year.',
  },
}

export function touristDots(level: CrowdBand): string {
  const n =
    level === 'Very Low'
      ? 1
      : level === 'Low'
        ? 2
        : level === 'Moderate'
          ? 3
          : level === 'High'
            ? 4
            : 5
  return '●'.repeat(n) + '○'.repeat(5 - n)
}

export function getMonthFeel(month: MonthId): MonthFeel {
  const climate = getMonthProfile(month)
  const events = getMonthEventProfile(month)
  const copy = FEEL_COPY[month]
  const touristLevel = TOURIST_LABEL[climate.crowdLevel]
  return {
    month,
    monthLabel: copy.monthLabel,
    railDescriptor: copy.railDescriptor,
    monthPersonality: copy.monthPersonality,
    compactDescriptor: copy.compactDescriptor,
    summary: copy.summary,
    temperature: {
      range: climate.temperatureRange,
      travelerImplication: TEMP_IMPLICATION[month],
      mapTarget: 'temperature',
    },
    touristActivity: {
      level: touristLevel,
      meter: touristDots(touristLevel),
      label: touristLevel,
      travelerImplication: TOURIST_IMPLICATION[touristLevel],
    },
    travelCost: {
      level: climate.costLevel,
      symbol: COST_SYMBOL[climate.costLevel],
      meter: '●'.repeat(climate.costLevel) + '○'.repeat(5 - climate.costLevel),
      label: COST_WORD[climate.costLevel],
      travelerImplication: COST_IMPLICATION[climate.costLevel],
    },
    eventActivity: {
      level: events.eventActivity,
      meter: '●'.repeat(events.eventActivity) + '○'.repeat(5 - events.eventActivity),
      label: events.eventActivityLabel,
      travelerImplication: EVENT_IMPLICATION[events.eventActivity],
    },
    seasonalCharacter: {
      label: copy.seasonalCharacter,
      travelerImplication: copy.seasonalImplication,
    },
  }
}

export type LookFocus = 'cultural' | 'evening' | 'multi-city' | 'seasonal'

export function deriveLookFocus(title: string): LookFocus {
  const t = title.toLowerCase()
  if (
    t.includes('evening') ||
    t.includes('night') ||
    t.includes('lantern') ||
    t.includes('food') ||
    t.includes('after dark')
  ) {
    return 'evening'
  }
  if (
    t.includes('city') ||
    t.includes('destination') ||
    t.includes('multi') ||
    t.includes('spread') ||
    t.includes('nationwide') ||
    t.includes('north–south') ||
    t.includes('north-south')
  ) {
    return 'multi-city'
  }
  if (
    t.includes('cultural') ||
    t.includes('festival') ||
    t.includes('celebration') ||
    t.includes('spring') ||
    t.includes('mid-autumn') ||
    t.includes('tết') ||
    t.includes('tet') ||
    t.includes('commemorat') ||
    t.includes('new year')
  ) {
    return 'cultural'
  }
  return 'seasonal'
}

export function filterHighlightsByLookFocus(
  items: HappenItem[],
  focus: LookFocus | null,
): HappenItem[] {
  if (!focus) return items

  if (focus === 'multi-city') {
    const byCity = new Map<string, HappenItem[]>()
    for (const item of items) {
      const list = byCity.get(item.city) ?? []
      list.push(item)
      byCity.set(item.city, list)
    }
    const cities = [...byCity.keys()].sort(
      (a, b) => (byCity.get(b)?.length ?? 0) - (byCity.get(a)?.length ?? 0),
    )
    if (cities.length <= 1) return items
    const diversified: HappenItem[] = []
    let i = 0
    while (diversified.length < items.length) {
      let added = false
      for (const city of cities) {
        const pool = byCity.get(city)
        if (pool && pool[i]) {
          diversified.push(pool[i])
          added = true
        }
      }
      if (!added) break
      i += 1
    }
    return diversified
  }

  const scored = items.map((item) => {
    const blob = `${item.name} ${item.whyThisMonth} ${item.bestTime} ${item.type}`.toLowerCase()
    let score = 0
    if (focus === 'evening') {
      if (/evening|sunset|night|after dark|lantern|food/.test(blob)) score += 5
      if (item.type === 'event') score += 1
    } else if (focus === 'cultural') {
      if (item.type === 'event') score += 5
      if (/festival|cultural|lantern|celebration|heritage|citadel/.test(blob)) score += 3
    } else if (focus === 'seasonal') {
      if (item.type === 'seasonal' || item.type === 'must-visit') score += 4
      if (/landscape|season|highland|beach|rice|green|photography/.test(blob)) score += 2
    }
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score || b.item.popularity - a.item.popularity)
  const prioritized = scored.filter((s) => s.score > 0).map((s) => s.item)
  return prioritized.length ? prioritized : items
}

export function feelTypeBadge(type: FeelHighlightType): string {
  if (type === 'festival') return '🏮 Festival'
  if (type === 'seasonal') return '🌿 Seasonal'
  if (type === 'vietnam-special') return '⭐ Vietnam special'
  if (type === 'regional') return '📍 Regional'
  return '🌙 Atmosphere'
}

export function mapHappenToFeelType(item: HappenItem): FeelHighlightType {
  if (item.type === 'event') return 'festival'
  if (item.type === 'seasonal') {
    const t = `${item.name} ${item.whyThisMonth}`.toLowerCase()
    if (t.includes('evening') || t.includes('food') || t.includes('old quarter') || t.includes('street')) {
      return 'atmosphere'
    }
    return 'seasonal'
  }
  // must-visit
  const iconic = /ha long|halong|mekong|citadel|imperial|bay/i.test(item.name)
  return iconic ? 'vietnam-special' : 'regional'
}

export function feelWhyLabel(type: FeelHighlightType): string {
  if (type === 'festival') return "Why it's special"
  if (type === 'seasonal' || type === 'atmosphere') return 'Why now'
  return 'Why it matters'
}

export function getMonthHighlights(month: MonthId): HappenItem[] {
  return getItemsForMonth(month).slice(0, 4)
}

export function highlightCountLabel(n: number, monthName: string): string {
  return `${n} Thing${n === 1 ? '' : 's'} Defining ${monthName}`
}

/** Re-export for filters that still use happen types */
export type { HappenType }
