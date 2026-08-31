import { useEffect, useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { TEMPLATE_SECTIONS, sectionAnchor } from './data/sections'
import { ITINERARY_TEMPLATES } from './data/templates'
import { rankedTemplatesForSection, sortBySectionRank } from './data/rankTemplates'
import type { TemplateSectionId, TripShape } from './data/types'
import { isShapeSet, matchTemplates } from './lib/matchTemplates'
import { MatchedStrip } from './components/MatchedStrip'
import { TemplateCard } from './components/TemplateCard'
import { TemplateFilterBar, scrollToSection } from './components/TemplateFilterBar'
import { TripShapeBar } from './components/TripShapeBar'

const EMPTY_SHAPE: TripShape = { days: null, people: null, pace: null }

export function ItineraryTemplatesPage() {
  const [shape, setShape] = useState<TripShape>(EMPTY_SHAPE)
  const [active, setActive] = useState<TemplateSectionId | 'all'>('all')

  const matched = useMemo(
    () => (isShapeSet(shape) ? sortBySectionRank(matchTemplates(ITINERARY_TEMPLATES, shape)) : []),
    [shape],
  )
  const showMatched = isShapeSet(shape)

  useEffect(() => {
    const ids = TEMPLATE_SECTIONS.map((s) => sectionAnchor(s.id))
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!nodes.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]?.target.id?.replace(/^tpl-/, '') as TemplateSectionId | undefined
        if (first) setActive(first)
      },
      { rootMargin: '0px 0px -62% 0px', threshold: 0.15 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  function handleFilter(id: TemplateSectionId | 'all') {
    setActive(id)
    scrollToSection(id)
  }

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

        <div className="mt-8">
          <TripShapeBar
            shape={shape}
            onChange={(patch) => setShape((prev) => ({ ...prev, ...patch }))}
            onClear={() => setShape(EMPTY_SHAPE)}
          />
        </div>

        <div className="mt-10 space-y-8">
          {showMatched ? <MatchedStrip templates={matched} shape={shape} /> : null}

          <div
            id={sectionAnchor('catalog')}
            className="scroll-mt-24 lg:grid lg:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)] lg:items-start lg:gap-6"
          >
            <TemplateFilterBar active={active} onSelect={handleFilter} />

            <div className="mt-4 min-w-0 space-y-10 lg:mt-0">
              {TEMPLATE_SECTIONS.map((section) => {
                const templates = rankedTemplatesForSection(section.id)
                return (
                  <section
                    key={section.id}
                    id={sectionAnchor(section.id)}
                    className={`scroll-mt-24 rounded-[20px] bg-paper px-4 py-5 shadow-soft ring-1 sm:px-6 sm:py-6 ${
                      active === section.id ? 'ring-terracotta/35' : 'ring-ink/[0.06]'
                    }`}
                  >
                    <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                      {section.label}
                    </h2>
                    <p className="mt-1 max-w-[56ch] text-[0.86rem] text-muted">{section.intro}</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} shape={shape} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
