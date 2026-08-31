import { PipelineStepShell } from '../components/PipelineStepShell'
import { WhenToGoDiscoverPage } from '../../WhenToGoDiscover'
import { WhereToStayPage } from '../../WhereToStay'
import { GettingAroundPage } from '../../GettingAround'
import { TasteOfVietnamPage } from '../../TasteOfVietnam'
import { BringHomePage } from '../../BringHome'
import { ArrivalTransfersPage } from '../../ArrivalTransfers'
import { VietnamLogisticsPage } from '../../VietnamLogistics'

export function PipelineWhenToGo() {
  return (
    <PipelineStepShell step="when-to-go" continueLabel="Continue to Experiences →" hideSkip>
      <WhenToGoDiscoverPage embedded />
    </PipelineStepShell>
  )
}

export function PipelineStay() {
  return (
    <PipelineStepShell step="stay" continueLabel="Continue to Getting Around →">
      <WhereToStayPage embedded />
    </PipelineStepShell>
  )
}

export function PipelineTransport() {
  return (
    <PipelineStepShell step="transport" continueLabel="Continue to Taste of Vietnam →">
      <GettingAroundPage embedded />
    </PipelineStepShell>
  )
}

export function PipelineEat() {
  return (
    <PipelineStepShell step="eat" continueLabel="Continue to Shopping →">
      <TasteOfVietnamPage embedded />
    </PipelineStepShell>
  )
}

export function PipelineShopping() {
  return (
    <PipelineStepShell step="shopping" continueLabel="Continue to Airport Transfers →">
      <BringHomePage embedded />
    </PipelineStepShell>
  )
}

export function PipelineAirport() {
  return (
    <PipelineStepShell
      step="airport"
      continueLabel="Continue to Logistics →"
      secondaryLabel="Skip for now — I’ll handle airports later"
      note={
        <div className="rounded-[20px] border border-sage/30 bg-sage/8 px-5 py-4">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-sage">
            Optional step
          </p>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-ink">
            Haven&apos;t locked airports yet? That&apos;s fine. Skip this step and come back
            anytime — airport transfers can be planned after the rest of your trip takes shape.
          </p>
        </div>
      }
    >
      <ArrivalTransfersPage embedded />
    </PipelineStepShell>
  )
}

export function PipelineLogistics() {
  return (
    <PipelineStepShell step="logistics" continueLabel="Review My Trip →">
      <VietnamLogisticsPage embedded />
    </PipelineStepShell>
  )
}
