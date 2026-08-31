import type { Experience } from '../types'
import { getExperienceImages } from './pricing'

/** Pick a photo of this experience that fits the visitor-guide section title. */
export function imageForGuideSection(
  title: string,
  experience: Experience,
  index: number,
): string {
  const photos = getExperienceImages(experience)
  if (!photos.length) return ''
  const t = title.toLowerCase()
  const pick = (i: number) => photos[Math.min(Math.max(i, 0), photos.length - 1)]!

  if (/histor|setting|heritage|living place/.test(t)) return pick(1)
  if (/eat|food|drink/.test(t)) return pick(Math.min(2, photos.length - 1))
  if (/getting there|finding your way/.test(t)) return pick(Math.min(3, photos.length - 1))
  if (/crowd/.test(t)) return pick(0)
  if (/season|pack|caring|environment/.test(t)) return pick(Math.min(4, photos.length - 1))
  if (/practical|how long|choose/.test(t)) return pick(Math.min(2, photos.length - 1))
  if (/experience|what it is|^the /.test(t)) return pick(0)
  return pick(index % photos.length)
}
