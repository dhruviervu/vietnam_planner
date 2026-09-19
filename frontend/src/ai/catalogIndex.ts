import { SIGHT_CATALOG } from '../pages/PlanBuilder/data/experiences'
import { CITY_ACTIVITIES } from '../pages/PlanBuilder/data/activities'
import { CITY_DESCRIPTIONS } from '../pages/PlanBuilder/data/cityDescriptions'
import type { AskEntity, AskEntityKind } from './types'

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'is',
  'it',
  'this',
  'that',
  'with',
  'from',
  'into',
  'my',
  'me',
  'we',
  'our',
  'please',
  'what',
  'when',
  'where',
  'how',
  'can',
  'you',
  'about',
  'open',
  'opens',
  'hours',
  'hour',
  'cost',
  'price',
  'add',
  'trip',
  'bag',
  'day',
  'visit',
  'see',
  'show',
  'take',
  'page',
  'vietnam',
  'city',
  'tour',
  'walk',
  'class',
  'food',
])

export function normalizeAskText(raw: string) {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function askTokens(raw: string) {
  return normalizeAskText(raw)
    .split(' ')
    .filter((t) => t.length >= 3 && !STOP.has(t))
}

type Indexed = AskEntity & { norm: string; tokens: string[] }

let INDEX: Indexed[] | null = null

function buildIndex(): Indexed[] {
  const rows: Indexed[] = []
  for (const e of SIGHT_CATALOG) {
    const norm = normalizeAskText(`${e.name} ${e.city}`)
    rows.push({
      id: e.id,
      kind: 'experience',
      name: e.name,
      city: e.city,
      norm,
      tokens: askTokens(e.name),
    })
  }
  for (const a of CITY_ACTIVITIES) {
    const norm = normalizeAskText(`${a.name} ${a.cityName}`)
    rows.push({
      id: a.id,
      kind: 'activity',
      name: a.name,
      city: a.cityName,
      norm,
      tokens: askTokens(a.name),
    })
  }
  return rows
}

export function askCatalogIndex() {
  INDEX ??= buildIndex()
  return INDEX
}

const CITY_ALIASES: Record<string, string[]> = {
  'Ha Long': ['ha long bay', 'halong bay', 'halong'],
  'Ho Chi Minh City': ['saigon', 'hcmc', 'ho chi minh', 'sai gon'],
  'Da Nang': ['danang'],
  'Ninh Binh': ['tam coc', 'trang an'],
  'Hoi An': ['hoian'],
  'Sapa': ['sa pa'],
  'Phu Quoc': ['phu quoc island'],
  'Cat Ba': ['catba'],
  'Lan Ha': ['lan ha bay'],
  'Ha Giang': ['ha giang loop'],
}

export function matchAskCity(query: string): string | null {
  const q = normalizeAskText(query)
  if (q.length < 3) return null
  let best: { city: string; score: number } | null = null
  for (const city of Object.keys(CITY_DESCRIPTIONS)) {
    const aliases = [normalizeAskText(city), ...(CITY_ALIASES[city] ?? [])]
    let score = 0
    for (const alias of aliases) {
      if (!alias) continue
      if (q === alias || q.includes(alias)) score = Math.max(score, alias.length >= 10 ? 22 : 14)
      else if (alias.includes(q) && q.length >= 5) score = Math.max(score, 10)
    }
    if (score && (!best || score > best.score)) best = { city, score }
  }
  return best && best.score >= 10 ? best.city : null
}

export function rankAskEntities(query: string, limit = 4): { entity: AskEntity; score: number }[] {
  const q = normalizeAskText(query)
  if (q.length < 3) return []
  const qTokens = askTokens(query)
  const scored: { row: Indexed; score: number }[] = []

  for (const row of askCatalogIndex()) {
    let score = 0
    if (q.includes(row.norm) || row.norm.includes(q)) score += 12
    const nameWords = row.norm.split(' ').filter((w) => w.length >= 2)
    for (let i = 0; i < nameWords.length - 1; i += 1) {
      const phrase = `${nameWords[i]} ${nameWords[i + 1]}`
      if (q.includes(phrase)) score += 10
    }
    if (q.includes(row.id.replace(/-/g, ' '))) score += 9
    if (row.tokens.length && row.tokens.every((t) => q.includes(t))) score += 8
    let hits = 0
    for (const t of qTokens) {
      if (row.norm.includes(t)) hits += t.length >= 5 ? 2 : 1
    }
    score += hits
    if (score >= 4) scored.push({ row, score })
  }

  scored.sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
  const seen = new Set<string>()
  const out: { entity: AskEntity; score: number }[] = []
  for (const { row, score } of scored) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    out.push({
      entity: { id: row.id, kind: row.kind, name: row.name, city: row.city },
      score,
    })
    if (out.length >= limit) break
  }
  return out
}

export function findAskEntities(query: string, limit = 4): AskEntity[] {
  return rankAskEntities(query, limit).map((r) => r.entity)
}

export function entityById(id: string, kind?: AskEntityKind): AskEntity | null {
  const row = askCatalogIndex().find((r) => r.id === id && (!kind || r.kind === kind))
  if (!row) return null
  return { id: row.id, kind: row.kind, name: row.name, city: row.city }
}
