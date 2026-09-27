import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

type Keys = {
  geminiKey: string
  groqKey: string
}

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function providerOf(keys: Keys): 'gemini' | 'groq' | 'none' {
  if (keys.geminiKey.trim()) return 'gemini'
  if (keys.groqKey.trim()) return 'groq'
  return 'none'
}

async function fetchTimed(url: string, init: RequestInit, ms: number) {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ac.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function geminiComplete(key: string, messages: ChatMsg[]) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
  const rest = messages.filter((m) => m.role !== 'system')
  // 3.6 Flash hangs on longer turns for new AI Studio keys; 3.5 is the working free chat model.
  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite']
  const configs: Record<string, unknown>[] = [
    { temperature: 0.4, maxOutputTokens: 768, thinkingConfig: { thinkingBudget: 0 } },
    { temperature: 0.4, maxOutputTokens: 768 },
  ]
  let last = 'empty'
  modelLoop: for (const model of models) {
    for (const generationConfig of configs) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
      try {
        const res = await fetchTimed(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: system ? { parts: [{ text: system }] } : undefined,
              contents: rest.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              generationConfig,
            }),
          },
          13000,
        )
        const raw = await res.text()
        if (!res.ok) {
          last = `${model}:${res.status}`
          continue
        }
        const data = JSON.parse(raw) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p) => p.text ?? '')
          .join('')
          .trim()
        if (text) return { text, model }
        last = `${model}:empty`
      } catch {
        last = `${model}:timeout`
        continue modelLoop
      }
    }
  }
  throw new Error(last)
}

async function groqComplete(key: string, messages: ChatMsg[]) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.35,
      max_tokens: 420,
      messages,
    }),
  })
  if (!res.ok) throw new Error(`groq:${res.status}`)
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('groq:empty')
  return { text, model: 'llama-3.3-70b-versatile' }
}

export function askLlmPlugin(keys: Keys): Plugin {
  return {
    name: 'ask-llm',
    configureServer(server) {
      server.middlewares.use('/api/ask-llm', async (req, res) => {
        const kind = providerOf(keys)
        if (req.method === 'GET') {
          json(res, 200, { provider: kind })
          return
        }
        if (req.method !== 'POST') {
          json(res, 405, { error: 'method' })
          return
        }
        if (kind === 'none') {
          json(res, 501, { error: 'no-key', provider: 'none' })
          return
        }
        try {
          const raw = await readBody(req)
          const parsed = JSON.parse(raw) as { messages?: ChatMsg[] }
          const messages = parsed.messages ?? []
          const result =
            kind === 'gemini'
              ? await geminiComplete(keys.geminiKey, messages)
              : await groqComplete(keys.groqKey, messages)
          json(res, 200, { text: result.text, provider: kind, model: result.model })
        } catch (err) {
          json(res, 502, { error: err instanceof Error ? err.message : 'llm-failed' })
        }
      })
    },
  }
}
