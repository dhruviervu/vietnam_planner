import type { ScoredHotel } from './stayRecommendationEngine'

export type StayRecommendation = {
  hotel: ScoredHotel
  reasons: string[]
  summary: string
}

/** Pick a clear winner with evidence-based reasons (advisory only). */
export function recommendFromComparison(hotels: ScoredHotel[]): StayRecommendation | null {
  if (hotels.length < 2) return null

  const scored = hotels.map((h) => {
    const proximityBoost =
      h.nearbyCount > 0 ? Math.max(0, 12 - h.avgDistanceKm * 3) + h.nearbyCount * 2 : 0
    const valueBoost = Math.max(0, 20 - h.pricePerNight / 8)
    const composite =
      h.tripFit * 0.5 +
      h.rating * 6 +
      proximityBoost +
      valueBoost +
      (h.transportScore ?? 0) * 2 +
      (h.foodAccessScore ?? 0) * 2 +
      h.efficiency * 0.08
    return { h, composite }
  })

  scored.sort((a, b) => b.composite - a.composite)
  const top = scored[0]
  const second = scored[1]
  if (!top) return null

  // Require a meaningful edge, else still recommend top but note soft lead
  const hotel = top.h
  const reasons: string[] = []

  const bestFit = Math.max(...hotels.map((x) => x.tripFit))
  if (hotel.tripFit === bestFit) {
    reasons.push(`${hotel.tripFit}% trip fit — strongest match to your current plan`)
  }

  const withNearby = hotels.filter((x) => x.nearbyCount > 0)
  if (withNearby.length && hotel.nearbyCount > 0) {
    const closest = Math.min(...withNearby.map((x) => x.avgDistanceKm))
    if (hotel.avgDistanceKm === closest) {
      reasons.push(
        `Closest on average (${hotel.avgDistanceKm} km) to ${hotel.nearbyCount} selected experience${hotel.nearbyCount === 1 ? '' : 's'}`,
      )
    } else if (hotel.nearbyCount === Math.max(...hotels.map((x) => x.nearbyCount))) {
      reasons.push(`Near ${hotel.nearbyCount} of your Trip Bag places in ${hotel.region}`)
    }
  }

  const cheapest = Math.min(...hotels.map((x) => x.pricePerNight))
  if (hotel.pricePerNight === cheapest) {
    reasons.push(`Best nightly value at $${hotel.pricePerNight}`)
  } else if (hotel.pricePerNight <= cheapest * 1.15 && hotel.tripFit >= bestFit - 3) {
    reasons.push(`Strong value for your current stay at $${hotel.pricePerNight}/night`)
  }

  if (
    (hotel.foodAccessScore ?? 0) >= 4 &&
    (hotel.transportScore ?? 0) >= 4
  ) {
    reasons.push('Excellent food + transport access for day-to-day ease')
  } else if ((hotel.foodAccessScore ?? 0) >= Math.max(...hotels.map((x) => x.foodAccessScore ?? 0))) {
    reasons.push('Best food access among these options')
  }

  const topRated = Math.max(...hotels.map((x) => x.rating))
  if (hotel.rating === topRated && hotel.rating >= 4.5) {
    reasons.push(`Highest guest rating (⭐ ${hotel.rating})`)
  }

  const unique = [...new Set(reasons)].slice(0, 4)
  if (unique.length < 2) {
    unique.push(hotel.valueNote)
    unique.push(`${hotel.efficiency}% trip efficiency for your current plan`)
  }

  const soft = second && top.composite - second.composite < 3
  const summary = soft
    ? 'A slight edge overall — still weigh the tradeoffs below before you decide.'
    : 'Strongest overall balance of location, proximity to your experiences, cost and convenience for your current trip.'

  return { hotel, reasons: unique.slice(0, 4), summary }
}

