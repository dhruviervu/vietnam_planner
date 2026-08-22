import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  { theme: 'Culture', seed: 'vietnam-culture-1' },
  { theme: 'Culture', seed: 'vietnam-culture-2' },
  { theme: 'History', seed: 'vietnam-history-1' },
  { theme: 'History', seed: 'vietnam-history-2' },
  { theme: 'Daily Life', seed: 'vietnam-dailylife-1' },
  { theme: 'Daily Life', seed: 'vietnam-dailylife-2' },
  { theme: 'Cuisine', seed: 'vietnam-cuisine-1' },
  { theme: 'Cuisine', seed: 'vietnam-cuisine-2' },
  { theme: 'Culture', seed: 'vietnam-culture-3' },
  { theme: 'Cuisine', seed: 'vietnam-cuisine-3' },
] as const

const SLIDE_MS = 3000

export function ActivitiesSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="relative h-[min(72vh,760px)] min-h-[380px] w-full overflow-hidden" aria-label="Image gallery">
      <Link
        to="/why-vietnam/gallery"
        className="group absolute inset-0 z-[2] block"
        aria-label="Open image gallery"
      >
        <span className="absolute left-[clamp(1.1rem,4vw,2.5rem)] top-5 inline-flex items-center gap-2 rounded-full bg-ink/45 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-paper backdrop-blur-[2px] transition-colors duration-200 group-hover:bg-terracotta">
          Image Gallery
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>

      {SLIDES.map((slide, i) => (
        <div
          key={slide.seed}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <img
            src={`https://picsum.photos/seed/${slide.seed}/1600/1000`}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,22,18,0.25) 0%, rgba(28,22,18,0.05) 45%, rgba(28,22,18,0.45) 100%)',
        }}
      />

      <p className="pointer-events-none absolute bottom-6 left-[clamp(1.1rem,4vw,2.5rem)] z-[2] font-sans text-[0.7rem] font-bold uppercase tracking-[0.2em] text-paper/85">
        {SLIDES[index].theme}
      </p>

      <div className="pointer-events-none absolute bottom-6 right-[clamp(1.1rem,4vw,2.5rem)] z-[2] flex gap-1.5" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.seed}
            className={`h-[2px] rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-terracotta' : 'w-2.5 bg-paper/35'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
