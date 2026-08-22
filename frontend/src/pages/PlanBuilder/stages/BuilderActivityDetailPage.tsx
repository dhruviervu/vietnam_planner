import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from '../../../components/landing/Nav'
import { useTripStore } from '../../../store/tripStore'
import {
  CITY_ACTIVITIES,
  getActivityById,
  getActivityImages,
  type CityActivity,
} from '../data/activities'
import { flyToTripBag } from '../lib/flyToTripBag'

const PREVIEW_WORDS = 100

export function BuilderActivityDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const activity = getActivityById(id)
  const selectedIds = useTripStore((s) => s.selectedActivityIds)
  const addActivity = useTripStore((s) => s.addActivity)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const selected = selectedIds.includes(id)

  const [askConfirm, setAskConfirm] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const related = useMemo(() => {
    if (!activity) return []
    return CITY_ACTIVITIES.filter(
      (a) => a.cityId === activity.cityId && a.id !== activity.id,
    ).slice(0, 4)
  }, [activity])

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
      <>
        <Nav mode="builder" />
        <main className="mx-auto max-w-content px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-semibold text-ink">Activity not found</h1>
          <button type="button" onClick={goBackToCatalog} className="btn-solid mt-6">
            Back to activities
          </button>
        </main>
      </>
    )
  }

  const images = getActivityImages(activity)
  const isFree = activity.priceFromUsd === 0
  const words = activity.about.trim().split(/\s+/)
  const preview = words.slice(0, PREVIEW_WORDS).join(' ')
  const hasMore = words.length > PREVIEW_WORDS
  const visibleStory = storyOpen || !hasMore ? activity.about : `${preview}…`

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    if (selected) {
      removeActivity(activity!.id)
      setAskConfirm(false)
      setJustAdded(false)
      return
    }
    flyToTripBag(e.currentTarget.getBoundingClientRect(), images[0])
    addActivity(activity!.id)
    setJustAdded(true)
    setAskConfirm(true)
    window.setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <>
      <Nav mode="builder" />
      <main className="mx-auto max-w-[1280px] px-[clamp(1.1rem,4vw,2rem)] pb-20 pt-5">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.95fr] lg:items-stretch lg:gap-8">
          <ActivityHero activity={activity} images={images} />

          <div className="flex h-full flex-col">
            <button
              type="button"
              onClick={goBackToCatalog}
              className="mb-3 self-start text-[0.82rem] font-bold text-muted hover:text-ink"
            >
              ← Back to activities
            </button>

            <p className="text-[0.78rem] font-bold tracking-wide text-terracotta">
              {activity.signalEmoji} {activity.signalLabel}
            </p>
            <h1 className="mt-1 font-serif text-[clamp(1.75rem,3.2vw,2.45rem)] font-semibold leading-[1.1] text-ink">
              {activity.name}
            </h1>
            <p className="mt-1 text-[0.88rem] font-bold uppercase tracking-wide text-muted">
              📍 {activity.cityName}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-terracotta/95 px-2.5 py-1 text-[0.68rem] font-bold text-paper">
                {activity.popularityTag}
              </span>
              {activity.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-ink/8 bg-cream px-2.5 py-1 text-[0.68rem] font-bold text-ink"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Fact label="Rating" value={`⭐ ${activity.rating}`} />
              <Fact label="Duration" value={`⏱ ${activity.durationLabel}`} />
              <Fact
                label={isFree ? 'Cost' : 'From'}
                value={isFree ? `🌿 ${activity.priceLabel}` : `💰 ${activity.priceLabel}`}
              />
              <Fact label="Best time" value={`🌅 ${activity.bestTime}`} />
            </div>

            <div className="mt-4 rounded-2xl border border-ink/8 bg-cream/80 px-3.5 py-3">
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">The vibe</p>
              <p className="mt-1 font-serif text-[1.15rem] font-semibold text-ink">{activity.vibe}</p>
              <p className="mt-1.5 text-[0.92rem] leading-relaxed text-muted">{activity.hook}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-ink/8 bg-paper px-3.5 py-3 shadow-soft">
              <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">Hours</p>
              <p className="mt-0.5 text-[0.9rem] font-semibold text-ink">{activity.hours}</p>
              <p className="mt-2 text-[0.82rem] text-muted">
                Best for {activity.bestFor.join(' · ')}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
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
            </div>

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

        <section className="mt-12 max-w-[720px]">
          <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Why people go</h2>
          <p className="mt-2 text-[1.05rem] font-medium leading-snug text-ink">{activity.whyGo}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{activity.cardSummary}</p>
        </section>

        <section className="mt-12 max-w-[720px]">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Activity story
          </p>
          <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">About</h2>
          <p className="mt-1 text-[0.82rem] text-muted">
            A short guide to {activity.name}
          </p>

          <div className="mt-4 rounded-[22px] border border-ink/8 bg-cream/60 px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-4 text-[1.02rem] leading-[1.75] text-ink">
              {visibleStory.split(/\n\n+/).map((para, i) => (
                <p key={i} className="text-pretty">
                  {para.trim()}
                </p>
              ))}
            </div>
            {hasMore ? (
              <button
                type="button"
                onClick={() => setStoryOpen((v) => !v)}
                className="mt-5 rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper hover:bg-ink/90"
              >
                {storyOpen ? 'Show less' : 'Read more'}
              </button>
            ) : null}
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
                    <p className="text-[0.68rem] font-bold text-terracotta">
                      {item.signalEmoji} {item.signalLabel}
                    </p>
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
    </>
  )
}

function ActivityHero({ activity, images }: { activity: CityActivity; images: string[] }) {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => setSlide((s) => (s + 1) % images.length), 4200)
    return () => window.clearInterval(id)
  }, [images.length])

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-cream shadow-hero lg:aspect-auto lg:h-full lg:min-h-[560px]">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${activity.name} ${i + 1}`}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
          style={{
            opacity: i === slide ? 1 : 0,
            transform: i === slide ? 'scale(1.02)' : 'scale(1)',
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/35 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === slide ? 'w-5 bg-paper' : 'w-1.5 bg-paper/50'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ink/45 px-2.5 py-1 text-[0.72rem] font-bold text-paper backdrop-blur-sm">
            {slide + 1}/{images.length}
          </span>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink/40 text-paper backdrop-blur-sm"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setSlide((s) => (s + 1) % images.length)}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink/40 text-paper backdrop-blur-sm"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2.5">
      <p className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.88rem] font-semibold text-ink">{value}</p>
    </div>
  )
}
