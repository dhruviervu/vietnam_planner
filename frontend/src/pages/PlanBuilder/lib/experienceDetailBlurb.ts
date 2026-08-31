import type { Experience } from '../types'

/** ~50-word overview for the detail data card — always anchored to this item. */
export function getExperienceDetailBlurb(experience: Experience): string {
  const source =
    experience.cardSummary?.trim() ||
    `${experience.name}: ${experience.whyGo} ${experience.hook}`.trim()
  const words = source.split(/\s+/).filter(Boolean)
  const text = words.length <= 55 ? source : `${words.slice(0, 55).join(' ')}…`
  if (text.toLowerCase().includes(experience.name.toLowerCase().slice(0, 12))) return text
  return `${experience.name} — ${text}`
}
