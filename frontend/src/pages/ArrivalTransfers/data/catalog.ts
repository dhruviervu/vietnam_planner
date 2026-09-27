import type {
  Airport,
  ArrivalRoute,
  Destination,
  TransferDirection,
  TransportMode,
  TransportModeId,
} from './types'
import { buildMode, getDefaultModes as defaultModes, toCanonicalModeIds } from './modes'
import { getProvidersForMode as providersForMode } from './providers'

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const AIRPORTS: Airport[] = [
  {
    id: 'HAN',
    city: 'Hanoi',
    name: 'Noi Bai International',
    code: 'HAN',
    transferHint: '35–60 min to central Hanoi',
    image: img('photo-1436491865332-7a61a109cc05'),
    cityHubLabel: 'Central Hanoi',
    defaultDestinationId: 'han-old-quarter',
    airportBufferHours: [2, 3],
  },
  {
    id: 'DAD',
    city: 'Da Nang',
    name: 'Da Nang International',
    code: 'DAD',
    transferHint: '20–40 min to Da Nang · 45–70 min to Hoi An',
    image: img('photo-1544551763-46a013bb70d5'),
    cityHubLabel: 'Da Nang',
    defaultDestinationId: 'dad-city',
    airportBufferHours: [2, 3],
  },
  {
    id: 'SGN',
    city: 'Ho Chi Minh City',
    name: 'Tan Son Nhat International',
    code: 'SGN',
    transferHint: '25–55 min to District 1',
    image: img('photo-1464037866556-6812bd9d4b25'),
    cityHubLabel: 'District 1',
    defaultDestinationId: 'sgn-d1',
    airportBufferHours: [2.5, 3.5],
  },
  {
    id: 'PQC',
    city: 'Phu Quoc',
    name: 'Phu Quoc International',
    code: 'PQC',
    transferHint: '20–40 min to Duong Dong',
    image: img('photo-1507525428034-b723cf961d3e'),
    cityHubLabel: 'Duong Dong',
    defaultDestinationId: 'pqc-duong-dong',
    airportBufferHours: [2, 2.5],
  },
  {
    id: 'CXR',
    city: 'Nha Trang',
    name: 'Cam Ranh International',
    code: 'CXR',
    transferHint: '40–70 min to Nha Trang',
    image: img('photo-1559827260-dc66d52bef19'),
    cityHubLabel: 'Nha Trang',
    defaultDestinationId: 'cxr-nha-trang',
    airportBufferHours: [2, 3],
  },
]

