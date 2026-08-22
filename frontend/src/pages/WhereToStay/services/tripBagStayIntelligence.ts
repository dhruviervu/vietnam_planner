import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../../PlanBuilder/data/activities'
import { getClustersForCity } from '../data/clusters'
import { STAY_CITIES } from '../data/cities'
import type { StayCityId, StayCluster } from '../data/types'

export type TripBagStayItem = {
  id: string
  name: string
  kind: 'experience' | 'activity'
  stayCityId: StayCityId | null
  cityLabel: string
  tags: string[]
}

export type TripBagCitySummary = {
  cityId: StayCityId
  label: string
  experienceCount: number
  activityCount: number
  itemNames: string[]
}

export type ClusterRecommendation = {
  cluster: StayCluster
  score: number
  reasons: string[]
  matchedItemNames: string[]
}

/** Map experience/activity place names onto Where-to-Stay city ids. */
export function mapPlaceToStayCity(cityOrRegion: string): StayCityId | null {
  const s = cityOrRegion.trim().toLowerCase()
  if (!s) return null
  if (s.includes('hanoi') || s === 'hà nội') return 'hanoi'
  if (
    s.includes('ho chi minh') ||
    s.includes('hcmc') ||
    s.includes('saigon') ||
    s.includes('sài gòn')
  )
    return 'hcmc'
  if (s.includes('da nang') || s.includes('đà nẵng') || s === 'da-nang') return 'da-nang'
  if (s.includes('hoi an') || s.includes('hội an') || s.includes('near hoi an')) return 'hoi-an'
  if (s.includes('hue') || s.includes('huế')) return 'hue'
  if (s.includes('nha trang')) return 'nha-trang'
  if (s.includes('da lat') || s.includes('dalat') || s.includes('đà lạt')) return 'dalat'
  if (s.includes('phu quoc') || s.includes('phú quốc')) return 'phu-quoc'
  return null
}

export function collectTripBagStayItems(
  experienceIds: string[],
  activityIds: string[],
): TripBagStayItem[] {
  const fromExp: TripBagStayItem[] = EXPERIENCES.filter((e) =>
    experienceIds.includes(e.id),
  ).map((e) => ({
    id: e.id,
    name: e.name,
    kind: 'experience' as const,
    stayCityId: mapPlaceToStayCity(e.city) ?? mapPlaceToStayCity(e.region),
    cityLabel: e.city,
    tags: [e.category, e.signal, ...(e.tags ?? []), ...(e.dna ?? [])].map((t) =>
      String(t).toLowerCase(),
    ),
  }))

  const fromAct: TripBagStayItem[] = CITY_ACTIVITIES.filter((a) =>
    activityIds.includes(a.id),
  ).map((a) => ({
    id: a.id,
    name: a.name,
    kind: 'activity' as const,
    stayCityId: mapPlaceToStayCity(a.cityId) ?? mapPlaceToStayCity(a.cityName),
    cityLabel: a.cityName,
    tags: [a.kind, a.kindLabel, a.popularityTag, ...a.bestFor].map((t) =>
      String(t).toLowerCase(),
    ),
  }))

  return [...fromExp, ...fromAct]
}

export function summarizeTripBagCities(items: TripBagStayItem[]): TripBagCitySummary[] {
  const map = new Map<StayCityId, TripBagCitySummary>()
  for (const item of items) {
    if (!item.stayCityId) continue
    const city = STAY_CITIES.find((c) => c.id === item.stayCityId)
    if (!city) continue
    const cur = map.get(item.stayCityId) ?? {
      cityId: item.stayCityId,
      label: city.label,
      experienceCount: 0,
      activityCount: 0,
      itemNames: [],
    }
    if (item.kind === 'experience') cur.experienceCount += 1
    else cur.activityCount += 1
    if (!cur.itemNames.includes(item.name)) cur.itemNames.push(item.name)
    map.set(item.stayCityId, cur)
  }
  return [...map.values()].sort(
    (a, b) => b.experienceCount + b.activityCount - (a.experienceCount + a.activityCount),
  )
}

function haystack(cluster: StayCluster) {
  return [
    cluster.name,
    cluster.baseYourselfIf,
    ...cluster.character,
    ...cluster.bestFor,
    ...cluster.keyPlaces.map((p) => p.label),
  ]
    .join(' ')
    .toLowerCase()
}