export function meaningfulWinners(hotels: ScoredHotel[]) {
  if (hotels.length < 2) {
    return { bestFit: null as string | null, bestValue: null as string | null, closest: null as string | null, highestRated: null as string | null }
  }
  const bestFitScore = Math.max(...hotels.map((h) => h.tripFit))
  const fitLeaders = hotels.filter((h) => h.tripFit === bestFitScore)
  const bestFit =
    fitLeaders.length === 1 &&
    fitLeaders[0] &&
    bestFitScore -
      Math.max(
        ...hotels.filter((h) => h.id !== fitLeaders[0]!.id).map((h) => h.tripFit),
        0,
      ) >=
      2
      ? fitLeaders[0].id
      : fitLeaders.length === 1
        ? fitLeaders[0]!.id
        : null

  const minPrice = Math.min(...hotels.map((h) => h.pricePerNight))
  const valueLeaders = hotels.filter((h) => h.pricePerNight === minPrice)
  const nextPrices = hotels.filter((h) => h.pricePerNight > minPrice).map((h) => h.pricePerNight)
  const nextPrice = nextPrices.length ? Math.min(...nextPrices) : minPrice
  const bestValue =
    valueLeaders.length === 1 && valueLeaders[0] && nextPrice - minPrice >= 8
      ? valueLeaders[0].id
      : null

  const withNear = hotels.filter((h) => h.nearbyCount > 0)
  let closest: string | null = null
  if (withNear.length >= 2) {
    const minKm = Math.min(...withNear.map((h) => h.avgDistanceKm))
    const leaders = withNear.filter((h) => h.avgDistanceKm === minKm)
    const farther = withNear.filter((h) => h.avgDistanceKm > minKm).map((h) => h.avgDistanceKm)
    const nextKm = farther.length ? Math.min(...farther) : minKm
    if (leaders.length === 1 && leaders[0] && nextKm - minKm >= 0.4) closest = leaders[0].id
  }

  const topRating = Math.max(...hotels.map((h) => h.rating))
  const ratingLeaders = hotels.filter((h) => h.rating === topRating)
  const lower = hotels.filter((h) => h.rating < topRating).map((h) => h.rating)
  const nextRating = lower.length ? Math.max(...lower) : 0
  const highestRated =
    ratingLeaders.length === 1 && ratingLeaders[0] && topRating - nextRating >= 0.2
      ? ratingLeaders[0].id
      : null

  return { bestFit, bestValue, closest, highestRated }
}

export type SimilarStayReason = {
  hotel: ScoredHotel
  reason: string
}

export function findSimilarStays(
  comparing: ScoredHotel[],
  pool: ScoredHotel[],
  limit = 4,
): SimilarStayReason[] {
  if (comparing.length === 0) return []
  const ids = new Set(comparing.map((h) => h.id))
  const regions = new Set(comparing.map((h) => h.region))
  const avgPrice =
    comparing.reduce((s, h) => s + h.pricePerNight, 0) / Math.max(1, comparing.length)
  const styles = new Set(comparing.flatMap((h) => h.styleTags ?? []))

  const scored = pool
    .filter((h) => !ids.has(h.id) && regions.has(h.region))
    .map((h) => {
      const priceDelta = Math.abs(h.pricePerNight - avgPrice)
      const styleHit = (h.styleTags ?? []).some((t) => styles.has(t))
      const score =
        (priceDelta < 25 ? 30 : priceDelta < 50 ? 15 : 0) +
        (styleHit ? 20 : 0) +
        h.tripFit * 0.35 +
        h.rating * 4 +
        (h.nearbyCount > 0 ? 10 : 0)
      let reason = 'Similar location and trip context.'
      if (priceDelta <= 15 && h.avgDistanceKm < (comparing[0]?.avgDistanceKm ?? 99)) {
        reason = 'Similar price, closer to your experiences.'
      } else if (h.rating >= Math.max(...comparing.map((c) => c.rating)) && priceDelta <= 20) {
        reason = 'Higher rating at a similar nightly cost.'
      } else if (h.styleTags?.includes('quiet') && styles.has('central')) {
        reason = 'Quieter location with comparable trip fit.'
      } else if (h.pricePerNight < avgPrice - 10) {
        reason = 'Lower cost, with a tradeoff on location or amenities.'
      } else if (styleHit) {
        reason = 'Similar stay style in the same area.'
      }
      return { hotel: h, reason, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map(({ hotel, reason }) => ({ hotel, reason }))
}
