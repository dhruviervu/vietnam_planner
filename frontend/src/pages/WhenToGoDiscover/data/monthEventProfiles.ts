import type { MonthId } from './months'
import { MONTH_PROFILES } from './months'
import { getItemsForMonth, type HappenCity } from './monthEvents'

export type EventActivity = 1 | 2 | 3 | 4 | 5

export type EventMonthHighlight = 'most-eventful' | 'festival-season' | 'cultural-peak'

export type WhyStandout = {
  icon: string
  title: string
  description: string
}

export type PlanAroundItem = {
  icon: string
  title: string
  description: string
}

export type MonthEventProfile = {
  month: MonthId
  /** 1–2 Low · 3 Active · 4 Busy · 5 Festival heavy */
  eventActivity: EventActivity
  eventActivityLabel: string
  /** Level-1 identity: "September is a cultural month." */
  monthPersonality: string
  /** Supporting interpretation under the personality */
  monthSummary: string
  eventCount: number
  cityCount: number
  activeDays: number
  typicalCrowd: string
  typicalCost: string
  bestEventPeriod: string
  whyItStandsOut: WhyStandout[]
  planAround: PlanAroundItem[]
  highlight?: EventMonthHighlight
}

const ACTIVITY_LABEL: Record<EventActivity, string> = {
  1: 'Low',
  2: 'Low',
  3: 'Active',
  4: 'Busy',
  5: 'Festival-heavy',
}

type ProfileDraft = Omit<MonthEventProfile, 'month' | 'eventActivityLabel'>

