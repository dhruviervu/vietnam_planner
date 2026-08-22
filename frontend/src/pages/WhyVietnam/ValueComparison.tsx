import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ValueSideSlideshow, type ShowcaseSlide } from './ValueSideSlideshow'

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type TravelMode = 'locals' | 'tourists'

type UnlockCard = {
  title: string
  quantity: Record<TravelMode, string>
  detail: Record<TravelMode, string>
  icon: ReactNode
}

const LEFT_SLIDES: readonly ShowcaseSlide[] = [
  { name: 'Ha Giang Loop', seed: 'value-left-hagiang' },
  { name: 'Ha Long Bay', seed: 'value-left-halong' },
  { name: 'Ninh Binh', seed: 'value-left-ninhbinh' },
  { name: 'Sapa Rice Terraces', seed: 'value-left-sapa' },
  { name: 'Phong Nha Caves', seed: 'value-left-phongnha' },
]

const RIGHT_SLIDES: readonly ShowcaseSlide[] = [
  { name: 'Hoi An', seed: 'value-right-hoian' },
  { name: 'Hanoi Old Quarter', seed: 'value-right-hanoi' },
  { name: 'Da Nang', seed: 'value-right-danang' },
  { name: 'Hue Imperial City', seed: 'value-right-hue' },
  { name: 'Ho Chi Minh City', seed: 'value-right-hcmc' },
]

// Illustrative purchasing-power snapshots — not a price quote; meant to visualize how far $100 stretches.
const UNLOCK_CARDS: UnlockCard[] = [
  {
    title: 'Street Food',
    quantity: { locals: '20–30', tourists: '12–18' },
    detail: {
      locals: 'local meals from sidewalk stalls and markets',
      tourists: 'sit-down bowls and tourist-area favorites',
    },
    icon: (
      <LineIcon>
        <path d="M5.5 12.5h13c0 3.6-2.6 6.5-6.5 6.5s-6.5-2.9-6.5-6.5z" />
        <path d="M4.5 12.5h15" />
        <path d="M9 7.2c.3.8.3 1.6 0 2.4M12 6.5c.3.9.3 1.8 0 2.7M15 7.2c.3.8.3 1.6 0 2.4" />
      </LineIcon>
    ),
  },
  {
    title: 'Boutique Stays',
    quantity: { locals: '2–4', tourists: '1–2' },
    detail: {
      locals: 'nights in tidy guesthouses and boutique rooms',
      tourists: 'nights in mid-range hotels with extras',
    },
    icon: (
      <LineIcon>
        <path d="M4 11h16v8H4z" />
        <path d="M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3" />
        <path d="M4 15h16M10 8v3M14 8v3" />
      </LineIcon>
    ),
  },
  {
    title: 'Coffee Culture',
    quantity: { locals: '40–60', tourists: '20–30' },
    detail: {
      locals: 'Vietnamese coffees from neighborhood cafés',
      tourists: 'specialty café stops and signature drinks',
    },
    icon: (
      <LineIcon>
        <path d="M8 8h8a3 3 0 010 6H8V8z" />
        <path d="M8 8V6.5A2.5 2.5 0 0110.5 4h3A2.5 2.5 0 0116 6.5" />
        <path d="M8 14v4M12 14v4M16 14v2" />
      </LineIcon>
    ),
  },
  {
    title: 'Local Exploration',
    quantity: { locals: '3–5', tourists: '1–2' },
    detail: {
      locals: 'days of scooter rental for city and countryside hops',
      tourists: 'days of scooter or private-driver day rates',
    },
    icon: (
      <LineIcon>
        <circle cx="7.5" cy="16.5" r="2" />
        <circle cx="16.5" cy="16.5" r="2" />
        <path d="M9.5 16.5h5M5.5 16.5H4l2-6h7l3 4h2.5" />
        <path d="M8.5 10.5h4" />
      </LineIcon>
    ),
  },
  {
    title: 'Experiences',
    quantity: { locals: '2–4', tourists: '1–2' },
    detail: {
      locals: 'tours, boat rides, cooking classes, and activities',
      tourists: 'guided tours and signature paid experiences',
    },
    icon: (
      <LineIcon>
        <path d="M3 15c2.5-1 4.5-4 5.5-7 1 3 3 6 5.5 7" />
        <path d="M4 18h16M7 18c.5-2 2-3.5 5-3.5s4.5 1.5 5 3.5" />
      </LineIcon>
    ),
  },
  {
    title: 'Getting Around',
    quantity: { locals: '4–8', tourists: '2–4' },
    detail: {
      locals: 'train or bus journeys between major cities',
      tourists: 'comfortable buses or soft-seat train legs',
    },
    icon: (
      <LineIcon>
        <path d="M5 7h14v9H5z" />
        <path d="M5 12h14M8 16v2M16 16v2M8 9.5h2M14 9.5h2" />
      </LineIcon>
    ),
  },
]

