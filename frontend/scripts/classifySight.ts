import type { Experience } from '../src/pages/PlanBuilder/types'
import { isDeepHeritageSight } from '../src/pages/PlanBuilder/data/heritageDeepSights'

export type SightContentCategory =
  | 'historic_cultural'
  | 'unesco_heritage'
  | 'sacred_religious'
  | 'museum_memorial'
  | 'natural_scenic'
  | 'caves_karst'
  | 'beaches_islands'
  | 'parks_squares_lakes'
  | 'urban_markets_food'
  | 'adventure_activity'
  | 'nightlife'

export type SightTier = 'Tier 1' | 'Tier 2' | 'Tier 3'

export type ClassifiedSight = {
  id: string
  name: string
  location: string
  city: string
  region: string
  appCategory: string
  contentCategory: SightContentCategory
  tier: SightTier
  heritage: boolean
  paragraphs: number
  keywords: string[]
  about: string
  hook: string
  cardSummary: string
  wikiAnchor: string
  hours: string
  durationLabel: string
  durationHours: number
  whyGo: string
}

const UNESCO =
  /\b(unesco|world heritage|geopark|ha long|halong|trang an|my son|mỹ sơn|hoi an ancient|phong nha|ke bang|kẻ bàng|thang long|thăng long|hue citadel|imperial city)\b/i

const SACRED =
  /\b(temple|pagoda|chua|chùa|den |đền|tomb|mausoleum|cathedral|church|mosque|wat |shrine|bodhisattva|buddha|cao dai|cao đài|mariamman|jade emperor)\b/i

const MUSEUM =
  /\b(museum|prison|memorial|palace|opera|citadel|fortress|flag tower|independence palace|war remnant)\b/i

const CAVE =
  /\b(cave|hang |karst|grotto|paradise cave|phong nha|sung sot|dark cave)\b/i

const BEACH =
  /\b(beach|snorkel|island|bay cruise|promenade|lagoon swim)\b/i

const PARK =
  /\b(park|garden|square|lake|promenade|flower|viewpoint|waterfall|reservoir)\b/i

const MARKET_FOOD =
  /\b(market|night market|cooking|food tour|bia hoi|bia hơi|street food|cafe|coffee)\b/i

const ADVENTURE =
  /\b(trek|hike|loop|pass|kayak|cable|climb|motorbike|jeep|raft|zip)\b/i

const NIGHT =
  /\b(night|lantern|karaoke|bar|nightlife)\b/i

function blob(e: Experience): string {
  return `${e.id} ${e.name} ${e.category} ${e.tags.join(' ')} ${e.dna.join(' ')} ${e.sightSection ?? ''} ${e.hook}`
}

export function classifySight(e: Experience): {
  contentCategory: SightContentCategory
  tier: SightTier
} {
  const t = blob(e)
  if (NIGHT.test(t) && !SACRED.test(t) && e.category === 'Nightlife') {
    return { contentCategory: 'nightlife', tier: 'Tier 3' }
  }
  if (MARKET_FOOD.test(t) && (e.category === 'Food' || /market/i.test(t))) {
    return { contentCategory: 'urban_markets_food', tier: 'Tier 3' }
  }
  if (BEACH.test(t) && !/lan ha|ha long|halong|trang an|tam coc/i.test(t)) {
    return { contentCategory: 'beaches_islands', tier: 'Tier 3' }
  }
  if (CAVE.test(t) || /ninh binh|tam coc|trang an|phong nha/i.test(t)) {
    return { contentCategory: 'caves_karst', tier: UNESCO.test(t) ? 'Tier 2' : 'Tier 2' }
  }
  if (UNESCO.test(t) && (SACRED.test(t) || MUSEUM.test(t) || e.category === 'History' || e.category === 'Culture')) {
    return { contentCategory: 'unesco_heritage', tier: 'Tier 1' }
  }
  if (UNESCO.test(t) && (e.category === 'Nature' || CAVE.test(t))) {
    return { contentCategory: 'unesco_heritage', tier: 'Tier 2' }
  }
  if (SACRED.test(t)) {
    return { contentCategory: 'sacred_religious', tier: 'Tier 1' }
  }
  if (MUSEUM.test(t) || e.category === 'History') {
    return { contentCategory: 'museum_memorial', tier: 'Tier 1' }
  }
  if (ADVENTURE.test(t) && e.category === 'Adventure') {
    return { contentCategory: 'adventure_activity', tier: 'Tier 2' }
  }
  if (e.category === 'Nature' || ADVENTURE.test(t)) {
    return { contentCategory: 'natural_scenic', tier: 'Tier 2' }
  }
  if (PARK.test(t) || e.category === 'Cities') {
    return { contentCategory: 'parks_squares_lakes', tier: 'Tier 3' }
  }
  if (e.category === 'Culture') {
    return { contentCategory: 'historic_cultural', tier: 'Tier 1' }
  }
  return { contentCategory: 'historic_cultural', tier: 'Tier 1' }
}

