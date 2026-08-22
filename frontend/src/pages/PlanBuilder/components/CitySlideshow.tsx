import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  images: string[]
  alt: string
  className?: string
  /** Aspect / height classes for the frame */
  frameClassName?: string
  intervalMs?: number
  showDots?: boolean
  showCounter?: boolean
  roundedClassName?: string
}

export function CitySlideshow({
  images,
  alt,
  className = '',
  frameClassName = 'aspect-[16/10]',
  intervalMs = 4200,
  showDots = true,
  showCounter = true,
  roundedClassName = 'rounded-[22px]',
}: Props) {
  const slides = images.length ? images : []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.join('|')])

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slides.length, intervalMs])

  if (!slides.length) {
    return (
      <div
        className={`${roundedClassName} ${frameClassName} bg-ink/8 ${className}`}
        aria-hidden
      />
    )
  }

  return (
    <div
      className={`relative overflow-hidden ${roundedClassName} ${frameClassName} ${className}`}
      role="img"
      aria-label={`${alt} photos`}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={slides[index]}
          src={slides[index]}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.85 }, scale: { duration: 6.5, ease: 'linear' } }}
          loading="lazy"
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-ink/10" />

      {showCounter && slides.length > 1 && (
        <span className="absolute right-3 top-3 rounded-full bg-ink/55 px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-paper backdrop-blur-sm">
          {index + 1} / {slides.length}
        </span>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-4 bg-paper' : 'w-1.5 bg-paper/45 hover:bg-paper/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
