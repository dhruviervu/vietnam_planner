import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applyAskDay, handleAskTurn, newAskId } from '../../ai/handleTurn'
import { loadAskMessages, saveAskMessages } from '../../ai/chatMemory'
import { useSpeechInput } from '../../ai/useSpeechInput'
import type { AskMessage, DaySketch, NavigateOffer } from '../../ai/types'

type Props = {
  pathname: string
  variant: 'page' | 'mini'
  onClose?: () => void
}

const STARTERS = [
  'What is Ha Long Bay?',
  'Take me to Hoi An sights',
  'Where should I stay in Hanoi?',
]

function cleanAskText(text: string) {
  return text.replace(/\*\*/g, '').replace(/^#{1,6}\s+/gm, '')
}

export function AskChat({ pathname, variant, onClose }: Props) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<AskMessage[]>(() => loadAskMessages())
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const speech = useSpeechInput((text) => setDraft(text))

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, busy])

  useEffect(() => {
    saveAskMessages(messages)
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function send(text: string) {
    const trimmed = text.replace(/\s+/g, ' ').trim()
    if (!trimmed || busy) return
    speech.stop()
    setDraft('')
    const userMsg: AskMessage = { id: newAskId(), role: 'user', text: trimmed }
    const history = [...messages, userMsg]
    setMessages(history)
    setBusy(true)
    try {
      const { assistant } = await handleAskTurn(trimmed, pathname, history)
      setMessages((prev) => [...prev, assistant])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newAskId(),
          role: 'assistant',
          text: 'Something glitched. Ask again about a Vietnam sight, a city, or your trip.',
        },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  function go(offer: NavigateOffer) {
    const hash = offer.hash ? `#${offer.hash.replace(/^#/, '')}` : ''
    navigate(`${offer.path}${hash}`)
    onClose?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-ink/8 px-4 py-3">
        <div>
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-sage">
            Trip assistant
          </p>
          <p className="font-serif text-[1.05rem] font-semibold text-ink">Ask, then go</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-[0.72rem] font-bold text-muted hover:bg-cream"
          >
            Close
          </button>
        ) : null}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl bg-cream px-4 py-3 text-[0.88rem] leading-relaxed text-muted">
            <p>
              Ask about a city, a listed sight, hours, or your itinerary. If a page would help, I’ll
              put a Take me there button on the reply.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  className="rounded-full bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/10 hover:bg-cream-deep"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m) => (
          <Bubble
            key={m.id}
            message={m}
            onGo={go}
            onApply={(ids) => {
              applyAskDay(ids)
              setMessages((prev) => [
                ...prev,
                {
                  id: newAskId(),
                  role: 'assistant',
                  text: 'Applied those stops to your trip.',
                  offers: [
                    {
                      label: 'Your itinerary',
                      path: '/plan/builder/itinerary',
                      confirm: true,
                    },
                  ],
                },
              ])
            }}
          />
        ))}
        {busy ? <ThinkingDots /> : null}
      </div>

      {speech.error ? (
        <p className="px-4 pb-1 text-[0.72rem] text-terracotta">{speech.error}</p>
      ) : null}

      <form
        className="border-t border-ink/8 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          void send(draft)
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(draft)
              }
            }}
            rows={variant === 'page' ? 3 : 2}
            placeholder={speech.listening ? 'Listening…' : 'Ask about a city, sight, or your trip'}
            className="min-h-[44px] flex-1 resize-none rounded-2xl bg-cream px-3 py-2.5 text-[0.88rem] text-ink outline-none ring-1 ring-ink/10 focus:ring-terracotta/40"
          />
          <button
            type="button"
            onClick={() => speech.toggle(draft)}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? 'Stop listening' : 'Speak'}
            title={speech.supported ? 'Speak' : 'Voice needs Chrome or Edge'}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
              speech.listening
                ? 'bg-terracotta text-paper shadow-[0_0_0_4px_rgba(196,92,58,0.22)]'
                : 'bg-cream text-ink ring-1 ring-ink/10 hover:bg-cream-deep'
            }`}
          >
            <MicIcon pulse={speech.listening} />
          </button>
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="h-11 shrink-0 rounded-full bg-ink px-4 text-[0.8rem] font-bold text-paper disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

function Bubble({
  message,
  onGo,
  onApply,
}: {
  message: AskMessage
  onGo: (offer: NavigateOffer) => void
  onApply: (ids: string[]) => void
}) {
  const mine = message.role === 'user'
  const offers = message.offers ?? []
  const primary = offers.find((o) => o.confirm) ?? offers[0]
  const rest = offers.filter((o) => o !== primary)

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[0.88rem] leading-relaxed ${
          mine ? 'bg-ink text-paper' : 'bg-paper text-ink ring-1 ring-ink/8'
        }`}
      >
        <p className="whitespace-pre-wrap">{cleanAskText(message.text)}</p>
        {message.daySketch ? <DayCard sketch={message.daySketch} /> : null}
        {!mine && (offers.length > 0 || message.pendingApplyIds?.length) ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.pendingApplyIds && message.pendingApplyIds.length > 0 ? (
              <button
                type="button"
                onClick={() => onApply(message.pendingApplyIds ?? [])}
                className="rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper"
              >
                Apply this day
              </button>
            ) : null}
            {primary ? (
              <button
                type="button"
                onClick={() => onGo(primary)}
                className="rounded-full bg-terracotta px-3.5 py-1.5 text-[0.72rem] font-bold text-paper"
              >
                Take me there
              </button>
            ) : null}
            {rest.map((offer) => (
              <button
                key={`${offer.path}${offer.hash ?? ''}`}
                type="button"
                onClick={() => onGo(offer)}
                className="rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/10 hover:bg-cream-deep"
              >
                {offer.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex justify-start" role="status" aria-label="Thinking">
      <div className="ask-dots rounded-2xl bg-paper px-3.5 py-2.5 ring-1 ring-ink/8">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

function DayCard({ sketch }: { sketch: DaySketch }) {
  return (
    <ul className="mt-2 space-y-1 rounded-xl bg-cream/80 px-3 py-2 text-[0.78rem] text-ink">
      {sketch.stops.map((s) => (
        <li key={s.id}>
          <span className="font-bold capitalize text-terracotta">{s.period}</span> · {s.name} ·{' '}
          {s.duration}
        </li>
      ))}
    </ul>
  )
}

function MicIcon({ pulse }: { pulse: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      {pulse ? <circle cx="12" cy="12" r="10" opacity="0.25" /> : null}
    </svg>
  )
}
