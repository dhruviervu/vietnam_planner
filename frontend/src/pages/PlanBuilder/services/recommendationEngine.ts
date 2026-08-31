import type { Experience, ExperienceSignal, TimeOfDay, TravelStyle } from '../types'
import type { TripBasics } from '../../../store/tripStore'
import { EXPERIENCES } from '../data/experiences'
import { monthFromDate } from '../data/tripSignals'

export type TripFitResult = {
  score: number
  reasons: string[]
}

export type DiscoverySections = {
  chosen: Experience[]
  becauseSelected: { title: string; items: Experience[] } | null
  vietnamBest: Experience[]
  catalog: Experience[]
}

export type LikingFilter =
  | ExperienceSignal
  | 'eat-drink'
  | 'culture-history'

/** Broad theme chips — match category, dna, tags, and name. */
export type PracticalFilter =
  | 'Nature'
  | 'Cities'
  | 'Beaches'
  | 'History'
  | 'Food'
  | 'Nightlife'
  | 'Culture'
  | 'Adventure'
  | 'Museum'
  | 'Temple'
  | 'Fun'
  | 'Family'
  | 'Free'
  | 'Photography'
  | 'Market'
  | 'Viewpoint'
  | 'Cave'
  | 'Hiking'
  | 'Architecture'
  | 'Cruise'
  | 'Water'
  | 'Spiritual'
  | 'Shopping'
  | 'Wildlife'

export type ExperienceFilters = {
  query: string
  likings: LikingFilter[]
  practical: PracticalFilter[]
  /** Jump / filter catalog to one city */
  city: string | 'all'
  region: string | 'all'
  duration: 'all' | 'short' | 'medium' | 'longer' | 'flexible'
  cost: 'all' | 'free-low' | 'mid' | 'high'
  accessibility: 'all' | 'wheelchair' | 'easy-walk' | 'limited-walk'
  bestTime: 'all' | TimeOfDay
  minFit: number
}

export const DEFAULT_FILTERS: ExperienceFilters = {
  query: '',
  likings: [],
  practical: [],
  city: 'all',
  region: 'all',
  duration: 'all',
  cost: 'all',
  accessibility: 'all',
  bestTime: 'all',
  minFit: 0,
}

function tripMonth(basics: TripBasics): number | null {
  if (basics.dateMode === 'exact' && basics.startDate) return monthFromDate(basics.startDate)
  if (basics.flexibleMonth != null) return basics.flexibleMonth
  return null
}

function budgetDaily(basics: TripBasics) {
  const days = Math.max(1, basics.days || 7)
  const total =
    basics.budgetMode === 'total' ? basics.budgetTarget : basics.budgetTarget
  // rough daily activity spend slice
  return total / days / (basics.budgetMode === 'total' ? 2 : 1) * 0.15
}

export function computeTripFit(experience: Experience, basics: TripBasics, selectedIds: string[]): TripFitResult {
  let score = 62
  const reasons: string[] = []
  const month = tripMonth(basics)
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))

  if (month != null) {
    if (experience.monthsIdeal.includes(month)) {
      score += 12
      const monthName = new Date(2026, month - 1, 1).toLocaleString('en-US', { month: 'long' })
      reasons.push(`Fits ${monthName}`)
    } else {
      score -= 6
      reasons.push('Outside peak months for this experience')
    }
  } else {
    score += 4
    reasons.push('Flexible dates — easy to place')
  }

  if (basics.durationKnown) {
    if (basics.days <= 5 && experience.durationHours >= 7) {
      score -= 8
      reasons.push('Full-day — tight on a short trip')
    } else if (basics.days >= 10 || experience.durationHours <= 4) {
      score += 6
      reasons.push('Works within your duration')
    } else {
      score += 4
      reasons.push('Fits your trip length')
    }
  }

  if (basics.paceKnown) {
    if (experience.paceAffinity.includes(basics.travelStyle)) {
      score += 10
      reasons.push('Works within your pace')
    } else if (basics.travelStyle === 'relaxed' && experience.durationHours >= 7) {
      score -= 8
      reasons.push('A full day — may feel rushed for slow travel')
    } else {
      score -= 3
    }
  }

  if (basics.budgetKnown) {
    const daily = budgetDaily(basics)
    if (experience.costUsd <= daily * 1.4 || experience.priceType === 'free' || experience.price <= 15) {
      score += 8
      reasons.push('Within your budget range')
    } else if (experience.costUsd > daily * 2.5) {
      score -= 10
      reasons.push('Above your usual spend band')
    } else {
      score += 2
    }
  }

  const nearby = selected.find((s) => s.region === experience.region && s.id !== experience.id)
  if (nearby) {
    score += 10
    reasons.push(`Near ${nearby.name}`)
  }

  if (basics.interests.length) {
    const hit = basics.interests.some(
      (i) =>
        experience.category.toLowerCase().includes(i) ||
        experience.dna.join(' ').toLowerCase().includes(i) ||
        experience.tags.join(' ').toLowerCase().includes(i),
    )
    if (hit) {
      score += 8
      reasons.push('Matches your interests')
    }
  }

  if (experience.featured) score += 3
  if (experience.hiddenGem && basics.travelStyle === 'relaxed') score += 4

  score = Math.max(48, Math.min(98, Math.round(score)))
  const topReasons = reasons
    .filter((r) => !r.startsWith('Outside') && !r.includes('may feel') && !r.includes('Above'))
    .slice(0, 4)
  const fallback = reasons.slice(0, 3)
  return { score, reasons: topReasons.length ? topReasons : fallback }
}

