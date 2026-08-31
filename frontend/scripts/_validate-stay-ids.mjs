import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const stays = readFileSync(join(root, 'src/pages/WhereToStay/data/stays.ts'), 'utf8')
const hotels = readFileSync(join(root, 'src/pages/PlanBuilder/data/hotels.ts'), 'utf8')
const stayIds = new Set([...stays.matchAll(/seed\('([^']+)'/g)].map((m) => m[1]))
const hotelIds = new Set([...hotels.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]))
const dir = join(root, 'src/pages/ItineraryTemplates/data/plans')
const missing = []

for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && !['index.ts', 'helpers.ts', 'types.ts'].includes(f))) {
  const text = readFileSync(join(dir, file), 'utf8')
  const blocks = [...text.matchAll(/plan\(\s*'[^']+'\s*,\s*\{([\s\S]*?)\}\s*,/g)]
  for (const block of blocks) {
    const ids = [...block[1].matchAll(/: '([^']+)'/g)].map((m) => m[1])
    for (const id of ids) {
      if (!stayIds.has(id) && !hotelIds.has(id)) missing.push(`${file} ${id}`)
    }
  }
}

if (missing.length) {
  console.error(missing.join('\n'))
  process.exit(1)
}
console.log(`OK stays ${stayIds.size} hotels ${hotelIds.size}`)
