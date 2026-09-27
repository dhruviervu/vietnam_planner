/**
 * Writes one small JSON file per sight guide into public/guides/ so the site
 * downloads only the guide a visitor opens, however many guides exist.
 *
 *   npx tsx scripts/build-guides.ts   (runs automatically before `npm run build`)
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXPERIENCES } from '../src/pages/PlanBuilder/data/experiences'
import { getExperienceGuide } from '../src/pages/PlanBuilder/data/experienceGuides'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'guides')
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

let written = 0
let bytes = 0
const skipped: string[] = []
for (const { id } of EXPERIENCES) {
  if (!SAFE_ID.test(id)) {
    skipped.push(id)
    continue
  }
  const text = getExperienceGuide(id)
  if (!text) continue
  const body = JSON.stringify({ text })
  writeFileSync(join(outDir, `${id}.json`), body)
  written += 1
  bytes += body.length
}

console.log(`guides: wrote ${written} files (${(bytes / 1024 / 1024).toFixed(1)} MB) to public/guides`)
if (skipped.length) {
  console.error(`guides: skipped ids that are not URL-safe: ${skipped.join(', ')}`)
  process.exit(1)
}
