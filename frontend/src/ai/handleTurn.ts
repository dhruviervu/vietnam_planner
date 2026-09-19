import { factForEntity, isoForAsk, similarInCity } from './facts'
import { gatekeepAsk } from './gatekeeper'
import { completeAskTurn } from './freeLlm'
import { readAskPageContext } from './pageContext'
import { collectAskOffers } from './pipelineOffers'
import { applyAskDay, runAskTools } from './tools'
import { useTripStore } from '../store/tripStore'
import type { AskMessage, AskTicket, AskToolResult } from './types'

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function newAskId() {
  return uid()
}

export async function handleAskTurn(
  raw: string,
  pathname: string,
  history: AskMessage[] = [],
): Promise<{
  ticket: AskTicket
  assistant: AskMessage
  tools: AskToolResult
}> {
  const page = readAskPageContext(pathname)
  const ticket = gatekeepAsk(raw, page)
  const iso = isoForAsk(useTripStore.getState().basics.startDate)

  let tools: AskToolResult = { did: [], daySketch: null, offers: collectAskOffers(ticket, pathname, raw) }
  if (ticket.verdict === 'allow') {
    tools = runAskTools(ticket, pathname, raw)
  }

  const facts = (ticket.intent === 'hours' || ticket.intent === 'cost' || ticket.intent === 'add' || ticket.intent === 'remove'
    ? ticket.entities.slice(0, 1)
    : ticket.entities
  )
    .map((e) => factForEntity(e, iso))
    .filter((f): f is NonNullable<typeof f> => f != null)

  if (ticket.intent === 'similar' && ticket.entities[0]) {
    for (const extra of similarInCity(ticket.entities[0].city, ticket.entities[0].id, 3)) {
      const fact = factForEntity(extra, iso)
      if (fact) facts.push(fact)
    }
  }

  if (ticket.cityHint && facts.length === 0) {
    for (const extra of similarInCity(ticket.cityHint, '', 3)) {
      const fact = factForEntity(extra, iso)
      if (fact) facts.push(fact)
    }
  }

  const { text, source } = await completeAskTurn(ticket, facts, tools, {
    userText: raw,
    history,
  })
  const offers = tools.offers
  const pendingApplyIds =
    ticket.intent === 'build_day' ? tools.daySketch?.stops.map((s) => s.id) : undefined

  return {
    ticket,
    tools,
    assistant: {
      id: uid(),
      role: 'assistant',
      text,
      offers,
      daySketch: tools.daySketch,
      pendingApplyIds,
      source: source === 'none' ? 'local' : source,
    },
  }
}

export { applyAskDay }
