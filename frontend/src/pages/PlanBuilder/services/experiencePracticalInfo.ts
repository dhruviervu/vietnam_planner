import type { Experience } from '../types'

export type BookAheadLevel = 'required' | 'recommended' | 'not needed'

export type PhysicalEffortInfo = {
  walkingIntensity: 1 | 2 | 3 | 4 | 5
  walkingLabel: string
  unevenTerrain: boolean
  stairs: boolean
  stepsDetail: string
}

export type ExperiencePracticalInfo = {
  bookAhead: BookAheadLevel
  whatToBring: string[]
  physicalEffort: PhysicalEffortInfo
}

const BOOK_AHEAD_OVERRIDES: Partial<Record<string, BookAheadLevel>> = {
  'halong-cruise': 'required',
  'lan-ha': 'required',
  'cat-ba': 'recommended',
  'ba-na-hills': 'required',
  'fansipan': 'required',
  'cu-chi': 'recommended',
  'cooking-class': 'required',
  'hanoi-food-tour': 'recommended',
  'phong-nha': 'recommended',
  'paradise-cave': 'recommended',
  'dark-cave': 'required',
  'phong-nha-cave-boat': 'recommended',
  'my-son': 'recommended',
  'hue-citadel': 'recommended',
  'ho-chi-minh-mausoleum': 'recommended',
  'independence-palace': 'recommended',
  'train-street': 'not needed',
  'bia-hoi': 'not needed',
  'egg-coffee': 'not needed',
  'old-quarter': 'not needed',
  'hoan-kiem-lake': 'not needed',
  'ben-thanh': 'not needed',
  'dong-xuan-market': 'not needed',
  'nguyen-hue-walking': 'not needed',
  'an-bang': 'not needed',
  'cuc-phuong': 'recommended',
  'bear-sanctuary-ninh-binh': 'recommended',
  'pho-co-hoa-lu': 'not needed',
  'phat-diem-cathedral': 'not needed',
  'da-lat-cathedral': 'not needed',
  'domaine-de-marie': 'not needed',
  'lam-vien-square': 'not needed',
  'da-lat-market': 'not needed',
  'french-quarter-dalat': 'not needed',
  'langbiang': 'recommended',
  'dambri-waterfall': 'recommended',
  'hundred-roofs-bar': 'not needed',
  'cua-dai-beach': 'not needed',
  'hoi-an-market': 'not needed',
  'precious-heritage-museum': 'not needed',
  'cu-lao-cham': 'recommended',
  'da-nang-beach': 'not needed',
  'nha-trang-promenade': 'not needed',
  'west-lake': 'not needed',
  'apartment-cafes': 'not needed',
  'dong-ba-market': 'not needed',
  'duong-dong-night-market': 'not needed',
  'xuan-huong-lake': 'not needed',
  'sung-sot-cave': 'recommended',
  'ti-top-island': 'recommended',
  'trang-an-boats': 'recommended',
  'tam-coc-boats': 'recommended',
  'ha-giang-loop': 'required',
  'sapa-trek': 'recommended',
}

function deriveBookAhead(e: Experience): BookAheadLevel {
  if (BOOK_AHEAD_OVERRIDES[e.id]) return BOOK_AHEAD_OVERRIDES[e.id]!

  if (e.price === 0 && e.signal === 'local-life') return 'not needed'
  if (/walk|market|street|quarter|promenade|lake|bridge|bia-hoi|coffee|sunset/i.test(e.id)) {
    return 'not needed'
  }
  if (e.featured || e.vietnamBest || e.popularityRank <= 12) {
    if (/cruise|food-tour|cooking|snorkel|loop|trek|kayak|dark-cave/i.test(e.id)) return 'required'
    return 'recommended'
  }
  if (e.category === 'History' || e.category === 'Culture' || e.crowdBase >= 4) {
    return 'recommended'
  }
  if (e.durationHours >= 5 && e.price >= 40) return 'recommended'
  return 'not needed'
}

