import { Link, useParams } from 'react-router-dom'
import { Nav } from '../components/landing/Nav'
import { getTemplateById } from '../data/templates'

export function ItineraryPlaceholderPage() {
  const { templateId = '' } = useParams()
  const template = getTemplateById(templateId)

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-content flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
          Plan
        </p>
        <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
          {template?.name ?? templateId}
        </h1>
        <p className="mb-2 font-mono text-sm text-muted">{templateId}</p>
        <p className="mb-8 max-w-[36ch] text-muted">Itinerary view — coming next.</p>
        <Link to="/plan/templates" className="btn-outline">
          Back to journeys
        </Link>
      </main>
    </>
  )
}
