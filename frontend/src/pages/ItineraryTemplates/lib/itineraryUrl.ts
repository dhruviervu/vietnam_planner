import type { TripShape } from '../data/types'

/** Shape days filter the catalog only — never rewrite a card’s authored length. */
export function itineraryTemplateUrl(id: string, shape?: TripShape) {
  const params = new URLSearchParams()
  if (shape?.people != null) params.set('people', String(shape.people))
  const q = params.toString()
  return `/plan/itinerary-templates/${id}${q ? `?${q}` : ''}`
}
