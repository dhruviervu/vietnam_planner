import type { buildItinerary, selectedRegionsFromExperiences } from '../pages/PlanBuilder/lib/buildItinerary'
import type { CityActivity } from '../pages/PlanBuilder/data/activities'
import type { Experience, ShoppingItem } from '../pages/PlanBuilder/types'

export type TripCatalog = {
  experiences: readonly Experience[]
  activities: readonly CityActivity[]
  shopping: readonly ShoppingItem[]
  buildItinerary: typeof buildItinerary
  selectedRegionsFromExperiences: typeof selectedRegionsFromExperiences
}

/**
 * The catalogs are multi-megabyte; keeping them out of the store module lets the
 * landing page and app shell boot without downloading them.
 */
let catalog: TripCatalog | null = null

export function registerTripCatalog(next: TripCatalog) {
  catalog = next
}

export function getTripCatalog(): TripCatalog | null {
  return catalog
}

export function loadTripCatalog(): Promise<TripCatalog> {
  if (catalog) return Promise.resolve(catalog)
  return import('./tripCatalogBoot').then(() => catalog!)
}
