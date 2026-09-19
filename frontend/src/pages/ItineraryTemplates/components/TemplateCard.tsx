import { cityArc, durationLabel } from '../data/templates'
import { rankInSection } from '../data/rankTemplates'
import type { ItineraryTemplate, TripShape } from '../data/types'
import { itineraryTemplateUrl } from '../lib/itineraryUrl'

type Props = {
  template: ItineraryTemplate
  shape?: TripShape
}

export function TemplateCard({ template, shape }: Props) {
  const rank = rankInSection(template)

  function openItinerary() {
    window.open(itineraryTemplateUrl(template.id, shape), '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/6 transition hover:-translate-y-0.5 hover:ring-terracotta/25"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 26rem' }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={template.image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <span
          className="absolute left-2.5 top-2.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-terracotta px-2 font-serif text-[0.92rem] font-bold tabular-nums text-paper shadow-soft"
          aria-label={`Rank ${rank} in this section`}
        >
          #{rank}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-cream px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink/80"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mt-2 font-serif text-[1.18rem] font-semibold leading-tight text-ink">
          {template.title}
        </h3>
        <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-ink/80">
          {template.description}
        </p>
        <p className="mt-4 text-[0.72rem] font-semibold text-ink/70">
          {durationLabel(template)}
          <span className="mx-1.5 text-ink/25">·</span>
          <span className="font-medium text-muted">{cityArc(template.cities)}</span>
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={openItinerary}
            className="rounded-full bg-terracotta px-4 py-2 text-[0.8rem] font-bold text-paper transition hover:-translate-y-0.5"
          >
            See Itinerary
          </button>
        </div>
      </div>
    </article>
  )
}
