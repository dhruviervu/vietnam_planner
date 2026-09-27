/**
 * Hand-picked YouTube embeds for visitor-guide pages.
 * Only real watch video ids (never search_query links). Overrides skip title matching.
 */
import type { ExperienceVideo } from './experienceMedia'

function vids(...youtubeIds: string[]): ExperienceVideo[] {
  const seen = new Set<string>()
  const out: ExperienceVideo[] = []
  for (const youtubeId of youtubeIds) {
    const id = youtubeId.trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push({ youtubeId: id })
  }
  return out
}

export const SIGHT_VIDEO_OVERRIDES: Record<string, ExperienceVideo[]> = {
  // —— Hanoi ——
  'old-quarter': vids('NQp9Ig9MpcM', '3Ru-nO1nt9E'),
  'temple-literature': vids('dLzZqxWR1jI'),
  'hoan-kiem-lake': vids('nbQ_z-0ZO28', '1I4gT8grCuA', 'QOp4pUpYSEs', 'KlZ3Er9GCvQ'),
  'ho-chi-minh-mausoleum': vids('IKS_Bl7578U', 'lcHO_bXOndM'),
  'thang-long-citadel': vids('k4iWrukqY-o', 'w8Ggxcy38ZY'),
  'hoa-lo-prison': vids('WEYGT1tX1q8'),
  'ngoc-son-temple': vids('nAlF2UxTeXU'),
  'st-joseph-cathedral': vids('nbQ_z-0ZO28', 'QOp4pUpYSEs', 'IKS_Bl7578U'),
  'tran-quoc-pagoda': vids('1I4gT8grCuA', 'IKS_Bl7578U', 'lcHO_bXOndM'),
  'one-pillar-pagoda': vids('KOw6m3_5naM'),
  'ethnology-museum': vids('BMAE6e9ktoE'),
  'train-street': vids('tXcFtzrRRxY', 'Q3oaAjH2nC8'),
  'vietnamese-womens-museum': vids('lcHO_bXOndM'),
  'vietnam-military-history-museum': vids('lcHO_bXOndM'),
  'hanoi-opera-house': vids('Q6JTAmhY_-c'),
  'hcm-stilt-house': vids('i60DfV3eXi4'),
  'west-lake': vids('e1ydeuVAliw'),
  'egg-coffee': vids('SfdA8OtbTwI', '1I4gT8grCuA', 'IKS_Bl7578U'),
  'hanoi-weekend-night-market': vids('xId3cHWsta4', 'SfdA8OtbTwI'),
  'long-bien-bridge': vids('_mYOufTyw8c'),
  'bat-trang-pottery': vids('0I0z-05THQU', 'jf_P0IB7i2Y'),
  'quan-thanh-temple': vids('DxtDkKqvhH0'),
  'dong-xuan-market': vids('3grRGf1vodw', '-tP1wnkCOGw', 'xId3cHWsta4'),
  'ho-chi-minh-museum-hanoi': vids('lcHO_bXOndM'),
  'bia-hoi': vids('nbQ_z-0ZO28', 'xId3cHWsta4', 'SfdA8OtbTwI'),
  'phu-tay-ho': vids('1I4gT8grCuA'),

  // —— Other curated ——
  'ninh-binh': vids('99nCuzA2O3s'),
  'hoi-an-lanterns': vids('vyFci-z5qGk'),
  'war-remnants': vids('yVQprxaEzXo'),
  'cu-chi': vids('93nuGRBU77I'),
}
