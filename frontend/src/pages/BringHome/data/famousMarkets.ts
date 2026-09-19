export type MarketPeriod = 'morning' | 'afternoon' | 'evening'

export type FamousMarketplace = {
  id: string
  name: string
  city: string
  /** Matches experience/hotel region labels used in itinerary builders */
  region: string
  area: string
  images: string[]
  /** ~20 words on what you can find */
  shortDescription: string
  mapQuery: string
  preferredPeriod: MarketPeriod
  periodLabel: string
  costUsd: number
  costLabel: string
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/**
 * Famous Vietnamese marketplaces — short descriptions distilled from
 * visitor guides (Vietnam Airlines shopping guide, Ben Thanh / Dong Ba /
 * Dong Xuan market write-ups, Asia Tour Advisor Vietnam shopping).
 */
export const FAMOUS_MARKETPLACES: FamousMarketplace[] = [
  {
    id: 'market-dong-xuan',
    name: 'Đồng Xuân Market',
    city: 'Hanoi',
    region: 'Hanoi',
    area: 'Old Quarter',
    images: [
      img('photo-1559592413-7cec4d0cae2b'),
      img('photo-1528127269322-539801943592'),
      img('photo-1514432324607-a09d9b4aefdd'),
    ],
    shortDescription:
      'Hanoi’s largest covered market for fabrics, coffee, handicrafts, snacks and everyday Old Quarter bargains.',
    mapQuery: 'Dong Xuan Market, Hanoi',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 25,
    costLabel: 'Browse $15–$40',
  },
  {
    id: 'market-hanoi-night',
    name: 'Old Quarter Weekend Night Market',
    city: 'Hanoi',
    region: 'Hanoi',
    area: 'Hang Dao · Hoan Kiem',
    images: [
      img('photo-1578662996442-48f60103fc96'),
      img('photo-1558769132-cb1aea458c5e'),
      img('photo-1504674900247-0877df9cc836'),
    ],
    shortDescription:
      'Evening street stalls for clothes, souvenirs, street snacks and lively weekend browsing near Hoan Kiem Lake.',
    mapQuery: 'Hanoi Night Market Hang Dao',
    preferredPeriod: 'evening',
    periodLabel: 'Best evening',
    costUsd: 20,
    costLabel: 'Browse $10–$35',
  },
  {
    id: 'market-ben-thanh',
    name: 'Bến Thành Market',
    city: 'Ho Chi Minh City',
    region: 'Ho Chi Minh City',
    area: 'District 1',
    images: [
      img('photo-1583416750470-965b2707b355'),
      img('photo-1555921017-83909c8c0d90'),
      img('photo-1514432324607-a09d9b4aefdd'),
    ],
    shortDescription:
      'Saigon’s landmark hall for spices, coffee, dried goods, handicrafts, fabric and classic market street food.',
    mapQuery: 'Ben Thanh Market, Ho Chi Minh City',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 30,
    costLabel: 'Browse $20–$50',
  },
  {
    id: 'market-binh-tay',
    name: 'Bình Tây Market',
    city: 'Ho Chi Minh City',
    region: 'Ho Chi Minh City',
    area: 'District 6 · Chợ Lớn',
    images: [
      img('photo-1556910103-1c02745aae4d'),
      img('photo-1565193566173-7a0ee3dbe261'),
      img('photo-1452860606245-08befc0ff44b'),
    ],
    shortDescription:
      'Chinatown wholesale hub with dried foods, ceramics, household goods and authentic local prices beyond tourist strips.',
    mapQuery: 'Binh Tay Market, Ho Chi Minh City',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 22,
    costLabel: 'Browse $12–$40',
  },
  {
    id: 'market-dong-ba',
    name: 'Đông Ba Market',
    city: 'Hue',
    region: 'Hue',
    area: 'Perfume River',
    images: [
      img('photo-1528127269322-539801943592'),
      img('photo-1452860606245-08befc0ff44b'),
      img('photo-1504674900247-0877df9cc836'),
    ],
    shortDescription:
      'Hue’s riverside classic for conical hats, incense, embroidery, royal sweets and local spices at market rates.',
    mapQuery: 'Dong Ba Market, Hue',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 20,
    costLabel: 'Browse $10–$35',
  },
  {
    id: 'market-han',
    name: 'Hàn Market',
    city: 'Da Nang',
    region: 'Da Nang',
    area: 'City centre',
    images: [
      img('photo-1544551763-46a013bb70d5'),
      img('photo-1558769132-cb1aea458c5e'),
      img('photo-1514432324607-a09d9b4aefdd'),
    ],
    shortDescription:
      'Four-storey city market with silk, tailor stalls, fresh produce and easy souvenir browsing between beach and river.',
    mapQuery: 'Han Market, Da Nang',
    preferredPeriod: 'afternoon',
    periodLabel: 'Best afternoon',
    costUsd: 18,
    costLabel: 'Browse $8–$30',
  },
  {
    id: 'market-hoian-central',
    name: 'Hội An Central Market',
    city: 'Hoi An',
    region: 'Hoi An',
    area: 'Ancient Town edge',
    images: [
      img('photo-1528127269322-539801943592'),
      img('photo-1558769132-cb1aea458c5e'),
      img('photo-1504674900247-0877df9cc836'),
    ],
    shortDescription:
      'Daytime produce and fabric floors plus spices, lanterns and tailor-adjacent shopping beside the old town.',
    mapQuery: 'Hoi An Central Market',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 25,
    costLabel: 'Browse $15–$45',
  },
  {
    id: 'market-hoian-night',
    name: 'Hội An Night Market',
    city: 'Hoi An',
    region: 'Hoi An',
    area: 'Nguyễn Hoàng · riverside',
    images: [
      img('photo-1578662996442-48f60103fc96'),
      img('photo-1528127269322-539801943592'),
      img('photo-1504674900247-0877df9cc836'),
    ],
    shortDescription:
      'Lantern-lit evening stalls for silk lanterns, crafts, clothes and riverside snacks after Ancient Town walks.',
    mapQuery: 'Hoi An Night Market',
    preferredPeriod: 'evening',
    periodLabel: 'Best evening',
    costUsd: 22,
    costLabel: 'Browse $12–$40',
  },
  {
    id: 'market-dam-nhatrang',
    name: 'Đầm Market',
    city: 'Nha Trang',
    region: 'Nha Trang',
    area: 'City centre',
    images: [
      img('photo-1559827260-dc66d52bef19'),
      img('photo-1507525428034-b723cf961d3e'),
      img('photo-1452860606245-08befc0ff44b'),
    ],
    shortDescription:
      'Coastal city market known for dried seafood, local snacks, woven goods and practical everyday Vietnamese shopping.',
    mapQuery: 'Dam Market, Nha Trang',
    preferredPeriod: 'morning',
    periodLabel: 'Best morning',
    costUsd: 18,
    costLabel: 'Browse $10–$30',
  },
  {
    id: 'market-dalat-night',
    name: 'Đà Lạt Night Market',
    city: 'Da Lat',
    region: 'Da Lat',
    area: 'City centre',
    images: [
      img('photo-1578662996442-48f60103fc96'),
      img('photo-1514432324607-a09d9b4aefdd'),
      img('photo-1504674900247-0877df9cc836'),
    ],
    shortDescription:
      'Highland evening market for strawberries, artichoke tea, coffee, jams, dried mushrooms and cool-weather snacks.',
    mapQuery: 'Da Lat Night Market',
    preferredPeriod: 'evening',
    periodLabel: 'Best evening',
    costUsd: 20,
    costLabel: 'Browse $12–$35',
  },
]

export function marketsGroupedByCity(cityFilter?: string[] | null) {
  const order: string[] = []
  const map = new Map<string, FamousMarketplace[]>()
  for (const m of FAMOUS_MARKETPLACES) {
    if (cityFilter && cityFilter.length > 0 && !cityFilter.includes(m.city)) continue
    if (!map.has(m.city)) {
      order.push(m.city)
      map.set(m.city, [])
    }
    map.get(m.city)!.push(m)
  }
  return order.map((city) => ({ city, markets: map.get(city)! }))
}

export function marketCityAnchorId(city: string) {
  return `market-city-${city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

export function marketMapsUrl(market: FamousMarketplace) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(market.mapQuery)}`
}

/** Market city labels that exist in the catalog */
export function allMarketCities() {
  return [...new Set(FAMOUS_MARKETPLACES.map((m) => m.city))]
}

/**
 * Map a free-form place / stay-city id onto a Famous Marketplace city label.
 */
export function resolveMarketCityLabel(place: string): string | null {
  const s = place.trim().toLowerCase()
  if (!s) return null
  if (s.includes('hanoi') || s === 'hà nội') return 'Hanoi'
  if (
    s.includes('ho chi minh') ||
    s.includes('hcmc') ||
    s.includes('saigon') ||
    s.includes('sài gòn')
  )
    return 'Ho Chi Minh City'
  if (s.includes('da nang') || s.includes('đà nẵng') || s === 'da-nang') return 'Da Nang'
  if (s.includes('hoi an') || s.includes('hội an')) return 'Hoi An'
  if (s.includes('hue') || s.includes('huế')) return 'Hue'
  if (s.includes('nha trang')) return 'Nha Trang'
  if (s.includes('da lat') || s.includes('dalat') || s.includes('đà lạt')) return 'Da Lat'
  if (s.includes('phu quoc') || s.includes('phú quốc')) return 'Phu Quoc'
  if (s.includes('sapa') || s.includes('sa pa')) return 'Sapa'
  if (s.includes('ha giang') || s.includes('hà giang')) return 'Ha Giang'
  if (s.includes('can tho') || s.includes('cần thơ')) return 'Can Tho'
  if (s.includes('cat ba') || s.includes('cát bà')) return 'Cat Ba'
  if (s.includes('dong van') || s.includes('đồng văn')) return 'Dong Van'
  if (s.includes('ha long') || s.includes('hạ long') || s.includes('halong')) return 'Ha Long'
  if (s.includes('phong nha')) return 'Phong Nha'
  // Exact catalog match
  const exact = allMarketCities().find((c) => c.toLowerCase() === s)
  return exact ?? null
}

export type MarketStayAnchor = {
  stayName: string
  originQuery: string
}

/** Directions from an itinerary stay in this city to the market. */
export function marketDistanceUrl(market: FamousMarketplace, stay: MarketStayAnchor) {
  const origin = encodeURIComponent(stay.originQuery)
  const destination = encodeURIComponent(market.mapQuery)
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
}
