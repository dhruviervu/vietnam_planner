import type { PlaceId } from './types'

export type MatrixRow = {
  mode: string
  symbol: string
  bestFor: string
  speed: string
  cost: string
  note: string
  jumpId: string
}

export const MODE_MATRIX: MatrixRow[] = [
  {
    mode: 'Domestic flights',
    symbol: '✈️',
    bestFor: 'Long-distance (Hanoi ↔ HCMC, islands with airports)',
    speed: '1–2.5 h in the air · 3.5–5 h door-to-door',
    cost: '$$$',
    note: 'Quickest trunk hop. Add airport time, bags, and a city transfer at both ends.',
    jumpId: 'dive-flight',
  },
  {
    mode: 'Reunification Express',
    symbol: '🚆',
    bestFor: 'Scenic spine (Hue ↔ Da Nang, overnight Hanoi ↔ Hue)',
    speed: 'Slow on long-haul · 2.5–36 h depending on the pair',
    cost: '$$',
    note: 'City-centre stations. Soft sleeper (4-berth) is the overnight default. No rails to Sapa, Ha Giang, Phu Quoc.',
    jumpId: 'dive-train',
  },
  {
    mode: 'Sleeper buses & limos',
    symbol: '🚌',
    bestFor: 'Budget long-distance and mountain towns trains skip',
    speed: 'Medium · 2–9 h typical tourist hops, 12–18 h sleepers',
    cost: '$',
    note: 'Cheapest to Sapa, Ha Giang, Da Lat. Quality swings from VIP cabins to stacked bunks.',
    jumpId: 'dive-coach',
  },
  {
    mode: 'Ferries & speedboats',
    symbol: '⛴️',
    bestFor: 'Islands (Phu Quoc, Cat Ba, Con Dao)',
    speed: 'Fast water · 1–3 h on the boat',
    cost: '$$',
    note: 'Weather-dependent. Hydrofoils vs car ferries are different products. Monsoon can cancel a day.',
    jumpId: 'dive-water',
  },
  {
    mode: 'Grab / ride-hail',
    symbol: '🚕',
    bestFor: 'Inside a city',
    speed: 'On-demand · 10–40 min in traffic',
    cost: '$',
    note: 'Transparent in-app price. GrabBike is fastest in motorbike traffic; GrabCar for bags.',
    jumpId: 'dive-urban',
  },
]

export type FeaturedRoute = {
  id: string
  originId: PlaceId
  destinationId: PlaceId
  title: string
  kicker: string
  lead: string
  warning: string | null
  options: { mode: string; time: string; cost: string; comfort: string; pick: string }[]
}

export const FEATURED_ROUTES: FeaturedRoute[] = [
  {
    id: 'hanoi-halong',
    originId: 'hanoi',
    destinationId: 'ha-long',
    title: 'Hanoi → Ha Long Bay',
    kicker: 'A highway, then a boat',
    lead: 'There is no useful passenger train and no airport in Ha Long for this hop. Almost everyone rides 160 km of QL18, then boards a cruise or day boat. The transfer is the dull part; the bay is the point.',
    warning: 'Typhoon season (roughly June–October) can cancel cruises even when the van still runs. Do not book a same-night flight out of Hanoi after an overnight cruise without slack.',
    options: [
      {
        mode: 'Limousine van',
        time: '2.5–3.5 h',
        cost: '$8–18 / seat',
        comfort: 'Shared, hotel-area pickup',
        pick: 'Default for most visitors',
      },
      {
        mode: 'Private car',
        time: '2.5–3.5 h',
        cost: '$45–80 / car',
        comfort: 'Door-to-harbour',
        pick: 'Families, cruise-pier timing',
      },
      {
        mode: 'Public coach',
        time: '3.5–5 h',
        cost: '$5–10',
        comfort: 'Luong Yen / Gia Lam terminals',
        pick: 'Cheapest, least convenient',
      },
    ],
  },
  {
    id: 'hanoi-danang',
    originId: 'hanoi',
    destinationId: 'da-nang',
    title: 'Hanoi → Da Nang / Hoi An',
    kicker: 'Fly, or spend the night moving',
    lead: 'Da Nang is the airport and the Reunification station. Hoi An has neither — budget 45–70 minutes more by car or Super Air Bus after you land. A 07:00 flight from Noi Bai is a 04:30 hotel start.',
    warning: 'The Hai Van Pass coach in rain is motion-sickness country. Overnight trains sell out at Tet. Hoi An is not “the next stop after Da Nang airport” without a road transfer.',
    options: [
      {
        mode: 'Flight',
        time: '~1h 20m air · ~4 h door-to-door',
        cost: '$40–110',
        comfort: 'Highest if you count the day',
        pick: 'Fastest',
      },
      {
        mode: 'Overnight train (SE)',
        time: '~14–16 h',
        cost: '$35–70 soft sleeper',
        comfort: '4-berth cabin, city stations',
        pick: 'Scenic / skip a hotel night',
      },
      {
        mode: 'Sleeper bus',
        time: '~14–16 h',
        cost: '$20–35',
        comfort: 'Bunk; terminals often suburban',
        pick: 'Cheapest long way',
      },
    ],
  },
  {
    id: 'hcmc-phuquoc',
    originId: 'hcmc',
    destinationId: 'phu-quoc',
    title: 'Ho Chi Minh City → Phu Quoc',
    kicker: 'Fly, or bus-plus-boat — not a city ferry',
    lead: 'There is no passenger boat from District 1 to the island. The honest cheap route is a coach or car to Ha Tien or Rach Gia, then a Super Dong / Phu Quoc Express hydrofoil. Most visitors just fly SGN–PQC.',
    warning: 'Southwest monsoon (May–October, worst late summer) regularly cancels or delays the Ha Tien and Rach Gia boats. If the sea is up, the flight is the Plan A, not the backup.',
    options: [
      {
        mode: 'Flight SGN–PQC',
        time: '~1 h air · ~3.5–4.5 h door-to-door',
        cost: '$35–90',
        comfort: 'The practical default',
        pick: 'Fastest',
      },
      {
        mode: 'Coach + hydrofoil',
        time: '~8–11 h',
        cost: '$20–40',
        comfort: 'Two vehicles, port waiting',
        pick: 'Cheapest if boats are running',
      },
      {
        mode: 'Fly via Ha Tien (rare)',
        time: 'Not a standard hop',
        cost: '—',
        comfort: 'Do not plan this',
        pick: 'Skip',
      },
    ],
  },
]

