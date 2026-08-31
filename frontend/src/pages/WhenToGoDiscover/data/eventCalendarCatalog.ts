import type { MonthId } from './months'

export const CATALOG_CITIES = [
  'All Vietnam',
  'Hanoi',
  'Ha Long',
  'Sapa',
  'Ninh Binh',
  'Hue',
  'Hoi An',
  'Da Nang',
  'Da Lat',
  'Nha Trang',
  'Ho Chi Minh City',
  'Can Tho',
  'Phu Quoc',
] as const

export type CatalogCityFilter = (typeof CATALOG_CITIES)[number]

export type CalendarItemKind = 'festival' | 'must-visit'

export type EventCalendarItem = {
  id: string
  kind: CalendarItemKind
  name: string
  city: Exclude<CatalogCityFilter, 'All Vietnam'>
  region: string
  /** Months this entry appears on the calendar */
  months: MonthId[]
  /** ~30-word card description */
  description: string
  /** Single topic tag shown on the card */
  tag: string
  popularity: number
  image: string
  /** Shown regardless of city filter when true */
  nationwide?: boolean
}

const img = {
  lantern:
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  festival:
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  haLong:
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  rice:
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  beach:
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  temple:
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80',
  market:
    'https://images.unsplash.com/photo-1509030450996-3a5ea825872b?auto=format&fit=crop&w=1200&q=80',
  city:
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  boat:
    'https://images.unsplash.com/photo-1509030450996-3a5ea825872b?auto=format&fit=crop&w=1200&q=80',
  highland:
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80',
  island:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  fireworks:
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
}