export const DESTINATIONS: Destination[] = [
  {
    id: 'han-old-quarter',
    airportId: 'HAN',
    city: 'Hanoi',
    area: 'Old Quarter',
    label: 'Old Quarter',
    mapsQuery: 'Hanoi Old Quarter',
    image: img('photo-1559592413-7cec4d0cae2b'),
    distanceKm: 30,
    typicalTimeMin: [35, 60],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / taxi',
  },
  {
    id: 'han-west-lake',
    airportId: 'HAN',
    city: 'Hanoi',
    area: 'West Lake',
    label: 'West Lake',
    mapsQuery: 'West Lake Hanoi',
    image: img('photo-1528127269322-539801943592'),
    distanceKm: 28,
    typicalTimeMin: [35, 55],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / ride-hail',
  },
  {
    id: 'han-french-quarter',
    airportId: 'HAN',
    city: 'Hanoi',
    area: 'French Quarter',
    label: 'French Quarter',
    mapsQuery: 'French Quarter Hanoi',
    image: img('photo-1583417319070-4a69db38a482'),
    distanceKm: 29,
    typicalTimeMin: [35, 58],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / taxi',
  },
  {
    id: 'han-ba-dinh',
    airportId: 'HAN',
    city: 'Hanoi',
    area: 'Ba Dinh',
    label: 'Ba Dinh',
    mapsQuery: 'Ba Dinh Hanoi',
    image: img('photo-1509030450996-3a5ea825872b'),
    distanceKm: 27,
    typicalTimeMin: [30, 55],
    popularBase: false,
    eveningAppeal: false,
    recommendedTransfer: 'Taxi / ride-hail',
  },
  {
    id: 'dad-city',
    airportId: 'DAD',
    city: 'Da Nang',
    area: 'City center',
    label: 'Da Nang',
    mapsQuery: 'Da Nang city center',
    image: img('photo-1544551763-46a013bb70d5'),
    distanceKm: 8,
    typicalTimeMin: [20, 35],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Ride-hail / taxi',
  },
  {
    id: 'dad-my-khe',
    airportId: 'DAD',
    city: 'Da Nang',
    area: 'My Khe Beach',
    label: 'My Khe Beach',
    mapsQuery: 'My Khe Beach Da Nang',
    image: img('photo-1507525428034-b723cf961d3e'),
    distanceKm: 10,
    typicalTimeMin: [20, 40],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / ride-hail',
  },
  {
    id: 'dad-hoi-an',
    airportId: 'DAD',
    city: 'Hoi An',
    area: 'Ancient Town',
    label: 'Hoi An Ancient Town',
    mapsQuery: 'Hoi An Ancient Town',
    image: img('photo-1528127269322-539801943592'),
    distanceKm: 28,
    typicalTimeMin: [45, 70],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / shuttle',
  },
  {
    id: 'dad-hoi-an-city',
    airportId: 'DAD',
    city: 'Hoi An',
    area: 'Hoi An',
    label: 'Hoi An',
    mapsQuery: 'Hoi An',
    image: img('photo-1559592413-7cec4d0cae2b'),
    distanceKm: 30,
    typicalTimeMin: [45, 70],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / shuttle',
  },
  {
    id: 'dad-an-bang',
    airportId: 'DAD',
    city: 'Hoi An',
    area: 'An Bang',
    label: 'An Bang',
    mapsQuery: 'An Bang Beach Hoi An',
    image: img('photo-1507525428034-b723cf961d3e'),
    distanceKm: 32,
    typicalTimeMin: [50, 75],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private transfer',
  },
  {
    id: 'dad-marble',
    airportId: 'DAD',
    city: 'Da Nang',
    area: 'Marble Mountains',
    label: 'Marble Mountains',
    mapsQuery: 'Marble Mountains Da Nang',
    image: img('photo-1559827260-dc66d52bef19'),
    distanceKm: 14,
    typicalTimeMin: [25, 45],
    popularBase: false,
    eveningAppeal: false,
    recommendedTransfer: 'Taxi / private',
  },
  {
    id: 'dad-hue',
    airportId: 'DAD',
    city: 'Hue',
    area: 'City center',
    label: 'Hue',
    mapsQuery: 'Hue Vietnam',
    image: img('photo-1583417319070-4a69db38a482'),
    distanceKm: 100,
    typicalTimeMin: [120, 160],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / train link',
  },
  {
    id: 'sgn-d1',
    airportId: 'SGN',
    city: 'Ho Chi Minh City',
    area: 'District 1',
    label: 'District 1',
    mapsQuery: 'District 1 Ho Chi Minh City',
    image: img('photo-1464037866556-6812bd9d4b25'),
    distanceKm: 8,
    typicalTimeMin: [25, 55],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Ride-hail / taxi',
  },
  {
    id: 'sgn-d3',
    airportId: 'SGN',
    city: 'Ho Chi Minh City',
    area: 'District 3',
    label: 'District 3',
    mapsQuery: 'District 3 Ho Chi Minh City',
    image: img('photo-1559592413-7cec4d0cae2b'),
    distanceKm: 7,
    typicalTimeMin: [20, 50],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Ride-hail / taxi',
  },
  {
    id: 'sgn-thu-duc',
    airportId: 'SGN',
    city: 'Ho Chi Minh City',
    area: 'Thu Duc',
    label: 'Thu Duc',
    mapsQuery: 'Thu Duc Ho Chi Minh City',
    image: img('photo-1441986300917-64674bd600d8'),
    distanceKm: 14,
    typicalTimeMin: [30, 65],
    popularBase: false,
    eveningAppeal: false,
    recommendedTransfer: 'Private / taxi',
  },
  {
    id: 'sgn-d7',
    airportId: 'SGN',
    city: 'Ho Chi Minh City',
    area: 'District 7',
    label: 'District 7',
    mapsQuery: 'District 7 Ho Chi Minh City',
    image: img('photo-1486406146926-c627a92ad1ab'),
    distanceKm: 12,
    typicalTimeMin: [30, 60],
    popularBase: true,
    eveningAppeal: false,
    recommendedTransfer: 'Private / ride-hail',
  },
  {
    id: 'pqc-duong-dong',
    airportId: 'PQC',
    city: 'Phu Quoc',
    area: 'Duong Dong',
    label: 'Duong Dong',
    mapsQuery: 'Duong Dong Phu Quoc',
    image: img('photo-1507525428034-b723cf961d3e'),
    distanceKm: 10,
    typicalTimeMin: [20, 40],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / taxi',
  },
  {
    id: 'pqc-long-beach',
    airportId: 'PQC',
    city: 'Phu Quoc',
    area: 'Long Beach',
    label: 'Long Beach',
    mapsQuery: 'Long Beach Phu Quoc',
    image: img('photo-1559827260-dc66d52bef19'),
    distanceKm: 12,
    typicalTimeMin: [20, 45],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / shuttle',
  },
  {
    id: 'cxr-nha-trang',
    airportId: 'CXR',
    city: 'Nha Trang',
    area: 'City center',
    label: 'Nha Trang center',
    mapsQuery: 'Nha Trang city center',
    image: img('photo-1544551763-46a013bb70d5'),
    distanceKm: 35,
    typicalTimeMin: [40, 70],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private / shuttle',
  },
  {
    id: 'cxr-beach',
    airportId: 'CXR',
    city: 'Nha Trang',
    area: 'Beachfront',
    label: 'Nha Trang beachfront',
    mapsQuery: 'Nha Trang beachfront',
    image: img('photo-1507525428034-b723cf961d3e'),
    distanceKm: 37,
    typicalTimeMin: [45, 75],
    popularBase: true,
    eveningAppeal: true,
    recommendedTransfer: 'Private transfer',
  },
]

