import { motion } from 'framer-motion'

const HERO =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'

export function LogisticsHero() {
  return (
    <section className="relative overflow-hidden rounded-[4px] bg-ink">
      <div className="absolute inset-0">
        <img src={HERO} alt="" className="h-full w-full object-cover opacity-30" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(28,22,18,0.95) 0%, rgba(28,22,18,0.62) 55%, rgba(28,22,18,0.85) 100%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-5 py-5 sm:px-6 sm:py-6 lg:max-w-[70%]"
      >
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-terracotta">
          Travel intelligence
        </p>
        <h1 className="mt-1.5 font-serif text-[clamp(1.5rem,3vw,2.05rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-paper">
          Vietnam Logistics
        </h1>
        <p className="mt-1.5 max-w-[52ch] text-[0.8rem] leading-snug text-paper/75">
          Check Visa Requirement, Sim Card, Money and the cost of living in Vietnam
        </p>
      </motion.div>
    </section>
  )
}
