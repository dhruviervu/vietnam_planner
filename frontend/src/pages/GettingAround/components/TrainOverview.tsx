import { ContentImage } from '../../../components/shared/ContentImage'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'
import { SEAT61_GUIDE, TRAIN_IN_DEPTH_PATH, wikiFile } from '../data/trainGuide'

export function TrainOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-paper shadow-soft ring-1 ring-ink/8">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-7 sm:p-9">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
            Why the train
          </p>
          <h3 className="mt-2 font-serif text-[1.7rem] font-semibold leading-tight text-ink">
            Use rails when the window is the point — not when the clock is.
          </h3>
          <div className="mt-4 space-y-3 text-[1.02rem] leading-relaxed text-ink/80">
            <p>
              Vietnam’s north–south line is slow, cheap relative to flying, and lands you in city-centre
              stations. The stretch people actually remember is Hue to Da Nang: Hai Van Pass, lagoon, then
              the South China Sea. Sit left Hanoi to Saigon (Ho Chi Minh City) on that segment (right coming
              north). Overnight Hanoi to Hue/Da Nang or Saigon (Ho Chi Minh City) to Nha Trang replaces a
              hotel with a lockable four-berth soft sleeper.
            </p>
            <p>
              Skip the train for Phu Quoc, Ha Giang, and Hoi An itself (rail stops at Da Nang). Sapa needs
              the Hanoi to Lao Cai overnight, then a road transfer. A Hanoi–Saigon (Ho Chi Minh City) sleeper
              is 32–36 hours — a flight is the honest choice if you only have the days.
            </p>
          </div>
          <ul className="mt-5 grid gap-2 text-[0.92rem] text-ink/75 sm:grid-cols-2">
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Daylight Hue–Danang for Hai Van</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Soft sleeper (K4) overnight default</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">Book 60–90 days for long sleepers</li>
            <li className="rounded-2xl bg-cream/80 px-3.5 py-3">No rails to islands or Ha Giang</li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={TRAIN_IN_DEPTH_PATH}
              className="btn-solid"
              onClick={(e) => openDetailHref(TRAIN_IN_DEPTH_PATH, e)}
            >
              See in depth
            </a>
            <a
              href={SEAT61_GUIDE}
              target="_blank"
              rel="noreferrer"
              className="text-[0.88rem] font-semibold text-terracotta underline-offset-4 hover:underline"
            >
              Seat 61 Vietnam guide
            </a>
          </div>
        </div>
        <div className="relative min-h-[280px]">
          <ContentImage
            src={wikiFile('Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg')}
            alt="North–South Railway on Hai Van Pass"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-5 pb-4 pt-16 text-[0.8rem] font-medium text-white">
            Hai Van Pass — the view the timetable is built around
          </p>
        </div>
      </div>
    </div>
  )
}
