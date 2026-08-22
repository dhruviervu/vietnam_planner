import { useEffect, useState } from 'react'

type Props = {
  images: string[]
  alt: string
  className?: string
}

export function ItemSlideshow({ images, alt, className = '' }: Props) {
  const slides = images.length ? images : []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slides.join('|')])

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 3800)
    return () => window.clearInterval(id)
  }, [slides.length])

  if (!slides.length) {
    return <div className={`bg-ink/8 ${className}`} aria-hidden />
  }

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {slides.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={i === index ? alt : ''}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-ink/10" />

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            className="absolute left-2 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-sm text-paper opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            className="absolute right-2 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-ink/45 text-sm text-paper opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            ›
          </button>

          <span className="absolute right-2 top-2 rounded-full bg-ink/50 px-2 py-0.5 text-[0.6rem] font-bold tracking-wide text-paper backdrop-blur-sm">
            {index + 1}/{slides.length}
          </span>

          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                }}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-3.5 bg-paper' : 'w-1.5 bg-paper/45 hover:bg-paper/70'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
