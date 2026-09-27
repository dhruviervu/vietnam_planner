/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PACKED_CITIES, PACKED_DAY_OPTIONS, PACKED_TEMPLATES, getPackedTemplate } from './catalog'

describe('packed itinerary ideas catalog', () => {
  it('loads precomputed cards without packing at import', () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'catalog.ts'), 'utf8')
    expect(src).not.toMatch(/packHighRoi/)
    expect(src).not.toMatch(/experiences/)
    expect(src).toMatch(/packedTemplates\.json/)
    expect(PACKED_TEMPLATES.length).toBeGreaterThan(20)
    expect(PACKED_TEMPLATES.every((t) => t.previewNames.length > 0)).toBe(true)
    expect(getPackedTemplate('city-hanoi-3')?.days).toBe(3)
    expect(getPackedTemplate('vn-classic-10')?.kind).toBe('country')
    expect(PACKED_CITIES).toContain('Hanoi')
    expect(PACKED_DAY_OPTIONS.length).toBeGreaterThan(3)
  })
})
