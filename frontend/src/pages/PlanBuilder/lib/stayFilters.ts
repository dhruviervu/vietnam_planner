export type StayPriority =
  | 'best-fit'
  | 'closest'
  | 'best-value'
  | 'highest-rated'
  | 'best-food'
  | 'best-nightlife'
  | 'best-relax'
  | 'best-adventure'

export type StayProximity = 'any' | '1km' | '3km' | '5km'

export type StayFiltersState = {
  priority: StayPriority | null
  styles: import('../types').StayStyle[]
  priceMin: number
  priceMax: number
  minRating: number | null
  proximity: StayProximity
  types: import('../types').AccommodationType[]
}

export const DEFAULT_STAY_FILTERS: StayFiltersState = {
  priority: null,
  styles: [],
  priceMin: 20,
  priceMax: 250,
  minRating: null,
  proximity: 'any',
  types: [],
}

export const STAY_PRIORITY_OPTIONS: { id: StayPriority; label: string; explanation: string }[] = [
  {
    id: 'best-fit',
    label: 'Best Fit',
    explanation: 'Prioritizing stays with the strongest overall trip fit.',
  },
  {
    id: 'closest',
    label: 'Closest to My Experiences',
    explanation: 'Showing stays closest to your selected experiences.',
  },
  {
    id: 'best-value',
    label: 'Best Value',
    explanation: 'Prioritizing stays with the strongest balance of price, location and trip fit.',
  },
  {
    id: 'highest-rated',
    label: 'Highest Rated',
    explanation: 'Prioritizing highly rated stays with strong review confidence.',
  },
  {
    id: 'best-food',
    label: 'Best for Food',
    explanation: 'Prioritizing stays with excellent nearby restaurant and market access.',
  },
  {
    id: 'best-nightlife',
    label: 'Best for Nightlife',
    explanation: 'Prioritizing walkable central bases with evening energy nearby.',
  },
  {
    id: 'best-relax',
    label: 'Best for Relaxation',
    explanation: 'Prioritizing quieter, scenic, or beachside stays.',
  },
  {
    id: 'best-adventure',
    label: 'Best for Adventure',
    explanation: 'Prioritizing stays near activities, transfers and adventure hubs.',
  },
]

export function countActiveStayFilters(f: StayFiltersState) {
  let n = 0
  if (f.priority) n += 1
  if (f.styles.length) n += 1
  if (f.priceMin > 20 || f.priceMax < 250) n += 1
  if (f.minRating != null) n += 1
  if (f.proximity !== 'any') n += 1
  if (f.types.length) n += 1
  return n
}
