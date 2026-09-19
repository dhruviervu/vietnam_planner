import { describe, expect, it } from 'vitest'
import { urbanCities } from '../data/places'
import {
  formatPhotonFeature,
  kindFromOsm,
  matchLocalPlaces,
  mergeSuggestions,
  normalizePlaceQuery,
} from './placeSuggestions'

const locals = [
  {
    id: 'han-old-quarter',
    label: 'Old Quarter',
    subtitle: 'Hoan Kiem',
    lat: 21.034,
    lng: 105.852,
    source: 'landmark' as const,
    popular: true,
  },
  {
    id: 'han-west-lake',
    label: 'West Lake',
    subtitle: 'Tay Ho',
    lat: 21.058,
    lng: 105.823,
    source: 'landmark' as const,
  },
  {
    id: 'bag-hotel',
    label: 'La Siesta Classic Ma May',
    subtitle: 'In your trip',
    lat: 21.0356,
    lng: 105.8524,
    source: 'bag' as const,
    popular: true,
  },
]

describe('place suggestions', () => {
  it('normalizes Vietnamese diacritics', () => {
    expect(normalizePlaceQuery('Hồ Hoàn Kiếm')).toBe('ho hoan kiem')
  })

  it('ranks local landmarks that start with the query first', () => {
    const hits = matchLocalPlaces('old', locals)
    expect(hits[0]?.title).toBe('Old Quarter')
    expect(hits[0]?.source).toBe('landmark')
  })

  it('shows popular locals when the query is empty', () => {
    const hits = matchLocalPlaces('', locals)
    expect(hits.some((h) => h.title === 'Old Quarter')).toBe(true)
    expect(hits.some((h) => h.source === 'bag')).toBe(true)
  })

  it('formats Photon features like a maps dropdown row', () => {
    const hit = formatPhotonFeature({
      geometry: { coordinates: [105.8524, 21.0285] },
      properties: {
        osm_id: 1,
        osm_type: 'W',
        osm_key: 'tourism',
        osm_value: 'attraction',
        name: 'Hoan Kiem Lake',
        city: 'Hanoi',
        street: 'Dinh Tien Hoang',
      },
    })
    expect(hit?.title).toBe('Hoan Kiem Lake')
    expect(hit?.subtitle).toContain('Hanoi')
    expect(hit?.kind).toBe('Landmark')
    expect(hit?.lat).toBeCloseTo(21.0285)
    expect(hit?.lng).toBeCloseTo(105.8524)
  })

  it('drops remote hits that sit on a local landmark', () => {
    const localHits = matchLocalPlaces('old', locals)
    const merged = mergeSuggestions(
      localHits,
      [
        {
          id: 'search-dup',
          title: 'Old Quarter',
          subtitle: 'Hanoi',
          lat: 21.03405,
          lng: 105.85202,
          source: 'search',
          kind: 'Area',
        },
        {
          id: 'search-far',
          title: 'Hanoi Railway Station',
          subtitle: 'Hanoi',
          lat: 21.024,
          lng: 105.841,
          source: 'search',
          kind: 'Station',
        },
      ],
      'old',
    )
    expect(merged.filter((h) => h.title === 'Old Quarter')).toHaveLength(1)
    expect(merged.some((h) => h.title === 'Hanoi Railway Station')).toBe(true)
  })

  it('ranks a named remote hit above locals that only match the district', () => {
    const localHits = matchLocalPlaces('hoan kiem', locals)
    const merged = mergeSuggestions(
      localHits,
      [
        {
          id: 'search-lake',
          title: 'Hoan Kiem Lake',
          subtitle: 'Hanoi',
          lat: 21.0285,
          lng: 105.8524,
          source: 'search',
          kind: 'Place',
        },
      ],
      'hoan kiem',
    )
    expect(merged[0]?.title).toBe('Hoan Kiem Lake')
  })

  it('labels osm kinds the way a maps dropdown would', () => {
    expect(kindFromOsm('railway', 'station')).toBe('Station')
    expect(kindFromOsm('aeroway', 'aerodrome')).toBe('Airport')
    expect(kindFromOsm('highway', 'residential')).toBe('Road')
  })

  it('lists every urban-relevant city in the top bar', () => {
    const cities = urbanCities()
    expect(cities.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        'hanoi',
        'ha-giang',
        'sapa',
        'ha-long',
        'ninh-binh',
        'phong-nha',
        'hue',
        'da-nang',
        'hoi-an',
        'nha-trang',
        'dalat',
        'hcmc',
        'can-tho',
        'phu-quoc',
        'ha-tien',
        'con-dao',
      ]),
    )
    expect(cities.some((c) => c.id === 'mekong')).toBe(false)
    expect(cities.length).toBeGreaterThan(8)
  })
})
