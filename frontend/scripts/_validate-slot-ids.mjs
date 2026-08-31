import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const expMain = readFileSync(join(root, 'src/pages/PlanBuilder/data/experiences.ts'), 'utf8')
const expExtra = readFileSync(join(root, 'src/pages/PlanBuilder/data/experiencesExtra.ts'), 'utf8')
const acts = readFileSync(join(root, 'src/pages/PlanBuilder/data/activities.ts'), 'utf8')
const expIds = new Set(
  [...expMain.matchAll(/^\s+id: '([^']+)'/gm), ...expExtra.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]),
)
const actIds = new Set([...acts.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]))
const dir = join(root, 'src/pages/ItineraryTemplates/data/plans')
const missing = []

for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && !['index.ts', 'helpers.ts', 'types.ts'].includes(f))) {
  const text = readFileSync(join(dir, file), 'utf8')
  for (const m of text.matchAll(/\be\('([^']+)'\)/g)) {
    if (!expIds.has(m[1])) missing.push(`${file} experience ${m[1]}`)
  }
  for (const m of text.matchAll(/\ba\('([^']+)'\)/g)) {
    if (!actIds.has(m[1])) missing.push(`${file} activity ${m[1]}`)
  }
}

if (missing.length) {
  console.error(missing.join('\n'))
  process.exit(1)
}
console.log(`OK experiences ${expIds.size} activities ${actIds.size}`)
