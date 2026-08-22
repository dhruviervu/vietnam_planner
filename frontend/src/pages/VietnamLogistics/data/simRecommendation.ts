import { BUY_PATHS, filterSimProviders, SIM_PROVIDERS } from './sim'
import type { SimPreference, SimProvider, TripLength } from './types'

export type SimIntentFilter =
  | 'all'
  | 'best-overall'
  | 'best-value'
  | 'best-esim'
  | 'easiest-arrival'
  | 'best-coverage'

export type SimRecommendationLabel =
  | 'best-overall'
  | 'best-value'
  | 'best-esim'
  | 'easiest-arrival'
  | 'best-coverage'

export type SimContext = {
  tripLength: TripLength | null
  /** ISO date if known — no arrival clock time in profile */
  arrivalDate: string | null
  connectionType: Exclude<SimPreference, null>
}

export type ScoredSimProvider = {
  provider: SimProvider
  score: number
  costScore: number
  convenienceScore: number
  coverageScore: number
  validityScore: number
  arrivalFit: number
  tripLengthFit: number
  labels: SimRecommendationLabel[]
  reason: string
  bestFor: string[]
  coverageDots: { nationwide: number; cities: number; remote: number }
}

export type PurchasePathIntel = {
  id: 'airport' | 'store' | 'esim'
  symbol: string
  title: string
  summary: string
  notes: string[]
  costAxis: number
  convenienceAxis: number
  tip: string
  caution?: string
}

const LABEL_COPY: Record<SimRecommendationLabel, string> = {
  'best-overall': '⭐ Best overall',
  'best-value': '💰 Best value',
  'best-esim': '📱 Best eSIM',
  'easiest-arrival': '✈️ Easiest arrival',
  'best-coverage': '📶 Best coverage',
}

/** Curated coverage ratings derived from existing coverage blurbs — not live metrics. */
const COVERAGE: Record<string, { nationwide: number; cities: number; remote: number }> = {
  viettel: { nationwide: 5, cities: 5, remote: 4 },
  vinaphone: { nationwide: 4, cities: 5, remote: 3 },
  mobifone: { nationwide: 3, cities: 4, remote: 2 },
  'travel-esim': { nationwide: 3, cities: 4, remote: 2 },
}

function tripDays(tripLength: TripLength | null): number {
  if (tripLength === 'short') return 10
  if (tripLength === 'medium') return 21
  if (tripLength === 'long') return 35
  return 12
}

function coverageScore(provider: SimProvider): number {
  const c = COVERAGE[provider.id] ?? { nationwide: 3, cities: 3, remote: 2 }
  return c.nationwide * 2 + c.cities + c.remote
}

function valueScore(provider: SimProvider, days: number): number {
  const usableDays = Math.min(provider.validityDays, Math.max(days, 3))
  const gbPerDollar = provider.dataGb / Math.max(provider.priceUsdApprox, 1)
  const validityFit = provider.validityDays >= days ? 8 : provider.validityDays >= days * 0.7 ? 3 : -6
  return gbPerDollar * 10 + validityFit + usableDays * 0.15
}

function convenienceScore(
  provider: SimProvider,
  connectionType: Exclude<SimPreference, null>,
): number {
  let score = 0
  if (connectionType === 'esim') {
    score += provider.esim ? 18 : -20
    if (provider.id === 'travel-esim') score += 10
    if (provider.airport) score += 2
  } else if (connectionType === 'airport') {
    score += provider.airport ? 16 : -20
    if (provider.id === 'mobifone') score += 4
    if (provider.id === 'travel-esim') score -= 12
  } else {
    // physical
    score += provider.id !== 'travel-esim' ? 12 : -25
    score += provider.cityStores ? 6 : 0
    score += provider.airport ? 4 : 0
  }
  return score
}