function wikiUsable(
  wiki: { title?: string; extract?: string } | undefined,
  e: Experience,
): wiki is { title: string; extract: string } {
  if (!wiki?.title || !wiki.extract || wiki.extract.length < 80) return false
  const t = wiki.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const name = e.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const tokens = name.replace(/[()]/g, ' ').split(/\s+/).filter((w) => w.length > 2)
  if (!tokens.length) return false
  const hits = tokens.filter((w) => t.includes(w)).length
  if (hits < Math.min(2, tokens.length)) return false
  if (t === e.city.toLowerCase() || t === 'vietnam') return false
  return true
}

function firstSentences(text: string, n = 2): string {
  const raw = text.replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  const parts = raw.match(/[^.!?]+[.!?]+(?:["”'])?|[^.!?]+$/g) ?? [raw]
  return parts
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6)
    .filter((s) => !/^(see also|references|external links|bibliography)\b/i.test(s))
    .slice(0, n)
    .join(' ')
}

export function extractKeywords(
  e: Experience,
  wiki?: { title?: string; extract?: string },
): string[] {
  const keys: string[] = []
  const push = (s: string) => {
    const t = s.replace(/\s+/g, ' ').trim()
    if (!t || keys.some((k) => k.toLowerCase() === t.toLowerCase())) return
    keys.push(t)
  }
  for (const tag of e.tags.slice(0, 4)) push(tag)
  for (const d of e.dna.slice(0, 2)) push(d)
  if (e.sightSection) push(e.sightSection)
  if (wikiUsable(wiki, e)) {
    const snippet = firstSentences(wiki.extract.split(/\n(?=See also|References|External links|==)/i)[0] || wiki.extract, 2)
    if (snippet) push(snippet.slice(0, 280))
  } else {
    const hook = firstSentences(`${e.about} ${e.hook}`, 1)
    if (hook) push(hook.slice(0, 180))
  }
  if (e.hours) push(`typical hours ${e.hours}`)
  if (e.durationLabel) push(`visit length ${e.durationLabel}`)
  return keys.slice(0, 6)
}

export function classifiedFromExperience(
  e: Experience,
  wiki?: { title?: string; extract?: string },
): ClassifiedSight {
  const { contentCategory, tier } = classifySight(e)
  const heritage = isDeepHeritageSight(e)
  const paragraphs = heritage || tier === 'Tier 1' ? 4 : tier === 'Tier 2' ? 3 : 2
  return {
    id: e.id,
    name: e.name,
    location: e.city === e.region ? e.city : `${e.city}, ${e.region}`,
    city: e.city,
    region: e.region,
    appCategory: e.category,
    contentCategory,
    tier,
    heritage,
    paragraphs,
    keywords: extractKeywords(e, wiki),
    about: e.about,
    hook: e.hook,
    cardSummary: e.cardSummary,
    wikiAnchor: wikiUsable(wiki, e)
      ? firstSentences(wiki.extract.split(/\n(?=See also|References|External links|==)/i)[0] || wiki.extract, 8)
      : '',
    hours: e.hours,
    durationLabel: e.durationLabel,
    durationHours: e.durationHours,
    whyGo: e.whyGo ?? '',
  }
}
