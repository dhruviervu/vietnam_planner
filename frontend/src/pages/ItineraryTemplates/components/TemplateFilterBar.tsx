import { TEMPLATE_SECTIONS, sectionAnchor } from '../data/sections'
import type { TemplateSectionId } from '../data/types'

type Props = {
  active: TemplateSectionId | 'all'
  onSelect: (id: TemplateSectionId | 'all') => void
}

export function TemplateFilterBar({ active, onSelect }: Props) {
  return (
    <nav
      aria-label="Itinerary filters"
      className="rounded-[20px] border border-ink/8 bg-paper/90 p-4 shadow-soft backdrop-blur-sm lg:sticky lg:top-24 lg:self-start"
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">Filters</p>
      <h2 className="mt-0.5 font-serif text-[1.12rem] font-semibold text-ink">Browse itineraries</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={active === 'all'}
          onClick={() => onSelect('all')}
          className={`rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold ${
            active === 'all' ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
          }`}
        >
          All
        </button>
        {TEMPLATE_SECTIONS.map((section) => {
          const isActive = active === section.id
          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(section.id)}
              className={`rounded-full px-2.5 py-1.5 text-[0.72rem] font-bold ${
                isActive ? 'bg-ink text-paper' : 'bg-cream text-ink hover:bg-cream-deep'
              }`}
            >
              {section.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function scrollToSection(id: TemplateSectionId | 'all') {
  const el = document.getElementById(id === 'all' ? sectionAnchor('catalog') : sectionAnchor(id))
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
