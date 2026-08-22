import { useMemo, useState } from 'react'
import {
  INSURANCE_ACTIVITIES,
  INSURANCE_COVERAGE,
  INSURANCE_EXPLORE_LINKS,
  INSURANCE_PLANS,
  INSURANCE_RISKS,
  TRIP_LENGTH_COST_FACTOR,
} from '../data/insurance'
import type { InsuranceActivityId, InsurancePlanTierId } from '../data/types'
import { ChipButton, Label, SectionIntro } from './ui'

const HERO =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80'

const IMP = {
  essential: { label: 'Essential', className: 'text-terracotta' },
  useful: { label: 'Useful', className: 'text-ink/70' },
  depends: { label: 'Depends', className: 'text-muted' },
} as const

type TripBand = 'short' | 'medium' | 'long'

function formatUsdRange(lo: number, hi: number): string {
  return `$${Math.round(lo)}–$${Math.round(hi)}`
}

function scaleRange(
  range: [number, number],
  factor: number,
): [number, number] {
  return [range[0] * factor, range[1] * factor]
}

export function InsuranceSection() {
  const [activities, setActivities] = useState<InsuranceActivityId[]>([])
  const [tripBand, setTripBand] = useState<TripBand>('short')
  const [planId, setPlanId] = useState<InsurancePlanTierId>('standard')
  const [coverId, setCoverId] = useState(INSURANCE_COVERAGE[0].id)

  const factor = TRIP_LENGTH_COST_FACTOR[tripBand]
  const activePlan = INSURANCE_PLANS.find((p) => p.id === planId) ?? INSURANCE_PLANS[1]
  const activeCover =
    INSURANCE_COVERAGE.find((c) => c.id === coverId) ?? INSURANCE_COVERAGE[0]

  const checks = useMemo(
    () => INSURANCE_ACTIVITIES.filter((a) => activities.includes(a.id)),
    [activities],
  )

  const planPrice = scaleRange(activePlan.priceUsd, factor)

  function toggle(id: InsuranceActivityId) {
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const tripLabel =
    tripBand === 'short'
      ? '~1–2 weeks'
      : tripBand === 'medium'
        ? '~3–4 weeks'
        : '~1–2 months'

  return (
    <section className="space-y-6">
      <SectionIntro
        id="logistics-insurance"
        n="05 · Insurance"
        title="Travel Insurance"
        support="See typical costs, what each cover does, and what to verify for your activities — then explore live quotes externally."
      />

      <div className="overflow-hidden rounded-[3px] border border-ink/10">
        <div className="relative h-[120px] sm:h-[140px]">
          <img src={HERO} alt="" className="h-full w-full object-cover object-[center_35%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-ink/15" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper/75">
              Protect the trip, not just the ticket
            </p>
            <p className="mt-1 max-w-[40ch] font-serif text-[1.2rem] leading-snug text-paper sm:text-[1.35rem]">
              Simple tiers, clear costs, and the checks that actually matter in Vietnam.
            </p>
          </div>
        </div>
        <div className="bg-[linear-gradient(180deg,#faf6f0_0%,#f3ebe0_100%)] px-4 py-3.5 sm:px-5">
          <Label>Trip length (for cost sense)</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              [
                { id: 'short' as const, label: '1–2 weeks' },
                { id: 'medium' as const, label: '3–4 weeks' },
                { id: 'long' as const, label: '1–2 months' },
              ] as const
            ).map((t) => (
              <ChipButton
                key={t.id}
                active={tripBand === t.id}
                onClick={() => setTripBand(t.id)}
                className="!px-3 !py-2"
              >
                {t.label}
              </ChipButton>
            ))}
          </div>
          <p className="mt-2 text-[0.74rem] text-muted">
            Prices below are illustrative mid-market ranges for one traveller ({tripLabel}) —
            not a live quote. Age and extras change the number.
          </p>
        </div>
      </div>

      {/* Plan tiers with costs */}
      <div>
        <Label>Typical policy cost</Label>
        <p className="mt-1 max-w-[54ch] text-[0.78rem] text-muted">
          Three simple levels. Tap one to see what it usually includes.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {INSURANCE_PLANS.map((plan) => {
            const on = planId === plan.id
            const [lo, hi] = scaleRange(plan.priceUsd, factor)
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setPlanId(plan.id)}
                className={`rounded-[3px] border px-3.5 py-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                  on
                    ? 'border-terracotta/45 bg-terracotta/[0.07]'
                    : 'border-ink/10 bg-paper hover:border-ink/20'
                }`}
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
                  {plan.tagline}
                </p>
                <p className="mt-1 font-serif text-[1.2rem] text-ink">{plan.label}</p>
                <p className="mt-2 font-serif text-[1.45rem] font-semibold leading-none text-ink">
                  {formatUsdRange(lo, hi)}
                </p>
                <p className="mt-1 text-[0.68rem] text-muted">approx · {tripLabel}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-3 rounded-[3px] border border-ink/10 bg-paper p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-[1.25rem] text-ink">{activePlan.label}</h3>
            <p className="font-semibold text-terracotta">
              {formatUsdRange(planPrice[0], planPrice[1])}
              <span className="ml-1 text-[0.72rem] font-medium text-muted">est.</span>
            </p>
          </div>
          <p className="mt-1 text-[0.84rem] text-ink/80">
            <span className="font-medium text-ink">Best for — </span>
            {activePlan.bestFor}
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {activePlan.includes.map((line) => (
              <li key={line} className="flex gap-2 text-[0.8rem] text-ink/85">
                <span className="text-terracotta">✓</span>
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.78rem] text-muted">{activePlan.note}</p>
        </div>
      </div>

      {/* Coverage with costs */}
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Label>What each cover costs</Label>
          <p className="mt-1 text-[0.78rem] text-muted">
            Tap a line — see what it protects and the usual price cue.
          </p>
          <ul className="mt-3 divide-y divide-ink/8 overflow-hidden rounded-[3px] border border-ink/10 bg-paper">
            {INSURANCE_COVERAGE.map((item) => {
              const on = coverId === item.id
              const imp = IMP[item.importance]
              const cost =
                item.costUsd != null
                  ? formatUsdRange(...scaleRange(item.costUsd, factor))
                  : 'Bundled'
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setCoverId(item.id)}
                    className={`flex w-full items-start justify-between gap-3 px-3.5 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      on ? 'bg-terracotta/[0.06]' : 'hover:bg-ink/[0.02]'
                    }`}
                  >
                    <span>
                      <span className="block text-[0.88rem] font-bold text-ink">
                        {item.label}
                      </span>
                      <span className={`mt-0.5 block text-[0.62rem] font-bold uppercase tracking-wide ${imp.className}`}>
                        {imp.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.88rem] font-semibold tabular-nums text-ink">
                        {cost}
                      </span>
                      <span className="block text-[0.62rem] text-muted">est. share</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <aside className="rounded-[3px] border border-ink/10 bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] p-4 sm:p-5 lg:sticky lg:top-24">
          <Label>Coverage detail</Label>
          <h3 className="mt-2 font-serif text-[1.35rem] text-ink">{activeCover.label}</h3>
          <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-terracotta">
            {IMP[activeCover.importance].label}
          </p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-ink/85">
            {activeCover.description}
          </p>
          <div className="mt-4 border-t border-ink/10 pt-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
              Protects
            </p>
            <p className="mt-1 text-[0.84rem] text-ink">{activeCover.protects}</p>
          </div>
          <div className="mt-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
              Cost cue
            </p>
            <p className="mt-1 text-[0.84rem] text-ink">{activeCover.costLabel}</p>
            {activeCover.costUsd ? (
              <p className="mt-1 font-serif text-[1.2rem] text-ink">
                {formatUsdRange(...scaleRange(activeCover.costUsd, factor))}
                <span className="ml-1 text-[0.72rem] font-sans text-muted">
                  typical share · {tripLabel}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-[0.84rem] text-muted">Usually included with medical cover.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Activities */}
      <div>
        <Label>What are you doing in Vietnam?</Label>
        <p className="mt-1 text-[0.78rem] text-muted">
          Select activities — we’ll show the policy wording to verify, plus a cost cue.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {INSURANCE_ACTIVITIES.map((a) => (
            <ChipButton
              key={a.id}
              active={activities.includes(a.id)}
              onClick={() => toggle(a.id)}
              className="!px-3.5 !py-2.5 !text-[0.78rem]"
            >
              {a.label}
            </ChipButton>
          ))}
        </div>

        {checks.length ? (
          <div className="mt-3 space-y-3">
            {checks.map((c) => (
              <div
                key={c.id}
                className="rounded-[3px] border border-ink/10 bg-paper px-4 py-3.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-serif text-[1.1rem] text-ink">{c.label}</p>
                  <p className="text-[0.74rem] font-medium text-terracotta">{c.costCue}</p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {c.checks.map((line) => (
                    <li key={line} className="flex gap-2 text-[0.8rem] text-ink/85">
                      <span className="font-bold text-terracotta">⚠</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[0.82rem] text-muted">
            No activities selected — add scooter, water sports, hiking and more if they apply.
          </p>
        )}
      </div>

      {/* Watch-outs strip */}
      <div>
        <Label>Common Vietnam watch-outs</Label>
        <div className="mt-2 -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1">
          {INSURANCE_RISKS.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="min-w-[200px] max-w-[240px] shrink-0 rounded-[3px] border border-ink/10 bg-paper px-3 py-3"
            >
              <p className="text-[1.1rem]" aria-hidden>
                {r.symbol}
              </p>
              <p className="mt-1 text-[0.82rem] font-bold text-ink">{r.label}</p>
              <p className="mt-1 text-[0.72rem] leading-snug text-muted">{r.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Explore links */}
      <div className="rounded-[3px] border border-ink/10 bg-paper p-4 sm:p-5">
        <Label>Explore live prices</Label>
        <p className="mt-1 max-w-[54ch] text-[0.78rem] text-muted">
          Our ranges are guidance. Use these external tools to compare real quotes for your
          dates and age. Opens in a new tab.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {INSURANCE_EXPLORE_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-[3px] border border-ink/10 px-3.5 py-3 transition hover:border-terracotta/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-serif text-[1.08rem] text-ink group-hover:text-terracotta">
                    {link.label}
                  </span>
                  <span className="text-[0.68rem] font-bold text-muted">External →</span>
                </span>
                <span className="mt-1 text-[0.76rem] leading-snug text-muted">{link.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.68rem] text-muted">
          Not affiliated · not product advice · always read exclusions before you buy
        </p>
      </div>
    </section>
  )
}
