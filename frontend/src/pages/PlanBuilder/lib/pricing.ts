import type { Experience, PriceType } from '../types'
import { getExperienceMedia } from '../data/experienceMedia'
import { EXPERIENCE_IMAGES } from '../data/experienceImages'
import { catalogCardPhotoUrl, rankPhotosForSight, withPhotoFallbacks } from './resolveCatalogPhotos'

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

function rankedSightPhotos(
  experience: Pick<Experience, 'id' | 'name' | 'city' | 'category' | 'hook' | 'images' | 'seeds'>,
) {
  const media = getExperienceMedia(experience.id)?.photos ?? []
  const curated = EXPERIENCE_IMAGES[experience.id] ?? []
  const inline = experience.images ?? []
  const ranked = rankPhotosForSight([...media, ...curated, ...inline], experience)
  const hint = `${experience.id} ${experience.name} ${experience.category} ${experience.city} ${experience.hook}`
  return withPhotoFallbacks(ranked, hint)
}

export function getExperienceImages(
  experience: Pick<Experience, 'id' | 'name' | 'city' | 'category' | 'hook' | 'images' | 'seeds'>,
) {
  const resolved = rankedSightPhotos(experience)
  if (resolved.length) return resolved
  return [
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
  ]
}

/** Catalog cards only need a couple of modest thumbs, not the full 1280px gallery. */
export function getExperienceCardPhotos(
  experience: Pick<Experience, 'id' | 'name' | 'city' | 'category' | 'hook' | 'images' | 'seeds'>,
  limit = 3,
) {
  const resolved = rankedSightPhotos(experience).slice(0, limit).map(catalogCardPhotoUrl)
  if (resolved.length) return resolved
  return experience.seeds
    .slice(0, limit)
    .map((seed) => `https://picsum.photos/seed/${seed}/640/400`)
}
