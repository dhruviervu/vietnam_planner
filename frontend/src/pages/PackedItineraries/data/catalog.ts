import raw from './packedTemplates.json'
import type { PackedTemplate } from './catalogTypes'

export type { PackedDay, PackedTemplate } from './catalogTypes'

export const PACKED_TEMPLATES: PackedTemplate[] = raw

const BY_ID = new Map(PACKED_TEMPLATES.map((template) => [template.id, template]))

export function getPackedTemplate(id: string) {
  return BY_ID.get(id)
}

export const PACKED_CITIES = [...new Set(PACKED_TEMPLATES.flatMap((t) => t.cities))].sort()

export const PACKED_DAY_OPTIONS = [...new Set(PACKED_TEMPLATES.map((t) => t.days))].sort((a, b) => a - b)
