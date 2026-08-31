import { BEFORE_YOU_TRAVEL_SECTIONS } from '../data/beforeYouTravelContent'

export function BeforeYouTravel() {
  return (
    <section id="before-you-travel" className="scroll-mt-28">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Before you travel
      </h2>
      <p className="mt-1 text-[0.85rem] text-muted">
        Three essentials that apply across flights, trains, ferries, and city hops.
      </p>

      <div className="mt-6 space-y-5">
        {BEFORE_YOU_TRAVEL_SECTIONS.map((item) => (
          <article
            key={item.id}
            id={`before-${item.id}`}
            className="overflow-hidden rounded-[20px] ring-1 ring-ink/10"
          >
            <div className="relative aspect-[21/8] max-h-40 sm:max-h-44">
              <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/15" />
              <div className="absolute inset-0 flex items-end gap-3 p-4 sm:p-5">
                <span className="text-[2rem] leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold text-paper">
                  {item.title}
                </h3>
              </div>
            </div>
            <div className="bg-cream/55 px-5 py-4">
              <p className="max-w-[68ch] text-[0.9rem] leading-[1.75] text-ink/88">{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
