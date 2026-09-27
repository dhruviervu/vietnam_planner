import { describe, expect, it } from 'vitest'
import { findCatalogProvider } from './providerCatalog'
import { AIRPORTS, DESTINATIONS } from './catalog'
import { resolveProviderGuide } from './providerGuides'

describe('provider guides', () => {
  it('looks up a Klook transfer by id', () => {
    const found = findCatalogProvider('HAN-klook')
    expect(found?.provider.name).toBe('Klook')
  })

  it('writes Nội Bài and Old Quarter into Express 86 copy', () => {
    const found = findCatalogProvider('han-86')
    const airport = AIRPORTS.find((a) => a.id === 'HAN')!
    const dest = DESTINATIONS.find((d) => d.id === 'han-old-quarter')!
    const guide = resolveProviderGuide({
      airport,
      destination: dest,
      provider: found!.provider,
      inbound: true,
    })
    expect(guide.lead.toLowerCase()).toContain('hanoibus')
    expect(guide.sections.some((s) => s.body.includes('Old Quarter'))).toBe(true)
    expect(guide.kicker.toLowerCase()).not.toContain('world-class')
  })
})
