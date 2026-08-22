import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SkipToMenu } from '../components/SkipToMenu'
import { stepPath } from '../steps'
import { useTripStore } from '../../../store/tripStore'
import { buildYourVietnam } from '../lib/yourVietnam/buildYourVietnam'
import { exportYourVietnamPdf } from '../lib/yourVietnam/exportPdf'
import {
  activitiesUrl,
  experiencesUrl,
  foodUrl,
  whereToStayUrl,
} from '../lib/yourVietnam/links'
import { TripRouteVietnamMap } from '../components/TripRouteVietnamMap'
import type {
  ItineraryItem,
  PeriodId,
  TripIssue,
  YourVietnamDay,
  YourVietnamTrip,
} from '../lib/yourVietnam/types'

const DAY_SCROLL_OFFSET = 100

export function FinalItinerary() {
  const basics = useTripStore((s) => s.basics)
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)
  const hotelIds = useTripStore((s) => s.selectedHotelIds)
  const chosenStayId = useTripStore((s) => s.chosenStayId)
  const restaurantIds = useTripStore((s) => s.selectedRestaurantIds)
  const shoppingIds = useTripStore((s) => s.selectedShoppingIds)
  const transportChoices = useTripStore((s) => s.transportChoices)
  const experienceMeta = useTripStore((s) => s.experienceMeta)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const toggleRestaurant = useTripStore((s) => s.toggleRestaurant)
  const addExperience = useTripStore((s) => s.addExperience)
  const mark = useTripStore((s) => s.markStepVisited)

  const [dismissedIssueIds, setDismissedIssueIds] = useState<string[]>([])
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([])
  const [activeDay, setActiveDay] = useState(1)
  const [costOpen, setCostOpen] = useState(false)

  useEffect(() => {
    mark('itinerary')
  }, [mark])

  const trip = useMemo(
    () =>
      buildYourVietnam({
        days: basics.days,
        startDate: basics.startDate,
        endDate: basics.endDate,
        travelStyle: basics.travelStyle,
        experienceIds,
        activityIds,
        hotelIds,
        chosenStayId,
        restaurantIds,
        shoppingIds,
        transportChoices,
        experienceMeta,
        dismissedIssueIds,
        removedItemIds,
      }),
    [
      basics,
      experienceIds,
      activityIds,
      hotelIds,
      chosenStayId,
      restaurantIds,
      shoppingIds,
      transportChoices,
      experienceMeta,
      dismissedIssueIds,
      removedItemIds,
    ],
  )

  useEffect(() => {
    const marker = DAY_SCROLL_OFFSET + 48

    function updateActiveDay() {
      let current = trip.days[0]?.day ?? 1
      for (const d of trip.days) {
        const el = document.getElementById(`yv-day-${d.day}`)
        if (!el) continue
        if (el.getBoundingClientRect().top <= marker) current = d.day
      }
      setActiveDay((prev) => (prev === current ? prev : current))
    }

    updateActiveDay()
    window.addEventListener('scroll', updateActiveDay, { passive: true })
    window.addEventListener('resize', updateActiveDay)
    return () => {
      window.removeEventListener('scroll', updateActiveDay)
      window.removeEventListener('resize', updateActiveDay)
    }
  }, [trip.days])

  function scrollToDay(day: number) {
    setActiveDay(day)
    const el = document.getElementById(`yv-day-${day}`)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - DAY_SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - DAY_SCROLL_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function dismissIssue(id: string) {
    setDismissedIssueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  function removeItem(item: ItineraryItem) {
    setRemovedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
    if (item.kind === 'experience' && item.sourceId) removeExperience(item.sourceId)
    if (item.kind === 'activity' && item.sourceId) removeActivity(item.sourceId)
    if (item.kind === 'meal' && item.sourceId) {
      // toggle off if currently selected
      if (restaurantIds.includes(item.sourceId)) toggleRestaurant(item.sourceId)
    }
  }

  const running: { day: number; total: number; sum: number }[] = []
  let run = 0
  for (const d of trip.days) {
    run += d.costs.total
    running.push({ day: d.day, total: d.costs.total, sum: run })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pb-16">
      {/* HERO */}
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
            Stage 8 · Final plan
          </p>
          <h1 className="mt-1 font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
            Your Vietnam
          </h1>
          <p className="mt-2 max-w-[48ch] text-[1.02rem] leading-relaxed text-muted">
            Your selected places, experiences, stays and logistics — arranged into one practical
            trip.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.88rem] font-semibold text-ink">
            <span>{trip.daysCount} days</span>
            <span className="text-ink/25">·</span>
            <span>{trip.cityCount} cities</span>
            <span className="text-ink/25">·</span>
            <span>{trip.travellersLabel}</span>
            {trip.dateRangeLabel && (
              <>
                <span className="text-ink/25">·</span>
                <span className="font-medium text-muted">{trip.dateRangeLabel}</span>
              </>
            )}
          </div>

          {trip.route.length > 0 && (
            <div className="mt-5 flex flex-wrap items-stretch gap-2">
              {trip.route.map((stop, i) => (
                <div key={`${stop.region}-${i}`} className="flex items-center gap-2">
                  <div className="rounded-2xl border border-ink/8 bg-cream/80 px-3.5 py-2.5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                      {stop.city}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-muted">
                      {stop.nights} night{stop.nights === 1 ? '' : 's'} · {stop.experiences} planned
                    </p>
                  </div>
                  {i < trip.route.length - 1 && (
                    <span className="text-terracotta/70" aria-hidden="true">
                      ↓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportYourVietnamPdf(trip)}
              className="rounded-full bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-3 text-[0.92rem] font-bold text-paper shadow-[0_10px_24px_rgba(196,92,58,0.28)] transition hover:scale-[1.01]"
            >
              Download itinerary PDF ↓
            </button>
          </div>
        </div>
      </header>

      {trip.isEmpty ? (
        <EmptySketch />
      ) : (
        <>
          {/* AT A GLANCE */}
          <section id="yv-overview" className="mt-10 scroll-mt-28">
            <h2 className="font-serif text-[1.55rem] font-semibold text-ink">
              Your trip at a glance
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Days" value={String(trip.daysCount)} />
              <Stat label="Cities" value={String(trip.cityCount)} />
              <Stat
                label="Experiences"
                value={String(trip.experienceCount + trip.activityCount)}
              />
              <Stat label="Food stops" value={String(trip.foodCount)} />
              <Stat label="City transfers" value={String(trip.transferCount)} />
              <Stat
                label="Estimated spend"
                value={`$${trip.cost.low}–$${trip.cost.high}`}
              />
            </div>
            <p className="mt-2 text-[0.78rem] text-muted">
              Rough planning estimate — not a booking quote.
            </p>

            <h3 className="mt-8 font-serif text-[1.25rem] font-semibold text-ink">Trip route</h3>
            <RouteStrip trip={trip} />
          </section>

          {/* TRIP CHECK — short, trip-level only */}
          <section id="yv-check" className="mt-10 scroll-mt-28">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-[1.55rem] font-semibold text-ink">Trip check</h2>
                <p className="mt-1 max-w-[52ch] text-[0.88rem] text-muted">
                  Quick flags only — day-by-day detail lives in the schedule below.
                </p>
              </div>
              {trip.issues.length === 0 && !trip.isEmpty && (
                <p className="rounded-full bg-sage/15 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                  Looking good
                </p>
              )}
            </div>

            {trip.isEmpty ? (
              <p className="mt-4 text-[0.95rem] text-muted">
                Add experiences or stays to unlock a smarter check.
              </p>
            ) : trip.issues.length === 0 ? (
              <p className="mt-4 text-[0.95rem] text-ink/80">
                No obvious issues — skim your days below when you&apos;re ready.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {trip.issues.map((iss) => (
                  <TripCheckCard
                    key={iss.id}
                    issue={iss}
                    onDismiss={() => dismissIssue(iss.id)}
                    onAddSuggestion={(id) => addExperience(id)}
                    onJumpDay={scrollToDay}
                  />
                ))}
              </ul>
            )}
          </section>

          <p className="mt-8 text-[0.82rem] font-medium text-muted">
            Approximate timing — planning rhythm, not a fixed timetable.
          </p>

          <div className="mt-6 lg:grid lg:grid-cols-[148px_minmax(0,1fr)_250px] lg:items-start lg:gap-8">
            {/* DAY NAV */}
            <nav
              aria-label="Your trip days"
              className="mb-6 lg:sticky lg:top-24 lg:mb-0 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto"
            >
              <p className="mb-2 hidden text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage lg:block">
                Your trip
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <NavChip
                  active={false}
                  onClick={() => scrollToSection('yv-overview')}
                  label="Overview"
                />
                {trip.days.map((d) => (
                  <NavChip
                    key={d.day}
                    active={activeDay === d.day}
                    onClick={() => scrollToDay(d.day)}
                    label={`Day ${String(d.day).padStart(2, '0')}`}
                    sub={d.city}
                  />
                ))}
                <NavChip
                  active={false}
                  onClick={() => scrollToSection('yv-costs')}
                  label="Costs"
                />
                <NavChip
                  active={false}
                  onClick={() => scrollToSection('yv-check-final')}
                  label="Trip check"
                />
              </div>
            </nav>

            {/* DAYS */}
            <div className="min-w-0 space-y-12">
              {trip.days.map((day, idx) => (
                <DaySection
                  key={day.day}
                  day={day}
                  showTransfer={Boolean(day.cityTransferOut)}
                  isFirst={idx === 0}
                  onRemoveItem={removeItem}
                  onDismissIssue={dismissIssue}
                  onAddSuggestion={(id) => addExperience(id)}
                />
              ))}

              {/* MOVING BETWEEN CITIES */}
              {trip.transferCount > 0 && (
                <section className="border-t border-ink/8 pt-8">
                  <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                    Moving between cities
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {trip.days
                      .filter((d) => d.cityTransferOut)
                      .map((d) => (
                        <li
                          key={`xfer-${d.day}`}
                          className={`flex flex-wrap items-baseline justify-between gap-2 rounded-[14px] border px-4 py-3 ${
                            d.cityTransferOut!.unset
                              ? 'border-[#d4727d]/35 bg-[#f8e8ea]'
                              : 'border-amber-700/20 bg-amber-50/70'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-ink">
                              {d.city} → {d.cityTransferOut!.toCity}
                            </p>
                            <p
                              className={`text-[0.84rem] ${
                                d.cityTransferOut!.unset ? 'text-[#b84a58]' : 'text-muted'
                              }`}
                            >
                              {d.cityTransferOut!.icon} {d.cityTransferOut!.modeLabel} ·{' '}
                              {d.cityTransferOut!.durationLabel}
                            </p>
                          </div>
                          {d.cityTransferOut!.externalUrl && (
                            <Link
                              to={d.cityTransferOut!.externalUrl}
                              className={`text-[0.8rem] font-bold hover:underline ${
                                d.cityTransferOut!.unset ? 'text-[#b84a58]' : 'text-amber-800'
                              }`}
                            >
                              {d.cityTransferOut!.unset
                                ? 'Set transfer ↗'
                                : 'View transport options ↗'}
                            </Link>
                          )}
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              {/* FINAL SUMMARY */}
              <section id="yv-costs" className="scroll-mt-28 border-t border-ink/8 pt-10">
                <h2 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-ink">
                  Your trip, at a glance
                </h2>
                <p className="mt-2 text-[0.95rem] text-muted">
                  {trip.daysCount} days · {trip.cityCount} cities ·{' '}
                  {trip.experienceCount + trip.activityCount} experiences · {trip.foodCount}{' '}
                  restaurants · {trip.stayCount} accommodation stops · {trip.transferCount} major
                  transfers
                </p>
                <div className="mt-6">
                  <CostBreakdown trip={trip} />
                </div>
                {(trip.experienceCount > 0 || trip.activityCount > 0) &&
                  trip.route.length > 0 && (
                    <div className="mt-8">
                      <TripRouteVietnamMap route={trip.route} />
                    </div>
                  )}
              </section>

              <section id="yv-check-final" className="scroll-mt-28 border-t border-ink/8 pt-10">
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Before you go</h2>
                {trip.issues.length === 0 ? (
                  <p className="mt-3 text-[0.92rem] text-muted">No open flags from trip check.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {trip.issues.map((iss) => (
                      <li key={`final-${iss.id}`} className="text-[0.92rem] text-ink">
                        <span className="mr-2" aria-hidden="true">
                          {iss.severity === 'warn' ? '⚠' : '·'}
                        </span>
                        {iss.title}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* RIGHT RAIL */}
            <aside className="mt-10 hidden lg:sticky lg:top-24 lg:mt-0 lg:block">
              <CostRail trip={trip} running={running} onPdf={() => exportYourVietnamPdf(trip)} />
            </aside>
          </div>

          {/* Mobile cost */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 p-3 backdrop-blur-md lg:hidden">
            <button
              type="button"
              onClick={() => setCostOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl bg-cream px-4 py-3 text-left"
            >
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">
                  Your trip cost
                </p>
                <p className="font-serif text-[1.1rem] font-semibold text-ink">
                  ${trip.cost.low}–${trip.cost.high}
                </p>
              </div>
              <span className="text-muted">{costOpen ? '▾' : '▴'}</span>
            </button>
            {costOpen && (
              <div className="max-h-[40vh] overflow-y-auto pt-3">
                <CostRail trip={trip} running={running} onPdf={() => exportYourVietnamPdf(trip)} />
              </div>
            )}
          </div>
        </>
      )}

      {trip.hasNoStays && !trip.isEmpty && (
        <section className="mt-10 rounded-[24px] border border-terracotta/20 bg-terracotta/5 px-5 py-5">
          <h3 className="font-serif text-[1.35rem] font-semibold text-ink">
            Your accommodation is still open
          </h3>
          <p className="mt-1 text-[0.92rem] text-muted">
            Your trip is planned, but you haven&apos;t selected stays yet. We can recommend bases
            from where your activities cluster.
          </p>
          <Link to={whereToStayUrl()} className="btn-solid mt-4 inline-flex">
            Explore stays →
          </Link>
        </section>
      )}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-6">
        <SkipToMenu current="itinerary" />
        <div className="flex flex-wrap gap-3">
          <Link
            to={stepPath('experiences')}
            className="text-[0.88rem] font-semibold text-muted hover:text-ink"
          >
            Add more experiences
          </Link>
          <button
            type="button"
            onClick={() => exportYourVietnamPdf(trip)}
            className="btn-solid"
          >
            Download itinerary PDF ↓
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function EmptySketch() {
  return (
    <section className="mt-10 rounded-[28px] border border-ink/8 bg-paper px-6 py-10 text-center shadow-soft">
      <h2 className="font-serif text-[1.8rem] font-semibold text-ink">
        Your trip is still a sketch
      </h2>
      <p className="mx-auto mt-2 max-w-[42ch] text-muted">
        We&apos;ll build the day-by-day plan as you add experiences, stays and places.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={experiencesUrl()} className="btn-solid">
          Explore experiences
        </Link>
        <Link
          to={whereToStayUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Choose where to stay
        </Link>
        <Link
          to={foodUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Explore food
        </Link>
        <Link
          to={activitiesUrl()}
          className="rounded-full border border-ink/12 bg-paper px-5 py-2.5 text-[0.88rem] font-bold text-ink"
        >
          Hands-on activities
        </Link>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-paper px-3.5 py-3 shadow-soft">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-[1.25rem] font-semibold leading-tight text-ink">{value}</p>
    </div>
  )
}

function RouteStrip({ trip }: { trip: YourVietnamTrip }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {trip.route.map((stop, i) => (
        <div key={`route-${stop.region}-${i}`} className="flex items-center gap-2">
          <div className="rounded-xl border border-ink/8 bg-cream/70 px-3 py-2">
            <p className="text-[0.78rem] font-bold uppercase tracking-wide text-ink">{stop.city}</p>
            <p className="text-[0.72rem] text-muted">
              🏨 {stop.nights} night{stop.nights === 1 ? '' : 's'}
            </p>
          </div>
          {i < trip.route.length - 1 && (
            <span className="text-[0.78rem] font-bold text-terracotta" aria-hidden="true">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function NavChip({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean
  onClick: () => void
  label: string
  sub?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-2 text-left transition-colors lg:w-full lg:rounded-xl ${
        active
          ? 'bg-ink text-paper'
          : 'bg-paper text-muted shadow-soft hover:text-ink lg:bg-transparent lg:shadow-none'
      }`}
    >
      <span className="block text-[0.78rem] font-bold">{label}</span>
      {sub && (
        <span className={`block text-[0.68rem] ${active ? 'text-paper/70' : 'text-muted'}`}>
          {sub}
        </span>
      )}
    </button>
  )
}

function TripCheckCard({
  issue,
  onDismiss,
  onAddSuggestion,
  onJumpDay,
}: {
  issue: TripIssue
  onDismiss: () => void
  onAddSuggestion: (experienceId: string) => void
  onJumpDay: (day: number) => void
}) {
  const warn = issue.severity === 'warn'
  return (
    <li
      className={`overflow-hidden rounded-[18px] border px-4 py-4 sm:px-5 ${
        warn ? 'border-terracotta/25 bg-terracotta/[0.04]' : 'border-sage/30 bg-sage/[0.06]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] font-semibold text-ink">
            <span className={`mr-2 ${warn ? 'text-terracotta' : 'text-sage'}`} aria-hidden="true">
              {warn ? '⚠' : '✦'}
            </span>
            {issue.title}
          </p>
          <p className="mt-1 text-[0.86rem] leading-relaxed text-muted">{issue.detail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {issue.dayNumber != null && (
            <button
              type="button"
              onClick={() => onJumpDay(issue.dayNumber!)}
              className="text-[0.78rem] font-bold text-terracotta hover:underline"
            >
              Day {issue.dayNumber}
            </button>
          )}
          {issue.href && (
            <Link
              to={issue.href}
              className="text-[0.78rem] font-bold text-terracotta hover:underline"
            >
              {issue.actionLabel ?? 'Open'} ↗
            </Link>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="text-[0.78rem] font-bold text-muted hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      </div>

      {issue.suggestions && issue.suggestions.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-ink/8 pt-3">
          {issue.suggestions.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-paper/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[0.88rem] font-semibold text-ink">{s.name}</p>
                <p className="text-[0.72rem] text-muted">
                  <span className="font-bold text-sage">{s.tag}</span>
                  {' · '}
                  {s.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddSuggestion(s.id)}
                className="shrink-0 rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                Add optional
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function DaySection({
  day,
  showTransfer,
  isFirst,
  onRemoveItem,
  onDismissIssue,
  onAddSuggestion,
}: {
  day: YourVietnamDay
  showTransfer: boolean
  isFirst: boolean
  onRemoveItem: (item: ItineraryItem) => void
  onDismissIssue: (id: string) => void
  onAddSuggestion: (experienceId: string) => void
}) {
  return (
    <section id={`yv-day-${day.day}`} className="scroll-mt-28">
      {!isFirst && day.cityTransferOut === undefined && (
        <div className="mb-6 h-px bg-ink/8" aria-hidden="true" />
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Day {String(day.day).padStart(2, '0')} · {day.dateLabel}
          </p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight text-ink">
            {day.theme}
          </h2>
          <p className="mt-1 max-w-[48ch] text-[0.92rem] text-muted">{day.blurb}</p>
          <p className="mt-2 text-[0.78rem] font-semibold text-muted">
            {day.experienceCount} selected · {day.foodCount} food
            {day.hotelName ? ` · ${day.hotelName}` : ''}
            {' · '}est. ${day.costs.total}
          </p>
        </div>
        {day.bannerImage && (
          <img
            src={day.bannerImage}
            alt=""
            loading="lazy"
            className="h-20 w-28 rounded-2xl object-cover shadow-soft sm:h-24 sm:w-36"
          />
        )}
      </div>

      {day.stayGap && (
        <div className="mt-4 rounded-2xl border border-terracotta/25 bg-terracotta/5 px-4 py-3">
          <p className="text-[0.72rem] font-bold uppercase tracking-wide text-terracotta">
            Stay not set
          </p>
          <p className="mt-1 text-[0.88rem] text-ink">
            Your itinerary has activities here but no accommodation selected.
          </p>
          <Link to={whereToStayUrl()} className="mt-2 inline-block text-[0.82rem] font-bold text-terracotta hover:underline">
            Explore stays →
          </Link>
        </div>
      )}

      {day.issues
        .filter((iss) => !(day.stayGap && iss.id.startsWith('stay-gap-')))
        .map((iss) =>
        iss.severity === 'warn' || iss.severity === 'info' ? (
          <div
            key={iss.id}
            className="mt-3 rounded-2xl border border-ink/8 bg-cream/80 px-4 py-3"
          >
            <p className="text-[0.88rem] font-semibold text-ink">
              {iss.severity === 'warn' ? '⚠ ' : ''}
              {iss.title}
            </p>
            <p className="mt-0.5 text-[0.82rem] text-muted">{iss.detail}</p>
            {iss.suggestions && iss.suggestions.length > 0 && (
              <ul className="mt-3 space-y-2">
                {iss.suggestions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-paper px-3 py-2"
                  >
                    <div>
                      <p className="text-[0.84rem] font-semibold text-ink">{s.name}</p>
                      <p className="text-[0.7rem] text-muted">
                        {s.tag} · {s.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddSuggestion(s.id)}
                      className="text-[0.75rem] font-bold text-terracotta hover:underline"
                    >
                      Add optional
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap gap-3">
              {iss.href && (
                <Link to={iss.href} className="text-[0.78rem] font-bold text-terracotta hover:underline">
                  {iss.actionLabel ?? 'Open'} ↗
                </Link>
              )}
              <button
                type="button"
                onClick={() => onDismissIssue(iss.id)}
                className="text-[0.78rem] font-bold text-muted hover:text-ink"
              >
                Keep my plan
              </button>
            </div>
          </div>
        ) : null,
      )}

      <div className="mt-6 space-y-8">
        {day.periods.map((period) => (
          <PeriodBlock
            key={period.id}
            label={period.label}
            windowLabel={period.windowLabel}
            items={period.items}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-ink/8 pt-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">Day cost</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-muted">
          <span>Stay ${day.costs.stay}</span>
          <span>Food ${day.costs.food}</span>
          <span>Transport ${day.costs.transport}</span>
          <span>Experiences ${day.costs.experiences}</span>
          {day.costs.shopping > 0 && <span>Shopping ${day.costs.shopping}</span>}
        </div>
        <p className="mt-2 font-serif text-[1.25rem] font-semibold text-ink">
          ≈ ${day.costs.total}{' '}
          <span className="text-[0.78rem] font-sans font-medium text-muted">Rough estimate</span>
        </p>
      </div>

      {showTransfer && day.cityTransferOut && (
        <div
          className={`mt-10 overflow-hidden rounded-[24px] px-5 py-6 sm:px-7 ${
            day.cityTransferOut.unset
              ? 'border border-[#d4727d]/35 bg-[#f8e8ea]'
              : 'border border-amber-700/25 bg-gradient-to-br from-amber-50 to-cream'
          }`}
        >
          <p
            className={`text-[0.68rem] font-bold uppercase tracking-[0.16em] ${
              day.cityTransferOut.unset ? 'text-[#b84a58]' : 'text-amber-800'
            }`}
          >
            {day.cityTransferOut.unset ? 'City transfer not set' : 'City transfer'}
          </p>
          <h3 className="mt-1 font-serif text-[1.75rem] font-semibold text-ink">
            {day.city} → {day.cityTransferOut.toCity}
          </h3>
          <p className="mt-1 text-[0.9rem] text-muted">
            {day.cityTransferOut.icon} {day.cityTransferOut.modeLabel} ·{' '}
            {day.cityTransferOut.durationLabel}
          </p>
          <p className="mt-2 max-w-[48ch] text-[0.88rem] italic text-ink/80">
            {day.cityTransferOut.reason}
          </p>
          {!day.cityTransferOut.unset && (
            <ol className="mt-4 space-y-1.5 text-[0.84rem] text-ink">
              <li>🏨 Check out</li>
              <li>🧳 Collect luggage</li>
              <li>🚐 Transfer to station / airport</li>
              <li>
                {day.cityTransferOut.icon} {day.cityTransferOut.modeLabel}
              </li>
              <li>🚕 Destination transfer</li>
              <li>🏨 Check in</li>
            </ol>
          )}
          {day.cityTransferOut.externalUrl && (
            <Link
              to={day.cityTransferOut.externalUrl}
              className={`mt-4 inline-block text-[0.84rem] font-bold hover:underline ${
                day.cityTransferOut.unset ? 'text-[#b84a58]' : 'text-amber-800'
              }`}
            >
              {day.cityTransferOut.unset
                ? 'Set this city transfer ↗'
                : 'View transport options ↗'}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

function PeriodBlock({
  label,
  windowLabel,
  items,
  onRemoveItem,
}: {
  label: string
  windowLabel: string
  items: ItineraryItem[]
  onRemoveItem: (item: ItineraryItem) => void
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3 border-b border-ink/8 pb-2">
        <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{label}</h3>
        <span className="text-[0.78rem] text-muted">{windowLabel}</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[0.9rem] text-muted">
          <Link
            to={experiencesUrl()}
            className="font-bold text-terracotta hover:underline"
          >
            See experiences →
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-0">
          {items.map((item) => (
            <li key={item.id}>
              <ItemRow item={item} onRemove={() => onRemoveItem(item)} />
              {item.transferAfter && <TransferConnector transfer={item.transferAfter} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function selectionChip(state: ItineraryItem['selectionState']) {
  if (state === 'selected') return { text: 'YOU SELECTED', className: 'text-terracotta' }
  if (state === 'recommended') return { text: 'RECOMMENDED', className: 'text-sage' }
  if (state === 'optional') return { text: 'OPTIONAL · IF TIME', className: 'text-sage' }
  if (state === 'system') return { text: 'SYSTEM ADDED', className: 'text-muted' }
  return { text: state.toUpperCase(), className: 'text-muted' }
}

function transferAccentClasses(accent?: ItineraryItem['transferAccent']) {
  if (accent === 'arrival') {
    return {
      shell: 'rounded-[16px] border border-sage/40 bg-sage/10 px-3 py-3 sm:px-4',
      chip: 'text-sage',
      chipText: 'ARRIVING · INTO VIETNAM',
      reason: 'text-sage',
      link: 'text-sage hover:underline',
    }
  }
  if (accent === 'departure') {
    return {
      shell: 'rounded-[16px] border border-[#d4727d]/45 bg-[#f8e8ea] px-3 py-3 sm:px-4',
      chip: 'text-[#b84a58]',
      chipText: 'LEAVING · OUT OF VIETNAM',
      reason: 'text-[#b84a58]',
      link: 'text-[#b84a58] hover:underline',
    }
  }
  if (accent === 'city-hop') {
    return {
      shell: 'rounded-[16px] border border-amber-700/25 bg-amber-50/90 px-3 py-3 sm:px-4',
      chip: 'text-amber-800',
      chipText: 'CITY TRANSFER',
      reason: 'text-amber-900/80',
      link: 'text-amber-800 hover:underline',
    }
  }
  return null
}

function ItemRow({ item, onRemove }: { item: ItineraryItem; onRemove: () => void }) {
  const accent = transferAccentClasses(item.transferAccent)
  const chip = selectionChip(item.selectionState)
  const isOptional = item.selectionState === 'optional'
  const chipClass = accent?.chip ?? chip.className
  const chipText = accent?.chipText ?? chip.text

  return (
    <article
      className={`group grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-ink/5 py-4 ${
        isOptional ? 'opacity-90' : ''
      } ${accent ? accent.shell : ''}`}
    >
      <div className="pt-0.5 text-[1.25rem]" aria-hidden="true">
        {item.icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[0.65rem] font-bold uppercase tracking-[0.12em] ${chipClass}`}>
          {chipText}
        </p>
        <h4
          className={`font-serif text-[1.15rem] font-semibold leading-snug text-ink ${
            isOptional ? 'italic' : ''
          }`}
        >
          {item.name}
        </h4>
        <p className="mt-0.5 text-[0.82rem] text-muted">
          {item.timeLabel}
          {item.durationLabel ? ` · ${item.durationLabel}` : ''}
          {item.locationLabel ? ` · ${item.locationLabel}` : ''}
        </p>
        {item.description && (
          <p className="mt-1.5 max-w-[52ch] text-[0.88rem] leading-relaxed text-ink/80">
            {item.description}
          </p>
        )}
        {item.reason && (
          <p className={`mt-1 text-[0.82rem] italic ${accent?.reason ?? 'text-sage'}`}>
            {item.reason}
          </p>
        )}
        <p className="mt-2 text-[0.78rem] text-muted">
          {item.costUsd > 0 ? `💰 ≈ $${item.costUsd}` : '💰 Included / free'}
          {item.costBand ? ` · ${item.costBand}` : ''}
          {item.tags?.length ? ` · ${item.tags.slice(0, 2).join(' · ')}` : ''}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {item.mapsUrl && (
            <a
              href={item.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[0.8rem] font-bold ${accent?.link ?? 'text-terracotta hover:underline'}`}
            >
              {item.externalLabel?.includes('Maps')
                ? item.externalLabel
                : 'Open in Google Maps ↗'}
            </a>
          )}
          {item.externalUrl && item.externalUrl !== item.mapsUrl && (
            <Link
              to={item.externalUrl}
              className={`text-[0.8rem] font-bold ${accent?.link ?? 'text-terracotta hover:underline'}`}
            >
              {item.externalLabel && !item.externalLabel.includes('Maps')
                ? item.externalLabel
                : 'Open ↗'}
            </Link>
          )}
          {(item.kind === 'experience' ||
            item.kind === 'activity' ||
            item.kind === 'meal' ||
            item.kind === 'shopping') && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[0.78rem] font-bold text-muted opacity-70 hover:text-ink hover:opacity-100"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function TransferConnector({
  transfer,
}: {
  transfer: NonNullable<ItineraryItem['transferAfter']>
}) {
  const isHop = transfer.accent === 'city-hop'
  return (
    <div
      className={`ml-2 border-l py-2.5 pl-5 ${
        isHop
          ? 'border-amber-700/35 bg-amber-50/50 rounded-r-[12px]'
          : 'border-sage/35 bg-sage/[0.06] rounded-r-[12px]'
      }`}
    >
      <p
        className={`text-[0.8rem] font-semibold ${
          isHop ? 'text-amber-900' : 'text-sage'
        }`}
      >
        <span aria-hidden="true">{transfer.icon} </span>
        {transfer.mode} · {transfer.durationLabel}
        {transfer.selectionState === 'recommended' && (
          <span
            className={`ml-2 text-[0.65rem] font-bold uppercase tracking-wide ${
              isHop ? 'text-amber-800' : 'text-sage'
            }`}
          >
            {isHop ? 'City hop' : 'Local'}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[0.78rem] text-muted">{transfer.reason}</p>
      {transfer.externalUrl && (
        <Link
          to={transfer.externalUrl}
          className={`mt-1 inline-block text-[0.75rem] font-bold hover:underline ${
            isHop ? 'text-amber-800' : 'text-sage'
          }`}
        >
          View transport options ↗
        </Link>
      )}
    </div>
  )
}

function CostBreakdown({ trip }: { trip: YourVietnamTrip }) {
  const cats = [
    { label: 'Accommodation', value: trip.cost.categories.accommodation },
    { label: 'Food', value: trip.cost.categories.food },
    { label: 'Transport', value: trip.cost.categories.transport },
    { label: 'Experiences', value: trip.cost.categories.experiences },
    { label: 'Shopping', value: trip.cost.categories.shopping },
  ]
  const max = Math.max(1, ...cats.map((c) => c.value))

  return (
    <div className="max-w-lg">
      <ul className="space-y-3">
        {cats.map((c) => (
          <li key={c.label}>
            <div className="flex justify-between text-[0.88rem]">
              <span className="text-muted">{c.label}</span>
              <span className="font-semibold text-ink">${c.value}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
              <div
                className="h-full rounded-full bg-terracotta/80"
                style={{ width: `${(c.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 font-serif text-[1.6rem] font-semibold text-terracotta">
        Rough total ${trip.cost.low}–${trip.cost.high}
      </p>
      <p className="mt-1 text-[0.82rem] text-muted">Planning estimate only.</p>
    </div>
  )
}

function CostRail({
  trip,
  running,
  onPdf,
}: {
  trip: YourVietnamTrip
  running: { day: number; total: number; sum: number }[]
  onPdf: () => void
}) {
  return (
    <div className="rounded-[22px] border border-ink/8 bg-paper/90 p-4 shadow-soft backdrop-blur-sm">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
        Your trip cost
      </p>
      <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-[0.8rem]">
        {running.map((r) => (
          <li key={r.day} className="flex justify-between text-muted">
            <span>Day {r.day}</span>
            <span className="font-semibold text-ink">${r.total}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-ink/8 pt-3">
        <p className="text-[0.78rem] text-muted">
          Running total{' '}
          <span className="font-bold text-ink">${running[running.length - 1]?.sum ?? 0}</span>
        </p>
        <p className="mt-1 font-serif text-[1.35rem] font-semibold text-terracotta">
          ${trip.cost.low}–${trip.cost.high}
        </p>
        <p className="mt-1 text-[0.72rem] text-muted">Rough planning estimate — not a booking quote.</p>
      </div>
      <button type="button" onClick={onPdf} className="btn-solid mt-4 w-full justify-center">
        Download PDF ↓
      </button>
    </div>
  )
}
