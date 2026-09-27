import { describe, expect, it } from 'vitest'
import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { buildYourVietnam } from './buildYourVietnam'
import { cityDayHostsFullVisit, packTripStay } from './dayAllocation'
import { buildCompactTimeline } from './dayTimeline'
import { parseHoursLabel } from './openingHours'
import type { ItineraryItem } from './types'

const IN_TOWN_HOI_AN = [
  'hoi-an-ancient-town',
  'japanese-covered-bridge',
  'tan-ky-old-house',
  'fujian-assembly-hall',
  'quan-cong-temple',
  'phung-hung-old-house',
  'ha-lantern-make',
  'ha-folk-dance',
]

function sightIds(tripDays: { city: string; periods: { items: { sourceId?: string }[] }[] }[]) {
  return tripDays
    .filter((d) => d.city.toLowerCase().includes('hoi an'))
    .flatMap((d) => d.periods.flatMap((p) => p.items.map((it) => it.sourceId).filter(Boolean))) as string[]
}

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items]
  let a = seed
  for (let i = out.length - 1; i > 0; i--) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    const j = a % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

describe('adding sights to an existing Hoi An day', () => {
  it('keeps lantern class and folk dance on the one existing city day', () => {
    const trip = buildYourVietnam({
      days: 8,
      startDate: '2026-09-14',
      travelStyle: 'balanced',
      holidayKind: 'culture-food',
      holidayKindKnown: true,
      paceKnown: true,
      experienceIds: [],
      activityIds: ['ha-lantern-make', 'ha-folk-dance'],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [{ id: 'hoa-day-6', placeId: 'hoi-an', blank: false }],
    })
    const hoiAn = trip.days.filter((d) => d.city.toLowerCase().includes('hoi an'))
    expect(hoiAn).toHaveLength(1)
    expect(sightIds(hoiAn)).toEqual(expect.arrayContaining(['ha-folk-dance', 'ha-lantern-make']))
    const dance = hoiAn[0].periods.flatMap((p) => p.items).find((it) => it.sourceId === 'ha-folk-dance')
    expect(dance).toBeTruthy()
  })

  it('does not invent a second Hoi An day when Add More sights still fits', () => {
    const before = ['ha-lantern-make', 'ha-folk-dance']
    const after = [...before, 'japanese-covered-bridge']
    const packedBefore = packTripStay([{ placeId: 'hoi-an', ids: before }], '2026-09-14', 1, {
      'hoi-an': 1,
    })
    expect(packedBefore[0].days).toHaveLength(1)
    const packedAfter = packTripStay([{ placeId: 'hoi-an', ids: after }], '2026-09-14', 1, {
      'hoi-an': packedBefore[0].days.length,
    })
    expect(cityDayHostsFullVisit(after, 'hoi-an', '2026-09-14')).toBe(true)
    expect(packedAfter[0].days).toHaveLength(1)
    expect(packedAfter[0].days.flat().sort()).toEqual([...after].sort())
  })

  it('shows a sight the traveller pinned onto the open itinerary day', () => {
    const trip = buildYourVietnam({
      days: 8,
      startDate: '2026-09-14',
      travelStyle: 'balanced',
      holidayKind: 'culture-food',
      holidayKindKnown: true,
      paceKnown: true,
      experienceIds: ['japanese-covered-bridge'],
      activityIds: ['ha-lantern-make'],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [{ id: 'hoa-day-6', placeId: 'hoi-an', blank: false }],
      itineraryDaySlotOverrides: {
        'ha-lantern-make': 'hoa-day-6',
        'japanese-covered-bridge': 'hoa-day-6',
      },
      itinerarySightOrder: {
        'hoa-day-6:tour': ['ha-lantern-make', 'japanese-covered-bridge'],
      },
    })
    const hoiAn = trip.days.filter((d) => d.city.toLowerCase().includes('hoi an'))
    expect(hoiAn).toHaveLength(1)
    expect(sightIds(hoiAn)).toEqual(
      expect.arrayContaining(['ha-lantern-make', 'japanese-covered-bridge']),
    )
  })
})

describe('itinerary quality across random in-town Hoi An batches', () => {
  it('fills the existing stay day when the combined walk still hosts a full visit', () => {
    const known = new Set([
      ...EXPERIENCES.filter((e) => e.city === 'Hoi An').map((e) => e.id),
      ...CITY_ACTIVITIES.filter((a) => a.cityId === 'hoi-an').map((a) => a.id),
    ])
    const pool = IN_TOWN_HOI_AN.filter((id) => known.has(id))
    expect(pool.length).toBeGreaterThanOrEqual(6)

    for (const seed of [1, 7, 13, 29, 41, 88]) {
      const batch = shuffle(pool, seed).slice(0, 4)
      const packed = packTripStay([{ placeId: 'hoi-an', ids: batch }], '2026-09-15', 1, {
        'hoi-an': 1,
      })
      expect(packed[0].days.flat().sort(), `seed ${seed}`).toEqual([...batch].sort())
      if (cityDayHostsFullVisit(batch, 'hoi-an', '2026-09-15')) {
        expect(packed[0].days.length, `seed ${seed} ${batch.join(',')}`).toBe(1)
      }
    }
  })
})

describe('folk dance crowding warning', () => {
  it('does not leave folk dance unplaced beside a 90-minute lantern class', () => {
    const lantern: ItineraryItem = {
      id: 'lantern-row',
      sourceId: 'ha-lantern-make',
      name: 'Foldable lantern making class',
      kind: 'activity',
      selectionState: 'selected',
      period: 'morning',
      timeLabel: '09:00',
      city: 'Hoi An',
      region: 'Hoi An',
      costUsd: 15,
      icon: '',
    }
    const dance: ItineraryItem = {
      id: 'dance-row',
      sourceId: 'ha-folk-dance',
      name: 'Intro to Vietnamese folk dance',
      kind: 'activity',
      selectionState: 'selected',
      period: 'afternoon',
      timeLabel: '',
      city: 'Hoi An',
      region: 'Hoi An',
      costUsd: 12,
      icon: '',
    }
    const { unplaced, blocks } = buildCompactTimeline({
      sights: [lantern, dance],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: { 'ha-lantern-make': 1.5, 'ha-folk-dance': 1 },
      startOverrides: { 'ha-lantern-make': '09:00' },
      legs: {},
      hoursOf: (item) =>
        parseHoursLabel(item.sourceId === 'ha-folk-dance' ? '08:00 – 18:00' : '09:00 – 21:00', 2),
    })
    expect(unplaced).toEqual([])
    const placed = blocks.filter((b) => b.type === 'sight')
    expect(placed).toHaveLength(2)
  })
})
