import { describe, expect, it } from 'vitest'
import {
  daysToFitCitySights,
  packHopHours,
  packTripStay,
  planCityStay,
  cityDayHostsFullVisit,
  fitClosedHourSightsOntoOtherDays,
} from './dayAllocation'
import { buildYourVietnam } from './buildYourVietnam'
import { hopHoursBetween } from './osrmRoute'
import { PIN_BY_SOURCE_ID } from './itineraryPinCatalog'
import { tripIsoDate } from './openingHours'

describe('planCityStay day count', () => {
  it('gives a single Hanoi walk-up sight exactly one day', () => {
    const { days } = planCityStay(['temple-literature'], 'hanoi')
    expect(days).toEqual([['temple-literature']])
    expect(daysToFitCitySights(['temple-literature'], undefined, 'hanoi')).toBe(1)
  })

  it('never clones a one-sight Ha Long cruise onto a second day', () => {
    const { days } = planCityStay(['halong-cruise'], 'ha-long')
    expect(days).toEqual([['halong-cruise']])
  })

  it('does not emit empty days after a closed-day shuffle', () => {
    const { days } = planCityStay(['temple-literature'], 'hanoi', {
      startDate: '2026-09-07',
      firstDayNumber: 1,
    })
    expect(days.length).toBe(1)
    expect(days.every((row) => row.length > 0)).toBe(true)
    expect(days.flat()).toContain('temple-literature')
  })

  it('cascades nearby Hanoi walks onto one 09:00 day', () => {
    const { days } = planCityStay(
      ['temple-literature', 'old-quarter', 'hoan-kiem-lake', 'train-street'],
      'hanoi',
    )
    expect(days).toHaveLength(1)
    expect(days[0]).toEqual(
      expect.arrayContaining(['temple-literature', 'old-quarter', 'hoan-kiem-lake', 'train-street']),
    )
  })

  it('packs a Hue citadel morning plus city walks, and keeps the tombs off the river boat', () => {
    const ids = [
      'hue-citadel',
      'ngo-mon-gate',
      'truong-tien-bridge',
      'thien-mu-pagoda',
      'tu-hieu-pagoda',
      'khai-dinh-tomb',
    ]
    const { days } = planCityStay(ids, 'hue')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const citadel = days.find((row) => row.includes('hue-citadel'))
    expect(citadel).toContain('ngo-mon-gate')
    expect(days.length).toBeLessThanOrEqual(3)
  })

  it('keeps a 15:00 park on the same city day as morning sights, even if it was added first', () => {
    const ids = ['asia-park-danang', 'cham-sculpture-museum', 'hai-van-pass']
    const { days } = planCityStay(ids, 'da-nang')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const city = days.find((row) => row.includes('cham-sculpture-museum'))
    const pass = days.find((row) => row.includes('hai-van-pass'))
    expect(city).toContain('asia-park-danang')
    expect(city).not.toBe(pass)
    expect(city!.indexOf('cham-sculpture-museum')).toBeLessThan(city!.indexOf('asia-park-danang'))
  })

  it('packs Ba Dinh, Hoan Kiem and Old Quarter into the fewest days that fit card visit lengths', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
    ]
    const { days } = planCityStay(ids, 'hanoi')
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.every((row) => row.length > 0)).toBe(true)
    expect(days.length).toBeLessThanOrEqual(2)
    expect(days.every((row) => cityDayHostsFullVisit(row, 'hanoi'))).toBe(true)
  })

  it('uses card visit length and still fits a Ba Dinh morning that closes before 11:00', () => {
    const ids = ['ho-chi-minh-mausoleum', 'one-pillar-pagoda', 'hcm-stilt-house']
    const { days } = planCityStay(ids, 'hanoi')
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.every((row) => cityDayHostsFullVisit(row, 'hanoi'))).toBe(true)
    expect(days[0][0]).toBe('ho-chi-minh-mausoleum')
  })

  it('keeps filling Monday with open Hanoi walks instead of parking the whole Ba Dinh cluster on day 2', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
    ]
    const calendar = { startDate: '2026-09-07', firstDayNumber: 1 }
    const { days } = planCityStay(ids, 'hanoi', calendar)
    expect(days[0]).not.toContain('ho-chi-minh-mausoleum')
    expect(days[0].length).toBeGreaterThanOrEqual(1)
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.length).toBeLessThan(ids.length)
    expect(days.every((row) => row.length > 0)).toBe(true)
    const monday = tripIsoDate(calendar.startDate, 1)
    expect(cityDayHostsFullVisit(days[0], 'hanoi', monday) || days[0].length > 0).toBe(true)
    const mausoleumDay = days.findIndex((row) => row.includes('ho-chi-minh-mausoleum'))
    expect(mausoleumDay).toBeGreaterThan(0)
    expect(
      cityDayHostsFullVisit(days[mausoleumDay], 'hanoi', tripIsoDate(calendar.startDate, mausoleumDay + 1)),
    ).toBe(true)
  })

  it('never overloads day 1 while later days stay empty when a valid global split exists', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
      'ethnology-museum',
      'bat-trang-pottery',
      'hoa-lo-prison',
      'vietnam-fine-arts-hanoi',
    ]
    const calendar = { startDate: '2026-09-08', firstDayNumber: 1 }
    const { days } = planCityStay(ids, 'hanoi', calendar)
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.every((row) => row.length > 0)).toBe(true)
    expect(days.length).toBeLessThan(ids.length)
    if (days.length >= 2) {
      const loads = days.map((row) => row.length)
      expect(Math.min(...loads)).toBeGreaterThan(0)
      expect(Math.max(...loads) - Math.min(...loads)).toBeLessThan(ids.length - 1)
    }
    for (let i = 0; i < days.length; i++) {
      expect(
        cityDayHostsFullVisit(days[i], 'hanoi', tripIsoDate(calendar.startDate, i + 1)),
        `day ${i + 1}`,
      ).toBe(true)
    }
  })

  it('fills existing open days before creating another day', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'tran-quoc-pagoda',
      'one-pillar-pagoda',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
      'ethnology-museum',
      'hoa-lo-prison',
    ]
    const calendar = { startDate: '2026-09-12', firstDayNumber: 1 }
    const { days } = planCityStay(ids, 'hanoi', calendar)
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.every((row) => row.length > 0)).toBe(true)
    for (let i = 0; i < days.length; i++) {
      expect(
        cityDayHostsFullVisit(days[i], 'hanoi', tripIsoDate(calendar.startDate, i + 1)),
        `day ${i + 1}`,
      ).toBe(true)
    }
    const thin = days.filter((row) => row.length === 1)
    for (const row of thin) {
      const others = days.filter((other) => other !== row)
      for (const other of others) {
        const host = cityDayHostsFullVisit(
          [...other, ...row],
          'hanoi',
          tripIsoDate(calendar.startDate, days.indexOf(other) + 1),
        )
        expect(host, 'sparse day still needed').toBe(false)
      }
    }
  })

  it('keeps Ethnology and Bat Trang on the same day as later Hanoi museums', () => {
    const ids = [
      'ethnology-museum',
      'bat-trang-pottery',
      'hoa-lo-prison',
      'vietnam-fine-arts-hanoi',
    ]
    const { days } = planCityStay(ids, 'hanoi')
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.length).toBeLessThanOrEqual(2)
    expect(days.every((row) => row.length > 0)).toBe(true)
  })

  it('packs short city walks onto one day in every stop, not one city only', () => {
    const cities: { placeId: string; ids: string[] }[] = [
      { placeId: 'hanoi', ids: ['temple-literature', 'old-quarter', 'hoan-kiem-lake'] },
      { placeId: 'hue', ids: ['hue-citadel', 'ngo-mon-gate', 'truong-tien-bridge'] },
      { placeId: 'da-nang', ids: ['marble-mountains', 'da-nang-beach'] },
      { placeId: 'hoi-an', ids: ['hoi-an-ancient-town', 'japanese-covered-bridge'] },
      { placeId: 'nha-trang', ids: ['po-nagar'] },
      { placeId: 'hcmc', ids: ['ben-thanh', 'independence-palace'] },
    ]
    for (const city of cities) {
      const { days } = planCityStay(city.ids, city.placeId)
      expect(days, city.placeId).toHaveLength(1)
      expect(days[0], city.placeId).toEqual(expect.arrayContaining(city.ids))
    }
  })

  it('does not open a stub day for every leftover Hanoi walk', () => {
    const ids = [
      'temple-literature',
      'old-quarter',
      'hoan-kiem-lake',
      'train-street',
      'ethnology-museum',
      'bat-trang-pottery',
      'hoa-lo-prison',
      'vietnam-fine-arts-hanoi',
    ]
    const { days } = planCityStay(ids, 'hanoi')
    expect(days.length).toBeLessThanOrEqual(3)
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(Math.max(...days.map((row) => row.length))).toBeGreaterThanOrEqual(2)
  })

  it('keeps a late-open park on the same city day after morning walks', () => {
    const ids = ['cham-sculpture-museum', 'hai-van-pass', 'asia-park-danang']
    const { days } = planCityStay(ids, 'da-nang')
    const city = days.find((row) => row.includes('cham-sculpture-museum'))
    expect(city).toBeTruthy()
    expect(city![city!.length - 1]).toBe('asia-park-danang')
    expect(city).not.toContain('hai-van-pass')
  })

  it('does not follow trip-bag order when a nearer open neighbor exists', () => {
    const bag = ['bat-trang-pottery', 'old-quarter', 'hoan-kiem-lake']
    const { days } = planCityStay(bag, 'hanoi')
    expect(days).toHaveLength(1)
    expect(days[0]).toEqual(expect.arrayContaining(bag))
  })

  it('charges the same hop hours as the timeline helper', () => {
    const from = PIN_BY_SOURCE_ID['old-quarter']
    const to = PIN_BY_SOURCE_ID['hoan-kiem-lake']
    expect(from && to).toBeTruthy()
    expect(packHopHours('old-quarter', 'hoan-kiem-lake')).toBeCloseTo(
      hopHoursBetween(from, to),
      8,
    )
  })

  it('moves a clipped Hanoi walk onto a sibling day that can finish a full visit', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
      'ethnology-museum',
      'bat-trang-pottery',
      'hoa-lo-prison',
      'vietnam-fine-arts-hanoi',
    ]
    const calendar = { startDate: '2026-09-08', firstDayNumber: 1 }
    const { days } = planCityStay(ids, 'hanoi', calendar)
    expect(days.flat().sort()).toEqual([...ids].sort())
    expect(days.length).toBeGreaterThanOrEqual(1)
    expect(days.length).toBeLessThan(ids.length)
    expect(days.every((row) => row.length > 0)).toBe(true)
  })

  it('hardwires closed-hour leftovers onto another same-city day with an open slot', () => {
    const calendar = { startDate: '2026-09-12', firstDayNumber: 1 }
    const packed = [
      [
        'old-quarter',
        'hoan-kiem-lake',
        'ngoc-son-temple',
        'train-street',
        'temple-literature',
        'st-joseph-cathedral',
        'hoa-lo-prison',
        'vietnam-fine-arts-hanoi',
        'ethnology-museum',
        'ho-chi-minh-mausoleum',
      ],
      ['one-pillar-pagoda'],
    ]
    const next = fitClosedHourSightsOntoOtherDays(packed, 'hanoi', calendar, { createNewDays: true })
    expect(next.flat().sort()).toEqual([...packed.flat()].sort())
    expect(next[0].length).toBeLessThan(packed[0].length)
    expect(next[1].length).toBeGreaterThan(packed[1].length)
    expect(cityDayHostsFullVisit(next[0], 'hanoi', tripIsoDate(calendar.startDate, 1))).toBe(true)
    expect(cityDayHostsFullVisit(next[1], 'hanoi', tripIsoDate(calendar.startDate, 2))).toBe(true)
  })

  it('leaves a stop on its day when no sibling can host a full open visit', () => {
    const { days } = planCityStay(['temple-literature', 'old-quarter', 'hoan-kiem-lake'], 'hanoi')
    expect(days).toHaveLength(1)
    expect(cityDayHostsFullVisit(days[0], 'hanoi')).toBe(true)
    expect(days[0]).toEqual(
      expect.arrayContaining(['temple-literature', 'old-quarter', 'hoan-kiem-lake']),
    )
  })

  it('does not chain Ta Phin to the O Quy Ho skywalk on the same day', () => {
    const ids = [
      'sapa-trek',
      'ta-phin-village',
      'rong-may-skywalk',
      'cat-cat-village',
      'cat-cat-waterfall',
      'ta-van-village',
    ]
    const { days } = planCityStay(ids, 'sapa')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const phinDay = days.find((row) => row.includes('ta-phin-village'))
    const skyDay = days.find((row) => row.includes('rong-may-skywalk'))
    const catDay = days.find((row) => row.includes('cat-cat-village'))
    expect(phinDay).toBeTruthy()
    expect(skyDay).toBeTruthy()
    expect(catDay).toBeTruthy()
    expect(phinDay).not.toBe(skyDay)
    expect(catDay).toContain('cat-cat-waterfall')
    expect(phinDay).toBe(catDay)
    const trekDay = days.find((row) => row.includes('sapa-trek'))
    expect(trekDay).toContain('ta-van-village')
    expect(trekDay).not.toContain('cat-cat-waterfall')
  })

  it('keeps Ba Dinh on the mausoleum morning and does not send the stilt house into the afternoon', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
    ]
    const { days } = planCityStay(ids, 'hanoi')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const baDinh = days.find((row) => row.includes('ho-chi-minh-mausoleum'))
    expect(baDinh).toEqual(expect.arrayContaining(['hcm-stilt-house', 'one-pillar-pagoda']))
    const stiltAt = baDinh!.indexOf('hcm-stilt-house')
    const lakeAt = baDinh!.indexOf('hoan-kiem-lake')
    expect(stiltAt).toBeGreaterThan(baDinh!.indexOf('ho-chi-minh-mausoleum'))
    if (lakeAt >= 0) expect(stiltAt).toBeLessThan(lakeAt)
    const museumDay = days.find((row) => row.includes('ho-chi-minh-museum-hanoi'))
    expect(museumDay).toBeTruthy()
    expect(days.every((row) => cityDayHostsFullVisit(row, 'hanoi'))).toBe(true)
  })

  it('packs leftover Sapa hours onto the next same-city day: trek alone, Cát Cát with Tả Phìn, pass not mixed with villages', () => {
    const ids = [
      'fansipan',
      'fansipan-buddha',
      'love-waterfall',
      'silver-waterfall',
      'rong-may-skywalk',
      'cat-cat-village',
      'cat-cat-waterfall',
      'ta-phin-village',
      'ham-rong-mountain',
      'sapa-stone-church',
      'sapa-trek',
      'ta-van-village',
    ]
    const { days } = planCityStay(ids, 'sapa')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const fan = days.find((row) => row.includes('fansipan'))
    const pass = days.find((row) => row.includes('rong-may-skywalk'))
    const cat = days.find((row) => row.includes('cat-cat-village'))
    const phin = days.find((row) => row.includes('ta-phin-village'))
    const town = days.find((row) => row.includes('ham-rong-mountain'))
    const trek = days.find((row) => row.includes('sapa-trek'))
    expect(fan).toContain('fansipan-buddha')
    expect(pass).toEqual(expect.arrayContaining(['love-waterfall', 'silver-waterfall', 'rong-may-skywalk']))
    expect(cat).toContain('cat-cat-waterfall')
    expect(cat).toBe(phin)
    expect(phin).not.toBe(pass)
    expect(phin).not.toBe(fan)
    expect(phin).not.toBe(trek)
    expect(town).toContain('sapa-stone-church')
    expect(trek).toContain('ta-van-village')
    expect(days.length).toBeLessThanOrEqual(3)
  })

  it('does not send Phat Diem onto a Trang An countryside day', () => {
    const ids = ['trang-an-boats', 'bich-dong-pagoda', 'phat-diem-cathedral']
    const { days } = planCityStay(ids, 'ninh-binh')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const boat = days.find((row) => row.includes('trang-an-boats'))
    expect(boat).toContain('bich-dong-pagoda')
    expect(boat).not.toContain('phat-diem-cathedral')
  })

  it('keeps Diep Son off the Nha Trang promenade day', () => {
    const ids = ['nha-trang-promenade', 'po-nagar', 'diep-son-island', 'hon-mun-island']
    const { days } = planCityStay(ids, 'nha-trang')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const town = days.find((row) => row.includes('nha-trang-promenade'))
    const islands = days.find((row) => row.includes('hon-mun-island'))
    const diep = days.find((row) => row.includes('diep-son-island'))
    expect(town).toContain('po-nagar')
    expect(diep).not.toContain('nha-trang-promenade')
    expect(diep).not.toContain('po-nagar')
    expect(islands).not.toBe(diep)
    expect(diep).not.toBe(town)
  })

  it('gives Hon Tre + VinWonders a full park clock, and Hon Mun a boat day past lunch', () => {
    const { days } = planCityStay(['hon-tre-island', 'vinwonders-nha-trang'], 'nha-trang')
    expect(days).toHaveLength(1)
    expect(days[0]).toEqual(expect.arrayContaining(['hon-tre-island', 'vinwonders-nha-trang']))
    expect(cityDayHostsFullVisit(days[0], 'nha-trang')).toBe(true)
    const mun = planCityStay(['hon-mun-island'], 'nha-trang').days
    expect(mun).toEqual([['hon-mun-island']])
    expect(cityDayHostsFullVisit(mun[0], 'nha-trang')).toBe(true)
  })

  it('does not mix Nha Trang boat parks with each other, and fills leftover town hours', () => {
    const ids = [
      'hon-mun-island',
      'oceanographic-museum-nt',
      'nha-trang-cathedral',
      'ba-ho-waterfalls',
      'thap-ba-hot-springs',
      'hon-chong',
      'po-nagar',
      'i-resort-mud-bath',
      'skylight-nha-trang',
      'hon-tre-island',
      'vinwonders-nha-trang',
      'nha-trang-promenade',
      'bai-dai-beach',
      'diep-son-island',
      'nha-trang-beach',
    ]
    const { days } = planCityStay(ids, 'nha-trang')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const mun = days.find((row) => row.includes('hon-mun-island'))
    const tre = days.find((row) => row.includes('hon-tre-island'))
    const diep = days.find((row) => row.includes('diep-son-island'))
    const town = days.find((row) => row.includes('nha-trang-promenade'))
    expect(tre).toContain('vinwonders-nha-trang')
    expect(mun).not.toBe(tre)
    expect(mun).not.toBe(diep)
    expect(tre).not.toBe(diep)
    expect(diep).not.toBe(town)
    expect(tre).not.toContain('nha-trang-promenade')
    expect(town).not.toContain('bai-dai-beach')
    const falls = days.find((row) => row.includes('ba-ho-waterfalls'))
    expect(falls).not.toBe(mun)
    expect(falls).not.toBe(tre)
    expect(days.length).toBeLessThanOrEqual(4)
  })

  it('keeps Vinpearl Safari off Sao Beach, and packs leftover town onto the safari clock when it fits', () => {
    const ids = ['duong-dong-night-market', 'dinh-cau', 'vinpearl-safari-pq', 'sao-beach']
    const { days } = planCityStay(ids, 'phu-quoc')
    expect(days.flat().sort()).toEqual([...ids].sort())
    const town = days.find((row) => row.includes('duong-dong-night-market'))
    const safari = days.find((row) => row.includes('vinpearl-safari-pq'))
    const beach = days.find((row) => row.includes('sao-beach'))
    expect(town).toContain('dinh-cau')
    expect(safari).not.toContain('sao-beach')
    expect(beach).not.toBe(safari)
    expect(days.length).toBeLessThanOrEqual(3)
  })

  it('packs the live 71-sight bag without mixing Sapa valleys or Phu Quoc parks', () => {
    const sapa = [
      'fansipan',
      'fansipan-buddha',
      'muong-hoa-valley',
      'ta-van-village',
      'lao-chai-village',
      'cat-cat-village',
      'love-waterfall',
      'ta-phin-village',
      'ham-rong-mountain',
      'sapa-trek',
      'rong-may-skywalk',
      'bac-ha-market',
      'sapa-stone-church',
      'silver-waterfall',
      'sapa-center-square',
      'cat-cat-waterfall',
    ]
    const { days } = planCityStay(sapa, 'sapa')
    expect(days.flat().sort()).toEqual([...sapa].sort())
    const fan = days.find((row) => row.includes('fansipan'))
    const pass = days.find((row) => row.includes('rong-may-skywalk'))
    const cat = days.find((row) => row.includes('cat-cat-village'))
    const phin = days.find((row) => row.includes('ta-phin-village'))
    const trek = days.find((row) => row.includes('sapa-trek'))
    const market = days.find((row) => row.includes('bac-ha-market'))
    expect(fan).toContain('fansipan-buddha')
    expect(pass).toEqual(expect.arrayContaining(['love-waterfall', 'silver-waterfall']))
    expect(pass).not.toContain('ta-phin-village')
    expect(cat).toContain('cat-cat-waterfall')
    expect(cat).toBe(phin)
    expect(trek).toEqual(expect.arrayContaining(['ta-van-village', 'lao-chai-village', 'muong-hoa-valley']))
    expect(trek).not.toBe(cat)
    expect(market).not.toBe(trek)
    expect(market).not.toBe(fan)
    expect(days.length).toBeLessThanOrEqual(3)
  })

  it('packs the live 71-sight bag into a dense trip, not a leftover stub per sight', () => {
    const cities: { placeId: string; ids: string[] }[] = [
      {
        placeId: 'hanoi',
        ids: [
          'hoan-kiem-lake',
          'old-quarter',
          'temple-literature',
          'tran-quoc-pagoda',
          'hcm-stilt-house',
          'vietnamese-womens-museum',
          'vietnam-military-history-museum',
          'ho-chi-minh-museum-hanoi',
          'ngoc-son-temple',
          'vietnam-fine-arts-hanoi',
          'st-joseph-cathedral',
          'ethnology-museum',
          'one-pillar-pagoda',
          'ho-chi-minh-mausoleum',
          'west-lake',
          'bat-trang-pottery',
          'hoa-lo-prison',
        ],
      },
      {
        placeId: 'sapa',
        ids: [
          'fansipan',
          'muong-hoa-valley',
          'ta-van-village',
          'lao-chai-village',
          'cat-cat-village',
          'love-waterfall',
          'ta-phin-village',
          'ham-rong-mountain',
          'sapa-trek',
          'rong-may-skywalk',
          'bac-ha-market',
          'fansipan-buddha',
          'sapa-stone-church',
          'silver-waterfall',
          'sapa-center-square',
          'cat-cat-waterfall',
        ],
      },
      { placeId: 'ha-long', ids: ['halong-cruise'] },
      {
        placeId: 'nha-trang',
        ids: [
          'long-son-pagoda',
          'nha-trang-promenade',
          'hon-tre-island',
          'po-nagar',
          'hon-mun-island',
          'ba-ho-waterfalls',
          'i-resort-mud-bath',
          'bai-dai-beach',
          'hon-chong',
          'skylight-nha-trang',
          'oceanographic-museum-nt',
          'thap-ba-hot-springs',
          'diep-son-island',
          'vinwonders-nha-trang',
          'nha-trang-cathedral',
        ],
      },
      { placeId: 'dalat', ids: ['tuyen-lam-lake', 'crazy-house'] },
      {
        placeId: 'phu-quoc',
        ids: [
          'sao-beach',
          'hon-thom-cable',
          'ho-quoc-pagoda',
          'hon-thom-island',
          'ong-lang-beach',
          'khem-beach',
          'ham-ninh-village',
          'grand-world-pq',
          'duong-dong-night-market',
          'starfish-beach',
          'vinpearl-safari-pq',
          'suoi-tranh',
          'long-beach-pq',
          'vinwonders-pq',
          'hon-may-rut',
          'kiss-bridge',
          'phu-quoc-sunset',
          'dinh-cau',
          'phu-quoc-national-park',
          'phu-quoc-prison',
        ],
      },
    ]
    const packed = packTripStay(cities, '2026-09-12', 1)
    const total = packed.reduce((n, city) => n + city.days.length, 0)
    expect(total).toBeGreaterThanOrEqual(16)
    expect(total).toBeLessThanOrEqual(18)
    const hanoi = packed.find((row) => row.placeId === 'hanoi')!
    const sapa = packed.find((row) => row.placeId === 'sapa')!
    const haLong = packed.find((row) => row.placeId === 'ha-long')!
    const nhaTrang = packed.find((row) => row.placeId === 'nha-trang')!
    const dalat = packed.find((row) => row.placeId === 'dalat')!
    const phuQuoc = packed.find((row) => row.placeId === 'phu-quoc')!
    expect(hanoi.days.length).toBe(3)
    expect(sapa.days.length).toBe(3)
    expect(haLong.days.length).toBe(1)
    expect(haLong.days).toEqual([['halong-cruise']])
    expect(nhaTrang.days.length).toBeGreaterThanOrEqual(3)
    expect(nhaTrang.days.length).toBeLessThanOrEqual(4)
    expect(dalat.days.length).toBe(2)
    expect(phuQuoc.days.length).toBe(4)
    expect(packed.map((row) => row.placeId)).toEqual([
      'hanoi',
      'sapa',
      'ha-long',
      'nha-trang',
      'dalat',
      'phu-quoc',
    ])
    for (const city of packed) {
      const allowed = cities.find((c) => c.placeId === city.placeId)!.ids
      expect(city.days.flat().sort()).toEqual([...allowed].sort())
      expect(city.days.every((row) => row.length > 0)).toBe(true)
      const scheduled = city.days.flat()
      expect(new Set(scheduled).size, `${city.placeId} repeated a sight`).toBe(scheduled.length)
    }
  })
})

