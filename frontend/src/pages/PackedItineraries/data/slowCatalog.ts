import raw from './slowTemplates.json'
import type { PackedTemplate } from './catalogTypes'

export const SLOW_TEMPLATES = raw as PackedTemplate[]

const BY_ID = new Map(SLOW_TEMPLATES.map((template) => [template.id, template]))

export function getSlowTemplate(id: string) {
  return BY_ID.get(id)
}

export function isSlowIdea(template: PackedTemplate) {
  return template.pace === 'slow'
}
