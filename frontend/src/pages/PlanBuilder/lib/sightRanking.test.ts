import { describe, expect, it } from 'vitest'
import {
  bayesianRating,
  buildCategoryStats,
  durationFairness,
  freshnessMultiplier,
  rankAndSortSights,
  REVIEW_FLOOR,
  scoreSight,
  touristReviewCount,
  travelerFame,
  volumeFactor,
  type Sight,
} from './sightRanking'
import {
  inferCategoryAnchor,
  inferSignificanceTier,
  isLocalReviewBiased,
  rankingCategoryFor,
  REGION_ANCHOR_IDS,
} from './sightRankingFromExperience'
import { SIGHT_CATALOG } from '../data/experiences'
import { rankCityExperiences } from '../services/cityCatalog'

describe('Bayesian core', () => {
  it('pulls a 5-star sight with 0 reviews to the category baseline', () => {
    const S = bayesianRating(0, 5, 200, 4.2)
    expect(S).toBeCloseTo(4.2, 6)
  })

  it('lets volume move a listing off the prior', () => {
    const thin = bayesianRating(40, 4.95, 200, 4.2)
    const thick = bayesianRating(8000, 4.5, 200, 4.2)
    expect(thick).toBeGreaterThan(thin)
  })

  it('uses a higher C for museums than for markets', () => {
    const stats = buildCategoryStats([
      { id: 'm1', rankCategory: 'museums', rating: 4.7, reviewCount: 800 },
      { id: 'm2', rankCategory: 'museums', rating: 4.8, reviewCount: 600 },
      { id: 'm3', rankCategory: 'museums', rating: 4.6, reviewCount: 500 },
      { id: 'k1', rankCategory: 'markets', rating: 4.1, reviewCount: 900 },
      { id: 'k2', rankCategory: 'markets', rating: 4.2, reviewCount: 700 },
      { id: 'k3', rankCategory: 'markets', rating: 4.3, reviewCount: 400 },
    ])
    expect(stats.byCategory.museums!.C).toBeGreaterThan(stats.byCategory.markets!.C)
    const thinMarket = scoreSight(
      { id: 'k', rankCategory: 'markets', rating: 5, reviewCount: 25 },
      stats,
    )
    const thinMuseum = scoreSight(
      { id: 'm', rankCategory: 'museums', rating: 5, reviewCount: 25 },
      stats,
    )
    expect(thinMarket.bayesianRating).toBeLessThan(thinMuseum.bayesianRating)
    expect(thinMarket.bayesianRating).toBeLessThan(4.55)
  })
})

describe('volume, freshness, duration', () => {
  it('gives log10 volume a modest lift so 10→100 matters more than 40k→40.9k', () => {
    const a = volumeFactor(10)
    const b = volumeFactor(100)
    const c = volumeFactor(40_000)
    const d = volumeFactor(40_900)
    expect(b - a).toBeGreaterThan(d - c)
    expect(volumeFactor(100)).toBeCloseTo(1 + 0.42 * 2, 6)
  })

  it('weights a brand-new review mix 3× a three-year-old mix', () => {
    expect(freshnessMultiplier(0) / freshnessMultiplier(3)).toBeCloseTo(3, 6)
  })

  it('does not let a 15-minute photo stop compete equally with a half-day outing', () => {
    expect(durationFairness(0.25)).toBeLessThan(durationFairness(2.5))
    expect(durationFairness(8)).toBeLessThan(durationFairness(3))
  })
})

describe('sanity rules', () => {
  it('soft-ranks listings under the review floor behind trusted ones', () => {
    const spam: Sight = { id: 'spam', rating: 5, reviewCount: 12 }
    const real: Sight = { id: 'real', rating: 4.4, reviewCount: 900 }
    const ranked = rankAndSortSights([spam, real], { promoteAnchors: false })
    expect(ranked[0].id).toBe('real')
    expect(ranked[1].belowReviewFloor).toBe(true)
    expect(REVIEW_FLOOR).toBe(20)
  })

  it('locks UNESCO / must-see anchors into city slots 1–3', () => {
    const noise: Sight[] = Array.from({ length: 8 }, (_, i) => ({
      id: `busy-${i}`,
      rating: 4.8,
      reviewCount: 12_000 + i,
      isAnchor: false,
      durationHours: 2,
      rankCategory: 'urban' as const,
    }))
    const citadel: Sight = {
      id: 'hue-citadel',
      rating: 4.5,
      reviewCount: 800,
      isAnchor: true,
      durationHours: 3,
      rankCategory: 'historical',
    }
    const ranked = rankAndSortSights([...noise, citadel], { promoteAnchors: true })
    expect(ranked.slice(0, 3).some((s) => s.id === 'hue-citadel')).toBe(true)
    expect(REGION_ANCHOR_IDS.has('hue-citadel')).toBe(true)
  })

  it('ranks a high-volume 4.6 above a 5.0 with almost no reviews', () => {
    const ranked = rankAndSortSights(
      [
        { id: 'hidden-hamlet', rating: 5, reviewCount: 18, durationHours: 1 },
        { id: 'halong-cruise', rating: 4.6, reviewCount: 12_000, durationHours: 7, isAnchor: true },
      ],
      { promoteAnchors: false },
    )
    expect(ranked[0].id).toBe('halong-cruise')
  })
})

