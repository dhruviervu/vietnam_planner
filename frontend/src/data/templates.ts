export type JourneyTemplate = {
  id: string
  name: string
  duration: string
  pace: 'Relaxed' | 'Moderate' | 'Packed'
  budget: 'Shoestring' | 'Mid' | 'Luxury'
  minDays: number
  maxDays: number
  regions: string[]
  hook: string
  image: string
}

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'classic-route',
    name: 'The Classic Route',
    duration: '12–14 days',
    pace: 'Moderate',
    budget: 'Mid',
    minDays: 12,
    maxDays: 14,
    regions: ['Hanoi', 'Ha Long Bay', 'Hue', 'Hoi An', 'HCMC'],
    hook: 'The definitive north-to-south arc — cities, coast, and culture in one sweep.',
    image: 'https://picsum.photos/seed/template-classic/800/640',
  },
  {
    id: 'slow-scenic',
    name: 'Slow & Scenic',
    duration: '7–10 days',
    pace: 'Relaxed',
    budget: 'Mid',
    minDays: 7,
    maxDays: 10,
    regions: ['Hoi An', 'Hue', 'Mekong Delta'],
    hook: 'Fewer stops, longer mornings — rivers, lanterns, and unhurried days.',
    image: 'https://picsum.photos/seed/template-slow/800/640',
  },
  {
    id: 'luxury-escape',
    name: 'Luxury Escape',
    duration: '7–10 days',
    pace: 'Relaxed',
    budget: 'Luxury',
    minDays: 7,
    maxDays: 10,
    regions: ['Ha Long Bay', 'Hoi An', 'HCMC'],
    hook: 'Bay cruises, boutique stays, and the polished side of the south.',
    image: 'https://picsum.photos/seed/template-luxury/800/640',
  },
  {
    id: 'culture-heritage',
    name: 'Culture & Heritage',
    duration: '10 days',
    pace: 'Moderate',
    budget: 'Mid',
    minDays: 10,
    maxDays: 10,
    regions: ['Hanoi', 'Hue', 'Hoi An'],
    hook: 'Citadels, old quarters, and living traditions between three historic hearts.',
    image: 'https://picsum.photos/seed/template-culture/800/640',
  },
  {
    id: 'adventure-nature',
    name: 'Adventure & Nature',
    duration: '10–12 days',
    pace: 'Packed',
    budget: 'Mid',
    minDays: 10,
    maxDays: 12,
    regions: ['Sapa', 'Ha Long Bay', 'HCMC'],
    hook: 'Highlands, karsts, and city energy — for travelers who want movement.',
    image: 'https://picsum.photos/seed/template-adventure/800/640',
  },
]

export function getTemplateById(id: string) {
  return JOURNEY_TEMPLATES.find((t) => t.id === id)
}
