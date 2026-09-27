import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HOW_TO_USE_PROMPT } from '../../ai/howToUse'
import { PIPELINE_START } from '../../pages/PlanBuilder/steps'
import { useTripStore } from '../../store/tripStore'

const VIDEO_SRC = '/videos/why-vietnam-hero.mp4'
const VIDEO_SRC_MOBILE = '/videos/why-vietnam-hero-mobile.mp4'
const POSTER_SRC = '/videos/why-vietnam-hero-poster.jpg'

function pickVideoSrc() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    ? VIDEO_SRC_MOBILE
    : VIDEO_SRC
}
/** Drop the last six seconds of the film on loop. */
const TRIM_END_SECONDS = 6

export function Hero() {
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showVideo, setShowVideo] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [videoSrc] = useState(pickVideoSrc)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyMotion = () => {
      if (media.matches) el.pause()
      else void el.play().catch(() => undefined)
    }

    const loopBeforeTail = () => {
      const end = el.duration
      if (!Number.isFinite(end) || end <= TRIM_END_SECONDS + 0.4) return
      if (el.currentTime >= end - TRIM_END_SECONDS) {
        el.currentTime = 0.05
        void el.play().catch(() => undefined)
      }
    }

    applyMotion()
    el.addEventListener('timeupdate', loopBeforeTail)
    media.addEventListener('change', applyMotion)
    return () => {
      el.removeEventListener('timeupdate', loopBeforeTail)
      media.removeEventListener('change', applyMotion)
    }
  }, [showVideo])

  return (
    <section className="relative min-h-0 w-full flex-1 overflow-hidden bg-ink" aria-label="Hero">
      {!videoReady && (
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden="true"
          fetchPriority="high"
        />
      )}

      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ transform: 'translateZ(0)' }}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          src={videoSrc}
          onLoadedData={() => setVideoReady(true)}
          onError={() => {
            setShowVideo(false)
            setVideoReady(false)
          }}
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,14,11,0.28) 0%, rgba(18,14,11,0.08) 28%, rgba(18,14,11,0.06) 55%, rgba(18,14,11,0.32) 100%)',
        }}
      />

      <div className="relative z-[2] flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[clamp(1.1rem,4vw,2.5rem)] pb-16 pt-4 text-center sm:pb-20">
          <h1
            className="font-serif text-[clamp(2.2rem,6vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-paper"
            style={{
              textShadow:
                '0 1px 1px rgba(0,0,0,0.85), 0 2px 10px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.55)',
            }}
          >
            TripBuilder
          </h1>
          <p
            className="mt-4 mb-9 max-w-[46rem] text-[clamp(0.98rem,1.5vw,1.16rem)] font-medium leading-[1.7] text-paper"
            style={{
              textShadow:
                '0 1px 2px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.75), 0 0 28px rgba(0,0,0,0.45)',
            }}
          >
            A calm place to design a Vietnam trip that actually fits you. Wander the country
            sight by sight, city by city, then collect what you love into a trip bag. We turn
            those choices into a living itinerary you can keep shaping. When you want a second
            mind on timing, routes, or what belongs on a day — Ask AI stays with you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to={PIPELINE_START}
              state={{ itineraryPipeline: true }}
              onClick={() => enterItineraryPipeline()}
              className="btn-build-itinerary btn-build-itinerary-hero group inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[1.02rem] font-bold tracking-wide text-paper shadow-[0_18px_40px_rgba(164,72,46,0.45)] sm:px-10 sm:py-4 sm:text-[1.12rem]"
            >
              <span className="btn-build-itinerary__shine" aria-hidden />
              <span className="relative z-[1]">Build My Itinerary</span>
              <span
                className="relative z-[1] grid h-8 w-8 place-items-center rounded-full bg-paper/15 ring-1 ring-paper/25 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <Link
              to={`/ask?q=${encodeURIComponent(HOW_TO_USE_PROMPT)}`}
              className="group inline-flex items-center gap-2.5 rounded-full border border-paper/45 bg-paper/12 px-7 py-3.5 text-[1.02rem] font-bold tracking-wide text-paper shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-[2px] transition hover:border-paper/70 hover:bg-paper/20 sm:px-8 sm:py-4 sm:text-[1.12rem]"
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-paper shadow-[0_0_16px_rgba(196,92,58,0.55)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                aria-hidden
              >
                <AskSparkleIcon />
              </span>
              Ask AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function AskSparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.2l1.15 5.35L18.4 8.7 13.15 11l-1.15 5.4L10.85 11 5.6 8.7l5.25-1.15L12 2.2z" />
      <path d="M18.6 13.4l.7 2.55 2.55.7-2.55.7-.7 2.55-.7-2.55-2.55-.7 2.55-.7.7-2.55z" opacity="0.9" />
      <path d="M5.4 14.2l.48 1.72 1.72.48-1.72.48L5.4 18.6l-.48-1.72-1.72-.48 1.72-.48.48-1.72z" opacity="0.75" />
    </svg>
  )
}
