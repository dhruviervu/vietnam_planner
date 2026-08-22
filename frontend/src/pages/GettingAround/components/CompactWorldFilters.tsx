type Chip = { id: string; label: string }

type Props = {
  chips: Chip[]
  active: string[]
  onToggle: (id: string) => void
  profile?: {
    passengers: number
    luggage: 'light' | 'medium' | 'heavy'
    accessibility: boolean
    budget: boolean
    onPassengers: (n: number) => void
    onLuggage: (l: 'light' | 'medium' | 'heavy') => void
    onAccessibility: () => void
    onBudget: () => void
  }
}

export function CompactWorldFilters({ chips, active, onToggle, profile }: Props) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <button
        type="button"
        className="mb-2 rounded-full bg-cream px-3 py-1.5 text-[0.75rem] font-bold text-ink ring-1 ring-ink/8 lg:hidden"
        onClick={(e) => {
          const panel = (e.currentTarget.nextElementSibling as HTMLElement | null)
          if (panel) panel.classList.toggle('hidden')
        }}
      >
        Filters →
      </button>
      <div className="hidden rounded-[16px] bg-cream/90 p-2.5 ring-1 ring-ink/10 lg:block">
        <p className="px-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
          Filters
        </p>
        <div className="mt-2 flex flex-col gap-1.5">
          {chips.map((c) => {
            const on = active.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onToggle(c.id)}
                aria-pressed={on}
                className={`rounded-full px-3 py-1.5 text-left text-[0.72rem] font-bold transition ${
                  on
                    ? 'bg-terracotta text-paper shadow-sm'
                    : 'bg-paper text-ink ring-1 ring-ink/10 hover:text-terracotta'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        {profile ? (
          <div className="mt-3 border-t border-ink/8 pt-3">
            <p className="px-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">
              Profile
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => profile.onPassengers(n)}
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${
                      profile.passengers === n
                        ? 'bg-sage/25 text-ink'
                        : 'bg-paper text-ink ring-1 ring-ink/8'
                    }`}
                  >
                    👥 {n}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {(['light', 'medium', 'heavy'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => profile.onLuggage(l)}
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold capitalize ${
                      profile.luggage === l
                        ? 'bg-sage/25 text-ink'
                        : 'bg-paper text-ink ring-1 ring-ink/8'
                    }`}
                  >
                    🧳 {l}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={profile.onAccessibility}
                className={`rounded-full px-2.5 py-1 text-left text-[0.68rem] font-bold ${
                  profile.accessibility
                    ? 'bg-sage/25 text-ink'
                    : 'bg-paper text-ink ring-1 ring-ink/8'
                }`}
              >
                ♿ Accessible
              </button>
              <button
                type="button"
                onClick={profile.onBudget}
                className={`rounded-full px-2.5 py-1 text-left text-[0.68rem] font-bold ${
                  profile.budget ? 'bg-sage/25 text-ink' : 'bg-paper text-ink ring-1 ring-ink/8'
                }`}
              >
                💰 Budget
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
