import { EXPERIENCES } from '../data/experiences'
import { HOTELS } from '../data/hotels'
import { RESTAURANTS } from '../data/restaurants'
import { SHOPPING_ITEMS } from '../data/shopping'
import { findLeg, formatDuration } from '../data/transport'
import type {
  CostTotals,
  Experience,
  ItineraryDay,
  TransportMode,
  TravelStyle,
} from '../types'

type BuildInput = {
  days: number
  startDate: string
  travelStyle: TravelStyle
  experienceIds: string[]
  hotelIds: string[]
  restaurantIds: string[]
  shoppingIds: string[]
  transportChoices: Record<string, TransportMode>
}

function addDays(iso: string, offset: number) {
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

function regionOrder(experiences: Experience[]) {
  const counts = new Map<string, number>()
  for (const e of experiences) {
    counts.set(e.region, (counts.get(e.region) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([region]) => region)
}

function activitiesPerDay(style: TravelStyle) {
  if (style === 'relaxed') return 1
  if (style === 'packed') return 3
  return 2
}

export function buildItinerary(input: BuildInput): {
  days: ItineraryDay[]
  totals: CostTotals
} {
  const selected = EXPERIENCES.filter((e) => input.experienceIds.includes(e.id))
  const hotels = HOTELS.filter((h) => input.hotelIds.includes(h.id))
  const restaurants = RESTAURANTS.filter((r) => input.restaurantIds.includes(r.id))
  const shopping = SHOPPING_ITEMS.filter((s) => input.shoppingIds.includes(s.id))

  const dayCount = Math.max(1, input.days || selected.length || 3)
  const perDay = activitiesPerDay(input.travelStyle)
  const regions = regionOrder(selected)
  const ordered = [...selected].sort(
    (a, b) => regions.indexOf(a.region) - regions.indexOf(b.region),
  )

  const chunks: Experience[][] = Array.from({ length: dayCount }, () => [])
  let cursor = 0
  for (const exp of ordered) {
    // place into earliest day under capacity, preferring same-region clustering
    let placed = false
    for (let i = 0; i < dayCount; i++) {
      const day = chunks[i]
      if (day.length >= perDay) continue
      if (day.length === 0 || day[0].region === exp.region) {
        day.push(exp)
        placed = true
        break
      }
    }
    if (!placed) {
      chunks[Math.min(cursor, dayCount - 1)].push(exp)
      cursor = (cursor + 1) % dayCount
    }
  }

  // ensure empty days inherit a region from neighbors for stay/meals
  let lastRegion = regions[0] ?? 'Hanoi'
  const days: ItineraryDay[] = chunks.map((exps, i) => {
    const region = exps[0]?.region ?? lastRegion
    lastRegion = region
    const hotel =
      hotels.find((h) => h.region === region) ?? hotels[0]
    const dayRestaurants = restaurants.filter((r) => r.region === region)
    const lunch = dayRestaurants[0]
    const dinner = dayRestaurants[1] ?? dayRestaurants[0]
    const dayCity = exps[0]?.city ?? region
    const matchingShops = shopping.filter(
      (s) => s.region === region || s.city === region || s.city === dayCity,
    )
    const shop = matchingShops[i % Math.max(1, matchingShops.length)] ?? matchingShops[0]

    const blocks = []
    let hour = 9

    blocks.push({
      kind: 'meal' as const,
      id: `breakfast-${i}`,
      time: '08:00',
      title: 'Breakfast',
      subtitle: 'Local café near your stay',
      costUsd: 6,
      icon: '☕',
    })

    for (const exp of exps) {
      const time = `${String(hour).padStart(2, '0')}:00`
      blocks.push({
        kind: 'activity' as const,
        id: exp.id,
        time,
        title: exp.name,
        subtitle: `${exp.city} · ${exp.category}`,
        durationLabel: exp.durationLabel,
        costUsd: exp.costUsd,
        icon: '✨',
      })
      hour += Math.max(2, Math.round(exp.durationHours))
      if (hour >= 13 && lunch && !blocks.some((b) => b.id === lunch.id)) {
        blocks.push({
          kind: 'meal' as const,
          id: lunch.id,
          time: '13:00',
          title: lunch.name,
          subtitle: `${lunch.cuisine} · ${lunch.priceLabel}`,
          costUsd: lunch.priceUsd,
          icon: '🍜',
        })
        hour = Math.max(hour, 14)
      }
    }

    if (lunch && !blocks.some((b) => b.kind === 'meal' && b.id === lunch.id)) {
      blocks.push({
        kind: 'meal' as const,
        id: lunch.id,
        time: '13:00',
        title: lunch.name,
        subtitle: lunch.cuisine,
        costUsd: lunch.priceUsd,
        icon: '🍜',
      })
    }

    if (shop) {
      const period = shop.preferredPeriod ?? 'afternoon'
      const time =
        period === 'morning' ? '10:30' : period === 'evening' ? '18:30' : '16:00'
      blocks.push({
        kind: 'shopping' as const,
        id: shop.id,
        time,
        title: shop.name,
        subtitle: shop.shop,
        costUsd: shop.costUsd,
        icon: '🛍',
      })
    }

    if (dinner) {
      blocks.push({
        kind: 'meal' as const,
        id: `${dinner.id}-dinner`,
        time: '19:30',
        title: dinner.name,
        subtitle: `Dinner · ${dinner.cuisine}`,
        costUsd: dinner.priceUsd,
        icon: '🍽',
      })
    }

    if (hotel) {
      blocks.push({
        kind: 'stay' as const,
        id: hotel.id,
        time: '21:00',
        title: hotel.name,
        subtitle: hotel.neighborhood,
        costUsd: hotel.pricePerNight,
        icon: '🏨',
      })
    }

    // transport into next day if region changes
    const next = chunks[i + 1]
    const nextRegion = next?.[0]?.region
    if (nextRegion && nextRegion !== region) {
      const leg = findLeg(region, nextRegion)
      if (leg) {
        const mode = input.transportChoices[leg.id] ?? leg.options[0]?.mode
        const option = leg.options.find((o) => o.mode === mode) ?? leg.options[0]
        if (option) {
          blocks.push({
            kind: 'transport' as const,
            id: leg.id,
            time: 'Evening / next morning',
            title: `${option.icon} ${region} → ${nextRegion}`,
            subtitle: `${option.label} · ${formatDuration(option.durationMinutes)}`,
            costUsd: option.costUsd,
            icon: option.icon,
          })
        }
      }
    }

    const costs = {
      activities: blocks.filter((b) => b.kind === 'activity').reduce((s, b) => s + b.costUsd, 0),
      food: blocks.filter((b) => b.kind === 'meal').reduce((s, b) => s + b.costUsd, 0),
      stay: blocks.filter((b) => b.kind === 'stay').reduce((s, b) => s + b.costUsd, 0),
      transport: blocks.filter((b) => b.kind === 'transport').reduce((s, b) => s + b.costUsd, 0),
      shopping: blocks.filter((b) => b.kind === 'shopping').reduce((s, b) => s + b.costUsd, 0),
      total: 0,
    }
    costs.total =
      costs.activities + costs.food + costs.stay + costs.transport + costs.shopping

    return {
      day: i + 1,
      dateLabel: addDays(input.startDate, i),
      region,
      blocks,
      costs,
    }
  })

  const totals = days.reduce<CostTotals>(
    (acc, d) => ({
      activities: acc.activities + d.costs.activities,
      food: acc.food + d.costs.food,
      stay: acc.stay + d.costs.stay,
      transport: acc.transport + d.costs.transport,
      shopping: acc.shopping + d.costs.shopping,
      total: acc.total + d.costs.total,
    }),
    { activities: 0, food: 0, stay: 0, transport: 0, shopping: 0, total: 0 },
  )

  return { days, totals }
}

export function selectedRegionsFromExperiences(ids: string[]) {
  const regions = EXPERIENCES.filter((e) => ids.includes(e.id)).map((e) => e.region)
  return [...new Set(regions)]
}