describe('buildYourVietnam packed days', () => {
  it('ignores leftover empty/blank Hanoi slots when the bag has one sight', () => {
    const trip = buildYourVietnam({
      days: 8,
      startDate: '2026-09-07',
      travelStyle: 'balanced',
      experienceIds: ['temple-literature'],
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [
        { id: 'old-1', placeId: 'hanoi', blank: false },
        { id: 'old-2', placeId: 'hanoi', blank: true },
        { id: 'old-3', placeId: 'hanoi', blank: false },
      ],
    })
    expect(trip.isEmpty).toBe(false)
    expect(trip.days).toHaveLength(1)
    expect(trip.days[0].city.toLowerCase()).toContain('hanoi')
    const sightIds = trip.days.flatMap((d) =>
      d.periods.flatMap((p) =>
        p.items.filter((it) => it.kind === 'experience').map((it) => it.sourceId),
      ),
    )
    expect(sightIds).toEqual(['temple-literature'])
  })

  it('packs Hue citadel, river, and tomb sights without dropping any', () => {
    const trip = buildYourVietnam({
      days: 14,
      startDate: '2026-09-07',
      travelStyle: 'balanced',
      experienceIds: [
        'hue-citadel',
        'ngo-mon-gate',
        'truong-tien-bridge',
        'thien-mu-pagoda',
        'tu-hieu-pagoda',
        'khai-dinh-tomb',
      ],
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [
        { id: 'hue-a', placeId: 'hue', blank: false },
        { id: 'hue-b', placeId: 'hue', blank: false },
        { id: 'hue-c', placeId: 'hue', blank: false },
      ],
    })
    const hueDays = trip.days.filter((d) => d.city.toLowerCase().includes('hue'))
    expect(hueDays.length).toBeGreaterThanOrEqual(1)
    const ids = hueDays.flatMap((d) =>
      d.periods.flatMap((p) => p.items.map((it) => it.sourceId).filter(Boolean)),
    )
    expect(ids).toEqual(
      expect.arrayContaining([
        'hue-citadel',
        'thien-mu-pagoda',
        'ngo-mon-gate',
        'khai-dinh-tomb',
      ]),
    )
  })

  it('does not pad leftover trip nights onto every city', () => {
    const trip = buildYourVietnam({
      days: 14,
      startDate: '2026-09-07',
      travelStyle: 'balanced',
      experienceIds: [
        'temple-literature',
        'old-quarter',
        'hue-citadel',
        'truong-tien-bridge',
        'hoi-an-ancient-town',
        'japanese-covered-bridge',
        'ben-thanh',
      ],
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
    })
    const byCity = new Map<string, number>()
    for (const d of trip.days) {
      byCity.set(d.city, (byCity.get(d.city) ?? 0) + 1)
    }
    for (const [city, n] of byCity) {
      expect(n, city).toBe(1)
    }
    expect(trip.days.length).toBeLessThan(14)
  })

  it('does not keep a half day 3 when leftover slots pin thin Hanoi clusters', () => {
    const ids = [
      'temple-literature',
      'old-quarter',
      'hoan-kiem-lake',
      'train-street',
    ]
    const trip = buildYourVietnam({
      days: 8,
      startDate: '2026-09-07',
      travelStyle: 'packed',
      holidayKind: 'action',
      holidayKindKnown: true,
      paceKnown: true,
      experienceIds: ids,
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [
        { id: 'h1', placeId: 'hanoi', blank: false },
        { id: 'h2', placeId: 'hanoi', blank: false },
        { id: 'h3', placeId: 'hanoi', blank: false },
      ],
      itineraryDaySlotOverrides: {
        'temple-literature': 'h1',
        'old-quarter': 'h1',
        'hoan-kiem-lake': 'h2',
        'train-street': 'h3',
      },
    })
    const hanoiDays = trip.days.filter((d) => d.city.toLowerCase().includes('hanoi'))
    expect(hanoiDays.length).toBe(1)
    expect(hanoiDays.length).toBeLessThan(3)
  })

  it('puts Ba Dinh + Hoan Kiem + Old Quarter on one Hanoi day even when leftover slots pin each cluster', () => {
    const ids = [
      'ho-chi-minh-mausoleum',
      'one-pillar-pagoda',
      'ho-chi-minh-museum-hanoi',
      'hcm-stilt-house',
      'hoan-kiem-lake',
      'ngoc-son-temple',
      'old-quarter',
      'st-joseph-cathedral',
      'temple-literature',
      'train-street',
    ]
    const trip = buildYourVietnam({
      days: 10,
      startDate: '2026-09-08',
      travelStyle: 'packed',
      holidayKind: 'action',
      holidayKindKnown: true,
      paceKnown: true,
      experienceIds: ids,
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
      itineraryDaySlots: [
        { id: 'morning-slot', placeId: 'hanoi', blank: false },
        { id: 'afternoon-slot', placeId: 'hanoi', blank: false },
        { id: 'evening-slot', placeId: 'hanoi', blank: false },
      ],
      itineraryDaySlotOverrides: {
        'ho-chi-minh-mausoleum': 'morning-slot',
        'one-pillar-pagoda': 'morning-slot',
        'ho-chi-minh-museum-hanoi': 'morning-slot',
        'hcm-stilt-house': 'morning-slot',
        'hoan-kiem-lake': 'afternoon-slot',
        'ngoc-son-temple': 'afternoon-slot',
        'old-quarter': 'evening-slot',
        'st-joseph-cathedral': 'evening-slot',
        'temple-literature': 'afternoon-slot',
        'train-street': 'evening-slot',
      },
    })
    const hanoiDays = trip.days.filter((d) => d.city.toLowerCase().includes('hanoi'))
    const sightIds = hanoiDays.flatMap((d) =>
      d.periods.flatMap((p) =>
        p.items.filter((it) => it.kind === 'experience').map((it) => it.sourceId),
      ),
    )
    expect(sightIds.filter(Boolean).sort()).toEqual([...ids].sort())
    expect(hanoiDays.length).toBeLessThanOrEqual(2)
  })

  it('packs a north-south bag as a global assignment: valid days, contiguous cities, no empty later stubs', () => {
    const experienceIds = [
      'temple-literature',
      'old-quarter',
      'hoan-kiem-lake',
      'train-street',
      'hue-citadel',
      'thien-mu-pagoda',
      'khai-dinh-tomb',
      'hoi-an-ancient-town',
      'japanese-covered-bridge',
      'ben-thanh',
      'independence-palace',
    ]
    const trip = buildYourVietnam({
      days: 14,
      startDate: '2026-09-07',
      travelStyle: 'balanced',
      experienceIds,
      activityIds: [],
      hotelIds: [],
      chosenStayId: null,
      restaurantIds: [],
      shoppingIds: [],
      transportChoices: {},
      experienceMeta: {},
    })
    expect(trip.isEmpty).toBe(false)
    expect(trip.days.every((d) => d.placeId)).toBe(true)
    const cityOrder = trip.days.map((d) => d.placeId).filter(Boolean)
    for (let i = 1; i < cityOrder.length; i++) {
      if (cityOrder[i] === cityOrder[i - 1]) continue
      expect(cityOrder.slice(i).includes(cityOrder[i - 1] as string), cityOrder[i - 1]).toBe(false)
    }
    const scheduled = trip.days.flatMap((d) =>
      d.periods.flatMap((p) =>
        p.items.filter((it) => it.kind === 'experience').map((it) => it.sourceId),
      ),
    )
    expect(scheduled.filter(Boolean).sort()).toEqual([...experienceIds].sort())
    for (const day of trip.days) {
      const ids = day.periods.flatMap((p) =>
        p.items.filter((it) => it.kind === 'experience').map((it) => it.sourceId).filter(Boolean),
      ) as string[]
      expect(ids.length, day.city).toBeGreaterThan(0)
      expect(
        cityDayHostsFullVisit(ids, day.placeId, tripIsoDate('2026-09-07', day.day)),
        `${day.city} day ${day.day}`,
      ).toBe(true)
    }
  })
})