function arrivalFit(provider: SimProvider, connectionType: Exclude<SimPreference, null>): number {
  // No clock time in profile — prefer options that work without relying on late counters
  if (connectionType === 'esim' && provider.esim) return provider.id === 'travel-esim' ? 12 : 8
  if (connectionType === 'airport' && provider.airport) return 10
  if (connectionType === 'physical' && provider.cityStores) return 6
  return 2
}

function tripLengthFit(provider: SimProvider, days: number): number {
  if (days <= 7) {
    // Short trip: avoid overpaying for oversized packs; shorter validity OK
    if (provider.validityDays <= 20) return 8
    if (provider.priceUsdApprox <= 12) return 6
    return 2
  }
  if (days >= 25) {
    if (provider.validityDays >= 28) return 12
    if (provider.validityDays < 20) return -10
    return 4
  }
  // Medium
  if (provider.validityDays >= 25) return 8
  if (provider.validityDays < 16) return -4
  return 5
}

function buildReason(
  provider: SimProvider,
  ctx: SimContext,
  labels: SimRecommendationLabel[],
): string {
  const days = tripDays(ctx.tripLength)
  if (labels.includes('best-overall')) {
    if (ctx.connectionType === 'esim') {
      return `Strong fit for about ${days} days — solid coverage, enough data and activation without an airport queue.`
    }
    if (ctx.connectionType === 'airport') {
      return `Practical if you want a physical SIM right after landing, with typically available airport desks.`
    }
    return `Sensible physical-SIM choice for roughly ${days} days with store support and balanced value.`
  }
  if (labels.includes('best-value')) {
    return `Lower cost with enough data for a typical ${days}-day trip — good when you want to keep SIM spend modest.`
  }
  if (labels.includes('best-esim')) {
    return 'Best when you want to install before departure and skip airport or store queues.'
  }
  if (labels.includes('easiest-arrival')) {
    return 'Typically the simplest grab-and-go path after landing when you need service immediately.'
  }
  if (labels.includes('best-coverage')) {
    return 'Usually the strongest nationwide option when you expect travel beyond major tourist corridors.'
  }
  return `${provider.dataGb} GB · ${provider.validityDays} days · ~$${provider.priceUsdApprox}`
}

function bestFor(provider: SimProvider, labels: SimRecommendationLabel[]): string[] {
  const list: string[] = []
  if (labels.includes('best-coverage')) list.push('Wider travel')
  if (labels.includes('best-value')) list.push('Budget-conscious')
  if (labels.includes('best-esim') || provider.id === 'travel-esim') list.push('Pre-arrival setup')
  if (labels.includes('easiest-arrival')) list.push('Immediate connection')
  if (provider.validityDays >= 28) list.push('Longer stays')
  if (!list.length) list.push(provider.typicalPackage)
  return list.slice(0, 3)
}

export function scoreSimProviders(ctx: SimContext): ScoredSimProvider[] {
  const days = tripDays(ctx.tripLength)
  const pool = filterSimProviders(ctx.connectionType)

  const scored = pool.map((provider) => {
    const cost = valueScore(provider, days)
    const convenience = convenienceScore(provider, ctx.connectionType)
    const coverage = coverageScore(provider)
    const validity = tripLengthFit(provider, days)
    const arrival = arrivalFit(provider, ctx.connectionType)
    const purchaseFriction =
      (ctx.connectionType === 'esim' && !provider.esim ? 15 : 0) +
      (ctx.connectionType === 'airport' && !provider.airport ? 15 : 0) +
      (provider.id === 'travel-esim' && ctx.connectionType === 'physical' ? 12 : 0)

    const score =
      cost * 1.1 +
      convenience +
      coverage * 1.2 +
      validity +
      arrival +
      (provider.has5g ? 2 : 0) -
      purchaseFriction -
      provider.priceUsdApprox * 0.35

    return {
      provider,
      score,
      costScore: cost,
      convenienceScore: convenience,
      coverageScore: coverage,
      validityScore: validity,
      arrivalFit: arrival,
      tripLengthFit: validity,
      labels: [] as SimRecommendationLabel[],
      reason: '',
      bestFor: [] as string[],
      coverageDots: COVERAGE[provider.id] ?? { nationwide: 3, cities: 3, remote: 2 },
    }
  })

  scored.sort((a, b) => b.score - a.score)

  const assign = (label: SimRecommendationLabel, pick: ScoredSimProvider | undefined) => {
    if (!pick) return
    if (!pick.labels.includes(label)) pick.labels.push(label)
  }

  assign('best-overall', scored[0])
  assign(
    'best-value',
    [...scored].sort((a, b) => b.costScore - a.costScore)[0],
  )
  assign(
    'best-coverage',
    [...scored].sort((a, b) => b.coverageScore - a.coverageScore)[0],
  )
  assign(
    'best-esim',
    scored.find((s) => s.provider.esim && s.provider.id === 'travel-esim') ??
      scored.find((s) => s.provider.esim),
  )
  assign(
    'easiest-arrival',
    scored.find((s) => s.provider.airport && s.provider.id !== 'travel-esim') ??
      scored.find((s) => s.provider.airport),
  )

  return scored.map((s) => ({
    ...s,
    reason: buildReason(s.provider, ctx, s.labels),
    bestFor: bestFor(s.provider, s.labels),
  }))
}

