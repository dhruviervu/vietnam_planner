import { motion } from 'framer-motion'
import { MONTHS, type Season } from './seasons'
import { SeasonCenterCard } from './SeasonCenterCard'

type Props = {
  season: Season
  onSelectMonth: (monthIndex: number) => void
  onKnowMore: () => void
}

export function TravelClock({ season, onSelectMonth, onKnowMore }: Props) {
  return (
    <section className="relative mx-auto w-full max-w-[920px] px-2 py-2 sm:px-4 sm:py-4">
      {/* Desktop / tablet circular clock */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[min(92vw,700px)] md:block">
        {/* Rings — centered on the same origin as the card */}
        <motion.div
          className="pointer-events-none absolute inset-[3.5%] rounded-full border border-ink/10 bg-paper/50 backdrop-blur-[1px]"
          animate={{ boxShadow: `0 0 0 1px ${season.accent}22, inset 0 0 50px ${season.accentSoft}` }}
          transition={{ duration: 0.55 }}
        />
        <div
          className="pointer-events-none absolute inset-[10%] rounded-full border"
          style={{ borderColor: `${season.accent}30` }}
        />
        <div
          className="pointer-events-none absolute inset-[17%] rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${season.accentSoft} 0%, transparent 70%)`,
          }}
        />

        {/* True geometric center: left/top 50% + translate(-50%, -50%) */}
        <div
          className="absolute z-20 w-[min(44%,240px)]"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <SeasonCenterCard season={season} onKnowMore={onKnowMore} compact />
        </div>

        {/* Month markers — wrapper holds translate so Framer scale can't offset the ring */}
        {MONTHS.map((month, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
          const radius = 43.5
          const x = 50 + Math.cos(angle) * radius
          const y = 50 + Math.sin(angle) * radius
          const active = season.monthIndexes.includes(i)

          return (
            <div
              key={month}
              className="absolute z-30"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.button
                type="button"
                onClick={() => onSelectMonth(i)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-[0.7rem] font-bold tracking-[0.08em] sm:h-12 sm:w-12 sm:text-[0.76rem] lg:h-14 lg:w-14"
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: active ? season.accent : 'rgba(255,250,242,0.96)',
                  color: active ? '#fffaf2' : '#3a322c',
                  boxShadow: active
                    ? `0 10px 26px ${season.accent}55`
                    : '0 6px 16px rgba(58,50,44,0.1)',
                }}
                whileHover={{
                  scale: active ? 1.14 : 1.1,
                  boxShadow: `0 12px 28px ${season.accent}48`,
                }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                aria-pressed={active}
                aria-label={`Select ${month}`}
              >
                {month}
              </motion.button>
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MONTHS.map((month, i) => {
            const active = season.monthIndexes.includes(i)
            return (
              <button
                key={month}
                type="button"
                onClick={() => onSelectMonth(i)}
                className="shrink-0 rounded-full px-4 py-2.5 text-[0.78rem] font-bold tracking-wide transition-all duration-300"
                style={{
                  background: active ? season.accent : 'rgba(255,250,242,0.95)',
                  color: active ? '#fffaf2' : '#3a322c',
                  boxShadow: active
                    ? `0 8px 22px ${season.accent}44`
                    : '0 4px 14px rgba(58,50,44,0.06)',
                }}
              >
                {month}
              </button>
            )
          })}
        </div>
        <SeasonCenterCard season={season} onKnowMore={onKnowMore} />
      </div>
    </section>
  )
}
