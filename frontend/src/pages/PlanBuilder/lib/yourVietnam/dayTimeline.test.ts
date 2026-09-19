import { describe, expect, it } from 'vitest'
import { parseHoursLabel, sightClosedAtTime } from './openingHours'
import { buildCompactTimeline, formatDurationLabel } from './dayTimeline'
import type { ItineraryItem } from './types'

function sight(partial: Partial<ItineraryItem> & { id: string; sourceId: string; name: string }): ItineraryItem {
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

describe('sightClosedAtTime', () => {
  it('flags a start after closing and a fully closed day', () => {
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    expect(sightClosedAtTime(hours, 10)).toBe(false)
    expect(sightClosedAtTime(hours, 17.5)).toBe(true)
    expect(sightClosedAtTime(parseHoursLabel('08:00 – 17:00 (closed Mon)', 1), 10)).toBe(true)
  })
})

describe('buildCompactTimeline closed slots', () => {
  it('leaves a sight unplaced instead of scheduling it after closing', () => {
    const item = sight({
      id: 'temple-row',
      sourceId: 'temple-literature',
      name: 'Temple of Literature',
    })
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [item],
      breaks: [],
      dayStart: '08:00',
      durationOverrides: { 'temple-literature': 1.5 },
      startOverrides: { 'temple-literature': '19:00' },
      legs: {},
      hoursOf: () => hours,
    })
    expect(blocks.some((b) => b.type === 'sight')).toBe(false)
    expect(unplaced.map((it) => it.sourceId)).toEqual(['temple-literature'])
  })

  it('does not warn when the sight is still open', () => {
    const item = sight({
      id: 'temple-row',
      sourceId: 'temple-literature',
      name: 'Temple of Literature',
    })
    const hours = parseHoursLabel('08:00 – 17:00', 3)
    const { blocks } = buildCompactTimeline({
      sights: [item],
      breaks: [],
      dayStart: '08:00',
      durationOverrides: { 'temple-literature': 1.5 },
      startOverrides: {},
      legs: {},
      hoursOf: () => hours,
    })
    const row = blocks.find((b) => b.type === 'sight')
    expect(row?.type).toBe('sight')
    if (row?.type !== 'sight') return
    expect(row.closedAtTime).toBe(false)
    expect(row.startHour).toBeLessThan(17)
  })

  it('omits a sight that is closed all day', () => {
    const item = sight({
      id: 'museum-row',
      sourceId: 'vn-museum',
      name: 'Vietnam Museum of Ethnology',
    })
    const hours = parseHoursLabel('08:00 – 17:00 (closed Mon)', 1)
    const { blocks } = buildCompactTimeline({
      sights: [item],
      breaks: [],
      dayStart: '08:00',
      durationOverrides: {},
      startOverrides: {},
      legs: {},
      hoursOf: () => hours,
    })
    expect(blocks.some((b) => b.type === 'sight')).toBe(false)
  })

  it('shifts a delayed first sight earlier so the last sight ends by the cap', () => {
    const first = sight({ id: 'a', sourceId: 'a', name: 'A' })
    const second = sight({ id: 'b', sourceId: 'b', name: 'B' })
    const { blocks, lastSightOverrun } = buildCompactTimeline({
      sights: [first, second],
      breaks: [],
      dayStart: '08:00',
      lastSightEndBy: '14:00',
      durationOverrides: { a: 2, b: 2 },
      startOverrides: { a: '11:00' },
      legs: {},
    })
    const last = blocks.findLast((b) => b.type === 'sight')
    expect(lastSightOverrun).toBe(false)
    expect(last?.type).toBe('sight')
    if (last?.type !== 'sight') return
    expect(last.endHour).toBeLessThanOrEqual(14.001)
    const firstBlock = blocks.find((b) => b.type === 'sight')
    expect(firstBlock?.type).toBe('sight')
    if (firstBlock?.type !== 'sight') return
    expect(firstBlock.startHour).toBeGreaterThanOrEqual(8)
    expect(firstBlock.startHour).toBeLessThan(11)
  })

  it('schedules morning sights before a late-open park even if the park is first in the bag', () => {
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
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [park, museum],
      breaks: [],
      dayStart: '08:00',
      durationOverrides: { 'asia-park-danang': 2, 'cham-sculpture-museum': 1 },
      startOverrides: {},
      legs: {},
      hoursOf,
    })
    const ordered = blocks.filter((b) => b.type === 'sight')
    expect(unplaced).toEqual([])
    expect(ordered.map((b) => (b.type === 'sight' ? b.item.sourceId : ''))).toEqual([
      'cham-sculpture-museum',
      'asia-park-danang',
    ])
    expect(ordered[0]?.type).toBe('sight')
    if (ordered[0]?.type !== 'sight' || ordered[1]?.type !== 'sight') return
    expect(ordered[0].startHour).toBeLessThan(12)
    expect(ordered[1].startHour).toBeGreaterThanOrEqual(15)
    expect(ordered[0].closedAtTime).toBe(false)
    expect(ordered[1].closedAtTime).toBe(false)
  })

  it('keeps the morning start when the cap cannot fit the day', () => {
    const first = sight({ id: 'a', sourceId: 'a', name: 'A' })
    const second = sight({ id: 'b', sourceId: 'b', name: 'B' })
    const { blocks, lastSightOverrun } = buildCompactTimeline({
      sights: [first, second],
      breaks: [],
      dayStart: '08:00',
      lastSightEndBy: '10:00',
      durationOverrides: { a: 3, b: 3 },
      startOverrides: {},
      legs: {},
    })
    const firstBlock = blocks.find((b) => b.type === 'sight')
    expect(firstBlock?.type).toBe('sight')
    if (firstBlock?.type !== 'sight') return
    expect(firstBlock.startHour).toBe(8)
    expect(lastSightOverrun).toBe(true)
  })
})

