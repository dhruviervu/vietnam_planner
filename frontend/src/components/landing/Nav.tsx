import { Link, useLocation } from 'react-router-dom'
import { CartBadge } from '../nav/CartBadge'
import { PIPELINE_START } from '../../pages/PlanBuilder/steps'
import { useTripStore } from '../../store/tripStore'

type Props = {
  mode?: 'default' | 'builder'
}

const TOP_LINKS = [
  { to: '/why-vietnam', label: 'Why Vietnam' },
  { to: '/when-to-go/discover', label: 'When to go' },
  { to: '/explore', label: 'Explore' },
] as const

export function Nav({ mode = 'default' }: Props) {
  const location = useLocation()
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const exitItineraryPipeline = useTripStore((s) => s.exitItineraryPipeline)
  const inBuilder =
    mode === 'builder' || location.pathname.startsWith('/plan/builder')

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 bg-cream px-[clamp(1.1rem,4vw,2.5rem)] shadow-nav">
      <div className="flex min-w-0 items-center gap-6">
        <Link
          to="/"
          onClick={() => exitItineraryPipeline()}
          className="shrink-0 font-serif text-[1.15rem] font-semibold text-terracotta-deep"
        >
          Vietnam, Curated
        </Link>

        {!inBuilder && (
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {TOP_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => exitItineraryPipeline()}
                className={`rounded-full px-3 py-2 text-[0.82rem] font-bold transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? 'bg-paper text-ink shadow-soft'
                    : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {inBuilder ? (
        <div className="flex items-center gap-2">
          <Link
            to="/"
            onClick={() => exitItineraryPipeline()}
            className="rounded-full px-3 py-2 text-[0.78rem] font-bold text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            Home
          </Link>
          <Link
            to="/plan/builder/itinerary"
            className="rounded-full bg-ink px-3.5 py-2 text-[0.78rem] font-bold text-paper"
          >
            Your Vietnam
          </Link>
        </div>
      ) : (
        <div className="relative flex shrink-0 items-center gap-2">
          <Link
            to={PIPELINE_START}
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="btn-build-itinerary inline-flex items-center gap-2 rounded-full px-[1.35rem] py-[0.7rem] text-[0.88rem] font-bold text-paper"
          >
            <span className="btn-build-itinerary__shine" aria-hidden />
            <span className="relative z-[1]">Build itinerary</span>
          </Link>
          <CartBadge />
        </div>
      )}
    </header>
  )
}
