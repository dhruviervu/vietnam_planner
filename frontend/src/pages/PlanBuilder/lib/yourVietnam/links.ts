import type { Hotel } from '../../types'
import type { ItemKind } from './types'
import { activitiesCityPath, cityAnchorId, experiencesCityPath } from '../../services/citySlug'

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

export function gettingAroundLongUrl() {
  return '/plan/builder/transport#world-long'
}

export function gettingAroundUrbanUrl() {
  return '/plan/builder/transport#world-urban'
}

export function airportTransfersUrl() {
  return '/plan/builder/airport'
}

export function whereToStayUrl() {
  return '/plan/builder/stay'
}

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

export function activitiesCityUrl(city: string) {
  return activitiesCityPath(city)
}

export function activitiesCitySectionTo(city: string) {
  return { pathname: '/plan/builder/activities', hash: `#${cityAnchorId(city)}` }
}

export function foodUrl() {
  return '/plan/builder/eat'
}

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

/** Keep the itinerary pipeline alive when a builder page opens in a new tab. */
export function keepPipelineAlive() {
  try {
    sessionStorage.setItem('vn-itinerary-pipeline', '1')
    localStorage.setItem('vn-itinerary-pipeline', '1')
  } catch {
    /* ignore */
  }
}

/** New tab like ExperienceCard; same tab if the preview blocks popups. */
export function openDetailHref(href: string, e?: { preventDefault: () => void }): 'new-tab' | 'same-tab' {
  e?.preventDefault()
  keepPipelineAlive()
  const w = window.open(href, '_blank')
  if (w) return 'new-tab'
  window.location.assign(href)
  return 'same-tab'
}
