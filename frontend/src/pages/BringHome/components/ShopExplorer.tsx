import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ShopCity, ShopFilter, ShopSort, ShoppingItem } from '../data/types'
import {
  citiesForItem,
  crowdDots,
  getDestinationsForItem,
} from '../data/destinations'

type Props = {
  item: ShoppingItem
}

const SORTS: { id: ShopSort; label: string }[] = [
  { id: 'best-overall', label: 'Best Overall' },
  { id: 'best-value', label: 'Best Value' },
  { id: 'highest-rated', label: 'Highest Rated' },
  { id: 'lower-crowds', label: 'Lower Crowds' },
  { id: 'tourist-friendly', label: 'Tourist Friendly' },
  { id: 'best-for-bargaining', label: 'Best for Bargaining' },
]

export function ShopExplorer({ item }: Props) {
  const availableCities = useMemo(() => citiesForItem(item.id), [item.id])
  const [city, setCity] = useState<ShopCity | 'All'>('All')
  const [sort, setSort] = useState<ShopSort>('best-overall')
  const [filters, setFilters] = useState<ShopFilter>({})

  useEffect(() => {
    setCity('All')
    setSort('best-overall')
    setFilters({})
  }, [item.id])

  const activeCity =
    city === 'All' || availableCities.includes(city) ? city : 'All'

  const destinations = useMemo(
    () => getDestinationsForItem(item.id, activeCity, sort, filters),
    [item.id, activeCity, sort, filters],
  )

  return (
    <section id="where-to-shop" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Where Should You Shop for Vietnamese Items?
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.88rem] text-muted">
        Find the markets, shops and districts worth visiting for the things you actually want to
        bring home.
      </p>
      <p className="mt-2 text-[0.68rem] font-semibold text-muted/80">
        Prototype listings — not live shop inventories.
      </p>

      <div className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(10.5rem,0.28fr)_minmax(0,0.72fr)]">
        <aside className="border-b border-ink/8 bg-cream/40 lg:border-b-0 lg:border-r">
          <p className="px-4 pt-4 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            Cities
          </p>
          <div className="flex gap-1.5 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible lg:px-2 lg:pb-4">
            <CityBtn
              label="All cities"
              active={activeCity === 'All'}
              onClick={() => setCity('All')}
            />
            {availableCities.map((c) => (
              <CityBtn
                key={c}
                label={c === 'Ho Chi Minh City' ? 'HCMC' : c}
                active={activeCity === c}
                onClick={() => setCity(c)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
                Where to Buy {item.name}
              </h3>
              <p className="mt-0.5 text-[0.8rem] text-muted">
                {destinations.length} destination{destinations.length === 1 ? '' : 's'}
                {activeCity !== 'All' ? ` in ${activeCity}` : ''} · ranked for this item
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSort(s.id)}
                className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold transition ${
                  sort === s.id
                    ? 'bg-terracotta text-paper'
                    : 'bg-cream text-ink hover:text-terracotta'
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-ink/10 sm:inline-block" />
            <Chip
              label="Open Now"
              active={!!filters.openNow}
              onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
            />
            <Chip
              label="Markets"
              active={filters.type === 'markets'}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  type: f.type === 'markets' ? null : 'markets',
                }))
              }
            />
            <Chip
              label="Specialty Shops"
              active={filters.type === 'specialty'}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  type: f.type === 'specialty' ? null : 'specialty',
                }))
              }
            />
            <Chip
              label="Craft Districts"
              active={filters.type === 'craft'}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  type: f.type === 'craft' ? null : 'craft',
                }))
              }
            />
            <Chip
              label="Malls"
              active={filters.type === 'malls'}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  type: f.type === 'malls' ? null : 'malls',
                }))
              }
            />
          </div>

          {destinations.length === 0 ? (
            <p className="mt-6 text-[0.88rem] text-muted">
              No destinations match these filters for {item.name}. Try clearing a filter or
              choosing another city.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {destinations.map((d, i) => (
                <DestinationCard key={d.id} destination={d} isTop={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CityBtn({
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
      className={`shrink-0 rounded-[12px] px-3 py-2 text-left text-[0.78rem] font-bold transition lg:w-full ${
        active
          ? 'bg-terracotta/15 text-terracotta ring-1 ring-terracotta/25'
          : 'text-ink hover:bg-cream'
      }`}
    >
      {label}
    </button>
  )
}

function Chip({
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
      className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold transition ${
        active ? 'bg-sage/20 text-ink ring-1 ring-sage/40' : 'bg-cream/80 text-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

function DestinationCard({
  destination: d,
  isTop,
}: {
  destination: import('../data/types').ShoppingDestination
  isTop: boolean
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[16px] bg-cream/50 ring-1 ring-ink/6">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={d.images[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
        {isTop ? (
          <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper">
            Our pick
          </span>
        ) : null}
        <span className="absolute bottom-2 left-2 rounded-full bg-ink/55 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm">
          {d.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h4 className="font-serif text-[1.05rem] font-semibold leading-tight text-ink">{d.name}</h4>
        <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-terracotta">
          {d.city === 'Ho Chi Minh City' ? 'HCMC' : d.city} · {d.area}
        </p>

        <p className="mt-2 text-[0.68rem] font-semibold text-ink/80">
          <span className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-muted">
            Best for ·{' '}
          </span>
          {d.bestForLabels.join(' · ')}
        </p>

        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[0.72rem]">
          <Signal
            label={`${d.crowdType} crowd`}
            value={`${crowdDots(d.crowdLevel)} ${d.crowdLabel}`}
          />
          <Signal label="Value" value={d.valueLevel} />
          <Signal label="Bargaining" value={d.bargaining} />
          <Signal label="Tourist friendly" value={d.touristFriendly} />
        </div>

        {d.crowdBusyPeriod ? (
          <p className="mt-1.5 text-[0.65rem] text-muted">
            Typical busy period: {d.crowdBusyPeriod}
          </p>
        ) : null}

        {d.distanceKm != null ? (
          <p className="mt-1.5 text-[0.68rem] font-semibold text-ink/70">
            {d.distanceNote ?? `${d.distanceKm.toFixed(1)} km from planned area`}
          </p>
        ) : d.distanceNote ? (
          <p className="mt-1.5 text-[0.68rem] font-semibold text-ink/70">{d.distanceNote}</p>
        ) : null}

        <div className="mt-2.5">
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
            Why we picked it
          </p>
          <p className="mt-0.5 text-[0.78rem] font-medium leading-snug text-ink/85">
            {d.whyRecommended}
          </p>
          {d.valueNote && isTop ? (
            <p className="mt-1 text-[0.72rem] font-semibold text-terracotta">{d.valueNote}</p>
          ) : null}
        </div>

        <div className="mt-auto flex gap-1.5 pt-3">
          <a
            href={d.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-sage/45 px-2.5 py-1.5 text-center text-[0.72rem] font-bold text-ink transition hover:-translate-y-0.5"
          >
            View on Maps →
          </a>
          <button
            type="button"
            className="flex-1 rounded-full bg-terracotta/90 px-2.5 py-1.5 text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            See More →
          </button>
        </div>
      </div>
    </article>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-paper/80 px-2 py-1.5">
      <p className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-0.5 text-[0.7rem] font-bold leading-snug text-ink">{value}</p>
    </div>
  )
}
