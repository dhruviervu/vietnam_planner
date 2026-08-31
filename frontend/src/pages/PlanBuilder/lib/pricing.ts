import type { Experience, PriceType } from '../types'
import { getExperienceMedia } from '../data/experienceMedia'
import { EXPERIENCE_IMAGES } from '../data/experienceImages'
import { withPhotoFallbacks } from './resolveCatalogPhotos'

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

export function getExperienceImages(
  experience: Pick<Experience, 'id' | 'name' | 'city' | 'category' | 'hook' | 'images' | 'seeds'>,
) {
  const media = getExperienceMedia(experience.id)?.photos ?? []
  const curated = EXPERIENCE_IMAGES[experience.id] ?? []
  const inline = experience.images ?? []
  const hint = `${experience.id} ${experience.name} ${experience.category} ${experience.city} ${experience.hook}`
  const resolved = withPhotoFallbacks([...media, ...curated, ...inline], hint)
  if (resolved.length) return resolved
  return experience.seeds.map((seed) => `https://picsum.photos/seed/${seed}/880/560`)
}
