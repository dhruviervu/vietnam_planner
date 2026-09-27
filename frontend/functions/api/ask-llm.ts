/**
 * Cloudflare Pages Function — production twin of vite.askLlmPlugin.ts.
 *
 * Secrets (Pages → Settings → Variables and Secrets): GEMINI_API_KEY and/or GROQ_API_KEY.
 *
 * GET  → { provider: 'gemini' | 'groq' | 'none' }
 * POST → { text, provider, model }   body: { messages: [{ role, content }] }
 */

type Env = { GEMINI_API_KEY?: string; GROQ_API_KEY?: string }
type Context = { request: Request; env: Env }
type Role = 'system' | 'user' | 'assistant'
type ChatMessage = { role: Role; content: string }
type Provider = 'gemini' | 'groq' | 'none'

const RATE_LIMIT_REQUESTS = 30
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const MAX_BODY_BYTES = 96_000
const MAX_MESSAGES = 24
const MAX_MESSAGE_CHARS = 12_000
const TOTAL_DEADLINE_MS = 22_000
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite']
const GROQ_MODEL = 'llama-3.3-70b-versatile'

/** Per-isolate and best effort; pair with a Cloudflare WAF rate-limit rule on /api/ask-llm for a hard cap. */
const hitsByIp = new Map<string, number[]>()

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function keysOf(env: Env) {
  return { gemini: (env.GEMINI_API_KEY ?? '').trim(), groq: (env.GROQ_API_KEY ?? '').trim() }
}

function providerOf(env: Env): Provider {
  const keys = keysOf(env)
  if (keys.gemini) return 'gemini'
  if (keys.groq) return 'groq'
  return 'none'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hitsByIp.get(ip) ?? []).filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
  const limited = recent.length >= RATE_LIMIT_REQUESTS
  if (!limited) recent.push(now)
  hitsByIp.set(ip, recent)
  if (hitsByIp.size > 5000) hitsByIp.clear()
  return limited
}

function sameSite(request: Request): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return true
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, '')
  try {
    return strip(new URL(origin).hostname) === strip(new URL(request.url).hostname)
  } catch {
    return false
  }
}

function cleanMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  const out: ChatMessage[] = []
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue
    const { role, content } = m as { role?: unknown; content?: unknown }
    if (role !== 'system' && role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string') continue
    const text = content.slice(0, MAX_MESSAGE_CHARS).trim()
    if (text) out.push({ role, content: text })
  }
  return out
}

async function postJson(url: string, payload: unknown, headers: Record<string, string>, timeoutMs: number) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(Math.max(3000, timeoutMs)),
  })
  return { status: res.status, body: (await res.json().catch(() => null)) as unknown }
}

async function geminiComplete(key: string, messages: ChatMessage[], deadline: number) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content)
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const configs = [
    { temperature: 0.4, maxOutputTokens: 768, thinkingConfig: { thinkingBudget: 0 } },
    { temperature: 0.4, maxOutputTokens: 768 },
  ]
  let last = 'empty'
  modelLoop: for (const model of GEMINI_MODELS) {
    for (const generationConfig of configs) {
      const remaining = deadline - Date.now()
      if (remaining < 3000) throw new Error(`${last}:deadline`)
      const payload: Record<string, unknown> = { contents, generationConfig }
      if (system.length) payload.system_instruction = { parts: [{ text: system.join('\n') }] }
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
      let result: { status: number; body: unknown }
      try {
        result = await postJson(url, payload, {}, Math.min(13_000, remaining))
      } catch {
        last = `${model}:timeout`
        continue modelLoop
      }
      if (result.status < 200 || result.status >= 300) {
        last = `${model}:${result.status}`
        continue
      }
      const parts = (result.body as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        ?.candidates?.[0]?.content?.parts
      const text = (Array.isArray(parts) ? parts.map((p) => p?.text ?? '').join('') : '').trim()
      if (text) return { text, model }
      last = `${model}:empty`
    }
  }
  throw new Error(last)
}

async function groqComplete(key: string, messages: ChatMessage[], deadline: number) {
  const remaining = deadline - Date.now()
  if (remaining < 3000) throw new Error('groq:deadline')
  let result: { status: number; body: unknown }
  try {
    result = await postJson(
      'https://api.groq.com/openai/v1/chat/completions',
      { model: GROQ_MODEL, temperature: 0.35, max_tokens: 420, messages },
      { Authorization: `Bearer ${key}` },
      Math.min(15_000, remaining),
    )
  } catch {
    throw new Error('groq:timeout')
  }
  if (result.status < 200 || result.status >= 300) throw new Error(`groq:${result.status}`)
  const text = ((result.body as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message
    ?.content ?? '').trim()
  if (!text) throw new Error('groq:empty')
  return { text, model: GROQ_MODEL }
}

export async function onRequest({ request, env }: Context): Promise<Response> {
  const provider = providerOf(env)
  if (request.method === 'GET') return json(200, { provider })
  if (request.method !== 'POST') return json(405, { error: 'method' })
  if (!sameSite(request)) return json(403, { error: 'origin' })
  if (provider === 'none') return json(501, { error: 'no-key', provider: 'none' })

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (rateLimited(ip)) return json(429, { error: 'rate-limited' })

  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) {
    return json(413, { error: 'too-large' })
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'too-large' })

  let parsed: unknown = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }
  const messages = cleanMessages((parsed as { messages?: unknown } | null)?.messages)
  if (!messages.length) return json(400, { error: 'no-messages' })

  const keys = keysOf(env)
  const deadline = Date.now() + TOTAL_DEADLINE_MS
  try {
    if (keys.gemini) {
      try {
        const out = await geminiComplete(keys.gemini, messages, deadline)
        return json(200, { text: out.text, provider: 'gemini', model: out.model })
      } catch (err) {
        if (!keys.groq) throw err
      }
    }
    const out = await groqComplete(keys.groq, messages, deadline)
    return json(200, { text: out.text, provider: 'groq', model: out.model })
  } catch (err) {
    return json(502, { error: err instanceof Error ? err.message : 'llm-failed' })
  }
}
