import { SAMPLE_SIGHTS } from './data'
import { SightMeta, SightsShell } from './ui'

export function JournalPage() {
  return (
    <SightsShell kicker="Template 05" title="Notes, not a catalog.">
      <div className="mx-auto max-w-[34rem]">
        {SAMPLE_SIGHTS.map((sight, i) => (
          <article key={sight.id} className={i === 0 ? '' : 'mt-16'}>
            {i % 2 === 0 ? (
              <img
                src={sight.image}
                alt=""
                className="mb-6 aspect-[16/9] w-full rounded-[4px] object-cover"
              />
            ) : null}
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
              {sight.city}
            </p>
            <h2 className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight text-ink">
              {sight.name}
            </h2>
            <p className="mt-4 text-[1.02rem] leading-[1.8] text-ink/82">{sight.description}</p>
            <div className="mt-4 border-t border-ink/10 pt-3">
              <SightMeta sight={sight} />
            </div>
          </article>
        ))}
      </div>
    </SightsShell>
  )
}