describe('city catalog', () => {
  it('puts Ha Long Bay, Hue’s Imperial City, and Hoi An town in each city’s top three', () => {
    const haLong = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === 'Ha Long'))
    const hue = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === 'Hue'))
    const hoiAn = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === 'Hoi An'))
    const hanoi = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === 'Hanoi'))

    expect(haLong.slice(0, 3).map((e) => e.id)).toContain('halong-cruise')
    expect(hue.slice(0, 3).map((e) => e.id)).toContain('hue-citadel')
    expect(hoiAn.slice(0, 3).map((e) => e.id)).toEqual(
      expect.arrayContaining(
        ['hoi-an-lanterns', 'hoi-an-ancient-town'].filter((id) =>
          hoiAn.some((e) => e.id === id),
        ),
      ),
    )
    const hanoiTop = hanoi.slice(0, 3).map((e) => e.id)
    expect(hanoiTop.some((id) => ['old-quarter', 'temple-literature', 'hoan-kiem-lake', 'thang-long-citadel'].includes(id))).toBe(
      true,
    )
    expect(hanoiTop).not.toContain('egg-coffee')
  })

  it('keeps well-known tourist sights above obscure listings in major cities', () => {
    const icons: Record<string, string[]> = {
      'Ho Chi Minh City': [
        'independence-palace',
        'war-remnants',
        'cu-chi',
        'ben-thanh',
        'notre-dame-saigon',
      ],
      Hanoi: ['old-quarter', 'hoan-kiem-lake', 'temple-literature', 'thang-long-citadel'],
      'Hoi An': ['hoi-an-lanterns', 'hoi-an-ancient-town', 'japanese-covered-bridge'],
      Hue: ['hue-citadel', 'thien-mu-pagoda'],
      'Da Lat': ['crazy-house', 'xuan-huong-lake'],
      'Nha Trang': ['nha-trang-beach', 'nha-trang-promenade', 'po-nagar', 'long-son-pagoda'],
    }
    const obscure = new Set([
      'egg-coffee',
      'apartment-cafes',
      'mongo-land-dalat',
      'hundred-roofs-bar',
      'chicken-village-kho',
      'hainan-assembly-hall',
      'teochew-assembly-hall',
      'saigon-central-post-office',
      'hcmc-peoples-committee',
      'diep-son-island',
    ])

    for (const [city, mustSee] of Object.entries(icons)) {
      const ranked = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === city))
      expect(ranked.length).toBeGreaterThan(3)
      const topIds = ranked.slice(0, 5).map((e) => e.id)
      expect(
        topIds.some((id) => mustSee.includes(id)),
        `${city} top 5 ${topIds.join(', ')}`,
      ).toBe(true)
      for (const id of ranked.slice(0, 3).map((e) => e.id)) {
        expect(obscure.has(id), `${city} #1–3 includes ${id}`).toBe(false)
        const row = ranked.find((e) => e.id === id)!
        expect(row.reviewCount, `${city} ${id} has too few tourist reviews`).toBeGreaterThan(80)
      }
    }
  })

  it('does not let a 5-star unknown listing beat a city’s high-volume sight', () => {
  const war = scoreSight({
    id: 'war-remnants',
    rating: 4.6,
    reviewCount: 8900,
    durationHours: 2,
    rankCategory: 'museums',
    popularityRank: 18,
  })
  const shrine = scoreSight({
    id: 'secret-alley-shrine',
    rating: 5,
    reviewCount: 28,
    durationHours: 0.5,
    rankCategory: 'urban',
    popularityRank: 1,
  })
  expect(war.totalScore).toBeGreaterThan(shrine.totalScore)
  })

  it('lets landscape uniqueness beat a busier but generic city pin', () => {
    const ranked = rankAndSortSights(
      [
        { id: 'city-beach', rating: 4.4, reviewCount: 31_200, durationHours: 2, rankCategory: 'urban' },
        {
          id: 'karst-bay',
          rating: 4.6,
          reviewCount: 6540,
          durationHours: 6,
          rankCategory: 'nature',
          isAnchor: true,
        },
      ],
      { promoteAnchors: false },
    )
    expect(ranked[0].id).toBe('karst-bay')
  })

  it('ranks Ho Chi Minh City by traveler intent, not Google Maps volume', () => {
    const hcmc = rankCityExperiences(
      SIGHT_CATALOG.filter((e) => e.city === 'Ho Chi Minh City'),
    )
    const topIds = hcmc.slice(0, 5).map((e) => e.id)
    const post = hcmc.find((e) => e.id === 'saigon-central-post-office')

    expect(topIds).not.toContain('saigon-central-post-office')
    expect(topIds).not.toContain('hcmc-peoples-committee')
    expect(topIds).toContain('independence-palace')
    expect(topIds.some((id) => ['independence-palace', 'war-remnants', 'cu-chi', 'ben-thanh'].includes(id))).toBe(
      true,
    )
    expect(post).toBeTruthy()
    expect(post!.cityRank).toBeGreaterThan(8)
  })

  it('does not treat vietnamBest food crawls as world anchors', () => {
    expect(inferSignificanceTier({ vietnamBest: true, signal: 'hidden-gem' })).toBe('NICHE_GEM')
    expect(inferSignificanceTier({ id: 'halong-cruise', vietnamBest: true })).toBe('WORLD_ANCHOR')
  })

  it('maps museums and markets onto distinct ranking categories', () => {
    expect(rankingCategoryFor({ category: 'History', name: 'War Remnants Museum', dna: ['MUSEUM'] })).toBe(
      'museums',
    )
    expect(rankingCategoryFor({ category: 'Food', name: 'Dong Xuan Market', dna: ['MARKET'] })).toBe(
      'markets',
    )
    expect(rankingCategoryFor({ category: 'Nature', name: 'Ha Long Bay', dna: ['UNESCO'] })).toBe('nature')
  })

  it('still exposes duration bands for older tests', () => {
    expect(inferCategoryAnchor(8)).toBe('HIGH_ANCHOR')
    expect(inferCategoryAnchor(0.5)).toBe('QUICK_STOP')
  })
})