export function scoreExperience(
  experience: Experience,
  basics: TripBasics,
  selectedIds: string[],
) {
  return computeTripFit(experience, basics, selectedIds).score
}

function matchesLiking(e: Experience, liking: LikingFilter) {
  if (liking === 'eat-drink') return e.category === 'Food' || e.dna.some((d) => /FOOD|EAT|DRINK/i.test(d))
  if (liking === 'culture-history')
    return e.category === 'Culture' || e.category === 'History' || e.signal === 'vietnam-special'
  return e.signal === liking
}

function matchesPractical(e: Experience, p: PracticalFilter): boolean {
  const hay = `${e.name} ${e.category} ${e.dna.join(' ')} ${e.tags.join(' ')} ${e.hook}`.toLowerCase()
  switch (p) {
    case 'Nature':
      return e.category === 'Nature' || /nature|scenic|karst|park|reserve|lake|bay/i.test(hay)
    case 'Cities':
      return e.category === 'Cities' || /city|urban|quarter|street|promenade/i.test(hay)
    case 'Beaches':
      return e.category === 'Beaches' || /beach|snorkel|coast|island/i.test(hay)
    case 'History':
      return e.category === 'History' || /history|citadel|tomb|palace|prison|war|museum|imperial/i.test(hay)
    case 'Food':
      return e.category === 'Food' || /food|coffee|cook|market|eat|bia/i.test(hay)
    case 'Nightlife':
      return e.category === 'Nightlife' || /night|lantern|bia|sunset|evening/i.test(hay)
    case 'Culture':
      return e.category === 'Culture' || /culture|temple|pagoda|village|craft|pottery/i.test(hay)
    case 'Adventure':
      return e.category === 'Adventure' || e.signal === 'adventure' || /adventure|trek|loop|cave|kayak|climb/i.test(hay)
    case 'Museum':
      return /museum|ethnolog|remnant|exhibition|gallery/i.test(hay)
    case 'Temple':
      return /temple|pagoda|spiritual|shrine|literature|thien mu|quan thanh|jade emperor|linh ung|po nagar|bai dinh/i.test(hay)
    case 'Fun':
      return /fun|crazy|ba na|cable|entertainment|family|promenade|walking/i.test(hay) || e.signal === 'picture-perfect'
    case 'Family':
      return /family|easy|beach|lake|promenade|cable|boat/i.test(hay) || e.dna.some((d) => /FAMILY/i.test(d))
    case 'Free':
      return e.priceType === 'free' || e.price === 0 || /free/i.test(e.costLabel)
    case 'Photography':
      return e.signal === 'picture-perfect' || /photo|viewpoint|scenic|lantern|sunrise|sunset|bridge/i.test(hay)
    case 'Market':
      return /market|cho |dong xuan|ben thanh|dong ba|night market/i.test(hay)
    case 'Viewpoint':
      return /viewpoint|view|observation|fansipan|hang mua|landmark|bitexco|opera|bridge/i.test(hay) ||
        e.dna.some((d) => /VIEWPOINT|VIEW/i.test(d))
    case 'Cave':
      return /cave|phong nha|paradise|sung sot|dark cave|mua/i.test(hay) || e.dna.some((d) => /CAVE/i.test(d))
    case 'Hiking':
      return /trek|hike|hiking|climb|fansipan|sapa|hang mua|son tra/i.test(hay) || e.dna.some((d) => /HIKE|TREK/i.test(d))
    case 'Architecture':
      return /architecture|opera|palace|cathedral|notre|citadel|bridge|colonial|crazy house/i.test(hay)
    case 'Cruise':
      return /cruise|bay|boat|kayak|perfume river|sampan/i.test(hay) || e.dna.some((d) => /CRUISE|BOAT/i.test(d))
    case 'Water':
      return /bay|beach|river|lake|boat|snorkel|swim|water|lagoon/i.test(hay)
    case 'Spiritual':
      return /temple|pagoda|spiritual|mausoleum|worship|pilgrim|literature/i.test(hay)
    case 'Shopping':
      return /market|shop|pottery|craft|souvenir|cho lon/i.test(hay)
    case 'Wildlife':
      return /wildlife|langur|snorkel|safari|nature reserve|van long|son tra|monkey/i.test(hay)
    default:
      return e.category === p
  }
}

