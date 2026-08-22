export type ClimateRegionId =
  | 'northern-mountains'
  | 'northern-delta'
  | 'north-central'
  | 'south-central-coast'
  | 'central-highlands'
  | 'southeast'
  | 'mekong-delta'

export type ClimateRegionMeta = {
  id: ClimateRegionId
  name: string
  shortName: string
}

export const CLIMATE_REGIONS: ClimateRegionMeta[] = [
  { id: 'northern-mountains', name: 'Northern Mountains', shortName: 'N. Mountains' },
  { id: 'northern-delta', name: 'Northern Vietnam', shortName: 'North / Hanoi' },
  { id: 'north-central', name: 'North Central Coast', shortName: 'N. Central' },
  { id: 'south-central-coast', name: 'South Central Coast', shortName: 'S. Central' },
  { id: 'central-highlands', name: 'Central Highlands', shortName: 'Highlands' },
  { id: 'southeast', name: 'Southeast Vietnam', shortName: 'Southeast' },
  { id: 'mekong-delta', name: 'Mekong Delta', shortName: 'Mekong' },
]

export type CityMarker = {
  id: string
  name: string
  lng: number
  lat: number
  regionId: ClimateRegionId
}

export const CITY_MARKERS: CityMarker[] = [
  { id: 'hanoi', name: 'Hanoi', lng: 105.85, lat: 21.03, regionId: 'northern-delta' },
  { id: 'ninh-binh', name: 'Ninh Binh', lng: 105.97, lat: 20.25, regionId: 'northern-delta' },
  { id: 'hue', name: 'Hue', lng: 107.58, lat: 16.46, regionId: 'north-central' },
  { id: 'da-nang', name: 'Da Nang', lng: 108.2, lat: 16.05, regionId: 'south-central-coast' },
  { id: 'hoi-an', name: 'Hoi An', lng: 108.33, lat: 15.88, regionId: 'south-central-coast' },
  { id: 'hcmc', name: 'Ho Chi Minh City', lng: 106.7, lat: 10.78, regionId: 'southeast' },
]

/** Fallback bbox; prefer bounds computed from loaded GeoJSON. */
export const VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [102.1, 8.3],
  [109.7, 23.5],
]
