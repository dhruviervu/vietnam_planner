import { useState } from 'react'
import { BOOKING_POLICIES } from '../data/policies'

export function BeforeYouBook() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Before You Book
      </h2>
      <p className="mt-1 max-w-[50ch] text-[0.88rem] text-muted">
        Practical policies to understand before you leave TripBuilder for a provider.
      </p>
      <div className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {BOOKING_POLICIES.map((p) => {
          const open = openId === p.id
          return (
            <div key={p.id} className="py-3">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : p.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <p className="text-[0.95rem] font-bold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-[0.78rem] font-medium text-muted">{p.summary}</p>
                </div>
                <span className="text-[0.85rem] font-bold text-terracotta">{open ? '−' : '+'}</span>
              </button>
              {open ? (
                <p className="mt-2 max-w-[58ch] text-[0.82rem] font-medium leading-relaxed text-ink/85">
                  {p.body}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
