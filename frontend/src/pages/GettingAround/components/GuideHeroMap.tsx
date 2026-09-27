import { useMemo, useState } from 'react'
import type { PlaceId } from '../data/types'
import { MAP_META } from '../maps/mapMeta'
import { mapHubPlaces } from '../data/places'
import { getTopology } from '../data/transportNetwork'
import { DECISION_GUIDE } from '../data/standaloneGuide'
import { SvgTransportMap } from './SvgTransportMap'
import { scrollToAnchor } from './WorldNav'

type Filter = 'all' | 'air' | 'rail' | 'coach'

const FILTERS: { id: Filter; label: string; emoji: string }[] = [
  { id: 'all', label: 'All hubs', emoji: '🇻🇳' },
  { id: 'air', label: 'Air', emoji: '✈️' },
  { id: 'rail', label: 'Train', emoji: '🚆' },
  { id: 'coach', label: 'Bus', emoji: '🚌' },
]

function hubEmoji(filter: Filter, hasAir: boolean, hasRail: boolean, hasCoach: boolean) {
  if (filter === 'air') return '✈️'
  if (filter === 'rail') return '🚆'
  if (filter === 'coach') return '🚌'
  if (hasAir) return '✈️'
  if (hasRail) return '🚆'
  if (hasCoach) return '🚌'
  return '📍'
}

export function GuideHeroMap() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>('hanoi')
  const hubs = mapHubPlaces()

  const locations = useMemo(
    () =>
      hubs.map((p) => {
        const topo = getTopology(p.id)
        const hasAir = Boolean(topo?.hasFlightAccess)
        const hasRail = Boolean(topo?.hasRailAccess)
        const hasCoach = Boolean(topo?.hasRoadAccess)
        const on =
          filter === 'all' ||
          (filter === 'air' && hasAir) ||
          (filter === 'rail' && hasRail) ||
          (filter === 'coach' && hasCoach)
        const bits = [
          hasAir ? 'Airport' : null,
          hasRail ? 'Rail' : null,
          hasCoach ? 'Road / coach' : null,
        ].filter(Boolean)
        return {
          id: p.id,
          label: p.label,
          lat: p.lat,
          lng: p.lng,
          emoji: hubEmoji(filter, hasAir, hasRail, hasCoach),
          highlighted: on && (filter !== 'all' || p.id === selected),
          hint: on ? bits.join(' · ') : 'Not this layer',
          priority: on ? 1 : 5,
        }
      }),
    [hubs, filter, selected],
  )

  const visible = locations.filter((l) => {
    const topo = getTopology(l.id as PlaceId)
    if (filter === 'all') return true
    if (filter === 'air') return Boolean(topo?.hasFlightAccess)
    if (filter === 'rail') return Boolean(topo?.hasRailAccess)
    return Boolean(topo?.hasRoadAccess)
  })

  return (
    <section id="guide-hero" className="scroll-mt-28">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-start">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Country atlas
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[0.98] text-ink">
            Getting around Vietnam
          </h1>
          <p className="mt-4 max-w-[54ch] text-[1.05rem] leading-[1.7] text-ink/78">
            Fly the long spine, sleep on the Reunification Express, take a limousine van into the
            mountains, or a hydrofoil to an island. The map is the country&apos;s actual hubs — not
            a decoration.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] font-bold ${
                  filter === f.id
                    ? 'bg-ink text-paper'
                    : 'bg-paper text-ink ring-1 ring-ink/10'
                }`}
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-[24px] bg-paper shadow-soft ring-1 ring-ink/8">
            <SvgTransportMap
              meta={MAP_META.vietnam}
              locations={visible}
              originId={selected}
              destinationId={null}
              onSelectLocation={setSelected}
              markerVariant="emoji"
              disableZoomPan
              size="large"
              enableBackgroundSnap
              snapMaxKm={80}
              alwaysShowLabels={false}
              statusHint={
                selected
                  ? locations.find((l) => l.id === selected)?.hint ?? null
                  : 'Tap a city'
              }
            />
          </div>
        </div>

        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">
            Quick decision
          </p>
          <h2 className="mt-2 font-serif text-[1.65rem] font-semibold leading-tight text-ink">
            Fastest, cheapest, or the long way round
          </h2>
          <ul className="mt-5 space-y-3">
            {DECISION_GUIDE.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => scrollToAnchor(card.jumpId)}
                  className="w-full rounded-[22px] bg-paper p-5 text-left shadow-soft ring-1 ring-ink/8 transition hover:ring-terracotta/35"
                >
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
                    {card.symbol} {card.label}
                  </p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">{card.body}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
