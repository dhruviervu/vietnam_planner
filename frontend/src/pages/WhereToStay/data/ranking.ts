import type {
  CityGlance,
  CostLevel,
  MatchLabel,
  StayCity,
  StayCluster,
  StayFilterId,
  StayListingFilterId,
  StayProperty,
  StaySortId,
} from './types'

const FILTER_SCORE: Record<StayFilterId, (cluster: StayCluster) => number> = {
  budget: (cluster) => (5 - cluster.costLevel) * 4,
  central: (cluster) => cluster.metrics.locationScore * 3,
  quiet: (cluster) => cluster.metrics.quietness * 3,
  nightlife: (cluster) => cluster.metrics.nightlife * 3,
  families: (cluster) => cluster.metrics.familySuitability * 3,
  'first-trip': (cluster) =>
    cluster.metrics.locationScore * 2 + cluster.metrics.sightseeingAccess,
  beach: (cluster) => cluster.metrics.beachAccess * 3,
  luxury: (cluster) => cluster.costLevel * 3,
  walkable: (cluster) => cluster.metrics.walkability * 3,
  food: (cluster) =>
    cluster.bestFor.includes('food') ? 14 : cluster.metrics.localFeel * 2,
  culture: (cluster) =>
    cluster.bestFor.includes('culture')
      ? 14
      : cluster.metrics.sightseeingAccess * 2,
}

/**
 * Editorial neighborhood score. It intentionally uses broad fit signals rather
 * than implying a mathematically precise recommendation.
 */
export function scoreCluster(
  cluster: StayCluster,
  filters: StayFilterId[],
): number {
  const baseline =
    cluster.metrics.locationScore * 2 +
    cluster.metrics.walkability +
    cluster.metrics.sightseeingAccess +
    (cluster.isDefault ? 4 : 0)

  if (filters.length === 0) return baseline

  const filterFit = filters.reduce((score, filter) => {
    const explicitFit = cluster.bestFor.includes(filter) ? 6 : 0
    return score + FILTER_SCORE[filter](cluster) + explicitFit
  }, 0)

  return baseline + filterFit / filters.length
}

export type RankedCluster = {
  cluster: StayCluster
  score: number
  match: MatchLabel
}

export function rankClusters(
  clusters: StayCluster[],
  filters: StayFilterId[],
): RankedCluster[] {
  const ranked = clusters
    .map((cluster) => ({ cluster, score: scoreCluster(cluster, filters) }))
    .sort((a, b) => b.score - a.score)

  const topScore = ranked[0]?.score ?? 0

  return ranked.map(({ cluster, score }, index) => {
    let match: MatchLabel = 'possible'
    if (index === 0 || score >= topScore * 0.9) match = 'recommended'
    else if (score >= topScore * 0.72) match = 'good'
    return { cluster, score: Math.round(score * 10) / 10, match }
  })
}

function propertyFilterFit(
  property: StayProperty,
  filters: StayFilterId[],
): number {
  if (filters.length === 0) return 0
  return (
    filters.reduce(
      (score, filter) => score + (property.bestFor.includes(filter) ? 1 : 0),
      0,
    ) / filters.length
  )
}

function valueScore(property: StayProperty): number {
  const midpoint = property.typicalNightlyRange
    ? (property.typicalNightlyRange[0] + property.typicalNightlyRange[1]) / 2
    : property.costLevel * 55
  return property.rating * 20 - midpoint / 8
}

function distanceMinutes(label: string): number {
  const match = label.match(/\d+/)
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY
}

function midPrice(property: StayProperty): number {
  if (!property.typicalNightlyRange) return property.costLevel * 55
  return (property.typicalNightlyRange[0] + property.typicalNightlyRange[1]) / 2
}

function matchesListingFilter(
  stay: StayProperty,
  filter: StayListingFilterId,
): boolean {
  switch (filter) {
    case 'cost-budget':
      return stay.costLevel === 1
    case 'cost-mid':
      return stay.costLevel === 2
    case 'cost-premium':
      return stay.costLevel === 3
    case 'cost-luxury':
      return stay.costLevel === 4
    case 'rating-45':
      return stay.rating >= 4.5
    case 'rating-47':
      return stay.rating >= 4.7
    case 'rating-48':
      return stay.rating >= 4.8
    case 'type-hotel':
      return stay.propertyType === 'hotel'
    case 'type-apartment':
      return stay.propertyType === 'apartment'
    case 'type-airbnb':
      return stay.propertyType === 'airbnb'
    case 'type-resort':
      return stay.propertyType === 'resort'
    case 'type-villa':
      return stay.propertyType === 'villa'
    case 'pets-yes':
      return stay.petsAllowed
    case 'caretaker-yes':
      return stay.caretaker
    case 'smoking-yes':
      return stay.smokingAllowed
    case 'drinking-yes':
      return stay.drinkingAllowed
    case 'no-smoking':
      return !stay.smokingAllowed
    case 'quiet-hours':
      return stay.quietHours
    case 'flexible-cancel':
      return stay.flexibleCancel
    case 'instant-book':
      return stay.instantBook
    default:
      return true
  }
}

/** Within a category, filters are OR; across categories they are AND. */
export function filterStaysByListing(
  stays: StayProperty[],
  listingFilters: StayListingFilterId[],
  categories: { id: string; filters: StayListingFilterId[] }[],
): StayProperty[] {
  if (!listingFilters.length) return stays

  return stays.filter((stay) =>
    categories.every((cat) => {
      const active = cat.filters.filter((f) => listingFilters.includes(f))
      if (!active.length) return true
      return active.some((f) => matchesListingFilter(stay, f))
    }),
  )
}

export function rankStays(
  stays: StayProperty[],
  sort: StaySortId,
  filters: StayFilterId[],
): StayProperty[] {
  return [...stays].sort((a, b) => {
    const fitDifference = propertyFilterFit(b, filters) - propertyFilterFit(a, filters)

    if (sort === 'recommended') {
      const recommendationDifference =
        b.rating * 10 +
        propertyFilterFit(b, filters) * 15 -
        b.costLevel -
        (a.rating * 10 + propertyFilterFit(a, filters) * 15 - a.costLevel)
      return recommendationDifference || a.name.localeCompare(b.name)
    }

    if (sort === 'price-low') return midPrice(a) - midPrice(b) || b.rating - a.rating
    if (sort === 'price-high') return midPrice(b) - midPrice(a) || b.rating - a.rating

    if (fitDifference) return fitDifference
    if (sort === 'best-rated') return b.rating - a.rating || valueScore(b) - valueScore(a)
    if (sort === 'best-value') return valueScore(b) - valueScore(a)
    return distanceMinutes(a.distanceLabel) - distanceMinutes(b.distanceLabel)
  })
}

export function getCityGlance(city: StayCity): CityGlance {
  return city.glance
}

export function cityGlanceItems(
  city: StayCity,
): { label: string; value: string }[] {
  const items = [
    { label: 'First trip', value: city.glance.bestFirstTrip },
    { label: 'Quiet stay', value: city.glance.bestQuiet },
    { label: 'Best value', value: city.glance.bestValue },
  ]
  if (city.glance.bestBeach) {
    items.push({ label: 'Beach stay', value: city.glance.bestBeach })
  }
  return items
}

export function costLevelLabel(level: CostLevel): '$' | '$$' | '$$$' | '$$$$' {
  return '$'.repeat(level) as '$' | '$$' | '$$$' | '$$$$'
}

export function metricDots(value: number, maximum = 5): boolean[] {
  return Array.from({ length: maximum }, (_, index) => index < value)
}
