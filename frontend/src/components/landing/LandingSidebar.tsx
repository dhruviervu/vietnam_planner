import { Link, useLocation } from 'react-router-dom'
import { PIPELINE_START } from '../../pages/PlanBuilder/steps'
import { useTripStore } from '../../store/tripStore'

type NavItem = { to: string; label: string; hint?: string }

type NavGroup = {
  title: string
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    title: 'Plan',
    items: [
      { to: '/when-to-go/discover', label: 'When to go' },
      { to: '/plan/builder/experiences', label: 'Experiences' },
      { to: '/plan/builder/activities', label: 'Things to do' },
      { to: '/ask', label: 'Ask' },
      { to: '/where-to-stay', label: 'Where to stay' },
      { to: '/getting-around', label: 'Getting around' },
      { to: '/taste-of-vietnam', label: 'Taste of Vietnam' },
      { to: '/bring-home', label: 'Shopping' },
    ],
  },
  {
    title: 'Arrive & prepare',
    items: [
      { to: '/airport-transfers', label: 'Airport transfers', hint: 'Optional' },
      { to: '/vietnam-logistics', label: 'Logistics' },
    ],
  },
]

const LINK_ACTIVE =
  'flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.86rem] font-semibold transition-all duration-200 bg-[rgba(243,230,212,0.12)] text-[#f7efe4] shadow-[inset_0_0_0_1px_rgba(243,230,212,0.18)]'

const LINK_IDLE =
  'flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.86rem] font-semibold transition-all duration-200 text-[#b9a994] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f3e6d4]'

export function LandingSidebar() {
  const location = useLocation()
  const enterItineraryPipeline = useTripStore((s) => s.enterItineraryPipeline)
  const exitItineraryPipeline = useTripStore((s) => s.exitItineraryPipeline)

  return (
    <aside className="landing-sidebar hidden h-full w-[248px] shrink-0 flex-col xl:flex">
      <div className="landing-sidebar__glow" aria-hidden />
      <div className="relative z-[1] flex h-full flex-col px-4 py-5">
        <p className="mb-1 font-serif text-[1.05rem] font-semibold tracking-tight text-[#f3e6d4]">
          Vietnam, Curated
        </p>
        <p className="mb-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#c4a882]">
          Browse Vietnam
        </p>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[#8a7a68]">
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
                        onClick={() => exitItineraryPipeline()}
                        className={active ? LINK_ACTIVE : LINK_IDLE}
                      >
                        <span>{item.label}</span>
                        {item.hint ? (
                          <span className="text-[0.58rem] font-bold uppercase tracking-wide text-[#9a8b74]">
                            {item.hint}
                          </span>
                        ) : null}
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
            onClick={() => exitItineraryPipeline()}
            className="mt-2.5 flex w-full items-center justify-center rounded-full border border-white/15 bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-[0.8rem] font-bold text-[#e8dcc8] transition hover:border-white/25 hover:bg-[rgba(255,255,255,0.08)]"
          >
            Your itinerary
          </Link>
        </div>
      </div>
    </aside>
  )
}
