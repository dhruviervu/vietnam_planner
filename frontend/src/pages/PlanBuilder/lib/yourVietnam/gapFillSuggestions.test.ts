import { describe, expect, it } from 'vitest'
import { parseHoursLabel } from './openingHours'
import {
  hasEnoughFreeTime,
  idleMinutesAfterTransit,
  pickGapFillSuggestions,
  pickNearbyGapFills,
  type GapFillCandidate,
} from './gapFillSuggestions'
import { insertSourceIdBetween } from './sightOrder'
import { clampHhmmToBounds, sightStartBounds } from './sightStartBounds'

const hanoi = { lat: 21.0285, lng: 105.8542 }
const nearby = { lat: 21.0305, lng: 105.8524 }
const far = { lat: 21.0406, lng: 105.799 }

function cand(partial: Partial<GapFillCandidate> & { id: string }): GapFillCandidate {
  return {
    kind: 'experience',
    name: partial.id,
    city: 'Hanoi',
    durationHours: 0.75,
    coord: nearby,
    hours: parseHoursLabel('08:00–18:00', 3),
    ...partial,
  }
}

describe('gap fill idle window', () => {
  it('needs at least 75 minutes after the hop', () => {
    expect(idleMinutesAfterTransit(11, 12.5)).toBe(90)
    expect(hasEnoughFreeTime(11, 12.5)).toBe(true)
    expect(hasEnoughFreeTime(11, 12)).toBe(false)
  })

  it('suggests a nearby open stop that fits before the next sight', () => {
    const rows = pickGapFillSuggestions({
      from: hanoi,
      to: nearby,
      gapStartHour: 11,
      gapEndHour: 14,
      candidates: [
        cand({ id: 'ngoc-son-temple', name: 'Ngọc Sơn Temple' }),
        cand({ id: 'ethnology-museum', name: 'Ethnology', coord: far, durationHours: 2.5 }),
      ],
    })
    expect(rows.map((r) => r.id)).toContain('ngoc-son-temple')
    expect(rows.map((r) => r.id)).not.toContain('ethnology-museum')
  })

  it('skips a stop that is closed or too long for the wait', () => {
    const rows = pickGapFillSuggestions({
      from: hanoi,
      to: nearby,
      gapStartHour: 11,
      gapEndHour: 12.4,
      candidates: [
        cand({
          id: 'closed-shop',
          kind: 'shopping',
          hours: { ...parseHoursLabel('08:00–18:00', 3), closedToday: true },
        }),
        cand({ id: 'long-walk', durationHours: 2 }),
      ],
    })
    expect(rows).toEqual([])
  })

  it('widens the walk when nothing sits inside 3 km', () => {
    const eightKm = { lat: 21.1, lng: 105.8542 }
    const opts = {
      from: hanoi,
      to: hanoi,
      gapStartHour: 11,
      gapEndHour: 14,
      candidates: [cand({ id: 'far-pagoda', name: 'Far pagoda', coord: eightKm })],
    }
    expect(pickGapFillSuggestions(opts).map((r) => r.id)).not.toContain('far-pagoda')
    expect(pickNearbyGapFills(opts).map((r) => r.id)).toContain('far-pagoda')
  })
})

describe('insertSourceIdBetween', () => {
  it('splices onto the hop without reordering the rest of the day', () => {
    expect(
      insertSourceIdBetween(
        ['ho-chi-minh-mausoleum', 'west-lake', 'old-quarter'],
        'ho-chi-minh-mausoleum',
        'west-lake',
        'one-pillar-pagoda',
      ),
    ).toEqual(['ho-chi-minh-mausoleum', 'one-pillar-pagoda', 'west-lake', 'old-quarter'])
  })
})

describe('sight start bounds', () => {
  const hours = parseHoursLabel('08:00–17:00', 3)

  it('will not start before you can arrive or after closing', () => {
    const bounds = sightStartBounds({
      currentStartHour: 14,
      durationHours: 1,
      hours,
      arriveHour: 13,
      dayStartHour: 9,
      dayEndHour: 22,
      lastSightEndHour: 18,
    })
    expect(bounds.minHour).toBeGreaterThanOrEqual(13)
    expect(bounds.maxHour).toBeLessThanOrEqual(16)
    expect(clampHhmmToBounds('10:00', bounds.minHour, bounds.maxHour)).toBe('13:00')
  })

  it('caps a later start so the last sight still ends on time', () => {
    const bounds = sightStartBounds({
      currentStartHour: 10,
      durationHours: 1,
      hours,
      arriveHour: 9,
      dayStartHour: 9,
      dayEndHour: 18,
      lastSightEndHour: 17.5,
    })
    expect(bounds.maxHour).toBeLessThanOrEqual(10.5 + 0.01)
    expect(clampHhmmToBounds('16:00', bounds.minHour, bounds.maxHour)).toBe('10:30')
  })
})
