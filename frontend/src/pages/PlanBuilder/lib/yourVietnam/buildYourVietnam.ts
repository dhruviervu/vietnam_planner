import { EXPERIENCES } from '../../data/experiences'
import { CITY_ACTIVITIES } from '../../data/activities'
import { HOTELS } from '../../data/hotels'
import { RESTAURANTS } from '../../data/restaurants'
import { SHOPPING_ITEMS } from '../../data/shopping'
import { findLeg, formatDuration } from '../../data/transport'
import { getExperienceImages } from '../pricing'
import { getActivityImages } from '../../data/activities'
import type { Experience, Hotel, Restaurant, TravelStyle, TransportMode } from '../../types'
import type { ExperienceSelectionMeta } from '../../types'
import {
  airportTransfersUrl,
  gettingAroundUrl,
  hotelMapsUrl,
  placeMapsUrl,
  restaurantMapsUrl,
  whereToStayUrl,
  experiencesUrl,
} from './links'
import {
  decideOptionalItems,
  experiencePriority,
  findThinCities,
  buildTripLevelIssues,
  lightDaySuggestions,
} from './tripIntelligence'
import {
  PERIOD_META,
  type CostSummaryBand,
  type DayCosts,
  type DayPeriod,
  type ItineraryItem,
  type LocalTransferHint,
  type PeriodId,
  type RouteStop,
  type TripIssue,
  type YourVietnamDay,
  type YourVietnamTrip,
} from './types'

export type BuildYourVietnamInput = {
  days: number
  startDate: string
  endDate?: string
  travelStyle: TravelStyle
  experienceIds: string[]
  activityIds: string[]
  hotelIds: string[]
  chosenStayId: string | null
  restaurantIds: string[]
  shoppingIds: string[]
  transportChoices: Record<string, TransportMode>
  experienceMeta: Record<string, ExperienceSelectionMeta>
  /** Dismissed issue ids / overridden suggestions */
  dismissedIssueIds?: string[]
  removedItemIds?: string[]
}

