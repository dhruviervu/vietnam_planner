import { describe, expect, it } from 'vitest'
import type { TripBasics } from '../../../store/tripStore'
import { cityToSlug } from '../services/citySlug'
import { getExperienceDetailBlurb } from '../lib/experienceDetailBlurb'
import { titleGuideParagraphs } from '../lib/guideParagraphs'
import { imageForGuideSection } from '../lib/guideSectionImage'
import { getExperienceCardPhotos, getExperienceImages } from '../lib/pricing'
import { hoursLabelForSource } from '../lib/yourVietnam/openingHours'
import { itineraryItemHref } from '../lib/yourVietnam/links'
import { getExperiencePracticalInfo } from '../services/experiencePracticalInfo'
import { getExperienceDetails } from '../services/experienceLiveService'
import { computeTripFit } from '../services/recommendationEngine'
import { getSightProviderOffers } from './sightProviders'
import {
  duplicateExperienceGuideKeys,
  EXPERIENCE_GUIDES,
  getExperienceGuide,
  wordCount,
} from './experienceGuides'
import {
  HERITAGE_GUIDE_MAX_WORDS,
  HERITAGE_GUIDE_MIN_WORDS,
  isDeepHeritageSight,
} from './heritageDeepSights'
import {
  ACTIVITY_OWNED_SIGHT_IDS,
  EXPERIENCES,
  EXPERIENCE_BY_ID,
  SIGHT_CATALOG,
  getExperienceById,
  isSightCatalogItem,
} from './experiences'

const BASICS: TripBasics = {
  startDate: '',
  endDate: '',
  dateMode: 'unknown',
  flexibleMonth: null,
  flexibleSeason: null,
  days: 10,
  durationKnown: false,
  budgetTarget: 1200,
  budgetKnown: false,
  budgetMode: 'per-person',
  budgetMin: 800,
  budgetMax: 2000,
  travelStyle: 'balanced',
  paceKnown: false,
  interests: [],
  groupSize: 2,
  groupSizeKnown: false,
  holidayKind: 'leisure',
  holidayKindKnown: false,
  budgetFixedUsd: 600,
  budgetDailyUsd: 50,
  budgetAllocationKnown: false,
}

const POPULARITY_TAGS = new Set(['Must do', 'Popular', 'Unique', 'Hidden gem', 'Local favourite'])
const BOOK_AHEAD = new Set(['required', 'recommended', 'not needed'])

