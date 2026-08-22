import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Season } from './seasons'

type Props = {
  season: Season
}

export function ClockBackdrop({ season }: Props) {
  const [index, setIndex] = useState(0)
  const seeds = season.carouselSeeds

  useEffect(() => {
    setIndex(0)
  }, [season.id])

  useEffect(() => {
    if (seeds.length === 0) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % seeds.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [seeds.length, season.id])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {seeds.map((seed, i) => (
        <motion.img
          key={`${season.id}-${seed}`}
          src={`https://picsum.photos/seed/${seed}-backdrop/1600/1000`}
          alt=""
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}

      {/* Keep headline + clock readable over any photo */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(250,243,232,0.88) 0%,
              rgba(250,243,232,0.72) 18%,
              rgba(250,243,232,0.55) 42%,
              rgba(250,243,232,0.62) 70%,
              rgba(240,228,210,0.92) 100%
            ),
            radial-gradient(ellipse at center, ${season.accentSoft} 0%, transparent 55%)
          `,
        }}
      />
    </div>
  )
}