/** Curated event-calendar profiles — independent of weather/travel-window scoring. */
const PROFILES: Record<MonthId, ProfileDraft> = {
  1: {
    eventActivity: 4,
    monthPersonality: 'January is a festive build-up month.',
    monthSummary:
      'Pre-Tết markets intensify, city evenings stay lively, and dry-season southern travel still pairs well with cultural energy.',
    eventCount: 4,
    cityCount: 3,
    activeDays: 10,
    typicalCrowd: 'Moderate–High',
    typicalCost: '$–$$',
    bestEventPeriod: 'Daytime markets · evenings',
    whyItStandsOut: [
      {
        icon: '🌸',
        title: 'Festive market atmosphere',
        description: 'Flower markets and New Year prep reshape city streets.',
      },
      {
        icon: '🍜',
        title: 'Strong city evenings',
        description: 'Food lanes and neighbourhood energy stay easy to plan around.',
      },
      {
        icon: '📍',
        title: 'North–south spread',
        description: 'Event energy appears in both Hanoi and southern hubs.',
      },
    ],
    planAround: [
      { icon: '🛒', title: 'Daytime markets', description: 'Best festive atmosphere' },
      { icon: '🌙', title: 'Evenings', description: 'Strong city energy' },
      { icon: '📅', title: 'Late January', description: 'Pre-Tết intensity rises' },
      { icon: '🏨', title: 'Popular cities', description: 'Book earlier near Tết' },
    ],
    highlight: 'festival-season',
  },
  2: {
    eventActivity: 5,
    monthPersonality: 'February is a peak celebration month.',
    monthSummary:
      'Tết concentrates Vietnam’s biggest cultural celebrations into a short, high-energy window — plan around closures and demand.',
    eventCount: 5,
    cityCount: 4,
    activeDays: 14,
    typicalCrowd: 'Very High',
    typicalCost: '$$–$$$',
    bestEventPeriod: 'Evenings · holiday weeks',
    whyItStandsOut: [
      {
        icon: '🏮',
        title: 'Major New Year celebrations',
        description: 'The year’s densest cultural festival window.',
      },
      {
        icon: '🌙',
        title: 'Peak evening festive mood',
        description: 'City nights feel distinctly celebratory.',
      },
      {
        icon: '📍',
        title: 'Nationwide holiday energy',
        description: 'Activity spikes across multiple destinations at once.',
      },
      {
        icon: '⚠',
        title: 'Closures and demand',
        description: 'Expect limited services and higher hotel pressure.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best festive atmosphere' },
      { icon: '📅', title: 'Holiday weeks', description: 'Highest activity' },
      { icon: '🧧', title: 'Tết dates', description: 'Plan travel around closures' },
      { icon: '🏨', title: 'Popular cities', description: 'Book well ahead' },
    ],
    highlight: 'most-eventful',
  },
  3: {
    eventActivity: 3,
    monthPersonality: 'March is a balanced cultural month.',
    monthSummary:
      'Spring celebrations return across several cities, with enough event energy to plan around without feeling nonstop.',
    eventCount: 4,
    cityCount: 4,
    activeDays: 8,
    typicalCrowd: 'Moderate',
    typicalCost: '$$',
    bestEventPeriod: 'Weekends · late afternoons',
    whyItStandsOut: [
      {
        icon: '🌸',
        title: 'Spring cultural moments',
        description: 'Seasonal festivals and local celebrations pick up.',
      },
      {
        icon: '🌙',
        title: 'Comfortable evening events',
        description: 'Milder nights make after-dark plans easier.',
      },
      {
        icon: '📍',
        title: 'Multi-city activity',
        description: 'Events and seasonal picks span several destinations.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Late afternoons', description: 'Best event window' },
      { icon: '📅', title: 'Weekends', description: 'More activity' },
      { icon: '🌸', title: 'Spring dates', description: 'Watch local festival days' },
      { icon: '🏨', title: 'Popular cities', description: 'Book earlier where relevant' },
    ],
  },
  4: {
    eventActivity: 3,
    monthPersonality: 'April is an outdoor cultural month.',
    monthSummary:
      'Commemorative events and strong outdoor seasonal experiences keep the calendar active without peak festival density.',
    eventCount: 4,
    cityCount: 4,
    activeDays: 7,
    typicalCrowd: 'Moderate',
    typicalCost: '$$',
    bestEventPeriod: 'Mornings · weekends',
    whyItStandsOut: [
      {
        icon: '🏛',
        title: 'Commemorative celebrations',
        description: 'Heritage-focused events remain worth planning around.',
      },
      {
        icon: '🌿',
        title: 'Strong seasonal outings',
        description: 'Outdoor experiences still feel easy to schedule.',
      },
      {
        icon: '📍',
        title: 'Coast and delta options',
        description: 'Activity spreads beyond a single hub.',
      },
    ],
    planAround: [
      { icon: '🌅', title: 'Mornings', description: 'Best outdoor event window' },
      { icon: '📅', title: 'Weekends', description: 'Higher activity' },
      { icon: '🏛', title: 'Heritage dates', description: 'Watch commemorative days' },
      { icon: '🏨', title: 'Coastal hubs', description: 'Book earlier for weekends' },
    ],
  },
  5: {
    eventActivity: 2,
    monthPersonality: 'May is a quieter selective month.',
    monthSummary:
      'Fewer headline festivals — the strongest picks are local celebrations and shoulder-season experiences.',
    eventCount: 3,
    cityCount: 4,
    activeDays: 5,
    typicalCrowd: 'Low–Moderate',
    typicalCost: '$–$$',
    bestEventPeriod: 'Early mornings · evenings',
    whyItStandsOut: [
      {
        icon: '🙏',
        title: 'Selective local festivals',
        description: 'A few meaningful celebrations instead of a packed calendar.',
      },
      {
        icon: '🌿',
        title: 'Seasonal outdoor picks',
        description: 'Shoulder-season experiences still reward timing.',
      },
      {
        icon: '💰',
        title: 'Softer event demand',
        description: 'Popular spots usually feel less pressured.',
      },
    ],
    planAround: [
      { icon: '🌅', title: 'Early mornings', description: 'Best outdoor pacing' },
      { icon: '🌙', title: 'Evenings', description: 'Cooler event window' },
      { icon: '📅', title: 'Local festival days', description: 'Worth checking ahead' },
      { icon: '🏨', title: 'Major hubs', description: 'Usually easier to book' },
    ],
  },
  6: {
    eventActivity: 2,
    monthPersonality: 'June is a quieter, flexible month.',
    monthSummary:
      'Major festivals thin out — seasonal city evenings and cooler highland experiences matter more than a packed event calendar.',
    eventCount: 2,
    cityCount: 4,
    activeDays: 4,
    typicalCrowd: 'Low–Moderate',
    typicalCost: '$–$$',
    bestEventPeriod: 'Evenings · indoor windows',
    whyItStandsOut: [
      {
        icon: '🍜',
        title: 'Rain-smart city evenings',
        description: 'Food and indoor-friendly plans stay rewarding.',
      },
      {
        icon: '🏔',
        title: 'Cooler highland alternatives',
        description: 'Inland escapes outperform lowland festival hunting.',
      },
      {
        icon: '📍',
        title: 'Scattered local moments',
        description: 'Activity is selective rather than concentrated.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '☕', title: 'Indoor windows', description: 'Around showers' },
      { icon: '🏔', title: 'Highland days', description: 'Stronger seasonal pick' },
      { icon: '🏨', title: 'Popular cities', description: 'Usually flexible to book' },
    ],
  },
  7: {
    eventActivity: 2,
    monthPersonality: 'July is a light-event month.',
    monthSummary:
      'Major festivals stay limited — curated seasonal experiences and city evenings do more of the work.',
    eventCount: 2,
    cityCount: 3,
    activeDays: 4,
    typicalCrowd: 'Low–Moderate',
    typicalCost: '$–$$',
    bestEventPeriod: 'Evenings · weekends',
    whyItStandsOut: [
      {
        icon: '🎭',
        title: 'Selective summer events',
        description: 'A few local moments rather than a festival season.',
      },
      {
        icon: '☕',
        title: 'Strong city food nights',
        description: 'Evenings remain the easiest planning lever.',
      },
      {
        icon: '🌿',
        title: 'Seasonal alternatives',
        description: 'Places and experiences outrank headline events.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '📅', title: 'Weekends', description: 'Slightly more activity' },
      { icon: '☔', title: 'Flexible days', description: 'Keep outdoor plans loose' },
      { icon: '🏨', title: 'Major hubs', description: 'Usually easier availability' },
    ],
  },
  8: {
    eventActivity: 2,
    monthPersonality: 'August is a quieter inland-leaning month.',
    monthSummary:
      'Few major festivals — rain-flexible city nights and cooler inland seasonal experiences carry the month.',
    eventCount: 2,
    cityCount: 3,
    activeDays: 4,
    typicalCrowd: 'Low–Moderate',
    typicalCost: '$–$$',
    bestEventPeriod: 'Evenings · flexible days',
    whyItStandsOut: [
      {
        icon: '🍜',
        title: 'Food-led evenings',
        description: 'City nights remain the most reliable event substitute.',
      },
      {
        icon: '🏔',
        title: 'Highland seasonal escapes',
        description: 'Cooler inland options outperform festival chasing.',
      },
      {
        icon: '📍',
        title: 'Fewer packed event hubs',
        description: 'Activity stays selective and spread out.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '📅', title: 'Flexible days', description: 'Weather-first planning' },
      { icon: '🏔', title: 'Inland trips', description: 'Stronger seasonal value' },
      { icon: '🏨', title: 'Major hubs', description: 'Usually flexible to book' },
    ],
  },
  9: {
    eventActivity: 3,
    monthPersonality: 'September is a cultural month.',
    monthSummary:
      'Mid-Autumn celebrations return, evenings become more eventful, and several regions offer strong seasonal experiences.',
    eventCount: 4,
    cityCount: 6,
    activeDays: 8,
    typicalCrowd: 'Moderate–High',
    typicalCost: '$–$$',
    bestEventPeriod: 'Evenings · full-moon nights',
    whyItStandsOut: [
      {
        icon: '🌕',
        title: 'Mid-Autumn atmosphere',
        description: 'Lanterns, evening celebrations and local traditions.',
      },
      {
        icon: '📸',
        title: 'Seasonal landscapes',
        description: 'Strong photography opportunities in selected regions.',
      },
      {
        icon: '🌙',
        title: 'Livelier evenings',
        description: 'More reason to stay out after dark.',
      },
      {
        icon: '📍',
        title: 'Multi-city activity',
        description: 'Events and seasonal experiences span several destinations.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '📅', title: 'Weekends', description: 'More activity' },
      { icon: '🌕', title: 'Full-moon period', description: 'Strongest celebrations' },
      { icon: '🏨', title: 'Popular cities', description: 'Book earlier where relevant' },
    ],
    highlight: 'cultural-peak',
  },
  10: {
    eventActivity: 4,
    monthPersonality: 'October is an evening festival month.',
    monthSummary:
      'Lantern culture strengthens, outdoor evenings improve, and event activity spreads across multiple destinations.',
    eventCount: 5,
    cityCount: 5,
    activeDays: 10,
    typicalCrowd: 'Moderate–High',
    typicalCost: 'Free–$$',
    bestEventPeriod: 'Evenings · weekends',
    whyItStandsOut: [
      {
        icon: '🏮',
        title: 'Lantern & festival nights',
        description: 'Evening celebrations become a clear trip highlight.',
      },
      {
        icon: '🌙',
        title: 'Strong evening atmosphere',
        description: 'After-dark plans matter more this month.',
      },
      {
        icon: '📍',
        title: 'Multi-destination activity',
        description: 'Events appear across several cities at once.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '📅', title: 'Weekends', description: 'Higher activity' },
      { icon: '🌕', title: 'Full-moon nights', description: 'Peak lantern energy' },
      { icon: '🏨', title: 'Hoi An & hubs', description: 'Book earlier for festival dates' },
    ],
    highlight: 'festival-season',
  },
  11: {
    eventActivity: 5,
    monthPersonality: 'November is a festival-heavy month.',
    monthSummary:
      'Several major cultural celebrations and strong evening experiences make this one of Vietnam’s more eventful periods.',
    eventCount: 5,
    cityCount: 4,
    activeDays: 12,
    typicalCrowd: 'Moderate–High',
    typicalCost: '$–$$',
    bestEventPeriod: 'Evenings · weekends',
    whyItStandsOut: [
      {
        icon: '🏮',
        title: 'Festivals & local celebrations',
        description: 'Multiple cultural events worth planning around.',
      },
      {
        icon: '🌙',
        title: 'Strong evening atmosphere',
        description: 'Evenings carry more of the month’s energy.',
      },
      {
        icon: '📍',
        title: 'Events across destinations',
        description: 'Activity is not limited to a single city.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best atmosphere' },
      { icon: '📅', title: 'Weekends', description: 'More activity' },
      { icon: '🌕', title: 'Full-moon evenings', description: 'Strongest celebrations' },
      { icon: '🏨', title: 'Popular cities', description: 'Book earlier where relevant' },
    ],
    highlight: 'most-eventful',
  },
  12: {
    eventActivity: 4,
    monthPersonality: 'December is a festive high-demand month.',
    monthSummary:
      'Year-end city celebrations pair with busy beach-season evenings — bright, lively and demand-heavy.',
    eventCount: 4,
    cityCount: 3,
    activeDays: 11,
    typicalCrowd: 'High',
    typicalCost: '$$–$$$',
    bestEventPeriod: 'Evenings · holiday weeks',
    whyItStandsOut: [
      {
        icon: '✨',
        title: 'Festive city lighting',
        description: 'Year-end celebrations reshape evening streetscapes.',
      },
      {
        icon: '🌙',
        title: 'Peak evening buzz',
        description: 'Nights feel busier and more event-driven.',
      },
      {
        icon: '📍',
        title: 'City and coast highlights',
        description: 'Activity concentrates in major hubs and beach towns.',
      },
    ],
    planAround: [
      { icon: '🌙', title: 'Evenings', description: 'Best festive atmosphere' },
      { icon: '📅', title: 'Holiday weeks', description: 'Highest activity' },
      { icon: '✨', title: 'Year-end dates', description: 'Expect denser crowds' },
      { icon: '🏨', title: 'Popular cities', description: 'Book well ahead' },
    ],
    highlight: 'festival-season',
  },
}

export function getMonthEventProfile(month: MonthId): MonthEventProfile {
  const base = PROFILES[month]
  return {
    month,
    ...base,
    eventActivityLabel: ACTIVITY_LABEL[base.eventActivity],
  }
}

export function getMostFestiveMonth(): MonthId {
  let best: MonthId = 11
  let bestScore = 0
  for (const m of MONTH_PROFILES) {
    const profile = getMonthEventProfile(m.month)
    const score = profile.eventActivity * 10 + profile.eventCount
    if (profile.highlight === 'most-eventful') return m.month
    if (score > bestScore) {
      bestScore = score
      best = m.month
    }
  }
  return best
}

export function getAllMonthEventProfiles(): MonthEventProfile[] {
  return (MONTH_PROFILES.map((m) => m.month) as MonthId[]).map(getMonthEventProfile)
}

export function eventActivityDots(level: EventActivity): string {
  return '●'.repeat(level) + '○'.repeat(5 - level)
}

export function highlightLabel(h: EventMonthHighlight): string {
  if (h === 'most-eventful') return '✦ Most eventful'
  if (h === 'festival-season') return '✦ Festival season'
  return '✦ Cultural peak'
}

export type TopCityCount = {
  city: Exclude<HappenCity, 'All Vietnam'>
  count: number
}

export function getTopCitiesForMonth(
  month: MonthId,
  cityFilter: HappenCity = 'All Vietnam',
): TopCityCount[] {
  const items = getItemsForMonth(month).filter(
    (i) => cityFilter === 'All Vietnam' || i.city === cityFilter,
  )
  const map = new Map<Exclude<HappenCity, 'All Vietnam'>, number>()
  for (const item of items) {
    if (item.city === 'All Vietnam') continue
    map.set(item.city, (map.get(item.city) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city))
}

export function getFilteredMonthStats(month: MonthId, cityFilter: HappenCity) {
  const items = getItemsForMonth(month).filter(
    (i) => cityFilter === 'All Vietnam' || i.city === cityFilter,
  )
  const events = items.filter((i) => i.type === 'event')
  const cities = new Set(items.map((i) => i.city)).size
  const profile = getMonthEventProfile(month)
  return {
    standoutCount: Math.min(profile.eventCount, Math.max(events.length, items.length)),
    cityCount: cityFilter === 'All Vietnam' ? profile.cityCount : Math.max(1, cities),
    itemCount: items.length,
    eventCount: events.length,
  }
}
