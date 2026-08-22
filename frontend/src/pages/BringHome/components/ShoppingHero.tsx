import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const HERO_SLIDES = [
  {
    label: 'Markets',
    src: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Coffee',
    src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Silk',
    src: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Ceramics',
    src: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Crafts',
    src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Lanterns',
    src: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80',
  },
]

export function ShoppingHero() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-ink shadow-soft">
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms] ${
              i === index ? 'opacity-55' : 'opacity-0'
            }`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, rgba(28,22,18,0.9) 0%, rgba(28,22,18,0.55) 50%, rgba(28,22,18,0.78) 100%)',
          }}
        />
      </div>

      <div className="relative px-5 py-10 sm:px-7 sm:py-12 lg:max-w-[58%]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Shopping discovery
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-paper">
            Take Vietnam Home
          </h1>
          <p className="mt-3 max-w-[42ch] text-[0.95rem] leading-relaxed text-paper/85">
            Discover the things worth bringing back — from Vietnamese coffee and silk to crafts,
            spices and local specialties.
          </p>
          <p className="mt-4 max-w-[40ch] text-[0.8rem] leading-snug text-paper/60">
            Understand what is distinctly Vietnamese. Then find where it is worth buying.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
