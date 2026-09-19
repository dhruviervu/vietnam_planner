import { useState } from 'react'
import { SAMPLE_SIGHTS } from './data'
import { SightMeta, SightsShell } from './ui'

export function LookbookPage() {
  const [id, setId] = useState(SAMPLE_SIGHTS[0].id)
  const sight = SAMPLE_SIGHTS.find((s) => s.id === id) ?? SAMPLE_SIGHTS[0]

  return (
    <SightsShell kicker="Template 04" title="Look at one place.">
      <div className="mx-auto grid max-w-[72rem] items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
        <div>
          <div className="overflow-hidden rounded-[8px]">
            <img
              key={sight.id}
              src={sight.image}
              alt=""
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
          <div className="mt-6 max-w-[32rem]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {sight.city}
            </p>
            <h2 className="mt-1.5 font-serif text-[2rem] font-semibold leading-tight text-ink">
              {sight.name}
            </h2>
            <p className="mt-4 text-[1.02rem] leading-[1.75] text-ink/80">{sight.description}</p>
            <div className="mt-5">
              <SightMeta sight={sight} />
            </div>
          </div>
        </div>

        <aside>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted">Also here</p>
          <ul className="mt-4">
            {SAMPLE_SIGHTS.map((item) => {
              const on = item.id === sight.id
              return (
                <li key={item.id} className="border-t border-ink/8">
                  <button
                    type="button"
                    onClick={() => setId(item.id)}
                    className={`flex w-full items-baseline justify-between gap-4 py-3.5 text-left ${
                      on ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span className={`font-serif text-[1.02rem] ${on ? 'font-semibold' : ''}`}>
                      {item.name}
                    </span>
                    <span className="shrink-0 text-[0.68rem] uppercase tracking-wide">{item.city}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </SightsShell>
  )
}
