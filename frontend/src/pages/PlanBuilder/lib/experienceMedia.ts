import { getExperienceMedia } from '../data/experienceMedia'
import { getExperienceImages } from './pricing'
import type { Experience } from '../types'

export function getExperienceDetailPhotos(experience: Experience): string[] {
  return getExperienceImages(experience)
}

export function getExperienceDetailVideos(experience: Experience) {
  return getExperienceMedia(experience.id)?.videos ?? []
}
