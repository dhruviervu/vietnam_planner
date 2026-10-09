import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../../types'
import { ContentImage, GLOBAL_IMAGE_FALLBACK } from '../../../../components/shared/ContentImage'
import { getExperienceDetailPhotos } from '../../lib/experienceMedia'

type Props = {
  experience: Experience
  className?: string
}

export function ExperienceDetailHero({ experience, className }: Props) {
  const images = getExperienceDetailPhotos(experience)
  const [photo, setPhoto] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const visible = images.filter((src) => !broken[src])
  const index = Math.min(photo, Math.max(visible.length - 1, 0))
  const current = visible[index]

  function shift(delta: number) {
    if (visible.length < 2) return
    setPhoto((i) => (i + delta + visible.length) % visible.length)
  }

  return (
    <>
      <div
        className={`relative h-[min(52vw,420px)] overflow-hidden rounded-[22px] bg-cream shadow-hero ${className ?? ''}`}
      >
        {current ? (
          <button type="button" onClick={() => setLightbox(index)} className="absolute inset-0">
            <ContentImage
              src={current}
              fallbacks={visible.filter((src) => src !== current).slice(0, 4)}
              alt={`${experience.name} photo ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setBroken((prev) => ({ ...prev, [current]: true }))}
            />
          </button>
        ) : (
          <ContentImage
            src={GLOBAL_IMAGE_FALLBACK}
            alt={experience.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <p className="pointer-events-none absolute bottom-8 left-3 z-[1] rounded-full bg-ink/45 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-paper/90 backdrop-blur-sm">
          Photos from Google Maps
        </p>
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
                  className={`h-1.5 rounded-full ${i === index ? 'w-4 bg-paper' : 'w-1.5 bg-paper/55'}`}
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
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((lightbox - 1 + visible.length) % visible.length)
              }}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm sm:left-6"
            >
              ‹
            </button>
            <img
              src={visible[lightbox]}
              alt={`${experience.name} photo ${lightbox + 1}`}
              className="max-h-[85vh] max-w-[min(1100px,92vw)] rounded-2xl object-contain shadow-hero"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((lightbox + 1) % visible.length)
              }}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm sm:right-6"
            >
              ›
            </button>
            <p className="absolute bottom-4 rounded-full bg-ink/50 px-3 py-1 text-[0.78rem] font-bold text-paper backdrop-blur-sm">
              {lightbox + 1} / {visible.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