type RouteSeed = {
  id: string
  airportId: ArrivalRoute['airportId']
  destinationId: string
  distanceKm: number
  typicalTimeMin: [number, number]
  typicalCostUsd: [number, number]
  trafficSensitivity: ArrivalRoute['trafficSensitivity']
  modeIds: string[]
  goodToKnow: string[]
  mapsUrl: string
  modeOverrides: Partial<Record<string, Partial<{ timeMin: [number, number]; costUsd: [number, number] }> & Record<string, unknown>>>
}

const ROUTE_SEEDS: RouteSeed[] = [
  {
    id: 'han-old',
    airportId: 'HAN',
    destinationId: 'han-old-quarter',
    distanceKm: 30,
    typicalTimeMin: [35, 60],
    typicalCostUsd: [5, 25],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle', 'public-bus'],
    goodToKnow: [
      'Peak traffic can add 20–40 minutes into the Old Quarter.',
      'Ride-hailing pickups use a designated airport zone.',
      'Airport buses are cheaper but usually need a final taxi or walk.',
      'Late-night arrivals have fewer public transport options.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Noi+Bai+International+Airport/Hanoi+Old+Quarter',
    modeOverrides: {
      'private-transfer': { timeMin: [35, 50], costUsd: [14, 22], signal: '✨ Most Convenient' },
      taxi: { timeMin: [35, 60], costUsd: [12, 20], signal: '⚡ Fastest' },
      'ride-hailing': { timeMin: [35, 60], costUsd: [8, 15], signal: '💰 Best Value' },
      'airport-shuttle': { timeMin: [50, 80], costUsd: [5, 9], signal: '💰 Best Value' },
      'public-bus': { timeMin: [55, 90], costUsd: [1, 3], trafficSensitivity: 'Medium' },
    },
  },
  {
    id: 'han-west',
    airportId: 'HAN',
    destinationId: 'han-west-lake',
    distanceKm: 28,
    typicalTimeMin: [35, 55],
    typicalCostUsd: [6, 24],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'public-bus'],
    goodToKnow: [
      'West Lake hotels are often easier drop-offs than the densest Old Quarter lanes.',
      'Traffic still builds heavily in evening peak hours.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Noi+Bai+International+Airport/West+Lake+Hanoi',
    modeOverrides: {
      'private-transfer': { timeMin: [35, 50], costUsd: [13, 20] },
      taxi: { timeMin: [35, 55], costUsd: [11, 18] },
      'ride-hailing': { timeMin: [35, 55], costUsd: [7, 14] },
      'public-bus': { timeMin: [50, 85], costUsd: [1, 3] },
    },
  },
  {
    id: 'han-french',
    airportId: 'HAN',
    destinationId: 'han-french-quarter',
    distanceKm: 29,
    typicalTimeMin: [35, 58],
    typicalCostUsd: [6, 24],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle', 'public-bus'],
    goodToKnow: [
      'French Quarter drop-offs are usually clearer for first-time drivers than Old Quarter alleys.',
      'Airport buses remain cheapest but not door-to-door.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Noi+Bai+International+Airport/French+Quarter+Hanoi',
    modeOverrides: {
      'private-transfer': { timeMin: [35, 50], costUsd: [14, 21] },
      taxi: { timeMin: [35, 58], costUsd: [12, 19] },
      'ride-hailing': { timeMin: [35, 58], costUsd: [8, 14] },
      'airport-shuttle': { timeMin: [50, 75], costUsd: [5, 9] },
      'public-bus': { timeMin: [55, 90], costUsd: [1, 3] },
    },
  },
  {
    id: 'dad-city',
    airportId: 'DAD',
    destinationId: 'dad-city',
    distanceKm: 8,
    typicalTimeMin: [20, 35],
    typicalCostUsd: [4, 15],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'public-bus'],
    goodToKnow: [
      'Da Nang airport sits close to the city — transfers are usually short.',
      'Ride-hailing is widely available for central hotels.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/Da+Nang+city+center',
    modeOverrides: {
      'private-transfer': { timeMin: [20, 30], costUsd: [8, 14], signal: '✨ Most Convenient' },
      taxi: { timeMin: [20, 35], costUsd: [6, 12] },
      'ride-hailing': { timeMin: [20, 35], costUsd: [4, 9], signal: '💰 Best Value' },
      'public-bus': { timeMin: [30, 50], costUsd: [1, 2] },
    },
  },
  {
    id: 'dad-beach',
    airportId: 'DAD',
    destinationId: 'dad-my-khe',
    distanceKm: 10,
    typicalTimeMin: [20, 40],
    typicalCostUsd: [5, 16],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing'],
    goodToKnow: [
      'Beachfront hotels are a short hop from DAD — private or ride-hail is usually simplest.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/My+Khe+Beach',
    modeOverrides: {
      'private-transfer': { timeMin: [20, 35], costUsd: [9, 15] },
      taxi: { timeMin: [20, 40], costUsd: [7, 13] },
      'ride-hailing': { timeMin: [20, 40], costUsd: [5, 10] },
    },
  },
  {
    id: 'dad-hoian',
    airportId: 'DAD',
    destinationId: 'dad-hoi-an',
    distanceKm: 28,
    typicalTimeMin: [45, 70],
    typicalCostUsd: [8, 30],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle', 'public-bus'],
    goodToKnow: [
      'Hoi An is a common direct transfer from Da Nang Airport — no city change required.',
      'Shared shuttles are common on this corridor and usually cheaper per person.',
      'Late arrivals lean toward private transfer or taxi.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/Hoi+An+Ancient+Town',
    modeOverrides: {
      'private-transfer': { timeMin: [45, 60], costUsd: [18, 28], signal: '✨ Most Convenient' },
      taxi: { timeMin: [45, 70], costUsd: [16, 26] },
      'ride-hailing': { timeMin: [45, 70], costUsd: [12, 22], signal: '💰 Best Value' },
      'airport-shuttle': { timeMin: [55, 85], costUsd: [6, 12], signal: '💰 Best Value' },
      'public-bus': { timeMin: [70, 110], costUsd: [2, 4] },
    },
  },
  {
    id: 'sgn-d1',
    airportId: 'SGN',
    destinationId: 'sgn-d1',
    distanceKm: 8,
    typicalTimeMin: [25, 55],
    typicalCostUsd: [5, 18],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'public-bus'],
    goodToKnow: [
      'Tan Son Nhat sits inside the city, but peak traffic can still stretch District 1 transfers.',
      'Ride-hailing pickup zones are marked — follow airport signs after exit.',
      'Public buses are cheap but awkward with large luggage.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Tan+Son+Nhat+International+Airport/District+1+Ho+Chi+Minh+City',
    modeOverrides: {
      'private-transfer': { timeMin: [25, 45], costUsd: [12, 20], signal: '✨ Most Convenient' },
      taxi: { timeMin: [25, 55], costUsd: [8, 16], signal: '⚡ Fastest' },
      'ride-hailing': { timeMin: [25, 55], costUsd: [5, 12], signal: '💰 Best Value' },
      'public-bus': { timeMin: [40, 75], costUsd: [1, 2] },
    },
  },
  {
    id: 'sgn-d3',
    airportId: 'SGN',
    destinationId: 'sgn-d3',
    distanceKm: 7,
    typicalTimeMin: [20, 50],
    typicalCostUsd: [5, 16],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing'],
    goodToKnow: [
      'District 3 is close, but evening congestion still matters.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Tan+Son+Nhat+International+Airport/District+3+Ho+Chi+Minh+City',
    modeOverrides: {
      'private-transfer': { timeMin: [20, 40], costUsd: [11, 18] },
      taxi: { timeMin: [20, 50], costUsd: [7, 14] },
      'ride-hailing': { timeMin: [20, 50], costUsd: [5, 11] },
    },
  },
  {
    id: 'sgn-thuduc',
    airportId: 'SGN',
    destinationId: 'sgn-thu-duc',
    distanceKm: 14,
    typicalTimeMin: [30, 65],
    typicalCostUsd: [7, 22],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing'],
    goodToKnow: [
      'Thu Duc transfers are longer and more traffic-sensitive than District 1.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Tan+Son+Nhat+International+Airport/Thu+Duc',
    modeOverrides: {
      'private-transfer': { timeMin: [30, 55], costUsd: [14, 24], signal: '🧳 Best for Luggage' },
      taxi: { timeMin: [30, 65], costUsd: [10, 18] },
      'ride-hailing': { timeMin: [30, 65], costUsd: [7, 15] },
    },
  },
  {
    id: 'pqc-dd',
    airportId: 'PQC',
    destinationId: 'pqc-duong-dong',
    distanceKm: 10,
    typicalTimeMin: [20, 40],
    typicalCostUsd: [5, 18],
    trafficSensitivity: 'Low',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle', 'rental-car'],
    goodToKnow: [
      'Phu Quoc transfers are generally short and low-stress.',
      'Hotel shuttles are common if arranged in advance.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Phu+Quoc+International+Airport/Duong+Dong',
    modeOverrides: {
      'private-transfer': { timeMin: [20, 35], costUsd: [10, 18], signal: '✨ Most Convenient' },
      taxi: { timeMin: [20, 40], costUsd: [8, 15] },
      'ride-hailing': { timeMin: [20, 40], costUsd: [6, 12] },
      'airport-shuttle': { timeMin: [25, 45], costUsd: [4, 8] },
      'rental-car': { timeMin: [20, 40], costUsd: [25, 45], signal: '👥 Best for Groups' },
    },
  },
  {
    id: 'pqc-long',
    airportId: 'PQC',
    destinationId: 'pqc-long-beach',
    distanceKm: 12,
    typicalTimeMin: [20, 45],
    typicalCostUsd: [6, 20],
    trafficSensitivity: 'Low',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle'],
    goodToKnow: [
      'Long Beach resorts often arrange private pickups — confirm hotel meeting points.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Phu+Quoc+International+Airport/Long+Beach+Phu+Quoc',
    modeOverrides: {
      'private-transfer': { timeMin: [20, 40], costUsd: [12, 20] },
      taxi: { timeMin: [20, 45], costUsd: [9, 16] },
      'ride-hailing': { timeMin: [20, 45], costUsd: [7, 13] },
      'airport-shuttle': { timeMin: [30, 55], costUsd: [5, 10] },
    },
  },
  {
    id: 'cxr-nt',
    airportId: 'CXR',
    destinationId: 'cxr-nha-trang',
    distanceKm: 35,
    typicalTimeMin: [40, 70],
    typicalCostUsd: [8, 30],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle', 'public-bus'],
    goodToKnow: [
      'Cam Ranh sits well outside Nha Trang — budget more time than a city airport hop.',
      'Shared shuttles are popular and usually good value.',
      'Late-night public buses are limited.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Cam+Ranh+International+Airport/Nha+Trang',
    modeOverrides: {
      'private-transfer': { timeMin: [40, 60], costUsd: [18, 28], signal: '✨ Most Convenient' },
      taxi: { timeMin: [40, 70], costUsd: [16, 26] },
      'ride-hailing': { timeMin: [40, 70], costUsd: [12, 22] },
      'airport-shuttle': { timeMin: [50, 80], costUsd: [6, 12], signal: '💰 Best Value' },
      'public-bus': { timeMin: [60, 100], costUsd: [2, 4] },
    },
  },
  {
    id: 'cxr-beach',
    airportId: 'CXR',
    destinationId: 'cxr-beach',
    distanceKm: 37,
    typicalTimeMin: [45, 75],
    typicalCostUsd: [9, 32],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle'],
    goodToKnow: [
      'Beachfront hotels add a little time versus central Nha Trang drops.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Cam+Ranh+International+Airport/Nha+Trang+beachfront',
    modeOverrides: {
      'private-transfer': { timeMin: [45, 65], costUsd: [20, 30], signal: '🧳 Best for Luggage' },
      taxi: { timeMin: [45, 75], costUsd: [17, 28] },
      'ride-hailing': { timeMin: [45, 75], costUsd: [13, 24] },
      'airport-shuttle': { timeMin: [55, 90], costUsd: [7, 13] },
    },
  },
  {
    id: 'han-badinh',
    airportId: 'HAN',
    destinationId: 'han-ba-dinh',
    distanceKm: 27,
    typicalTimeMin: [30, 55],
    typicalCostUsd: [6, 22],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing'],
    goodToKnow: [
      'Ba Dinh drop-offs are usually clearer than Old Quarter alleys.',
      'Evening traffic still stretches airport transfers.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Noi+Bai+International+Airport/Ba+Dinh+Hanoi',
    modeOverrides: {
      'private-transfer': { timeMin: [30, 50], costUsd: [13, 20] },
      taxi: { timeMin: [30, 55], costUsd: [11, 18] },
      'ride-hailing': { timeMin: [30, 55], costUsd: [7, 14] },
    },
  },
  {
    id: 'dad-hoian-city',
    airportId: 'DAD',
    destinationId: 'dad-hoi-an-city',
    distanceKm: 30,
    typicalTimeMin: [45, 70],
    typicalCostUsd: [8, 30],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle'],
    goodToKnow: [
      'Hoi An is a direct corridor from Da Nang Airport.',
      'Shared shuttles are common and usually good per-person value.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/Hoi+An',
    modeOverrides: {
      'private-transfer': { timeMin: [45, 60], costUsd: [18, 28], signal: '✨ Most Convenient' },
      taxi: { timeMin: [45, 70], costUsd: [16, 26] },
      'ride-hailing': { timeMin: [45, 70], costUsd: [12, 22] },
      'airport-shuttle': { timeMin: [55, 85], costUsd: [6, 12], signal: '💰 Best Value' },
    },
  },
  {
    id: 'dad-anbang',
    airportId: 'DAD',
    destinationId: 'dad-an-bang',
    distanceKm: 32,
    typicalTimeMin: [50, 75],
    typicalCostUsd: [10, 32],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'airport-shuttle'],
    goodToKnow: [
      'An Bang sits just beyond central Hoi An — private transfer is usually simplest with luggage.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/An+Bang+Beach',
    modeOverrides: {
      'private-transfer': { timeMin: [50, 70], costUsd: [20, 30], signal: '✨ Most Convenient' },
      taxi: { timeMin: [50, 75], costUsd: [18, 28] },
      'ride-hailing': { timeMin: [50, 75], costUsd: [14, 24] },
      'airport-shuttle': { timeMin: [60, 90], costUsd: [7, 13] },
    },
  },
  {
    id: 'dad-marble',
    airportId: 'DAD',
    destinationId: 'dad-marble',
    distanceKm: 14,
    typicalTimeMin: [25, 45],
    typicalCostUsd: [6, 18],
    trafficSensitivity: 'Low',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing'],
    goodToKnow: [
      'Marble Mountains is a short hop south of Da Nang — taxi or private is usually enough.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/Marble+Mountains',
    modeOverrides: {
      'private-transfer': { timeMin: [25, 40], costUsd: [10, 16] },
      taxi: { timeMin: [25, 45], costUsd: [8, 14] },
      'ride-hailing': { timeMin: [25, 45], costUsd: [5, 11], signal: '💰 Best Value' },
    },
  },
  {
    id: 'dad-hue',
    airportId: 'DAD',
    destinationId: 'dad-hue',
    distanceKm: 100,
    typicalTimeMin: [120, 160],
    typicalCostUsd: [25, 70],
    trafficSensitivity: 'Medium',
    modeIds: ['private-transfer', 'taxi', 'airport-shuttle'],
    goodToKnow: [
      'Hue is a longer transfer from Da Nang Airport — plan 2–3 hours typically.',
      'Private transfer is usually the most predictable door-to-door option.',
    ],
    mapsUrl: 'https://www.google.com/maps/dir/Da+Nang+International+Airport/Hue',
    modeOverrides: {
      'private-transfer': { timeMin: [120, 150], costUsd: [40, 65], signal: '✨ Most Convenient' },
      taxi: { timeMin: [120, 160], costUsd: [35, 60] },
      'airport-shuttle': { timeMin: [140, 180], costUsd: [12, 22], signal: '💰 Best Value' },
    },
  },
  {
    id: 'sgn-d7',
    airportId: 'SGN',
    destinationId: 'sgn-d7',
    distanceKm: 12,
    typicalTimeMin: [30, 60],
    typicalCostUsd: [7, 20],
    trafficSensitivity: 'High',
    modeIds: ['private-transfer', 'taxi', 'ride-hailing', 'public-bus'],
    goodToKnow: ['District 7 transfers often take longer in peak traffic than the map suggests.'],
    mapsUrl: 'https://www.google.com/maps/dir/Tan+Son+Nhat+International+Airport/District+7+Ho+Chi+Minh+City',
    modeOverrides: {
      'private-transfer': { timeMin: [30, 55], costUsd: [14, 22] },
      taxi: { timeMin: [30, 60], costUsd: [10, 18] },
      'ride-hailing': { timeMin: [30, 60], costUsd: [7, 14] },
    },
  },
]

function insightFromNote(note: string): { icon: string; title: string; note: string } {
  const n = note.toLowerCase()
  if (n.includes('traffic') || n.includes('congestion'))
    return { icon: '🚦', title: 'Traffic', note }
  if (n.includes('ride-hail') || n.includes('pickup'))
    return { icon: '⚠️', title: 'Airport pickup', note }
  if (n.includes('late') || n.includes('night'))
    return { icon: '🌙', title: 'Late arrivals', note }
  if (n.includes('luggage') || n.includes('bag'))
    return { icon: '🧳', title: 'Luggage', note }
  if (n.includes('bus') || n.includes('shuttle') || n.includes('cheap'))
    return { icon: '💰', title: 'Value note', note }
  if (n.includes('buffer') || n.includes('flight') || n.includes('depart'))
    return { icon: '✈️', title: 'Airport buffer', note }
  return { icon: 'ℹ️', title: 'Good to know', note }
}

const OUTBOUND_NOTES = [
  'Leave earlier during peak city traffic — outbound congestion often mirrors the inbound delay.',
  'Some shared services use fixed city pickup points rather than door pickup.',
  'Build enough airport buffer into the journey before international check-in.',
]

export const ROUTES: ArrivalRoute[] = ROUTE_SEEDS.map((r) => ({
  id: r.id,
  airportId: r.airportId,
  destinationId: r.destinationId,
  distanceKm: r.distanceKm,
  typicalTimeMin: r.typicalTimeMin,
  typicalCostUsd: r.typicalCostUsd,
  trafficSensitivity: r.trafficSensitivity,
  modeIds: toCanonicalModeIds(r.modeIds),
  goodToKnow: r.goodToKnow.map(insightFromNote),
  goodToKnowOutbound: [
    ...OUTBOUND_NOTES.map(insightFromNote),
    insightFromNote(
      r.trafficSensitivity === 'High'
        ? 'Peak outbound traffic can add 20–40 min — leave with margin.'
        : 'Confirm drop-off terminal before you leave.',
    ),
  ],
  mapsUrl: r.mapsUrl,
  dataState: 'typical' as const,
  updatedAt: '2026-08-01',
}))

export function getAirport(id: Airport['id']) {
  return AIRPORTS.find((a) => a.id === id)
}

export function getDestinationsForAirport(airportId: Airport['id']) {
  return DESTINATIONS.filter((d) => d.airportId === airportId)
}

export function getDestination(id: string) {
  return DESTINATIONS.find((d) => d.id === id)
}

export function getRoute(airportId: Airport['id'], destinationId: string) {
  return ROUTES.find((r) => r.airportId === airportId && r.destinationId === destinationId)
}

export function getRouteInsights(route: ArrivalRoute, direction: TransferDirection) {
  return direction === 'outbound' ? route.goodToKnowOutbound : route.goodToKnow
}

function overridesForCanonical(
  seed: RouteSeed,
  modeId: TransportModeId,
): Partial<{ timeMin: [number, number]; costUsd: [number, number] }> {
  const o = seed.modeOverrides ?? {}
  if (modeId === 'car-taxi') return o['taxi'] ?? o['private-transfer'] ?? o['car-taxi'] ?? {}
  if (modeId === 'ride-hailing') return o['ride-hailing'] ?? o['taxi'] ?? {}
  if (modeId === 'rental-driver') return o['rental-car'] ?? o['rental-driver'] ?? {}
  if (modeId === 'public-bus') return o['public-bus'] ?? o['train'] ?? {}
  return o[modeId] ?? {}
}

export function getModesForRoute(
  route: ArrivalRoute,
  direction: TransferDirection = 'inbound',
): TransportMode[] {
  const seed = ROUTE_SEEDS.find((r) => r.id === route.id)
  return route.modeIds.map((modeId) => {
    const over = seed ? overridesForCanonical(seed, modeId) : {}
    const fallbackCost: [number, number] =
      modeId === 'car-taxi'
        ? [8, 20]
        : modeId === 'ride-hailing'
          ? [5, 16]
          : modeId === 'public-bus'
            ? [1, 4]
            : [22, 45]
    return buildMode(
      modeId,
      {
        timeMin: over.timeMin ?? route.typicalTimeMin,
        costUsd: over.costUsd ?? fallbackCost,
      },
      direction,
    )
  })
}

export function getDefaultModes(direction: TransferDirection = 'inbound') {
  return defaultModes(direction)
}

export function getProvidersForMode(
  routeId: string,
  modeId: TransportModeId,
  direction: TransferDirection = 'inbound',
  timeLabel = '35–50 min',
) {
  return providersForMode(routeId, modeId, direction, timeLabel)
}

export function getDefaultProviders(
  modeId: TransportModeId,
  direction: TransferDirection,
  timeLabel: string,
) {
  return providersForMode(`vietnam-typical-${modeId}`, modeId, direction, timeLabel)
}

export function priceBasisLabel(basis: TransportMode['priceBasis']): string {
  if (basis === 'per_vehicle') return ' / vehicle'
  if (basis === 'per_person') return ' / person'
  if (basis === 'per_trip') return ' / trip'
  return ''
}

export function formatCostRange(mode: TransportMode): string {
  const [a, b] = mode.costUsd
  const basis = priceBasisLabel(mode.priceBasis)
  if (a === b) return `$${a}${basis}`
  return `Typically $${a}–$${b}${basis}`
}

export function formatCostCompact(mode: TransportMode): string {
  const [a, b] = mode.costUsd
  if (a === b) return `$${a}`
  return `$${a}–${b}`
}

export function formatTimeRange(range: [number, number]): string {
  return `${range[0]}–${range[1]} min`
}

export function formatCostWithBasis(mode: TransportMode): string {
  return `${formatCostCompact(mode)}${priceBasisLabel(mode.priceBasis)}`
}
