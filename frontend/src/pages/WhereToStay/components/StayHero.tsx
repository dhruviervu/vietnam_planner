import { motion } from 'framer-motion'

export function StayHero() {
  return (
    <section className="relative overflow-hidden rounded-[16px] bg-ink">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-4 sm:px-5 sm:py-5"
      >
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Where to stay
        </p>
        <h1 className="mt-1 font-serif text-[clamp(1.45rem,3vw,1.95rem)] font-semibold leading-[1.12] text-paper">
          Neighbourhoods and hotels
        </h1>
        <p className="mt-1 max-w-[62ch] text-[0.84rem] leading-relaxed text-paper/80">
          Check out all major neighbourhoods in each city, then browse hotels and stays. You CAN use
          other booking websites to find hotels you like we just show a shortlist of some popular
          hotels in each neighbourhood.
        </p>
      </motion.div>
    </section>
  )
}