export function experienceDurationBand(
  e: Experience,
): 'short' | 'medium' | 'longer' | 'flexible' {
  const hay = `${e.id} ${e.name} ${e.category}`.toLowerCase()
  const flexible =
    /walk|street|quarter|lake|promenade|market|beach|sunset|bia-hoi|egg-coffee|apartment-cafes|train-street|old-quarter|hoan-kiem|west-lake|nguyen-hue|an-bang|da-nang-beach|nha-trang|xuan-huong|sao-beach|phu-quoc-sunset|dong-xuan|ben-thanh|dong-ba|sapa-market|duong-dong|dinh-cau/.test(
      hay,
    )
  if (flexible) return 'flexible'
  if (e.durationHours <= 1) return 'short'
  if (e.durationHours < 3) return 'medium'
  return 'longer'
}

function matchesFilters(
  e: Experience,
  filters: ExperienceFilters,
  fit: number,
) {
  if (filters.query) {
    const q = filters.query.toLowerCase()
    const hay = `${e.name} ${e.city} ${e.region} ${e.hook} ${e.dna.join(' ')} ${e.category} ${e.cardSummary}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  if (filters.likings.length > 0 && !filters.likings.some((l) => matchesLiking(e, l))) return false
  if (filters.practical.length > 0) {
    const ok = filters.practical.some((p) => matchesPractical(e, p))
    if (!ok) return false
  }
  if (filters.region !== 'all' && e.region !== filters.region) return false
  if (filters.duration !== 'all') {
    const allowed = ['short', 'medium', 'longer', 'flexible'] as const
    if ((allowed as readonly string[]).includes(filters.duration)) {
      if (experienceDurationBand(e) !== filters.duration) return false
    }
  }
  if (filters.cost === 'free-low' && e.price > 15) return false
  if (filters.cost === 'mid' && (e.price < 15 || e.price > 55)) return false
  if (filters.cost === 'high' && e.price < 55) return false
  if (filters.accessibility === 'wheelchair' && !/good|partial/i.test(e.accessibilityDetail.wheelchair))
    return false
  if (filters.accessibility === 'easy-walk' && !/easy/i.test(e.accessibilityDetail.walking)) return false
  if (filters.accessibility === 'limited-walk' && /challenging/i.test(e.accessibilityDetail.walking))
    return false
  if (filters.bestTime === 'morning' && e.slotQuality.morning < 4) return false
  if (filters.bestTime === 'afternoon' && e.slotQuality.afternoon < 4) return false
  if (filters.bestTime === 'evening' && e.slotQuality.evening < 4) return false
  if (fit < filters.minFit) return false
  return true
}

export function filterExperiences(
  basics: TripBasics,
  selectedIds: string[],
  filters: ExperienceFilters,
) {
  return filterExperienceItems(EXPERIENCES, basics, selectedIds, filters).sort(
    (a, b) => scoreExperience(b, basics, selectedIds) - scoreExperience(a, basics, selectedIds),
  )
}

export function filterExperienceItems(
  items: Experience[],
  basics: TripBasics,
  selectedIds: string[],
  filters: ExperienceFilters,
) {
  return items.filter((e) => {
    const fit = scoreExperience(e, basics, selectedIds)
    return matchesFilters(e, filters, fit)
  })
}

export function buildDiscoverySections(
  basics: TripBasics,
  selectedIds: string[],
  filters: ExperienceFilters,
): DiscoverySections {
  const filtered = filterExperiences(basics, selectedIds, filters)
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const last = selected[selected.length - 1]
  const filtering =
    filters.query ||
    filters.likings.length > 0 ||
    filters.practical.length > 0 ||
    filters.region !== 'all' ||
    filters.duration !== 'all' ||
    filters.cost !== 'all' ||
    filters.accessibility !== 'all' ||
    filters.bestTime !== 'all' ||
    filters.minFit > 0

  const chosen = [...filtered]
    .sort((a, b) => scoreExperience(b, basics, selectedIds) - scoreExperience(a, basics, selectedIds))
    .filter((e) => !selectedIds.includes(e.id))
    .slice(0, 6)

  let becauseSelected: DiscoverySections['becauseSelected'] = null
  if (last && !filtering) {
    const nearby = filtered
      .filter(
        (e) =>
          e.id !== last.id &&
          !selectedIds.includes(e.id) &&
          (e.region === last.region || last.relatedIds.includes(e.id) || e.relatedIds.includes(last.id)),
      )
      .slice(0, 4)
    if (nearby.length) {
      becauseSelected = {
        title:
          selected.length >= 2 && selected.filter((s) => s.region === last.region).length >= 2
            ? `Complete your ${last.region} day`
            : `Because you're already in ${last.region}…`,
        items: nearby,
      }
    }
  }

  const vietnamBest = EXPERIENCES.filter((e) => e.vietnamBest).slice(0, 8)

  // Keep every matching experience in the city catalog (including Best Fits picks)
  // so single-city / single-item destinations still get a jumpable section.
  const catalog = filtered

  return { chosen, becauseSelected, vietnamBest, catalog }
}

