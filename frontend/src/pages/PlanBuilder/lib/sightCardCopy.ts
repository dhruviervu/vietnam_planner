/** 1–3 sentences that describe the sight itself — not tickets, crowds, or logistics. */

import wikiBriefs from '../data/sightWikiBriefs.json'

const MAX_CHARS = 420
const MAX_SENTENCES = 3

type WikiBrief = { title?: string; extract?: string }
const WIKI = wikiBriefs as Record<string, WikiBrief>

const META =
  /ticket|vnd|đồng|\bdong\b|from\s*~|adult tickets?|hours often|pair with|grab from|book |crowd|queue|tour bus|do not buy|do not treat|\$\d|costlabel|per person|per ticket/i

const LOCATION_ONLY =
  /\b(located in|situated in|lies in|is located|kilometers? from|km from|minutes from|district of)\b/i

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function wikiTitleMatchesSight(
  title: string,
  e: { name?: string; city?: string; region?: string },
): boolean {
  const t = fold(title)
  if (!t) return false
  if (t === fold(e.city || '') || t === fold(e.region || '') || t === 'vietnam' || t === 'viet nam') {
    return false
  }
  if (/^(list of|tourism in|geography of|history of vietnam|vietnam)\b/.test(t)) return false
  const nameAll = fold(e.name || '')
    .replace(/[()]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
  if (!nameAll.length) return false
  const hits = nameAll.filter((w) => t.includes(w)).length
  return hits >= Math.min(2, nameAll.length)
}

export function firstSentences(text: string, max = MAX_SENTENCES): string {
  const raw = text.replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  const parts = raw.match(/[^.!?]+[.!?]+(?:["”'])?|[^.!?]+$/g) ?? [raw]
  const sentences = parts.map((s) => s.trim()).filter(Boolean).slice(0, max)
  let out = sentences.join(' ')
  if (out.length > MAX_CHARS) {
    out = `${out.slice(0, MAX_CHARS - 1).replace(/\s+\S*$/, '').trim()}…`
  }
  return out
}

function sentenceList(text: string): string[] {
  const raw = text.replace(/\s+/g, ' ').trim()
  if (!raw) return []
  const parts = raw.match(/[^.!?]+[.!?]+(?:["”'])?|[^.!?]+$/g) ?? [raw]
  return parts.map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 5)
}

function isDescriptive(sentence: string): boolean {
  if (META.test(sentence)) return false
  if (LOCATION_ONLY.test(sentence) && !/\b(temple|pagoda|palace|museum|citadel|bridge|cave|bay|market|cathedral|tomb)\b/i.test(sentence)) {
    return false
  }
  return true
}

function wikiBlurb(e: { id?: string; name?: string; city?: string; region?: string }): string {
  if (!e.id) return ''
  const w = WIKI[e.id]
  if (!w?.extract || !w.title) return ''
  if (!wikiTitleMatchesSight(w.title, e)) return ''
  const cut = w.extract.split(/\n(?=See also|References|External links)/i)[0] || w.extract
  const picked = sentenceList(cut).filter(isDescriptive).slice(0, MAX_SENTENCES)
  return firstSentences(picked.join(' '), MAX_SENTENCES)
}

export function sightCardCopy(e: {
  id?: string
  name?: string
  city?: string
  region?: string
  cardSummary?: string
  whyGo?: string
  hook?: string
  about?: string
}): string {
  const wiki = wikiBlurb(e)
  if (wiki.length > 40) return wiki

  const pool = [e.hook, e.about, e.whyGo, e.cardSummary].filter(Boolean) as string[]
  const descriptive = pool.flatMap(sentenceList).filter(isDescriptive)
  const unique: string[] = []
  const seen = new Set<string>()
  for (const s of descriptive) {
    const key = fold(s).slice(0, 48)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(s)
    if (unique.length >= MAX_SENTENCES) break
  }
  if (unique.length) return firstSentences(unique.join(' '), MAX_SENTENCES)
  return firstSentences(e.hook || e.about || e.whyGo || e.cardSummary || e.name || '', MAX_SENTENCES)
}