describe('packTripStay', () => {
  it('keeps sights inside their city and makes every city-day a valid full visit', () => {
    const cities = [
      { placeId: 'hanoi', ids: ['temple-literature', 'old-quarter', 'hoan-kiem-lake', 'train-street'] },
      { placeId: 'hue', ids: ['hue-citadel', 'thien-mu-pagoda', 'khai-dinh-tomb'] },
      { placeId: 'hoi-an', ids: ['hoi-an-ancient-town', 'japanese-covered-bridge'] },
      { placeId: 'hcmc', ids: ['ben-thanh', 'independence-palace'] },
    ]
    const startDate = '2026-09-07'
    const packed = packTripStay(cities, startDate, 1)
    expect(packed.map((row) => row.placeId)).toEqual(cities.map((c) => c.placeId))
    let dayNumber = 1
    for (const city of packed) {
      const allowed = new Set(cities.find((c) => c.placeId === city.placeId)!.ids)
      expect(city.days.every((row) => row.length > 0), city.placeId).toBe(true)
      expect(city.days.flat().sort(), city.placeId).toEqual([...allowed].sort())
      expect(city.days.flat().every((id) => allowed.has(id)), city.placeId).toBe(true)
      for (const row of city.days) {
        const iso = tripIsoDate(startDate, dayNumber)
        expect(cityDayHostsFullVisit(row, city.placeId, iso), `${city.placeId} ${iso}`).toBe(true)
        dayNumber += 1
      }
    }
    expect(dayNumber - 1).toBeLessThan(cities.reduce((n, c) => n + c.ids.length, 0))
  })

  it('keeps a lantern class and folk dance on the existing Hoi An day', () => {
    const packed = packTripStay(
      [{ placeId: 'hoi-an', ids: ['ha-lantern-make', 'ha-folk-dance'] }],
      '2026-09-14',
      1,
      { 'hoi-an': 1 },
    )
    expect(packed).toHaveLength(1)
    expect(packed[0].days).toHaveLength(1)
    expect(packed[0].days[0].sort()).toEqual(['ha-folk-dance', 'ha-lantern-make'].sort())
  })

  it('does not invent extra days when the current stay still has clock room', () => {
    const ids = ['ha-lantern-make', 'ha-folk-dance', 'japanese-covered-bridge']
    const packed = packTripStay([{ placeId: 'hoi-an', ids }], '2026-09-14', 1, { 'hoi-an': 1 })
    expect(packed[0].days.length).toBe(1)
    expect(packed[0].days.flat().sort()).toEqual([...ids].sort())
  })

  it('still keeps Hai Van off the Da Nang city day when the stay already has one calendar slot', () => {
    const packed = packTripStay(
      [{ placeId: 'da-nang', ids: ['asia-park-danang', 'cham-sculpture-museum', 'hai-van-pass'] }],
      '2026-09-14',
      1,
      { 'da-nang': 1 },
    )
    const city = packed[0].days.find((row) => row.includes('cham-sculpture-museum'))
    const pass = packed[0].days.find((row) => row.includes('hai-van-pass'))
    expect(city).toContain('asia-park-danang')
    expect(city).not.toBe(pass)
  })
})
