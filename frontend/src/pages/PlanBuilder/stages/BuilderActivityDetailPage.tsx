import { useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BuilderProgressChrome } from '../components/BuilderProgressChrome'
import { useTripStore } from '../../../store/tripStore'
import {
  CITY_ACTIVITIES,
  getActivityById,
  getActivityImages,
  type CityActivity,
} from '../data/activities'
import { flyToTripBag } from '../lib/flyToTripBag'
import {
  getActivityDetailBlurb,
  getActivityGuideSections,
} from '../lib/activityDetailCopy'
import {
  getActivityBookingOffers,
  isBookableActivity,
} from '../data/activityProviders'
import { SeeProvidersControl } from '../components/SeeProvidersControl'
import { hoursLabelForSource } from '../lib/yourVietnam/openingHours'
import { pinNewSightToItinerary, readItineraryAddTarget } from '../lib/yourVietnam/itineraryAddTarget'

export function BuilderActivityDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const activity = getActivityById(id)
  const selectedIds = useTripStore((s) => s.selectedActivityIds)
  const addActivity = useTripStore((s) => s.addActivity)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const selected = selectedIds.includes(id)

  const [askConfirm, setAskConfirm] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const related = useMemo(() => {
    if (!activity) return []
    return CITY_ACTIVITIES.filter(
      (a) => a.cityId === activity.cityId && a.id !== activity.id,
    ).slice(0, 4)
  }, [activity])

  const blurb = activity ? getActivityDetailBlurb(activity) : ''
  const aboutParagraphs = activity
    ? activity.about
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 3)
    : []
  const guide = activity ? getActivityGuideSections(activity) : []

  function goBackToCatalog() {
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus()
        window.close()
        return
      } catch {
        /* fall through */
      }
    }
    navigate('/plan/builder/activities')
  }

  if (!activity) {
    return (
      <BuilderProgressChrome current="activities" withNav>
        <main className="mx-auto max-w-content px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">Activity not found</h1>
          <button type="button" onClick={goBackToCatalog} className="btn-solid mt-6">
            Back to activities
          </button>
        </main>
      </BuilderProgressChrome>
    )
  }

  const images = getActivityImages(activity)
  const isFree = activity.priceFromUsd === 0
  const bookable = isBookableActivity(activity)
  const providerOffers = bookable ? getActivityBookingOffers(activity) : []

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    const itineraryTarget = readItineraryAddTarget()
    if (selected) {
      if (itineraryTarget) {
        pinNewSightToItinerary(id)
        return
      }
      removeActivity(id)
      setAskConfirm(false)
      setJustAdded(false)
      return
    }
    flyToTripBag(e.currentTarget.getBoundingClientRect(), images[0])
    addActivity(id)
    if (itineraryTarget) pinNewSightToItinerary(id)
    setJustAdded(true)
    setAskConfirm(true)
    window.setTimeout(() => setJustAdded(false), 2000)
  }

  function scrollToGuide() {
    document.getElementById('activity-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <BuilderProgressChrome current="activities" withNav>
      <main className="mx-auto max-w-[1280px] px-[clamp(1.1rem,4vw,2rem)] pb-20 pt-5">
        <section className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-7">
          <div className="h-full min-h-[min(46vw,360px)]">
            <ActivityHero activity={activity} images={images} fill />
          </div>

          <div className="flex h-full flex-col rounded-[22px] border border-ink/[0.07] bg-paper p-5 shadow-soft sm:p-6">
            <button
              type="button"
              onClick={goBackToCatalog}
              className="mb-3 self-start text-[0.82rem] font-bold text-muted hover:text-ink"
            >
              ← Back to activities
            </button>

            <p className="text-[0.78rem] font-bold tracking-wide text-terracotta">
              {activity.kindLabel}
            </p>
            <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.2vw,2.45rem)] font-semibold leading-[1.1] text-ink">
              {activity.name}
            </h1>
            <p className="mt-1 text-[0.88rem] font-bold uppercase tracking-wide text-muted">
              {activity.cityName}
            </p>

            <div className="mt-3">
              <span className="inline-flex rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold text-paper">
                {activity.popularityTag}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Fact label="Rating" value={`⭐ ${activity.rating}`} />
              <Fact label="Duration" value={`⏱ ${activity.durationLabel}`} />
              <Fact
                label={isFree ? 'Cost' : 'From'}
                value={isFree ? activity.priceLabel : `💰 ${activity.priceLabel}`}
              />
            </div>
            <div className="mt-2 rounded-xl bg-cream px-3 py-2.5">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">Hours</p>
              <p className="mt-0.5 text-[0.82rem] font-semibold leading-snug text-ink">
                {hoursLabelForSource('activity', activity.id, activity.hours)}
              </p>
            </div>

            <div className="mt-4 space-y-3 text-[1.05rem] leading-[1.8] text-ink">
              <p>{blurb}</p>
              {aboutParagraphs.slice(1).map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
              <p>
                <button
                  type="button"
                  onClick={scrollToGuide}
                  className="inline p-0 text-[0.95rem] font-bold text-terracotta underline decoration-terracotta/40 underline-offset-2 transition hover:text-terracotta-deep hover:decoration-terracotta"
                >
                  Learn More
                </button>
              </p>
            </div>

            <SeeProvidersControl offers={providerOffers} sightName={activity.name}>
              <button
                type="button"
                onClick={handleAdd}
                className={`rounded-full px-6 py-3 text-[0.92rem] font-bold transition-transform hover:scale-[1.02] ${
                  selected
                    ? 'bg-sage text-paper'
                    : 'bg-gradient-to-br from-terracotta to-terracotta-deep text-paper shadow-[0_10px_24px_rgba(196,92,58,0.28)]'
                }`}
              >
                {justAdded
                  ? 'Added to your trip ✓'
                  : selected
                    ? '✓ Added to Your Trip'
                    : '+ Add to Trip'}
              </button>
            </SeeProvidersControl>

            <AnimatePresence>
              {askConfirm && selected && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-2xl border border-sage/30 bg-sage/10 p-4"
                >
                  <p className="text-[0.92rem] font-semibold leading-snug text-ink">
                    We&apos;ll fit this into your itinerary as an activity — woven beside your
                    experiences when we shape your days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAskConfirm(false)}
                    className="mt-3 text-[0.78rem] font-bold text-terracotta hover:underline"
                  >
                    Perfect — keep planning
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section id="activity-guide" className="mt-12 scroll-mt-24">
          <div className="relative overflow-hidden rounded-[28px] border border-ink/[0.06] bg-gradient-to-br from-paper via-cream to-cream-deep/80 px-5 py-7 shadow-soft sm:px-8 sm:py-8">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 select-none text-[7rem] leading-none text-terracotta/10"
            >
              ✦
            </span>
            <h2 className="font-serif text-[clamp(1.55rem,3.2vw,2.15rem)] font-semibold italic leading-[1.15] text-ink">
              Keep in mind, o&apos; traveller
            </h2>
            <p className="mt-2 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted">
              Where to go, what this is, what to expect, what to bring, and what is good to know
              — written for this activity, not a generic packing list.
            </p>

            <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
              {guide.map((section) => {
                const mark = guideMark(section.title)
                return (
                  <article
                    key={section.title}
                    className={`rounded-[20px] border border-ink/[0.06] bg-paper/90 p-4 shadow-soft sm:p-5 ${
                      section.wide ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[1.35rem] ${mark.wash}`}
                      >
                        {mark.emoji}
                      </span>
                      <h3 className="font-serif text-[1.12rem] font-semibold leading-snug text-ink">
                        {section.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-[1.02rem] leading-[1.75] text-ink/90 text-pretty">
                      {section.body}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
              More in {activity.cityName}
            </h2>
            <p className="mt-1 text-[0.9rem] text-muted">Other hands-on activities nearby.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/plan/builder/activity/${item.id}`}
                  className="overflow-hidden rounded-2xl bg-paper shadow-soft transition-shadow hover:shadow-card"
                >
                  <img
                    src={getActivityImages(item)[0]}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-[0.68rem] font-bold text-terracotta">{item.kindLabel}</p>
                    <p className="font-serif text-[1.05rem] font-semibold text-ink">{item.name}</p>
                    <p className="text-[0.78rem] text-muted">
                      {item.popularityTag} · {item.priceLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </BuilderProgressChrome>
  )
}

function guideMark(title: string) {
  switch (title) {
    case 'Where to do this':
      return { emoji: '📍', wash: 'bg-sage/15' }
    case 'What this is':
      return { emoji: '✨', wash: 'bg-terracotta/12' }
    case 'What to expect':
      return { emoji: '⏳', wash: 'bg-cream-deep' }
    case 'What to bring':
      return { emoji: '🎒', wash: 'bg-terracotta/10' }
    case 'Good to know':
      return { emoji: '💡', wash: 'bg-sage/15' }
    default:
      return { emoji: '✦', wash: 'bg-cream-deep' }
  }
}

function ActivityHero({
  activity,
  images,
  fill = false,
}: {
  activity: CityActivity
  images: string[]
  fill?: boolean
}) {
  const [photo, setPhoto] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const visible = images.filter((src) => !broken[src])
  const index = Math.min(photo, Math.max(visible.length - 1, 0))
  const current = visible[index]
  const frame = fill
    ? 'h-full min-h-[min(46vw,360px)]'
    : 'h-[min(52vw,420px)]'

  if (!current) {
    return (
      <div className={`overflow-hidden rounded-[22px] bg-gradient-to-br from-cream via-terracotta/15 to-sage/25 shadow-hero ${frame}`} />
    )
  }

  function shift(delta: number) {
    if (visible.length < 2) return
    setPhoto((i) => (i + delta + visible.length) % visible.length)
  }

  return (
    <>
      <div className={`group relative overflow-hidden rounded-[22px] bg-cream shadow-hero ${frame}`}>
        <button
          type="button"
          onClick={() => setLightbox(index)}
          className="absolute inset-0"
        >
          <img
            src={current}
            alt={activity.name}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setBroken((prev) => ({ ...prev, [current]: true }))}
          />
        </button>
        {visible.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => shift(-1)}
              className="absolute left-3 top-1/2 z-[1] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-lg text-paper backdrop-blur-sm hover:bg-ink/60"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => shift(1)}
              className="absolute right-3 top-1/2 z-[1] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-lg text-paper backdrop-blur-sm hover:bg-ink/60"
            >
              ›
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1] flex justify-center gap-1.5">
              {visible.map((src, i) => (
                <span
                  key={src}
                  className={`h-1.5 rounded-full ${
                    i === index ? 'w-4 bg-paper' : 'w-1.5 bg-paper/55'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <AnimatePresence>
        {lightbox != null && visible[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-paper/15 text-xl text-paper backdrop-blur-sm"
            >
              ×
            </button>
            {visible.length > 1 ? (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((lightbox - 1 + visible.length) % visible.length)
                }}
                className="absolute left-4 grid h-10 w-10 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm"
              >
                ‹
              </button>
            ) : null}
            <img
              src={visible[lightbox]}
              alt=""
              className="max-h-[86vh] max-w-[min(1100px,92vw)] rounded-[18px] object-contain shadow-hero"
              onClick={(e) => e.stopPropagation()}
            />
            {visible.length > 1 ? (
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((lightbox + 1) % visible.length)
                }}
                className="absolute right-16 grid h-10 w-10 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm"
              >
                ›
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.82rem] font-semibold leading-snug text-ink">{value}</p>
    </div>
  )
}
