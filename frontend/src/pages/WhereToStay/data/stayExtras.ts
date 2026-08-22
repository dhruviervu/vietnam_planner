import type { CostLevel, StayFilterId } from './types'
import { STAY_CLUSTERS } from './clusters'

type ExtraSeed = {
  id: string
  clusterId: string
  name: string
  rating: number
  costLevel: CostLevel
  typicalNightlyRange: [number, number]
  distanceLabel: string
  amenities: string[]
  bestFor: StayFilterId[]
  reason: string
  imageIndex: number
}

const TEMPLATES: {
  suffix: string
  rating: number
  costLevel: CostLevel
  range: [number, number]
  amenities: string[]
  bestFor: StayFilterId[]
  reason: string
  distance: string
}[] = [
  {
    suffix: 'Boutique Stay',
    rating: 4.6,
    costLevel: 3,
    range: [55, 110],
    amenities: ['Pool', 'Breakfast', 'Bicycles'],
    bestFor: ['first-trip', 'walkable'],
    reason: 'A polished boutique option well placed for exploring this neighbourhood on foot.',
    distance: 'Central to the cluster',
  },
  {
    suffix: 'Garden Homestay',
    rating: 4.7,
    costLevel: 2,
    range: [28, 58],
    amenities: ['Garden', 'Breakfast', 'Kitchenette'],
    bestFor: ['budget', 'quiet', 'families'],
    reason: 'Warm local hospitality and outdoor space at a gentler nightly rate.',
    distance: 'Quiet lane nearby',
  },
  {
    suffix: 'Apartment Suite',
    rating: 4.5,
    costLevel: 2,
    range: [35, 75],
    amenities: ['Kitchen', 'Laundry', 'Workspace'],
    bestFor: ['families', 'budget'],
    reason: 'Self-catering space that suits longer stays and small groups.',
    distance: 'Short walk to local shops',
  },
  {
    suffix: 'Heritage Hotel',
    rating: 4.6,
    costLevel: 3,
    range: [60, 120],
    amenities: ['Spa', 'Restaurant', 'Concierge'],
    bestFor: ['culture', 'luxury', 'first-trip'],
    reason: 'Characterful rooms with stronger service for travellers who want comfort.',
    distance: 'Near main sights',
  },
  {
    suffix: 'Riverside Lodge',
    rating: 4.5,
    costLevel: 3,
    range: [48, 95],
    amenities: ['River view', 'Terrace', 'Breakfast'],
    bestFor: ['quiet', 'food'],
    reason: 'A calmer water-facing base with easy access into the wider area.',
    distance: 'Waterfront edge of the cluster',
  },
  {
    suffix: 'Family Villa',
    rating: 4.7,
    costLevel: 3,
    range: [70, 140],
    amenities: ['Pool', 'Kitchen', 'Family rooms'],
    bestFor: ['families', 'quiet', 'luxury'],
    reason: 'More space and a private pool make this a strong family or group pick.',
    distance: 'Residential pocket',
  },
  {
    suffix: 'Value Guesthouse',
    rating: 4.4,
    costLevel: 1,
    range: [18, 38],
    amenities: ['Breakfast', 'Shared kitchen', 'Laundry'],
    bestFor: ['budget', 'walkable'],
    reason: 'Simple, clean and well located for travellers prioritising price.',
    distance: 'Walkable within the area',
  },
]

/**
 * Builds a fuller curated stay list per cluster (existing seeds + generated options).
 */
export function buildExtraStaysForClusters(): ExtraSeed[] {
  const extras: ExtraSeed[] = []
  for (const cluster of STAY_CLUSTERS) {
    TEMPLATES.forEach((t, i) => {
      const id = `${cluster.id}-extra-${i + 1}`
      extras.push({
        id,
        clusterId: cluster.id,
        name: `${cluster.name.split(' / ')[0]} ${t.suffix}`,
        rating: t.rating,
        costLevel: t.costLevel,
        typicalNightlyRange: t.range,
        distanceLabel: t.distance,
        amenities: t.amenities,
        bestFor: t.bestFor,
        reason: t.reason,
        imageIndex: (i + cluster.id.length) % 12,
      })
    })
  }
  return extras
}
