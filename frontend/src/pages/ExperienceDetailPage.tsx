import { Link, useParams } from 'react-router-dom'
import { Nav } from '../components/landing/Nav'
import { useTripStore } from '../store/tripStore'

export function ExperienceDetailPage() {
  const { slug = '' } = useParams()
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-content flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
          Experience
        </p>
        <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
          Experience detail — coming soon
        </h1>
        <p className="mb-2 font-mono text-sm text-muted">{slug}</p>
        <p className="mb-8 max-w-[36ch] text-muted">
          Full experience pages will live here. For now, this is a placeholder route.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/why-vietnam" className="btn-outline">
            Back to Why Vietnam
          </Link>
          <Link
            to="/plan/builder/when-to-go"
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="btn-solid"
          >
            Build My Itinerary
          </Link>
        </div>
      </main>
    </>
  )
}
