import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Nav } from '../components/landing/Nav'
import { JOURNEY_TEMPLATES, type JourneyTemplate } from '../data/templates'

type Pace = JourneyTemplate['pace']
type Budget = JourneyTemplate['budget']
type Length = 'Under 10 days' | '10+ days'

const PACE_OPTIONS: Pace[] = ['Relaxed', 'Moderate', 'Packed']
const BUDGET_OPTIONS: Budget[] = ['Shoestring', 'Mid', 'Luxury']
const LENGTH_OPTIONS: Length[] = ['Under 10 days', '10+ days']

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function matchesLength(template: JourneyTemplate, lengths: Length[]) {
  if (lengths.length === 0) return true
  return lengths.some((length) => {
    if (length === 'Under 10 days') return template.minDays < 10
    return template.maxDays >= 10
  })
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-[0.78rem] font-semibold transition-colors duration-200 ${
        active
          ? 'border-terracotta bg-terracotta/10 text-terracotta-deep'
          : 'border-ink/15 bg-transparent text-muted hover:border-ink/30'
      }`}
    >
      {label}
    </button>
  )
}

function RoutePreview({ regions }: { regions: string[] }) {
  return (
    <div className="relative my-5 overflow-x-auto py-2">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-ink/15" aria-hidden="true" />
      <ol className="relative z-[1] flex min-w-max items-center gap-0">
        {regions.map((region, index) => (
          <li key={region} className="flex items-center">
            <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.72rem] font-semibold text-ink">
              {region}
            </span>
            {index < regions.length - 1 && (
              <span className="mx-1.5 text-[0.65rem] text-muted" aria-hidden="true">
                ·
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function JourneyRow({
  template,
  reverse,
}: {
  template: JourneyTemplate
  reverse: boolean
}) {
  return (
    <article
      id={template.id}
      className="scroll-mt-[90px] grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <div className={reverse ? 'lg:order-2' : undefined}>
        <div className="overflow-hidden rounded-card shadow-card">
          <img
            src={template.image}
            alt={template.name}
            className="aspect-[5/4] h-full w-full object-cover"
          />
        </div>
      </div>

      <div className={reverse ? 'lg:order-1' : undefined}>
        <h2 className="mb-3 font-serif text-[clamp(1.75rem,3vw,2.35rem)] font-semibold leading-tight text-ink">
          {template.name}
        </h2>
        <p className="mb-4 max-w-[38ch] text-[1.02rem] text-muted">{template.hook}</p>

        <p className="mb-1 text-[0.82rem] font-semibold text-ink/80">
          {template.duration}
          <span className="mx-2 text-muted/50">·</span>
          {template.pace}
          <span className="mx-2 text-muted/50">·</span>
          {template.budget}
        </p>

        <RoutePreview regions={template.regions} />

        <Link to={`/plan/itinerary/${template.id}`} className="btn-solid inline-flex">
          Use this journey
        </Link>
      </div>
    </article>
  )
}

export function TemplatesPage() {
  const [paces, setPaces] = useState<Pace[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [lengths, setLengths] = useState<Length[]>([])

  const filtered = useMemo(() => {
    return JOURNEY_TEMPLATES.filter((template) => {
      const paceOk = paces.length === 0 || paces.includes(template.pace)
      const budgetOk = budgets.length === 0 || budgets.includes(template.budget)
      const lengthOk = matchesLength(template, lengths)
      return paceOk && budgetOk && lengthOk
    })
  }, [paces, budgets, lengths])

  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[calc(100vh-72px)] max-w-content px-[clamp(1.1rem,4vw,2.5rem)] pb-24 pt-10">
        <header className="mb-6 max-w-[40rem]">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
            Ready-made journeys
          </p>
          <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
            Journeys through Vietnam
          </h1>
          <p className="text-muted">
            Every journey below is a starting point — edit anything once you’ve picked one.
          </p>
        </header>

        <aside className="mb-10 inline-block max-w-[36rem] rounded-xl border border-sage/25 bg-sage/10 px-4 py-3 text-[0.85rem] leading-snug text-muted">
          Not sure where to start?{' '}
          <a
            href="#classic-route"
            className="font-semibold text-terracotta-deep underline decoration-terracotta/40 underline-offset-2 transition-colors hover:text-terracotta"
          >
            The Classic Route
          </a>{' '}
          is where most first-timers begin.
        </aside>

        <div className="mb-14 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted/70">
              Pace
            </span>
            {PACE_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={paces.includes(option)}
                onClick={() => setPaces((prev) => toggleValue(prev, option))}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted/70">
              Budget
            </span>
            {BUDGET_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={budgets.includes(option)}
                onClick={() => setBudgets((prev) => toggleValue(prev, option))}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-muted/70">
              Length
            </span>
            {LENGTH_OPTIONS.map((option) => (
              <FilterChip
                key={option}
                label={option}
                active={lengths.includes(option)}
                onClick={() => setLengths((prev) => toggleValue(prev, option))}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-20 md:gap-28">
          {filtered.length === 0 ? (
            <p className="text-center text-muted">
              No journeys match those filters — clear a chip to see more.
            </p>
          ) : (
            filtered.map((template, index) => (
              <JourneyRow
                key={template.id}
                template={template}
                reverse={index % 2 === 1}
              />
            ))
          )}
        </div>
      </main>
    </>
  )
}
