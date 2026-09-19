import type { Experience } from '../types'

/** UNESCO towns, imperial landscapes, and evening of the same ancient town. */
const LANDSCAPE_HERITAGE = new Set([
  'halong-cruise',
  'old-quarter',
  'hoi-an-ancient-town',
  'hoi-an-lanterns',
  'hoa-lu',
  'my-son',
  'hue-citadel',
  'temple-literature',
  'ninh-binh',
])

const NOT_A_MONUMENT =
  /\b(hot-springs|mud-bath|pottery|sedge|lanterns|boats|skywalk|cable|market|night-market|cooking|food-tour|beach|snorkel|geopark|national-park|waterfall|promenade|pass|reservoir|viewpoint|island|cruise|kayak|sampan)\b/i

const LIGHT_ACTIVITY =
  /\b(boat|boats|cruise|snorkel|kayak|island|beach|market|cable|mud-bath|hot-spring|cooking|food-tour|viewpoint|waterfall|promenade|skywalk|sampan)\b/i

const TITLE_HERITAGE =
  /\b(temple|pagoda|tomb|citadel|mausoleum|museum|palace|cathedral|church|mosque|prison|opera|flag-tower|fortress|assembly|old-house|stilt-house|literature|po-nagar|cham-sculpture|independence-palace|war-remnant|ethnolog|fine-arts|womens-museum|military|quan-thanh|tran-quoc|one-pillar|perfume-pagoda|thien-mu|japanese-bridge|thang-long|vuong-palace|pao-house|don-cao|bao-dai|domaine-de-marie|railway-station|notre-dame|jade-emperor|mariamman|giac-lam|xa-loi|vinh-nghiem|bai-dinh|bich-dong|phat-diem|den-tran|dinh-cau|ho-quoc|cao-dai|coi-nguon|eight-ladies|e-cave|yersin|binh-thuy|lung-cu|cannon-fort|forbidden-purple|ngo-mon|thai-hoa|the-mieu|hung-mieu|ho-quyen|an-dinh|linh-ung|quan-the-am|nam-son|loi-am|long-tien|cua-ong|thai-vi|dinh-le|kim-son-bao|bich-van|fansipan-buddha|sung-hung|su-muon|long-son|hai-duc|tong-lam|chua-tu|chua-ong|nam-nha|phuoc-hau|pothi|munir|quang-duc|truc-lam|grand-prison|khe-gat|tram-tran|highway-20|sapa-museum|sapa-ancient-stone|phung-tien|can-chanh|duyet-thi|nine-dynastic|tu-dam|huyen-tran|tu-hieu|bao-quoc|dieu-de|hon-chen|voi-re|dinh-cat|phu-cam|royal-antiquities|le-ba-dang|co-vien|nho-rong|fitom|giac-lam|cho-lon|tan-dinh|cha-tam|sa-huynh|folk-culture|precious-heritage|trade-ceramics|quan-cong|phap-bao|central-mosque|fujian|cantonese|hainan|teochew|tan-ky|phung-hung|duc-an|quan-thang|fifth-military|da-nang-museum|quang-ninh-museum|khanh-hoa-museum|do-theatre|truong-xuan|can-tho-museum|hcm-museum|hcm-stilt|ho-chi-minh-museum|vietnamese-women|vietnam-military|vietnam-fine-arts|city-museum|museum-vietnamese|southern-women)\b/i

export const HERITAGE_GUIDE_MIN_WORDS = 280
export const HERITAGE_GUIDE_MAX_WORDS = 10_000

/**
 * Deep visitor guides only for monuments, sacred sites, museums, and a short
 * list of UNESCO cultural landscapes — not boats, beaches, markets, or parks.
 */
export function isDeepHeritageSight(e: Experience): boolean {
  const title = `${e.id} ${e.name}`
  if (NOT_A_MONUMENT.test(title) && !LANDSCAPE_HERITAGE.has(e.id)) return false
  if (LANDSCAPE_HERITAGE.has(e.id)) return true
  if (e.category === 'History') return true
  return TITLE_HERITAGE.test(title)
}

/** Boat days, beaches, and booked activities: essentials only, never 1000-word padding. */
export function isLightVisitorGuideSight(e: Experience): boolean {
  if (isDeepHeritageSight(e)) return false
  const title = `${e.id} ${e.name} ${e.category}`
  return (
    LIGHT_ACTIVITY.test(title) ||
    e.category === 'Beaches' ||
    e.category === 'Adventure' ||
    e.category === 'Nightlife' ||
    e.category === 'Food'
  )
}

export function clipGuideWords(text: string, max = HERITAGE_GUIDE_MAX_WORDS): string {
  const trimmed = text.trim()
  const count = trimmed.split(/\s+/).filter(Boolean).length
  if (count <= max) return trimmed
  const parts = trimmed.split(/\n(?=##\s)/)
  let out = ''
  for (const part of parts) {
    const next = out ? `${out}\n\n${part.trim()}` : part.trim()
    if (next.split(/\s+/).filter(Boolean).length > max) break
    out = next
  }
  if (out) return out
  return trimmed.split(/\s+/).slice(0, max).join(' ')
}
