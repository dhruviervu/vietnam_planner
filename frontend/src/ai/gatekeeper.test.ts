import { describe, expect, it } from 'vitest'
import { gatekeepAsk } from './gatekeeper'
import { proposeAskDay } from './proposeDay'
import { findAskEntities } from './catalogIndex'
import { collectAskOffers } from './pipelineOffers'

const page = {
  pathname: '/plan/builder/experiences',
  focus: null as null,
  city: null as null,
}

describe('ask gatekeeper', () => {
  it('refuses off-topic questions and offers sight prompts', () => {
    const ticket = gatekeepAsk('who won the election and write python', page)
    expect(ticket.verdict).toBe('refuse')
    expect(ticket.promptQuestions.length).toBeGreaterThan(0)
  })

  it('explains how to use the site and offers Build My Itinerary', () => {
    const q = 'How to Use This website to design my itinerary'
    const ticket = gatekeepAsk(q, page)
    expect(ticket.verdict).toBe('allow')
    expect(ticket.intent).toBe('help')
    const offers = collectAskOffers(ticket, '/ask', q)
    expect(offers.some((o) => o.label === 'Build My Itinerary' && o.confirm)).toBe(true)
  })

  it('answers Ha Long Bay as a destination instead of forcing a listing pick', () => {
    const ticket = gatekeepAsk('What is ha long bay', page)
    expect(ticket.verdict).toBe('allow')
    expect(ticket.intent).toBe('about')
    expect(ticket.cityHint).toBe('Ha Long')
  })

  it('matches Hoa Lu hours without sending the ramble to an LLM intent dump', () => {
    const ticket = gatekeepAsk('umm so like when does hoa lu open tomorrow??', page)
    expect(ticket.verdict).toBe('allow')
    expect(ticket.intent).toBe('hours')
    expect(ticket.entities.some((e) => /hoa lu/i.test(e.name))).toBe(true)
    expect(ticket.compact.startsWith('hours')).toBe(true)
  })

  it('uses the current sight when the user says this/it', () => {
    const ticket = gatekeepAsk('when does it close?', {
      pathname: '/plan/builder/experience/hoa-lu',
      focus: { id: 'hoa-lu', kind: 'experience', name: 'Hoa Lu', city: 'Ninh Binh' },
      city: 'Ninh Binh',
    })
    expect(ticket.verdict).toBe('allow')
    expect(ticket.entities[0]?.id).toBe('hoa-lu')
    expect(ticket.intent).toBe('hours')
  })

  it('allows building a day from named sights', () => {
    const ticket = gatekeepAsk('build a day with temple of literature and hoan kiem', page)
    expect(ticket.verdict).toBe('allow')
    expect(ticket.intent).toBe('build_day')
    expect(ticket.entities.length).toBeGreaterThan(0)
  })
})

describe('ask catalog match', () => {
  it('finds listed sights by common names', () => {
    const hits = findAskEntities('hoa lu ancient capital')
    expect(hits.some((h) => /hoa lu/i.test(h.name))).toBe(true)
  })
})

describe('ask pipeline offers', () => {
  it('puts a Take me to city chip on a Ha Long destination question', () => {
    const ticket = gatekeepAsk('What is ha long bay', page)
    const offers = collectAskOffers(ticket, '/ask', 'What is ha long bay')
    expect(offers.some((o) => /ha-long/i.test(o.path) && o.confirm)).toBe(true)
    expect(offers.some((o) => /Take me to Ha Long/i.test(o.label))).toBe(true)
  })

  it('offers stay pipeline page when asked where to sleep', () => {
    const ticket = gatekeepAsk('Where should I stay in Hoi An?', page)
    const offers = collectAskOffers(ticket, '/ask', 'Where should I stay in Hoi An?')
    expect(offers.some((o) => o.path === '/plan/builder/stay')).toBe(true)
    expect(offers.some((o) => /hoi-an/i.test(o.path))).toBe(true)
  })
})

describe('ask day sketch', () => {
  it('skips a closed sight instead of inventing a clock', () => {
    const monday = '2026-09-21'
    const sketch = proposeAskDay(
      [{ id: 'hoa-lu', kind: 'experience', name: 'Hoa Lu', city: 'Ninh Binh' }],
      monday,
    )
    expect(sketch).toBeTruthy()
    const all = [...(sketch?.stops ?? []), ...(sketch?.skipped ?? [])]
    expect(all.some((s) => s.id === 'hoa-lu' || /hoa/i.test(s.name))).toBe(true)
  })
})