export function ValueComparison() {
  const sectionRef = useRef<HTMLElement>(null)
  const startedRef = useRef(false)
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState<TravelMode>('locals')

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return
        startedRef.current = true
        setActive(true)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-cream-deep px-[clamp(1.1rem,4vw,2.5rem)] py-[clamp(2.75rem,6vw,4rem)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <p className="mb-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
          Value
        </p>
        <h2 className="mb-3 text-center font-serif text-[clamp(1.85rem,3.4vw,2.55rem)] font-semibold tracking-[-0.02em] text-ink">
          More Experiences. Less Cost.
        </h2>
        <p className="mx-auto mb-8 max-w-[44ch] text-center text-[0.98rem] leading-relaxed text-muted">
          From street food and boutique stays to bucket-list adventures, your travel budget goes
          further in Vietnam.
        </p>

        {/* Symmetrical trio: nature | value card | culture */}
        <div className="mb-10 grid grid-cols-1 items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] md:gap-4 lg:gap-6">
          <div className="hidden md:block">
            <ValueSideSlideshow
              slides={LEFT_SLIDES}
              ariaLabel="Nature and adventure destinations"
            />
          </div>

          <div className="mx-auto w-full max-w-lg md:max-w-none">
            <div className="rounded-2xl bg-paper px-6 py-7 shadow-card sm:px-8">
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-ink">
                      <LineIcon>
                        <path d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.7l5-.7L12 3.5z" />
                      </LineIcon>
                      Experience
                    </span>
                    <span className="text-[0.75rem] font-semibold text-terracotta">Full</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-terracotta to-terracotta-deep transition-[width] duration-[1100ms] ease-out"
                      style={{ width: active ? '100%' : '0%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-ink">
                      <LineIcon>
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M12 7v10M9.5 9.2c.6-1 1.7-1.5 2.8-1.5 1.5 0 2.7.9 2.7 2.2S13.8 12 12.2 12h-.4c-1.6 0-2.8.8-2.8 2.2 0 1.3 1.2 2.2 2.8 2.2 1.1 0 2.1-.5 2.7-1.4" />
                      </LineIcon>
                      Cost
                    </span>
                    <span className="text-[0.75rem] font-semibold text-sage">Low</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-sage/80 transition-[width] duration-[1100ms] delay-150 ease-out"
                      style={{ width: active ? '32%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-5 text-center text-[0.88rem] text-muted">
                Same budget. Significantly more of the trip you came for.
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <ValueSideSlideshow
              slides={RIGHT_SLIDES}
              ariaLabel="Culture and city destinations"
            />
          </div>
        </div>

        {/* Mobile: balanced horizontal showcases below the focal card */}
        <div className="mb-10 space-y-5 md:hidden">
          <div>
            <p className="mb-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Nature & Adventure
            </p>
            <ValueSideSlideshow
              slides={LEFT_SLIDES}
              ariaLabel="Nature and adventure destinations"
              variant="strip"
            />
          </div>
          <div>
            <p className="mb-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Culture & Cities
            </p>
            <ValueSideSlideshow
              slides={RIGHT_SLIDES}
              ariaLabel="Culture and city destinations"
              variant="strip"
            />
          </div>
        </div>

        {/* What $100 can unlock */}
        <div className="mx-auto max-w-content">
          <div className="mb-3 text-center">
            <h3 className="mb-2 font-serif text-[clamp(1.45rem,2.6vw,1.85rem)] font-semibold text-ink">
              What $100 Can Unlock
            </h3>
            <p className="mx-auto max-w-[36ch] text-[0.92rem] text-muted">
              A glimpse of how far your travel budget can go.
            </p>
          </div>

          <div className="mb-5 flex justify-center">
            <div
              role="tablist"
              aria-label="Travel style"
              className="inline-flex rounded-full bg-paper p-1 shadow-soft"
            >
              {(
                [
                  { key: 'locals', label: 'How Locals Travel' },
                  { key: 'tourists', label: 'How Most Tourists Travel' },
                ] as const
              ).map((tab) => {
                const selected = mode === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setMode(tab.key)}
                    className={`rounded-full px-3.5 py-2 text-[0.78rem] font-bold transition-colors duration-200 sm:px-4 sm:text-[0.82rem] ${
                      selected
                        ? 'bg-terracotta text-paper shadow-[0_6px_16px_rgba(196,92,58,0.28)]'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {UNLOCK_CARDS.map((card) => (
              <article
                key={card.title}
                className="group rounded-2xl bg-paper px-4 py-5 shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-sage/15 text-sage transition-colors duration-200 group-hover:bg-terracotta/12 group-hover:text-terracotta">
                  {card.icon}
                </div>
                <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
                  {card.title}
                </p>
                <p
                  key={`${card.title}-${mode}`}
                  className="mb-1.5 font-serif text-[clamp(1.55rem,2.8vw,1.9rem)] font-semibold leading-none tracking-[-0.02em] text-ink animate-[unlock-fade_280ms_ease-out]"
                >
                  {card.quantity[mode]}
                </p>
                <p className="text-[0.84rem] leading-snug text-muted">{card.detail[mode]}</p>
              </article>
            ))}
          </div>

          <p className="mb-6 text-center text-[0.75rem] text-muted/80">
            Illustrative ranges for a $100 budget — meant to show purchasing power, not exact quotes.
          </p>

          <aside className="rounded-2xl border border-terracotta/20 bg-paper px-5 py-5 text-center shadow-soft sm:px-8">
            <p className="mx-auto max-w-[46ch] font-serif text-[1.05rem] leading-snug text-ink sm:text-[1.12rem]">
              Vietnam is one of the few destinations where you don’t have to choose between adventure,
              comfort, culture, and affordability.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
