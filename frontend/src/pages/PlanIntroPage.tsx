import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SLIDES = [
  { seed: 'plan-intro-halong', label: 'Ha Long Bay' },
  { seed: 'plan-intro-hoian', label: 'Hoi An lanterns' },
  { seed: 'plan-intro-hagiang', label: 'Ha Giang mountains' },
  { seed: 'plan-intro-streetfood', label: 'Street food' },
  { seed: 'plan-intro-beach', label: 'Coastal Vietnam' },
]

const JOURNEY = ['Places', 'Experiences', 'Stay', 'Food', 'Transport', 'Your Trip']

const AUTO_MS = 4500
const SLIDE_MS = 1800

/**
 * Cinematic bridge between discovery and the itinerary builder.
 * Not part of the builder pipeline / progress bar.
 */
export function PlanIntroPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setTimeout(() => {
      navigate('/plan/builder/basics', { replace: true })
    }, AUTO_MS)
    return () => window.clearTimeout(id)
  }, [navigate])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  function skip() {
    navigate('/plan/builder/basics', { replace: true })
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-ink text-paper">
      {/* Full-bleed slideshow */}
      <div className="absolute inset-0" aria-hidden="true">
        {SLIDES.map((slide, i) => {
          const active = reduceMotion ? i === 0 : i === index
          return (
            <div
              key={slide.seed}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: active ? 1 : 0 }}
            >
              <img
                src={`https://picsum.photos/seed/${slide.seed}/1920/1280`}
                alt=""
                className={`h-full w-full object-cover ${
                  active && !reduceMotion ? 'animate-ken-burns' : ''
                }`}
                style={
                  active && !reduceMotion
                    ? { animationDuration: `${SLIDE_MS + 400}ms` }
                    : undefined
                }
              />
            </div>
          )
        })}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(28,22,18,0.55) 0%, rgba(28,22,18,0.35) 42%, rgba(28,22,18,0.72) 100%)',
          }}
        />
      </div>

      {/* Centered copy */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-paper/75"
        >
          Your Vietnam Trip
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="max-w-[16ch] font-serif text-[clamp(2.1rem,6.2vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-paper [text-shadow:0_2px_28px_rgba(0,0,0,0.35)]"
        >
          You bring the destination.
          <br />
          We&apos;ll build the journey.
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38 }}
          className="mt-5 max-w-[38ch] text-[clamp(0.98rem,1.6vw,1.1rem)] leading-relaxed text-paper/88 [text-shadow:0_1px_16px_rgba(0,0,0,0.3)]"
        >
          You don&apos;t need to have it all figured out. We&apos;ll help you discover what
          fits, then turn it into your trip.
        </motion.p>

        {/* Subtle journey motif — not the real progress bar */}
        <motion.ul
          className="mt-8 flex max-w-[92vw] flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[0.72rem] font-semibold tracking-wide text-paper/55 sm:gap-x-3 sm:text-[0.78rem]"
          aria-hidden="true"
        >
          {JOURNEY.map((item, i) => (
            <li key={item} className="flex items-center gap-2 sm:gap-3">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.12 }}
              >
                {item}
              </motion.span>
              {i < JOURNEY.length - 1 && (
                <motion.span
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  transition={{ duration: 0.35, delay: 0.62 + i * 0.12 }}
                  className="text-paper/40"
                >
                  →
                </motion.span>
              )}
            </li>
          ))}
        </motion.ul>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.15 }}
          className="mt-12 text-[0.82rem] font-medium tracking-wide text-paper/60"
        >
          Your trip is about to take shape
          <AnimatedEllipsis reduceMotion={!!reduceMotion} />
        </motion.p>
      </div>

      <div className="absolute bottom-5 right-5 z-20 sm:bottom-7 sm:right-7">
        <button
          type="button"
          onClick={skip}
          className="text-[0.78rem] font-semibold text-paper/55 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-paper/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper/60"
        >
          Skip intro →
        </button>
      </div>

      {/* Quiet brand anchor — not interactive chrome */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-20 font-serif text-[0.95rem] font-semibold text-paper/70 transition-colors hover:text-paper sm:left-7 sm:top-6"
      >
        Vietnam, Curated
      </Link>
    </main>
  )
}

function AnimatedEllipsis({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return <span>…</span>

  return (
    <span className="inline-flex w-[1.4em] justify-start" aria-hidden="true">
      <AnimatePresence initial={false}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          >
            .
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
