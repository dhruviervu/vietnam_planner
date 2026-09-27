import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'logistics-visa', n: '01', label: 'Visa' },
  { id: 'logistics-sim', n: '02', label: 'SIM' },
  { id: 'logistics-money', n: '03', label: 'Money' },
  { id: 'logistics-insurance', n: '04', label: 'Insurance' },
] as const

export function SectionNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.12, 0.3, 0.5] },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  function go(id: string) {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Logistics sections"
      className="sticky top-0 z-30 -mx-[clamp(1.1rem,4vw,2rem)] border-b border-ink/10 bg-cream/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1180px] gap-0 overflow-x-auto px-[clamp(1.1rem,4vw,2rem)]">
        {SECTIONS.map((s) => {
          const on = active === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.id)}
              className={`relative shrink-0 px-3.5 py-3.5 text-left transition-colors sm:px-4 ${
                on ? 'text-ink' : 'text-ink/45 hover:text-ink/75'
              }`}
            >
              <span className="block text-[0.58rem] font-bold tracking-[0.14em] text-inherit opacity-70">
                {s.n}
              </span>
              <span className="mt-0.5 block text-[0.82rem] font-bold tracking-[-0.01em] sm:text-[0.88rem]">
                {s.label}
              </span>
              <span
                className={`absolute inset-x-3 bottom-0 h-[2px] transition-opacity sm:inset-x-4 ${
                  on ? 'bg-terracotta opacity-100' : 'opacity-0'
                }`}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
