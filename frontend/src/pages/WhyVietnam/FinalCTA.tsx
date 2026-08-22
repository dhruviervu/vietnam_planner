import { Link } from 'react-router-dom'
import { useTripStore } from '../../store/tripStore'

export function FinalCTA() {
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)

  return (
    <section className="relative overflow-hidden px-[clamp(1.1rem,4vw,2.5rem)] py-[clamp(4.5rem,9vw,6.5rem)]">
      <img
        src="https://picsum.photos/seed/whyvietnam-cta/1600/900"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="relative z-[1] mx-auto max-w-content text-center">
        <h2 className="mb-6 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-paper [text-shadow:0_2px_20px_rgba(0,0,0,0.35)]">
          Ready to discover Vietnam?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/plan/builder/when-to-go"
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="btn-solid"
          >
            Build My Trip
          </Link>
          <Link
            to="/see-and-do"
            className="btn-pill border-paper/40 bg-transparent text-paper hover:border-paper hover:bg-paper/10"
          >
            Explore Destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
