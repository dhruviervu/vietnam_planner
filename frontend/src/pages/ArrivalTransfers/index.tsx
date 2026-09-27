import { useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getAirport } from './data/catalog'
import type { TransportModeId } from './data/types'
import { TransferWaysIntro } from './components/TransferWaysIntro'
import { ModeDetailSections } from './components/ModeDetailSections'

export function ArrivalTransfersPage({ embedded = false }: { embedded?: boolean }) {
  const [selectedModeId, setSelectedModeId] = useState<TransportModeId | null>(null)
  const airport = getAirport('HAN')!

  function selectMode(id: TransportModeId) {
    setSelectedModeId(id)
    window.requestAnimationFrame(() => {
      document.getElementById(`mode-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <TransferWaysIntro selectedId={selectedModeId} onPick={selectMode} />
        <ModeDetailSections airport={airport} direction="inbound" />
      </main>
      {!embedded && <Footer />}
    </>
  )
}
