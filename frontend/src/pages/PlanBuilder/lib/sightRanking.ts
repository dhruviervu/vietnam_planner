/**
 * Catalog display ranking for sights.
 *
 * Traveler ranking — not raw Google Maps volume. Locals review post offices,
 * city halls, and stations at a scale tourists never do, so Google `reviewCount`
 * is capped and civic POIs are discounted before scoring.
 *
 *   v* = touristReviewCount (capped Maps volume, civic-damped)
 *   S  = (v*·R + m·C) / (v* + m)     Bayesian average
 * Must-visit score leans on historical integrity, landscape uniqueness, and
 * cultural preservation — not raw Maps volume from backpacker strips.
 *
 * Then: review floor, then UNESCO / must-see anchors locked into city #1–#3.
 * Not used to pack itinerary days.
 */

export const RATING_SCALE = 5
export const REVIEW_FLOOR = 20
/** Stronger log-volume so a 4.9 with 40 reviews cannot beat a 4.5 with thousands. */
export const VOLUME_ALPHA = 0.42
export const ANCHOR_TOP_SLOTS = 5
/** Google Maps saturates far above traveler-review sites for Vietnam POIs. */
export const TOURIST_VOLUME_CAP = 20000
/** Working civic buildings: most Maps reviews are locals, not visitors. */
export const CIVIC_VOLUME_SCALE = 0.08
export const CIVIC_SCORE_SCALE = 0.34

/** Fallbacks when a category has too few samples to estimate C / m. */
export const BAYESIAN_C = 4.2
export const BAYESIAN_M = 200

export type RankCategory =
  | 'nature'
  | 'historical'
  | 'markets'
  | 'museums'
  | 'urban'
  | 'food'
  | 'adventure'
  | 'beaches'
  | 'nightlife'

export type Sight = {
  id: string
  name?: string
  rating?: number | null
  reviewCount?: number | null
  rankCategory?: RankCategory | null
  durationHours?: number | null
  /** 1 = most popular with travelers (catalog tourist rank). */
  popularityRank?: number | null
  /** True when Maps volume is dominated by locals (post office, city hall, …). */
  localReviewBias?: boolean
  /** Mean age of reviews in years, if known. */
  meanReviewAgeYears?: number | null
  isAnchor?: boolean
  city?: string
  region?: string
  /** @deprecated ignored — kept so old catalog overrides still type-check */
  significanceTier?: string | null
  categoryAnchor?: string | null
  transitFrictionMinutes?: number | null
}

export type CategoryStats = { C: number; m: number; n: number }

export type RankingStats = {
  global: CategoryStats
  byCategory: Partial<Record<RankCategory, CategoryStats>>
}

export type SightScores = {
  bayesianRating: number
  volumeFactor: number
  freshnessMultiplier: number
  durationFairness: number
  touristWeight: number
  civicScale: number
  belowReviewFloor: boolean
  isAnchor: boolean
  totalScore: number
  /** Compat aliases for cards that still read the old breakdown. */
  bayesianScore: number
  tierWeight: number
  categoryWeight: number
  frictionPenalty: number
}

export type ScoredSight = Sight & SightScores

export type RankOptions = {
  stats?: RankingStats
  promoteAnchors?: boolean
  /**
   * Re-rank travelerFame from tourist review volume inside this list.
   * Catalog `popularityRank` mixes global and city-local scales, which lets
   * unknown extras outrank city icons. Default on for city catalogs.
   */
  cityRelativeFame?: boolean
}

function finiteNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return value
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function reviewsOf(sight: Pick<Sight, 'reviewCount'>): number {
  return Math.max(0, finiteNumber(sight.reviewCount, 0))
}

/**
 * Maps volume mixed with locals. Cap it at traveler-site scale, then shrink
 * civic listings so a 20k-review post office cannot outrank a museum.
 */
export function touristReviewCount(
  sight: Pick<Sight, 'reviewCount' | 'localReviewBias'>,
): number {
  const capped = Math.min(reviewsOf(sight), TOURIST_VOLUME_CAP)
  if (sight.localReviewBias) return Math.round(capped * CIVIC_VOLUME_SCALE)
  return capped
}

/** Catalog tourist rank: 1 is the sight travelers actually plan around. */
export function travelerFame(popularityRank?: number | null): number {
  if (typeof popularityRank !== 'number' || !Number.isFinite(popularityRank) || popularityRank < 1) {
    return 0.72
  }
  return clamp(1.22 / (1 + (popularityRank - 1) * 0.09), 0.4, 1.22)
}

