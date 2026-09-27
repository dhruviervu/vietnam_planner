/**
 * Important sights to write by hand, ranked like the Attractions pages.
 * Run: npx tsx scripts/list-important-sights.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIGHT_CATALOG } from '../src/pages/PlanBuilder/data/experiences.ts'
import { rankVietnamBestSights, groupExperiencesByCity } from '../src/pages/PlanBuilder/services/cityCatalog.ts'
import { POPULAR_TOURIST_CITIES } from '../src/pages/PlanBuilder/data/popularTouristCities.ts'

const here = dirname(fileURLToPath(import.meta.url))
const HCMC_DONE = 19

const longCurated = new Set(
  JSON.parse(readFileSync(join(here, 'sight_guides', 'skip_long_curated.json'), 'utf8')) as string[],
)

const TOP_FOR: Record<string, number> = {
  Hanoi: 12,
  'Ho Chi Minh City': 25,
  'Hoi An': 10,
  Hue: 10,
  'Da Nang': 10,
  'Ha Long': 8,
  'Ninh Binh': 8,
  Sapa: 10,
  'Da Lat': 10,
  'Nha Trang': 10,
  'Phu Quoc': 8,
  'Phong Nha': 8,
  'Ha Giang': 8,
  'Cat Ba': 8,
  'Dong Van': 6,
  'Can Tho': 8,
}

function hasStrongGuide(id: string) {
  return longCurated.has(id)
}

const groups = groupExperiencesByCity(SIGHT_CATALOG)
const lines: string[] = []
lines.push('Write these by hand. Rank matches Attractions.')
lines.push('skip = long curated guide already in the app (overnight generated copy does not count as done).')
lines.push('WRITE = still needs you.')
lines.push('')

const vietnamBest = rankVietnamBestSights(20)
lines.push('Vietnam at its best (20)')
for (const e of vietnamBest) {
  const hcmcDone = e.city === 'Ho Chi Minh City' && e.cityRank <= HCMC_DONE
  const flag = hcmcDone || hasStrongGuide(e.id) ? 'skip' : 'WRITE'
  lines.push(`  ${e.cityRank}. ${e.name}  [${e.city}]  ${flag}`)
}
lines.push('')

const cityOrder = [
  ...POPULAR_TOURIST_CITIES,
  'Ha Giang',
  'Cat Ba',
  'Dong Van',
  'Can Tho',
]

const listed = new Set(cityOrder as string[])
for (const city of cityOrder) {
  const group = groups.find((g) => g.city === city)
  if (!group) continue
  const n = TOP_FOR[city] ?? 8
  const items = group.items.slice(0, n)
  lines.push(`${city} (top ${n})`)
  for (const e of items) {
    const hcmcDone = city === 'Ho Chi Minh City' && e.cityRank <= HCMC_DONE
    const flag = hcmcDone || hasStrongGuide(e.id) ? 'skip' : 'WRITE'
    const note = hcmcDone ? ' — you wrote this' : ''
    lines.push(`  ${e.cityRank}. ${e.name}${note}  ${flag}`)
  }
  lines.push('')
}

for (const group of groups) {
  if (listed.has(group.city)) continue
  const writes = group.items.slice(0, 5).filter((e) => !hasStrongGuide(e.id))
  if (writes.length === 0) continue
  lines.push(`${group.city} (top remaining)`)
  for (const e of writes.slice(0, 5)) {
    lines.push(`  ${e.cityRank}. ${e.name}  WRITE`)
  }
  lines.push('')
}

const writeCount = lines.filter((l) => /\sWRITE$/.test(l)).length
lines.unshift(`Important WRITE list: ${writeCount} sights. HCMC ranks 1–19 are skip.`)
lines.unshift('')

const out = join(here, 'sight_guides', 'important-sights-to-write.txt')
writeFileSync(out, `${lines.join('\n')}\n`, 'utf8')
console.log(out)
console.log(`WRITE ${writeCount}`)
