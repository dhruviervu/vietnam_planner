import type { PlaceId } from '../../GettingAround/data/types'

export type PackedDay = {
  city: string
  placeId: PlaceId
  sourceIds: string[]
}

export type PackedTemplate = {
  id: string
  kind: 'city' | 'country'
  title: string
  description: string
  days: number
  cities: string[]
  image: string
  previewNames: string[]
  dayPlans: PackedDay[]
  experienceIds: string[]
  shoppingIds: string[]
  allIds: string[]
  /** Packed JSON omits this; slow ideas set it so the catalog can section them. */
  pace?: 'packed' | 'slow'
}
