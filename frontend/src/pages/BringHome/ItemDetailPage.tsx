import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getItemById } from './data/items'
import {
  getItemPracticalTags,
  itemUniqueness,
  itemWorthTake,
  worthStars,
} from './data/items'
import { getDestinationsForItem } from './data/destinations'
import { ShopPlaceCard } from './components/ShopPlaceCard'

function shopsHref(itemId: string, fromPipeline: boolean) {
  const query = `?item=${encodeURIComponent(itemId)}#where-to-shop`
  return fromPipeline ? `/plan/builder/shopping${query}` : `/bring-home${query}`
}

export function ShoppingItemDetailPage() {
  const { itemId = '' } = useParams()
  const [params] = useSearchParams()
  const fromPipeline = params.get('from') === 'pipeline'
  const item = getItemById(itemId)
  const [broken, setBroken] = useState<Record<number, boolean>>({})

  const gallery = useMemo(() => {
    if (!item) return []
    return item.images.slice(0, 3).map((src, i) => (broken[i] ? item.images[0] : src))
  }, [item, broken])

  const places = useMemo(() => {
    if (!item) return []
    return getDestinationsForItem(item.id, 'All', 'best-overall', {}).slice(0, 6)
  }, [item])

  const backTo = fromPipeline ? '/plan/builder/shopping' : '/bring-home'

  if (!item) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-[720px] px-5 py-16 text-center">
          <h1 className="font-serif text-2xl text-ink">Item not found</h1>
          <Link to="/bring-home" className="mt-4 inline-block font-bold text-terracotta">
            Back to shopping
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const uniqueness = itemUniqueness(item)
  const worth = itemWorthTake(item)
  const practical = getItemPracticalTags(item)
  const shopLink = shopsHref(item.id, fromPipeline)
  const hero = gallery[0] ?? item.images[0]

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1040px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <Link to={backTo} className="text-[0.75rem] font-bold text-muted hover:text-terracotta">
          ← Shopping
        </Link>

        <header className="relative mt-5 min-h-[340px] overflow-hidden rounded-[28px] bg-ink shadow-soft sm:min-h-[420px]">
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(28,22,18,0.2) 0%, rgba(28,22,18,0.55) 45%, rgba(28,22,18,0.88) 100%)',
            }}
          />
          <div className="relative flex min-h-[340px] flex-col justify-end px-5 py-6 sm:min-h-[420px] sm:px-8 sm:py-8">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
              What to buy · {item.origin}
            </p>
            <h1 className="mt-2 max-w-[18ch] font-serif text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.04] text-paper">
              {item.name}
            </h1>
            <p className="mt-3 max-w-[62ch] text-[0.98rem] leading-relaxed text-paper/85">
              {item.description}
            </p>
            <p className="mt-3 text-[0.78rem] font-semibold text-paper/70">
              {item.typicalCostFrom} · {item.material}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-paper/15 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-paper backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
              <Link
                to={shopLink}
                className="rounded-full bg-terracotta px-4 py-1.5 text-[0.75rem] font-bold text-paper"
              >
                Places to buy this →
              </Link>
            </div>
          </div>
        </header>

        {gallery.length > 1 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            {gallery.slice(1).map((src, i) => (
              <div key={`${src}-${i}`} className="overflow-hidden rounded-[18px]">
                <img
                  src={src}
                  alt={`${item.name} ${i + 2}`}
                  className="aspect-[16/9] w-full object-cover"
                  onError={() => setBroken((prev) => ({ ...prev, [i + 1]: true }))}
                />
              </div>
            ))}
          </div>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-[22px] bg-paper shadow-soft">
          <div className="border-b border-ink/8 px-5 py-4 sm:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage">
              The piece
            </p>
            <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">
              Why travellers buy {item.name}
            </h2>
          </div>
          <div className="space-y-3 px-5 py-5 sm:px-6">
            {item.whyItMatters.map((p) => (
              <p key={p} className="text-[0.95rem] leading-relaxed text-ink/85">
                {p}
              </p>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] bg-cream/70 p-5 ring-1 ring-ink/6 sm:p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
              Unique in Vietnam?
            </p>
            <p className="mt-2 font-serif text-[1.25rem] font-semibold leading-snug text-ink">
              {uniqueness.headline}
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/80">{uniqueness.body}</p>
          </div>
          <div className="rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-terracotta/15 sm:p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
              Worth taking home?
            </p>
            <p className="mt-2 font-serif text-[1.25rem] font-semibold leading-snug text-ink">
              {worth.label}
            </p>
            <p className="mt-1 text-[1.2rem] tracking-tight text-terracotta">
              {worthStars(item.worthBringingHome)}
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/80">{item.worthReason}</p>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-[22px] bg-paper shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="bg-ink p-4 sm:p-5">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-paper/55">
                How it is made
              </p>
              <div className="overflow-hidden rounded-[16px] bg-ink/40 ring-1 ring-paper/10">
                <div className="aspect-video w-full">
                  <iframe
                    title={`${item.name} story`}
                    src={item.youtubeVideoUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-cream/80 px-3 py-2.5 ring-1 ring-ink/6">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Typical cost
                  </p>
                  <p className="mt-1 text-[1.05rem] font-bold text-ink">{item.typicalCostLabel}</p>
                  <p className="mt-0.5 text-[0.72rem] font-semibold text-ink/70">
                    {item.typicalCostFrom}
                  </p>
                </div>
                <div className="rounded-[14px] bg-cream/80 px-3 py-2.5 ring-1 ring-ink/6">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Material
                  </p>
                  <p className="mt-1 text-[0.85rem] font-bold leading-snug text-ink">{item.material}</p>
                </div>
              </div>
              <div>
                <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                  Packing reality
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {practical.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${
                        tag === 'Fragile' ||
                        tag === 'Bulky' ||
                        tag === 'Perishable' ||
                        tag === 'Needs Care'
                          ? 'bg-terracotta/10 text-terracotta'
                          : 'bg-sage/15 text-ink/80'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {item.regionalVariations.length > 0 ? (
          <section className="mt-6">
            <h2 className="font-serif text-[1.35rem] font-semibold text-ink">Regional character</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {item.regionalVariations.map((v) => (
                <div key={v.label} className="rounded-[16px] bg-cream/80 px-3.5 py-3 ring-1 ring-ink/6">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                    {v.region}
                  </p>
                  <p className="mt-1 text-[0.82rem] font-bold text-ink">{v.label}</p>
                  <p className="mt-0.5 text-[0.74rem] leading-snug text-ink/75">{v.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                Where to buy {item.name}
              </h2>
              <p className="mt-1 text-[0.82rem] text-muted">
                Ranked places for this piece — open the full catalog to filter by city.
              </p>
            </div>
            <Link
              to={shopLink}
              className="rounded-full bg-terracotta px-4 py-2 text-[0.78rem] font-bold text-paper"
            >
              All shops & markets →
            </Link>
          </div>
          {places.length === 0 ? (
            <p className="mt-5 text-[0.88rem] text-muted">
              No dedicated shops listed yet. Browse the full catalog by city.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place, i) => (
                <ShopPlaceCard key={place.id} destination={place} rank={i + 1} cityScope="All" />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
