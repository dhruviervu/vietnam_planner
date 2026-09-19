import { describe, expect, it } from 'vitest'
import { EXPERIENCES } from '../data/experiences'
import {
  EXPERIENCE_GUIDES,
  getExperienceGuide,
  wordCount,
} from '../data/experienceGuides'
import {
  isDeepHeritageSight,
  isLightVisitorGuideSight,
} from '../data/heritageDeepSights'

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function contrastOnly(sentence: string, token: string): boolean {
  const f = fold(sentence)
  if (!f.includes(token)) return false
  return /\b(not|unlike|different from|do not confuse|is not|rather than|instead of|not a|counterpart|without flying|smaller than|more dated than|compared to|than hoa lo|than war remnants)\b/.test(
    f,
  )
}

function isOwnLandmark(e: { id: string; name: string }, token: string): boolean {
  const blob = fold(`${e.id} ${e.name}`)
  return token.split(' ').every((w) => w.length < 3 || blob.includes(w))
}

const FOREIGN_LANDMARKS: { token: string; cities: string[] }[] = [
  { token: 'hoa lu', cities: ['Ninh Binh'] },
  { token: 'trang an', cities: ['Ninh Binh'] },
  { token: 'hoan kiem', cities: ['Hanoi'] },
  { token: 'temple of literature', cities: ['Hanoi'] },
  { token: 'war remnants', cities: ['Ho Chi Minh City'] },
  { token: 'independence palace', cities: ['Ho Chi Minh City'] },
  { token: 'po nagar', cities: ['Nha Trang'] },
]

describe('visitor guides match the sight', () => {
  it('does not put Hoa Lu history on a Nha Trang boat', () => {
    const nhaTrangBoats = EXPERIENCES.filter(
      (e) =>
        e.city === 'Nha Trang' &&
        /boat|island|snorkel|cruise|sampan/i.test(`${e.id} ${e.name}`),
    )
    expect(nhaTrangBoats.length).toBeGreaterThan(3)
    for (const e of nhaTrangBoats) {
      const guide = fold(getExperienceGuide(e.id))
      expect(guide, e.id).not.toMatch(/hoa lu/)
      expect(guide, e.id).not.toMatch(/trang an/)
    }
  })

  it('keeps the Trang An boat guide about the Ninh Binh sampan', () => {
    const guide = getExperienceGuide('trang-an-boats')
    expect(guide).toMatch(/Tràng An|Trang An/)
    expect(guide).toMatch(/Ninh B[iì]nh/i)
    expect(guide).toMatch(/sampan|rower|cave/i)
    expect(fold(guide)).toMatch(/not a nha trang/)
    expect(fold(guide)).not.toMatch(/hon mun|po nagar/)
    expect(wordCount(guide)).toBeLessThan(450)
  })

  it('does not leak other-city landmarks except as a contrast', () => {
    const leaks: string[] = []
    for (const e of EXPERIENCES) {
      const guide = getExperienceGuide(e.id)
      if (!guide.trim()) continue
      const sentences = guide.split(/(?<=[.!?])\s+/)
      for (const mark of FOREIGN_LANDMARKS) {
        if (mark.cities.includes(e.city)) continue
        if (isOwnLandmark(e, mark.token)) continue
        for (const sentence of sentences) {
          if (!fold(sentence).includes(mark.token)) continue
          if (contrastOnly(sentence, mark.token)) continue
          leaks.push(`${e.id} → ${mark.token}: ${sentence.slice(0, 120)}`)
        }
      }
    }
    expect(leaks).toEqual([])
  })

  it('heritage guides talk about this sight, boats stay short essentials', () => {
    const thinHeritage: string[] = []
    const paddedBoats: string[] = []
    for (const e of EXPERIENCES) {
      const guide = getExperienceGuide(e.id)
      if (isDeepHeritageSight(e)) {
        const tokens = fold(e.name)
          .split(' ')
          .filter((w) => w.length > 3)
          .slice(0, 2)
        const f = fold(guide)
        if (tokens.length && !tokens.some((t) => f.includes(t))) {
          thinHeritage.push(e.id)
        }
      }
      if (isLightVisitorGuideSight(e)) {
        const curated = EXPERIENCE_GUIDES[e.id] || ''
        if (getExperienceGuide(e.id) !== curated) paddedBoats.push(e.id)
      }
    }
    expect(thinHeritage).toEqual([])
    expect(paddedBoats).toEqual([])
  })
})
