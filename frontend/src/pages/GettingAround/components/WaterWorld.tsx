import { useEffect } from 'react'
import { WATER_MODES } from '../data/modes'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { ComparisonStrip } from './ComparisonStrip'

const WATER_ATLAS = WATER_MODES.filter((m) =>
  ['ferry', 'fast-boat', 'sightseeing-boat', 'cruise'].includes(m.id),
)

const BACKDROP =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80'

const REGIONS = [
  {
    title: 'Islands',
    places: ['Phu Quoc', 'Con Dao'],
    note: 'Ferry and fast boat are the practical mainland links; flights remain the time-saver.',
    image:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Bays',
    places: ['Ha Long', 'Lan Ha'],
    note: 'Cruise and sightseeing boats dominate — often an experience day, not a commute.',
    image:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Rivers',
    places: ['Mekong Delta'],
    note: 'Local and sightseeing boats shape how you move between riverside towns and markets.',
    image:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
  },
]

type Props = {
  activeModeId: string | null
  onActiveMode: (id: string) => void
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
}

export function WaterWorld({
  activeModeId,
  onActiveMode,
  selectedOptionId,
  onSelectOption,
}: Props) {
  useEffect(() => {
    const ids = WATER_ATLAS.map((m) => `mode-water-${m.id}`)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        onActiveMode(visible.target.id.replace('mode-water-', ''))
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.15, 0.35] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [onActiveMode])

  return (
    <section id="world-water" className="scroll-mt-28">
      <div className="relative mb-6 overflow-hidden rounded-[20px]">
        <img src={BACKDROP} alt="" className="h-36 w-full object-cover sm:h-44" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">03</p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-paper">
            Water Transportation
          </h2>
        </div>
      </div>

      <p className="max-w-[56ch] text-[0.9rem] text-muted">
        Where Vietnam&apos;s islands, bays and river systems change the way you travel.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: 'Mainland ↔ island', symbol: '⛴️' },
          { label: 'Fastest water', symbol: '🚤' },
          { label: 'Scenic', symbol: '🛥️' },
          { label: 'Overnight experience', symbol: '🚢' },
        ].map((g) => (
          <span
            key={g.label}
            className="rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/8"
          >
            {g.label} → {g.symbol}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
          Geographic context
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {REGIONS.map((r) => (
            <article key={r.title} className="overflow-hidden rounded-[16px] ring-1 ring-ink/8">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={r.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="bg-cream/50 px-3.5 py-3">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                  {r.title}
                </p>
                <p className="mt-1 font-serif text-[1.05rem] font-semibold text-ink">
                  {r.places.join(' · ')}
                </p>
                <p className="mt-1.5 text-[0.78rem] text-muted">{r.note}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 rounded-[14px] bg-cream/70 px-4 py-3 text-[0.8rem] font-medium text-ink/80 ring-1 ring-ink/8">
          Phu Quoc &amp; island links lean ferry/fast boat · Ha Long leans cruise/sightseeing ·
          Mekong leans local river boats. Sea and river conditions can affect schedules.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Water modes</p>
        <ModeJumpNav
          modes={WATER_ATLAS}
          activeId={activeModeId}
          onActive={onActiveMode}
          idPrefix="mode-water"
        />

        {WATER_ATLAS.map((m) => (
          <ModeSection
            key={m.id}
            mode={m}
            idPrefix="mode-water"
            highlighted={activeModeId === m.id}
            selectedOptionId={selectedOptionId}
            onSelectOption={onSelectOption}
          />
        ))}

        <ComparisonStrip modes={WATER_ATLAS} kind="water" />
      </div>
    </section>
  )
}
