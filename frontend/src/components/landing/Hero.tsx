import { useEffect, useRef, useState, type FormEvent } from 'react'

const SLIDES = [
  { seed: 'hanoi-hero', name: 'Hanoi' },
  { seed: 'halongbay-hero', name: 'Ha Long Bay' },
  { seed: 'hue-hero', name: 'Hue' },
  { seed: 'hoian-hero', name: 'Hoi An' },
  { seed: 'hcmc-hero', name: 'Ho Chi Minh City' },
  { seed: 'mekong-hero', name: 'Mekong Delta' },
  { seed: 'sapa-hero', name: 'Sapa' },
] as const

const SLIDE_MS = 4500

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function Hero() {
  const [index, setIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognition()))
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    console.log(query.trim())
  }

  function startListening() {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }

    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognitionRef.current = recognition
    setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) setQuery(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    try {
      recognition.start()
    } catch {
      setListening(false)
    }
  }

  return (
    <section
      className="relative min-h-0 w-full flex-1 overflow-hidden"
      aria-label="Hero"
    >
      {/* Slideshow */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.seed}
            src={`https://picsum.photos/seed/${slide.seed}/1600/1000`}
            alt=""
            aria-hidden={i !== index}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Legibility overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,22,18,0.45) 0%, rgba(28,22,18,0.15) 28%, rgba(28,22,18,0.12) 52%, rgba(28,22,18,0.45) 78%, rgba(28,22,18,0.72) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[clamp(1.1rem,4vw,2.5rem)] pb-16 pt-4 text-center sm:pb-20">
          <h1 className="mb-2 font-serif text-[clamp(1.85rem,5.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-paper [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] sm:mb-3">
            Vietnam, End to End
          </h1>
          <p className="mb-5 max-w-[40ch] text-[clamp(0.88rem,1.4vw,1.05rem)] text-paper/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.35)] sm:mb-6">
            Browse the country like a journal — then cart your route and confirm only when you’re ready.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-[min(560px,92vw)]">
            <label htmlFor="hero-search" className="sr-only">
              Search Vietnam
            </label>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything — 'best beaches in March', 'vegetarian food in Hoi An'..."
              className="h-[2.9rem] w-full rounded-full border border-ink/5 bg-paper py-2.5 pl-5 pr-12 text-[0.9rem] text-ink shadow-card outline-none placeholder:text-muted/80 focus:ring-2 focus:ring-terracotta/35 sm:h-[3.25rem] sm:pl-6 sm:pr-14 sm:text-[0.95rem]"
            />
            {speechSupported && (
              <button
                type="button"
                onClick={startListening}
                aria-label={listening ? 'Listening…' : 'Search by voice'}
                className={`absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full transition-colors sm:right-2 sm:h-10 sm:w-10 ${
                  listening
                    ? 'bg-terracotta/15 text-terracotta'
                    : 'text-muted hover:bg-cream-deep hover:text-ink'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Place label + dash progress */}
        <div className="pointer-events-none absolute bottom-4 left-[clamp(1.1rem,4vw,2.5rem)] z-[3] sm:bottom-6">
          <div className="mb-2 flex items-center gap-1.5" aria-hidden="true">
            {SLIDES.map((slide, i) => (
              <span
                key={slide.seed}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === index ? 'w-7 bg-terracotta' : 'w-3 bg-paper/35'
                }`}
              />
            ))}
          </div>
          <div className="relative h-5 overflow-hidden">
            {SLIDES.map((slide, i) => (
              <p
                key={slide.seed}
                className="absolute left-0 top-0 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-paper/85 transition-opacity duration-[1200ms] ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                {slide.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
