import { describe, expect, it } from 'vitest'
import { parseGuideBlocks, titleGuideParagraphs } from './guideParagraphs'
import { foldForSpeech, unitsForSections } from './guideSpeech'

describe('guideParagraphs', () => {
  it('uses explicit ## titles instead of the shared rule pack', () => {
    const guide = `## Tide is the hidden timetable

Mid tide is kinder than a scrape.

## In the lagoon

Keep voices down.`
    const sections = titleGuideParagraphs(guide, 'Luồn Cave')
    expect(sections.map((s) => s.title)).toEqual([
      'Tide is the hidden timetable',
      'In the lagoon',
    ])
    expect(sections[0]?.body).toContain('Mid tide')
  })

  it('joins a lone heading with the next block', () => {
    const blocks = parseGuideBlocks(`## On deck

Stay at the rail.`)
    expect(blocks).toEqual([
      { title: 'On deck', body: 'Stay at the rail.', explicit: true },
    ])
  })
})

describe('guideSpeech', () => {
  it('folds Vietnamese diacritics and clock times for English voices', () => {
    const spoken = foldForSpeech('Meet at 07:30 near Bãi Cháy. Tickets cost 40,000 VND. Walk 25 m.')
    expect(spoken).toContain('7:30')
    expect(spoken).not.toMatch(/\b07:30\b/)
    expect(spoken).toContain('Bai Chay')
    expect(spoken).toContain('dong')
    expect(spoken).toContain('25 metres')
  })

  it('does not slice words mid-syllable on long sentences', () => {
    const body =
      'The stair flight to the mouth is the hard part for knees, and for anyone carrying a child, and for anyone who chose flip-flops on polished stone after rain.'
    const units = unitsForSections([{ title: 'The climb', body }], 80)
    expect(units.length).toBeGreaterThan(1)
    for (const unit of units) {
      expect(unit.text.length).toBeLessThanOrEqual(80)
      expect(unit.text.startsWith(' ')).toBe(false)
      expect(unit.text.trim().split(/\s+/).every((w) => w.length > 0)).toBe(true)
    }
  })
})
