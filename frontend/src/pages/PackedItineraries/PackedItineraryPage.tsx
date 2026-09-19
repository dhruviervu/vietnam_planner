import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getIdeaTemplate } from './data/ideasCatalog'
import type { PackedTemplate } from './data/catalogTypes'

const PackedItineraryLive = lazy(() =>
  import('./PackedItineraryLive').then((m) => ({ default: m.PackedItineraryLive })),
)

export function PackedItineraryPage() {
  const { templateId } = useParams()
  const template = templateId ? getIdeaTemplate(templateId) : undefined

  if (!template) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-[720px] px-[clamp(1.1rem,4vw,2rem)] py-16">
          <h1 className="font-serif text-[2rem] font-semibold text-ink">Itinerary not found</h1>
          <p className="mt-2 text-muted">That itinerary idea is not in the catalog.</p>
          <Link
            to="/plan/itinerary-ideas"
            className="mt-6 inline-flex rounded-full bg-terracotta px-4 py-2 text-[0.85rem] font-bold text-paper"
          >
            Back to itinerary ideas
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <Suspense fallback={<PackedItineraryFallback template={template} />}>
      <PackedItineraryLive template={template} />
    </Suspense>
  )
}

function PackedItineraryFallback({ template }: { template: PackedTemplate }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1600px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <p className="mb-4">
          <Link to="/plan/itinerary-ideas" className="text-[0.82rem] font-semibold text-terracotta hover:underline">
            ← All itinerary ideas
          </Link>
        </p>
        <header className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper shadow-hero">
          <div className="relative px-5 py-4 sm:px-8 sm:py-5">
            <h1 className="font-serif text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.05] text-ink">
              {template.title}
            </h1>
            <p className="mt-2 max-w-[58ch] text-[1.02rem] leading-relaxed text-muted">{template.description}</p>
            <p className="mt-2 text-[0.88rem] font-medium text-muted">
              {template.days} days · {template.cities.join(' → ')}
            </p>
          </div>
        </header>
        <p className="mt-8 text-[0.88rem] text-muted">Loading this itinerary…</p>
      </main>
      <Footer />
    </>
  )
}
