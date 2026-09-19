import { describe, expect, it } from 'vitest'
import { clocksForTour } from './clockTimes'
import { parseHoursLabel } from './openingHours'
import { hopHoursBetween } from './osrmRoute'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { packHopHours } from './dayAllocation'
import type { ItineraryItem } from './types'

function sight(
  partial: Partial<ItineraryItem> & { id: string; sourceId: string; name: string },
): ItineraryItem {
  return {
    kind: 'experience',
    selectionState: 'selected',
    period: 'morning',
    timeLabel: '',
    city: 'Hanoi',
    region: 'Hanoi',
    costUsd: 3,
    icon: '',
    ...partial,
  }
}

describe('clocksForTour packed order', () => {
  it('follows tour order instead of jumping to a far earlier-open sight', () => {
    const lake = sight({ id: 'lake', sourceId: 'hoan-kiem-lake', name: 'Hoan Kiem' })
    const pottery = sight({ id: 'pottery', sourceId: 'bat-trang-pottery', name: 'Bat Trang' })
    const hoursOf = () => parseHoursLabel('08:00 – 18:00', 3)
    const laid = clocksForTour(
      [lake, pottery],
      () => 1,
      hoursOf,
      9,
      19,
    )
    expect(laid.unscheduledIds).toEqual([])
    expect(laid.startHourById.lake).toBeLessThan(laid.startHourById.pottery)
  })

  it('skips a late-open park in the tour so a morning museum is not stranded', () => {
    const park = sight({
      id: 'park',
      sourceId: 'asia-park-danang',
      name: 'Asia Park',
    })
    const museum = sight({
      id: 'museum',
      sourceId: 'cham-sculpture-museum',
      name: 'Museum of Cham Sculpture',
    })
    const hoursOf = (item: ItineraryItem) => {
      if (item.sourceId === 'asia-park-danang') return parseHoursLabel('15:00 – 22:00', 3)
      return parseHoursLabel('07:00 – 17:00', 3)
    }
    const laid = clocksForTour([park, museum], () => 1.5, hoursOf, 9, 22)
    expect(laid.unscheduledIds).toEqual([])
    expect(laid.startHourById.museum).toBeLessThan(12)
    expect(laid.startHourById.park).toBeGreaterThanOrEqual(15)
  })

  it('does not pin Ngoc Son and the lake walk to the same 09:00', () => {
    const lake = sight({ id: 'lake', sourceId: 'hoan-kiem-lake', name: 'Hoan Kiem' })
    const temple = sight({ id: 'temple', sourceId: 'ngoc-son-temple', name: 'Ngoc Son' })
    const hoursOf = () => parseHoursLabel('08:00 – 18:00', 3)
    const laid = clocksForTour([temple, lake], () => 1, hoursOf, 9, 19)
    expect(laid.unscheduledIds).toEqual([])
    expect(laid.startHourById.lake).not.toBe(laid.startHourById.temple)
  })

  it('matches pack hop hours for a Hanoi pair', () => {
    expect(packHopHours('old-quarter', 'temple-literature')).toBeCloseTo(
      hopHoursBetween(PIN_BY_SOURCE_ID['old-quarter'], PIN_BY_SOURCE_ID['temple-literature']),
      8,
    )
  })
})
