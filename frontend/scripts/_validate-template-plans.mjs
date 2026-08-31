import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/pages/ItineraryTemplates/data/plans')
const expected = {
  'vietnam-your-way': 14,
  'a-week-to-wander': 8,
  'slow-days-in-vietnam': 11,
  'find-your-vietnam': 12,
  'solo-somewhere-new': 10,
  'vietnam-for-two': 9,
  'a-week-made-for-two': 8,
  'vietnam-just-us': 10,
  'two-tickets-to-vietnam': 14,
  'slow-mornings-sunset-cruises': 8,
  'romantic-escape-vietnam': 9,
  'vietnam-with-the-kids': 9,
  'vietnam-made-for-the-family': 10,
  'little-explorers-in-vietnam': 8,
  'fun-for-everyone': 9,
  'family-adventure-vietnam': 14,
  'vietnam-without-the-stress': 9,
  'vietnam-theyll-actually-love': 12,
  'adventure-mode-vietnam': 10,
  'family-older-whole-crew': 11,
  'more-adventure-less-boredom': 9,
  'vietnam-favourite-people': 11,
  'beaches-bites-big-adventures': 12,
  'vietnam-with-the-gang': 9,
  'ultimate-friends-trip': 10,
  'good-friends-great-vietnam': 9,
  'vietnam-group-trip': 7,
  'pho-beaches-late-nights': 8,
  'friends-vietnam-escape': 8,
  'eat-explore-repeat': 9,
  'no-plans-just-vietnam': 9,
  'large-whole-crew': 10,
  'big-vietnam-adventure': 6,
  'vietnam-all-together': 6,
  'one-big-trip-vietnam': 7,
  'the-group-getaway': 5,
  'vietnam-with-everyone': 10,
  'vietnam-on-a-backpack': 7,
  'backpackers-vietnam': 6,
  'vietnam-on-the-go': 5,
  'street-food-sleeper-buses': 5,
  'vietnam-without-breaking-the-bank': 10,
  'take-it-slow-in-vietnam': 7,
  'vietnam-at-your-own-pace': 6,
  'slow-days-sunny-places': 5,
  'vietnam-beach-escape': 5,
  'sun-sea-vietnam': 5,
  'a-week-by-the-water': 5,
  'vietnams-best-beach-days': 4,
  'eat-your-way-through-vietnam': 7,
  'foodies-guide-vietnam': 5,
  'vietnam-on-a-plate': 5,
  'pho-banh-mi-everything': 6,
  'vietnam-beyond-the-cities': 5,
  'wild-side-of-vietnam': 4,
  'mountains-rivers-road-trips': 12,
  'chasing-adventure-vietnam': 5,
  'off-the-beaten-path': 4,
  'slow-luxurious-way': 8,
  'luxury-vietnam-escape': 7,
  'vietnam-upgraded': 10,
  'first-timers-trip': 8,
  'vietnam-highlights': 8,
  'vietnams-greatest-hits': 7,
  'your-first-vietnam-adventure': 7,
  'little-reset-in-vietnam': 7,
  'vietnam-for-the-soul': 6,
  'slow-down-and-breathe': 7,
  'see-it-all-north-south': 10,
  'classic-cram-with-hue': 8,
  'coast-and-highlands-cram': 8,
  'adventure-everything-circuit': 7,
  'friends-see-everything': 19,
  'four-weeks-if-you-have-them': 25,
}

const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !['index.ts', 'helpers.ts', 'types.ts'].includes(f))
const found = {}
const errors = []

for (const file of files) {
  const text = readFileSync(join(dir, file), 'utf8')
  const chunks = text.split(/plan\(\s*'/)
  for (const chunk of chunks.slice(1)) {
    const id = chunk.slice(0, chunk.indexOf("'"))
    const days = (chunk.match(/\bd\(/g) || []).length
    found[id] = days
  }
}

for (const [id, n] of Object.entries(expected)) {
  if (found[id] == null) errors.push(`missing ${id}`)
  else if (found[id] !== n) errors.push(`${id}: ${found[id]} days, expected ${n}`)
}
for (const id of Object.keys(found)) {
  if (!(id in expected)) errors.push(`unexpected ${id} (${found[id]} days)`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`OK ${Object.keys(found).length} plans`)
