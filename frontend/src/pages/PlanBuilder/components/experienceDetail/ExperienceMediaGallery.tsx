import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  photos: string[]
  name: string
}

export function ExperienceMediaGallery({ photos, name }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Photos</h2>
            <p className="mt-1 text-[0.88rem] text-muted">
              {photos.length} real traveler and destination photos
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-cream ring-1 ring-ink/[0.06]"
            >
              <img
                src={src}
                alt={`${name} photo ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {lightbox != null && (
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
                setLightbox((lightbox - 1 + photos.length) % photos.length)
              }}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm sm:left-6"
            >
              ‹
            </button>
            <img
              src={photos[lightbox]}
              alt={`${name} photo ${lightbox + 1}`}
              className="max-h-[85vh] max-w-[min(1100px,92vw)] rounded-2xl object-contain shadow-hero"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox((lightbox + 1) % photos.length)
              }}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/15 text-paper backdrop-blur-sm sm:right-6"
            >
              ›
            </button>
            <p className="absolute bottom-4 rounded-full bg-ink/50 px-3 py-1 text-[0.78rem] font-bold text-paper backdrop-blur-sm">
              {lightbox + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
