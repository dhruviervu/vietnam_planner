import { EXPERIENCES } from '../../PlanBuilder/data/experiences'
import { TEMPLATE_SECTIONS } from './sections'
import { ITINERARY_TEMPLATES } from './templates'
import type { ItineraryTemplate, TemplatePace, TemplateSectionId, TemplateTag } from './types'

const SECTION_TAGS: Record<TemplateSectionId, TemplateTag[]> = {
  solo: ['Solo'],
  couples: ['Couple'],
  'family-young': ['Family'],
  'family-older': ['Family'],
  friends: ['Friends'],
  'large-groups': ['Group'],
  budget: ['Budget'],
  relaxed: ['Relaxing'],
  beaches: ['Beach'],
  food: ['Food'],
  adventure: ['Adventure'],
  luxury: ['Luxury'],
  'first-time': ['First-timer'],
  reset: ['Reset'],
  'max-experience': ['First-timer'],
}

const SECTION_PACE: Record<TemplateSectionId, TemplatePace> = {
  solo: 'balanced',
  couples: 'relaxed',
  'family-young': 'relaxed',
  'family-older': 'packed',
  friends: 'packed',
  'large-groups': 'balanced',
  budget: 'packed',
  relaxed: 'relaxed',
  beaches: 'relaxed',
  food: 'packed',
  adventure: 'packed',
  luxury: 'relaxed',
  'first-time': 'balanced',
  reset: 'relaxed',
  'max-experience': 'packed',
}

const SECTION_CITIES: Record<TemplateSectionId, string[]> = {
  solo: ['Hanoi', 'Hoi An'],
  couples: ['Hoi An', 'Ha Long Bay'],
  'family-young': ['Hoi An', 'Da Nang'],
  'family-older': ['Hanoi', 'Hoi An', 'Da Nang'],
  friends: ['Hanoi', 'Hoi An', 'Ho Chi Minh City'],
  'large-groups': ['Da Nang', 'Hoi An'],
  budget: ['Hanoi', 'Hue', 'Hoi An'],
  relaxed: ['Hue', 'Hoi An'],
  beaches: ['Phu Quoc', 'Da Nang', 'Nha Trang'],
  food: ['Hanoi', 'Hue', 'Hoi An', 'Ho Chi Minh City'],
  adventure: ['Sapa', 'Ha Giang', 'Ninh Binh', 'Phong Nha', 'Da Lat'],
  luxury: ['Ha Long Bay', 'Da Nang', 'Ho Chi Minh City', 'Con Dao'],
  'first-time': ['Hanoi', 'Ha Long Bay', 'Hoi An', 'Ho Chi Minh City'],
  reset: ['Hoi An', 'Phu Quoc', 'Hue'],
  'max-experience': ['Hanoi', 'Ha Long Bay', 'Hoi An', 'Ho Chi Minh City'],
}

function cityKey(value: string) {
  const s = value.toLowerCase()
  if (s.includes('ho chi minh') || s.includes('saigon') || s.includes('hcmc')) return 'hcmc'
  if (s.includes('hoi an')) return 'hoi-an'
  if (s.includes('da nang') || s.includes('đà nẵng')) return 'da-nang'
  if (s.includes('yen tu') || s.includes('yên tử') || s.includes('yen tử')) return 'yen-tu'
  if (s.includes('ha long') || s.includes('quang ninh') || s.includes('cat ba') || s.includes('lan ha'))
    return 'ha-long'
  if (s.includes('ninh binh')) return 'ninh-binh'
  if (s.includes('cao bang') || s.includes('caobang') || s.includes('ban gioc') || s.includes('bản giốc'))
    return 'cao-bang'
  if (s.includes('ha giang') || s.includes('dong van')) return 'ha-giang'
  if (s.includes('phu quoc')) return 'phu-quoc'
  if (s.includes('nha trang')) return 'nha-trang'
  if (s.includes('da lat') || s.includes('dalat')) return 'dalat'
  if (s.includes('phong nha')) return 'phong-nha'
  if (s.includes('cat tien') || s.includes('cát tiên') || s.includes('cattien')) return 'cat-tien'
  if (s.includes('can tho') || s.includes('mekong')) return 'mekong'
  if (s.includes('vinh hy') || s.includes('nui chua') || s.includes('amanoi')) return 'vinh-hy'
  if (s.includes('quy nhon') || s.includes('bai san ho') || s.includes('bãi san hô') || s.includes('phu yen'))
    return 'quy-nhon'
  if (s.includes('hanoi') || s.includes('hà nội')) return 'hanoi'
  if (s.includes('hue') || s.includes('huế')) return 'hue'
  if (s.includes('sapa')) return 'sapa'
  return s.trim()
}

function lengthScore(template: ItineraryTemplate) {
  const typical = (template.minDays + template.maxDays) / 2
  if (typical >= 7 && typical <= 14) return 28
  if (typical >= 5 && typical <= 16) return 14
  return 4
}

function experiencePopularity(cities: string[]) {
  const keys = new Set(cities.map(cityKey))
  const hits = EXPERIENCES.filter(
    (e) => keys.has(cityKey(e.city)) || keys.has(cityKey(e.region)),
  )
  if (!hits.length) return 40
  const mean = hits.reduce((s, e) => s + (e.popularityRank ?? 50), 0) / hits.length
  return Math.max(0, 90 - mean)
}

function templateScore(template: ItineraryTemplate): number {
  const wantedTags = SECTION_TAGS[template.section]
  const tagHit = template.tags.filter((tag) => wantedTags.includes(tag)).length
  const paceHit = template.pace === SECTION_PACE[template.section] ? 18 : 0
  const signature = SECTION_CITIES[template.section] ?? []
  const cityHit = template.cities.reduce((n, city) => {
    const key = cityKey(city)
    return n + (signature.some((c) => cityKey(c) === key) ? 8 : 0)
  }, 0)
  return (
    tagHit * 36 +
    paceHit +
    Math.min(24, cityHit) +
    lengthScore(template) +
    experiencePopularity(template.cities) * 0.35
  )
}

const RANK_BY_ID: Record<string, number> = {}

for (const section of TEMPLATE_SECTIONS) {
  const ranked = ITINERARY_TEMPLATES.filter((t) => t.section === section.id).sort((a, b) => {
    const diff = templateScore(b) - templateScore(a)
    if (Math.abs(diff) > 0.01) return diff
    return a.title.localeCompare(b.title)
  })
  ranked.forEach((template, i) => {
    RANK_BY_ID[template.id] = i + 1
  })
}

export function rankInSection(template: ItineraryTemplate): number {
  return RANK_BY_ID[template.id] ?? 99
}

export function rankedTemplatesForSection(section: TemplateSectionId) {
  return ITINERARY_TEMPLATES.filter((t) => t.section === section)
    .slice()
    .sort((a, b) => rankInSection(a) - rankInSection(b) || a.title.localeCompare(b.title))
}

export function sortBySectionRank(templates: ItineraryTemplate[]) {
  return templates
    .slice()
    .sort((a, b) => rankInSection(a) - rankInSection(b) || a.title.localeCompare(b.title))
}