export function labelCopy(label: SimRecommendationLabel): string {
  return LABEL_COPY[label]
}

export function filterByIntent(
  scored: ScoredSimProvider[],
  intent: SimIntentFilter,
): ScoredSimProvider[] {
  if (intent === 'all') return scored
  const matched = scored.filter((s) => s.labels.includes(intent))
  const rest = scored.filter((s) => !s.labels.includes(intent))
  return [...matched, ...rest]
}

export function purchasePathIntel(_ctx: SimContext): PurchasePathIntel[] {
  const lateNote =
    'Arrival time not set — recommendation uses typical availability.'

  return BUY_PATHS.map((path) => {
    if (path.id === 'airport') {
      return {
        id: 'airport',
        symbol: path.symbol,
        title: path.title,
        summary: path.summary,
        notes: [...path.notes],
        costAxis: 0.72,
        convenienceAxis: 0.92,
        tip: 'Fastest after landing when desks are open — often a small convenience premium.',
        caution: lateNote,
      }
    }
    if (path.id === 'store') {
      return {
        id: 'store',
        symbol: path.symbol,
        title: path.title,
        summary: path.summary,
        notes: [...path.notes],
        costAxis: 0.28,
        convenienceAxis: 0.38,
        tip: 'Often better plan choice and support if you can wait until you reach the centre.',
      }
    }
    return {
      id: 'esim',
      symbol: path.symbol,
      title: path.title,
      summary: path.summary,
      notes: [...path.notes],
      costAxis: 0.58,
      convenienceAxis: 0.78,
      tip: 'Best when your phone is unlocked and eSIM-capable — connect before landing.',
      caution: 'Requires an eSIM-compatible unlocked phone.',
    }
  })
}

export function connectionTypeBlurb(type: Exclude<SimPreference, null>): {
  title: string
  bestFor: string
  tradeoff: string
} {
  if (type === 'esim') {
    return {
      title: 'eSIM',
      bestFor: 'Immediate connectivity · unlocked compatible phones · no physical purchase',
      tradeoff: 'Requires a compatible device.',
    }
  }
  if (type === 'airport') {
    return {
      title: 'Airport SIM',
      bestFor: 'Immediate connection · convenience · no need to find a store',
      tradeoff: 'May cost more than city or online options.',
    }
  }
  return {
    title: 'Physical SIM',
    bestFor: 'Phones without eSIM · local store support · simple replacement',
    tradeoff: 'Requires purchase/activation after arrival.',
  }
}

export function primaryRecommendation(scored: ScoredSimProvider[]): ScoredSimProvider | null {
  return scored[0] ?? null
}

/** Keep SIM_PROVIDERS import used for freshness strip */
export function simDataFreshness(): string {
  return SIM_PROVIDERS[0]?.freshness ?? 'updated'
}
