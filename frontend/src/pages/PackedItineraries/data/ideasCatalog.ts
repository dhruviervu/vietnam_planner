import { PACKED_TEMPLATES, getPackedTemplate } from './catalog'
import { SLOW_TEMPLATES, getSlowTemplate, isSlowIdea } from './slowCatalog'
import type { PackedTemplate } from './catalogTypes'

export { isSlowIdea }

export const IDEA_TEMPLATES: PackedTemplate[] = [...PACKED_TEMPLATES, ...SLOW_TEMPLATES]

export function getIdeaTemplate(id: string) {
  return getPackedTemplate(id) ?? getSlowTemplate(id)
}

export const IDEA_CITIES = [...new Set(IDEA_TEMPLATES.flatMap((t) => t.cities))].sort()

export const IDEA_DAY_OPTIONS = [...new Set(IDEA_TEMPLATES.map((t) => t.days))].sort((a, b) => a - b)