function deriveWhatToBring(e: Experience): string[] {
  const items: string[] = []
  const w = e.accessibilityDetail.walking.toLowerCase()
  const steps = e.accessibilityDetail.steps.toLowerCase()
  const id = e.id
  const name = e.name.toLowerCase()

  if (/challenging|strenuous|trail|trek|loop|cave|mua|fansipan|giang|cat-cat|son-tra|marble/i.test(id + w)) {
    items.push('Sturdy walking shoes')
  } else if (/uneven|moderate|step|stone|boat/i.test(w + steps)) {
    items.push('Comfortable walking shoes')
  } else {
    items.push('Comfortable shoes')
  }

  if (e.durationHours >= 2.5 || e.signal === 'adventure' || e.category === 'Nature') {
    items.push('Water bottle')
  }

  if (
    e.category === 'Beaches' ||
    /beach|bay|cruise|island|snorkel|kayak|tam-coc|trang-an|ninh-binh|sapa|trek|delta|promenade|sun|marble|my-son|ba-na|golden/i.test(
      id + name,
    )
  ) {
    items.push('Sun protection')
  }

  if (/snorkel|swim|beach|sao-beach|phu-quoc|an-bang|my-khe|ti-top/i.test(id)) {
    items.push('Swimwear & towel')
  }

  if (/cave|dark-cave|phong-nha|paradise|sung-sot/i.test(id)) {
    items.push('Quick-dry clothing')
  }

  if (/temple|pagoda|citadel|mausoleum|tomb|thien-mu|bai-dinh|linh-ung|notre-dame|jade-emperor|dinh-cau/i.test(id + name)) {
    items.push('Shoulders & knees covered')
  }

  if (/coffee|egg-coffee|cafe|bia-hoi|karaoke/i.test(id)) {
    items.push('Cash for the bill')
  }

  if (/cu-chi|tunnel|war-remnants/i.test(id)) {
    items.push('Light long sleeves')
  }

  if (e.category === 'Nature' && e.durationHours >= 4) {
    items.push('Light rain layer')
  }

  if (/ha-giang|dong-van|fansipan|sapa-trek|mua-cave/i.test(id)) {
    items.push('Small daypack')
  }

  return [...new Set(items)].slice(0, 6)
}

function walkingIntensity(e: Experience): 1 | 2 | 3 | 4 | 5 {
  const w = e.accessibilityDetail.walking.toLowerCase()
  const id = e.id

  if (/mua-cave|fansipan|ha-giang-loop|sapa-trek|dark-cave|cu-chi|son-tra|marble-mountains|ba-na-hills/i.test(id)) {
    if (/mua-cave|fansipan|ha-giang|sapa-trek|dark-cave/i.test(id)) return 5
    return 4
  }

  if (/minimal|very easy|little walking/i.test(w)) return 1
  if (/^easy|light|short walks|easy on/i.test(w)) return 2
  if (/moderate/i.test(w)) return 3
  if (/challenging|considerable|significant/i.test(w)) return 4
  if (/strenuous|heavy|demanding|not suitable/i.test(w)) return 5
  return 3
}

function derivePhysicalEffort(e: Experience): PhysicalEffortInfo {
  const steps = e.accessibilityDetail.steps.toLowerCase()
  const w = e.accessibilityDetail.walking.toLowerCase()
  const id = e.id

  const unevenTerrain =
    /uneven|trail|terrain|karst|stone|rocky|plateau|terrace|loop|sidewalk|boarding|gravel|mud/i.test(
      steps + w + id,
    ) || e.signal === 'adventure'

  const stairs =
    /step|stairs|climb|steep|ascent|descent|many|viewpoint|mua|fansipan|marble|cave|citadel|tomb|pagoda|mountain/i.test(
      steps + id,
    )

  return {
    walkingIntensity: walkingIntensity(e),
    walkingLabel: e.accessibilityDetail.walking,
    unevenTerrain,
    stairs,
    stepsDetail: e.accessibilityDetail.steps,
  }
}

export function getExperiencePracticalInfo(experience: Experience): ExperiencePracticalInfo {
  return {
    bookAhead: deriveBookAhead(experience),
    whatToBring: deriveWhatToBring(experience),
    physicalEffort: derivePhysicalEffort(experience),
  }
}
