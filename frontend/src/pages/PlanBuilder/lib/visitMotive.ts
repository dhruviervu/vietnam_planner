import type { RankCategory } from './sightRanking'

export type VisitMotive = 'history' | 'nature' | 'culture'

export const VISIT_MOTIVE_ORDER: VisitMotive[] = ['history', 'nature', 'culture']

export const VISIT_MOTIVE_LABEL: Record<VisitMotive, string> = {
  history: 'Monumental history',
  nature: 'World-class nature',
  culture: 'Immersive culture',
}

export function visitMotiveForRankCategory(cat?: RankCategory | null): VisitMotive {
  if (cat === 'historical' || cat === 'museums') return 'history'
  if (cat === 'nature' || cat === 'beaches' || cat === 'adventure') return 'nature'
  return 'culture'
}

export function visitMotiveForActivityKind(kind: string): VisitMotive {
  if (kind === 'adventure' || kind === 'beach' || kind === 'sport') return 'nature'
  return 'culture'
}
