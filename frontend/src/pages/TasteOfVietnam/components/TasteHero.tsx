import { motion } from 'framer-motion'

import { wikiFile } from '../data/foodMedia'

const HERO_IMG = wikiFile('Pho_bo.jpg', 1600)

const CUISINE_VIDEO = 'https://www.youtube.com/embed/obRDCiSwjCs'

export function TasteHero() {
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

      <div className="relative grid gap-6 px-5 py-8 sm:px-7 sm:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Cuisine discovery
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-paper">
            Taste of Vietnam
          </h1>
          <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-relaxed text-paper/85">
            Discover the dishes, flavours and food traditions that make Vietnam worth travelling
            for.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="overflow-hidden rounded-[18px] bg-ink/40 shadow-card ring-1 ring-paper/15"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-paper/70">
              A taste of the cuisine
            </p>
            <p className="text-[0.65rem] font-semibold text-paper/45">Atmospheric intro</p>
          </div>
          <div className="aspect-video w-full">
            <iframe
              title="Vietnamese cuisine introduction"
              src={CUISINE_VIDEO}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
