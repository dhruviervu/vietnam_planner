import { sightsByCity } from './data'
import { SightMeta, SightsShell } from './ui'

export function CityChaptersPage() {
  const chapters = sightsByCity()

  return (
    <SightsShell kicker="Template 03" title="One city, then the next.">
      <div className="mx-auto max-w-[40rem]">
        {chapters.map(([city, sights], i) => (
          <section key={city} className={i === 0 ? '' : 'mt-20'}>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h2 className="mt-1 font-serif text-[2rem] font-semibold text-ink">{city}</h2>
            <ol className="mt-8">
              {sights.map((sight) => (
                <li
                  key={sight.id}
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-5 border-t border-ink/8 py-7 first:border-t-0 first:pt-0"
                >
                  <img
                    src={sight.image}
                    alt=""
                    className="h-[4.5rem] w-[4.5rem] rounded-[4px] object-cover"
                  />
                  <div>
                    <h3 className="font-serif text-[1.12rem] font-semibold text-ink">{sight.name}</h3>
                    <p className="mt-1.5 text-[0.88rem] leading-[1.65] text-ink/75">{sight.description}</p>
                    <div className="mt-3">
                      <SightMeta sight={sight} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </SightsShell>
  )
}