/** City-list fame from tourist volume, not the mixed global/local catalog field. */
export function withTouristVolumeFame(sights: Sight[]): Sight[] {
  const order = [...sights].sort((a, b) => {
    const reviewDelta = touristReviewCount(b) - touristReviewCount(a)
    if (reviewDelta !== 0) return reviewDelta
    const ratingDelta = ratingOf(b, 0) - ratingOf(a, 0)
    if (ratingDelta !== 0) return ratingDelta
    return String(a.id ?? '').localeCompare(String(b.id ?? ''))
  })
  const fameRank = new Map(order.map((sight, index) => [sight.id, index + 1]))
  return sights.map((sight) => ({
    ...sight,
    popularityRank: fameRank.get(sight.id) ?? sight.popularityRank,
  }))
}

function ratingOf(sight: Pick<Sight, 'rating'>, fallback: number): number {
  return clamp(finiteNumber(sight.rating, fallback), 0, RATING_SCALE)
}

export function bayesianRating(
  reviewCount?: number | null,
  rating?: number | null,
  m: number = BAYESIAN_M,
  C: number = BAYESIAN_C,
): number {
  const v = Math.max(0, finiteNumber(reviewCount, 0))
  const r = clamp(finiteNumber(rating, C), 0, RATING_SCALE)
  const prior = Math.max(1, finiteNumber(m, BAYESIAN_M))
  const centre = clamp(finiteNumber(C, BAYESIAN_C), 0, RATING_SCALE)
  return (v * r + prior * centre) / (v + prior)
}

/** @deprecated Use bayesianRating; kept for older callers. */
export function bayesianScore(reviewCount?: number | null, rating?: number | null): number {
  return (bayesianRating(reviewCount, rating) / RATING_SCALE) * 100
}

/**
 * Recent reviews (<1 year) carry 3× the weight of reviews older than 3 years.
 * freshness(0) = 3, freshness(3) = 1, freshness(6) ≈ 0.33.
 */
export function freshnessMultiplier(meanReviewAgeYears?: number | null): number {
  const age = Math.max(0, finiteNumber(meanReviewAgeYears, 1.4))
  return clamp(3 ** (1 - age / 3), 0.4, 3)
}

/** High-volume listings keep getting new reviews; sparse ones skew older. */
export function inferMeanReviewAgeYears(reviewCount?: number | null): number {
  const v = Math.max(0, finiteNumber(reviewCount, 0))
  if (v >= 5000) return 0.7
  if (v >= 1500) return 1.0
  if (v >= 400) return 1.6
  if (v >= 80) return 2.4
  return 3.2
}

export function volumeFactor(reviewCount?: number | null, alpha = VOLUME_ALPHA): number {
  const v = Math.max(1, finiteNumber(reviewCount, 0))
  return 1 + alpha * Math.log10(v)
}

/** Historical / dynastic / archaeological weight. Markets next to tourist strips score low. */
export function heritageIntegrity(sight: Sight): number {
  const cat = sight.rankCategory ?? 'urban'
  if (sight.isAnchor && (cat === 'historical' || cat === 'museums')) return 1.55
  if (cat === 'historical') return 1.38
  if (cat === 'museums') return 1.28
  if (cat === 'nature' || cat === 'beaches' || cat === 'adventure') return 1.02
  if (cat === 'markets' || cat === 'nightlife' || cat === 'food') return 0.78
  return 0.88
}

/** Geological rarity and landscape that cannot be swapped for a city park. */
export function landscapeUniqueness(sight: Sight): number {
  const cat = sight.rankCategory ?? 'urban'
  if (sight.isAnchor && (cat === 'nature' || cat === 'adventure' || cat === 'beaches')) return 1.55
  if (cat === 'nature' || cat === 'adventure') return 1.36
  if (cat === 'beaches') return 1.18
  if (cat === 'historical' || cat === 'museums') return 1.04
  if (cat === 'urban' || cat === 'markets' || cat === 'nightlife') return 0.76
  return 0.92
}

/** Living culture that is not just foot-traffic around a backpacker street. */
export function culturalPreservation(sight: Sight): number {
  const cat = sight.rankCategory ?? 'urban'
  if (sight.isAnchor && (cat === 'historical' || cat === 'urban')) return 1.4
  if (cat === 'historical') return 1.22
  if (cat === 'food' || cat === 'markets') return 1.08
  if (cat === 'nightlife' || cat === 'urban') return 0.74
  return 1
}

/**
 * A 15-minute statue and an all-day park are different products.
 * Don't let either win purely by being long or by being a photo stop with a viral pin.
 */
export function durationFairness(durationHours?: number | null): number {
  const hours = Math.max(0, finiteNumber(durationHours, 2))
  if (hours > 0 && hours < 0.75) return 0.9
  if (hours >= 6) return 0.93
  return 1
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, n) => s + n, 0) / values.length
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
}

