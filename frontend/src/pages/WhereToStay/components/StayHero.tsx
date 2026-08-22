import { motion } from 'framer-motion'

const HERO =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'

export function StayHero() {
  return (
    <section className="relative overflow-hidden rounded-[22px] bg-ink shadow-soft">
      <div className="absolute inset-0">
        <img src={HERO} alt="" className="h-full w-full object-cover opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(28,22,18,0.92) 0%, rgba(28,22,18,0.55) 55%, rgba(28,22,18,0.78) 100%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-5 py-6 sm:px-7 sm:py-7 lg:max-w-[72%]"
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Accommodation planning
        </p>
        <h1 className="mt-1.5 font-serif text-[clamp(1.75rem,3.8vw,2.55rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-paper">
          Where should you stay?
        </h1>
        <p className="mt-2 max-w-[52ch] text-[0.9rem] leading-relaxed text-paper/85">
          City → neighbourhood → stay. Pick a city first — everything below is built around that
          choice.
        </p>
      </motion.div>
    </section>
  )
}
