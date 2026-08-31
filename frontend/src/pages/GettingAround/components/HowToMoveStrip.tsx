import { useMemo } from 'react'
import { getPlace } from '../data/places'
import type { PlaceId } from '../data/types'
import { resolveIntercityRoute } from '../data/routeIntelligence'
import { getTopology } from '../data/transportNetwork'
import { cityEmoji } from '../data/cityEmojis'
import { HowToMoveLegCard } from './HowToMoveLegCard'

type Props = {
  bagPlaceIds: Set<PlaceId>
}

function startRecommendation(ids: PlaceId[]): { id: PlaceId; why: string } | null {
  const places = ids
    .map((id) => getPlace(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getPlace>>[]
  if (places.length < 2) return null

  const set = new Set(ids)
  if (set.has('hanoi') && set.has('hcmc')) {
    return {
      id: 'hanoi',
      why: 'Classic north-to-south flow: start in Hanoi (international airport + rail) and work toward Ho Chi Minh City.',
    }
  }

  const withOwnAirport = places.filter((p) => getTopology(p.id).hasFlightAccess)
  const ranked = [...(withOwnAirport.length ? withOwnAirport : places)].sort(
    (a, b) => b.lat - a.lat,
  )
  const pick = ranked[0]
  if (!pick) return null
  const airportNote = getTopology(pick.id).hasFlightAccess
    ? 'it has commercial flight access'
    : 'it is the northernmost stop in your bag'
  return {
    id: pick.id,
    why: `Suggested start: ${pick.label}, because ${airportNote}. You can ignore this and begin anywhere.`,
  }
}

export function HowToMoveStrip({ bagPlaceIds }: Props) {
  const idKey = [...bagPlaceIds].sort().join(',')
  const ids = useMemo(() => [...bagPlaceIds].sort(), [idKey])
  const start = useMemo(() => startRecommendation(ids), [ids])

  const legs = useMemo(() => {
    if (ids.length < 2) return []
    const ordered = ids
      .map((id) => getPlace(id))
      .filter(Boolean)
      .sort((a, b) => b!.lat - a!.lat) as NonNullable<ReturnType<typeof getPlace>>[]

    const out: {
      from: string
      to: string
      fromId: PlaceId
      toId: PlaceId
      title: string
      note: string
      symbol: string
    }[] = []

    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i]
      const b = ordered[i + 1]
      const intel = resolveIntercityRoute(a.id, b.id)
      const rec = intel?.recommendations[0]
      const journey = rec
        ? intel?.journeys.find((j) => j.id === rec.journeyId)
        : intel?.journeys.find(
            (j) =>
              j.status === 'direct' || j.status === 'one-connection' || j.status === 'multi-leg',
          )
      out.push({
        from: a.label,
        to: b.label,
        fromId: a.id,
        toId: b.id,
        title: rec?.journeyTitle ?? journey?.displayTitle ?? 'Ground or air',
        note:
          rec?.note ??
          journey?.typicalDurationLabel ??
          'Check the map for a detailed pair.',
        symbol: rec?.symbol ?? journey?.mode.symbol ?? '➡️',
      })
    }
    return out
  }, [ids])

  if (ids.length === 0) {
    return (
      <div className="mb-5 overflow-hidden rounded-[18px] bg-gradient-to-br from-cream/90 via-paper to-sage/10 ring-1 ring-ink/8">
        <div className="border-b border-ink/6 px-5 py-4">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">
            How to move
          </p>
          <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
            Add places to your trip bag to see a route sketch
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="max-w-[62ch] text-[0.84rem] leading-relaxed text-muted">
            When experiences, activities, or stays land in more than one city, this strip will
            suggest a starting point and how to connect them. The map still shows all of Vietnam —
            nothing is highlighted yet.
          </p>
        </div>
      </div>
    )
  }

  if (ids.length === 1) {
    const only = getPlace(ids[0])
    return (
      <div className="mb-5 overflow-hidden rounded-[18px] bg-gradient-to-br from-cream/90 via-paper to-sage/10 ring-1 ring-ink/8">
        <div className="border-b border-ink/6 px-5 py-4">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted">
            How to move
          </p>
          <h3 className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
            {cityEmoji(ids[0])} {only?.label ?? 'One city'} is in your bag
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="max-w-[62ch] text-[0.84rem] leading-relaxed text-muted">
            Inter-city recommendations appear when a second city joins the bag. For getting around
            inside {only?.label}, use Urban &amp; short distance below. The map shows every city;
            only this one is highlighted.
          </p>
        </div>
      </div>
    )
  }

  const startPlace = start ? getPlace(start.id) : null

  return (
    <div className="mb-5 overflow-hidden rounded-[20px] bg-paper ring-1 ring-terracotta/25">
      <div className="border-b border-terracotta/15 bg-gradient-to-r from-cream/80 via-paper to-sage/10 px-5 py-4">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-terracotta">
          How to move
        </p>
        <h3 className="mt-1 font-serif text-[clamp(1.15rem,2.4vw,1.35rem)] font-semibold text-ink">
          A suggested way to connect your bag
        </h3>
        {startPlace && start ? (
          <blockquote className="mt-3 border-l-2 border-terracotta/50 pl-4">
            <p className="font-serif text-[0.95rem] leading-relaxed text-ink/90">
              <span className="font-semibold text-ink">
                Best starting point (optional): {startPlace.label}.
              </span>{' '}
              {start.why} North-to-south is the usual Vietnam sequence; reverse it if you land in
              the south.
            </p>
          </blockquote>
        ) : null}
      </div>

      <ol className="space-y-3 px-4 py-4 sm:px-5">
        {legs.map((leg, i) => (
          <HowToMoveLegCard key={`${leg.fromId}-${leg.toId}`} step={i + 1} {...leg} />
        ))}
      </ol>

      <p className="border-t border-ink/6 px-5 py-3 text-[0.74rem] leading-relaxed text-muted">
        Recommendations only — click any two cities on the map if you prefer a different pair.
      </p>
    </div>
  )
}
