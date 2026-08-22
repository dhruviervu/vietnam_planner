export function scrollToAnchor(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({ top, behavior: 'smooth' })
}

type WorldKey = 'long-distance' | 'urban' | 'water'

const WORLDS: { key: WorldKey; index: string; label: string; target: string }[] = [
  { key: 'long-distance', index: '01', label: 'Long-Distance', target: 'world-long' },
  { key: 'urban', index: '02', label: 'Urban & Short-Distance', target: 'world-urban' },
  { key: 'water', index: '03', label: 'Water', target: 'world-water' },
]

type Props = {
  active: WorldKey
  onActive: (key: WorldKey) => void
}

export function WorldNav({ active, onActive }: Props) {
  return (
    <nav aria-label="Transport worlds" className="mt-8">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">
        How Vietnam moves
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {WORLDS.map((w) => {
          const on = active === w.key
          return (
            <button
              key={w.key}
              type="button"
              onClick={() => {
                onActive(w.key)
                scrollToAnchor(w.target)
              }}
              className={`rounded-[16px] px-4 py-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                on
                  ? 'bg-terracotta text-paper shadow-sm'
                  : 'bg-cream/80 text-ink ring-1 ring-ink/10 hover:bg-cream'
              }`}
            >
              <span
                className={`text-[0.58rem] font-bold uppercase tracking-[0.14em] ${
                  on ? 'text-paper/75' : 'text-muted'
                }`}
              >
                {w.index}
              </span>
              <span className="mt-1 block font-serif text-[1.05rem] font-semibold leading-tight">
                {w.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