describe('included companions', () => {
  it('overlays trek villages on the outing instead of chaining them after close', () => {
    const trek = sight({
      id: 'trek-row',
      sourceId: 'sapa-trek',
      name: 'Sapa Rice Terrace Trek',
    })
    const village = sight({
      id: 'ta-van-row',
      sourceId: 'ta-van-village',
      name: 'Tả Van Village',
    })
    const hours = parseHoursLabel('08:00 – 18:00', 3)
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [trek, village],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: { 'sapa-trek': 7, 'ta-van-village': 20 / 60 },
      startOverrides: {},
      legs: {},
      hoursOf: () => hours,
    })
    expect(unplaced).toEqual([])
    expect(blocks.some((b) => b.type === 'transit')).toBe(false)
    const villageBlock = blocks.find((b) => b.type === 'sight' && b.item.sourceId === 'ta-van-village')
    expect(villageBlock?.type).toBe('sight')
    if (villageBlock?.type !== 'sight') return
    expect(villageBlock.startHour).toBeGreaterThanOrEqual(12)
    expect(villageBlock.endHour).toBeLessThanOrEqual(16)
  })

  it('gives walk-complex stops distinct start times instead of stacking them at 09:00', () => {
    const mausoleum = sight({
      id: 'mau',
      sourceId: 'ho-chi-minh-mausoleum',
      name: 'Mausoleum',
    })
    const stilt = sight({
      id: 'stilt',
      sourceId: 'hcm-stilt-house',
      name: 'Stilt House',
    })
    const pillar = sight({
      id: 'pillar',
      sourceId: 'one-pillar-pagoda',
      name: 'One Pillar',
    })
    const hours = parseHoursLabel('07:00 – 17:00', 3)
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [mausoleum, stilt, pillar],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: {
        'ho-chi-minh-mausoleum': 1,
        'hcm-stilt-house': 1.5,
        'one-pillar-pagoda': 20 / 60,
      },
      startOverrides: {},
      legs: {},
      hoursOf: () => hours,
    })
    expect(unplaced).toEqual([])
    const starts = blocks
      .filter((b) => b.type === 'sight')
      .map((b) => (b.type === 'sight' ? Math.round(b.startHour * 60) : 0))
    expect(new Set(starts).size).toBe(starts.length)
    const byId = Object.fromEntries(
      blocks
        .filter((b) => b.type === 'sight')
        .map((b) => (b.type === 'sight' ? [b.item.sourceId, b.startHour] : ['', 0])),
    )
    expect(byId['ho-chi-minh-mausoleum']).toBeLessThan(byId['hcm-stilt-house'])
    expect(byId['hcm-stilt-house']).toBeLessThan(byId['one-pillar-pagoda'])
  })

  it('places folk dance on the same day as a morning lantern class instead of leaving it unplaced', () => {
    const lantern = sight({
      id: 'lantern-row',
      sourceId: 'ha-lantern-make',
      name: 'Foldable lantern making class',
      kind: 'activity',
      city: 'Hoi An',
      region: 'Hoi An',
    })
    const dance = sight({
      id: 'dance-row',
      sourceId: 'ha-folk-dance',
      name: 'Intro to Vietnamese folk dance',
      kind: 'activity',
      city: 'Hoi An',
      region: 'Hoi An',
    })
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [lantern, dance],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: { 'ha-lantern-make': 1.5, 'ha-folk-dance': 1 },
      startOverrides: { 'ha-lantern-make': '09:00' },
      legs: {},
      hoursOf: (item) =>
        parseHoursLabel(item.sourceId === 'ha-folk-dance' ? '08:00 – 18:00' : '09:00 – 21:00', 3),
    })
    expect(unplaced.map((it) => it.sourceId)).toEqual([])
    const named = blocks
      .filter((b) => b.type === 'sight')
      .map((b) => (b.type === 'sight' ? b.item.sourceId : ''))
    expect(named).toEqual(expect.arrayContaining(['ha-lantern-make', 'ha-folk-dance']))
    const danceBlock = blocks.find((b) => b.type === 'sight' && b.item.sourceId === 'ha-folk-dance')
    expect(danceBlock?.type).toBe('sight')
    if (danceBlock?.type !== 'sight') return
    expect(danceBlock.endHour).toBeLessThanOrEqual(18.05)
    expect(danceBlock.startHour).toBeGreaterThanOrEqual(10.4)
  })

  it('pulls later sights earlier after a morning stop is dropped', () => {
    const lantern = sight({
      id: 'lantern-row',
      sourceId: 'ha-lantern-make',
      name: 'Foldable lantern making class',
      kind: 'activity',
      city: 'Hoi An',
      region: 'Hoi An',
    })
    const dance = sight({
      id: 'dance-row',
      sourceId: 'ha-folk-dance',
      name: 'Intro to Vietnamese folk dance',
      kind: 'activity',
      city: 'Hoi An',
      region: 'Hoi An',
    })
    const hoursOf = (item: ItineraryItem) =>
      parseHoursLabel(item.sourceId === 'ha-folk-dance' ? '08:00 – 18:00' : '09:00 – 21:00', 3)
    const before = buildCompactTimeline({
      sights: [lantern, dance],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: { 'ha-lantern-make': 1.5, 'ha-folk-dance': 1 },
      startOverrides: { 'ha-lantern-make': '09:00', 'ha-folk-dance': '11:00' },
      legs: {},
      hoursOf,
    })
    const danceBefore = before.blocks.find(
      (b) => b.type === 'sight' && b.item.sourceId === 'ha-folk-dance',
    )
    const after = buildCompactTimeline({
      sights: [dance],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: { 'ha-folk-dance': 1 },
      startOverrides: {},
      legs: {},
      hoursOf,
    })
    const danceAfter = after.blocks.find(
      (b) => b.type === 'sight' && b.item.sourceId === 'ha-folk-dance',
    )
    expect(danceBefore?.type).toBe('sight')
    expect(danceAfter?.type).toBe('sight')
    if (danceBefore?.type !== 'sight' || danceAfter?.type !== 'sight') return
    expect(danceAfter.startHour).toBeLessThan(danceBefore.startHour)
    expect(danceAfter.startHour).toBeCloseTo(9, 1)
  })

  it('puts a leftover museum into the lunch gap instead of leaving it untimed', () => {
    const mausoleum = sight({
      id: 'mau',
      sourceId: 'ho-chi-minh-mausoleum',
      name: 'Ho Chi Minh Mausoleum Complex',
    })
    const stilt = sight({
      id: 'stilt',
      sourceId: 'hcm-stilt-house',
      name: 'Stilt House & Presidential Gardens',
    })
    const lake = sight({
      id: 'lake',
      sourceId: 'hoan-kiem-lake',
      name: 'Hoan Kiem Lake Walk',
    })
    const museum = sight({
      id: 'women',
      sourceId: 'vietnamese-womens-museum',
      name: 'Vietnamese Women’s Museum',
    })
    const hoursOf = (item: ItineraryItem) => {
      if (item.sourceId === 'ho-chi-minh-mausoleum') return parseHoursLabel('07:30 – 10:30', 3)
      if (item.sourceId === 'hcm-stilt-house') return parseHoursLabel('07:30 – 11:00, 13:30 – 16:00', 3)
      if (item.sourceId === 'hoan-kiem-lake') return parseHoursLabel('Anytime', 3)
      return parseHoursLabel('08:00 – 17:00', 3)
    }
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [mausoleum, stilt, lake, museum],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: {
        'ho-chi-minh-mausoleum': 1.5,
        'hcm-stilt-house': 1.5,
        'hoan-kiem-lake': 1.5,
        'vietnamese-womens-museum': 1,
      },
      startOverrides: { 'hcm-stilt-house': '13:30', 'hoan-kiem-lake': '16:05' },
      legs: {},
      hoursOf,
    })
    expect(unplaced.map((it) => it.sourceId)).toEqual([])
    const byId = Object.fromEntries(
      blocks
        .filter((b) => b.type === 'sight')
        .map((b) => (b.type === 'sight' ? [b.item.sourceId, b] : ['', b])),
    )
    const museumBlock = byId['vietnamese-womens-museum']
    expect(museumBlock?.type).toBe('sight')
    if (museumBlock?.type !== 'sight') return
    expect(museumBlock.startHour).toBeGreaterThanOrEqual(10.4)
    expect(museumBlock.endHour).toBeLessThanOrEqual(13.3)
    expect(museumBlock.startHour).toBeLessThan(13)
  })

  it('fills the lunch gap from opening hours even without pinned start times', () => {
    const mausoleum = sight({
      id: 'mau',
      sourceId: 'ho-chi-minh-mausoleum',
      name: 'Ho Chi Minh Mausoleum Complex',
    })
    const stilt = sight({
      id: 'stilt',
      sourceId: 'hcm-stilt-house',
      name: 'Stilt House & Presidential Gardens',
    })
    const pagoda = sight({
      id: 'pagoda',
      sourceId: 'one-pillar-pagoda',
      name: 'One Pillar Pagoda',
    })
    const museum = sight({
      id: 'women',
      sourceId: 'vietnamese-womens-museum',
      name: 'Vietnamese Women’s Museum',
    })
    const hoursOf = (item: ItineraryItem) => {
      if (item.sourceId === 'ho-chi-minh-mausoleum') return parseHoursLabel('07:30 – 10:30', 3)
      if (item.sourceId === 'hcm-stilt-house') return parseHoursLabel('07:30 – 11:00, 13:30 – 16:00', 3)
      if (item.sourceId === 'one-pillar-pagoda') return parseHoursLabel('07:00 – 18:00', 3)
      return parseHoursLabel('08:00 – 17:00', 3)
    }
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [mausoleum, stilt, pagoda, museum],
      breaks: [],
      dayStart: '09:00',
      durationOverrides: {
        'ho-chi-minh-mausoleum': 1.5,
        'hcm-stilt-house': 1.5,
        'one-pillar-pagoda': 20 / 60,
        'vietnamese-womens-museum': 1,
      },
      startOverrides: {},
      legs: {},
      hoursOf,
    })
    expect(unplaced.map((it) => it.sourceId)).toEqual([])
    const byId = Object.fromEntries(
      blocks
        .filter((b) => b.type === 'sight')
        .map((b) => (b.type === 'sight' ? [b.item.sourceId, b] : ['', b])),
    )
    const museumBlock = byId['vietnamese-womens-museum']
    expect(museumBlock?.type).toBe('sight')
    if (museumBlock?.type !== 'sight') return
    expect(museumBlock.startHour).toBeGreaterThanOrEqual(10.4)
    expect(museumBlock.startHour).toBeLessThan(13.3)
    expect(byId['hcm-stilt-house']?.type).toBe('sight')
    if (byId['hcm-stilt-house']?.type !== 'sight') return
    expect(byId['hcm-stilt-house'].startHour).toBeGreaterThanOrEqual(13.3)
  })
})

