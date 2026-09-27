import type { TransportModeId } from '../data/types'
import { ALL_MODE_IDS, MODE_DEFINITIONS, buildMode } from '../data/modes'
import { formatCostCompact, formatTimeRange } from '../data/catalog'

const GROUPS = [
  {
    size: '1',
    title: '1 person',
    who: 'Solo traveler',
    best: 'Express airport buses (Bus 86 in Hanoi, Bus 109 in Saigon) or a ride-hailing motorbike / taxi (Grab, Xanh SM).',
    why: 'Buses cost under $2 USD and are direct and safe. With light luggage, a motorbike taxi or a standard 4-seater app ride is extremely affordable ($3–$10 USD depending on the city).',
  },
  {
    size: '2',
    title: '2 persons',
    who: 'Couples / travel pairs',
    best: 'Ride-hailing app (Grab / Xanh SM) or metered taxi.',
    why: 'A standard 4-seater sedan comfortably fits two passengers plus two medium suitcases at a minimal cost per person. You skip the wait for buses without paying extra for unused vehicle space.',
  },
  {
    size: '4',
    title: '4 persons',
    who: 'Families / small groups',
    best: '7-seater ride-hail / taxi or a pre-booked private SUV.',
    why: 'A standard 4-seater will not fit 4 adults alongside 4 large suitcases. A 7-seater (Innova or Fortuner) on Grab / Xanh SM, or a private SUV via Klook, keeps everyone and the bags in one vehicle — cost per head close to public transit.',
  },
  {
    size: '4+',
    title: '4+ persons',
    who: 'Large groups / multiple families',
    best: 'Pre-booked private van (16-seater) or minibus.',
    why: 'Splitting 5+ people into multiple cars gets chaotic at arrivals. A pre-booked 16-seater Ford Transit or Hyundai Solati driver holds a name placard, handles the luggage, and takes the whole group straight to your stay.',
  },
] as const

type Props = {
  selectedId: TransportModeId | null
  onPick: (id: TransportModeId) => void
}

export function TransferWaysIntro({ selectedId, onPick }: Props) {
  return (
    <section>
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Airport logistics
      </p>
      <h1 className="mt-1.5 font-serif text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
        Ways to do an airport transfer to and from the cities
      </h1>
      <p className="mt-3 max-w-[72ch] text-[0.95rem] leading-relaxed text-ink/80">
        When traveling to and from airports in Vietnam, the ideal transfer depends on group size,
        budget, luggage, and comfort. Ride-hailing apps (Grab, Xanh SM), traditional taxis (Mai Linh,
        Vinasun), airport express buses, pre-arranged private drivers, and rental vehicles each fill
        a specific need.
      </p>

      <h2 className="mt-8 font-serif text-[1.35rem] font-semibold text-ink">
        Transfer options by group size
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {GROUPS.map((g) => (
          <li
            key={g.size}
            className="relative overflow-hidden rounded-[22px] bg-paper p-5 shadow-soft ring-1 ring-ink/8"
          >
            <span className="font-serif text-[2.15rem] font-semibold leading-none text-terracotta/90">
              {g.size}
            </span>
            <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink/40">
              {g.who}
            </p>
            <h3 className="mt-2 font-serif text-[1.18rem] font-semibold text-ink">{g.title}</h3>
            <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sage">
              Best choice
            </p>
            <p className="mt-1 text-[0.88rem] font-semibold leading-snug text-ink">{g.best}</p>
            <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">{g.why}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink/45">
        Modes in detail below
      </p>
      <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {ALL_MODE_IDS.map((id) => {
          const def = MODE_DEFINITIONS[id]
          const mode = buildMode(id, undefined, 'inbound')
          const on = id === selectedId
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
              className={`min-w-[14.5rem] snap-start overflow-hidden rounded-[18px] bg-paper text-left shadow-soft ring-1 transition md:min-w-0 ${
                on ? 'ring-2 ring-terracotta' : 'ring-ink/8 hover:ring-ink/16'
              }`}
            >
              <div className="relative h-[7.2rem] overflow-hidden">
                <img src={def.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-paper/92 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-ink">
                  {def.symbol} {def.shortLabel}
                </span>
              </div>
              <div className="px-3 py-3">
                <p className="font-serif text-[1.02rem] font-semibold leading-tight text-ink">{def.label}</p>
                <p className="mt-1.5 text-[0.8rem] font-semibold text-ink/80">
                  {formatTimeRange(mode.timeMin)}
                  <span className="mx-1.5 text-ink/25">·</span>
                  {formatCostCompact(mode)}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[0.72rem] font-medium leading-snug text-muted">
                  {def.whyChoose[0]}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