export type WaterGroup = {
  id: string
  title: string
  kicker: string
  body: string
  examples: { route: string; time: string; note: string }[]
  image: string
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

export const WATER_GROUPS: WaterGroup[] = [
  {
    id: 'island',
    title: 'Island ferries & hydrofoils',
    kicker: 'Point-to-point, weather-bound',
    body: 'High-speed passenger boats and slower car ferries that actually move you from a mainland port to an island. This is transit, not a sunset cruise. Buy a named operator and a sailing, not “Phu Quoc boat” as a vibe.',
    examples: [
      { route: 'Rach Gia or Ha Tien → Phu Quoc', time: '1–3 h', note: 'Super Dong / Phu Quoc Express. Ha Tien is shorter water, longer road from HCMC.' },
      { route: 'Vung Tau or Soc Trang → Con Dao', time: '~3–4 h hydrofoil', note: 'Rough-sea cancellations are common. Many visitors fly VCS instead.' },
      { route: 'Hai Phong → Cat Ba', time: '~30–75 min', note: 'Ben Binh / Got piers. Combine with a Hanoi limousine, not a fantasy direct boat from Hoan Kiem.' },
    ],
    image: img('photo-1544551763-46a013bb70d5'),
  },
  {
    id: 'cruise',
    title: 'Overnight & day cruises',
    kicker: 'Leisure, not a transfer',
    body: 'You are buying a floating hotel itinerary. It will not drop you in Hue. Treat the Hanoi–harbour van as a separate ticket.',
    examples: [
      { route: 'Ha Long / Lan Ha overnight', time: '1–3 nights', note: 'Lan Ha is often quieter than the classic Ha Long day-boat scrum.' },
      { route: 'Mekong Delta multi-day', time: '2–4 days', note: 'Can Tho / Cai Be packages. Sampans at dawn are the point; coaches between piers are the glue.' },
    ],
    image: img('photo-1559827260-dc66d52bef19'),
  },
  {
    id: 'river',
    title: 'River ferries & local water taxis',
    kicker: 'Crossing a river, not the country',
    body: 'Short, local, sometimes scheduled, sometimes a man with a sampan and a price. Useful inside one landscape.',
    examples: [
      { route: 'Saigon River Bus (buýt sông)', time: 'City hop', note: 'HCMC waterbus along the river — sightseeing that also moves you a few kilometres.' },
      { route: 'Trang An / Tam Coc, Ninh Binh', time: '1–3 h', note: 'Rowed sampans through karst. This is the visit, not a way to Hanoi.' },
    ],
    image: img('photo-1528127269322-539801943592'),
  },
]

export type ClassCard = {
  id: string
  family: 'train' | 'bus'
  title: string
  image: string
  body: string
  best: string
}

export const CLASS_CARDS: ClassCard[] = [
  {
    id: 'soft-4',
    family: 'train',
    title: 'Soft sleeper · 4-berth',
    image: img('photo-1544620341-11cb2f96f2ca'),
    body: 'The overnight default on SE/TN trains. Four bunks, a door, a small table. Sheets are provided. You share with whoever booked the other berths unless you buy the cabin.',
    best: 'Hanoi–Hue, Hue–Nha Trang, any night over ~8 hours.',
  },
  {
    id: 'hard-6',
    family: 'train',
    title: 'Hard sleeper · 6-berth',
    image: img('photo-1474487548417-781cb71495f3'),
    body: 'Six bunks, narrower, more noise, less privacy. The top berth is tight for anyone tall. Cheaper than soft sleeper, still a bed.',
    best: 'Budget overnight when soft sleeper is sold out.',
  },
  {
    id: 'limo',
    family: 'bus',
    title: 'Limousine van · 9–16 seats',
    image: img('photo-1464219789935-c2d9d9aba644'),
    body: 'Reclining seats, USB, fierce air-con. Hotel-area pickup on tourist hops. Not a bunk. You sit like a human.',
    best: 'Hanoi–Ninh Binh, Hanoi–Ha Long, Da Nang–Hue by day.',
  },
  {
    id: 'sleeper-vip',
    family: 'bus',
    title: 'Sleeper bus · VIP cabin vs upper bunk',
    image: img('photo-1551882547-ff40c63ea4e8'),
    body: 'VIP is a semi-private pod. Standard is an open upper/lower bunk in a vibrating tube. Keep passport and phone on your body. Bunks run short for people over ~1.8 m.',
    best: 'Overnight to Sapa, Ha Giang, Da Lat, Nha Trang when you will not pay for a flight.',
  },
]

export type AppCallout = {
  id: string
  name: string
  job: string
  body: string
  href?: string
  stores?: Array<'iPhone' | 'Android'>
}

export const APP_CALLOUTS: AppCallout[] = [
  {
    id: 'grab',
    name: 'Grab',
    job: 'Car and bike taxis',
    body: 'The default ride app. GrabBike in traffic; GrabCar for luggage. Set the pin on the alley, match the plate. Install and log in on wifi before you land — airport pickup is a numbered bay, not the arrivals door.',
    stores: ['iPhone', 'Android'],
  },
  {
    id: 'be',
    name: 'Be',
    job: 'Car and bike taxis',
    body: 'Local backup when Grab is surging or thin at 02:00. Same two products: car and motorbike taxi. Wait at the pin. There is no useful desktop booking — this is the phone.',
    stores: ['iPhone', 'Android'],
  },
  {
    id: 'maps',
    name: 'Google Maps',
    job: 'Pins, not hotel names',
    body: 'Download Hanoi, Hoi An, and Saigon (Ho Chi Minh City) offline. Coach terminals and ferry piers are pins, not the word “Hanoi” on a ticket. Camera and walking directions fail without the pack.',
    href: 'https://www.google.com/maps',
    stores: ['iPhone', 'Android'],
  },
  {
    id: 'translate',
    name: 'Google Translate',
    job: 'Offline Vietnamese',
    body: 'Download Vietnamese before you fly. Camera mode on coach tickets, pier boards, and bunk numbers works in the app; the site is still useful on a laptop.',
    href: 'https://translate.google.com/',
    stores: ['iPhone', 'Android'],
  },
  {
    id: '12go',
    name: '12Go',
    job: 'Trains, buses, boats',
    href: 'https://12go.asia/en',
    body: 'English marketplace. You pay in a browser; a local operator runs the vehicle. Read the pickup note. Also on phones if you prefer the app.',
    stores: ['iPhone', 'Android'],
  },
  {
    id: 'baolau',
    name: 'Baolau',
    job: 'Vietnam Railways e-tickets',
    href: 'https://www.baolau.com/',
    body: 'Website for the exact SE train number, not a vague “night train to Hue”. No passenger app that replaces the site — book here, screenshot the ticket.',
  },
]

export const DECISION_GUIDE = [
  {
    id: 'fastest',
    label: 'Fastest',
    symbol: '⚡',
    body: 'Fly the spine (Hanoi, Da Nang, HCMC, Phu Quoc). Then Grab. Do not “save money” with a 16-hour sleeper if you only have four days.',
    jumpId: 'dive-flight',
  },
  {
    id: 'cheapest',
    label: 'Cheapest',
    symbol: '🪙',
    body: 'Limousine vans on short hops, sleeper buses on long ones, city bus or GrabBike in town. The hidden cost is a suburban terminal and your back.',
    jumpId: 'dive-coach',
  },
  {
    id: 'scenic',
    label: 'Scenic',
    symbol: '🌄',
    body: 'Day train Hue–Da Nang along the Hai Van coast. Soft sleeper overnight instead of a hotel. Ha Long is a cruise, not a ferry commute.',
    jumpId: 'dive-train',
  },
] as const
