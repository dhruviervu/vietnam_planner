import { Link, useLocation } from 'react-router-dom'
import { PIPELINE_NAV_GROUPS, PIPELINE_START } from '../../pages/PlanBuilder/steps'
import { useTripStore } from '../../store/tripStore'

const LINK_ACTIVE =
  'flex items-center justify-between rounded-xl px-3 py-2 text-[0.84rem] font-semibold transition-all duration-200 bg-[rgba(243,230,212,0.12)] text-[#f7efe4] shadow-[inset_0_0_0_1px_rgba(243,230,212,0.18)]'

const LINK_IDLE =
  'flex items-center justify-between rounded-xl px-3 py-2 text-[0.84rem] font-semibold transition-all duration-200 text-[#b9a994] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f3e6d4]'

export function LandingSidebar() {
  const location = useLocation()
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const mark = useTripStore((s) => s.markStepVisited)

  return (
    <aside className="landing-sidebar hidden h-full w-[268px] shrink-0 flex-col xl:flex">
      <div className="landing-sidebar__glow" aria-hidden />
      <div className="relative z-[1] flex h-full flex-col px-4 py-5">
        <p className="mb-1 font-serif text-[1.05rem] font-semibold tracking-tight text-[#f3e6d4]">
          TripBuilder
        </p>
        <p className="mb-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#c4a882]">
          Browse Vietnam
        </p>

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {PIPELINE_NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#8a7a68]">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    location.pathname === item.to ||
                    location.pathname.startsWith(item.to + '/')
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        state={{ itineraryPipeline: true }}
                        onClick={() => {
                          enterItineraryPipeline()
                          mark(item.step)
                        }}
                        className={active ? LINK_ACTIVE : LINK_IDLE}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <Link
            to={PIPELINE_START}
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="btn-build-itinerary flex w-full items-center justify-center rounded-full px-4 py-3 text-[0.88rem] font-bold text-paper"
          >
            <span className="btn-build-itinerary__shine" aria-hidden />
            <span className="relative z-[1]">Build itinerary</span>
          </Link>
          <Link
            to="/plan/builder/itinerary"
            state={{ itineraryPipeline: true }}
            onClick={() => enterItineraryPipeline()}
            className="mt-2.5 flex w-full items-center justify-center rounded-full border border-white/15 bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-[0.8rem] font-bold text-[#e8dcc8] transition hover:border-white/25 hover:bg-[rgba(255,255,255,0.08)]"
          >
            Your itinerary
          </Link>
        </div>
      </div>
    </aside>
  )
}