/** Vietnam festivals and cultural events — fixed event calendar entries. */
export const EVENT_CALENDAR_FESTIVALS: EventCalendarItem[] = [
  {
    id: 'fest-tet',
    kind: 'festival',
    name: 'Tết Nguyên Đán (Lunar New Year)',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [1, 2],
    nationwide: true,
    description:
      'Vietnam’s biggest holiday marks the lunar new year with family reunions, peach and kumquat markets, ancestor altars, lion dances, and citywide fireworks. Businesses may close for several days — book transport and hotels far ahead.',
    tag: 'Culture',
    popularity: 98,
    image: img.festival,
  },
  {
    id: 'fest-hoian-lantern',
    kind: 'festival',
    name: 'Hoi An Lantern Festival',
    city: 'Hoi An',
    region: 'Quang Nam',
    months: [1, 2, 3, 4, 8, 9, 10, 11, 12],
    description:
      'On each full moon, Hoi An dims electric lights and floats lanterns on the Thu Bon River. Old-town streets fill with music, street food, and candlelit processions — the town’s most atmospheric evening tradition.',
    tag: 'Romantic',
    popularity: 95,
    image: img.lantern,
  },
  {
    id: 'fest-mid-autumn',
    kind: 'festival',
    name: 'Mid-Autumn Festival (Tết Trung Thu)',
    city: 'Hanoi',
    region: 'Nationwide',
    months: [9, 10],
    nationwide: true,
    description:
      'Children parade with star-shaped lanterns while families share mooncakes under the harvest moon. Hanoi, Hoi An, and Ho Chi Minh City neighbourhoods glow with toy stalls, lion dances, and sweet festival treats.',
    tag: 'Family',
    popularity: 88,
    image: img.festival,
  },
  {
    id: 'fest-hung-kings',
    kind: 'festival',
    name: "Hùng Kings' Festival",
    city: 'Hanoi',
    region: 'Phú Thọ · Nationwide',
    months: [4],
    nationwide: true,
    description:
      'On the tenth day of the third lunar month, Vietnamese honour the legendary Hùng Kings who founded the nation. Incense ceremonies at the Phú Thọ temple complex and public holidays nationwide make this a core ancestral celebration.',
    tag: 'Heritage',
    popularity: 86,
    image: img.temple,
  },
  {
    id: 'fest-danang-fireworks',
    kind: 'festival',
    name: 'Da Nang International Fireworks Festival',
    city: 'Da Nang',
    region: 'Central Coast',
    months: [6, 7],
    description:
      'Teams from around the world choreograph pyrotechnic displays over the Han River during this multi-week summer festival. Han River bridges and beachfront promenades become packed viewing decks — arrive early for riverfront spots.',
    tag: 'Culture',
    popularity: 91,
    image: img.fireworks,
  },
  {
    id: 'fest-perfume-pagoda',
    kind: 'festival',
    name: 'Perfume Pagoda Festival',
    city: 'Hanoi',
    region: 'Hà Nội Province',
    months: [2, 3],
    description:
      'From the first to third lunar months, pilgrims boat through Yen Stream and climb to Huong Tich cave shrine in a limestone valley. The journey blends river scenery, mountain paths, and Buddhist devotion outside Hanoi.',
    tag: 'Spiritual',
    popularity: 84,
    image: img.temple,
  },
  {
    id: 'fest-lim',
    kind: 'festival',
    name: 'Lim Festival',
    city: 'Hanoi',
    region: 'Bắc Ninh',
    months: [2, 3],
    description:
      'Held around the thirteenth day of the first lunar month near Hanoi, Lim Festival celebrates quan họ folk singing between riverbank stages. Costumed duets, processions, and traditional games preserve Red River Delta courtship culture.',
    tag: 'Culture',
    popularity: 79,
    image: img.festival,
  },
  {
    id: 'fest-vu-lan',
    kind: 'festival',
    name: 'Vu Lan / Wandering Souls Day',
    city: 'Hoi An',
    region: 'Nationwide',
    months: [8],
    nationwide: true,
    description:
      'On the fifteenth day of the seventh lunar month, families offer food and incense to hungry spirits and ancestors. Temples and rivers fill with lit lanterns — a solemn Buddhist counterpart to Western remembrance traditions.',
    tag: 'Spiritual',
    popularity: 82,
    image: img.lantern,
  },
  {
    id: 'fest-giong',
    kind: 'festival',
    name: 'Giong Festival',
    city: 'Hanoi',
    region: 'Gia Lâm · Hà Nội',
    months: [4, 5],
    description:
      'Commemorating the mythical hero Saint Giong who defended Vietnam, this spring festival features processions, flag dances, and operatic re-enactments at Phu Dong and Soc temples east of Hanoi — vivid folk heritage on the capital’s fringe.',
    tag: 'Heritage',
    popularity: 77,
    image: img.festival,
  },
  {
    id: 'fest-ba-chua-xu',
    kind: 'festival',
    name: 'Ba Chua Xu Temple Festival',
    city: 'Can Tho',
    region: 'Châu Đốc · An Giang',
    months: [4, 5],
    description:
      'From the twenty-third to twenty-seventh of the fourth lunar month, pilgrims flock to Sam Mountain to honour the Lady of the Realm. Incense smoke, offerings, and crowded night vigils make this the Mekong Delta’s largest spiritual gathering.',
    tag: 'Spiritual',
    popularity: 80,
    image: img.temple,
  },
  {
    id: 'fest-kate',
    kind: 'festival',
    name: 'Kate Festival',
    city: 'Nha Trang',
    region: 'Ninh Thuận · Cham',
    months: [10],
    description:
      'The Cham ethnic community celebrates Kate at Po Klong Garai and Po Re Me towers with ritual processions, traditional dance, and colourful dress. It is a rare window into Vietnam’s Hindu-influenced coastal minority culture.',
    tag: 'Culture',
    popularity: 76,
    image: img.temple,
  },
  {
    id: 'fest-ooc-om-boc',
    kind: 'festival',
    name: 'Ooc Om Boc',
    city: 'Can Tho',
    region: 'Khmer · Mekong Delta',
    months: [11],
    description:
      'Khmer communities in the delta mark the end of the rainy season with moon worship, boat races, and Apsara dance at pagodas. Soc Trang and Tra Vinh provinces host the liveliest ceremonies — a distinct southern cultural layer.',
    tag: 'Culture',
    popularity: 74,
    image: img.boat,
  },
  {
    id: 'fest-khau-vai',
    kind: 'festival',
    name: 'Khau Vai Love Market',
    city: 'Sapa',
    region: 'Hà Giang',
    months: [4, 5],
    description:
      'Once a year in Khau Vai village, former lovers meet openly while spouses wait elsewhere — a unique Hmong and Dao tradition of reconciliation and matchmaking. Music, costumes, and hill-market energy draw culture seekers north.',
    tag: 'Romantic',
    popularity: 78,
    image: img.highland,
  },
]

