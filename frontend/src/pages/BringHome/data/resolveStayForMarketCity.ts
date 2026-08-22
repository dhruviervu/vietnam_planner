import { HOTELS } from '../../PlanBuilder/data/hotels'
import { STAY_CLUSTERS } from '../../WhereToStay/data/clusters'
import { STAY_PROPERTY_BY_ID } from '../../WhereToStay/data/stays'
import type { StayCityId } from '../../WhereToStay/data/types'
import {
  resolveMarketCityLabel,
  type MarketStayAnchor,
} from './famousMarkets'

const STAY_CITY_TO_MARKET: Partial<Record<StayCityId, string>> = {
  hanoi: 'Hanoi',
  hcmc: 'Ho Chi Minh City',
  'da-nang': 'Da Nang',
  'hoi-an': 'Hoi An',
  hue: 'Hue',
  'nha-trang': 'Nha Trang',
  dalat: 'Da Lat',
}

/**
 * Prefer itinerary-set stay properties in this market city, then chosen stay,
 * then any stay-bag hotel in the same city.
 */
export function resolveStayForMarketCity(
  marketCity: string,
  input: {
    itineraryStayPropertyIds: string[]
    chosenStayId: string | null
    hotelIds: string[]
  },
): MarketStayAnchor | null {
  const target = resolveMarketCityLabel(marketCity)
  if (!target) return null

  for (const id of input.itineraryStayPropertyIds) {
    const prop = STAY_PROPERTY_BY_ID[id]
    if (!prop) continue
    const cluster = STAY_CLUSTERS.find((c) => c.id === prop.clusterId)
    if (!cluster) continue
    const cityLabel = STAY_CITY_TO_MARKET[cluster.cityId]
    if (cityLabel !== target) continue
    return {
      stayName: prop.name,
      originQuery: `${prop.name}, ${target}, Vietnam`,
    }
  }

  const hotelIds = [
    ...(input.chosenStayId ? [input.chosenStayId] : []),
    ...input.hotelIds,
  ]
  const seen = new Set<string>()
  for (const id of hotelIds) {
    if (seen.has(id)) continue
    seen.add(id)
    const hotel = HOTELS.find((h) => h.id === id)
    if (!hotel) continue
    if (resolveMarketCityLabel(hotel.city) !== target) continue
    return {
      stayName: hotel.name,
      originQuery: hotel.mapsQuery
        ? `${hotel.mapsQuery}, ${target}, Vietnam`
        : `${hotel.name}, ${hotel.neighborhood || target}, Vietnam`,
    }
  }

  return null
}
