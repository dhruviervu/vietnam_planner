import { Link } from 'react-router-dom'
import { Nav } from '../components/landing/Nav'
import { useTripStore } from '../store/tripStore'

export function ExplorePage() {
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-content flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-sage">
          Explore
        </p>
        <h1 className="mb-3 font-serif text-[clamp(2rem,4vw,2.8rem)] font-semibold text-ink">
          Coming soon
        </h1>
        <p className="mb-8 max-w-[36ch] text-muted">
          The region catalog will live here. For now, this is a placeholder route.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/plan/builder/when-to-go"
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="btn-solid"
          >
            Just Plan My Trip
          </Link>
          <Link to="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </main>
    </>
  )
}
