import { describe, expect, it } from 'vitest'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES } from '../data/activities'
import {
  isIncludedCompanion,
  planningNoteFor,
  sightPlanning,
} from './yourVietnam/sightPlanning'
import { orderIdsBySightIntelligence } from './yourVietnam/sightOrder'
import { planCityStay } from './yourVietnam/dayAllocation'
import {
  canonicalSightId,
  complexFor,
  walkClusterId,
} from './yourVietnam/sightIntelligence'

describe('sight intelligence for itinerary sorting', () => {
  it('gives every catalog sight a what / when / note', () => {
    const missing: string[] = []
    for (const e of EXPERIENCES) {
      const ctx = sightPlanning(e.id)
      if (ctx.what.length < 8 || ctx.bestWhen.length < 2 || ctx.note.length < 8) {
        missing.push(e.id)
      }
    }
    expect(missing).toEqual([])
  })

  it('gives every activity a what / when / note', () => {
    const missing: string[] = []
    for (const a of CITY_ACTIVITIES) {
      const ctx = sightPlanning(a.id)
      if (ctx.what.length < 4 || ctx.note.length < 4) missing.push(a.id)
    }
    expect(missing).toEqual([])
  })

  it('keeps Ha Long cruise landings on the boat, in published Route 2 order', () => {
    const ids = ['ti-top-island', 'sung-sot-cave', 'halong-cruise', 'luon-cave']
    expect(orderIdsBySightIntelligence(ids)).toEqual([
      'halong-cruise',
      'sung-sot-cave',
      'luon-cave',
      'ti-top-island',
    ])
    expect(isIncludedCompanion('sung-sot-cave', ids)).toBe(true)
    expect(isIncludedCompanion('ti-top-island', ids)).toBe(true)
    expect(isIncludedCompanion('halong-cruise', ids)).toBe(false)
    expect(planningNoteFor('sung-sot-cave', ids)).toMatch(/same outing/i)
  })

  it('does not treat Sung Sot as a taxi hop when the cruise is also selected', () => {
    const { days } = planCityStay(
      ['halong-cruise', 'sung-sot-cave', 'ti-top-island', 'bai-chay-beach'],
      'ha-long',
    )
    const cruiseDay = days.find((d) => d.includes('halong-cruise'))
    expect(cruiseDay).toBeTruthy()
    expect(cruiseDay).toEqual(expect.arrayContaining(['sung-sot-cave', 'ti-top-island']))
    expect(cruiseDay?.indexOf('halong-cruise')).toBeLessThan(cruiseDay!.indexOf('sung-sot-cave'))
    expect(cruiseDay?.indexOf('sung-sot-cave')).toBeLessThan(cruiseDay!.indexOf('ti-top-island'))
  })

  it('walks Hue Imperial City south to north on one ticket', () => {
    const ids = ['forbidden-purple-city', 'hue-citadel', 'thai-hoa-palace', 'ngo-mon-gate']
    expect(orderIdsBySightIntelligence(ids)).toEqual([
      'hue-citadel',
      'ngo-mon-gate',
      'thai-hoa-palace',
      'forbidden-purple-city',
    ])
    expect(isIncludedCompanion('ngo-mon-gate', ids)).toBe(true)
    expect(isIncludedCompanion('forbidden-purple-city', ids)).toBe(true)
  })

  it('keeps Ngoc Son on the Hoan Kiem lake walk', () => {
    const ids = ['ngoc-son-temple', 'hoan-kiem-lake', 'old-quarter']
    const ordered = orderIdsBySightIntelligence(ids)
    expect(ordered.indexOf('hoan-kiem-lake')).toBeLessThan(ordered.indexOf('ngoc-son-temple'))
    expect(isIncludedCompanion('ngoc-son-temple', ids)).toBe(true)
  })

  it('treats Tam Coc and Trang An as the same Ninh Binh boat choice, not two days', () => {
    const { days } = planCityStay(['hoa-lu', 'tam-coc-boats', 'trang-an-boats', 'mua-cave'], 'ninh-binh')
    expect(days.flat().sort()).toEqual(
      ['hoa-lu', 'tam-coc-boats', 'trang-an-boats', 'mua-cave'].sort(),
    )
    expect(days.length).toBeLessThan(4)
    const boatDay = days.find((d) => d.includes('tam-coc-boats') || d.includes('trang-an-boats'))
    expect(boatDay?.length).toBeGreaterThan(0)
    expect(sightPlanning('tam-coc-boats').note).toMatch(/alternative/i)
  })

  it('places Lady Buddha on the Son Tra outing', () => {
    const ids = ['linh-ung-pagoda', 'son-tra']
    expect(orderIdsBySightIntelligence(ids)).toEqual(['son-tra', 'linh-ung-pagoda'])
    expect(isIncludedCompanion('linh-ung-pagoda', ids)).toBe(true)
  })

  it('does not alias Hanoi cooking or tai chi onto a different city’s sight', () => {
    expect(canonicalSightId('hn-cooking-home')).toBe('hn-cooking-home')
    expect(canonicalSightId('hn-tai-chi-lake')).toBe('hn-tai-chi-lake')
    expect(canonicalSightId('hn-egg-coffee-lab')).toBe('hn-egg-coffee-lab')
  })

  it('resolves Dong Van duplicate cards onto the same Ha Giang sight', () => {
    expect(canonicalSightId('ma-pi-leng-dong-van')).toBe('ma-pi-leng')
    expect(complexFor('ma-pi-leng-dong-van')?.id).toBe(complexFor('ma-pi-leng')?.id)
  })

  it('does not glue Cat Cat onto the Muong Hoa trek, and overlays Ta Van on the trek clock', () => {
    expect(isIncludedCompanion('cat-cat-waterfall', ['sapa-trek', 'cat-cat-waterfall'])).toBe(false)
    expect(isIncludedCompanion('cat-cat-waterfall', ['cat-cat-village', 'cat-cat-waterfall'])).toBe(true)
    expect(isIncludedCompanion('ta-van-village', ['sapa-trek', 'ta-van-village'])).toBe(true)
  })

  it('covers every experience with a complex or walking cluster', () => {
    const uncovered = EXPERIENCES.filter(
      (e) => !complexFor(e.id) && !walkClusterId(e.id) && !complexFor(canonicalSightId(e.id)),
    ).map((e) => e.id)
    expect(uncovered).toEqual([])
  })
})
