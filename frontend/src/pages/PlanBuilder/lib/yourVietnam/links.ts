import type { Hotel } from '../../types'

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function restaurantMapsUrl(name: string, city: string) {
  return mapsSearchUrl(`${name} ${city} Vietnam`)
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

export function experiencesUrl() {
  return '/plan/builder/experiences'
}

export function activitiesUrl() {
  return '/plan/builder/activities'
}

export function foodUrl() {
  return '/plan/builder/eat'
}
