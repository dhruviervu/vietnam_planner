import type { PlaceId } from '../data/types'

export const CITY_EMOJIS: Record<string, string> = {
  hanoi: '🏛️',
  'ha-giang': '🏍️',
  sapa: '⛰️',
  'ha-long': '⛵',
  'ninh-binh': '🌾',
  'phong-nha': '🕳️',
  hue: '🏯',
  'da-nang': '🏖️',
  'hoi-an': '🏮',
  'nha-trang': '🌊',
  dalat: '🌸',
  hcmc: '🌆',
  mekong: '🛶',
  'can-tho': '🛶',
  'phu-quoc': '🏝️',
  'con-dao': '🏝️',
  'ha-tien': '🌅',
}

export function cityEmoji(id: PlaceId | string) {
  return CITY_EMOJIS[id] ?? '📍'
}

/** Standard map marker for all cities on the long-distance map. */
export const MAP_CITY_PIN = '📍'

export function mapCityPin() {
  return MAP_CITY_PIN
}