export function buildTripFeedback(
  selectedIds: string[],
  pace: TravelStyle,
): string[] {
  if (selectedIds.length === 0) return []
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const notes: string[] = []

  const cats = new Set(selected.map((e) => e.category))
  if (cats.has('Culture') && cats.has('Nature')) {
    notes.push('Good balance of culture + nature.')
  } else if (cats.has('Food') && cats.size >= 2) {
    notes.push('Nice mix of food and sightseeing.')
  }

  const regionCounts = new Map<string, number>()
  for (const e of selected) regionCounts.set(e.region, (regionCounts.get(e.region) ?? 0) + 1)
  const [topRegion, topCount] = [...regionCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
  if (topRegion && topCount >= 3) {
    notes.push(`You have ${topCount} experiences in ${topRegion}.`)
  }

  const fullDays = selected.filter((e) => e.durationHours >= 7).length
  if (fullDays >= 3) notes.push("You've chosen several full-day experiences.")
  if (pace === 'relaxed' && fullDays >= 2) notes.push('You may want one slower day.')
  if (pace === 'packed' && selected.length >= 4) notes.push('Your pace can carry this — keep days clustered.')

  return notes.slice(0, 2)
}

export function suggestDayAround(experienceId: string) {
  const main = EXPERIENCES.find((e) => e.id === experienceId)
  if (!main) return null
  const secondary =
    EXPERIENCES.find(
      (e) =>
        e.id !== main.id &&
        e.region === main.region &&
        e.durationHours <= 3 &&
        (main.relatedIds.includes(e.id) || e.signal === 'slow-scenic' || e.category === 'Food'),
    ) ??
    EXPERIENCES.find((e) => e.region === main.region && e.id !== main.id && e.durationHours <= 3)

  return {
    main,
    blocks: [
      { time: '08:30', label: 'Breakfast nearby' },
      { time: '10:00', label: main.name },
      { time: '13:00', label: 'Lunch nearby' },
      { time: '15:00', label: secondary?.name ?? 'Secondary experience / free time' },
      { time: '18:00', label: 'Sunset / café' },
      { time: '20:00', label: 'Dinner' },
    ],
    secondaryIds: secondary ? [secondary.id] : ([] as string[]),
  }
}

export function formatTripContext(basics: TripBasics): string[] {
  const parts: string[] = []

  if (basics.durationKnown) parts.push(`${basics.days} DAYS`)
  else parts.push('Duration undecided')

  if (basics.dateMode === 'exact' && basics.startDate) {
    const m = monthFromDate(basics.startDate)
    if (m) {
      parts.push(new Date(2026, m - 1, 1).toLocaleString('en-US', { month: 'long' }).toUpperCase())
    }
  } else if (basics.flexibleMonth != null) {
    parts.push(
      new Date(2026, basics.flexibleMonth - 1, 1)
        .toLocaleString('en-US', { month: 'long' })
        .toUpperCase(),
    )
  } else if (basics.flexibleSeason) {
    parts.push(basics.flexibleSeason.toUpperCase())
  } else {
    parts.push('Dates flexible')
  }

  if (basics.paceKnown) {
    parts.push(basics.travelStyle.toUpperCase())
  }

  if (basics.budgetKnown) {
    const label =
      basics.budgetMode === 'per-person'
        ? `$${basics.budgetTarget.toLocaleString()}/PERSON`
        : `$${basics.budgetTarget.toLocaleString()} TOTAL`
    parts.push(label)
  } else {
    parts.push('Budget to decide')
  }

  return parts
}

export function groupSelectedByRegion(selectedIds: string[]) {
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const order: string[] = []
  const map = new Map<string, Experience[]>()
  for (const e of selected) {
    if (!map.has(e.region)) {
      map.set(e.region, [])
      order.push(e.region)
    }
    map.get(e.region)!.push(e)
  }
  return order.map((region, i) => ({
    dayLabel: `Day ${i + 1}`,
    region,
    items: map.get(region)!,
  }))
}
