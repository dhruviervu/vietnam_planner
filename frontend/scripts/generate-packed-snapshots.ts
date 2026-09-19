import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { THREE_DAY_CITIES } from '../src/pages/PackedItineraries/data/cityStayCores.ts'
import { buildPackedCatalog } from '../src/pages/PackedItineraries/data/catalogBuild.ts'
import { authoredCityStayPlan } from '../src/pages/ItineraryTemplates/data/plans/cityStayPlanBuild.ts'

const here = dirname(fileURLToPath(import.meta.url))

writeFileSync(
  join(here, '../src/pages/PackedItineraries/data/packedTemplates.json'),
  `${JSON.stringify(buildPackedCatalog(), null, 2)}\n`,
)

writeFileSync(
  join(here, '../src/pages/ItineraryTemplates/data/plans/cityStayPlans.json'),
  `${JSON.stringify(
    THREE_DAY_CITIES.map((city) => authoredCityStayPlan(city, 3)),
    null,
    2,
  )}\n`,
)

console.log('wrote packedTemplates.json and cityStayPlans.json')
