import type { StayCity, StayCityId } from './types'

export const STAY_CITIES: StayCity[] = [
  {
    id: 'hanoi',
    label: 'Hanoi',
    image: 'https://images.unsplash.com/photo-1509030450996-dd1a26cea77b?auto=format&fit=crop&w=900&q=80',
    overview:
      'Choose between the atmospheric old centre, calmer civic quarters and the lakeside north; traffic makes the right base matter.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Old Quarter',
      bestQuiet: 'West Lake / Tay Ho',
      bestValue: 'Ba Dinh',
    },
    mapCityId: 'hanoi',
    bounds: { west: 105.75, south: 20.96, east: 105.92, north: 21.09 },
    defaultClusterId: 'hanoi-old-quarter',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'luxury', 'walkable', 'food', 'culture',
    ],
  },
  {
    id: 'hcmc',
    label: 'Ho Chi Minh City',
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80',
    overview:
      'A large, energetic city where District 1 is easiest for sights, while nearby districts trade convenience for local rhythm or space.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'District 1',
      bestQuiet: 'Thao Dien',
      bestValue: 'Phu Nhuan',
    },
    mapCityId: 'hcmc',
    bounds: { west: 106.64, south: 10.73, east: 106.76, north: 10.84 },
    defaultClusterId: 'hcmc-district-1',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'luxury', 'walkable', 'food', 'culture',
    ],
  },
  {
    id: 'da-nang',
    label: 'Da Nang',
    image: 'https://images.unsplash.com/photo-1559592413-7e1e45f48f53?auto=format&fit=crop&w=900&q=80',
    overview:
      'The Han River divides the working city centre from the beach districts; pick your side based on food and city life versus sand.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'My Khe Beach',
      bestQuiet: 'Son Tra',
      bestValue: 'Hai Chau Centre',
      bestBeach: 'My Khe Beach',
    },
    mapCityId: 'da-nang',
    bounds: { west: 108.14, south: 15.98, east: 108.3, north: 16.12 },
    defaultClusterId: 'danang-my-khe',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'beach', 'luxury', 'walkable', 'food',
    ],
  },
  {
    id: 'hoi-an',
    label: 'Hoi An',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    overview:
      'Stay in or near the lantern-lit old town for easy evenings, among rice fields for calm, or at An Bang for a beach-led visit.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Old Town',
      bestQuiet: 'Cam Chau',
      bestValue: 'Cam Pho',
      bestBeach: 'An Bang / Cua Dai Beach',
    },
    mapCityId: 'hoi-an',
    bounds: { west: 108.305, south: 15.855, east: 108.380, north: 15.925 },
    defaultClusterId: 'hoian-ancient-town',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'beach', 'luxury', 'walkable', 'food', 'culture',
    ],
  },
  {
    id: 'hue',
    label: 'Hue',
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=900&q=80',
    overview:
      'The Perfume River separates the Citadel from the livelier hotel quarter; distances are short, but each bank has a distinct mood.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Perfume River South Bank',
      bestQuiet: 'Phu Hiep',
      bestValue: 'Citadel Area',
    },
    mapCityId: 'hue',
    bounds: { west: 107.52, south: 16.4, east: 107.64, north: 16.5 },
    defaultClusterId: 'hue-riverside',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'luxury', 'walkable', 'food', 'culture',
    ],
  },
  {
    id: 'nha-trang',
    label: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
    overview:
      'Most visitors stay along the long beachfront; the centre is busiest, while northern and southern stretches feel more residential.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Centre / Promenade',
      bestQuiet: 'North Beach',
      bestValue: 'South Tran Phu',
      bestBeach: 'Centre / Promenade',
    },
    mapCityId: 'nha-trang',
    bounds: { west: 109.14, south: 12.2, east: 109.24, north: 12.3 },
    defaultClusterId: 'nhatrang-centre',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'beach', 'luxury', 'walkable', 'food',
    ],
  },
  {
    id: 'dalat',
    label: 'Da Lat',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
    overview:
      'Central stays simplify market evenings; lake and hillside bases offer cooler calm but usually mean short taxi rides.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Da Lat Centre',
      bestQuiet: 'Quieter Hillside',
      bestValue: 'Da Lat Centre',
    },
    mapCityId: 'dalat',
    bounds: { west: 108.4, south: 11.9, east: 108.5, north: 11.98 },
    defaultClusterId: 'dalat-centre',
    availableFilters: [
      'budget', 'central', 'quiet', 'families', 'first-trip', 'luxury',
      'walkable', 'food', 'culture',
    ],
  },
  {
    id: 'phu-quoc',
    label: 'Phu Quoc',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=900&q=80',
    overview:
      'Resort areas spread along the west coast: Duong Dong has local life, Long Beach is easiest, and Ong Lang is the quiet escape.',
    typicalCostLevel: [1, 4],
    glance: {
      bestFirstTrip: 'Long Beach',
      bestQuiet: 'Ong Lang',
      bestValue: 'Duong Dong',
      bestBeach: 'Long Beach',
    },
    mapCityId: null,
    bounds: { west: 103.95, south: 10.15, east: 104.05, north: 10.35 },
    defaultClusterId: 'phuquoc-long-beach',
    availableFilters: [
      'budget', 'central', 'quiet', 'nightlife', 'families', 'first-trip',
      'beach', 'luxury', 'food',
    ],
  },
]

export const STAY_CITY_BY_ID = Object.fromEntries(
  STAY_CITIES.map((city) => [city.id, city]),
) as Record<StayCityId, StayCity>

export function getStayCity(cityId: StayCityId): StayCity {
  return STAY_CITY_BY_ID[cityId]
}
