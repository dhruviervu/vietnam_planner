import { ContentImage } from '../../../components/shared/ContentImage'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'
import { WATER_IN_DEPTH_PATH, WATER_PHOTOS } from '../data/waterGuide'

export function WaterOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Why the water
          </p>
          <h3 className="mt-2 font-serif text-[1.7rem] font-semibold leading-tight text-ink">
            Three jobs: a ferry, a cruise, or a river. Do not mix them up.
          </h3>
          <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink/80">
            <p>
              Boats are how you finish a map that has no bridge — Phu Quoc, Con Dao, Cat Ba — or how you
              sleep on Ha Long Bay. Taxi or scooter only as far as the pier. A Ha Long overnight will not
              drop you in Hue. A Tam Coc sampan will not get you to Hanoi.
            </p>
            <p>
              Fly when the island has a useful runway and the clock matters. Keep a hotel night in the
              port town if the last hydrofoil is your only way off. The sea cancels; the van does not.
            </p>
          </div>
          <ul className="mt-5 grid gap-2 text-[0.92rem] text-ink/75 sm:grid-cols-2">
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Ferry = transit to an island</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Cruise = the stay, not a transfer</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">River boats stay inside one landscape</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Weather can cancel the last sailing</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={WATER_IN_DEPTH_PATH}
              className="btn-solid"
              onClick={(e) => openDetailHref(WATER_IN_DEPTH_PATH, e)}
            >
              See in depth
            </a>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <ContentImage
            src={WATER_PHOTOS.haLong}
            alt="Boats on Ha Long Bay"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-5 pb-4 pt-16 text-[0.8rem] font-medium text-white">
            Ha Long Bay — a cruise is a stay, not a ferry to Cat Ba
          </p>
        </div>
      </div>
    </div>
  )
}
