import { useEffect, useState } from 'react'
import type { Experience } from '../../types'
import { getExperienceImages } from '../../lib/pricing'

type Props = {
  experience: Experience
}

export function ExperienceDetailHero({ experience }: Props) {
  const images = getExperienceImages(experience)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => setSlide((s) => (s + 1) % images.length), 4200)
    return () => window.clearInterval(id)
  }, [images.length])

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-cream shadow-hero lg:aspect-auto lg:min-h-[560px] lg:h-full">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${experience.name} ${i + 1}`}
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
