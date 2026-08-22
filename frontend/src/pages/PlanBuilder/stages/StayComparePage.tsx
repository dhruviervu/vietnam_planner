import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from '../../../components/landing/Nav'
import { VerticalTripProgress } from '../components/VerticalTripProgress'
import { useTripStore } from '../../../store/tripStore'
import { HOTELS, getHotelById, hotelImages } from '../data/hotels'
import {
  meters,
  scoreHotel,
  suggestedStayNights,
  type ScoredHotel,
} from '../services/stayRecommendationEngine'
import { getBaseById } from '../data/stayBases'
import {
  findSimilarStays,
  meaningfulWinners,
  recommendFromComparison,
} from '../services/stayCompareDecision'
import {
  markStayCompareRestore,
  saveStayCompareViewState,
} from '../lib/stayCompareViewState'
import { startTripCompareSync } from '../lib/tripCompareSync'

type ExpandKey = 'proximity' | 'transport' | 'food' | 'amenities' | null

export function StayComparePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const basics = useTripStore((s) => s.basics)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const stayStyle = useTripStore((s) => s.stayStyle)
  const preferredBaseId = useTripStore((s) => s.preferredBaseId)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const comparisonStayIds = useTripStore((s) => s.comparisonStayIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const toggleHotel = useTripStore((s) => s.toggleHotel)
  const toggleComparisonStay = useTripStore((s) => s.toggleComparisonStay)
  const removeComparisonStay = useTripStore((s) => s.removeComparisonStay)
  const clearComparison = useTripStore((s) => s.clearComparison)
  const setChosenStay = useTripStore((s) => s.setChosenStay)

  const [expanded, setExpanded] = useState<ExpandKey>(null)
  const [showSimilar, setShowSimilar] = useState(false)
  const [bagOpen, setBagOpen] = useState(false)

  useEffect(() => {
    startTripCompareSync()
  }, [])

  // Seed comparison from URL once if store empty
  useEffect(() => {
    const fromQuery = (params.get('ids') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (fromQuery.length >= 2 && comparisonStayIds.length === 0) {
      fromQuery.slice(0, 8).forEach((id) => {
        if (!useTripStore.getState().comparisonStayIds.includes(id)) {
          useTripStore.getState().toggleComparisonStay(id)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const preferredBase = preferredBaseId ? getBaseById(preferredBaseId) ?? null : null
  const stayHint = suggestedStayNights(basics, selectedIds, preferredBase)

  const hotels = useMemo(() => {
    return comparisonStayIds
      .map((id) => {
        const raw = getHotelById(id)
        if (!raw) return null
        return scoreHotel(raw, basics, selectedIds, stayStyle, stayHint.nights)
      })
      .filter(Boolean) as ScoredHotel[]
  }, [comparisonStayIds, basics, selectedIds, stayStyle, stayHint.nights])

  const recommendation = useMemo(() => recommendFromComparison(hotels), [hotels])
  const winners = useMemo(() => meaningfulWinners(hotels), [hotels])

  const bagHotels = useMemo(() => {
    return hotelIds
      .map((id) => getHotelById(id))
      .filter(Boolean)
      .map((h) => scoreHotel(h!, basics, selectedIds, stayStyle, stayHint.nights))
  }, [hotelIds, basics, selectedIds, stayStyle, stayHint.nights])

  const similar = useMemo(() => {
    const pool = HOTELS.map((h) =>
      scoreHotel(h, basics, selectedIds, stayStyle, stayHint.nights),
    )
    return findSimilarStays(hotels, pool, 5)
  }, [hotels, basics, selectedIds, stayStyle, stayHint.nights])

  const priceRange =
    hotels.length > 0
      ? `$${Math.min(...hotels.map((h) => h.pricePerNight))}–$${Math.max(...hotels.map((h) => h.pricePerNight))}`
      : ''

  function compareMore() {
    markStayCompareRestore()
    saveStayCompareViewState({
      compareIds: comparisonStayIds,
      restoreScroll: true,
      scrollY: loadScroll(),
    })
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: 'stay-compare-more' }, '*')
        window.opener.focus()
        window.close()
        return
      } catch {
        /* fall through */
      }
    }
    navigate('/plan/builder/stay')
  }

  function loadScroll() {
    try {
      const raw = sessionStorage.getItem('vietnam-stay-compare-v1')
      if (!raw) return 0
      return (JSON.parse(raw) as { scrollY?: number }).scrollY ?? 0
    } catch {
      return 0
    }
  }

  if (hotels.length < 2) {
    return (
      <>
        <Nav mode="builder" />
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px]">
          <div className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[240px] shrink-0 overflow-y-auto border-r border-ink/8 bg-paper/60 px-4 py-6 lg:block xl:w-[260px]">
            <VerticalTripProgress current="stay" />
          </div>
          <main className="flex-1 px-6 py-16 text-center">
            <h1 className="font-serif text-3xl font-semibold text-ink">Compare Your Stays</h1>
            <p className="mt-2 text-muted">Add at least 2 stays to comparison to see tradeoffs.</p>
            <button type="button" onClick={compareMore} className="btn-solid mt-6">
              Compare more
            </button>
            {comparisonStayIds.length > 0 && (
              <button
                type="button"
                onClick={() => clearComparison()}
                className="mt-4 block w-full text-[0.85rem] font-bold text-terracotta"
              >
                Clear selection
              </button>
            )}
          </main>
        </div>
      </>
    )
  }

  const rec = recommendation?.hotel

  return (
    <>
      <Nav mode="builder" />
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px]">
        <div className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[240px] shrink-0 overflow-y-auto border-r border-ink/8 bg-paper/60 px-4 py-6 backdrop-blur-sm lg:block xl:w-[260px] xl:px-5">
          <VerticalTripProgress current="stay" />
        </div>

        <main className="min-w-0 flex-1 px-[clamp(1rem,3.5vw,1.75rem)] py-5 pb-16 lg:py-7">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                Active comparison · {hotels.length}
              </p>
              <h1 className="mt-1 font-serif text-[clamp(1.7rem,3.2vw,2.35rem)] font-semibold text-ink">
                Compare Your Stays
              </h1>
              <p className="mt-1 max-w-[48ch] text-[0.9rem] text-muted">
                See the tradeoffs at a glance, then choose the stay that fits your trip best.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBagOpen((v) => !v)}
                className="rounded-full border border-ink/10 bg-paper px-3.5 py-2 text-[0.78rem] font-bold text-ink shadow-soft"
              >
                Your Stay Bag · {hotelIds.length}
              </button>
              <button
                type="button"
                onClick={compareMore}
                className="rounded-full bg-ink px-4 py-2 text-[0.78rem] font-bold text-paper"
              >
                Compare more
              </button>
            </div>
          </div>

          {/* Compact Stay Bag */}
          <AnimatePresence>
            {bagOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="rounded-[18px] border border-ink/6 bg-cream/70 p-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                    Saved possibilities — add any to this comparison
                  </p>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {bagHotels.map((h) => {
                      const inCompare = comparisonStayIds.includes(h.id)
                      return (
                        <div
                          key={h.id}
                          className="w-[140px] shrink-0 rounded-2xl bg-paper p-2 shadow-soft"
                        >
                          <img
                            src={hotelImages(h)[0]}
                            alt=""
                            className="aspect-[4/3] w-full rounded-lg object-cover"
                          />
                          <p className="mt-1.5 truncate font-serif text-[0.85rem] font-semibold text-ink">
                            {h.name}
                          </p>
                          <p className="text-[0.7rem] text-muted">${h.pricePerNight}/n</p>
                          <div className="mt-1.5 flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                inCompare
                                  ? removeComparisonStay(h.id)
                                  : toggleComparisonStay(h.id)
                              }
                              className={`rounded-full px-2 py-1 text-[0.68rem] font-bold ${
                                inCompare ? 'bg-ink text-paper' : 'bg-cream text-ink'
                              }`}
                            >
                              {inCompare ? 'In compare' : 'Add to compare'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleHotel(h.id)}
                              className="text-[0.65rem] font-bold text-terracotta"
                            >
                              Remove from bag
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {bagHotels.length === 0 && (
                      <p className="text-[0.82rem] text-muted">Stay Bag is empty.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Our Recommendation */}
          {recommendation && rec && (
            <section className="mt-6 overflow-hidden rounded-[24px] bg-paper shadow-card">
              <div className="grid md:grid-cols-[0.95fr_1.15fr]">
                <div className="relative min-h-[200px]">
                  <img
                    src={hotelImages(rec)[0]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-terracotta px-2.5 py-1 text-[0.68rem] font-bold text-paper">
                    Our recommendation
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
                    Why we recommend it
                  </p>
                  <h2 className="mt-1 font-serif text-[1.55rem] font-semibold text-ink">
                    {rec.name}
                  </h2>
                  <p className="mt-0.5 text-[0.95rem] font-bold text-terracotta">
                    {rec.tripFit}% trip fit
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                    {recommendation.summary}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[0.85rem] text-ink">
                    {recommendation.reasons.map((r) => (
                      <li key={r}>✓ {r}</li>
                    ))}
                  </ul>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Stat label="Nightly" value={`$${rec.pricePerNight}`} />
                    <Stat
                      label="Stay total"
                      value={
                        rec.totalEstimate != null
                          ? `$${rec.totalEstimate}`
                          : '—'
                      }
                      sub={rec.totalEstimate != null ? `${rec.stayNights} nights` : undefined}
                    />
                    <Stat label="Rating" value={`⭐ ${rec.rating}`} />
                    <Stat
                      label="Proximity"
                      value={
                        rec.nearbyCount > 0 ? `${rec.avgDistanceKm} km` : '—'
                      }
                      sub={rec.nearbyCount > 0 ? 'avg to experiences' : undefined}
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChosenStay(rec.id)
                        if (!hotelIds.includes(rec.id)) toggleHotel(rec.id)
                      }}
                      className={`rounded-full px-5 py-2.5 text-[0.86rem] font-bold ${
                        chosenStayId === rec.id
                          ? 'bg-sage text-paper'
                          : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper'
                      }`}
                    >
                      {chosenStayId === rec.id ? '✓ Chosen for your trip' : 'Choose This Stay'}
                    </button>
                    <a href="#tradeoffs" className="rounded-full border border-ink/12 px-4 py-2.5 text-[0.86rem] font-bold text-ink">
                      Keep Comparing
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Matrix */}
          <section id="tradeoffs" className="mt-8">
            <h2 className="font-serif text-[1.35rem] font-semibold text-ink">
              Compare the Tradeoffs
            </h2>
            <p className="mt-1 text-[0.85rem] text-muted">
              Compact view — expand a row when you want more detail.
            </p>

            <div className="mt-4 overflow-hidden rounded-[20px] border border-ink/8 bg-paper shadow-soft">
              <div className="overflow-x-auto">
                <div
                  className="min-w-max"
                  style={{ width: Math.max(560, hotels.length * 160 + 140) }}
                >
                  {/* Sticky header */}
                  <div
                    className="sticky top-0 z-10 grid border-b border-ink/8 bg-cream/95 backdrop-blur-sm"
                    style={{
                      gridTemplateColumns: `140px repeat(${hotels.length}, minmax(148px, 1fr))`,
                    }}
                  >
                    <div className="px-3 py-3 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                      Metric
                    </div>
                    {hotels.map((h) => (
                      <div key={h.id} className="border-l border-ink/6 px-2.5 py-2.5">
                        <div className="flex items-start gap-2">
                          <img
                            src={hotelImages(h)[0]}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[0.78rem] font-bold leading-snug text-ink">
                              {h.name}
                            </p>
                            <div className="mt-0.5 flex flex-wrap gap-0.5">
                              {winners.bestFit === h.id && <WinTag>Best trip fit</WinTag>}
                              {winners.bestValue === h.id && <WinTag>Best value</WinTag>}
                              {winners.closest === h.id && <WinTag>Closest</WinTag>}
                              {winners.highestRated === h.id && <WinTag>Highest rated</WinTag>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeComparisonStay(h.id)}
                            className="ml-auto text-[0.7rem] font-bold text-muted hover:text-ink"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <MatrixRow
                    label="Nightly price"
                    cols={hotels.length}
                    cells={hotels.map((h) => (
                      <Cell key={h.id} primary={`$${h.pricePerNight}`} win={winners.bestValue === h.id} />
                    ))}
                  />
                  <MatrixRow
                    label="Stay total"
                    cols={hotels.length}
                    cells={hotels.map((h) => (
                      <Cell
                        key={h.id}
                        primary={h.totalEstimate != null ? `$${h.totalEstimate}` : '—'}
                        secondary={h.totalEstimate != null ? `${h.stayNights} nights` : 'Set dates'}
                      />
                    ))}
                  />
                  <MatrixRow
                    label="Trip fit"
                    cols={hotels.length}
                    cells={hotels.map((h) => (
                      <Cell key={h.id} primary={`${h.tripFit}%`} win={winners.bestFit === h.id} bar={h.tripFit / 100} />
                    ))}
                  />
                  <ExpandableRow
                    label="Proximity to selected experiences"
                    open={expanded === 'proximity'}
                    onToggle={() => setExpanded(expanded === 'proximity' ? null : 'proximity')}
                    cols={hotels.length}
                    summary={hotels.map((h) => (
                      <Cell
                        key={h.id}
                        primary={h.nearbyCount > 0 ? `${h.avgDistanceKm} km avg` : '—'}
                        secondary={h.nearbyCount > 0 ? `${h.nearbyCount} places` : 'No bag places'}
                        win={winners.closest === h.id}
                      />
                    ))}
                    detail={hotels.map((h) => (
                      <div key={h.id} className="border-l border-ink/6 px-2.5 py-2 text-[0.72rem] text-muted">
                        {h.nearbyExperiences.length === 0 ? (
                          <p>No Trip Bag places in this region.</p>
                        ) : (
                          <ul className="space-y-1">
                            {h.nearbyExperiences.map((e) => (
                              <li key={e.id} className="flex justify-between gap-1">
                                <span className="truncate">{e.name}</span>
                                <span className="shrink-0 font-bold text-ink">~{e.km} km</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  />
                  <MatrixRow
                    label="Guest rating"
                    cols={hotels.length}
                    cells={hotels.map((h) => (
                      <Cell
                        key={h.id}
                        primary={`⭐ ${h.rating}`}
                        secondary={`${(h.reviewCount ?? 0).toLocaleString()} reviews`}
                        win={winners.highestRated === h.id}
                      />
                    ))}
                  />
                  <ExpandableRow
                    label="Transport access"
                    open={expanded === 'transport'}
                    onToggle={() => setExpanded(expanded === 'transport' ? null : 'transport')}
                    cols={hotels.length}
                    summary={hotels.map((h) => (
                      <Cell key={h.id} primary={meters(h.transportScore ?? 3)} />
                    ))}
                    detail={hotels.map((h) => (
                      <div key={h.id} className="border-l border-ink/6 px-2.5 py-2 text-[0.72rem] text-muted">
                        Score {h.transportScore ?? 3}/5 — ease of getting around from this stay.
                      </div>
                    ))}
                  />
                  <ExpandableRow
                    label="Food access"
                    open={expanded === 'food'}
                    onToggle={() => setExpanded(expanded === 'food' ? null : 'food')}
                    cols={hotels.length}
                    summary={hotels.map((h) => (
                      <Cell key={h.id} primary={meters(h.foodAccessScore ?? 3)} />
                    ))}
                    detail={hotels.map((h) => (
                      <div key={h.id} className="border-l border-ink/6 px-2.5 py-2 text-[0.72rem] text-muted">
                        Score {h.foodAccessScore ?? 3}/5 — walkable restaurants and markets.
                      </div>
                    ))}
                  />
                  <MatrixRow
                    label="Stay style"
                    cols={hotels.length}
                    cells={hotels.map((h) => (
                      <Cell
                        key={h.id}
                        primary={(h.styleTags ?? []).map((t) => t[0]!.toUpperCase() + t.slice(1)).join(' · ') || '—'}
                      />
                    ))}
                  />
                  <ExpandableRow
                    label="Amenities & access"
                    open={expanded === 'amenities'}
                    onToggle={() => setExpanded(expanded === 'amenities' ? null : 'amenities')}
                    cols={hotels.length}
                    summary={hotels.map((h) => (
                      <Cell
                        key={h.id}
                        primary={h.accessibility ?? 'Partial'}
                        secondary={(h.amenities ?? []).slice(0, 2).join(' · ')}
                      />
                    ))}
                    detail={hotels.map((h) => (
                      <div key={h.id} className="border-l border-ink/6 px-2.5 py-2 text-[0.72rem] text-muted">
                        <p>Access: {h.accessibility ?? 'Partial'}</p>
                        <p className="mt-1">{(h.amenities ?? []).join(' · ') || '—'}</p>
                      </div>
                    ))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {hotels.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setChosenStay(h.id)
                    if (!hotelIds.includes(h.id)) toggleHotel(h.id)
                  }}
                  className={`rounded-full px-3.5 py-2 text-[0.75rem] font-bold ${
                    chosenStayId === h.id
                      ? 'bg-sage text-paper'
                      : 'border border-ink/10 bg-cream text-ink'
                  }`}
                >
                  {chosenStayId === h.id ? `✓ ${h.name.split(' ')[0]}` : `Choose ${h.name.split(' ')[0]}`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => clearComparison()}
                className="text-[0.75rem] font-bold text-terracotta hover:underline"
              >
                Clear all
              </button>
            </div>
          </section>

          {/* Similar stays */}
          <section className="mt-10">
            <h2 className="font-serif text-[1.35rem] font-semibold text-ink">
              Compare With Similar Stays
            </h2>
            <p className="mt-1 text-[0.88rem] text-muted">
              We found similar options based on location, price, style and trip fit.
            </p>
            <button
              type="button"
              onClick={() => setShowSimilar((v) => !v)}
              className="mt-3 rounded-full bg-ink px-4 py-2.5 text-[0.82rem] font-bold text-paper"
            >
              {showSimilar ? 'Hide similar stays' : 'Show similar stays'}
            </button>

            <AnimatePresence>
              {showSimilar && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4"
                >
                  <p className="mb-3 rounded-2xl bg-cream/80 px-3.5 py-2.5 text-[0.85rem] text-muted">
                    You are comparing {priceRange} stays
                    {hotels[0] ? ` around ${hotels[0].region}` : ''}.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {similar.map(({ hotel: h, reason }) => (
                      <article
                        key={h.id}
                        className="overflow-hidden rounded-[18px] bg-paper shadow-soft"
                      >
                        <img
                          src={hotelImages(h)[0]}
                          alt=""
                          className="aspect-[16/10] w-full object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-serif text-[1.05rem] font-semibold text-ink">
                            {h.name}
                          </h3>
                          <p className="text-[0.72rem] font-bold text-terracotta">
                            ${h.pricePerNight}/n · ⭐ {h.rating} · {h.tripFit}% fit
                          </p>
                          <p className="mt-1.5 text-[0.78rem] text-muted">{reason}</p>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleComparisonStay(h.id)}
                              className="rounded-full bg-ink px-3 py-1.5 text-[0.72rem] font-bold text-paper"
                            >
                              Add to Comparison
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!hotelIds.includes(h.id)) toggleHotel(h.id)
                              }}
                              className="rounded-full border border-ink/10 px-3 py-1.5 text-[0.72rem] font-bold text-ink"
                            >
                              {hotelIds.includes(h.id) ? 'In Stay Bag' : 'Save to Stay Bag'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {similar.length === 0 && (
                    <p className="text-[0.88rem] text-muted">No close alternatives in this area right now.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={compareMore}
              className="rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-2.5 text-[0.88rem] font-bold text-paper"
            >
              Compare more
            </button>
            <p className="text-[0.8rem] text-muted">
              Returns to Where To Stay at your previous scroll position.
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-cream px-2.5 py-2">
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[0.9rem] font-bold text-ink">{value}</p>
      {sub && <p className="text-[0.65rem] text-muted">{sub}</p>}
    </div>
  )
}

function WinTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-sage/15 px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-wide text-sage">
      {children}
    </span>
  )
}

function Cell({
  primary,
  secondary,
  win,
  bar,
}: {
  primary: string
  secondary?: string
  win?: boolean
  bar?: number
}) {
  return (
    <div className="border-l border-ink/6 px-2.5 py-2.5">
      <p className="text-[0.9rem] font-bold text-ink">{primary}</p>
      {secondary && <p className="text-[0.68rem] text-muted">{secondary}</p>}
      {bar != null && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-terracotta"
            style={{ width: `${Math.max(8, Math.min(100, Math.round(bar * 100)))}%` }}
          />
        </div>
      )}
      {win && (
        <span className="mt-1 inline-block text-[0.58rem] font-bold uppercase tracking-wide text-sage">
          Edge
        </span>
      )}
    </div>
  )
}

function MatrixRow({
  label,
  cols,
  cells,
}: {
  label: string
  cols: number
  cells: ReactNode
}) {
  return (
    <div
      className="grid border-b border-ink/6"
      style={{ gridTemplateColumns: `140px repeat(${cols}, minmax(148px, 1fr))` }}
    >
      <div className="px-3 py-2.5 text-[0.72rem] font-bold text-ink">{label}</div>
      {cells}
    </div>
  )
}

function ExpandableRow({
  label,
  open,
  onToggle,
  cols,
  summary,
  detail,
}: {
  label: string
  open: boolean
  onToggle: () => void
  cols: number
  summary: ReactNode
  detail: ReactNode
}) {
  return (
    <div className="border-b border-ink/6">
      <div
        className="grid"
        style={{ gridTemplateColumns: `140px repeat(${cols}, minmax(148px, 1fr))` }}
      >
        <button
          type="button"
          onClick={onToggle}
          className="px-3 py-2.5 text-left text-[0.72rem] font-bold text-terracotta hover:underline"
        >
          {label} {open ? '▴' : '▾'}
        </button>
        {summary}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-cream/40"
          >
            <div
              className="grid"
              style={{ gridTemplateColumns: `140px repeat(${cols}, minmax(148px, 1fr))` }}
            >
              <div className="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wide text-muted">
                Detail
              </div>
              {detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
