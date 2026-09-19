import type { ShoppingItem } from '../types'
import { DESTINATIONS } from '../../BringHome/data/destinations'
import { FAMOUS_MARKETPLACES } from '../../BringHome/data/famousMarkets'
import type { ShoppingDestination } from '../../BringHome/data/types'

/** Shopping dwell on the itinerary is always 30 min–2 hr. */
export const SHOP_MIN_HOURS = 0.5
export const SHOP_MAX_HOURS = 2

function hoursForShoppingType(type: string, name = ''): number {
  const blob = `${name} ${type}`.toLowerCase()
  if (/night/.test(blob)) return 1
  if (type === 'Mall') return 2
  if (type === 'Market' || type === 'Markets') return 1.5
  if (type === 'Historic Street' || type === 'Craft District') return 1.25
  if (type === 'Shop' || type === 'Specialty Store') return 1
  if (type === 'Fashion') return 1.25
  if (type === 'Handmade' || type === 'Crafts') return 1.25
  if (type === 'Food & drink') return 0.75
  if (type === 'Souvenirs') return 1
  return 1.25
}

export function shoppingHours(
  item: Pick<ShoppingItem, 'durationHours' | 'type' | 'name'>,
): number {
  const raw = item.durationHours ?? hoursForShoppingType(item.type, item.name)
  return Math.min(SHOP_MAX_HOURS, Math.max(SHOP_MIN_HOURS, raw))
}

export function shoppingDurationLabel(hours: number): string {
  const h = Math.min(SHOP_MAX_HOURS, Math.max(SHOP_MIN_HOURS, hours))
  if (h <= 0.5) return '~0.5–1 hr'
  if (h <= 1) return '~1 hr'
  if (h <= 1.5) return '~1–1.5 hr'
  return '~1.5–2 hr'
}

function destinationPeriod(d: ShoppingDestination): ShoppingItem['preferredPeriod'] {
  const blob = `${d.name} ${d.type}`.toLowerCase()
  if (/night/.test(blob)) return 'evening'
  if (d.type === 'Market') return 'morning'
  return 'afternoon'
}

const CATALOG_ITEMS: ShoppingItem[] = [
  {
    id: 'shop-hoian-tailor',
    name: 'Custom tailored clothing',
    type: 'Fashion',
    region: 'Hoi An',
    city: 'Hoi An',
    seed: 'pb-shop-tailor',
    costUsd: 60,
    costLabel: '$40–$120',
    popularity: 'Must-try',
    shop: 'Ancient Town tailor streets',
    blurb: 'Measured today, fitted tomorrow — Hoi An’s signature craft.',
  },
  {
    id: 'shop-hoian-lanterns',
    name: 'Silk lanterns',
    type: 'Handmade',
    region: 'Hoi An',
    city: 'Hoi An',
    seed: 'pb-shop-lantern',
    costUsd: 15,
    costLabel: '$8–$25',
    popularity: 'Popular souvenir',
    shop: 'Lantern workshops',
    blurb: 'Fold them flat for the flight home.',
  },
  {
    id: 'shop-hanoi-coffee',
    name: 'Vietnamese coffee kit',
    type: 'Food & drink',
    region: 'Hanoi',
    city: 'Hanoi',
    seed: 'pb-shop-coffee',
    costUsd: 18,
    costLabel: '$12–$30',
    popularity: 'Traveler favorite',
    shop: 'Old Quarter coffee shops',
    blurb: 'Phin filter + robusta — bring the ritual home.',
  },
  {
    id: 'shop-hanoi-crafts',
    name: 'Lacquer & craft goods',
    type: 'Crafts',
    region: 'Hanoi',
    city: 'Hanoi',
    seed: 'pb-shop-craft',
    costUsd: 25,
    costLabel: '$15–$50',
    popularity: 'Local crafts',
    shop: 'Hang Gai & nearby lanes',
    blurb: 'Boxes, trays, and silk scarves with real craftsmanship.',
  },
  {
    id: 'shop-hcmc-markets',
    name: 'Ben Thanh market haul',
    type: 'Markets',
    region: 'Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    seed: 'pb-shop-benthanh',
    costUsd: 30,
    costLabel: 'Graze $20–$50',
    popularity: 'Classic stop',
    shop: 'Ben Thanh Market',
    blurb: 'Souvenirs, snacks, and bargaining practice.',
    preferredPeriod: 'morning',
  },
  {
    id: 'shop-hcmc-fashion',
    name: 'District 1 fashion finds',
    type: 'Fashion',
    region: 'Ho Chi Minh City',
    city: 'Ho Chi Minh City',
    seed: 'pb-shop-fashion',
    costUsd: 40,
    costLabel: '$25–$80',
    popularity: 'City style',
    shop: 'Dong Khoi area',
    blurb: 'Contemporary Vietnamese labels and accessories.',
  },
  {
    id: 'shop-danang-souvenirs',
    name: 'Coastal souvenirs',
    type: 'Souvenirs',
    region: 'Da Nang',
    city: 'Da Nang',
    seed: 'pb-shop-danang',
    costUsd: 12,
    costLabel: '$8–$20',
    popularity: 'Light shopping',
    shop: 'Helio / beach markets',
    blurb: 'Easy picks between beach time and dinner.',
    preferredPeriod: 'afternoon',
  },
  {
    id: 'shop-sapa-textiles',
    name: 'Hill-tribe textiles',
    type: 'Handmade',
    region: 'Sapa',
    city: 'Sapa',
    seed: 'pb-shop-sapa',
    costUsd: 28,
    costLabel: '$15–$45',
    popularity: 'Authentic crafts',
    shop: 'Sapa market',
    blurb: 'Buy directly when possible — support local makers.',
  },
]

const MARKET_ITEMS: ShoppingItem[] = FAMOUS_MARKETPLACES.map((m) => ({
  id: m.id,
  name: m.name,
  type: 'Markets',
  region: m.region,
  city: m.city,
  seed: `pb-${m.id}`,
  costUsd: m.costUsd,
  costLabel: m.costLabel,
  popularity: 'Famous market',
  shop: m.mapQuery,
  blurb: m.shortDescription,
  preferredPeriod: m.preferredPeriod,
  durationHours: hoursForShoppingType('Markets', m.name),
  hours: DESTINATIONS.find((d) => d.itineraryId === m.id || d.id === m.id)?.hoursRaw
    || DESTINATIONS.find((d) => d.itineraryId === m.id || d.id === m.id)?.openingHours,
}))

const marketIds = new Set(MARKET_ITEMS.map((m) => m.id))

const DESTINATION_ITEMS: ShoppingItem[] = DESTINATIONS.flatMap((d) => {
  const id = d.itineraryId ?? d.id
  if (marketIds.has(id)) return []
  return [
    {
      id,
      name: d.name,
      type: d.type,
      region: d.city,
      city: d.city,
      seed: `pb-${id}`,
      costUsd: 20,
      costLabel: d.priceRange,
      popularity: d.featured ? 'Featured stop' : d.type,
      shop: d.area,
      blurb: d.whyRecommended,
      preferredPeriod: destinationPeriod(d),
      durationHours: hoursForShoppingType(d.type, d.name),
      hours: d.hoursRaw || d.openingHours,
    },
  ]
})

export const SHOPPING_ITEMS: ShoppingItem[] = [
  ...CATALOG_ITEMS,
  ...MARKET_ITEMS,
  ...DESTINATION_ITEMS,
]

export function shoppingHoursForId(id: string): number | null {
  const item = SHOPPING_ITEMS.find((s) => s.id === id)
  return item ? shoppingHours(item) : null
}