export function buildCategoryStats(sights: Sight[]): RankingStats {
  const list = Array.isArray(sights) ? sights : []
  const trusted = list.filter((s) => touristReviewCount(s) >= REVIEW_FLOOR)
  const pool = trusted.length >= 8 ? trusted : list

  const ratings = pool.map((s) => ratingOf(s, BAYESIAN_C))
  const counts = pool.map((s) => touristReviewCount(s)).filter((v) => v > 0)
  const global: CategoryStats = {
    C: ratings.length ? mean(ratings) : BAYESIAN_C,
    m: clamp(counts.length ? median(counts) : BAYESIAN_M, 80, 600),
    n: pool.length,
  }

  const buckets = new Map<RankCategory, Sight[]>()
  for (const s of pool) {
    const cat = s.rankCategory ?? 'urban'
    const rows = buckets.get(cat) ?? []
    rows.push(s)
    buckets.set(cat, rows)
  }

  const byCategory: RankingStats['byCategory'] = {}
  for (const [cat, rows] of buckets) {
    if (rows.length < 3) continue
    const r = rows.map((s) => ratingOf(s, global.C))
    const v = rows.map((s) => touristReviewCount(s)).filter((n) => n > 0)
    byCategory[cat] = {
      C: mean(r),
      m: clamp(v.length ? median(v) : global.m, 80, 600),
      n: rows.length,
    }
  }

  return { global, byCategory }
}

function statsFor(sight: Sight, stats?: RankingStats): CategoryStats {
  const cat = sight.rankCategory ?? 'urban'
  return stats?.byCategory[cat] ?? stats?.global ?? { C: BAYESIAN_C, m: BAYESIAN_M, n: 0 }
}

export function scoreSight(sight: Sight, stats?: RankingStats): SightScores {
  const { C, m } = statsFor(sight, stats)
  const v = touristReviewCount(sight)
  const S = bayesianRating(v, sight.rating, m, C)
  const vol = 1 + 0.06 * Math.log10(Math.max(1, v))
  const age = sight.meanReviewAgeYears ?? inferMeanReviewAgeYears(v)
  const fresh = 0.85 + 0.15 * (freshnessMultiplier(age) / 3)
  const dur = durationFairness(sight.durationHours)
  const fame = travelerFame(sight.popularityRank)
  const civic = sight.localReviewBias ? CIVIC_SCORE_SCALE : 1
  const heritage = heritageIntegrity(sight)
  const landscape = landscapeUniqueness(sight)
  const culture = culturalPreservation(sight)
  const quality = 0.92 + 0.08 * (S / RATING_SCALE)
  const total = heritage * landscape * culture * civic * dur * fame * vol * fresh * quality * 8
  return {
    bayesianRating: S,
    volumeFactor: vol,
    freshnessMultiplier: fresh,
    durationFairness: dur,
    touristWeight: fame,
    civicScale: civic,
    belowReviewFloor: v < REVIEW_FLOOR,
    isAnchor: Boolean(sight.isAnchor),
    totalScore: total,
    bayesianScore: (S / RATING_SCALE) * 100,
    tierWeight: sight.isAnchor ? 1 : 0,
    categoryWeight: heritage * landscape * culture,
    frictionPenalty: 0,
  }
}

function compareScored(a: ScoredSight, b: ScoredSight): number {
  if (a.belowReviewFloor !== b.belowReviewFloor) return a.belowReviewFloor ? 1 : -1
  const scoreDelta = b.totalScore - a.totalScore
  if (Math.abs(scoreDelta) > 1e-9) return scoreDelta
  const reviewDelta = touristReviewCount(b) - touristReviewCount(a)
  if (reviewDelta !== 0) return reviewDelta
  const ratingDelta = ratingOf(b, 0) - ratingOf(a, 0)
  if (ratingDelta !== 0) return ratingDelta
  return String(a.id ?? '').localeCompare(String(b.id ?? ''))
}

function promoteAnchors(ranked: ScoredSight[], slots = ANCHOR_TOP_SLOTS): ScoredSight[] {
  const anchors = ranked.filter((s) => s.isAnchor && !s.belowReviewFloor)
  if (anchors.length === 0) return ranked
  const top = [...anchors].sort(compareScored).slice(0, slots)
  const topIds = new Set(top.map((s) => s.id))
  const rest = ranked.filter((s) => !topIds.has(s.id))
  return [...top, ...rest]
}

export function rankAndSortSights(sights: Sight[], options: RankOptions = {}): ScoredSight[] {
  const raw = Array.isArray(sights) ? sights : []
  if (raw.length === 0) return []
  const list = options.cityRelativeFame === true ? withTouristVolumeFame(raw) : raw
  const stats = options.stats ?? buildCategoryStats(list)
  const ranked = list
    .map((sight) => ({ ...sight, ...scoreSight(sight, stats) }))
    .sort(compareScored)
  if (options.promoteAnchors === false) return ranked
  return promoteAnchors(ranked)
}

/** @deprecated Transit friction is no longer part of popularity rank. */
export function frictionPenalty(_transitFrictionMinutes?: number | null): number {
  return 0
}
