import type { Experience } from '../types'
import { REGION_ANCHOR_IDS } from './sightRankingFromExperience'
import { rankCityExperiences } from '../services/cityCatalog'

/** Anchors, Vietnam-best picks, and the top 3 ranked sights in each city. */
export function isHighRoiSight(e: Pick<Experience, 'id' | 'vietnamBest'>, cityRank?: number) {
  if (REGION_ANCHOR_IDS.has(e.id)) return true
  if (e.vietnamBest) return true
  return typeof cityRank === 'number' && cityRank <= 3
}

export function highRoiCatalogSights(catalog: Experience[]): Experience[] {
  const byCity = new Map<string, Experience[]>()
  for (const e of catalog) {
    const list = byCity.get(e.city) ?? []
    list.push(e)
    byCity.set(e.city, list)
  }
  const ranks = new Map<string, number>()
  for (const list of byCity.values()) {
    for (const scored of rankCityExperiences(list)) {
      ranks.set(scored.id, scored.cityRank)
    }
  }
  return catalog.filter((e) => isHighRoiSight(e, ranks.get(e.id)))
}
