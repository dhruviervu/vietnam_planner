import { WATER_GROUPS } from '../data/standaloneGuide'

export function WaterByFunction() {
  return (
    <section id="dive-water" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">04</p>
      <h2 className="mt-1 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-semibold text-ink">
        Water transport
      </h2>
      <p className="mt-2 max-w-[60ch] text-[1.02rem] leading-relaxed text-ink/75">
        Vietnam&apos;s boats do three different jobs. Mixing them up is how people buy a Ha Long
        cruise thinking it is a ferry to Cat Ba.
      </p>
      <div className="mt-8 space-y-8">
        {WATER_GROUPS.map((group) => (
          <article
            key={group.id}
            className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          >
            <div className="relative min-h-[12rem]">
              <img src={group.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
                {group.kicker}
              </p>
              <h3 className="mt-2 font-serif text-[1.55rem] font-semibold text-ink">{group.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink/78">{group.body}</p>
              <ul className="mt-5 space-y-3">
                {group.examples.map((ex) => (
                  <li key={ex.route} className="border-t border-ink/8 pt-3">
                    <p className="font-semibold text-ink">{ex.route}</p>
                    <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-terracotta">
                      {ex.time}
                    </p>
                    <p className="mt-1 text-[0.88rem] leading-relaxed text-ink/70">{ex.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
