import { getCityDescription } from '../pages/PlanBuilder/data/cityDescriptions'
import { isHowToUsePrompt } from './howToUse'
import type { AskFact, AskMessage, AskTicket, AskToolResult, DaySketch } from './types'

function factLines(facts: AskFact[]) {
  return facts
    .map(
      (f) =>
        `- ${f.name} (${f.city}, ${f.kind}): ${f.hook.slice(0, 360)} Hours: ${f.hours}${
          f.closedToday ? ' CLOSED today.' : ''
        } Duration: ${f.duration}. Cost: ${f.cost}. Best slot: ${f.timePreference}.`,
    )
    .join('\n')
}

function sketchLines(sketch: DaySketch | null) {
  if (!sketch) return ''
  const stops = sketch.stops
    .map((s) => `${s.period}: ${s.name} (${s.duration}; ${s.hours})`)
    .join('; ')
  const skip = sketch.skipped.map((s) => `${s.name} (${s.skipped})`).join('; ')
  return `Day draft in ${sketch.city} on ${sketch.dateLabel} (~${sketch.totalHours}h). Stops: ${stops}. Skipped: ${skip || 'none'}.`
}

export function composeAskReply(
  ticket: AskTicket,
  facts: AskFact[],
  tools: AskToolResult,
): string {
  if (ticket.verdict === 'refuse') {
    return [
      'I help with Vietnam travel on this site — sights, activities, and your itinerary.',
      'Try one of these:',
      ...ticket.promptQuestions.map((q) => `• ${q}`),
    ].join('\n')
  }

  if (ticket.verdict === 'ask' && ticket.choices?.length) {
    return `A few listed items match. Which should I add or change?\n${ticket.choices
      .map((c, i) => `${i + 1}. ${c.name} (${c.city})`)
      .join('\n')}`
  }

  if (isHowToUsePrompt(ticket.compact)) {
    return [
      'TripBuilder is built so you can design a Vietnam trip without guessing the order.',
      'Use the left rail to browse on your own: When to Go and Know before you go, then stays, getting around, and airport transfer. Sights, things to do, where to eat, and shopping live under Itinerary.',
      'The fastest path is Build My Itinerary. It opens Attractions first. Open a sight, tap See more, and add it to your trip bag — the itinerary is crafted from what you save, and you can still rearrange days after. When to go, stays, and getting around stay in the left rail.',
      'On a sight card, tap the location to open every major sight in that city. Ask me later about hours, whether something fits a day, or where to stay.',
      'When you are ready to start, use the button below.',
    ].join('\n\n')
  }

  const first = facts[0]
  const extra = tools.did.length ? `${tools.did.join('. ')}. ` : ''

  if (ticket.intent === 'help' && !first && !ticket.cityHint) {
    return `${extra}TripBuilder is a trip planner for Vietnam: pick listed sights and activities, pin them in your bag, and build a day-by-day itinerary. Ask me what a place is, when it opens, or to take you to that city. Use Take me there when you want the page.`
  }

  if (ticket.intent === 'hours' && first) {
    return `${extra}${first.name} in ${first.city}: ${first.hours}.${
      first.closedToday ? ' It looks closed on that date — I would not put it on that day.' : ''
    } Typical visit is ${first.duration}.`
  }

  if (ticket.intent === 'cost' && first) {
    return `${extra}${first.name} is ${first.cost}. ${first.hook}`
  }

  if (ticket.intent === 'add') {
    return extra || 'Added to your trip.'
  }

  if (ticket.intent === 'remove') {
    return extra || 'Removed from your trip.'
  }

  if (ticket.intent === 'build_day') {
    const sketch = tools.daySketch
    if (!sketch || sketch.stops.length === 0) {
      return `${extra}I need listed sights or items in your bag to draft a day. Add a few, or name the sights.`
    }
    const lines = sketch.stops.map((s) => `• ${s.period}: ${s.name} — ${s.duration} (${s.hours})`)
    const skip =
      sketch.skipped.length > 0
        ? `\nLeft out: ${sketch.skipped.map((s) => `${s.name} (${s.skipped})`).join('; ')}.`
        : ''
    return `${extra}A workable ${sketch.city} day (~${sketch.totalHours}h) using catalog hours:\n${lines.join(
      '\n',
    )}${skip}\nI can apply this to your trip if you confirm.`
  }

  if (ticket.intent === 'similar' && first) {
    return `${extra}Other listed sights in ${first.city} are a better next step than random suggestions. Say the name if you want hours or to add one.`
  }

  if (ticket.intent === 'show' || ticket.intent === 'navigate') {
    return `${extra}I can take you to the matching page. Tap Take me there when you are ready.`
  }

  if (ticket.intent === 'fit' && first) {
    return `${extra}${first.name} wants about ${first.duration} (${first.timePreference.toLowerCase()} is the natural slot). Hours: ${first.hours}.${
      first.closedToday ? ' Closed that day, so it does not fit.' : ''
    }`
  }

  if (ticket.cityHint && !first) {
    return `${extra}${getCityDescription(ticket.cityHint)}`
  }

  if (first) {
    return `${extra}${first.name} in ${first.city}. ${first.hook} Hours: ${first.hours}. ${first.duration}, ${first.cost}.`
  }

  return `${extra}Ask about a Vietnam destination, a listed sight, or how this planner works.`
}

export function askLlmMessages(
  ticket: AskTicket,
  facts: AskFact[],
  tools: AskToolResult,
  extra?: {
    userText: string
    history?: Pick<AskMessage, 'role' | 'text'>[]
  },
) {
  const system = [
    'You are the in-product assistant for TripBuilder, a Vietnam trip planner.',
    'Travellers browse listed sights and activities, pin a trip bag, and build a day-by-day itinerary.',
    'Be conversational and useful. Answer questions about this site, Vietnam destinations, and listed sights.',
    'Prefer FACTS for opening hours, duration, and prices — never invent clocks.',
    'You may use ordinary Vietnam travel knowledge for destination overviews (for example what Ha Long Bay is).',
    'If several listings match, answer the destination first and mention the closest listings. Do not interrogate before answering.',
    'Stay on Vietnam travel and this product. 3–8 short sentences. No markdown, no model names, no URLs.',
    'The UI shows Take me there buttons for matching city and pipeline pages. Do not ask them to type a URL.',
  ].join(' ')

  const user = [
    `Traveller said: "${(extra?.userText || ticket.compact).replace(/\s+/g, ' ').trim()}"`,
    `Intent: ${ticket.compact}`,
    ticket.cityHint ? `Destination: ${ticket.cityHint}` : '',
    ticket.cityHint ? `CITY NOTE: ${getCityDescription(ticket.cityHint)}` : '',
    tools.did.length ? `Already done: ${tools.did.join('; ')}` : '',
    sketchLines(tools.daySketch),
    'FACTS (listed items on this site):',
    factLines(facts) || '(none — still answer from CITY NOTE and ordinary Vietnam knowledge if this is a destination or site question)',
  ]
    .filter(Boolean)
    .join('\n')

  const history = extra?.history ?? []
  const turns = history
    .filter((m) => m.text.trim())
    .slice(-6)
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.text.slice(0, 500),
    }))

  while (turns[0]?.role === 'assistant') turns.shift()
  if (turns.at(-1)?.role === 'user') turns.pop()

  return [{ role: 'system' as const, content: system }, ...turns, { role: 'user' as const, content: user }]
}