describe('sight detail production readiness', () => {
  it('keeps catalog ids unique and lookup-stable', () => {
    const ids = EXPERIENCES.map((e) => e.id)
    expect(ids).toEqual([...new Set(ids)])
    expect(EXPERIENCE_BY_ID.size).toBe(EXPERIENCES.length)
    for (const e of EXPERIENCES) {
      expect(getExperienceById(e.id)).toBe(e)
      expect(e.id.trim()).toBe(e.id)
      expect(e.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(e.name.trim().length).toBeGreaterThan(1)
      expect(e.city.trim().length).toBeGreaterThan(1)
      expect(e.whyGo.trim().length).toBeGreaterThan(8)
      expect(e.about.trim().length).toBeGreaterThan(8)
      expect(e.hook.trim().length).toBeGreaterThan(4)
      expect(e.accessibilityDetail.walking.length).toBeGreaterThan(2)
      expect(e.accessibilityDetail.steps.length).toBeGreaterThan(2)
      expect(e.durationHours).toBeGreaterThan(0)
      expect(e.durationLabel.trim().length).toBeGreaterThan(1)
      expect(POPULARITY_TAGS.has(e.popularityTag)).toBe(true)
    }
  })

  it('does not silently overwrite visitor guides across modules', () => {
    expect(duplicateExperienceGuideKeys()).toEqual([])
  })

  it('gives on-topic heritage guides without padding boats to a thousand words', () => {
    const heritage = EXPERIENCES.filter(isDeepHeritageSight)
    expect(heritage.length).toBeGreaterThan(40)
    expect(heritage.length).toBeLessThan(280)

    const empty: string[] = []
    const thin: string[] = []
    const fat: string[] = []
    const untitled: string[] = []
    for (const e of heritage) {
      const guide = getExperienceGuide(e.id)
      if (!guide.trim()) {
        empty.push(e.id)
        continue
      }
      const n = wordCount(guide)
      if (n < HERITAGE_GUIDE_MIN_WORDS) thin.push(`${e.id} (${n})`)
      if (n > HERITAGE_GUIDE_MAX_WORDS) fat.push(`${e.id} (${n})`)
      const sections = titleGuideParagraphs(guide, e.name)
      if (sections.length < 4) untitled.push(`${e.id} sections ${sections.length}`)
      if (!sections.length || sections.some((s) => !s.title.trim() || !s.body.trim())) {
        untitled.push(e.id)
      }
      const titles = sections.map((s) => s.title)
      if (new Set(titles).size !== titles.length) untitled.push(`${e.id} duplicate titles`)
    }
    expect(empty).toEqual([])
    expect(untitled).toEqual([])
    expect(thin).toEqual([])
    expect(fat).toEqual([])
  })

  it('does not pad beaches, markets, and viewpoint parks to a thousand words', () => {
    const padded: string[] = []
    for (const e of EXPERIENCES) {
      if (isDeepHeritageSight(e)) continue
      const guide = getExperienceGuide(e.id)
      const curated = EXPERIENCE_GUIDES[e.id] || ''
      if (guide !== curated) padded.push(e.id)
      if (curated && wordCount(guide) < 1000) {
        const sections = titleGuideParagraphs(guide, e.name)
        const titles = sections.map((s) => s.title)
        if (new Set(titles).size !== titles.length) padded.push(`${e.id} duplicate titles`)
      }
    }
    expect(padded).toEqual([])
  })

  it('keeps uniquely titled heritage guides inside major cities', () => {
    for (const city of ['Ha Long', 'Hanoi', 'Hue', 'Hoi An', 'Ho Chi Minh City']) {
      const heritage = EXPERIENCES.filter((e) => e.city === city && isDeepHeritageSight(e))
      expect(heritage.length, city).toBeGreaterThan(2)
      const secondTitles: string[] = []
      for (const e of heritage) {
        const guide = getExperienceGuide(e.id)
        expect(wordCount(guide), e.id).toBeGreaterThanOrEqual(HERITAGE_GUIDE_MIN_WORDS)
        const sections = titleGuideParagraphs(guide, e.name)
        const titles = sections.map((s) => s.title)
        expect(new Set(titles).size, e.id).toBe(titles.length)
        if (titles[1]) secondTitles.push(titles[1])
      }
      expect(new Set(secondTitles).size, city).toBeGreaterThan(1)
    }
  })

  it('never 404s a real sight: details, trip fit, photos, hours, practical chips', () => {
    const missingDetails: string[] = []
    const brokenFit: string[] = []
    const noPhotos: string[] = []
    const noBlurb: string[] = []
    const noHours: string[] = []
    const badPractical: string[] = []
    for (const e of EXPERIENCES) {
      const details = getExperienceDetails(e.id, null, 'morning')
      if (!details) missingDetails.push(e.id)
      try {
        const fit = computeTripFit(e, BASICS, [])
        if (!Number.isFinite(fit.score) || !fit.reasons.length) brokenFit.push(e.id)
      } catch {
        brokenFit.push(e.id)
      }
      const photos = getExperienceImages(e)
      if (!photos.length || photos.some((src) => !src)) noPhotos.push(e.id)
      const blurb = getExperienceDetailBlurb(e)
      if (blurb.trim().length < 12) noBlurb.push(e.id)
      const hours = hoursLabelForSource('experience', e.id, e.hours)
      if (!hours?.trim()) noHours.push(e.id)
      if (/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+[a-z]{1,2}(?=;|$)/i.test(hours)) noHours.push(`${e.id}:${hours}`)
      const practical = getExperiencePracticalInfo(e)
      if (
        !BOOK_AHEAD.has(practical.bookAhead) ||
        practical.whatToBring.length === 0 ||
        practical.physicalEffort.walkingIntensity < 1 ||
        practical.physicalEffort.walkingIntensity > 5
      ) {
        badPractical.push(e.id)
      }
    }
    expect(missingDetails).toEqual([])
    expect(brokenFit).toEqual([])
    expect(noPhotos).toEqual([])
    expect(noBlurb).toEqual([])
    expect(noHours).toEqual([])
    expect(badPractical).toEqual([])
  })

  it('only points “also like” / relatedIds at real catalog ids', () => {
    const missing: string[] = []
    for (const e of EXPERIENCES) {
      for (const related of e.relatedIds) {
        if (related === e.id) missing.push(`${e.id} → self`)
        else if (!getExperienceById(related)) missing.push(`${e.id} → ${related}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('gives every city a URL slug and at least one catalog card', () => {
    const byCity = new Map<string, number>()
    for (const e of SIGHT_CATALOG) {
      const slug = cityToSlug(e.city)
      expect(slug.length).toBeGreaterThan(1)
      byCity.set(e.city, (byCity.get(e.city) ?? 0) + 1)
    }
    expect(byCity.size).toBeGreaterThan(5)
    expect([...byCity.values()].every((n) => n > 0)).toBe(true)
  })

  it('keeps activity-owned ids out of the sights catalog', () => {
    for (const id of ACTIVITY_OWNED_SIGHT_IDS) {
      expect(getExperienceById(id)).toBeTruthy()
      expect(isSightCatalogItem({ id })).toBe(false)
      expect(SIGHT_CATALOG.some((e) => e.id === id)).toBe(false)
    }
  })

  it('resolves unknown ids as not found', () => {
    expect(getExperienceById('not-a-real-sight')).toBeUndefined()
    expect(getExperienceGuide('not-a-real-sight')).toBe('')
    expect(getExperienceDetails('not-a-real-sight', null, 'morning')).toBeNull()
  })

  it('picks a photo for every visitor-guide section', () => {
    const sample = getExperienceById('halong-cruise')!
    const sections = titleGuideParagraphs(getExperienceGuide(sample.id), sample.name)
    expect(sections.length).toBeGreaterThan(3)
    for (const [i, section] of sections.entries()) {
      expect(imageForGuideSection(section.title, sample, i).length).toBeGreaterThan(8)
    }
  })

  it('builds a working new-tab href for every catalog sight', () => {
    for (const e of SIGHT_CATALOG) {
      expect(itineraryItemHref({ kind: 'experience', sourceId: e.id })).toBe(
        `/plan/builder/experience/${e.id}`,
      )
      expect(getExperienceCardPhotos(e).length).toBeGreaterThan(0)
    }
  })

  it('does not crash provider search for bookable and walk-up sights', () => {
    for (const id of ['temple-literature', 'hoan-kiem-lake', 'halong-cruise', 'bai-tu-long-bay']) {
      const e = getExperienceById(id)!
      expect(e).toBeTruthy()
      const offers = getSightProviderOffers(e)
      expect(Array.isArray(offers)).toBe(true)
    }
  })
})
