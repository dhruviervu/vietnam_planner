import { describe, expect, it } from 'vitest'
import {
  catalogHoursForSource,
  hoursLabelForSource,
  compactWeekdayDescriptions,
  earliestOpenAt,
  exceptionNoteClosedOnDate,
  parseGoogleWeekdayDescriptions,
  parseHoursLabel,
  usesLiveVenueHours,
  visitDeadline,
} from './openingHours'
import { canonicalSightId } from './sightIntelligence'
import { groupIdForSourceId } from './sightTiming'
import { isSightCatalogItem } from '../../data/experiences'

describe('opening hours for sights and activities', () => {
  it('keeps the Hanoi night food tour in the evening, not a daytime cooking school', () => {
    const hours = catalogHoursForSource('experience', 'hanoi-food-tour', 3)
    expect(hours.unknown).toBe(false)
    expect(hours.intervals?.[0]?.open).toBeGreaterThanOrEqual(17)
    expect(usesLiveVenueHours('experience', 'hanoi-food-tour', 'Hanoi night street-food tour')).toBe(
      false,
    )
  })

  it('keeps the Hanoi home cooking class as a morning kitchen, not the Hoi An class', () => {
    expect(canonicalSightId('hn-cooking-home')).toBe('hn-cooking-home')
    expect(groupIdForSourceId('hn-cooking-home')).not.toBe(groupIdForSourceId('cooking-class'))
    expect(groupIdForSourceId('hn-cooking-home')).not.toBe(groupIdForSourceId('hanoi-food-tour'))
    const hours = catalogHoursForSource('activity', 'hn-cooking-home', 3)
    expect(hours.intervals?.some((iv) => iv.open < 12 && iv.close <= 13)).toBe(true)
    expect(usesLiveVenueHours('activity', 'hn-cooking-home', 'Home kitchen cooking class')).toBe(
      false,
    )
  })

  it('hides operator tours from the Sights catalog so Things to Do owns them', () => {
    expect(isSightCatalogItem({ id: 'hanoi-food-tour' })).toBe(false)
    expect(isSightCatalogItem({ id: 'cooking-class' })).toBe(false)
    expect(isSightCatalogItem({ id: 'temple-literature' })).toBe(true)
  })

  it('parses booked session labels into clock windows', () => {
    const evening = parseHoursLabel('Evening departures ~17:00–21:00', 3)
    expect(evening.intervals?.[0]?.open).toBe(17)
    const words = parseHoursLabel('Morning and afternoon departures', 3)
    expect(words.intervals).toEqual([{ open: 8, close: 18 }])
    const sky = parseHoursLabel('Typically late afternoon – late night', 3)
    expect(sky.intervals?.[0]?.open).toBe(16)
    expect(sky.intervals?.[0]?.close).toBe(23)
  })

  it('reads split Google ranges like 7:30-11 am 1:30-5 pm as morning plus afternoon', () => {
    const hours = parseHoursLabel('Wednesday: 7:30-11 am 1:30-5 pm', 3)
    expect(hours.intervals).toEqual([
      { open: 7.5, close: 11 },
      { open: 13.5, close: 17 },
    ])
    expect(Number.isFinite(earliestOpenAt(hours, 12, 0.5, 17))).toBe(true)
    expect(earliestOpenAt(hours, 12, 0.5, 17)).toBe(13.5)
  })

  it('parses Google weekday descriptions including closed days', () => {
    const lines = [
      'Sunday: Closed',
      'Monday: 8:00 AM – 5:00 PM',
      'Tuesday: 8:00 AM – 5:00 PM',
      'Wednesday: 8:00 AM – 5:00 PM',
      'Thursday: 8:00 AM – 5:00 PM',
      'Friday: 8:00 AM – 5:00 PM',
      'Saturday: 8:00 AM – 5:00 PM',
    ]
    expect(parseGoogleWeekdayDescriptions(lines, 0).closedToday).toBe(true)
    expect(parseGoogleWeekdayDescriptions(lines, 1).intervals?.[0]?.open).toBe(8)
    expect(parseGoogleWeekdayDescriptions(lines, 1).intervals?.[0]?.close).toBe(17)
    expect(compactWeekdayDescriptions(lines)).toMatch(/08:00–17:00/)
    expect(compactWeekdayDescriptions(lines)).toMatch(/Closed Sun/)
  })

  it('drops truncated Google fragments like “Sunday: a” instead of showing Sun a', () => {
    const lines = [
      'Sunday: a',
      'Monday: 7:00 AM – 5:00 PM',
      'Tuesday: 7:00 AM – 5:00 PM',
      'Wednesday: 7:00 AM – 5:00 PM',
      'Thursday: 7:00 AM – 5:00 PM',
      'Friday: 7:00 AM – 5:00 PM',
      'Saturday: 7:00 AM – 5:00 PM',
    ]
    expect(compactWeekdayDescriptions(lines)).not.toMatch(/\bSun a\b/)
    expect(compactWeekdayDescriptions(lines)).toMatch(/07:00–17:00/)
    expect(hoursLabelForSource('experience', 'sung-sot-cave', 'With cruise schedule')).not.toMatch(
      /\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [a-z]\b/,
    )
  })

  it('detects first-Monday monthly closures', () => {
    const notes = ['Closed first Monday of each month']
    expect(exceptionNoteClosedOnDate(notes, '2026-09-07')).toBeTruthy()
    expect(exceptionNoteClosedOnDate(notes, '2026-09-14')).toBeNull()
  })

  it('does not treat egg-coffee cafés and the egg-coffee lab as one place', () => {
    expect(groupIdForSourceId('egg-coffee')).not.toBe(groupIdForSourceId('hn-egg-coffee-lab'))
    expect(canonicalSightId('hn-egg-coffee-lab')).toBe('hn-egg-coffee-lab')
  })
})

describe('sliding opening-hour windows', () => {
  it('lets a visit start after opening as long as the full duration still fits', () => {
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    expect(earliestOpenAt(hours, 10, 2)).toBe(10)
    expect(visitDeadline(hours, 18)).toBe(17)
  })

  it('refuses a start when duration strictly exceeds remaining time before close', () => {
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    expect(Number.isFinite(earliestOpenAt(hours, 15.5, 2, 17))).toBe(false)
    expect(earliestOpenAt(hours, 15, 2, 17)).toBe(15)
  })

  it('does not rewind to opening time after the place has already closed', () => {
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    expect(Number.isFinite(earliestOpenAt(hours, 17.5, 1.5, 18))).toBe(false)
  })
})
