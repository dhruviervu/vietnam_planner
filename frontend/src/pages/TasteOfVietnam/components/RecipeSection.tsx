import { AnimatePresence, motion } from 'framer-motion'
import type { Dish } from '../data/types'

type Props = {
  dish: Dish
}

export function RecipeSection({ dish }: Props) {
  return (
    <section id="how-vietnam-makes-it" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        How Vietnam Makes It
      </h2>
      <p className="mt-1 max-w-[46ch] text-[0.88rem] text-muted">
        Understand the ingredients, flavour and tradition — not a cooking lesson.
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft"
        >
          <div className="border-b border-ink/8 px-5 py-4 sm:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage">
              Selected dish
            </p>
            <h3 className="mt-1 font-serif text-[clamp(1.45rem,3vw,1.9rem)] font-semibold text-ink">
              {dish.name}
            </h3>
            <p className="mt-0.5 text-[0.78rem] font-semibold text-muted">{dish.region}</p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="bg-ink/5 p-4 sm:p-5">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
                See how it&apos;s made
              </p>
              <div className="overflow-hidden rounded-[16px] bg-ink shadow-card">
                <div className="aspect-video w-full">
                  <iframe
                    title={`${dish.name} — see how it's made`}
                    src={dish.recipeVideoUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div>
                <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                  Proteins
                </h4>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {dish.proteins.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-terracotta/10 px-2.5 py-1 text-[0.75rem] font-bold text-terracotta"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                  What&apos;s in it
                </h4>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {dish.ingredients.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-cream px-2.5 py-1 text-[0.75rem] font-semibold text-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                  What makes it Vietnamese
                </h4>
                <div className="mt-2 space-y-2.5">
                  {dish.culturalDescription.map((para) => (
                    <p key={para} className="text-[0.88rem] font-medium leading-relaxed text-ink/85">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {dish.regionalVariations.length > 0 ? (
                <div>
                  <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Regional character
                  </h4>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                    {dish.regionalVariations.map((v) => (
                      <div
                        key={v.label}
                        className="rounded-[14px] bg-cream/80 px-3 py-2.5 ring-1 ring-ink/6"
                      >
                        <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                          {v.region}
                        </p>
                        <p className="mt-1 text-[0.78rem] font-bold text-ink">{v.label}</p>
                        <p className="mt-0.5 text-[0.72rem] leading-snug text-ink/75">{v.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
