import type { ComponentProps } from 'react'
import type { TransportMode } from '../data/types'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { ComparisonStrip } from './ComparisonStrip'
import { CompactWorldFilters } from './CompactWorldFilters'

type Glance = { label: string; symbol: string }

type Props = {
  id: string
  index: string
  title: string
  support: string
  glance: Glance[]
  modes: TransportMode[]
  idPrefix: string
  activeModeId: string | null
  onActiveMode: (id: string) => void
  kind: 'long' | 'urban' | 'water'
  filterChips: { id: string; label: string }[]
  activeFilters: string[]
  onToggleFilter: (id: string) => void
  profile?: ComponentProps<typeof CompactWorldFilters>['profile']
  backdrop?: string
  note?: string | null
  selectedOptionId?: string | null
  onSelectOption?: (id: string) => void
}

export function TransportWorld({
  id,
  index,
  title,
  support,
  glance,
  modes,
  idPrefix,
  activeModeId,
  onActiveMode,
  kind,
  filterChips,
  activeFilters,
  onToggleFilter,
  profile,
  backdrop,
  note,
  selectedOptionId = null,
  onSelectOption,
}: Props) {
  return (
    <section id={id} className="scroll-mt-28">
      {backdrop ? (
        <div className="relative mb-6 overflow-hidden rounded-[20px]">
          <img src={backdrop} alt="" className="h-36 w-full object-cover sm:h-44" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
              {index}
            </p>
            <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-paper">
              {title}
            </h2>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            {index}
          </p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-ink">
            {title}
          </h2>
        </>
      )}

      <p className="mt-2 max-w-[56ch] text-[0.9rem] text-muted">{support}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {glance.map((g) => (
          <span
            key={g.label}
            className="rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-ink ring-1 ring-ink/8"
          >
            {g.label} → {g.symbol}
          </span>
        ))}
      </div>

      {note ? (
        <p className="mt-4 rounded-[14px] bg-cream/70 px-4 py-3 text-[0.8rem] font-medium text-ink/80 ring-1 ring-ink/8">
          {note}
        </p>
      ) : null}

      <ModeJumpNav
        modes={modes}
        activeId={activeModeId}
        onActive={onActiveMode}
        idPrefix={idPrefix}
      />

      <div className="mt-5 gap-6 lg:grid lg:grid-cols-[minmax(9.5rem,0.22fr)_minmax(0,0.78fr)]">
        <CompactWorldFilters
          chips={filterChips}
          active={activeFilters}
          onToggle={onToggleFilter}
          profile={profile}
        />

        <div className="min-w-0">
          <div className="mt-2 lg:mt-0">
            {modes.map((m) => (
              <ModeSection
                key={m.id}
                mode={m}
                idPrefix={idPrefix}
                highlighted={activeModeId === m.id}
                selectedOptionId={selectedOptionId}
                onSelectOption={onSelectOption}
              />
            ))}
          </div>

          <ComparisonStrip modes={modes} kind={kind} />
        </div>
      </div>
    </section>
  )
}
