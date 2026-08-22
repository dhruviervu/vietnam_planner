import { scrollToAnchor } from './WorldNav'

const STYLES = [
  {
    id: 'flight',
    title: 'Fastest',
    mode: '✈️ Flight',
    note: 'Best when time is scarce on major city pairs — remember door-to-door friction.',
    target: 'mode-long-flight',
  },
  {
    id: 'train',
    title: 'Most scenic',
    mode: '🚆 Train',
    note: 'Strong for the north–south spine and overnight hops with less airport process.',
    target: 'mode-long-train',
  },
  {
    id: 'coach',
    title: 'Lowest cost',
    mode: '🚌 Coach',
    note: 'Usually the sharpest fare on long trunks and many secondary corridors.',
    target: 'mode-long-coach',
  },
  {
    id: 'private-driver',
    title: 'Most flexible',
    mode: '🚗 Private Driver',
    note: 'Door-to-door control for groups, luggage and multi-stop days.',
    target: 'mode-long-private-driver',
  },
]

export function ExploreByStyle() {
  return (
    <section id="ga-style" className="scroll-mt-24">
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Explore By Travel Style
      </h2>
      <p className="mt-1 max-w-[52ch] text-[0.88rem] text-muted">
        No route selected — start from how you like to travel, then jump into the mode.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToAnchor(s.target)}
            className="rounded-[16px] bg-gradient-to-br from-terracotta/[0.08] via-paper to-cream/80 px-4 py-4 text-left ring-1 ring-terracotta/15 transition hover:ring-terracotta/35"
          >
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-terracotta">
              {s.title}
            </p>
            <p className="mt-1.5 font-serif text-[1.15rem] font-semibold text-ink">{s.mode}</p>
            <p className="mt-1.5 text-[0.8rem] font-medium leading-snug text-ink/75">{s.note}</p>
            <p className="mt-3 text-[0.72rem] font-bold text-terracotta">Jump to mode →</p>
          </button>
        ))}
      </div>
    </section>
  )
}
