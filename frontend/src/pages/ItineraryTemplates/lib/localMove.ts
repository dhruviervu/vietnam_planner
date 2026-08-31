import { cityKey } from './cityKey'
import type { TemplateSectionId } from '../data/types'

export type LocalMovePlan = {
  name: string
  icon: string
  reason: string
  durationLabel: string
}

const SCOOTER_CITIES = new Set(['hoi-an', 'da-nang', 'hcmc', 'nha-trang', 'phu-quoc', 'dalat', 'hue'])
const DRIVER_COUNTRY = new Set([
  'ha-giang',
  'sapa',
  'ninh-binh',
  'phong-nha',
  'mekong',
  'cat-tien',
  'vinh-hy',
  'quy-nhon',
  'yen-tu',
  'cao-bang',
])

export function localMoveFor(
  city: string,
  people: number,
  section: TemplateSectionId,
): LocalMovePlan {
  const key = cityKey(city)
  const party = Math.max(1, people)

  if (section === 'luxury') {
    return {
      name: 'Private driver',
      icon: '🚘',
      reason: 'Door-to-door, no parking hunt — the calm version of a full day.',
      durationLabel: 'As needed',
    }
  }

  if (party >= 6) {
    return {
      name: party >= 8 ? 'Private van or two taxis' : 'Private chauffeur or two taxis',
      icon: '🚐',
      reason: `A group of ${party} should not rent a fleet of scooters. One van or a pair of taxis keeps the day together.`,
      durationLabel: 'As needed',
    }
  }

  if (section === 'family-young') {
    return {
      name: 'Taxi / Grab',
      icon: '🚕',
      reason: 'Car seats, bags, and nap windows — a car is the honest in-city move with little kids.',
      durationLabel: '10–25 min hops',
    }
  }

  if (key === 'ha-long') {
    return {
      name: 'Taxi to the pier',
      icon: '🚕',
      reason: 'Harbour transfer, then the boat is the day. Skip scooters on the bay.',
      durationLabel: '20–40 min to the pier',
    }
  }

  if (DRIVER_COUNTRY.has(key)) {
    return {
      name: 'Private driver',
      icon: '🚘',
      reason: `${city} is countryside and distance — a driver for the day is the usable plan, not a rental scooter.`,
      durationLabel: 'Half- or full-day',
    }
  }

  if (key === 'hanoi') {
    if (party <= 2) {
      return {
        name: 'Walk + Grab',
        icon: '🚶',
        reason: 'The Old Quarter is faster on foot. Grab for West Lake, train street, or a late night back.',
        durationLabel: '8–20 min',
      }
    }
    return {
      name: 'Taxi / Grab',
      icon: '🚕',
      reason: 'Old Quarter walking, then cars for anything across the lake or after dark.',
      durationLabel: '10–25 min hops',
    }
  }

  if (party <= 2 && SCOOTER_CITIES.has(key) && section !== 'family-older') {
    return {
      name: 'Rental scooter',
      icon: '🏍',
      reason: `${city} is scooter country for a pair — beaches, tailors, and evening rides. Helmets on; skip it in hard rain.`,
      durationLabel: 'Day rental',
    }
  }

  if (party <= 5) {
    return {
      name: 'Taxi / Grab',
      icon: '🚕',
      reason: 'A car for three to five people is cheaper than a stack of scooters and easier after dinner.',
      durationLabel: '10–25 min hops',
    }
  }

  return {
    name: 'Private chauffeur',
    icon: '🚘',
    reason: 'The simple group move: one driver, one plan, nobody left on a second bike.',
    durationLabel: 'As needed',
  }
}