/** Iconic must-visit places — shown every month, filtered by city. */
export const EVENT_CALENDAR_MUST_VISIT: EventCalendarItem[] = [
  {
    id: 'place-hanoi-old-quarter',
    kind: 'must-visit',
    name: 'Hanoi Old Quarter',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Thirty-six guild streets of tube houses, sidewalk pho stalls, egg coffee, and lake-side temples form Vietnam’s most walkable capital core. Morning markets and evening beer corners make the Old Quarter essential on any north Vietnam itinerary.',
    tag: 'Urban',
    popularity: 94,
    image: img.city,
  },
  {
    id: 'place-ha-long-bay',
    kind: 'must-visit',
    name: 'Ha Long Bay',
    city: 'Ha Long',
    region: 'Quang Ninh',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Nearly two thousand limestone karsts rise from emerald water in a UNESCO seascape best seen by overnight cruise or day kayak. March through April and October through November typically offer the clearest skies for photography and swimming.',
    tag: 'Scenic',
    popularity: 97,
    image: img.haLong,
  },
  {
    id: 'place-ha-giang-loop',
    kind: 'must-visit',
    name: 'Ha Giang Loop',
    city: 'Sapa',
    region: 'Hà Giang Province',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'A multi-day motorbike or jeep circuit through Ma Pi Leng Pass, Dong Van plateau, and minority villages delivers Vietnam’s most dramatic northern roads. Rice terraces, cliff drops, and homestays reward riders who allow four to five days.',
    tag: 'Adventure',
    popularity: 90,
    image: img.highland,
  },
  {
    id: 'place-lan-ha-cat-ba',
    kind: 'must-visit',
    name: 'Lan Ha Bay & Cat Ba Island',
    city: 'Ha Long',
    region: 'Quang Ninh',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Adjacent to Ha Long but less crowded, Lan Ha Bay offers kayaking, floating villages, and Cat Ba National Park jungle trails. Overnight boats and island hotels suit travellers seeking the same karst scenery with quieter waters.',
    tag: 'Scenic',
    popularity: 88,
    image: img.island,
  },
  {
    id: 'place-ban-gioc',
    kind: 'must-visit',
    name: 'Ban Gioc Waterfall',
    city: 'Ninh Binh',
    region: 'Cao Bằng Province',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'On the China border, Ban Gioc cascades over tiered limestone in one of Asia’s largest cross-border falls. A bamboo raft approaches the base while karst peaks frame the pool — a remote highlight for dedicated northern road trips.',
    tag: 'Nature',
    popularity: 85,
    image: img.rice,
  },
  {
    id: 'place-hoa-lo',
    kind: 'must-visit',
    name: 'Hoa Lo Prison',
    city: 'Hanoi',
    region: 'Northern Vietnam',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Built by the French in 1896 and later holding American POWs, this museum documents colonial brutality and wartime history through cells, guillotines, and personal accounts. A sobering one-hour visit near Hanoi’s French Quarter.',
    tag: 'Heritage',
    popularity: 83,
    image: img.city,
  },
  {
    id: 'place-hoi-an-ancient-town',
    kind: 'must-visit',
    name: 'Hoi An Ancient Town',
    city: 'Hoi An',
    region: 'Quang Nam',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'A UNESCO port town of yellow merchant houses, Japanese bridge, tailor shops, and riverside lanterns preserves centuries of trading heritage. Pedestrian evenings, cooking classes, and nearby beaches make it central Vietnam’s unmissable base.',
    tag: 'Heritage',
    popularity: 96,
    image: img.lantern,
  },
  {
    id: 'place-nha-trang',
    kind: 'must-visit',
    name: 'Nha Trang',
    city: 'Nha Trang',
    region: 'Khanh Hoa Coast',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'A long sandy bay, island snorkelling trips, Po Nagar Cham towers, and mud-bath spas define Vietnam’s classic south-central resort city. Dry months from February through August suit beach days and boat tours to Hon Mun reef.',
    tag: 'Beach',
    popularity: 89,
    image: img.beach,
  },
  {
    id: 'place-cu-chi',
    kind: 'must-visit',
    name: 'Cu Chi Tunnels',
    city: 'Ho Chi Minh City',
    region: 'Ho Chi Minh Metro',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Northwest of Saigon, an elaborate underground network used during the war is open for guided crawls, trap displays, and history briefings. Half-day tours explain how villagers lived, fought, and supplied the city from hidden chambers.',
    tag: 'Heritage',
    popularity: 92,
    image: img.highland,
  },
  {
    id: 'place-con-dao',
    kind: 'must-visit',
    name: 'Con Dao Islands',
    city: 'Phu Quoc',
    region: 'Bà Rịa–Vũng Tàu',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description:
      'Sixteen islands off southern Vietnam combine prison museums, nesting sea turtles, dive sites, and empty beaches far from mainland crowds. Dry season from November to February brings calm seas for snorkelling and the most reliable flights.',
    tag: 'Beach',
    popularity: 87,
    image: img.island,
  },
]

