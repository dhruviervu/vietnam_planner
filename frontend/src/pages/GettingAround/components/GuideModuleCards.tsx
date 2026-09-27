import { scrollToAnchor } from './WorldNav'

const MODULES = [
  {
    id: 'dive-train',
    label: 'Trains',
    blurb: 'Reunification Express, Hai Van in daylight, and when a sleeper beats a hotel.',
  },
  {
    id: 'dive-coach',
    label: 'Buses',
    blurb: 'Limousine vans and sleeper buses for towns the railway never reaches.',
  },
  {
    id: 'dive-flight',
    label: 'Flights',
    blurb: 'The honest long-haul: Hanoi to Ho Chi Minh City, plus islands with runways.',
  },
  {
    id: 'dive-water',
    label: 'Water',
    blurb: 'Island ferries, river boats, and cruises — three jobs, not one.',
  },
  {
    id: 'dive-urban',
    label: 'In the City',
    blurb: 'Grab, scooters, metro, and walking the old cores. Not a coach to Hue.',
  },
]

export function GuideModuleCards() {
  return (
    <section id="guide-hero" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        Getting around
      </p>
      <h1 className="mt-2 font-serif text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[0.98] text-ink">
        How you move in Vietnam
      </h1>
      <p className="mt-4 text-[1.05rem] leading-[1.7] text-ink/78">
        Jump to the mode you need, or read straight down.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {MODULES.map((mod, i) => (
          <button
            key={mod.id}
            type="button"
            onClick={() => scrollToAnchor(mod.id)}
            className="group flex min-h-[11.5rem] flex-col rounded-[24px] bg-paper p-5 text-left shadow-soft ring-1 ring-ink/8 transition hover:-translate-y-0.5 hover:ring-terracotta/40"
          >
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h2 className="mt-3 font-serif text-[1.45rem] font-semibold leading-tight text-ink group-hover:text-terracotta">
              {mod.label}
            </h2>
            <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-ink/72">{mod.blurb}</p>
            <span className="mt-4 text-[0.78rem] font-semibold text-terracotta">Open →</span>
          </button>
        ))}
      </div>
    </section>
  )
}
