import { EXPERIENCES } from '../../data/experiences'
import { occupancyFamilyExperience } from './tripIntelligence'
import type { Experience } from '../../types'
import type { ItineraryItem } from './types'

export function sightRoi(e: Experience): number {
  let s = 0
  if (e.vietnamBest || e.signal === 'must-do') s += 42
  if (e.featured) s += 12
  if (e.signal === 'picture-perfect' || e.signal === 'vietnam-special') s += 8
  s += Math.max(0, 28 - (e.popularityRank ?? 40))
  s += (e.rating - 4) * 12
  s += Math.min(8, (e.reviewCount ?? 0) / 400)
  return s
}

function cityKey(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function samePlace(e: Experience, item: ItineraryItem) {
  const city = cityKey(item.city)
  const region = cityKey(item.region)
  return cityKey(e.city) === city || cityKey(e.region) === city || cityKey(e.city) === region || cityKey(e.region) === region
}

function tokens(s: string) {
  return new Set(
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2),
  )
}

function overlap(a: string, b: string) {
  const A = tokens(a)
  const B = tokens(b)
  if (A.size === 0 || B.size === 0) return 0
  let n = 0
  for (const t of A) if (B.has(t)) n += 1
  return n / Math.min(A.size, B.size)
}

function similarityScore(current: Experience | undefined, e: Experience) {
  let score = 12 - Math.min(12, (e.popularityRank ?? 20) / 3)
  if (!current) return score + sightRoi(e) / 10
  if (e.category === current.category) score += 48
  const fam = occupancyFamilyExperience(current)
  if (fam && occupancyFamilyExperience(e) === fam) score += 36
  if (e.signal === current.signal) score += 8
  score += overlap(`${current.name} ${current.hook}`, `${e.name} ${e.hook}`) * 40
  return score
}

export function similarSightsFor(
  item: ItineraryItem,
  itinerarySourceIds: Set<string>,
  sameDaySourceIds: Set<string> = new Set(),
  limit = 6,
): Experience[] {
  const current = item.sourceId ? EXPERIENCES.find((e) => e.id === item.sourceId) : undefined
  const cityPool = EXPERIENCES.filter((e) => {
    if (item.sourceId && e.id === item.sourceId) return false
    if (sameDaySourceIds.has(e.id)) return false
    return samePlace(e, item)
  })
  const rank = (list: Experience[]) =>
    [...list]
      .map((e) => ({ e, score: similarityScore(current, e) }))
      .sort((a, b) => b.score - a.score)
      .map((row) => row.e)

  const free = rank(cityPool.filter((e) => !itinerarySourceIds.has(e.id)))
  if (free.length >= limit) return free.slice(0, limit)
  const fill = rank(cityPool.filter((e) => !free.some((x) => x.id === e.id)))
  return [...free, ...fill].slice(0, limit)
}

export function swapAdvice(current: Experience | undefined, candidate: Experience, cityAlts: Experience[]) {
  const candRoi = sightRoi(candidate)
  const curRoi = current ? sightRoi(current) : 20
  const better = cityAlts
    .filter((e) => e.id !== candidate.id)
    .sort((a, b) => sightRoi(b) - sightRoi(a))[0]
  const low = candRoi < curRoi - 6 && candRoi < 28
  if (low) {
    const altBit = better
      ? ` ${better.name} tends to linger longer in people’s trip notes, if you only have one slot.`
      : ''
    return {
      low: true as const,
      title: 'A quieter swap',
      body: `${candidate.name} is a gentler note in ${candidate.city} than ${current?.name ?? 'your current stop'}. If this window is tight, most first-time visitors keep the headline sight — or choose something with a little more staying power.${altBit}`,
    }
  }
  return {
    low: false as const,
    title: 'A strong trade',
    body: `${candidate.name} sits well beside the rest of your ${candidate.city} day — a confident swap if you want a change of scene.`,
  }
}
