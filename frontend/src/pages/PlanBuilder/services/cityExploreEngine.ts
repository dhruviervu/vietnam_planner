import type { Experience, ExperienceSignal } from '../types'
import type { TripBasics } from '../../../store/tripStore'
import { EXPERIENCES } from '../data/experiences'
import {
  EXPLORE_CITIES,
  filterChipLabel,
  type ExploreCity,
  type CityFilterChip,
} from '../data/exploreCities'
import { scoreExperience } from './recommendationEngine'

export type ExploreMode = 'city' | 'all'

export type FitLabel = 'Strong fit' | 'Good fit' | 'Worth considering'

export type RankedCity = ExploreCity & {
  experiences: Experience[]
  score: number
  fitLabel: FitLabel
  /** One concise planning line, e.g. "Strong fit — high food match…" */
  fitSummary: string
  reasons: string[]
  availableFilters: CityFilterChip[]
}

export type ExperienceGroupId = 'must-do' | 'vietnam-special' | 'hidden-gem' | 'explore-more'

export type ExperienceGroup = {
  id: ExperienceGroupId
  title: string
  blurb: string
  items: Experience[]
}

function experiencesForCity(city: ExploreCity): Experience[] {
  return EXPERIENCES.filter((e) => e.region === city.region)
}

function interestHitsCity(city: ExploreCity, interests: string[]): string[] {
  const bag = `${city.bestFor.join(' ')} ${city.tagline} ${city.whyChoose}`.toLowerCase()
  return interests.filter((i) => bag.includes(i.toLowerCase()) || city.bestFor.some((b) => b.toLowerCase().includes(i)))
}

export function rankCities(basics: TripBasics, selectedIds: string[]): RankedCity[] {
  const selected = EXPERIENCES.filter((e) => selectedIds.includes(e.id))
  const selectedByRegion = new Map<string, number>()
  for (const e of selected) {
    selectedByRegion.set(e.region, (selectedByRegion.get(e.region) ?? 0) + 1)
  }

  const days = basics.durationKnown ? basics.days : 7
  const pace = basics.paceKnown ? basics.travelStyle : null

  const ranked = EXPLORE_CITIES.map((city) => {
    const experiences = experiencesForCity(city)
    let score = 40
    const reasons: string[] = []

    const selectedCount = selectedByRegion.get(city.region) ?? 0
    if (selectedCount > 0) {
      score += Math.min(28, selectedCount * 10)
      reasons.push(
        selectedCount === 1
          ? 'You already have an experience selected here'
          : `High match with your ${selectedCount} selected experiences here`,
      )
    }

    const interestMatches = interestHitsCity(city, basics.interests)
    if (interestMatches.length) {
      score += Math.min(18, interestMatches.length * 7)
      const top = interestMatches[0]
      reasons.push(`High match with your ${top} interest`)
    }

    if (basics.durationKnown) {
      const densityBoost =
        city.experienceDensity === 'High' ? 8 : city.experienceDensity === 'Medium' ? 4 : 0
      if (days <= 5) {
        if (city.arrivalHub) {
          score += 10
          reasons.push('Practical hub for a shorter trip')
        }
        if (city.experienceDensity === 'High') {
          score += 4
          reasons.push('Many experiences fit a short stay')
        }
      } else if (days >= 10) {
        score += densityBoost
        if (city.experienceDensity !== 'Low') {
          reasons.push(`Many experiences fit a ${days}-day stay`)
        }
      } else {
        score += Math.round(densityBoost / 2) + 4
        reasons.push(`Experiences fit a ${days}-day stay`)
      }
    }

    if (pace === 'relaxed') {
      if (/relax|slow|beach|scenic/i.test(city.typicalPace + city.bestFor.join(' '))) {
        score += 8
        reasons.push('Good match for a relaxed pace')
      } else if (city.typicalPace.toLowerCase().includes('active')) {
        score -= 4
      } else {
        score += 3
        reasons.push('Good match for a balanced pace')
      }
    } else if (pace === 'packed') {
      if (city.experienceDensity === 'High' || city.arrivalHub) {
        score += 8
        reasons.push('Good match for a packed pace')
      }
    } else if (pace === 'balanced') {
      score += 5
      reasons.push('Good match for a balanced pace')
    }

    if (basics.budgetKnown && basics.budgetTarget < 900 && city.id === 'phu-quoc') {
      score -= 6
    }

    // Soft popularity for hubs when nothing selected
    if (selected.length === 0 && city.arrivalHub) score += 6
    if (experiences.length === 0) score -= 20

    // Average experience fit soft signal
    if (experiences.length) {
      const avg =
        experiences.reduce((s, e) => s + scoreExperience(e, basics, selectedIds), 0) /
        experiences.length
      score += Math.round((avg - 62) / 4)
    }

    score = Math.max(20, Math.min(98, Math.round(score)))

    let fitLabel: FitLabel = 'Worth considering'
    if (score >= 72) fitLabel = 'Strong fit'
    else if (score >= 55) fitLabel = 'Good fit'

    const uniqueReasons = [...new Set(reasons)].slice(0, 3)
    if (uniqueReasons.length === 0) {
      uniqueReasons.push('based on your trip basics so far')
    }

    const detail = uniqueReasons[0]
      .replace(/^High match with your /i, 'high ')
      .replace(/^Good match for a /i, '')
      .replace(/^Many experiences fit a /i, 'enough experiences for a ')
      .replace(/^You already have an experience selected here$/i, 'you already picked experiences here')
      .replace(/^Practical hub for a shorter trip$/i, 'practical hub for a shorter trip')

    const fitSummary = `${fitLabel} for your trip — ${detail}.`

    return {
      ...city,
      experiences,
      score,
      fitLabel,
      fitSummary,
      reasons: uniqueReasons,
      availableFilters: deriveCityFilters(city, experiences),
    }
  })

  return ranked
    .filter((c) => c.experiences.length > 0 || c.score >= 45)
    .sort((a, b) => b.score - a.score)
}

