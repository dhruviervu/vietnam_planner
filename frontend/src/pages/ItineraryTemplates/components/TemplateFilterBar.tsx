import { useState } from 'react'
import { FilterChip } from '../../PlanBuilder/components/ExperienceFilterPanel'
import { BROWSE_SECTIONS } from '../data/sections'
import type { TemplateSectionId } from '../data/types'
import {
  DEFAULT_TEMPLATE_FILTERS,
  countActiveTemplateFilters,
  type TemplateCatalogFilters,
  type TemplateDurationFilter,
} from '../lib/matchTemplates'

export const TEMPLATE_DURATION_CHIPS: {
  id: Exclude<TemplateDurationFilter, 'all'>
  label: string
  range: string
}[] = [
  { id: 'short', label: 'A few days', range: '1–5 days' },
  { id: 'week', label: 'About a week', range: '6–10 days' },
  { id: 'longer', label: 'Longer', range: '11+ days' },
]

type Props = {
  filters: TemplateCatalogFilters
  onChange: (next: TemplateCatalogFilters) => void
  onClear: () => void
  cities: string[]
  cityCounts: Record<string, number>
  resultCount: number
}

export function TemplateFilterBar({
  filters,
  onChange,
  onClear,
  cities,
  cityCounts,
  resultCount,
}: Props) {
  const activeCount = countActiveTemplateFilters(filters)
  const [moreCities, setMoreCities] = useState(false)
  const topCities = cities.slice(0, 6)
  const extraCities = cities.slice(6)
  const visibleCities = moreCities ? cities : topCities

  function toggleCity(city: string) {
    const on = !filters.cities.includes(city)
    onChange({
      ...filters,
      cities: on ? [...filters.cities, city] : filters.cities.filter((c) => c !== city),
    })
  }

  function toggleSection(id: TemplateSectionId) {
    onChange({
      ...filters,
      sections: filters.sections.includes(id)
        ? filters.sections.filter((s) => s !== id)
        : [...filters.sections, id],
    })
  }

  function setDuration(next: Exclude<TemplateDurationFilter, 'all'>) {
    onChange({ ...filters, duration: filters.duration === next ? 'all' : next })
  }

  return (
    <nav
      aria-label="Itinerary filters"
      className="rounded-[20px] border border-ink/8 bg-paper/90 p-4 shadow-soft backdrop-blur-sm lg:sticky lg:top-24 lg:self-start"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
              Filters
            </p>
            <p className="mt-1 font-serif text-[1.15rem] font-semibold leading-snug text-ink">
              Shape what you see
            </p>
            <p className="mt-1 text-[0.75rem] text-muted">
              {resultCount} match{resultCount === 1 ? '' : 'es'}
              {activeCount > 0 ? ` · ${activeCount} active` : ''}
            </p>
          </div>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
            Explore by city
          </h3>
          <p className="mt-1 text-[0.72rem] text-muted">Filter the catalog to one or more cities.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleCities.map((city) => (
              <FilterChip
                key={city}
                active={filters.cities.includes(city)}
                onClick={() => toggleCity(city)}
              >
                {city}
                <span className="ml-1 opacity-70">{cityCounts[city] ?? 0}</span>
              </FilterChip>
            ))}
          </div>
          {extraCities.length > 0 ? (
            <button
              type="button"
              onClick={() => setMoreCities((v) => !v)}
              className="mt-2 text-[0.72rem] font-bold text-terracotta hover:underline"
            >
              {moreCities ? 'Show fewer cities' : `Show ${extraCities.length} more cities`}
            </button>
          ) : null}
        </section>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
            Duration
          </h3>
          <p className="mt-1 text-[0.72rem] text-muted">How long you want to spend.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TEMPLATE_DURATION_CHIPS.map((chip) => (
              <FilterChip
                key={chip.id}
                active={filters.duration === chip.id}
                onClick={() => setDuration(chip.id)}
                className="rounded-[14px] px-3 text-left"
              >
                <span className="flex flex-col items-start leading-tight">
                  <span>{chip.label}</span>
                  <span className="text-[0.62rem] font-semibold opacity-80">{chip.range}</span>
                </span>
              </FilterChip>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
            Show me
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BROWSE_SECTIONS.map((section) => (
              <FilterChip
                key={section.id}
                active={filters.sections.includes(section.id)}
                onClick={() => toggleSection(section.id)}
              >
                {section.label}
              </FilterChip>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_TEMPLATE_FILTERS })}
          className="w-full rounded-full border border-ink/10 py-2.5 text-[0.8rem] font-bold text-ink hover:border-terracotta/30"
        >
          Reset filters
        </button>
      </div>
    </nav>
  )
}

export function scrollToSection(id: TemplateSectionId | 'all') {
  const el = document.getElementById(id === 'all' ? 'tpl-catalog' : `tpl-${id}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