describe('formatDurationLabel', () => {
  it('never shows leftover scraps like 18 minutes', () => {
    expect(formatDurationLabel(18 / 60)).toBe('20 min')
    expect(formatDurationLabel(0.3)).toBe('20 min')
    expect(formatDurationLabel(0.5)).toBe('30 min')
    expect(formatDurationLabel(2)).toBe('2h')
  })
})

describe('Hue Perfume River landings', () => {
  it('clocks Thiên Mụ on the afternoon boat, not at 10:40', () => {
    const citadel = sight({
      id: 'citadel',
      sourceId: 'hue-citadel',
      name: 'Imperial City',
      city: 'Hue',
      region: 'Hue',
    })
    const pagoda = sight({
      id: 'pagoda',
      sourceId: 'thien-mu-pagoda',
      name: 'Thiên Mụ Pagoda',
      city: 'Hue',
      region: 'Hue',
    })
    const river = sight({
      id: 'river',
      sourceId: 'perfume-river',
      name: 'Perfume River',
      city: 'Hue',
      region: 'Hue',
    })
    const hoursOf = (item: ItineraryItem) => {
      if (item.sourceId === 'hue-citadel') return parseHoursLabel('08:00 – 17:30', 3)
      if (item.sourceId === 'thien-mu-pagoda') return parseHoursLabel('07:00 – 17:00', 3)
      return parseHoursLabel('15:00 – 19:00', 3)
    }
    const { blocks, unplaced } = buildCompactTimeline({
      sights: [citadel, pagoda, river],
      breaks: [],
      dayStart: '10:00',
      durationOverrides: { 'hue-citadel': 3, 'perfume-river': 2, 'thien-mu-pagoda': 20 / 60 },
      startOverrides: { 'hue-citadel': '10:00', 'perfume-river': '15:30' },
      legs: {},
      hoursOf,
    })
    expect(unplaced.map((it) => it.sourceId)).toEqual([])
    const byId = Object.fromEntries(
      blocks
        .filter((b) => b.type === 'sight')
        .map((b) => (b.type === 'sight' ? [b.item.sourceId, b] : ['', b])),
    )
    const riverBlock = byId['perfume-river']
    const pagodaBlock = byId['thien-mu-pagoda']
    expect(riverBlock?.type).toBe('sight')
    expect(pagodaBlock?.type).toBe('sight')
    if (riverBlock?.type !== 'sight' || pagodaBlock?.type !== 'sight') return
    expect(riverBlock.startHour).toBeGreaterThanOrEqual(15)
    expect(pagodaBlock.startHour).toBeGreaterThanOrEqual(riverBlock.startHour)
    expect(pagodaBlock.startHour).toBeLessThan(riverBlock.startHour + 0.5)
    expect(pagodaBlock.startHour).toBeGreaterThan(12)
  })
})
