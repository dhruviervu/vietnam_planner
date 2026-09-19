import { startTransition, useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { IDEA_CITIES, IDEA_DAY_OPTIONS, IDEA_TEMPLATES, isSlowIdea } from './data/ideasCatalog'
import { PackedFilterBar } from './components/PackedFilterBar'
import { PackedCard } from './components/PackedCard'

export function PackedItinerariesPage() {
  const [days, setDays] = useState<number | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [pace, setPace] = useState<'packed' | 'slow' | null>(null)

  const filtered = useMemo(() => {
    return IDEA_TEMPLATES.filter((t) => {
      if (days != null && t.days !== days) return false
      if (city === '__vietnam__') return t.kind === 'country'
      if (city && !t.cities.includes(city)) return false
      if (pace === 'slow' && !isSlowIdea(t)) return false
      if (pace === 'packed' && isSlowIdea(t)) return false
      return true
    })
  }, [city, days, pace])

  const slowPlans = filtered.filter(isSlowIdea)
  const country = filtered.filter((t) => t.kind === 'country' && !isSlowIdea(t))
  const cityPlans = filtered.filter((t) => t.kind === 'city' && !isSlowIdea(t))
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const template of IDEA_TEMPLATES) {
      const seen = new Set<string>()
      for (const name of template.cities) {
        if (seen.has(name)) continue
        seen.add(name)
        counts[name] = (counts[name] ?? 0) + 1
      }
    }
    return counts
  }, [])
  const clearFilters = () => {
    startTransition(() => {
      setDays(null)
      setCity(null)
      setPace(null)
    })
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <header className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero">
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 20% 0%, #c45c3a 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #7a8f72 0%, transparent 45%)',
            }}
          />
          <div className="relative px-5 py-7 sm:px-8 sm:py-8">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
              Ready-made plans
            </p>
            <h1 className="mt-1 font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
              Itinerary ideas for Vietnam
            </h1>
            <p className="mt-2 max-w-[54ch] text-[1.02rem] leading-relaxed text-muted">
              Packed days that fill before they open the next city — and slow itineraries with at least
              three sights a day, first stop at 10:00, and two to four hours between them.
            </p>
          </div>
        </header>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
          <PackedFilterBar
            days={days}
            city={city}
            pace={pace}
            dayOptions={IDEA_DAY_OPTIONS}
            cities={IDEA_CITIES}
            cityCounts={cityCounts}
            resultCount={filtered.length}
            onDays={(next) => startTransition(() => setDays(next))}
            onCity={(next) => startTransition(() => setCity(next))}
            onPace={(next) => startTransition(() => setPace(next))}
            onClear={clearFilters}
          />
          <div className="mt-4 min-w-0 space-y-10 lg:mt-0">
            {slowPlans.length ? (
              <section className="rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-ink/[0.06] sm:px-6 sm:py-6">
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Slow itineraries</h2>
                <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">
                  One or two sights a day, two to four hours between them, and water-first outings —
                  bay cruises, boats, beaches — that reward going slowly.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {slowPlans.map((template) => (
                    <PackedCard key={template.id} template={template} />
                  ))}
                </div>
              </section>
            ) : null}

            {country.length ? (
              <section className="rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-ink/[0.06] sm:px-6 sm:py-6">
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                  Complete Vietnam
                </h2>
                <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">
                  Multi-city spines — north, central, classic, nature, and the three-week grand tour.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {country.map((template) => (
                    <PackedCard key={template.id} template={template} />
                  ))}
                </div>
              </section>
            ) : null}

            {cityPlans.length ? (
              <section className="rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-ink/[0.06] sm:px-6 sm:py-6">
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">By city</h2>
                <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">
                  1–5 day packed stays. Open a card to see the same itinerary board you already use.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {cityPlans.map((template) => (
                    <PackedCard key={template.id} template={template} />
                  ))}
                </div>
              </section>
            ) : null}

            {!filtered.length ? (
              <p className="rounded-[20px] bg-paper px-5 py-8 text-center text-muted shadow-soft">
                No itineraries match those filters.
              </p>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
