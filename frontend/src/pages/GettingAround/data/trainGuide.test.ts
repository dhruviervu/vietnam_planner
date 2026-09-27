import { describe, expect, it } from 'vitest'
import {
  FARES,
  NORTHBOUND_ROWS,
  SOUTHBOUND_ROWS,
  SOUTHBOUND_TRAINS,
  STATIONS,
  TICKET_PROVIDERS,
  WHEN_TO_TRAVEL_INTRO,
  WHEN_TO_TRAVEL_SECTIONS,
  formatFare000,
} from './trainGuide'

describe('trainGuide', () => {
  it('covers when-to-travel in titled sections at 50+ words', () => {
    const text = [WHEN_TO_TRAVEL_INTRO, ...WHEN_TO_TRAVEL_SECTIONS.map((s) => s.body)].join(' ')
    expect(text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(50)
    expect(WHEN_TO_TRAVEL_SECTIONS.map((s) => s.title)).toEqual([
      'On iconic Coastal and mountain routes',
      'For overnight journeys covering 6–12 hours',
      'When travelling with heavy luggage or seeking more comfort than buses',
      'Why choose the train',
      'When not to take the train',
    ])
  })

  it('places SE3 at 19:20 from Hanoi southbound', () => {
    expect(SOUTHBOUND_TRAINS[0]).toBe('SE3')
    expect(SOUTHBOUND_ROWS[0].times[0]).toBe('19:20')
    expect(SOUTHBOUND_ROWS[SOUTHBOUND_ROWS.length - 1].station).toBe('Saigon')
  })

  it('places SE4 at 19:25 from Saigon northbound', () => {
    expect(NORTHBOUND_ROWS[0].times[0]).toBe('19:25')
    expect(NORTHBOUND_ROWS[NORTHBOUND_ROWS.length - 1].times[0]).toBe('04:55 d3')
  })

  it('formats Seat 61 thousand-dong fares', () => {
    expect(formatFare000(FARES[0].softSeat).dong).toBe('569,000 dong')
    expect(formatFare000(FARES[0].softSeat).usd).toMatch(/^\$/)
    expect(formatFare000(FARES[0].softSeat).cell).toContain('dong ($')
  })

  it('lists Seat 61 tickets plus station map links', () => {
    expect(TICKET_PROVIDERS.some((p) => p.id === 'seat61')).toBe(true)
    expect(STATIONS.every((s) => s.maps.includes('google.com/maps'))).toBe(true)
  })
})
