import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PIPELINE_START } from '../../pages/PlanBuilder/steps'
import { useTripStore } from '../../store/tripStore'

const w = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1920`

/** Place-accurate Vietnam landscapes from Wikimedia Commons — not generic stock. */
const SLIDES = [
  { name: 'Ha Long Bay', src: w('Ha_Long_Bay_in_2023.jpg') },
  { name: 'Hoi An', src: w('Hội_An_at_night.jpg') },
  { name: 'Sapa', src: w('Rice_terraces_in_Sa_Pa.jpg') },
  { name: 'Ninh Binh', src: w('Trang_An_Landscape_Complex.jpg') },
  { name: 'Hue', src: w('Imperial_City,_Huế.jpg') },
  { name: 'Ha Giang', src: w('Ma_Pi_Leng_Pass.jpg') },
  { name: 'Mekong Delta', src: w('Cái_Răng_floating_market.jpg') },
] as const

const SLIDE_MS = 4500

export function Hero() {
  const [index, setIndex] = useState(0)
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section
      className="relative min-h-0 w-full flex-1 overflow-hidden"
      aria-label="Hero"
    >
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.name}
            src={slide.src}
            alt=""
            aria-hidden={i !== index}
            fetchPriority={i === 0 ? 'high' : 'low'}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1200ms] ease-in-out"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,22,18,0.45) 0%, rgba(28,22,18,0.15) 28%, rgba(28,22,18,0.12) 52%, rgba(28,22,18,0.45) 78%, rgba(28,22,18,0.72) 100%)',
        }}
      />

      <div className="relative z-[2] flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[clamp(1.1rem,4vw,2.5rem)] pb-16 pt-4 text-center sm:pb-20">
          <h1 className="mb-2 font-serif text-[clamp(1.85rem,5.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-paper [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] sm:mb-3">
            Vietnam, End to End
          </h1>
          <p className="mb-8 max-w-[42ch] text-[clamp(0.88rem,1.4vw,1.05rem)] text-paper/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.35)] sm:mb-9">
            Browse the country like a journal then cart your sights and build your itinerary.
          </p>

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
        </div>

        <div className="pointer-events-none absolute bottom-4 left-[clamp(1.1rem,4vw,2.5rem)] z-[3] sm:bottom-6">
          <div className="mb-2 flex items-center gap-1.5" aria-hidden="true">
            {SLIDES.map((slide, i) => (
              <span
                key={slide.name}
                className={`h-[2px] rounded-full transition-all duration-500 ${
                  i === index ? 'w-7 bg-terracotta' : 'w-3 bg-paper/35'
                }`}
              />
            ))}
          </div>
          <div className="relative h-5 overflow-hidden">
            {SLIDES.map((slide, i) => (
              <p
                key={slide.name}
                className="absolute left-0 top-0 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-paper/85 transition-opacity duration-[1200ms] ease-in-out"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                {slide.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
