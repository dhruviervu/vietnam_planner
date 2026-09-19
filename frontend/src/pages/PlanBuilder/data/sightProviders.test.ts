import { describe, expect, it } from 'vitest'
import { SIGHT_CATALOG, getExperienceById } from './experiences'
import { CITY_ACTIVITIES } from './activities'
import { getActivityBookingOffers, isBookableActivity } from './activityProviders'
import {
  getSightProviderOffers,
  isBookableSight,
  sightMarketplaceQuery,
} from './sightProviders'

describe('sight providers', () => {
  it('treats ticketed and cruise sights as bookable', () => {
    expect(isBookableSight(getExperienceById('temple-literature')!)).toBe(true)
    expect(isBookableSight(getExperienceById('halong-cruise')!)).toBe(true)
    expect(isBookableSight(getExperienceById('hoa-lo-prison')!)).toBe(true)
    expect(isBookableSight(getExperienceById('ninh-binh')!)).toBe(true)
    expect(isBookableSight(getExperienceById('hoi-an-ancient-town')!)).toBe(true)
    expect(isBookableSight(getExperienceById('paradise-cave')!)).toBe(true)
    expect(isBookableSight(getExperienceById('ba-na-hills')!)).toBe(true)
    expect(isBookableSight(getExperienceById('fansipan')!)).toBe(true)
  })

  it('does not offer booking desks for walk-up streets and cafés', () => {
    expect(isBookableSight(getExperienceById('hoan-kiem-lake')!)).toBe(false)
    expect(isBookableSight(getExperienceById('old-quarter')!)).toBe(false)
    expect(isBookableSight(getExperienceById('egg-coffee')!)).toBe(false)
    expect(isBookableSight(getExperienceById('bia-hoi')!)).toBe(false)
  })

  it('builds search URLs that include the sight on every marketplace', () => {
    const temple = getExperienceById('temple-literature')!
    const offers = getSightProviderOffers(temple)
    expect(offers.map((o) => o.id)).toEqual(['getyourguide', 'klook', 'viator', 'kkday'])
    for (const offer of offers) {
      expect(offer.bookingUrl.startsWith('https://')).toBe(true)
      expect(offer.bookingUrl).toMatch(/Temple|Literature|Hanoi|temple/i)
    }
  })

  it('covers every bookable catalog sight with four live search links', () => {
    const bookable = SIGHT_CATALOG.filter(isBookableSight)
    expect(bookable.length).toBeGreaterThan(80)
    for (const sight of bookable) {
      const offers = getSightProviderOffers(sight)
      expect(offers).toHaveLength(4)
      const q = encodeURIComponent(sightMarketplaceQuery(sight))
      expect(q.length).toBeGreaterThan(4)
      for (const offer of offers) {
        expect(offer.bookingUrl).toContain(q)
      }
    }
  })
})

describe('activity providers', () => {
  it('exposes booking links for every bookable activity', () => {
    const bookable = CITY_ACTIVITIES.filter(isBookableActivity)
    expect(bookable.length).toBeGreaterThan(20)
    for (const activity of bookable) {
      const offers = getActivityBookingOffers(activity)
      expect(offers.length).toBeGreaterThanOrEqual(2)
      for (const offer of offers) {
        expect(offer.bookingUrl.startsWith('https://')).toBe(true)
      }
    }
  })

  it('does not list providers for drop-in activities', () => {
    const taiChi = CITY_ACTIVITIES.find((a) => a.id === 'hn-tai-chi-lake')
    expect(taiChi).toBeTruthy()
    expect(isBookableActivity(taiChi!)).toBe(false)
    expect(getActivityBookingOffers(taiChi!)).toEqual([])
  })
})
