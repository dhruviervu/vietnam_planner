import { useState } from 'react'
import { BEFORE_YOU_TRAVEL } from '../data/policies'

export function BeforeYouTravel() {
  const [openId, setOpenId] = useState<string | null>(BEFORE_YOU_TRAVEL[0]?.id ?? null)

  return (
    <section>
      <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
        Before You Travel
      </h2>
      <p className="mt-1 text-[0.85rem] text-muted">
        Practical notes that apply across Vietnam&apos;s transport worlds.
      </p>
      <div className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {BEFORE_YOU_TRAVEL.map((item) => {
          const open = openId === item.id
          return (
            <div key={item.id} className="py-3">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-[0.92rem] font-bold text-ink">{item.title}</span>
                <span className="text-[0.75rem] font-bold text-terracotta">
                  {open ? '−' : '+'}
                </span>
              </button>
              {open ? (
                <p className="mt-2 max-w-[62ch] text-[0.85rem] font-medium leading-relaxed text-ink/80">
                  {item.body}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