export function deriveCityFilters(city: ExploreCity, experiences: Experience[]): CityFilterChip[] {
  const chips: CityFilterChip[] = []
  for (const id of city.preferredFilters) {
    if (experiences.some((e) => matchesCityFilter(e, id))) {
      chips.push({ id, label: filterChipLabel(id) })
    }
  }
  // Always offer a popular/must slice when data exists
  if (!chips.some((c) => c.id === 'must-do') && experiences.some((e) => e.signal === 'must-do')) {
    chips.unshift({ id: 'must-do', label: 'Must Do' })
  }
  return chips
}

export function matchesCityFilter(e: Experience, filterId: string): boolean {
  if (filterId.startsWith('cat-')) {
    const cat = filterId.slice(4)
    if (cat === 'Museums') {
      return (
        e.category === 'History' ||
        e.category === 'Culture' ||
        /museum/i.test(e.name + e.tags.join(' ') + e.dna.join(' '))
      )
    }
    return e.category === cat
  }

  const signalIds: ExperienceSignal[] = [
    'must-do',
    'vietnam-special',
    'hidden-gem',
    'picture-perfect',
    'slow-scenic',
    'local-life',
    'adventure',
  ]
  if ((signalIds as string[]).includes(filterId)) {
    if (filterId === 'most-popular') return e.featured === true || e.signal === 'must-do'
    return e.signal === filterId
  }

  switch (filterId) {
    case 'most-popular':
      return e.featured === true || e.signal === 'must-do' || e.rating >= 4.7
    case 'food':
      return e.category === 'Food' || /food|eat|noodle|cafe/i.test(e.tags.join(' ') + e.dna.join(' '))
    case 'history':
      return e.category === 'History' || /history|imperial|citadel|museum/i.test(e.name + e.tags.join(' '))
    case 'museums':
      return /museum/i.test(e.name + e.tags.join(' ') + e.dna.join(' ')) || e.category === 'History'
    case 'nightlife':
      return e.category === 'Nightlife' || e.slotQuality.evening >= 4
    case 'local-life':
      return e.signal === 'local-life'
    case 'short':
      return e.durationHours <= 2.5
    case 'full-day':
      return e.durationHours >= 5.5
    case 'nature':
      return e.category === 'Nature' || e.signal === 'slow-scenic'
    case 'adventure':
      return e.category === 'Adventure' || e.signal === 'adventure'
    case 'picture-perfect':
      return e.signal === 'picture-perfect'
    case 'slow-scenic':
      return e.signal === 'slow-scenic'
    case 'old-town':
      return /old town|old quarter|lantern|ancient/i.test(
        `${e.name} ${e.hook} ${e.tags.join(' ')} ${e.dna.join(' ')}`,
      )
    case 'beach':
    case 'beaches':
      return e.category === 'Beaches' || /beach|snorkel|island/i.test(e.name + e.tags.join(' '))
    case 'crafts':
      return /craft|tailor|lantern|workshop/i.test(`${e.name} ${e.hook} ${e.tags.join(' ')}`)
    case 'evening':
      return e.slotQuality.evening >= 4 || /evening|night|lantern/i.test(e.bestTime + e.name)
    case 'culture':
      return e.category === 'Culture' || e.category === 'History'
    case 'city':
    case 'cities':
      return e.category === 'Cities'
    case 'day-trips':
      return e.durationHours >= 5 || /day trip|tour|cruise/i.test(e.name + e.hook)
    case 'best-value':
      return e.price <= 25 || e.priceType === 'free'
    case 'accessible':
      return /good|partial|easy/i.test(
        `${e.accessibilityDetail.wheelchair} ${e.accessibilityDetail.walking}`,
      )
    case 'vietnam-special':
      return e.signal === 'vietnam-special' || e.vietnamBest === true
    default:
      return false
  }
}

