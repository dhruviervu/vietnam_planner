import { EXPERIENCES } from '../src/pages/PlanBuilder/data/experiences'
import { getExperienceGuide, wordCount } from '../src/pages/PlanBuilder/data/experienceGuides'

const rows = EXPERIENCES.map((e) => ({
  id: e.id,
  name: e.name,
  city: e.city,
  words: wordCount(getExperienceGuide(e.id) || ''),
}))
const short = rows.filter((r) => r.words < 500)
console.log(JSON.stringify({ total: rows.length, short: short.length, sights: short }, null, 2))
