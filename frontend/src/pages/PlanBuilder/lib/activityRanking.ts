export type ActivityRankInput = {
  id: string
  name: string
  kind: string
  popularityTag: 'Must do' | 'Popular' | 'Free time' | 'Local favourite' | 'Unique'
  rating: number
  priceFromUsd: number | null
}

const TAG_POINTS: Record<ActivityRankInput['popularityTag'], number> = {
  'Must do': 28,
  Popular: 18,
  'Local favourite': 10,
  Unique: 4,
  'Free time': 2,
}

const FAME: { re: RegExp; pts: number }[] = [
  { re: /ha giang loop/i, pts: 90 },
  { re: /overnight luxury cruise|overnight.*kayak|ha long bay overnight/i, pts: 88 },
  { re: /water puppet/i, pts: 86 },
  { re: /cẩm thanh basket boat|basket boat/i, pts: 82 },
  { re: /mường hoa|muong hoa valley/i, pts: 80 },
  { re: /tràng an grottoes|trang an.*rowboat/i, pts: 78 },
  { re: /tam cốc river|tam coc/i, pts: 76 },
  { re: /fansipan/i, pts: 74 },
  { re: /foldable lantern|lantern making/i, pts: 72 },
  { re: /lantern release|hoài river night boat/i, pts: 68 },
  { re: /backstreet food motorbike|street.?food/i, pts: 70 },
  { re: /vespa|military jeep city/i, pts: 66 },
  { re: /easy rider motorbike/i, pts: 64 },
  { re: /home kitchen cooking class/i, pts: 62 },
  { re: /hoi an.*cook|royal-court cuisine cooking/i, pts: 60 },
  { re: /custom suit|tailoring/i, pts: 58 },
  { re: /hội an memories show|memories show/i, pts: 56 },
  { re: /egg coffee/i, pts: 54 },
  { re: /bát tràng|bat trang pottery/i, pts: 52 },
  { re: /cyclo/i, pts: 50 },
  { re: /snorkel|scuba|diving|hon mun/i, pts: 50 },
  { re: /floating market|mekong.*boat|coconut workshop/i, pts: 48 },
  { re: /cooking class/i, pts: 36 },
  { re: /kayak/i, pts: 34 },
  { re: /perfume river dragon/i, pts: 42 },
  { re: /áo dài photography|ao dai photography/i, pts: 32 },
  { re: /sung sốt|surprise cave/i, pts: 40 },
  { re: /luồn cave|luon cave/i, pts: 38 },
]

const NICHE = [
  /shuttlecock|đá cầu/i,
  /karaoke/i,
  /swan pedal|pedal boat/i,
  /tai chi/i,
  /speakeasy|pub crawl/i,
  /blacksmith|knife-making/i,
  /silver jewelry|ring-making/i,
  /woodblock|embroidery/i,
  /incense village/i,
  /bird park/i,
  /alpine coaster/i,
  /paragliding/i,
  /zen monastery|guided retreat/i,
  /farm family|village games|folk song|homestay singing/i,
  /tea ceremony class/i,
  /local buddy/i,
  /beach volleyball/i,
  /stand-up paddle/i,
  /salt & coconut coffee/i,
  /pottery wheel/i,
  /rice-wine brewing/i,
  /beeswax batik/i,
  /indigo dyeing/i,
  /tea tasting/i,
  /circle dance/i,
  /market morning with your host/i,
]

export function activityTravelerScore(a: ActivityRankInput): number {
  const text = `${a.id} ${a.name}`
  let fame = 0
  for (const row of FAME) {
    if (row.re.test(text)) fame = Math.max(fame, row.pts)
  }
  const niche = NICHE.some((re) => re.test(text))
  const tag = TAG_POINTS[a.popularityTag] ?? 8
  const rating = Number.isFinite(a.rating) ? a.rating : 4
  const ratingPts = (rating - 4) * 8
  let score = fame * 2 + tag + ratingPts
  if (niche) score -= 55
  if (fame === 0 && a.popularityTag === 'Unique') score -= 12
  if (fame === 0 && (a.kind === 'craft' || a.kind === 'workshop' || a.kind === 'community')) {
    score -= 10
  }
  if (a.priceFromUsd === 0 && fame < 40) score -= 6
  return score
}

export function compareActivitiesByTravelerValue(a: ActivityRankInput, b: ActivityRankInput): number {
  const diff = activityTravelerScore(b) - activityTravelerScore(a)
  if (Math.abs(diff) > 1e-6) return diff
  if (b.rating !== a.rating) return b.rating - a.rating
  return a.name.localeCompare(b.name)
}
