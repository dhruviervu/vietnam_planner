import { useMemo, useState } from 'react'
import type { PlaceId } from '../data/types'
import { FEATURED_ROUTES } from '../data/standaloneGuide'
import { mapHubPlaces } from '../data/places'
import { resolveIntercityRoute } from '../data/routeIntelligence'

export function PopularRoutes() {
  const [activeId, setActiveId] = useState(FEATURED_ROUTES[0].id)
  const featured = FEATURED_ROUTES.find((r) => r.id === activeId) ?? FEATURED_ROUTES[0]
  const places = mapHubPlaces()
  const [originId, setOriginId] = useState<PlaceId>(featured.originId)
  const [destinationId, setDestinationId] = useState<PlaceId>(featured.destinationId)

  function pickFeatured(id: string) {
    const route = FEATURED_ROUTES.find((r) => r.id === id)
    if (!route) return
    setActiveId(id)
    setOriginId(route.originId)
    setDestinationId(route.destinationId)
  }

  const intel = useMemo(
    () => resolveIntercityRoute(originId, destinationId),
    [originId, destinationId],
  )
  const journeys = (intel?.journeys ?? []).filter(
    (j) => j.status !== 'not-available' && j.status !== 'not-applicable',
  )

  return (
    <section id="guide-routes" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Popular corridors
      </p>
      <h2 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-semibold text-ink">
        Side-by-side, not a slogan
      </h2>
      <p className="mt-2 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink/75">
        Three routes most first trips actually take. Then pick any two hubs for a live comparison —
        train vs bus vs flight where that pair exists.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FEATURED_ROUTES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => pickFeatured(r.id)}
            className={`rounded-full px-4 py-2 text-[0.78rem] font-bold ${
              activeId === r.id ? 'bg-terracotta text-paper' : 'bg-paper text-ink ring-1 ring-ink/10'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      <article className="mt-6 rounded-[28px] bg-paper p-6 shadow-soft ring-1 ring-ink/8 sm:p-8">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          {featured.kicker}
        </p>
        <h3 className="mt-2 font-serif text-[1.7rem] font-semibold text-ink">{featured.title}</h3>
        <p className="mt-3 max-w-[66ch] text-[1.02rem] leading-[1.75] text-ink/80">{featured.lead}</p>
        {featured.warning ? (
          <p className="mt-4 rounded-[16px] bg-terracotta/10 px-4 py-3 text-[0.9rem] leading-relaxed text-ink">
            <span className="font-bold text-terracotta">Season / catch. </span>
            {featured.warning}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {featured.options.map((opt) => (
            <div key={opt.mode} className="rounded-[18px] bg-cream/70 px-4 py-4 ring-1 ring-ink/6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                {opt.pick}
              </p>
              <p className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">{opt.mode}</p>
              <p className="mt-2 text-[0.88rem] text-ink/80">{opt.time}</p>
              <p className="text-[0.88rem] font-semibold text-terracotta">{opt.cost}</p>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/65">{opt.comfort}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="mt-10 rounded-[28px] bg-cream/60 p-6 ring-1 ring-ink/8 sm:p-8">
        <h3 className="font-serif text-[1.45rem] font-semibold text-ink">Route calculator</h3>
        <p className="mt-1 text-[0.92rem] text-muted">
          Origin and destination from the atlas. Results use this site&apos;s corridor intelligence —
          times are typical bands, not a live timetable.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
            Origin
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value as PlaceId)}
              className="mt-1 block w-full rounded-full bg-paper px-4 py-2.5 text-[0.95rem] font-semibold text-ink ring-1 ring-ink/10"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
            Destination
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value as PlaceId)}
              className="mt-1 block w-full rounded-full bg-paper px-4 py-2.5 text-[0.95rem] font-semibold text-ink ring-1 ring-ink/10"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === originId}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {intel ? (
          <div className="mt-6">
            <p className="text-[0.88rem] text-ink/70">
              {intel.originLabel} → {intel.destinationLabel}
              {intel.geographicKm ? ` · ~${Math.round(intel.geographicKm)} km` : ''}
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {journeys.slice(0, 6).map((j) => (
                <li key={j.id} className="rounded-[18px] bg-paper px-4 py-4 ring-1 ring-ink/8">
                  <p className="font-serif text-[1.15rem] font-semibold text-ink">{j.displayTitle}</p>
                  <p className="mt-1 text-[0.88rem] font-semibold text-terracotta">
                    {j.typicalDurationLabel}
                  </p>
                  <p className="text-[0.88rem] font-semibold text-ink">{j.typicalCostLabel}</p>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/70">{j.why}</p>
                </li>
              ))}
            </ul>
            {intel.recommendations.length > 0 ? (
              <p className="mt-4 text-[0.88rem] leading-relaxed text-ink/75">
                {intel.recommendations.map((r) => `${r.label}: ${r.note}`).join(' · ')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-[0.95rem] text-muted">Pick two different places.</p>
        )}
      </div>
    </section>
  )
}