/**
 * Recommend a neighbourhood cluster from trip-bag items in this city.
 * Returns explainable reasons — never hides other clusters.
 */
export function recommendClusterForBag(
  cityId: StayCityId,
  cityItems: TripBagStayItem[],
): ClusterRecommendation | null {
  const clusters = getClustersForCity(cityId)
  if (!clusters.length) return null
  if (!cityItems.length) {
    const fallback = clusters.find((c) => c.isDefault) ?? clusters[0]
    return {
      cluster: fallback,
      score: 0,
      reasons: [
        'A balanced starting base for this city — explore other clusters freely.',
      ],
      matchedItemNames: [],
    }
  }

  const scored = clusters.map((cluster) => {
    let score = 0
    const reasons: string[] = []
    const matched: string[] = []
    const text = haystack(cluster)

    for (const item of cityItems) {
      const nameBits = item.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      const placeHit = cluster.keyPlaces.some((p) => {
        const pl = p.label.toLowerCase()
        return (
          pl.includes(item.name.toLowerCase().slice(0, 12)) ||
          nameBits.some((b) => pl.includes(b)) ||
          item.name.toLowerCase().includes(pl.split(' ')[0] ?? '')
        )
      })
      if (placeHit) {
        score += 18
        matched.push(item.name)
      }

      const tagHit = item.tags.some((t) => text.includes(t) || cluster.bestFor.includes(t as never))
      if (tagHit) score += 6

      // Activity / experience flavour
      if (
        item.tags.some((t) =>
          ['beach', 'surf', 'an bang', 'my khe', 'beaches'].some((k) => t.includes(k)),
        )
      ) {
        score += cluster.metrics.beachAccess * 3
        if (cluster.metrics.beachAccess >= 4 && !reasons.some((r) => r.includes('beach'))) {
          reasons.push('Strong beach access for the coastal plans in your trip bag.')
        }
      }
      if (
        item.tags.some((t) =>
          ['food', 'class', 'eat', 'cooking', 'café', 'cafe'].some((k) => t.includes(k)),
        )
      ) {
        if (cluster.bestFor.includes('food')) {
          score += 10
          if (!reasons.some((r) => r.includes('food'))) {
            reasons.push('Excellent food access for the culinary picks you selected.')
          }
        }
      }
      if (
        item.tags.some((t) =>
          ['culture', 'history', 'old', 'temple', 'lantern', 'museum'].some((k) =>
            t.includes(k),
          ),
        ) ||
        /old town|quarter|citadel|lantern|temple/i.test(item.name)
      ) {
        score += cluster.metrics.sightseeingAccess * 2.5
        if (cluster.bestFor.includes('culture') || cluster.bestFor.includes('walkable')) {
          score += 8
        }
      }
      if (item.tags.some((t) => ['nightlife', 'music', 'karaoke', 'dance'].some((k) => t.includes(k)))) {
        score += cluster.metrics.nightlife * 2
      }
      if (item.kind === 'activity' && /walk|class|workshop|market/i.test(item.name)) {
        score += cluster.metrics.walkability * 1.5
      }
    }

    // Structural quality
    score += cluster.metrics.locationScore * 2
    score += cluster.metrics.walkability
    score += cluster.metrics.sightseeingAccess
    if (cluster.isDefault) score += 3
    score += (cluster.transportAccess.walkabilityLabel.toLowerCase().includes('excellent')
      ? 4
      : cluster.transportAccess.taxiLabel.toLowerCase().includes('easy')
        ? 2
        : 0)

    if (matched.length && !reasons.some((r) => r.includes('closer'))) {
      const sample = matched.slice(0, 2).join(' and ')
      reasons.unshift(`Closer to your selected plans — especially ${sample}.`)
    }

    if (
      cluster.metrics.locationScore >= 4 &&
      cluster.metrics.walkability >= 4 &&
      !reasons.some((r) => r.includes('connectivity') || r.includes('walk'))
    ) {
      reasons.push('Prime connectivity and walkability for moving between your selected stops.')
    }

    if (!reasons.length) {
      reasons.push(cluster.baseYourselfIf)
    }

    return {
      cluster,
      score,
      reasons: reasons.slice(0, 3),
      matchedItemNames: [...new Set(matched)].slice(0, 4),
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0] ?? null
}

export function unmappedBagPlaces(items: TripBagStayItem[]) {
  return items.filter((i) => !i.stayCityId)
}
