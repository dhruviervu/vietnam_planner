import type { Hotel } from '../../types'

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function restaurantMapsUrl(name: string, city: string, address?: string) {
  return mapsSearchUrl(address ? `${name}, ${address}, ${city}, Vietnam` : `${name} ${city} Vietnam`)
}

export function placeMapsUrl(name: string, city: string) {
  return mapsSearchUrl(`${name} ${city} Vietnam`)
}

export function hotelMapsUrl(hotel: Hotel) {
  return mapsSearchUrl(hotel.mapsQuery ?? `${hotel.name} ${hotel.city}`)
}

export function gettingAroundUrl() {
  return '/plan/builder/transport'
}

export function airportTransfersUrl() {
  return '/plan/builder/airport'
}

export function whereToStayUrl() {
  return '/plan/builder/stay'
}

import { cityAnchorId, experiencesCityPath } from '../../services/cityCatalog'

export function experiencesUrl() {
  return '/plan/builder/experiences'
}

export function experiencesCityUrl(city: string) {
  return experiencesCityPath(city)
}

/** Main experiences catalog, scrolled to that city's section. */
export function experiencesCitySectionUrl(city: string) {
  return `/plan/builder/experiences#${cityAnchorId(city)}`
}

export function experiencesCitySectionTo(city: string) {
  return { pathname: '/plan/builder/experiences', hash: `#${cityAnchorId(city)}` }
}

export function activitiesUrl() {
  return '/plan/builder/activities'
}

export function foodUrl() {
  return '/plan/builder/eat'
}

import type { ItemKind } from './types'

/** Detail page (new tab) for an itinerary row — same destinations as catalog cards. */
export function itineraryItemHref(opts: {
  kind: ItemKind
  sourceId?: string
  mapsUrl?: string
}): string | undefined {
  if (opts.kind === 'experience' && opts.sourceId) {
    return `/plan/builder/experience/${opts.sourceId}`
  }
  if (opts.kind === 'activity' && opts.sourceId) {
    return `/plan/builder/activity/${opts.sourceId}`
  }
  return opts.mapsUrl
}

/** New tab like ExperienceCard; same tab if the preview blocks popups. */
export function openDetailHref(href: string, e?: { preventDefault: () => void }): 'new-tab' | 'same-tab' {
  e?.preventDefault()
  const w = window.open(href, '_blank')
  if (w) return 'new-tab'
  window.location.assign(href)
  return 'same-tab'
}
