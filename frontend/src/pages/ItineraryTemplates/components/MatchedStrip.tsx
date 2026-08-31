import { TemplateCard } from './TemplateCard'
import type { ItineraryTemplate, TripShape } from '../data/types'

type Props = {
  templates: ItineraryTemplate[]
  shape?: TripShape
}

export function MatchedStrip({ templates, shape }: Props) {
  return (
    <section className="rounded-[24px] bg-paper px-4 py-5 shadow-soft ring-1 ring-terracotta/25 sm:px-6 sm:py-6">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        Matched for you
      </p>
      <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">
        Example itineraries that fit
      </h2>
      {templates.length === 0 ? (
        <p className="mt-3 max-w-[52ch] text-[0.88rem] text-muted">
          Nothing in the library fits this shape yet — browse the sections below.
        </p>
      ) : (
        <>
          <p className="mt-1 text-[0.84rem] text-muted">
            {templates.length} example{templates.length === 1 ? '' : 's'} from the catalog.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={`match-${template.id}`} template={template} shape={shape} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
