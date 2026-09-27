import { matchAskCity, rankAskEntities } from './catalogIndex'
import type { AskIntent, AskPageContext, AskTicket } from './types'

const REFUSE_RE =
  /\b(python|javascript|typescript|code|sql|regex|election|president|crypto|bitcoin|stock|homework|essay|recipe for(?! pho)|who won|make me a|linux|windows install|medical diagnos|legal advice|girlfriend|boyfriend)\b/i

const SITE_RE =
  /\b(this site|this app|this website|how to use|vietnam[, ]?curated|who are you|what (can|do) you|how (does|do) (this|the site|the app)|what is this)\b/i

const IN_SCOPE_RE =
  /\b(vietnam|viet nam|itinerary|sight|temple|pagoda|bay|cruise|beach|island|cave|market|pho|hanoi|saigon|hoi an|sapa|hue|danang|da nang|ninh binh|phu quoc|halong|ha long|mekong|trip|travel|destination|stay|hotel|eat|food|train|visa|sim|weather|season|shopping|airport|itinerary)\b/i

const HOURS_RE = /\b(open|opens|opening|hours|close|closes|closed|when can i go|what time)\b/i
const COST_RE = /\b(cost|price|how much|fee|ticket|free)\b/i
const ADD_RE = /\b(add|save|bag|put (it|this) in|include)\b/i
const REMOVE_RE = /\b(remove|drop|take (it|this) off|unsave)\b/i
const BUILD_RE = /\b(build|plan|make|create|pack)\b.*\b(day|itinerary|schedule|morning)\b|\b(day (plan|trip)|itinerary)\b/i
const SHOW_RE = /\b(show|take me|open the page|go to|jump|scroll|where is that on|direct me|bring me)\b/i
const SIMILAR_RE = /\b(similar|else|another|like this|nearby|same city)\b/i
const FIT_RE = /\b(fit|too much|too packed|time for|enough time|hours left)\b/i
const HELP_RE = /\b(help|what can you|what do you)\b/i
const ABOUT_RE = /\b(what is|tell me|about|why go|worth it)\b/i
const PRONOUN_RE = /\b(it|this|here|the sight|this place)\b/i

const PROMPTS = [
  'When does this sight open?',
  'Add this to my trip',
  'Build a day from what’s in my bag',
  'Show me similar sights in this city',
]

function intentOf(text: string): AskIntent {
  if (HELP_RE.test(text) || SITE_RE.test(text)) return 'help'
  if (BUILD_RE.test(text)) return 'build_day'
  if (REMOVE_RE.test(text)) return 'remove'
  if (ADD_RE.test(text)) return 'add'
  if (SHOW_RE.test(text)) return 'show'
  if (HOURS_RE.test(text)) return 'hours'
  if (COST_RE.test(text)) return 'cost'
  if (FIT_RE.test(text)) return 'fit'
  if (SIMILAR_RE.test(text)) return 'similar'
  if (ABOUT_RE.test(text)) return 'about'
  return 'about'
}

function compactLine(intent: AskIntent, names: string[], raw: string) {
  const who = names.slice(0, 3).join(', ') || 'TripBuilder'
  const clipped = raw.replace(/\s+/g, ' ').trim().slice(0, 140)
  return `${intent} · ${who} · ${clipped}`
}

function ticket(
  partial: Omit<AskTicket, 'promptQuestions'> & { promptQuestions?: string[] },
): AskTicket {
  return { promptQuestions: PROMPTS, ...partial }
}

export function gatekeepAsk(raw: string, page: AskPageContext): AskTicket {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) {
    return ticket({
      verdict: 'refuse',
      intent: 'help',
      entities: [],
      compact: 'empty',
    })
  }

  const ranked = rankAskEntities(text)
  const matched = ranked.map((r) => r.entity)
  const cityHint = matchAskCity(text) ?? page.city ?? undefined
  const siteQuestion = SITE_RE.test(text)
  const offTopic = REFUSE_RE.test(text)

  if (offTopic && matched.length === 0 && !siteQuestion && !cityHint) {
    return ticket({
      verdict: 'refuse',
      intent: 'help',
      entities: [],
      compact: 'off-topic',
    })
  }

  const intent = intentOf(text)
  let entities = matched

  if (entities.length === 0 && (PRONOUN_RE.test(text) || intent !== 'help') && page.focus) {
    entities = [page.focus]
  }

  if (intent === 'build_day') {
    return ticket({
      verdict: 'allow',
      intent,
      entities,
      cityHint,
      compact: compactLine(intent, entities.map((e) => e.name), text),
    })
  }

  if (entities.length === 0) {
    if (siteQuestion || cityHint || IN_SCOPE_RE.test(text) || intent === 'help') {
      return ticket({
        verdict: 'allow',
        intent: siteQuestion ? 'help' : intent,
        entities: [],
        cityHint,
        compact: compactLine(siteQuestion ? 'help' : intent, cityHint ? [cityHint] : ['TripBuilder'], text),
      })
    }
    if (page.city && (intent === 'similar' || intent === 'show')) {
      return ticket({
        verdict: 'allow',
        intent,
        entities: [],
        cityHint: page.city,
        compact: compactLine(intent, [page.city], text),
      })
    }
    return ticket({
      verdict: 'refuse',
      intent: 'help',
      entities: [],
      compact: 'no-entity',
    })
  }

  // Only make them pick when we would mutate the bag.
  if (
    (intent === 'add' || intent === 'remove') &&
    ranked.length > 1 &&
    ranked[0].score - ranked[1].score < 3 &&
    !PRONOUN_RE.test(text)
  ) {
    return ticket({
      verdict: 'ask',
      intent,
      entities: [ranked[0].entity],
      cityHint,
      compact: compactLine(intent, matched.slice(0, 2).map((e) => e.name), text),
      choices: matched.slice(0, 3),
    })
  }

  if (offTopic && !siteQuestion && !cityHint) {
    return ticket({
      verdict: 'refuse',
      intent: 'help',
      entities: [],
      compact: 'off-topic-with-place',
    })
  }

  return ticket({
    verdict: 'allow',
    intent,
    entities: entities.slice(0, 3),
    cityHint,
    compact: compactLine(intent, entities.map((e) => e.name), text),
  })
}
