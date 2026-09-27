import { Suspense, type ReactNode } from 'react'
import { lazyPage } from '../../../lib/lazyPage'
import { PipelineStepShell } from '../components/PipelineStepShell'
import { BuilderStageSkeleton } from '../components/BuilderStageSkeleton'

const WhenToGoDiscoverPage = lazyPage(() => import('../../WhenToGoDiscover'), 'WhenToGoDiscoverPage')
const WhereToStayPage = lazyPage(() => import('../../WhereToStay'), 'WhereToStayPage')
const GettingAroundPage = lazyPage(() => import('../../GettingAround'), 'GettingAroundPage')
const TasteOfVietnamPage = lazyPage(() => import('../../TasteOfVietnam'), 'TasteOfVietnamPage')
const BringHomePage = lazyPage(() => import('../../BringHome'), 'BringHomePage')
const ArrivalTransfersPage = lazyPage(() => import('../../ArrivalTransfers'), 'ArrivalTransfersPage')
const VietnamLogisticsPage = lazyPage(() => import('../../VietnamLogistics'), 'VietnamLogisticsPage')

function Step({ children }: { children: ReactNode }) {
  return <Suspense fallback={<BuilderStageSkeleton />}>{children}</Suspense>
}

export function PipelineWhenToGo() {
  return (
    <PipelineStepShell step="when-to-go" continueLabel="Continue to Attractions →">
      <Step>
        <WhenToGoDiscoverPage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineStay() {
  return (
    <PipelineStepShell step="stay" continueLabel="Continue to Getting Around →">
      <Step>
        <WhereToStayPage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineTransport() {
  return (
    <PipelineStepShell step="transport" continueLabel="Continue to Taste of Vietnam →">
      <Step>
        <GettingAroundPage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineEat() {
  return (
    <PipelineStepShell step="eat" continueLabel="Continue to Shopping →">
      <Step>
        <TasteOfVietnamPage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineShopping() {
  return (
    <PipelineStepShell step="shopping" continueLabel="Continue to Airport Transfers →">
      <Step>
        <BringHomePage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineAirport() {
  return (
    <PipelineStepShell
      step="airport"
      continueLabel="Continue to Know before you go →"
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
      <Step>
        <ArrivalTransfersPage embedded />
      </Step>
    </PipelineStepShell>
  )
}

export function PipelineLogistics() {
  return (
    <PipelineStepShell step="logistics" continueLabel="Review My Trip →">
      <Step>
        <VietnamLogisticsPage embedded />
      </Step>
    </PipelineStepShell>
  )
}