describe('tourist vs Google volume', () => {
  it('caps and damps civic Maps volume so a post office cannot beat a museum', () => {
    const postOffice: Sight = {
      id: 'saigon-central-post-office',
      rating: 4.6,
      reviewCount: 22_140,
      durationHours: 0.75,
      popularityRank: 4,
      localReviewBias: true,
    }
    const museum: Sight = {
      id: 'war-remnants',
      rating: 4.6,
      reviewCount: 8900,
      durationHours: 2,
      popularityRank: 13,
    }
    expect(touristReviewCount(postOffice)).toBeLessThan(touristReviewCount(museum))
    expect(touristReviewCount(museum)).toBe(8900)
    expect(scoreSight(museum).totalScore).toBeGreaterThan(scoreSight(postOffice).totalScore)
  })

  it('gives better catalog tourist rank a lift even when Maps counts are similar', () => {
    expect(travelerFame(1)).toBeGreaterThan(travelerFame(12))
    const palace = scoreSight({
      id: 'independence-palace',
      rating: 4.6,
      reviewCount: 3890,
      durationHours: 2,
      popularityRank: 2,
    })
    const photoStop = scoreSight({
      id: 'random-facade',
      rating: 4.6,
      reviewCount: 3890,
      durationHours: 2,
      popularityRank: 22,
    })
    expect(palace.totalScore).toBeGreaterThan(photoStop.totalScore)
  })

  it('flags working post offices and city halls as local-review biased', () => {
    expect(isLocalReviewBiased({ id: 'saigon-central-post-office', name: 'Saigon Central Post Office' })).toBe(
      true,
    )
    expect(isLocalReviewBiased({ id: 'hcmc-peoples-committee', name: 'People’s Committee Hall' })).toBe(true)
    expect(isLocalReviewBiased({ id: 'hospital-cave-cat-ba', name: 'Hospital Cave (Hang Quân Y)' })).toBe(
      false,
    )
    expect(isLocalReviewBiased({ id: 'war-remnants', name: 'War Remnants Museum' })).toBe(false)
  })
})
