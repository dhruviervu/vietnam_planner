import { ContentImage } from '../../../components/shared/ContentImage'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'
import { FLIGHT_IN_DEPTH_PATH, FLIGHT_PHOTOS } from '../data/flightGuide'

export function FlightOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Why fly
          </p>
          <h3 className="mt-2 font-serif text-[1.7rem] font-semibold leading-tight text-ink">
            Use the air when two hours in a seat beats thirty on the ground.
          </h3>
          <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink/80">
            <p>
              Domestic flights are the honest long-haul. Hanoi to Saigon (Ho Chi Minh City) is about two
              hours in the air; door-to-door is closer to four once you add airport process and two city
              transfers. VietJet is the cheap headline; Vietnam Airlines is the calmer bag-included fare.
              Compare the same luggage, not the first number on the search page.
            </p>
            <p>
              Fly to Phu Quoc, Con Dao, Da Lat, and Nha Trang when you will not spend a day on the bus.
              Skip the plane for Hue–Da Nang (train), Hoi An (Da Nang plus a taxi), and anything without a
              useful runway — Sapa, Ha Giang, Ninh Binh.
            </p>
          </div>
          <ul className="mt-5 grid gap-2 text-[0.92rem] text-ink/75 sm:grid-cols-2">
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Hanoi–Saigon (Ho Chi Minh City) in ~2 h air</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Door-to-door usually 3.5–5 hours</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Add the hold bag on VietJet at checkout</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">No airport for Hoi An, Sapa, or Ha Giang</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={FLIGHT_IN_DEPTH_PATH}
              className="btn-solid"
              onClick={(e) => openDetailHref(FLIGHT_IN_DEPTH_PATH, e)}
            >
              See in depth
            </a>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <ContentImage
            src={FLIGHT_PHOTOS.noiBai}
            alt="VietJet aircraft at Noi Bai International Airport, Hanoi"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-5 pb-4 pt-16 text-[0.8rem] font-medium text-white">
            Noi Bai, Hanoi — the northern hub, not a city-centre station
          </p>
        </div>
      </div>
    </div>
  )
}
