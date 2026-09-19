import type { ReactNode } from 'react'
import { Nav } from '../../../components/landing/Nav'
import { StayProgressPanel } from './StayProgressPanel'
import type { BuilderStepId } from '../types'

type Props = {
  current: BuilderStepId
  children: ReactNode
  /** When false, the page already rendered Nav. */
  withNav?: boolean
}

/** Collapsible itinerary progress rail for pipeline pages and new-tab detail pages. */
export function BuilderProgressChrome({ current, children, withNav = false }: Props) {
  return (
    <>
      {withNav ? <Nav mode="builder" /> : null}
      <aside className="fixed left-0 top-[72px] z-[60] hidden h-[calc(100vh-72px)] md:block">
        <StayProgressPanel current={current} />
      </aside>
      <div className="md:pl-14">{children}</div>
    </>
  )
}
