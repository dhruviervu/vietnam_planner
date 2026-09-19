import { useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { BROWSE_SECTIONS, sectionAnchor } from './data/sections'
import { ITINERARY_TEMPLATES } from './data/templates'
import { rankedTemplatesForSection } from './data/rankTemplates'
import type { ItineraryTemplate } from './data/types'
import {
  DEFAULT_TEMPLATE_FILTERS,
  filterTemplates,
  templateFiltersAreActive,
  type TemplateCatalogFilters,
} from './lib/matchTemplates'
import { TemplateCard } from './components/TemplateCard'
import { TemplateFilterBar } from './components/TemplateFilterBar'

const BROWSE_TEMPLATES = ITINERARY_TEMPLATES.filter((template) => template.section !== 'city-stays')

function cityCatalog(templates: ItineraryTemplate[]) {
  const counts: Record<string, number> = {}
  for (const template of templates) {
    const seen = new Set<string>()
    for (const city of template.cities) {
      if (seen.has(city)) continue
      seen.add(city)
      counts[city] = (counts[city] ?? 0) + 1
    }
  }
  const cities = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
  return { cities, counts }
}

export function ItineraryTemplatesPage() {
  const [filters, setFilters] = useState<TemplateCatalogFilters>(DEFAULT_TEMPLATE_FILTERS)
  const filtering = templateFiltersAreActive(filters)
  const matched = useMemo(() => filterTemplates(BROWSE_TEMPLATES, filters), [filters])
  const { cities, counts } = useMemo(() => cityCatalog(BROWSE_TEMPLATES), [])

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <header className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero">
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 20% 0%, #c45c3a 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #7a8f72 0%, transparent 45%)',
            }}
          />
          <div className="relative px-5 py-7 sm:px-8 sm:py-8">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-sage">
              Example trips
            </p>
            <h1 className="mt-1 font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
              Itinerary Templates
            </h1>
            <p className="mt-2 max-w-[52ch] text-[1.02rem] leading-relaxed text-muted">
              A library of example Vietnam trips — copy one, steal a route, or use them as a
              reference while you build Your Vietnam.
            </p>
          </div>
        </header>

        <div
          id={sectionAnchor('catalog')}
          className="mt-8 scroll-mt-24 lg:grid lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)] lg:items-start lg:gap-6"
        >
          <TemplateFilterBar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_TEMPLATE_FILTERS)}
            cities={cities}
            cityCounts={counts}
            resultCount={matched.length}
          />

          <div className="mt-4 min-w-0 space-y-10 lg:mt-0">
            {filtering ? (
              <section className="rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-terracotta/35 sm:px-6 sm:py-6">
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Matches</h2>
                <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">
                  {matched.length
                    ? `${matched.length} itinerar${matched.length === 1 ? 'y' : 'ies'} for these filters.`
                    : 'Nothing in the library fits these filters yet.'}
                </p>
                {matched.length ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {matched.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : (
              BROWSE_SECTIONS.map((section) => {
                const templates = rankedTemplatesForSection(section.id)
                if (!templates.length) return null
                return (
                  <section
                    key={section.id}
                    id={sectionAnchor(section.id)}
                    className="scroll-mt-24 rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 ring-ink/[0.06] sm:px-6 sm:py-6"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 32rem' }}
                  >
                    <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                      {section.label}
                    </h2>
                    <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">{section.intro}</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  </section>
                )
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