export function filterCityExperiences(experiences: Experience[], activeFilters: string[]) {
  if (!activeFilters.length) return experiences
  // City chips behave as OR — pick any matching lens
  return experiences.filter((e) => activeFilters.some((f) => matchesCityFilter(e, f)))
}

export function groupCityExperiences(experiences: Experience[]): ExperienceGroup[] {
  const must = experiences.filter((e) => e.signal === 'must-do')
  const special = experiences.filter(
    (e) => e.signal === 'vietnam-special' || e.vietnamBest,
  ).filter((e) => e.signal !== 'must-do')
  const gems = experiences.filter((e) => e.signal === 'hidden-gem' || e.hiddenGem)
  const used = new Set([...must, ...special, ...gems].map((e) => e.id))
  const more = experiences.filter((e) => !used.has(e.id))

  const groups: ExperienceGroup[] = []
  if (must.length) {
    groups.push({
      id: 'must-do',
      title: 'Must Do',
      blurb: 'Defining experiences for this place.',
      items: must,
    })
  }
  if (special.length) {
    groups.push({
      id: 'vietnam-special',
      title: 'Vietnam Specials',
      blurb: 'Strongly associated with Vietnam or this city.',
      items: special,
    })
  }
  if (gems.length) {
    groups.push({
      id: 'hidden-gem',
      title: 'Hidden Gems',
      blurb: 'Less obvious choices worth knowing.',
      items: gems,
    })
  }
  if (more.length) {
    groups.push({
      id: 'explore-more',
      title: 'Explore More',
      blurb: 'Other relevant experiences nearby.',
      items: more,
    })
  }
  return groups
}

/** When city filters active, show flat filtered list instead of all groups */
export function resolveCityExperienceView(
  experiences: Experience[],
  activeFilters: string[],
): { mode: 'groups'; groups: ExperienceGroup[] } | { mode: 'flat'; items: Experience[] } {
  const filtered = filterCityExperiences(experiences, activeFilters)
  if (activeFilters.length === 0) {
    return { mode: 'groups', groups: groupCityExperiences(filtered) }
  }
  return { mode: 'flat', items: filtered }
}

const SIGNAL_FILTER_IDS = new Set([
  'must-do',
  'vietnam-special',
  'most-popular',
  'hidden-gem',
  'adventure',
  'picture-perfect',
  'slow-scenic',
  'local-life',
])

export function filterGlobalExperiences(
  basics: TripBasics,
  selectedIds: string[],
  filters: string[],
): Experience[] {
  const signals = filters.filter((f) => SIGNAL_FILTER_IDS.has(f))
  const categories = filters.filter((f) => f.startsWith('cat-'))
  const practical = filters.filter(
    (f) => !SIGNAL_FILTER_IDS.has(f) && !f.startsWith('cat-'),
  )

  let list = [...EXPERIENCES]
  if (signals.length || categories.length || practical.length) {
    list = list.filter((e) => {
      const signalOk = !signals.length || signals.some((f) => matchesCityFilter(e, f))
      const catOk = !categories.length || categories.some((f) => matchesCityFilter(e, f))
      const pracOk = !practical.length || practical.every((f) => matchesCityFilter(e, f))
      return signalOk && catOk && pracOk
    })
  }
  return list.sort(
    (a, b) => scoreExperience(b, basics, selectedIds) - scoreExperience(a, basics, selectedIds),
  )
}

export function comparisonCities(ranked: RankedCity[], limit = 4): RankedCity[] {
  return ranked.slice(0, limit)
}

export function densityMeter(level: ExploreCity['experienceDensity']): number {
  if (level === 'High') return 5
  if (level === 'Medium') return 3
  return 1
}
