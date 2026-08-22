import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Season } from './seasons'

type Props = {
  season: Season
  onKnowMore: () => void
  compact?: boolean
}

export function SeasonCenterCard({ season, onKnowMore, compact = false }: Props) {
  const [imageIndex, setImageIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = season.carouselSeeds.length

  useEffect(() => {
    setImageIndex(0)
  }, [season.id])

  useEffect(() => {
    if (paused || count === 0) return
    const id = window.setInterval(() => {
      setImageIndex((prev) => (prev + 1) % count)
    }, 4000)
    return () => window.clearInterval(id)
  }, [paused, count, season.id])

  function step(delta: number) {
    setImageIndex((prev) => (prev + delta + count) % count)
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[24px] bg-paper shadow-[0_22px_50px_rgba(58,50,44,0.18)] ${
        compact ? '' : 'mx-auto max-w-[320px]'
      }`}
      style={{ border: `1px solid ${season.accent}33` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`relative overflow-hidden ${compact ? 'aspect-[5/3.1]' : 'aspect-[5/3.2]'}`}>
        <AnimatePresence mode="sync">
          {season.carouselSeeds.map((seed, i) => (
            <motion.img
              key={`${season.id}-${seed}`}
              src={`https://picsum.photos/seed/${seed}/800/540`}
              alt=""
              initial={false}
              animate={{ opacity: i === imageIndex ? 1 : 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

        <button
          type="button"
          aria-label="Previous image"
          onClick={() => step(-1)}
          className="absolute left-2 top-1/2 z-[1] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink/35 text-paper backdrop-blur-[2px] transition-colors hover:bg-ink/55"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => step(1)}
          className="absolute right-2 top-1/2 z-[1] grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink/35 text-paper backdrop-blur-[2px] transition-colors hover:bg-ink/55"
        >
          ›
        </button>

        <div className="absolute bottom-2 left-0 right-0 z-[1] flex justify-center gap-1">
          {season.carouselSeeds.map((seed, i) => (
            <button
              key={seed}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setImageIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === imageIndex ? 'w-3.5 bg-paper' : 'w-1 bg-paper/45'
              }`}
            />
          ))}
        </div>
      </div>

      <div className={compact ? 'px-3.5 pb-3.5 pt-3' : 'px-4 pb-4 pt-3.5'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={season.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3
              className={`font-serif font-semibold tracking-[-0.02em] text-ink ${
                compact ? 'text-[1.05rem]' : 'text-[1.2rem]'
              }`}
            >
              {season.title}
            </h3>
            <p className={`font-semibold text-muted ${compact ? 'mt-0.5 text-[0.75rem]' : 'mt-0.5 text-[0.82rem]'}`}>
              <span className="mr-1" aria-hidden="true">
                {season.moodIcon}
              </span>
              {season.mood}
            </p>

            <div className={`grid grid-cols-2 gap-1.5 ${compact ? 'mt-2' : 'mt-2.5'}`}>
              {season.pills.map((pill) => (
                <div
                  key={pill.label}
                  className="rounded-xl px-2 py-1.5"
                  style={{ background: season.accentSoft }}
                >
                  <p className="text-[0.62rem] font-bold leading-tight text-ink">
                    <span className="mr-0.5" aria-hidden="true">
                      {pill.icon}
                    </span>
                    {pill.label}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] font-semibold leading-tight text-muted">
                    {pill.hint}
                  </p>
                </div>
              ))}
            </div>

            <div className={`flex flex-wrap gap-1 ${compact ? 'mt-2' : 'mt-2.5'}`}>
              {season.experiences.slice(0, compact ? 2 : 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ink/8 bg-cream px-2 py-0.5 text-[0.62rem] font-semibold text-ink"
                >
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={onKnowMore}
              className={`inline-flex w-full items-center justify-center rounded-full font-bold text-paper transition-transform duration-200 hover:scale-[1.02] ${
                compact ? 'mt-2.5 px-3 py-2 text-[0.78rem]' : 'mt-3.5 px-4 py-2.5 text-[0.82rem]'
              }`}
              style={{ background: `linear-gradient(135deg, ${season.accent}, ${season.accent}dd)` }}
            >
              Know More
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
