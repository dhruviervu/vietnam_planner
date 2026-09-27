import { ContentImage } from '../../../components/shared/ContentImage'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'
import { URBAN_IN_DEPTH_PATH, URBAN_PHOTOS } from '../data/urbanGuide'

export function UrbanOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Why the street
          </p>
          <h3 className="mt-2 font-serif text-[1.7rem] font-semibold leading-tight text-ink">
            Walk the old core. Open Grab for the rest. Rent a bike only if you are licensed.
          </h3>
          <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink/80">
            <p>
              Inside the city, trains and coaches are irrelevant. Hanoi Old Quarter, Hoi An, and District 1
              in Saigon (Ho Chi Minh City) are walkable if the next pin is close. GrabCar and GrabBike (or
              Be) are the honest taxi: price on screen, plate on the app. A rental scooter is freedom in
              Hoi An and Da Lat — and a legal and insurance problem if you do not hold a motorcycle licence.
            </p>
            <p>
              Save 113 (police), 115 (ambulance), and 114 (fire) before the first ride. Helmets, meters, and
              a pin on the alley matter more than any metro map.
            </p>
          </div>
          <ul className="mt-5 grid gap-2 text-[0.92rem] text-ink/75 sm:grid-cols-2">
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Walk under ~1.5 km in the old cores</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Grab / Be for cars and bike taxis</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Rent only with a motorcycle licence</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Police 113 · ambulance 115 · fire 114</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={URBAN_IN_DEPTH_PATH}
              className="btn-solid"
              onClick={(e) => openDetailHref(URBAN_IN_DEPTH_PATH, e)}
            >
              See in depth
            </a>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <ContentImage
            src={URBAN_PHOTOS.oldQuarter}
            alt="Street in Hanoi Old Quarter"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-5 pb-4 pt-16 text-[0.8rem] font-medium text-white">
            Hanoi Old Quarter — walk here, Grab when the next pin is across town
          </p>
        </div>
      </div>
    </div>
  )
}
