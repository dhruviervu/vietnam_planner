import { AnimatePresence, motion } from 'framer-motion'
import type { ShoppingItem } from '../data/types'
import { worthStars } from '../data/items'

type Props = {
  item: ShoppingItem
}

function Flag({
  ok,
  label,
  invertTone = false,
}: {
  ok: boolean | string
  label: string
  /** When true, "Yes"/true uses warning tone (e.g. Fragile) */
  invertTone?: boolean
}) {
  const text = typeof ok === 'string' ? ok : ok ? 'Yes' : 'No'
  const affirmative =
    typeof ok === 'string'
      ? ok !== 'No' && !ok.startsWith('No')
      : ok
  const good = invertTone ? !affirmative : affirmative
  return (
    <div className="rounded-[12px] bg-cream/80 px-2.5 py-2 ring-1 ring-ink/6">
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
      <p className={`mt-0.5 text-[0.78rem] font-bold ${good ? 'text-sage' : 'text-terracotta'}`}>
        {typeof ok === 'boolean' && ok && !invertTone ? `${text} ✓` : text}
      </p>
    </div>
  )
}

export function ItemDetailSection({ item }: Props) {
  return (
    <section id="understand-the-item" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Understand the Item
      </h2>
      <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
        Culture, cost and packing reality — so you know if it belongs in your bag.
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="mt-5 overflow-hidden rounded-[22px] bg-paper shadow-soft"
        >
          <div className="border-b border-ink/8 px-5 py-4 sm:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage">
              Selected item
            </p>
            <h3 className="mt-1 font-serif text-[clamp(1.45rem,3vw,1.9rem)] font-semibold text-ink">
              {item.name}
            </h3>
            <p className="mt-0.5 text-[0.78rem] font-semibold text-muted">
              {item.origin}
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="bg-ink/5 p-4 sm:p-5">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
                Product story
              </p>
              <div className="overflow-hidden rounded-[16px] bg-ink shadow-card">
                <div className="aspect-video w-full">
                  <iframe
                    title={`${item.name} — product story`}
                    src={item.youtubeVideoUrl}
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
                  Why it matters
                </h4>
                <div className="mt-2 space-y-2">
                  {item.whyItMatters.map((p) => (
                    <p key={p} className="text-[0.88rem] font-medium leading-relaxed text-ink/85">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-cream/80 px-3 py-2.5 ring-1 ring-ink/6">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Typical cost
                  </p>
                  <p className="mt-1 text-[1.05rem] font-bold text-ink">{item.typicalCostLabel}</p>
                  <p className="mt-0.5 text-[0.72rem] font-semibold text-ink/70">
                    {item.typicalCostFrom}
                  </p>
                </div>
                <div className="rounded-[14px] bg-cream/80 px-3 py-2.5 ring-1 ring-ink/6">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted">
                    Material
                  </p>
                  <p className="mt-1 text-[0.85rem] font-bold leading-snug text-ink">
                    {item.material}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                  Practical to carry
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  <Flag ok={item.airportSafe} label="Airport Safe" />
                  <Flag ok={item.easyToPack} label="Easy to Pack" />
                  <Flag ok={item.fragile} label="Fragile" invertTone />
                  <Flag ok={item.giftFriendly} label="Gift Friendly" />
                  <Flag ok={item.bargainable} label="Bargainable" />
                  <Flag ok={item.carryOnFriendly} label="Carry-On" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-ink/8 px-5 py-5 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <h4 className="font-serif text-[1.2rem] font-semibold text-ink">
                  Worth Bringing Home?
                </h4>
                <p className="mt-2 text-[1.35rem] tracking-tight text-terracotta">
                  {worthStars(item.worthBringingHome)}
                </p>
                <p className="mt-2 text-[0.88rem] font-medium leading-snug text-ink/85">
                  {item.worthReason}
                </p>
                {item.authenticityNote ? (
                  <p className="mt-2 text-[0.75rem] font-semibold text-muted">
                    Authenticity · {item.authenticityNote}
                  </p>
                ) : null}
              </div>

              {item.regionalVariations.length > 0 ? (
                <div>
                  <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted">
                    Regional character
                  </h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {item.regionalVariations.map((v) => (
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
