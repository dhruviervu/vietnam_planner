import type { PackedTemplate } from '../data/catalogTypes'

export function PackedCard({ template }: { template: PackedTemplate }) {
  const sights = template.previewNames.slice(0, 8)

  function open() {
    window.open(`/plan/itinerary-ideas/${template.id}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/6 transition hover:-translate-y-0.5 hover:ring-terracotta/25"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 28rem' }}
    >
      <button type="button" onClick={open} className="text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-cream">
          {template.image ? (
            <img
              src={template.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-paper">
            {template.pace === 'slow'
              ? `${template.days} slow day${template.days === 1 ? '' : 's'}`
              : `${template.days} day${template.days === 1 ? '' : 's'}`}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
            {template.pace === 'slow'
              ? 'Slow itinerary'
              : template.kind === 'country'
                ? 'Complete Vietnam'
                : template.cities[0]}
          </p>
          <h3 className="mt-1 font-serif text-[1.18rem] font-semibold leading-tight text-ink">
            {template.title}
          </h3>
          <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-ink/80">{template.description}</p>
          <p className="mt-3 text-[0.72rem] font-medium text-muted">{template.cities.join(' · ')}</p>
          {sights.length ? (
            <ul className="mt-2 flex flex-wrap gap-1">
              {sights.map((name) => (
                <li
                  key={name}
                  className="rounded-full bg-cream px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/75"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : null}
          <span className="mt-4 inline-flex rounded-full bg-terracotta px-4 py-2 text-[0.8rem] font-bold text-paper">
            See itinerary
          </span>
        </div>
      </button>
    </article>
  )
}
