import { motion } from 'framer-motion'

const HERO_IMG =
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1600&q=80'

export function ShoppingHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-ink shadow-soft">
      <div className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt=""
          className="h-full w-full object-cover opacity-55"
          loading="eager"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, rgba(28,22,18,0.88) 0%, rgba(28,22,18,0.55) 48%, rgba(28,22,18,0.72) 100%)',
          }}
        />
      </div>

      <div className="relative px-5 py-8 sm:px-7 sm:py-10 lg:px-9 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Shopping discovery
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-paper">
            Take Vietnam Home
          </h1>
          <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-relaxed text-paper/85">
            Two questions, in order: what is actually worth buying, and where you should shop for
            it.
          </p>
          <p className="mt-4 max-w-[42ch] text-[0.82rem] leading-snug text-paper/65">
            Start with the pieces that feel distinctly Vietnamese. Then use the market and mall
            catalog to find the right street, stall or shop.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="#what-to-buy"
              className="rounded-full bg-terracotta px-4 py-2 text-[0.78rem] font-bold text-paper transition hover:-translate-y-0.5"
            >
              What to buy →
            </a>
            <a
              href="#where-to-shop"
              className="rounded-full border border-paper/35 bg-paper/10 px-4 py-2 text-[0.78rem] font-bold text-paper backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-paper/16"
            >
              Where to shop →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
