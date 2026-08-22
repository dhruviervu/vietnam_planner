import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SHOPPING_ITEMS } from '../data/shopping'
import { StageFooter } from '../components/StageFooter'
import { useTripStore } from '../../../store/tripStore'

export function Shopping() {
  const regions = useTripStore((s) => s.getSelectedRegions())
  const selected = useTripStore((s) => s.selectedShoppingIds)
  const toggle = useTripStore((s) => s.toggleShopping)
  const mark = useTripStore((s) => s.markStepVisited)

  useEffect(() => {
    mark('shopping')
  }, [mark])

  const items = useMemo(() => {
    if (regions.length === 0) return SHOPPING_ITEMS
    const prioritized = SHOPPING_ITEMS.filter((s) => regions.includes(s.region))
    const rest = SHOPPING_ITEMS.filter((s) => !regions.includes(s.region))
    return [...prioritized, ...rest]
  }, [regions])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const item of items) {
      const list = map.get(item.region) ?? []
      list.push(item)
      map.set(item.region, list)
    }
    return [...map.entries()]
  }, [items])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
        Stage 5
      </p>
      <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
        Shopping along the way
      </h1>
      <p className="mb-8 max-w-[46ch] text-muted">
        Optional and lightweight — picks tied to the regions already on your trip.
      </p>

      {grouped.map(([region, list]) => (
        <section key={region} className="mb-8">
          <h2 className="mb-3 font-serif text-[1.4rem] font-semibold text-ink">{region}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item, i) => {
              const on = selected.includes(item.id)
              return (
                <article key={item.id} className="overflow-hidden rounded-[22px] bg-paper shadow-soft">
                  <img
                    src={`https://picsum.photos/seed/${item.seed}/640/420`}
                    alt=""
                    className="aspect-[5/3.2] w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                      {item.type}
                    </p>
                    <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{item.name}</h3>
                    <p className="mt-1 text-[0.85rem] text-muted">{item.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[0.72rem] font-semibold">
                      <span className="rounded-full bg-cream px-2 py-0.5">{item.costLabel}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5">{item.popularity}</span>
                      <span className="rounded-full bg-cream px-2 py-0.5">
                        {(0.4 + i * 0.3).toFixed(1)} km from itinerary
                      </span>
                    </div>
                    <p className="mt-2 text-[0.8rem] font-semibold text-ink">🛍 {item.shop}</p>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`mt-3 w-full rounded-full py-2 text-[0.82rem] font-bold ${
                        on ? 'bg-sage text-paper' : 'bg-terracotta text-paper'
                      }`}
                    >
                      {on ? '✓ Added' : 'Add to itinerary'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      <StageFooter current="shopping" />
    </motion.div>
  )
}
