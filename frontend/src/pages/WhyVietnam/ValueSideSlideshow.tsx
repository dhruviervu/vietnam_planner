import { useEffect, useState } from 'react'

export type ShowcaseSlide = {
  name: string
  seed: string
}

const SLIDE_MS = 4500

type Props = {
  slides: readonly ShowcaseSlide[]
  ariaLabel: string
  /** Horizontal strip for small screens */
  variant?: 'portrait' | 'strip'
}

export function ValueSideSlideshow({ slides, ariaLabel, variant = 'portrait' }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || variant === 'strip') return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [paused, slides.length, variant])

  if (variant === 'strip') {
    return (
      <div className="w-full" aria-label={ariaLabel}>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {slides.map((slide) => (
            <figure
              key={slide.seed}
              className="relative aspect-[4/5] w-[42%] min-w-[42%] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card sm:w-[38%] sm:min-w-[38%]"
            >
              <img
                src={`https://picsum.photos/seed/${slide.seed}/720/900`}
                alt={slide.name}
                className="h-full w-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 45%, rgba(28,22,18,0.72) 100%)',
                }}
              />
              <figcaption className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[0.78rem] font-semibold text-paper">
                <LocationPin />
                {slide.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    )
  }

  const slide = slides[index]

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-paper shadow-card"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((item, i) => (
        <div
          key={item.seed}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <img
            src={`https://picsum.photos/seed/${item.seed}/720/900`}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-[4500ms] ease-out"
            style={{ transform: i === index ? 'scale(1.06)' : 'scale(1)' }}
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(180deg, transparent 42%, rgba(28,22,18,0.72) 100%)',
        }}
      />

      <div className="absolute bottom-3.5 left-3.5 z-[2] flex items-center gap-1.5 text-paper">
        <LocationPin />
        <p
          key={slide.name}
          className="font-sans text-[0.82rem] font-semibold tracking-wide animate-[unlock-fade_320ms_ease-out]"
        >
          {slide.name}
        </p>
      </div>

      <div className="absolute bottom-3.5 right-3.5 z-[2] flex gap-1" aria-hidden="true">
        {slides.map((item, i) => (
          <span
            key={item.seed}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? 'w-3.5 bg-paper' : 'w-1 bg-paper/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function LocationPin() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-90"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}
