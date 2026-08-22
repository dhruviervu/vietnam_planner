import type { Experience, PriceType } from '../types'

export function formatFromPrice(price: number, priceType: PriceType): string {
  if (priceType === 'free' || price === 0) return 'Free'
  const amount = `From $${price}`
  if (priceType === 'per_person') return `${amount} / person`
  if (priceType === 'per_group') return `${amount} / group`
  if (priceType === 'per_ticket') return `${amount} / ticket`
  return amount
}

export function priceTypeFromLegacy(costUsd: number, costLabel: string): PriceType {
  if (costUsd === 0 || /free/i.test(costLabel)) return 'free'
  return 'per_person'
}

export function getExperienceImages(experience: Pick<Experience, 'id' | 'images' | 'seeds'>) {
  if (experience.images?.length) return experience.images
  return experience.seeds.map((seed) => `https://picsum.photos/seed/${seed}/880/560`)
}
