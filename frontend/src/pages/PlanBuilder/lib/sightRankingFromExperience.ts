import type { Experience, ExperienceCategory } from '../types'
import type { RankCategory, Sight } from './sightRanking'

/**
 * UNESCO headlines and a few city-defining must-sees. These are guaranteed
 * rank #1–#3 in their city after the composite score sorts them among themselves.
 * Inner caves, tombs, and photo-stops stay off this list even if copy mentions UNESCO.
 */
export const REGION_ANCHOR_IDS = new Set([
  'halong-cruise',
  'lan-ha-bay',
  'cat-ba-national-park',
  'hoi-an-lanterns',
  'hoi-an-ancient-town',
  'hue-citadel',
  'ninh-binh',
  'trang-an-boats',
  'phong-nha',
  'my-son',
  'thang-long-citadel',
  'temple-literature',
  'old-quarter',
  'hoan-kiem-lake',
  'dong-van-geopark',
  'fansipan',
  'war-remnants',
  'independence-palace',
  'cu-chi',
  'ben-thanh',
  'notre-dame-saigon',
])

export function rankingCategoryFor(e: {
  category: ExperienceCategory
  name?: string
  dna?: string[]
  sightSection?: string
}): RankCategory {
  const blob = `${e.name ?? ''} ${(e.dna ?? []).join(' ')} ${e.sightSection ?? ''} ${e.category}`.toLowerCase()
  if (/\bmarket\b|chợ|cho [a-z]|bazaar/.test(blob)) return 'markets'
  if (/\bmuseum\b|gallery|exhibition/.test(blob)) return 'museums'
  if (e.category === 'Nature') return 'nature'
  if (e.category === 'Beaches') return 'beaches'
  if (e.category === 'Nightlife') return 'nightlife'
  if (e.category === 'Food') return 'food'
  if (e.category === 'Adventure') return 'adventure'
  if (e.category === 'History') return 'historical'
  if (e.category === 'Culture') return /\bmuseum\b/.test(blob) ? 'museums' : 'historical'
  return 'urban'
}

export function isRegionAnchor(id: string): boolean {
  return REGION_ANCHOR_IDS.has(id)
}

/**
 * Working civic / municipal buildings attract huge Google Maps volume from
 * locals (mail, paperwork, commuting). Those counts are not tourist reviews.
 */
export function isLocalReviewBiased(e: {
  id?: string
  name?: string
  sightSection?: string
}): boolean {
  const blob = `${e.id ?? ''} ${e.name ?? ''} ${e.sightSection ?? ''}`.toLowerCase()
  if (/hospital.?cave|cave hospital|hang quân y|hang quan y/.test(blob)) return false
  return /post.?office|bưu điện|buu dien|people'?s committee|people’s committee|city hall|ubnd/.test(
    blob,
  )
}

/** @deprecated Duration is a fairness factor, not a rank bonus. */
export type CategoryAnchor = 'HIGH_ANCHOR' | 'MEDIUM_ANCHOR' | 'QUICK_STOP'
/** @deprecated Anchors are REGION_ANCHOR_IDS, not vietnamBest. */
export type SignificanceTier = 'WORLD_ANCHOR' | 'MAJOR_REGIONAL' | 'SECONDARY_LOCAL' | 'NICHE_GEM'

export function inferSignificanceTier(e: {
  id?: string
  vietnamBest?: boolean
  featured?: boolean
  hiddenGem?: boolean
  signal?: Experience['signal']
}): SignificanceTier {
  if (e.id && REGION_ANCHOR_IDS.has(e.id)) return 'WORLD_ANCHOR'
  if (e.featured || e.signal === 'must-do') return 'MAJOR_REGIONAL'
  if (e.hiddenGem || e.signal === 'hidden-gem') return 'NICHE_GEM'
  if (
    e.signal === 'vietnam-special' ||
    e.signal === 'picture-perfect' ||
    e.signal === 'adventure' ||
    e.signal === 'local-life' ||
    e.signal === 'slow-scenic'
  ) {
    return 'SECONDARY_LOCAL'
  }
  return 'NICHE_GEM'
}

export function inferCategoryAnchor(durationHours?: number | null): CategoryAnchor {
  const hours = typeof durationHours === 'number' && Number.isFinite(durationHours) ? durationHours : 0
  if (hours >= 4) return 'HIGH_ANCHOR'
  if (hours >= 1.5) return 'MEDIUM_ANCHOR'
  return 'QUICK_STOP'
}

export function experienceToSight(e: Experience): Sight {
  return {
    id: e.id,
    name: e.name,
    rating: e.rating,
    reviewCount: e.reviewCount,
    rankCategory: rankingCategoryFor(e),
    durationHours: e.durationHours,
    popularityRank: e.popularityRank,
    localReviewBias: isLocalReviewBiased(e),
    isAnchor: isRegionAnchor(e.id),
    city: e.city,
    region: e.region,
  }
}
