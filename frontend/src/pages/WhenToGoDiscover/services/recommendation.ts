import {
  MONTH_PROFILES,
  TRAVEL_WINDOWS,
  type MonthId,
  type MonthProfile,
  type TravelWindowId,
} from '../data/months'

export type TravelReason = {
  icon: string
  label: string
  detail: string
}

export type TravelAdvantage = {
  id: string
  label: string
  value: string
  versus: string
  /** 0–100 visual strength vs a typical month (higher = stronger advantage) */
  strength: number
}

export type TravelRecommendation = {
  recommendedMonths: MonthId[]
  recommendedWindowId: TravelWindowId
  recommendedWindowLabel: string
  windowRangeLabel: string
  primaryMonth: MonthId
  headline: string
  synthesis: string
  reasons: TravelReason[]
  advantages: TravelAdvantage[]
  aggregate: {
    temperatureRange: string
    rainLevel: MonthProfile['rainLevel']
    rainLabel: string
    crowdLevel: MonthProfile['crowdLevel']
    crowdLabel: string
    costLevel: MonthProfile['costLevel']
    costLabel: string
    eventsLevel: MonthProfile['eventsLevel']
    eventsLabel: string
  }
}

function overallScore(m: MonthProfile) {
  return (
    m.climateScore * 0.28 +
    m.rainScore * 0.18 +
    m.crowdScore * 0.14 +
    m.costScore * 0.14 +
    m.eventScore * 0.08 +
    m.multiRegionScore * 0.18
  )
}

function avgLevel(months: MonthProfile[], key: 'rainLevel' | 'crowdLevel' | 'costLevel' | 'eventsLevel') {
  const n = months.reduce((s, m) => s + m[key], 0) / months.length
  return Math.max(1, Math.min(5, Math.round(n))) as MonthProfile['rainLevel']
}

function meanLevel(months: MonthProfile[], key: 'rainLevel' | 'crowdLevel' | 'costLevel' | 'eventsLevel') {
  return months.reduce((s, m) => s + m[key], 0) / months.length
}

