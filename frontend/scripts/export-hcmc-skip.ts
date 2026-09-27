/**
 * Write HCMC attraction ranks 1–19 so the overnight generator skips them.
 * Run: npx tsx scripts/export-hcmc-skip.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIGHT_CATALOG } from '../src/pages/PlanBuilder/data/experiences.ts'
import { rankCityExperiences } from '../src/pages/PlanBuilder/services/cityCatalog.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'sight_guides')
const hcmc = rankCityExperiences(SIGHT_CATALOG.filter((e) => e.city === 'Ho Chi Minh City'))
const skip = hcmc.slice(0, 19).map((e) => ({ rank: e.cityRank, id: e.id, name: e.name }))
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'skip_hcmc_top19.json'), `${JSON.stringify(skip, null, 2)}\n`)
console.log(`Skip ${skip.length} HCMC sights:`)
for (const row of skip) {
  console.log(`  ${row.rank}. ${row.id}  ${row.name}`)
}
