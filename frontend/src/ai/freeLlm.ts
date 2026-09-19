import { askLlmMessages, composeAskReply } from './composeLocal'
import type { AskFact, AskMessage, AskTicket, AskToolResult } from './types'

const TIMEOUT_MS = 25000

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }

export type AskLlmProvider = 'gemini' | 'groq' | 'none'

export async function askLlmStatus(): Promise<AskLlmProvider> {
  try {
    const res = await fetch('/api/ask-llm')
    const json = (await res.json()) as { provider?: AskLlmProvider }
    return json.provider === 'gemini' || json.provider === 'groq' ? json.provider : 'none'
  } catch {
    return 'none'
  }
}

async function readRealLlm(messages: ChatMsg[], signal: AbortSignal) {
  const res = await fetch('/api/ask-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })
  const json = (await res.json()) as { text?: string; provider?: AskLlmProvider; error?: string }
  if (!res.ok) throw new Error(json.error || `ask-llm:${res.status}`)
  const text = json.text?.trim()
  if (!text) throw new Error('empty')
  return { text, provider: json.provider === 'groq' ? 'groq' : 'gemini' }
}

const LOCAL_INTENTS = new Set(['add', 'remove', 'build_day', 'show', 'navigate'])

export async function completeAskTurn(
  ticket: AskTicket,
  facts: AskFact[],
  tools: AskToolResult,
  extra?: { userText: string; history?: AskMessage[] },
): Promise<{ text: string; source: AskLlmProvider | 'local' }> {
  if (ticket.verdict === 'refuse' || ticket.verdict === 'ask' || LOCAL_INTENTS.has(ticket.intent)) {
    return { text: composeAskReply(ticket, facts, tools), source: 'local' }
  }

  const provider = await askLlmStatus()
  if (provider === 'none') {
    return { text: composeAskReply(ticket, facts, tools), source: 'local' }
  }

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const { text, provider: used } = await readRealLlm(
      askLlmMessages(ticket, facts, tools, extra),
      controller.signal,
    )
    return { text, source: used }
  } catch {
    return { text: composeAskReply(ticket, facts, tools), source: 'local' }
  } finally {
    window.clearTimeout(timer)
  }
}
