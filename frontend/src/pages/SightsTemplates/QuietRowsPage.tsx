import { SAMPLE_SIGHTS } from './data'
import { SightMeta, SightsShell } from './ui'

export function QuietRowsPage() {
  return (
    <SightsShell kicker="Template 01" title="Sights, one after another.">
      <ul className="mx-auto max-w-[58rem] divide-y divide-ink/8">
        {SAMPLE_SIGHTS.map((sight) => (
          <li key={sight.id} className="grid gap-6 py-10 sm:grid-cols-[13.5rem_minmax(0,1fr)] sm:items-start sm:gap-10">
            <div className="overflow-hidden rounded-[4px] bg-cream-deep">
              <img
                src={sight.image}
                alt=""
                className="aspect-[5/4] h-full w-full object-cover sm:aspect-[4/5]"
              />
            </div>
            <div className="max-w-[28rem] pt-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {sight.city}
              </p>
              <h2 className="mt-1.5 font-serif text-[1.45rem] font-semibold leading-tight text-ink">
                {sight.name}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-[1.7] text-ink/80">{sight.description}</p>
              <div className="mt-5">
                <SightMeta sight={sight} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SightsShell>
  )
}
