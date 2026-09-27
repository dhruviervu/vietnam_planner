const STOP = new Set([
  'the',
  'and',
  'of',
  'a',
  'an',
  'in',
  'at',
  'for',
  'to',
  'with',
  'from',
  'day',
  'walk',
  'evening',
  'morning',
  'afternoon',
  'class',
  'tour',
  'crawl',
  'corner',
  'circuit',
  'complex',
  'escape',
  'viewpoint',
  'peak',
  'section',
  'hidden',
  'vietnam',
  'viet',
  'nam',
  'landscape',
  'scenic',
])

const GENERIC_LIST =
  /\b(things to do|places to visit|best places|top\s*\d+|must[- ]see|bucket list|itinerary|\d+\s*days?\s+in|vlog|nightcore|trendingvideo|clickbait|you won'?t believe|compilation|travel guide to vietnam)\b/i

const COMBO_COMPARE = /\bvs\.?\b|\bversus\b|\bcompared to\b/i

export type SightVideoRef = {
  id: string
  name: string
  city: string
  aliases?: string[]
}

export function sightNameTokens(name: string): string[] {
  return name
    .replace(/\([^)]*\)/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\sàáảãạăằắẩẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function includesAll(haystack: string, parts: string[]) {
  return parts.length > 0 && parts.every((p) => haystack.includes(p))
}

function distinctivePhrase(name: string): string {
  return name.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function sightCorePhrase(name: string): string {
  const words = name
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => !['the', 'of', 'and', 'a', 'an'].includes(w.toLowerCase()))
  return words.slice(0, 2).join(' ').toLowerCase()
}

/** True only when the title is about this sight, not a city roundup or combo tour. */
export function videoTitleMatchesSight(
  title: string,
  sight: SightVideoRef,
  catalog: SightVideoRef[],
): boolean {
  const t = (title ?? '').toLowerCase().replace(/#\w+/g, ' ')
  if (!t.trim()) return false
  if (COMBO_COMPARE.test(t)) return false
  if (GENERIC_LIST.test(t)) return false
  if (/\b(shocked|accident|you won'?t believe|clickbait|must watch|hotel review)\b/i.test(t)) return false
  if (/\d+\s*km walk/i.test(t)) return false

  const aliases = [sight.name, ...(sight.aliases ?? [])]
  const nameHit =
    aliases.some((alias) => {
      const toks = sightNameTokens(alias)
      if (toks.length === 0) return false
      const needed = toks.length <= 2 ? toks.length : Math.ceil(toks.length * 0.75)
      return toks.filter((tok) => t.includes(tok)).length >= needed
    }) ||
    (() => {
      const core = sightCorePhrase(sight.name)
      return core.length >= 7 && t.includes(core)
    })()
  if (!nameHit) return false

  const selfPhrase = distinctivePhrase(sight.name)
  for (const other of catalog) {
    if (other.id === sight.id) continue
    const otherPhrase = distinctivePhrase(other.name)
    if (otherPhrase.length < 8) continue
    const selfCore = sightCorePhrase(sight.name)
    const otherCore = sightCorePhrase(other.name)
    if (selfCore && selfCore === otherCore) continue
    if (selfPhrase.includes(otherPhrase) || otherPhrase.includes(selfPhrase)) continue
    const otherToks = sightNameTokens(other.name)
    if (otherToks.length < 2) continue
    if (includesAll(t, otherToks) && !includesAll(selfPhrase, otherToks)) return false
  }

  return true
}

export function filterMatchingVideos<T extends { title?: string }>(
  videos: T[],
  sight: SightVideoRef,
  catalog: SightVideoRef[],
): T[] {
  return videos.filter((v) => videoTitleMatchesSight(v.title ?? '', sight, catalog))
}
