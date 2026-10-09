import { SIGHT_CATALOG } from '../data/experiences'
import { getExperienceMedia } from '../data/experienceMedia'
import { SIGHT_VIDEO_OVERRIDES } from '../data/sightVideoOverrides'
import { getExperienceImages } from './pricing'
import { filterMatchingVideos } from './sightVideoMatch'
import type { Experience } from '../types'

const CATALOG_REFS = SIGHT_CATALOG.map((e) => ({ id: e.id, name: e.name, city: e.city }))

export function googlePlacePhotoUrls(experienceId: string): string[] {
  return Array.from({ length: 10 }, (_, i) => `/api/place-photos/${experienceId}/${i}`)
}

export function getExperienceDetailPhotos(experience: Experience): string[] {
  const media = getExperienceMedia(experience.id)?.photos ?? []
  const rest = getExperienceImages(experience)
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of [...media, ...rest]) {
    if (!url || url.startsWith('/api/place-photos/') || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

export function hasCuratedSightVideos(experienceId: string) {
  return (SIGHT_VIDEO_OVERRIDES[experienceId]?.length ?? 0) > 0
}

/** Curated overrides win as-is; auto-fetched media still goes through title matching. */
export function getExperienceDetailVideos(experience: Experience) {
  const override = SIGHT_VIDEO_OVERRIDES[experience.id]
  if (override?.length) return override

  const sight = { id: experience.id, name: experience.name, city: experience.city }
  const raw = getExperienceMedia(experience.id)?.videos ?? []
  return filterMatchingVideos(raw, sight, CATALOG_REFS)
}
