import { PLACES } from '../../../GettingAround/data/places'
import type { PlaceId } from '../../../GettingAround/data/types'
import { mapLabelToPlaceId } from '../../../GettingAround/lib/placeLabels'

function fold(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function resolvePlaceId(city?: string, region?: string): PlaceId | null {
  if (city) {
    const fromCity = mapLabelToPlaceId(city)
    if (fromCity) return fromCity
    const folded = fold(city)
    const byLabel = PLACES.find((p) => fold(p.label) === folded)
    if (byLabel) return byLabel.id
  }
  if (region) return mapLabelToPlaceId(region)
  return null
}
