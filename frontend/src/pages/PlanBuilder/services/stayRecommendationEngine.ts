import type { Experience, Hotel, StayBase, StayStyle, TravelStyle } from '../types'
import type { TripBasics } from '../../../store/tripStore'
import { EXPERIENCES } from '../data/experiences'
import { STAY_BASES, getBaseById } from '../data/stayBases'
import { HOTELS, hotelImages, hotelsForBase } from '../data/hotels'
import type {
  StayFiltersState,
  StayPriority,
  StayProximity,
} from '../lib/stayFilters'

export type StartingPointRec = {
  base: StayBase
  confidence: 'strong' | 'good' | 'soft'
  reasons: string[]
  nearbyCount: number
} | null

export type RoutePreview = {
  stops: string[]
  label: string
}

export type ScoredHotel = Hotel & {
  tripFit: number
  nearbyCount: number
  avgDistanceKm: number
  nearbyExperiences: { id: string; name: string; km: number }[]
  stayNights: number
  totalEstimate: number | null
  efficiency: number
  valueNote: string
  fitReasons: string[]
}

function regionConcentration(experiences: Experience[]) {
  const counts = new Map<string, number>()
  for (const e of experiences) counts.set(e.region, (counts.get(e.region) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export function analyzeSelectedExperiences(selectedIds: string[]) {
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const byRegion = regionConcentration(selected)
  const top = byRegion[0]
  const total = selected.length
  let concentrationNote: string | null = null
  if (top && total >= 2) {
    const share = top[1] / total
    if (share >= 0.6) {
      const north = ['Hanoi', 'Ninh Binh', 'Quang Ninh', 'Ha Giang', 'Sapa'].includes(top[0])
      const central = ['Hoi An', 'Da Nang', 'Hue', 'Phong Nha'].includes(top[0])
      const south = ['Ho Chi Minh City', 'Mekong', 'Phu Quoc'].includes(top[0])
      const zone = north ? 'Northern Vietnam' : central ? 'Central Vietnam' : south ? 'Southern Vietnam' : top[0]
      concentrationNote = `Most of your current experiences are concentrated in ${zone}.`
    } else {
      concentrationNote = `Your experiences span ${byRegion.length} regions — a multi-base trip may work well.`
    }
  }
  return { selected, byRegion, concentrationNote }
}

export function recommendStartingPoint(selectedIds: string[]): StartingPointRec {
  const { selected, byRegion } = analyzeSelectedExperiences(selectedIds)
  if (selected.length < 1) return null

  const topRegion = byRegion[0]?.[0]
  if (!topRegion) return null

  const hub =
    STAY_BASES.find((b) => b.region === topRegion && b.arrivalHub) ??
    STAY_BASES.find((b) => b.region === topRegion)

  if (!hub) return null

  const nearbyCount = selected.filter((e) => e.region === hub.region).length
  const reasons: string[] = []
  if (nearbyCount > 0) {
    reasons.push(
      `${nearbyCount} of ${selected.length} Trip Bag experience${selected.length === 1 ? '' : 's'} ${nearbyCount === 1 ? 'is' : 'are'} in this region`,
    )
  }
  if (hub.arrivalHub) reasons.push('Easy arrival point for this part of Vietnam')
  const nextRegions = byRegion.slice(1, 3).map(([r]) => r)
  if (nextRegions.length) reasons.push(`Natural route into ${nextRegions.join(' + ')}`)
  if (selected.length === 1) reasons.push('Based on the one place currently in your Trip Bag')

  const confidence: 'strong' | 'good' | 'soft' =
    selected.length >= 4 && nearbyCount >= 2 ? 'strong' : selected.length >= 2 ? 'good' : 'soft'

  return { base: hub, confidence, reasons: reasons.slice(0, 4), nearbyCount }
}

export function buildRoutePreview(
  selectedIds: string[],
  startRegion?: string | null,
): RoutePreview | null {
  const { selected, byRegion } = analyzeSelectedExperiences(selectedIds)

  const orderHint = [
    'Hanoi',
    'Ninh Binh',
    'Quang Ninh',
    'Ha Giang',
    'Sapa',
    'Hue',
    'Da Nang',
    'Hoi An',
    'Phong Nha',
    'Ho Chi Minh City',
    'Mekong',
    'Phu Quoc',
    'Mui Ne',
  ]

  const bagStops = byRegion
    .map(([region]) => region)
    .sort((a, b) => orderHint.indexOf(a) - orderHint.indexOf(b))

  if (selected.length === 0) {
    if (!startRegion) return null
    return {
      stops: [startRegion],
      label: `Browsing from ${startRegion} — add Trip Bag places to shape a fuller route`,
    }
  }

  let stops = [...bagStops]
  if (startRegion) {
    stops = [startRegion, ...stops.filter((s) => s !== startRegion)]
  }

  if (stops.length === 0 && startRegion) stops = [startRegion]
  if (stops.length < 1) return null

  const startInBag = startRegion ? bagStops.includes(startRegion) : true
  const label = startRegion
    ? startInBag
      ? `Natural route with ${startRegion} as your start`
      : `${startRegion} as start — then toward your Trip Bag regions`
    : 'One natural way to structure your trip'

  return { stops: stops.slice(0, 6), label }
}

export type RegionInsight = {
  badge: string
  why: string
  tradeoffs: string[]
  warning: boolean
  isSuggested: boolean
  bagCount: number
  bagTotal: number
}

export function describeRegionInsight(
  region: string,
  selectedIds: string[],
  suggestedRegion: string | null,
): RegionInsight {
  const { byRegion } = analyzeSelectedExperiences(selectedIds)
  const bagTotal = selectedIds.length
  const bagCount = byRegion.find(([r]) => r === region)?.[1] ?? 0
  const top = byRegion[0]
  const isSuggested = Boolean(suggestedRegion && suggestedRegion === region)

  if (bagTotal === 0) {
    return {
      badge: 'Browse freely',
      why: `Your Trip Bag is empty — exploring ${region} stays is fine. Nearby sights below are area highlights, not personal matches yet.`,
      tradeoffs: [],
      warning: false,
      isSuggested: false,
      bagCount: 0,
      bagTotal: 0,
    }
  }

  if (bagCount === 0) {
    return {
      badge: 'No Trip Bag places here',
      why: `None of the ${bagTotal} experience${bagTotal === 1 ? '' : 's'} in your Trip Bag are in ${region}.`,
      tradeoffs: [
        'Staying here means longer transfers to the places you already saved',
        top
          ? `Most of your bag sits in ${top[0]} (${top[1]} place${top[1] === 1 ? '' : 's'}) — that region stays closer to your plans`
          : 'Consider a region that already appears in your Trip Bag',
        'Useful if this is a deliberate next stop or side trip — not your densest cluster',
      ],
      warning: true,
      isSuggested: false,
      bagCount: 0,
      bagTotal,
    }
  }

  if (top && region !== top[0] && bagCount < top[1]) {
    return {
      badge: 'Fewer Trip Bag matches',
      why: `Only ${bagCount} of ${bagTotal} Trip Bag experience${bagTotal === 1 ? '' : 's'} ${bagCount === 1 ? 'is' : 'are'} in ${region} — fewer than ${top[0]} (${top[1]}).`,
      tradeoffs: [
        `You will be farther from ${bagTotal - bagCount} other saved place${bagTotal - bagCount === 1 ? '' : 's'}`,
        'Expect extra transit time between this stay and your denser cluster',
        isSuggested ? '' : `${top[0]} still has the strongest concentration for your current bag`,
      ].filter(Boolean),
      warning: true,
      isSuggested,
      bagCount,
      bagTotal,
    }
  }

  if (bagCount === bagTotal) {
    return {
      badge: isSuggested ? 'Strongest match' : 'All matches here',
      why: `All ${bagTotal} experience${bagTotal === 1 ? '' : 's'} in your Trip Bag ${bagTotal === 1 ? 'is' : 'are'} in ${region}, so lodging here keeps travel time low.`,
      tradeoffs: [],
      warning: false,
      isSuggested,
      bagCount,
      bagTotal,
    }
  }

  return {
    badge: isSuggested ? 'Suggested start' : 'Solid match',
    why: `${bagCount} of ${bagTotal} Trip Bag experience${bagTotal === 1 ? '' : 's'} ${bagCount === 1 ? 'is' : 'are'} in ${region}.`,
    tradeoffs: [],
    warning: false,
    isSuggested,
    bagCount,
    bagTotal,
  }
}

function nightlyBudgetCap(basics: TripBasics) {
  if (!basics.budgetKnown) return null
  const days = Math.max(1, basics.days || 7)
  if (basics.budgetMode === 'total') {
    // rough: ~35% of trip budget for lodging
    return (basics.budgetTarget * 0.35) / days
  }
  // per person — assume ~30% of daily slice for lodging
  return (basics.budgetTarget / days) * 0.35
}

export function suggestedPriceRange(basics: TripBasics) {
  const cap = nightlyBudgetCap(basics)
  if (cap == null || !Number.isFinite(cap) || cap <= 0) {
    return { min: 25, max: 200 }
  }
  const min = Math.max(20, Math.round(cap * 0.35 / 5) * 5)
  const max = Math.min(250, Math.max(min + 40, Math.round(cap * 1.35 / 5) * 5))
  return { min, max }
}

export function scoreBase(
  base: StayBase,
  basics: TripBasics,
  selectedIds: string[],
  stayStyle: StayStyle | null,
): { score: number; reasons: string[]; nearbyCount: number } {
  let score = 55
  const reasons: string[] = []
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const nearbyCount = selected.filter((e) => e.region === base.region).length

  if (nearbyCount > 0) {
    score += Math.min(25, nearbyCount * 8)
    reasons.push(`${nearbyCount} selected experience${nearbyCount === 1 ? '' : 's'} within easy reach`)
  } else if (selected.length === 0) {
    score += 8
    reasons.push('Strong exploratory base for Vietnam')
  }

  if (stayStyle && base.styleTags.includes(stayStyle)) {
    score += 12
    reasons.push(`Matches your ${stayStyle} stay style`)
  }

  if (basics.paceKnown) {
    if (basics.travelStyle === 'relaxed' && (base.styleTags.includes('quiet') || base.styleTags.includes('beachside'))) {
      score += 8
      reasons.push('Works well for a balanced / relaxed pace')
    } else if (basics.travelStyle === 'packed' && base.transportScore >= 4) {
      score += 8
      reasons.push('Convenient for a packed pace')
    } else if (basics.travelStyle === 'balanced') {
      score += 5
      reasons.push('Works well for a balanced pace')
    }
  }

  if (basics.interests.length) {
    const hit = basics.interests.some((i) =>
      base.bestFor.some((b) => b.toLowerCase().includes(i) || i.includes(b.toLowerCase().slice(0, 4))),
    )
    if (hit) {
      score += 6
      reasons.push('Aligns with your interests')
    }
  }

  const cap = nightlyBudgetCap(basics)
  if (cap != null) {
    const mid = (base.typicalNightlyMin + base.typicalNightlyMax) / 2
    if (mid <= cap * 1.15) {
      score += 6
      reasons.push('Within a sensible budget band')
    } else {
      score -= 8
    }
  }

  score += base.foodAccessScore
  score = Math.max(48, Math.min(98, Math.round(score)))
  return { score, reasons: reasons.slice(0, 4), nearbyCount }
}

export function rankBases(
  basics: TripBasics,
  selectedIds: string[],
  stayStyle: StayStyle | null,
) {
  const { byRegion } = analyzeSelectedExperiences(selectedIds)
  const preferredRegions = new Set(byRegion.map(([r]) => r))

  return [...STAY_BASES]
    .map((base) => {
      const scored = scoreBase(base, basics, selectedIds, stayStyle)
      let score = scored.score
      if (preferredRegions.size && preferredRegions.has(base.region)) score += 10
      if (selectedIds.length === 0 && base.arrivalHub) score += 6
      return { base, ...scored, score: Math.min(98, score) }
    })
    .sort((a, b) => b.score - a.score)
}

export function suggestedStayNights(
  basics: TripBasics,
  selectedIds: string[],
  base: StayBase | null,
): { nights: number; label: string; note: string } {
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const inRegion = base ? selected.filter((e) => e.region === base.region) : selected

  if (inRegion.length === 0 && selected.length === 0) {
    const [lo, hi] = base?.typicalStayNights ?? [2, 4]
    return {
      nights: lo,
      label: `${lo}–${hi} nights`,
      note: 'Typical range for this base — refine once you add experiences.',
    }
  }

  if (inRegion.length === 0) {
    return {
      nights: 2,
      label: '2–3 nights',
      note: 'Add more experiences to refine the ideal stay length.',
    }
  }

  let nights = Math.max(1, Math.ceil(inRegion.length / (basics.travelStyle === 'packed' ? 2.5 : basics.travelStyle === 'relaxed' ? 1.2 : 1.8)))
  if (base) {
    nights = Math.max(base.typicalStayNights[0], Math.min(base.typicalStayNights[1] + 1, nights))
  }
  if (basics.durationKnown) {
    nights = Math.min(nights, Math.max(1, basics.days - 1))
  }

  return {
    nights,
    label: `${nights}–${nights + 1} nights`,
    note:
      inRegion.length >= 2
        ? 'Enough time for the experiences you’ve selected without rushing.'
        : 'For the experiences you’ve chosen, this length looks natural.',
  }
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function scoreHotel(
  hotel: Hotel,
  basics: TripBasics,
  selectedIds: string[],
  stayStyle: StayStyle | null,
  stayNights: number,
): ScoredHotel {
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const nearby = selected.filter((e) => e.region === hotel.region)
  const nearbyCount = nearby.length
  const seed = hash(hotel.id + nearbyCount)

  const nearbyExperiences = nearby.map((e, i) => {
    const km = Math.round((0.4 + ((seed + i * 17) % 32) / 10) * 10) / 10
    return { id: e.id, name: e.name, km }
  })

  const avgDistanceKm = nearbyExperiences.length
    ? Math.round(
        (nearbyExperiences.reduce((s, x) => s + x.km, 0) / nearbyExperiences.length) * 10,
      ) / 10
    : Math.round((2 + (seed % 30) / 10) * 10) / 10

  let tripFit = 58
  const fitReasons: string[] = []

  if (nearbyCount > 0) {
    tripFit += Math.min(22, nearbyCount * 7)
    fitReasons.push(
      `${avgDistanceKm} km avg from ${nearbyCount} Trip Bag experience${nearbyCount === 1 ? '' : 's'} in ${hotel.region}`,
    )
  } else if (selected.length > 0) {
    fitReasons.push('Fewer of your Trip Bag places are in this region — still useful as a next stop')
  } else {
    fitReasons.push('Browse freely — add experiences to see distances to your plans')
  }
  if (stayStyle && hotel.styleTags?.includes(stayStyle)) {
    tripFit += 10
    fitReasons.push(`Matches your ${stayStyle} preference`)
  }
  if (basics.paceKnown && basics.travelStyle === 'relaxed' && hotel.styleTags?.includes('quiet')) {
    tripFit += 6
  }
  if (basics.paceKnown && basics.travelStyle === 'packed' && (hotel.transportScore ?? 0) >= 4) {
    tripFit += 5
    fitReasons.push('Good match for your pace')
  }

  const cap = nightlyBudgetCap(basics)
  if (cap != null) {
    if (hotel.pricePerNight <= cap) {
      tripFit += 8
      fitReasons.push('Fits your current budget')
    } else if (hotel.pricePerNight > cap * 1.4) {
      tripFit -= 10
    } else {
      fitReasons.push('Slightly above your usual spend band')
    }
  }

  if ((hotel.foodAccessScore ?? 0) >= 4) fitReasons.push('Walkable to restaurants')
  tripFit += hotel.locationScore ?? 3
  tripFit = Math.max(50, Math.min(98, Math.round(tripFit)))

  const peers = HOTELS.filter((h) => h.region === hotel.region)
  const avg = peers.reduce((s, h) => s + h.pricePerNight, 0) / Math.max(1, peers.length)
  const diff = Math.round(avg - hotel.pricePerNight)
  let valueNote = 'Solid option among similar stays'
  if (diff >= 12) valueNote = `~$${diff} less than similar stays nearby`
  else if (diff >= 5) valueNote = `${Math.round((diff / avg) * 100)}% below the area average`
  else if (diff < -15) valueNote = 'Premium pick for this area'

  const efficiency = Math.max(
    55,
    Math.min(
      97,
      Math.round(
        tripFit * 0.55 +
          (hotel.transportScore ?? 3) * 6 +
          Math.min(20, nearbyCount * 5) +
          (avgDistanceKm < 2 ? 8 : 0),
      ),
    ),
  )

  const totalEstimate = basics.durationKnown || stayNights > 0 ? hotel.pricePerNight * stayNights : null

  return {
    ...hotel,
    images: hotelImages(hotel),
    tripFit,
    nearbyCount,
    avgDistanceKm,
    nearbyExperiences,
    stayNights,
    totalEstimate,
    efficiency,
    valueNote,
    fitReasons: fitReasons.slice(0, 4),
  }
}

export function rankHotelsForBase(
  baseId: string,
  basics: TripBasics,
  selectedIds: string[],
  stayStyle: StayStyle | null,
  stayNights: number,
) {
  const base = getBaseById(baseId)
  const list = base
    ? HOTELS.filter((h) => h.region === base.region || h.baseId === baseId)
    : hotelsForBase(baseId)
  const pool = list.length
    ? list
    : HOTELS.filter((h) => getBaseById(baseId)?.region === h.region)
  // de-dupe by id
  const seen = new Set<string>()
  const unique = pool.filter((h) => {
    if (seen.has(h.id)) return false
    seen.add(h.id)
    return true
  })
  return unique
    .map((h) => scoreHotel(h, basics, selectedIds, stayStyle, stayNights))
    .sort((a, b) => b.tripFit - a.tripFit)
}

function proximityMaxKm(proximity: StayProximity) {
  if (proximity === '1km') return 1
  if (proximity === '3km') return 3
  if (proximity === '5km') return 5
  return null
}

function priorityScore(h: ScoredHotel, priority: StayPriority | null) {
  switch (priority) {
    case 'closest':
      return -h.avgDistanceKm * 20 + h.nearbyCount * 8
    case 'best-value':
      return h.tripFit * 0.45 + (100 - Math.min(100, h.pricePerNight)) * 0.35 + h.efficiency * 0.2
    case 'highest-rated':
      return h.rating * 20 + Math.min(10, (h.reviewCount ?? 0) / 400)
    case 'best-food':
      return (h.foodAccessScore ?? 0) * 14 + h.tripFit * 0.35
    case 'best-nightlife':
      return (
        (h.styleTags?.includes('central') ? 28 : 0) +
        (h.foodAccessScore ?? 0) * 8 +
        (h.transportScore ?? 0) * 6
      )
    case 'best-relax':
      return (
        (h.styleTags?.includes('quiet') ? 22 : 0) +
        (h.styleTags?.includes('beachside') ? 18 : 0) +
        (h.styleTags?.includes('premium') ? 10 : 0) +
        h.tripFit * 0.25
      )
    case 'best-adventure':
      return (
        (h.styleTags?.includes('adventure') ? 30 : 0) +
        (h.transportScore ?? 0) * 10 +
        h.nearbyCount * 6
      )
    case 'best-fit':
    default:
      return h.tripFit
  }
}

export function applyStayFiltersAndSort(
  hotels: ScoredHotel[],
  filters: StayFiltersState,
  hasSelectedExperiences: boolean,
): ScoredHotel[] {
  const maxKm = proximityMaxKm(filters.proximity)
  const filtered = hotels.filter((h) => {
    if (h.pricePerNight < filters.priceMin) return false
    if (filters.priceMax < 250 && h.pricePerNight > filters.priceMax) return false
    if (filters.minRating != null && h.rating < filters.minRating) return false
    if (filters.styles.length > 0) {
      const tags = h.styleTags ?? []
      if (!filters.styles.some((s) => tags.includes(s))) return false
    }
    if (filters.types.length > 0) {
      const type = h.accommodationType ?? 'hotel'
      if (!filters.types.includes(type)) return false
    }
    if (hasSelectedExperiences && maxKm != null && h.avgDistanceKm > maxKm) return false
    return true
  })

  return [...filtered].sort((a, b) => {
    const diff = priorityScore(b, filters.priority) - priorityScore(a, filters.priority)
    if (Math.abs(diff) > 0.01) return diff
    return b.tripFit - a.tripFit
  })
}

export function googleMapsStayUrl(hotel: Hotel, experienceNames: string[]) {
  const origin = encodeURIComponent(hotel.mapsQuery ?? `${hotel.name} ${hotel.city}`)
  if (experienceNames.length === 0) {
    return `https://www.google.com/maps/search/?api=1&query=${origin}`
  }
  const dest = encodeURIComponent(experienceNames[0])
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
}

export function meters(level: number, max = 5) {
  const n = Math.max(0, Math.min(max, Math.round(level)))
  return '●'.repeat(n) + '○'.repeat(max - n)
}

export function styleInfluenceNote(style: StayStyle | null, pace: TravelStyle) {
  if (!style) return null
  if (style === 'adventure') return 'Prioritizing activity access, early breakfast, and route convenience.'
  if (style === 'quiet' || (style === 'beachside' && pace === 'relaxed'))
    return 'Prioritizing quieter settings and softer evenings.'
  if (style === 'premium') return 'Prioritizing comfort and polished amenities.'
  if (style === 'central') return 'Prioritizing walkability and dense food/culture access.'
  return 'Prioritizing coastal access and easy beach days.'
}