export function getFestivalsForMonth(month: MonthId): EventCalendarItem[] {
  return EVENT_CALENDAR_FESTIVALS.filter((item) => item.months.includes(month)).sort(
    (a, b) => b.popularity - a.popularity,
  )
}

export function getMustVisitPlaces(): EventCalendarItem[] {
  return [...EVENT_CALENDAR_MUST_VISIT].sort((a, b) => b.popularity - a.popularity)
}

export function filterCalendarByCity(
  items: EventCalendarItem[],
  city: CatalogCityFilter,
): EventCalendarItem[] {
  if (city === 'All Vietnam') return items
  return items.filter((item) => calendarItemMatchesCity(item, city))
}

function calendarItemMatchesCity(item: EventCalendarItem, city: CatalogCityFilter): boolean {
  if (item.nationwide) return true
  if (item.city === city) return true

  const blob = `${item.name} ${item.region}`.toLowerCase()
  if (city === 'Ha Long' && /ha long|halong|lan ha|cat ba/.test(blob)) return true
  if (city === 'Sapa' && /sapa|ha giang|khau vai/.test(blob)) return true
  if (city === 'Ninh Binh' && /ninh binh|ban gioc|cao bằng|cao bang/.test(blob)) return true
  if (city === 'Can Tho' && /can tho|chau doc|mekong|soc trang|khmer/.test(blob)) return true
  if (city === 'Phu Quoc' && /phu quoc|con dao/.test(blob)) return true
  if (city === 'Nha Trang' && /nha trang|ninh thuận|ninh thuan|cham/.test(blob)) return true
  if (city === 'Ho Chi Minh City' && /ho chi minh|saigon|cu chi/.test(blob)) return true
  if (city === 'Hanoi' && /hanoi|hà nội|bac ninh|bắc ninh|phu tho|phú thọ|giong|perfume pagoda|lim/.test(blob)) return true
  if (city === 'Hoi An' && /hoi an|hoi an/.test(blob)) return true
  if (city === 'Da Nang' && /da nang|fireworks/.test(blob)) return true
  return false
}