function formatWindowRange(months: MonthId[]) {
  const names = months.map((id) => MONTH_PROFILES.find((m) => m.month === id)!.name)
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} – ${names[1]}`
  return `${names[0]} – ${names[names.length - 1]}`
}

function clampStrength(n: number) {
  return Math.max(18, Math.min(100, Math.round(n)))
}

/**
 * Transparent mock recommendation — ranks months, then prefers a contiguous
 * travel-window cluster with the highest average overall score.
 */
export function computeTravelRecommendation(): TravelRecommendation {
  const ranked = [...MONTH_PROFILES].sort((a, b) => overallScore(b) - overallScore(a))

  const windowScores = TRAVEL_WINDOWS.map((w) => {
    const profiles = w.months.map((id) => MONTH_PROFILES.find((m) => m.month === id)!)
    const avg = profiles.reduce((s, m) => s + overallScore(m), 0) / profiles.length
    return { window: w, avg, profiles }
  }).sort((a, b) => b.avg - a.avg)

  const best = windowScores[0]
  const recommendedMonths = best.window.months
  const profiles = best.profiles
  const primaryMonth =
    [...profiles].sort((a, b) => overallScore(b) - overallScore(a))[0]?.month ?? ranked[0].month

  const rainAvg = avgLevel(profiles, 'rainLevel')
  const crowdAvg = avgLevel(profiles, 'crowdLevel')
  const costAvg = avgLevel(profiles, 'costLevel')
  const eventsAvg = avgLevel(profiles, 'eventsLevel')

  const yearRain = meanLevel(MONTH_PROFILES, 'rainLevel')
  const yearCrowd = meanLevel(MONTH_PROFILES, 'crowdLevel')
  const yearCost = meanLevel(MONTH_PROFILES, 'costLevel')
  const yearEvents = meanLevel(MONTH_PROFILES, 'eventsLevel')
  const windowRain = meanLevel(profiles, 'rainLevel')
  const windowCrowd = meanLevel(profiles, 'crowdLevel')
  const windowCost = meanLevel(profiles, 'costLevel')
  const windowEvents = meanLevel(profiles, 'eventsLevel')
  const yearScore =
    MONTH_PROFILES.reduce((s, m) => s + overallScore(m), 0) / MONTH_PROFILES.length
  const windowScore = best.avg

  const temps = profiles.flatMap((p) => {
    const [lo, hi] = p.temperatureRange.replace('°C', '').split('–').map((x) => Number(x.trim()))
    return [lo, hi]
  })
  const temperatureRange = `${Math.min(...temps)}–${Math.max(...temps)}°C`

  const reasons: TravelReason[] = [
    {
      icon: '☀️',
      label: 'Comfortable sightseeing',
      detail: 'Mild days and clearer skies make outdoor exploring easier than peak summer heat.',
    },
    {
      icon: '🌧',
      label: 'Lower rain disruption',
      detail: 'Fewer washout days than wetter months — itineraries stay more reliable.',
    },
    {
      icon: '👥',
      label: 'Manageable crowds',
      detail: 'Sites stay workable without peak-season pressure.',
    },
  ]

  const advantages: TravelAdvantage[] = [
    {
      id: 'overall',
      label: 'Overall trip balance',
      value: 'Stronger than most months',
      versus: `Scores higher than a typical month across climate, rain, crowds and value.`,
      strength: clampStrength(((windowScore - yearScore) / Math.max(yearScore, 0.01)) * 120 + 62),
    },
    {
      id: 'rain',
      label: 'Rain risk',
      value: rainAvg <= 2 ? 'Lower than average' : rainAvg === 3 ? 'Near average' : 'Higher',
      versus:
        windowRain < yearRain - 0.35
          ? 'Noticeably drier than a typical month across the year.'
          : 'Rain stays more predictable than the wettest stretch of the year.',
      strength: clampStrength(((yearRain - windowRain) / 4) * 100 + 45),
    },
    {
      id: 'crowds',
      label: 'Crowd pressure',
      value: crowdAvg <= 2 ? 'Lighter feel' : crowdAvg === 3 ? 'Manageable' : 'Busier',
      versus:
        windowCrowd < yearCrowd - 0.25
          ? 'Easier site pacing than busier peak months.'
          : 'Still workable if you book popular stays early.',
      strength: clampStrength(((yearCrowd - windowCrowd) / 4) * 100 + 48),
    },
    {
      id: 'value',
      label: 'Cost & value',
      value: costAvg <= 2 ? 'Strong value' : costAvg === 3 ? 'Good value' : 'Higher spend',
      versus:
        windowCost < yearCost - 0.2
          ? 'Often better value than peak festive / holiday months.'
          : 'Pricing is fair for the comfort this window offers.',
      strength: clampStrength(((yearCost - windowCost) / 4) * 100 + 50),
    },
    {
      id: 'events',
      label: 'Events & atmosphere',
      value: eventsAvg >= 4 ? 'Active calendar' : eventsAvg === 3 ? 'Steady buzz' : 'Quieter',
      versus:
        windowEvents > yearEvents + 0.2
          ? 'More seasonal energy without tipping into pure peak chaos.'
          : 'Space for culture without forcing a festival-only trip.',
      strength: clampStrength(((windowEvents - yearEvents) / 4) * 100 + 52),
    },
  ]

  return {
    recommendedMonths,
    recommendedWindowId: best.window.id,
    recommendedWindowLabel: best.window.label,
    windowRangeLabel: formatWindowRange(recommendedMonths),
    primaryMonth,
    headline: 'Strongest overall window',
    synthesis:
      'A strong all-round window for combining multiple regions without extreme heat, rain or peak-season pressure.',
    reasons,
    advantages,
    aggregate: {
      temperatureRange,
      rainLevel: rainAvg,
      rainLabel: rainAvg <= 2 ? 'Lower disruption' : rainAvg === 3 ? 'Moderate' : 'Higher rain',
      crowdLevel: crowdAvg,
      crowdLabel: crowdAvg <= 2 ? 'Lighter' : crowdAvg === 3 ? 'Moderate' : 'Busy',
      costLevel: costAvg,
      costLabel: costAvg <= 2 ? 'Good overall value' : costAvg === 3 ? 'Fair value' : 'Higher spend',
      eventsLevel: eventsAvg,
      eventsLabel: eventsAvg >= 4 ? 'Strong activity' : eventsAvg === 3 ? 'Steady' : 'Quieter',
    },
  }
}

export function isRecommendedMonth(month: MonthId, rec: TravelRecommendation) {
  return rec.recommendedMonths.includes(month)
}

export type ChoiceGroupId =
  | 'nationwide'
  | 'dry-festive'
  | 'tet'
  | 'transition'
  | 'wet'

export type ChoiceGroup = {
  id: ChoiceGroupId
  label: string
  months: MonthId[]
}

/**
 * Browse buckets by seasonal character (from month visit copy) —
 * not vague quality ranks like “great” vs “good”.
 */
export function classifyMonthChoices(_rec?: TravelRecommendation): ChoiceGroup[] {
  return [
    {
      id: 'nationwide',
      label: 'Best overall',
      months: [3, 4, 11],
    },
    {
      id: 'dry-festive',
      label: 'Dry coasts & festive cities',
      months: [1, 10, 12],
    },
    {
      id: 'tet',
      label: 'Built around Tết',
      months: [2],
    },
    {
      id: 'transition',
      label: 'Heat rising · skies clearing',
      months: [5, 9],
    },
    {
      id: 'wet',
      label: 'Wet season — lush & flexible',
      months: [6, 7, 8],
    },
  ]
}

/** Months that are the most reliable multi-region windows */
export const EASIEST_NATIONWIDE_MONTHS: MonthId[] = [3, 4, 11]

const MONTH_TILE_DESCRIPTOR: Record<MonthId, string> = {
  1: 'Festive dry',
  2: 'Tết peak',
  3: 'Multi-region',
  4: 'Coast & cities',
  5: 'Heat rising',
  6: 'Summer showers',
  7: 'Heavy rain',
  8: 'Peak wet',
  9: 'Skies clearing',
  10: 'Lantern evenings',
  11: 'Classic dry',
  12: 'Beach peak',
}

export function getMonthTileDescriptor(month: MonthId, _rec?: TravelRecommendation): string {
  return MONTH_TILE_DESCRIPTOR[month]
}

export function weatherComfortLabel(profile: MonthProfile): string {
  if (profile.averageTemperature <= 20) return 'Cooler & crisp'
  if (profile.averageTemperature <= 28) return 'Generally comfortable'
  return 'Warmer days'
}

export function rainDecisionLabel(profile: MonthProfile): string {
  if (profile.rainLevel <= 2) return 'Lower disruption'
  if (profile.rainLevel === 3) return 'Moderate showers'
  return 'Wetter stretch'
}

export function crowdDecisionLabel(profile: MonthProfile): string {
  if (profile.crowdLevel <= 2) return 'Lighter feel'
  if (profile.crowdLevel === 3) return 'Moderate'
  return profile.crowdSummary
}

export function costDecisionLabel(profile: MonthProfile): string {
  if (profile.costLevel <= 2) return 'Good overall value'
  if (profile.costLevel === 3) return 'Fair value'
  return profile.costSummary
}

export function eventsDecisionLabel(profile: MonthProfile): string {
  if (profile.eventsLevel >= 4) return 'Strong activity'
  if (profile.eventsLevel === 3) return 'Steady calendar'
  return 'Quieter calendar'
}
