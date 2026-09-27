import { getMode } from '../data/modes'
import { TrainOverview } from './TrainOverview'
import { BusOverview } from './BusOverview'
import { FlightOverview } from './FlightOverview'
import { UrbanOverview } from './UrbanOverview'
import { WaterOverview } from './WaterOverview'

type Props = {
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
}

export function ModeDeepDives(_props: Props) {
  const train = getMode('train')
  const coach = getMode('coach')
  const flight = getMode('flight')

  return (
    <div className="space-y-16">
      {train ? (
        <section id="dive-train" className="scroll-mt-28">
          <SectionKicker index="01" title="Trains" subtitle="Why the Reunification Express — and when it is the wrong tool" />
          <TrainOverview />
        </section>
      ) : null}

      {coach ? (
        <section id="dive-coach" className="scroll-mt-28">
          <SectionKicker index="02" title="Buses" subtitle="The mountain network trains do not reach" />
          <BusOverview />
        </section>
      ) : null}

      {flight ? (
        <section id="dive-flight" className="scroll-mt-28">
          <SectionKicker index="03" title="Domestic flights" subtitle="The spine, plus islands with runways" />
          <FlightOverview />
        </section>
      ) : null}

      <section id="dive-water" className="scroll-mt-28">
        <SectionKicker
          index="04"
          title="Water transport"
          subtitle="A ferry, a cruise, or a river — three jobs, not one"
        />
        <WaterOverview />
      </section>

      <section id="dive-urban" className="scroll-mt-28">
        <SectionKicker
          index="05"
          title="Inside the city"
          subtitle="Walk the old core, Grab the rest, rent only if you are licensed"
        />
        <UrbanOverview />
      </section>
    </div>
  )
}

function SectionKicker({
  index,
  title,
  subtitle,
}: {
  index: string
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-6">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">{index}</p>
      <h2 className="mt-1 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-[0.95rem] text-muted">{subtitle}</p>
    </div>
  )
}
