import { motion } from 'framer-motion'

const HERO_IMG =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80'

export function ArrivalHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-ink shadow-soft">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-50" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(28,22,18,0.9) 0%, rgba(28,22,18,0.55) 55%, rgba(28,22,18,0.7) 100%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-5 py-6 sm:px-7 sm:py-7 lg:max-w-[64%]"
      >
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Airport logistics
        </p>
        <h1 className="mt-1.5 font-serif text-[clamp(1.75rem,3.8vw,2.55rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-paper">
          Airport Transfers, Made Clear
        </h1>
        <p className="mt-2 max-w-[50ch] text-[0.9rem] leading-relaxed text-paper/85">
          Pick a city with an airport from your trip, then see clear ways in and out — tailored to
          party size, luggage, timing, and whether you already have a stay.
        </p>
      </motion.div>
    </section>
  )
}
