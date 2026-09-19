export type SampleSight = {
  id: string
  name: string
  city: string
  description: string
  rating: number
  reviews: number
  cost: number
  image: string
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`

export const SAMPLE_SIGHTS: SampleSight[] = [
  {
    id: 'hoan-kiem',
    name: 'Hoan Kiem Lake',
    city: 'Hanoi',
    description:
      'A still green lake in the middle of the Old Quarter. Walk it at dusk when the Ngoc Son bridge lights and the city exhales.',
    rating: 4.7,
    reviews: 18420,
    cost: 0,
    image: img('photo-1554907984-15263bfd63bd'),
  },
  {
    id: 'literature',
    name: 'Temple of Literature',
    city: 'Hanoi',
    description:
      'Vietnam’s first university, a sequence of courtyards and stone stelae. Quiet if you arrive before the tour buses.',
    rating: 4.6,
    reviews: 11204,
    cost: 2,
    image: img('photo-1583417319070-4a69db38a482'),
  },
  {
    id: 'train-street',
    name: 'Train Street',
    city: 'Hanoi',
    description:
      'A living alley the tracks still use. Stay behind the line the residents keep, then leave — it is their street, not a set.',
    rating: 4.3,
    reviews: 8902,
    cost: 0,
    image: img('photo-1558981403-c5f9899a28bc'),
  },
  {
    id: 'tam-coc',
    name: 'Tam Coc',
    city: 'Ninh Binh',
    description:
      'A rowed boat through limestone and rice. The caves are short; the quiet between them is the point.',
    rating: 4.8,
    reviews: 9640,
    cost: 15,
    image: img('photo-1528127269322-539801943592'),
  },
  {
    id: 'ha-long',
    name: 'Ha Long Bay',
    city: 'Ha Long',
    description:
      'Karst towers in jade water. Sleep on the bay if you can — a day trip shows the postcard, not the hush.',
    rating: 4.7,
    reviews: 22110,
    cost: 90,
    image: img('photo-1559827260-dc66d52bef19'),
  },
  {
    id: 'imperial-hue',
    name: 'Imperial City',
    city: 'Hue',
    description:
      'The Nguyen citadel: moats, gates, and rooms that still hold heat. Give it a slow morning, not a checklist hour.',
    rating: 4.6,
    reviews: 7340,
    cost: 8,
    image: img('photo-1559592413-7cec4d0cae2b'),
  },
  {
    id: 'hoi-an-town',
    name: 'Hoi An Ancient Town',
    city: 'Hoi An',
    description:
      'Lanterned streets and a river that turns gold after six. The ticket is worth it if you wander, not if you rush the Japanese Bridge.',
    rating: 4.8,
    reviews: 30112,
    cost: 4,
    image: img('photo-1555921015-5532091f6026'),
  },
  {
    id: 'marble',
    name: 'Marble Mountains',
    city: 'Da Nang',
    description:
      'Caves and pagodas stacked inside limestone. The climb is short; the views over the coast arrive suddenly.',
    rating: 4.5,
    reviews: 12880,
    cost: 3,
    image: img('photo-1507525428034-b723cf961d3e'),
  },
  {
    id: 'my-khe',
    name: 'My Khe Beach',
    city: 'Da Nang',
    description:
      'A long, clean city beach. Come at 6am with the walkers, or at golden hour — midday is just glare.',
    rating: 4.4,
    reviews: 5401,
    cost: 0,
    image: img('photo-1507525428034-b723cf961d3e'),
  },
  {
    id: 'phong-nha',
    name: 'Phong Nha Cave',
    city: 'Phong Nha',
    description:
      'A river cave you enter by boat, then walk a dry cathedral of stone. Cool, dark, and unhurried if you skip the extras.',
    rating: 4.8,
    reviews: 6120,
    cost: 25,
    image: img('photo-1544551763-46a013bb70d5'),
  },
  {
    id: 'ben-thanh',
    name: 'Ben Thanh Market',
    city: 'Ho Chi Minh City',
    description:
      'The city’s old covered market. Useful for a first orientation — go early, keep the bargaining light, leave before the evening crush.',
    rating: 4.2,
    reviews: 19880,
    cost: 0,
    image: img('photo-1554907984-15263bfd63bd'),
  },
  {
    id: 'cu-chi',
    name: 'Cu Chi Tunnels',
    city: 'Ho Chi Minh City',
    description:
      'A wartime tunnel network outside the city. The history is heavy; a half-day with a good guide is enough.',
    rating: 4.5,
    reviews: 15440,
    cost: 18,
    image: img('photo-1583417319070-4a69db38a482'),
  },
  {
    id: 'cai-rang',
    name: 'Cai Rang floating market',
    city: 'Can Tho',
    description:
      'Boats trading fruit before dawn. Hire by the hour and leave the city by 5am — after 8 the market thins to souvenir.',
    rating: 4.6,
    reviews: 4210,
    cost: 22,
    image: img('photo-1528127269322-539801943592'),
  },
  {
    id: 'pq-night',
    name: 'Phu Quoc night market',
    city: 'Phu Quoc',
    description:
      'Seafood grills and a slow evening walk in Duong Dong. Eat where the locals queue; skip the first row of stalls.',
    rating: 4.4,
    reviews: 7760,
    cost: 0,
    image: img('photo-1567899378494-47b22a2ae96a'),
  },
]

export function sightsByCity() {
  const map = new Map<string, SampleSight[]>()
  for (const sight of SAMPLE_SIGHTS) {
    const list = map.get(sight.city) ?? []
    list.push(sight)
    map.set(sight.city, list)
  }
  return [...map.entries()]
}

export function formatCost(cost: number) {
  return cost === 0 ? 'Free' : `From $${cost}`
}

export function formatReviews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
}

export const TEMPLATES = [
  {
    id: 'quiet',
    path: '/sights-templates/quiet',
    name: 'Quiet rows',
    line: 'One sight per line. Photo, then a short note.',
  },
  {
    id: 'gallery',
    path: '/sights-templates/gallery',
    name: 'Soft gallery',
    line: 'Two columns, lots of air, almost nothing on the card.',
  },
  {
    id: 'chapters',
    path: '/sights-templates/chapters',
    name: 'City chapters',
    line: 'Read a city, then the next. No grid to scan.',
  },
  {
    id: 'lookbook',
    path: '/sights-templates/lookbook',
    name: 'Lookbook',
    line: 'One sight at a time. The rest wait as names.',
  },
  {
    id: 'journal',
    path: '/sights-templates/journal',
    name: 'Journal',
    line: 'A single column, like notes from the trip.',
  },
] as const
