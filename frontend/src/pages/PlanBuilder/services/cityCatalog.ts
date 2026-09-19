import type { Experience } from '../types'
import { SIGHT_CATALOG } from '../data/experiences'
import { bayesianRating, rankAndSortSights, buildCategoryStats, touristReviewCount, type SightScores } from '../lib/sightRanking'
import { experienceToSight } from '../lib/sightRankingFromExperience'
import { cityToSlug } from './citySlug'

export { cityToSlug, cityAnchorId, experiencesCityPath } from './citySlug'

export type RankedExperience = Experience & SightScores & { cityRank: number }

export type CityExperienceGroup = {
  city: string
  region: string
  items: RankedExperience[]
  topTags: string[]
}

/**
 * Traveler-weighted rating 0–5. Google Maps volume is capped / civic-damped
 * before the Bayesian average. Display order is `rankCityExperiences`.
 * Itinerary packing still uses `experiencePriority` — do not swap those to totalScore.
 */
export function reviewPopularityScore(e: Experience) {
  return bayesianRating(e.reviewCount, e.rating)
}

let GLOBAL_RANK_STATS: ReturnType<typeof buildCategoryStats> | undefined

function globalRankStats() {
  GLOBAL_RANK_STATS ??= buildCategoryStats(SIGHT_CATALOG.map(experienceToSight))
  return GLOBAL_RANK_STATS
}

export function slugToCity(slug: string, cities: string[]): string | null {
  return cities.find((c) => cityToSlug(c) === slug) ?? null
}

export function rankCityExperiences(items: Experience[]): RankedExperience[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  return rankAndSortSights(items.map(experienceToSight), {
    stats: globalRankStats(),
    promoteAnchors: true,
  }).map((scored, index) => {
    const item = byId.get(scored.id)
    if (!item) {
      throw new Error(`rankCityExperiences: missing experience ${scored.id}`)
    }
    return {
      ...item,
      cityRank: index + 1,
      bayesianRating: scored.bayesianRating,
      bayesianScore: scored.bayesianScore,
      volumeFactor: scored.volumeFactor,
      freshnessMultiplier: scored.freshnessMultiplier,
      durationFairness: scored.durationFairness,
      touristWeight: scored.touristWeight,
      civicScale: scored.civicScale,
      belowReviewFloor: scored.belowReviewFloor,
      isAnchor: scored.isAnchor,
      tierWeight: scored.tierWeight,
      categoryWeight: scored.categoryWeight,
      frictionPenalty: scored.frictionPenalty,
      totalScore: scored.totalScore,
    }
  })
}

/** Group by city, sort items by rank, cities by top sight popularity. */
export function groupExperiencesByCity(items: Experience[]): CityExperienceGroup[] {
  const map = new Map<string, Experience[]>()
  for (const item of items) {
    const key = item.city || item.region
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }

  const groups: CityExperienceGroup[] = []
  for (const [city, list] of map) {
    const sorted = rankCityExperiences(list)
    const tagCounts = new Map<string, number>()
    for (const e of sorted) {
      tagCounts.set(e.popularityTag, (tagCounts.get(e.popularityTag) ?? 0) + 1)
    }
    const topTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t)

    groups.push({
      city,
      region: sorted[0]?.region ?? city,
      items: sorted,
      topTags,
    })
  }

  return groups.sort((a, b) => {
    const reviewsA = a.items.reduce((sum, item) => sum + touristReviewCount(experienceToSight(item)), 0)
    const reviewsB = b.items.reduce((sum, item) => sum + touristReviewCount(experienceToSight(item)), 0)
    if (reviewsB !== reviewsA) return reviewsB - reviewsA
    return (b.items[0]?.totalScore ?? 0) - (a.items[0]?.totalScore ?? 0)
  })
}

type UnfilteredCityCatalog = {
  groups: CityExperienceGroup[]
  rankById: Map<string, number>
  cities: string[]
}

let unfilteredCityCatalog: UnfilteredCityCatalog | null = null

/** Rank the full sight catalog once; browsing the sights page should reuse this. */
export function getUnfilteredCityCatalog(): UnfilteredCityCatalog {
  if (!unfilteredCityCatalog) {
    const groups = groupExperiencesByCity(SIGHT_CATALOG)
    const rankById = new Map<string, number>()
    for (const group of groups) {
      for (const item of group.items) rankById.set(item.id, item.cityRank)
    }
    unfilteredCityCatalog = { groups, rankById, cities: groups.map((g) => g.city) }
  }
  return unfilteredCityCatalog
}

export function buildCityRankIndex(items: Experience[]): Map<string, number> {
  if (items === SIGHT_CATALOG) return getUnfilteredCityCatalog().rankById
  const map = new Map<string, number>()
  for (const group of groupExperiencesByCity(items)) {
    for (const item of group.items) {
      map.set(item.id, item.cityRank)
    }
  }
  return map
}

/** All unique cities from a list, popularity-sorted (for top jump buttons). */
export function listCitiesByPopularity(items: Experience[]): string[] {
  if (items === SIGHT_CATALOG) return getUnfilteredCityCatalog().cities
  return groupExperiencesByCity(items).map((g) => g.city)
}