function addDaysLabel(iso: string, offset: number) {
  if (!iso) return `Day ${offset + 1}`
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return `Day ${offset + 1}`
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function dateRangeLabel(start: string, days: number) {
  if (!start) return `${days} day${days === 1 ? '' : 's'}`
  const a = new Date(`${start}T12:00:00`)
  if (Number.isNaN(a.getTime())) return `${days} days`
  const b = new Date(a)
  b.setDate(b.getDate() + Math.max(0, days - 1))
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(a)} – ${fmt(b)}`
}

function perDayCapacity(style: TravelStyle) {
  if (style === 'relaxed') return 1
  if (style === 'packed') return 3
  return 2
}

function regionRank(exps: Experience[]) {
  const counts = new Map<string, number>()
  for (const e of exps) counts.set(e.region, (counts.get(e.region) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r)
}

function slotPeriod(
  meta: ExperienceSelectionMeta | undefined,
  fallback: PeriodId,
  exp?: Experience,
): PeriodId {
  const slot = meta?.preferredSlot
  if (slot === 'morning' || slot === 'afternoon' || slot === 'evening') return slot
  if (slot === 'best' && exp) {
    const q = exp.slotQuality
    const best = (
      [
        ['morning', q.morning],
        ['afternoon', q.afternoon],
        ['evening', q.evening],
      ] as const
    ).sort((a, b) => b[1] - a[1])[0]
    return best[0]
  }
  return fallback
}

function costBand(usd: number): string {
  if (usd <= 0) return 'Free / included'
  if (usd < 15) return 'Low'
  if (usd < 40) return 'Low–moderate'
  if (usd < 80) return 'Moderate'
  return 'Higher'
}

function localTransfer(fromLabel: string, toLabel: string, sameCity: boolean): LocalTransferHint {
  if (!sameCity) {
    return {
      mode: 'Ride-hail / taxi',
      icon: '🚕',
      durationLabel: '~20–40 min',
      reason: 'Cross-neighbourhood move — a direct ride is usually the practical choice.',
      selectionState: 'recommended',
      costUsd: 8,
      externalUrl: gettingAroundUrl(),
      accent: 'city-hop',
    }
  }
  // Heuristic: same city → prefer walk for "nearby" framing
  const short =
    fromLabel.toLowerCase().includes('old') && toLabel.toLowerCase().includes('old')
  if (short) {
    return {
      mode: 'Walk',
      icon: '🚶',
      durationLabel: '~8–15 min',
      reason: 'Short enough to walk and better for experiencing the area.',
      selectionState: 'recommended',
      costUsd: 0,
      externalUrl: gettingAroundUrl(),
      accent: 'local',
    }
  }
  return {
    mode: 'Walk or bicycle',
    icon: '🚲',
    durationLabel: '~10–20 min',
    reason: 'Good fit for this distance and area — scooter if you prefer shade and speed.',
    selectionState: 'recommended',
    costUsd: 2,
    externalUrl: gettingAroundUrl(),
    accent: 'local',
  }
}

function emptyCosts(): DayCosts {
  return { stay: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0, total: 0 }
}

function sumCosts(c: DayCosts): DayCosts {
  return {
    ...c,
    total: c.stay + c.food + c.transport + c.experiences + c.shopping + c.other,
  }
}

function themeFromItems(city: string, names: string[]): { theme: string; blurb: string } {
  if (names.length === 0) {
    return {
      theme: `${city} · Open day`,
      blurb: 'Space to wander — nothing locked in yet.',
    }
  }
  if (names.length === 1) {
    return {
      theme: `${city} · ${names[0]}`,
      blurb: `Anchored around ${names[0]}.`,
    }
  }
  const a = names[0]
  const b = names[1]
  return {
    theme: `${city} · ${a} + more`,
    blurb: `${a} leads the day, with ${b} and related stops nearby.`,
  }
}

/**
 * Orchestrates trip bag selections into a day-by-day Your Vietnam plan.
 * Never silently drops user selections — only sequences and annotates.
 */
export function buildYourVietnam(input: BuildYourVietnamInput): YourVietnamTrip {
  const dismissed = new Set(input.dismissedIssueIds ?? [])
  const removed = new Set(input.removedItemIds ?? [])

  const experiences = EXPERIENCES.filter(
    (e) => input.experienceIds.includes(e.id) && !removed.has(`exp:${e.id}`),
  )
  const activities = CITY_ACTIVITIES.filter(
    (a) => input.activityIds.includes(a.id) && !removed.has(`act:${a.id}`),
  )
  const hotels = HOTELS.filter((h) => input.hotelIds.includes(h.id))
  const chosen = input.chosenStayId
    ? HOTELS.find((h) => h.id === input.chosenStayId)
    : undefined
  const restaurants = RESTAURANTS.filter(
    (r) => input.restaurantIds.includes(r.id) && !removed.has(`rest:${r.id}`),
  )
  const shopping = SHOPPING_ITEMS.filter(
    (s) => input.shoppingIds.includes(s.id) && !removed.has(`shop:${s.id}`),
  )

  const isEmpty =
    experiences.length === 0 &&
    activities.length === 0 &&
    restaurants.length === 0 &&
    hotels.length === 0 &&
    shopping.length === 0

  const dayCount = Math.max(1, input.days || Math.max(experiences.length, 3))
  const capacity = perDayCapacity(input.travelStyle)
  const regions = regionRank(experiences)

  // --- Allocate experiences to days (region-clustered, priority-aware) ---
  const ordered = [...experiences].sort((a, b) => {
    const ra = regions.indexOf(a.region)
    const rb = regions.indexOf(b.region)
    if (ra !== rb) return ra - rb
    return experiencePriority(b) - experiencePriority(a)
  })
  const dayExps: Experience[][] = Array.from({ length: dayCount }, () => [])

  for (const exp of ordered) {
    let placed = false
    // Prefer same-region days still under capacity
    for (let i = 0; i < dayCount; i++) {
      const bucket = dayExps[i]
      if (bucket.length >= capacity) continue
      if (bucket.length === 0 || bucket[0].region === exp.region) {
        bucket.push(exp)
        placed = true
        break
      }
    }
    if (placed) continue
    // Same-region day even if over capacity (we'll mark optional later)
    let sameRegionIdx = dayExps.findIndex(
      (bucket) => bucket.length > 0 && bucket[0].region === exp.region,
    )
    if (sameRegionIdx < 0) {
      sameRegionIdx = dayExps.findIndex((bucket) => bucket.length === 0)
    }
    if (sameRegionIdx < 0) {
      // Least-loaded day
      sameRegionIdx = dayExps.reduce(
        (best, bucket, idx, arr) => (bucket.length < arr[best].length ? idx : best),
        0,
      )
    }
    dayExps[sameRegionIdx].push(exp)
  }

  // Activities: attach to days matching city/region; prefer underfilled days
  const dayActs: (typeof activities)[] = Array.from({ length: dayCount }, () => [])
  for (const act of activities) {
    let idx = dayExps.findIndex((bucket) =>
      bucket.some(
        (e) =>
          e.region === act.cityName ||
          e.city === act.cityName ||
          e.region.includes(act.cityName.split(' ')[0]),
      ),
    )
    if (idx < 0) {
      idx = dayExps.findIndex((bucket) => bucket.length < capacity)
    }
    if (idx < 0) {
      idx = dayActs.reduce(
        (best, bucket, i, arr) =>
          bucket.length + dayExps[i].length < arr[best].length + dayExps[best].length
            ? i
            : best,
        0,
      )
    }
    dayActs[idx].push(act)
  }

  let lastRegion = regions[0] ?? hotels[0]?.region ?? activities[0]?.cityName ?? 'Hanoi'
  const usedRestaurantIds = new Set<string>()
  const usedShopIds = new Set<string>()
  let packedDayCount = 0
  let optionalItemCount = 0
  const emptyDayNumbers: number[] = []
  const selectedExpIdSet = new Set(experiences.map((e) => e.id))

  const days: YourVietnamDay[] = dayExps.map((exps, i) => {
    const acts = dayActs[i]
    const region =
      exps[0]?.region ??
      acts[0]?.cityName ??
      lastRegion
    const city = exps[0]?.city ?? acts[0]?.cityName ?? region
    lastRegion = region

    const hotel: Hotel | undefined =
      (chosen && chosen.region === region ? chosen : undefined) ??
      hotels.find((h) => h.region === region) ??
      hotels[0]

    const regionRestaurants = restaurants.filter((r) => r.region === region)
    const lunch =
      regionRestaurants.find((r) => !usedRestaurantIds.has(r.id)) ?? regionRestaurants[0]
    const dinner =
      regionRestaurants.find((r) => r.id !== lunch?.id && !usedRestaurantIds.has(r.id)) ??
      regionRestaurants.find((r) => r.id !== lunch?.id) ??
      lunch
    if (lunch) usedRestaurantIds.add(lunch.id)
    if (dinner) usedRestaurantIds.add(dinner.id)

    const shop =
      shopping.find(
        (s) =>
          !usedShopIds.has(s.id) &&
          (s.city === city || s.region === region || s.region === city),
      ) ?? shopping.find((s) => s.region === region && !usedShopIds.has(s.id))
    if (shop) usedShopIds.add(shop.id)

    const periodItems: Record<PeriodId, ItineraryItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    }

    const dayIssues: TripIssue[] = []
    const stayGap = !hotel
    if (stayGap && (exps.length > 0 || acts.length > 0)) {
      const issue: TripIssue = {
        id: `stay-gap-${i}`,
        severity: 'warn',
        scope: 'day',
        title: 'Stay not set',
        detail: `Activities in ${city} have no accommodation selected yet.`,
        dayNumber: i + 1,
        actionLabel: 'Explore stays',
        href: whereToStayUrl(),
      }
      if (!dismissed.has(issue.id)) {
        dayIssues.push(issue)
      }
    }

    const actHours = acts.reduce((s) => s + 2.5, 0)
    const optionalMap = decideOptionalItems(exps, actHours, capacity, input.travelStyle)
    optionalItemCount += optionalMap.size

    // Check-in on first day in this region sequence
    const prevRegion = i > 0 ? (dayExps[i - 1][0]?.region ?? dayActs[i - 1][0]?.cityName) : null
    const isArrival = !prevRegion || prevRegion !== region
    if (hotel && isArrival) {
      periodItems.afternoon.unshift({
        id: `checkin-${hotel.id}-${i}`,
        kind: 'check-in',
        name: `Check-in · ${hotel.name}`,
        selectionState: 'selected',
        period: 'afternoon',
        timeLabel: 'Afternoon · typical',
        durationLabel: '~30 min',
        locationLabel: hotel.neighborhood,
        city: hotel.city,
        region: hotel.region,
        description: hotel.blurb,
        costUsd: 0,
        icon: '🏨',
        mapsUrl: hotelMapsUrl(hotel),
        externalUrl: hotel.sourceUrl,
        externalLabel: 'View stay ↗',
        tags: ['Check-in'],
        sourceId: hotel.id,
      })
    }

    // Experiences into periods
    const fallbacks: PeriodId[] = ['morning', 'afternoon', 'evening']
    exps.forEach((exp, ei) => {
      const period = slotPeriod(input.experienceMeta[exp.id], fallbacks[ei % fallbacks.length], exp)
      const images = getExperienceImages(exp)
      const optional = optionalMap.get(exp.id)
      periodItems[period].push({
        id: `exp:${exp.id}`,
        kind: 'experience',
        name: exp.name,
        selectionState: optional ? 'optional' : 'selected',
        period,
        timeLabel: period === 'morning' ? 'Morning' : period === 'afternoon' ? 'Afternoon' : 'Evening',
        durationLabel: exp.durationLabel,
        locationLabel: exp.city,
        city: exp.city,
        region: exp.region,
        description: exp.hook,
        costUsd: exp.costUsd,
        costBand: costBand(exp.costUsd),
        icon: exp.signalEmoji || '✨',
        thumb: images[0],
        mapsUrl: placeMapsUrl(exp.name, exp.city),
        tags: optional
          ? ['Optional', exp.popularityTag, exp.category]
          : [exp.popularityTag, exp.category],
        reason: optional?.reason,
        sourceId: exp.id,
      })
    })

    // Activities — mark optional if day already overloaded by experiences
    const expHoursCore = exps
      .filter((e) => !optionalMap.has(e.id))
      .reduce((s, e) => s + (e.durationHours || 2.5), 0)
    for (const act of acts) {
      const period: PeriodId =
        act.kind === 'music' || act.kind === 'dance' || act.kind === 'beach'
          ? 'evening'
          : act.kind === 'class' || act.kind === 'workshop'
            ? 'morning'
            : 'afternoon'
      const dayAlreadyFull =
        optionalMap.size > 0 || expHoursCore + actHours > hourBudgetForStyle(input.travelStyle)
      const makeOptional = dayAlreadyFull && exps.length >= capacity
      if (makeOptional) optionalItemCount += 1
      periodItems[period].push({
        id: `act:${act.id}`,
        kind: 'activity',
        name: act.name,
        selectionState: makeOptional ? 'optional' : 'selected',
        period,
        timeLabel: PERIOD_META[period].label,
        durationLabel: act.durationLabel,
        locationLabel: act.cityName,
        city: act.cityName,
        region: act.cityName,
        description: act.hook,
        costUsd: act.priceFromUsd ?? 0,
        costBand: act.priceLabel,
        icon: act.signalEmoji,
        thumb: getActivityImages(act)[0],
        mapsUrl: placeMapsUrl(act.name, act.cityName),
        tags: makeOptional
          ? ['Optional', act.popularityTag, act.kindLabel]
          : [act.popularityTag, act.kindLabel],
        reason: makeOptional
          ? `This day is already full with experiences. We kept ${act.name} — do it only if you still have energy.`
          : 'Selected as a hands-on activity — we fit this beside your experiences.',
        sourceId: act.id,
      })
    }

    // Meals
    if (lunch) {
      periodItems.afternoon.unshift(mealItem(lunch, 'afternoon', 'Lunch'))
    }
    if (dinner && dinner.id !== lunch?.id) {
      periodItems.evening.push(mealItem(dinner, 'evening', 'Dinner'))
    } else if (dinner && !lunch) {
      periodItems.evening.push(mealItem(dinner, 'evening', 'Dinner'))
    }

    if (shop) {
      const period = shop.preferredPeriod ?? 'afternoon'
      const timeLabel =
        period === 'morning' ? 'Morning' : period === 'evening' ? 'Evening' : 'Afternoon'
      periodItems[period].push({
        id: `shop:${shop.id}`,
        kind: 'shopping',
        name: shop.name,
        selectionState: 'selected',
        period,
        timeLabel,
        durationLabel: '~1–2 hr',
        locationLabel: shop.city,
        city: shop.city,
        region: shop.region,
        description: shop.blurb,
        costUsd: shop.costUsd,
        costBand: shop.costLabel,
        icon: '🛍',
        mapsUrl: placeMapsUrl(shop.shop || shop.name, shop.city),
        tags: ['Shopping', shop.type],
        reason: `Scheduled in ${shop.city} for the ${period} — when this stop usually works best.`,
        sourceId: shop.id,
      })
    }

    // Stay overnight anchor
    if (hotel) {
      periodItems.night.push({
        id: `stay:${hotel.id}:${i}`,
        kind: 'stay',
        name: hotel.name,
        selectionState: 'selected',
        period: 'night',
        timeLabel: 'Overnight',
        locationLabel: hotel.neighborhood,
        city: hotel.city,
        region: hotel.region,
        description: hotel.blurb,
        costUsd: hotel.pricePerNight,
        costBand: costBand(hotel.pricePerNight),
        icon: '🏨',
        mapsUrl: hotelMapsUrl(hotel),
        externalUrl: hotel.sourceUrl,
        externalLabel: 'View stay ↗',
        tags: ['Stay'],
        sourceId: hotel.id,
      })

      if ((hotel.locationScore ?? 4) <= 2 && exps.length >= 2) {
        const issue: TripIssue = {
          id: `stay-friction-${i}`,
          severity: 'warn',
          scope: 'day',
          title: 'Your stay may add friction',
          detail: `${hotel.name} may sit farther from today's activity cluster — possible mismatch, not a certainty.`,
          dayNumber: i + 1,
          actionLabel: 'Explore stays',
          href: whereToStayUrl(),
        }
        if (!dismissed.has(issue.id)) {
          dayIssues.push(issue)
        }
      }
    }

    // Wire local transfers between consecutive items across periods
    const flatOrder: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
    const flat: ItineraryItem[] = flatOrder.flatMap((p) => periodItems[p])
    for (let j = 0; j < flat.length - 1; j++) {
      const cur = flat[j]
      const next = flat[j + 1]
      if (cur.kind === 'local-transfer' || next.kind === 'check-in') continue
      if (cur.kind === 'stay' || cur.kind === 'check-out') continue
      if (['experience', 'activity', 'meal', 'shopping', 'check-in'].includes(cur.kind)) {
        cur.transferAfter = localTransfer(
          cur.locationLabel || cur.name,
          next.locationLabel || next.name,
          cur.city === next.city || cur.region === next.region,
        )
      }
    }

    // Load detection — day cards only (not the top trip check)
    const activeHours = [...exps, ...acts].reduce((s, x) => {
      if ('durationHours' in x && typeof x.durationHours === 'number') return s + x.durationHours
      return s + 2.5
    }, 0)
    if (activeHours >= 9 || optionalMap.size > 0) {
      packedDayCount += 1
      const issue: TripIssue = {
        id: `overload-${i}`,
        severity: 'warn',
        scope: 'day',
        title: 'This day is tight',
        detail:
          optionalMap.size > 0
            ? `Optional items are marked below — keep them if you feel like it on the day.`
            : `Selected activities add up to roughly ${Math.round(activeHours)} hours before travel.`,
        dayNumber: i + 1,
      }
      if (!dismissed.has(issue.id)) {
        dayIssues.push(issue)
      }
    }

    if (exps.length === 0 && acts.length === 0) {
      emptyDayNumbers.push(i + 1)
      const suggestions = lightDaySuggestions(region, selectedExpIdSet, 2)
      if (suggestions.length > 0) {
        const issue: TripIssue = {
          id: `empty-day-${i}`,
          severity: 'info',
          scope: 'day',
          title: 'Open day',
          detail: 'Nothing locked in yet — rest is fine, or add a must-do if you want structure.',
          dayNumber: i + 1,
          actionLabel: 'Browse experiences',
          href: experiencesUrl(),
          suggestions: suggestions.map((s) => ({
            id: s.id,
            name: s.name,
            tag: s.tag,
            reason: s.reason,
          })),
        }
        if (!dismissed.has(issue.id)) dayIssues.push(issue)
      }
    }

    // City transfer out — only treat as “set” when the traveller confirmed a mode
    let cityTransferOut: YourVietnamDay['cityTransferOut']
    const nextExps = dayExps[i + 1]
    const nextActs = dayActs[i + 1]
    const nextRegion = nextExps?.[0]?.region ?? nextActs?.[0]?.cityName
    if (nextRegion && nextRegion !== region) {
      const toCity = nextExps?.[0]?.city ?? nextActs?.[0]?.cityName ?? nextRegion
      const leg = findLeg(region, nextRegion)
      const chosenMode = leg ? input.transportChoices[leg.id] : undefined
      const option = chosenMode
        ? leg?.options.find((o) => o.mode === chosenMode)
        : undefined

      if (leg && option && chosenMode) {
        cityTransferOut = {
          toCity,
          toRegion: nextRegion,
          modeLabel: option.label,
          icon: option.icon,
          durationLabel: formatDuration(option.durationMinutes),
          costUsd: option.costUsd,
          reason: `${option.status} · your chosen mode for this hop.`,
          externalUrl: gettingAroundUrl(),
          unset: false,
        }
      } else {
        cityTransferOut = {
          toCity,
          toRegion: nextRegion,
          modeLabel: 'City transfer not set',
          icon: '🚐',
          durationLabel: 'Choose a mode',
          costUsd: 0,
          reason: `You’re moving from ${city} to ${toCity} — pick how you’ll travel in Getting Around.`,
          externalUrl: gettingAroundUrl(),
          unset: true,
        }
      }

      if (hotel) {
        periodItems.morning.unshift({
          id: `checkout-${hotel.id}-${i}`,
          kind: 'check-out',
          name: `Check-out · ${hotel.name}`,
          selectionState: 'system',
          period: 'morning',
          timeLabel: 'Before departure',
          locationLabel: hotel.neighborhood,
          city: hotel.city,
          region: hotel.region,
          costUsd: 0,
          icon: '🧳',
          reason: 'System-added so your city change has a clear start.',
          tags: ['Check-out'],
          sourceId: hotel.id,
        })
      }

      if (cityTransferOut.unset) {
        const issue: TripIssue = {
          id: `city-transfer-unset-${i}`,
          severity: 'warn',
          scope: 'day',
          title: 'City transfer not set',
          detail: `Next stop is ${cityTransferOut.toCity} — choose a travel mode for this hop.`,
          dayNumber: i + 1,
          actionLabel: 'Set transfer',
          href: gettingAroundUrl(),
        }
        if (!dismissed.has(issue.id)) dayIssues.push(issue)
      }
    }

    // First day airport arrival hint
    if (i === 0 && (exps.length > 0 || acts.length > 0 || hotel)) {
      periodItems.morning.unshift({
        id: `airport-in-${i}`,
        kind: 'airport-transfer',
        name: 'Arrival into Vietnam',
        selectionState: 'recommended',
        period: 'morning',
        timeLabel: 'On arrival',
        durationLabel: '~35–60 min typical',
        locationLabel: city,
        city,
        region,
        description: 'Airport → city transfer once you land.',
        costUsd: 18,
        costBand: 'Typical range',
        icon: '✈️',
        reason: 'Getting into Vietnam — recommended so day one starts smoothly.',
        externalUrl: airportTransfersUrl(),
        externalLabel: 'View airport options ↗',
        tags: ['Arrival', 'Airport'],
        transferAccent: 'arrival',
      })
    }

    // Last day — leaving Vietnam
    if (i === dayCount - 1 && (exps.length > 0 || acts.length > 0 || hotel || !isEmpty)) {
      periodItems.evening.push({
        id: `airport-out-${i}`,
        kind: 'airport-transfer',
        name: 'Leaving Vietnam',
        selectionState: 'recommended',
        period: 'evening',
        timeLabel: 'Before your flight',
        durationLabel: '~35–60 min typical',
        locationLabel: city,
        city,
        region,
        description: 'City → airport transfer for your departure.',
        costUsd: 18,
        costBand: 'Typical range',
        icon: '🛫',
        reason: 'Leaving Vietnam — build buffer for traffic and check-in.',
        externalUrl: airportTransfersUrl(),
        externalLabel: 'View airport options ↗',
        tags: ['Departure', 'Airport'],
        transferAccent: 'departure',
      })
    }

    const periods: DayPeriod[] = (['morning', 'afternoon', 'evening', 'night'] as PeriodId[]).map(
      (pid) => {
        const items = periodItems[pid]
        const meta = PERIOD_META[pid]
        if (items.length === 0) {
          return {
            id: pid,
            label: meta.label,
            windowLabel: meta.windowLabel,
            items: [],
            openNote:
              pid === 'night'
                ? 'See experiences'
                : 'See experiences',
          }
        }
        return {
          id: pid,
          label: meta.label,
          windowLabel: meta.windowLabel,
          items,
        }
      },
    )

    const names = [...exps.map((e) => e.name), ...acts.map((a) => a.name)]
    const { theme, blurb } = themeFromItems(city, names)

    let costs = emptyCosts()
    for (const p of periods) {
      for (const item of p.items) {
        if (item.kind === 'experience' || item.kind === 'activity') costs.experiences += item.costUsd
        else if (item.kind === 'meal') costs.food += item.costUsd
        else if (item.kind === 'stay') costs.stay += item.costUsd
        else if (item.kind === 'shopping') costs.shopping += item.costUsd
        else if (
          item.kind === 'local-transfer' ||
          item.kind === 'city-transfer' ||
          item.kind === 'airport-transfer'
        )
          costs.transport += item.costUsd
        if (item.transferAfter) costs.transport += item.transferAfter.costUsd
      }
    }
    if (cityTransferOut) costs.transport += cityTransferOut.costUsd
    costs = sumCosts(costs)

    const banner =
      exps[0] ? getExperienceImages(exps[0])[0] : acts[0] ? getActivityImages(acts[0])[0] : undefined

    return {
      day: i + 1,
      dateLabel: addDaysLabel(input.startDate, i),
      city,
      region,
      theme,
      blurb,
      nightsHere: 1,
      experienceCount: exps.length + acts.length,
      foodCount: [lunch, dinner].filter(Boolean).length,
      transferCount: cityTransferOut ? 1 : 0,
      periods,
      costs,
      issues: dayIssues,
      hotelName: hotel?.name,
      hotelId: hotel?.id,
      stayGap,
      cityTransferOut,
      bannerImage: banner,
    }
  })

  // Nights per city on route
  const route: RouteStop[] = []
  for (const d of days) {
    const last = route[route.length - 1]
    if (last && last.region === d.region) {
      last.nights += 1
      last.experiences += d.experienceCount
    } else {
      route.push({
        city: d.city,
        region: d.region,
        nights: 1,
        experiences: d.experienceCount,
        kind: 'stay',
      })
    }
  }

  const hasNoStays = hotels.length === 0 && !isEmpty
  const thinCities = findThinCities(
    route,
    experiences.map((e) => e.id),
    input.travelStyle,
  )
  const unsetCityTransfers = days
    .filter((d) => d.cityTransferOut?.unset)
    .map((d) => ({
      from: d.city,
      to: d.cityTransferOut!.toCity,
      dayNumber: d.day,
    }))

  const issues = buildTripLevelIssues({
    isEmpty,
    hasNoStays,
    hotelsCount: hotels.length,
    thinCities,
    packedDayCount,
    emptyDayNumbers,
    optionalItemCount,
    unsetCityTransfers,
    dismissed,
  })

  const cat = days.reduce(
    (a, d) => ({
      accommodation: a.accommodation + d.costs.stay,
      food: a.food + d.costs.food,
      transport: a.transport + d.costs.transport,
      experiences: a.experiences + d.costs.experiences,
      shopping: a.shopping + d.costs.shopping,
      other: a.other + d.costs.other,
    }),
    { accommodation: 0, food: 0, transport: 0, experiences: 0, shopping: 0, other: 0 },
  )
  const mid = Object.values(cat).reduce((s, n) => s + n, 0)
  const cost: CostSummaryBand = {
    low: Math.round(mid * 0.88),
    mid: Math.round(mid),
    high: Math.round(mid * 1.18),
    categories: cat,
  }

  const transferCount = days.filter((d) => d.cityTransferOut).length

  return {
    title: 'Your Vietnam',
    generatedAt: new Date().toISOString(),
    daysCount: days.length,
    cityCount: route.length,
    experienceCount: experiences.length,
    activityCount: activities.length,
    foodCount: restaurants.length,
    stayCount: hotels.length,
    transferCount,
    travellersLabel: 'Your group',
    dateRangeLabel: dateRangeLabel(input.startDate, dayCount),
    route,
    days,
    cost,
    issues,
    isEmpty,
    hasNoStays,
  }
}

function hourBudgetForStyle(style: TravelStyle) {
  if (style === 'relaxed') return 5
  if (style === 'packed') return 10
  return 7.5
}

function mealItem(r: Restaurant, period: PeriodId, mealLabel: string): ItineraryItem {
  return {
    id: `rest:${r.id}:${mealLabel}`,
    kind: 'meal',
    name: `${mealLabel} · ${r.name}`,
    selectionState: 'selected',
    period,
    timeLabel: mealLabel === 'Lunch' ? 'Around midday' : 'Evening meal',
    durationLabel: '~45–75 min',
    locationLabel: r.city,
    city: r.city,
    region: r.region,
    description: r.blurb,
    costUsd: r.priceUsd,
    costBand: r.priceLabel,
    icon: '🍜',
    mapsUrl: restaurantMapsUrl(r.name, r.city),
    externalLabel: 'Open in Google Maps ↗',
    tags: ['Food', 'Selected', r.cuisine],
    sourceId: r.id,
  }
}
