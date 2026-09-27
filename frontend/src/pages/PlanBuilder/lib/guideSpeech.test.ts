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

  it('keeps every paragraph under a numbered heading in one section', () => {
    const guide = `## Overview

Official name: Test
Location: District 1

Current visitor note.

## 1. First impression

First body paragraph.

Second body paragraph.

## 2. Next

Only this.`
    const sections = titleGuideParagraphs(guide, 'Test sight')
    expect(sections.map((s) => s.title)).toEqual(['Overview', '1. First impression', '2. Next'])
    expect(sections[1]?.body).toContain('First body paragraph')
    expect(sections[1]?.body).toContain('Second body paragraph')
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
    expect(foldForSpeech('Notre-Dame. Pope John XXIII. Walk Notre-Dame → the post office.')).toMatch(
      /Notre Dame.*Pope John the twenty-third.*then the post office/s,
    )
  })

  it('announces numbered titles as parts, separate from the body', () => {
    const units = unitsForSections([
      { title: '1. First impression', body: 'The cathedral rises from Cong xa Paris.' },
    ])
    expect(units[0]?.text).toMatch(/^Part 1\./)
    expect(units.some((u) => /cathedral rises/i.test(u.text))).toBe(true)
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
