import type { Experience } from '../types'

export type RankedExperience = Experience & { cityRank: number }

export type CityExperienceGroup = {
  city: string
  region: string
  items: RankedExperience[]
  topTags: string[]
}

function popularityScore(e: Experience) {
  const rank = e.popularityRank ?? 99
  const reviews = e.reviewCount ?? 0
  const rating = e.rating ?? 0
  return rank * 100000 - reviews * 10 - rating * 100
}

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function cityAnchorId(city: string): string {
  return `city-${cityToSlug(city)}`
}

export function slugToCity(slug: string, cities: string[]): string | null {
  return cities.find((c) => cityToSlug(c) === slug) ?? null
}

export function experiencesCityPath(city: string): string {
  return `/plan/builder/experiences/city/${cityToSlug(city)}`
}

export function rankCityExperiences(items: Experience[]): RankedExperience[] {
  return [...items]
    .sort((a, b) => popularityScore(a) - popularityScore(b))
    .map((item, index) => ({ ...item, cityRank: index + 1 }))
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

  return groups.sort(
    (a, b) => popularityScore(a.items[0]) - popularityScore(b.items[0]),
  )
}

export function buildCityRankIndex(items: Experience[]): Map<string, number> {
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
  return groupExperiencesByCity(items).map((g) => g.city)
}
