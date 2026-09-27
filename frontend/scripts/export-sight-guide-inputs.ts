/**
 * Export classified sight inputs for visitor-guide generation.
 * Run: npx tsx scripts/export-sight-guide-inputs.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SIGHT_CATALOG } from '../src/pages/PlanBuilder/data/experiences.ts'
import wikiBriefs from '../src/pages/PlanBuilder/data/sightWikiBriefs.json'
import { classifiedFromExperience } from './classifySight.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'sight_guides')
const outFile = join(outDir, 'sights.input.json')

type WikiBrief = { title?: string; extract?: string }
const WIKI = wikiBriefs as Record<string, WikiBrief>

const rows = SIGHT_CATALOG.map((e) => classifiedFromExperience(e, WIKI[e.id]))

const counts = new Map<string, number>()
for (const row of rows) {
  const key = `${row.tier} / ${row.contentCategory}`
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`Wrote ${rows.length} sights → ${outFile}`)
for (const [key, n] of [...counts.entries()].sort()) {
  console.log(`  ${n.toString().padStart(3)}  ${key}`)
}
