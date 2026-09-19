import { motion } from 'framer-motion'

const HERO =
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1600&q=80'

export function GettingAroundHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-ink shadow-soft">
      <div className="absolute inset-0">
        <img src={HERO} alt="" className="h-full w-full object-cover opacity-45" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(28,22,18,0.92) 0%, rgba(28,22,18,0.52) 58%, rgba(28,22,18,0.75) 100%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-5 py-7 sm:px-7 sm:py-8 lg:max-w-[70%]"
      >
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          Vietnam transport atlas
        </p>
        <h1 className="mt-1.5 font-serif text-[clamp(1.85rem,4vw,2.7rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-paper">
          Getting Around Vietnam
        </h1>
        <p className="mt-2 max-w-[62ch] text-[0.92rem] leading-relaxed text-paper/85">
          Everything you need to know about transport in Vietnam. See how to travel best between
          cities and inside the city. There are many travel options so you can decide whats best for
          you - don&apos;t worry travel in Vietnam is Easy!
        </p>
      </motion.div>
    </section>
  )
}
