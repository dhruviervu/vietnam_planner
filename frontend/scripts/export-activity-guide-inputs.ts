/**
 * Export activity catalog rows for visitor-guide generation.
 * Run: npx tsx scripts/export-activity-guide-inputs.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CITY_ACTIVITIES } from '../src/pages/PlanBuilder/data/activities.ts'
import { ACTIVITY_KEEP_IN_MIND } from '../src/pages/PlanBuilder/data/activityKeepInMind.ts'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'activity_guides')
const authored = new Set(Object.keys(ACTIVITY_KEEP_IN_MIND))

const rows = CITY_ACTIVITIES.map((a) => ({
  id: a.id,
  name: a.name,
  cityId: a.cityId,
  cityName: a.cityName,
  kind: a.kind,
  kindLabel: a.kindLabel,
  hook: a.hook,
  summary: a.summary,
  cardSummary: a.cardSummary,
  about: a.about,
  whyGo: a.whyGo,
  durationLabel: a.durationLabel,
  hours: a.hours,
  bestTime: a.bestTime,
  priceLabel: a.priceLabel,
  priceFromUsd: a.priceFromUsd,
  bestFor: a.bestFor,
  vibe: a.vibe,
  tags: a.tags,
  authored: authored.has(a.id),
}))

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'activities.input.json'), `${JSON.stringify(rows, null, 2)}\n`)
const todo = rows.filter((r) => !r.authored)
console.log(`Wrote ${rows.length} activities (${todo.length} to generate, ${authored.size} authored skip)`)
