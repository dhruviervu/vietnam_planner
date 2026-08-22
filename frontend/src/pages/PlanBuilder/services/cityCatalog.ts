import type { Experience } from '../types'

export type CityExperienceGroup = {
  city: string
  region: string
  items: Experience[]
  topTags: string[]
}

function popularityScore(e: Experience) {
  // Lower rank = more popular; boost by review volume
  const rank = e.popularityRank ?? 99
  const reviews = e.reviewCount ?? 0
  return rank * 100000 - reviews
}

/** Group by city, sort items by popularity/reviews, cities by top sight popularity. */
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
    const sorted = [...list].sort((a, b) => popularityScore(a) - popularityScore(b))
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

  return groups.sort((a, b) => popularityScore(a.items[0]) - popularityScore(b.items[0]))
}

/** All unique cities from a list, popularity-sorted (for top jump buttons). */
export function listCitiesByPopularity(items: Experience[]): string[] {
  return groupExperiencesByCity(items).map((g) => g.city)
}
