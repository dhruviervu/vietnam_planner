import { ContentImage } from '../../../components/shared/ContentImage'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'
import { BUS_IN_DEPTH_PATH, BUS_PHOTOS } from '../data/busGuide'

export function BusOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Why the bus
          </p>
          <h3 className="mt-2 font-serif text-[1.7rem] font-semibold leading-tight text-ink">
            Use coaches and vans for the map the railway never drew.
          </h3>
          <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink/80">
            <p>
              Buses are how most of Vietnam actually moves. Limousine vans cover the 2–5 hour tourist hops
              with hotel-area pickup. Overnight sleepers are the cheap bed to Sapa, Ha Giang, Da Lat, and
              Nha Trang when you will not pay for a flight. Terminals are often outside the centre — the
              ticket is not door-to-door unless the operator says van pickup.
            </p>
            <p>
              Skip the bus for Hanoi to Ho Chi Minh City (fly) and for Hai Van Pass (take the train). Read
              the class: “limousine” is a seat; “sleeper” is a bunk, and VIP is still shorter than a train
              soft sleeper if you are tall.
            </p>
          </div>
          <ul className="mt-5 grid gap-2 text-[0.92rem] text-ink/75 sm:grid-cols-2">
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Limousine vans on 2–5 hour hops</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Sleepers for Sapa, Ha Giang, Da Lat</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Check the actual terminal, not “Hanoi”</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">No bus beats a flight on the full spine</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={BUS_IN_DEPTH_PATH}
              className="btn-solid"
              onClick={(e) => openDetailHref(BUS_IN_DEPTH_PATH, e)}
            >
              See in depth
            </a>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <ContentImage
            src={BUS_PHOTOS.exterior}
            alt="Sleeper bus at a Ho Chi Minh City terminal"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-5 pb-4 pt-16 text-[0.8rem] font-medium text-white">
            Long-haul sleeper at Mien Tay — the yard, not a hotel driveway
          </p>
        </div>
      </div>
    </div>
  )
}
