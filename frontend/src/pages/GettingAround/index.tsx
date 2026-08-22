import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { GettingAroundHero } from './components/GettingAroundHero'
import { WorldNav } from './components/WorldNav'
import { LongDistanceWorld } from './components/LongDistanceWorld'
import { UrbanWorld } from './components/UrbanWorld'
import { WaterWorld } from './components/WaterWorld'
import { ExploreByStyle } from './components/ExploreByStyle'
import { BeforeYouTravel } from './components/BeforeYouTravel'

export function GettingAroundPage({ embedded = false }: { embedded?: boolean }) {
  const [activeWorld, setActiveWorld] = useState<'long-distance' | 'urban' | 'water'>(
    'long-distance',
  )
  const [activeLong, setActiveLong] = useState<string | null>('flight')
  const [activeUrban, setActiveUrban] = useState<string | null>('car-taxi')
  const [activeWater, setActiveWater] = useState<string | null>('ferry')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  useEffect(() => {
    const sections = [
      { id: 'world-long', key: 'long-distance' as const },
      { id: 'world-urban', key: 'urban' as const },
      { id: 'world-water', key: 'water' as const },
    ]
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const match = sections.find((s) => s.id === visible.target.id)
        if (match) setActiveWorld(match.key)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  function selectOption(id: string) {
    setSelectedOptionId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <GettingAroundHero />
        <WorldNav active={activeWorld} onActive={setActiveWorld} />

        <div className="mt-14 space-y-20">
          <LongDistanceWorld
            activeModeId={activeLong}
            onActiveMode={setActiveLong}
            selectedOptionId={selectedOptionId}
            onSelectOption={selectOption}
          />

          <UrbanWorld
            activeModeId={activeUrban}
            onActiveMode={setActiveUrban}
            selectedOptionId={selectedOptionId}
            onSelectOption={selectOption}
          />

          <WaterWorld
            activeModeId={activeWater}
            onActiveMode={setActiveWater}
            selectedOptionId={selectedOptionId}
            onSelectOption={selectOption}
          />

          <ExploreByStyle />
          <BeforeYouTravel />

          <p className="text-[0.8rem] font-medium text-muted">
            Airport ↔ city transfers live in a dedicated logistics layer —{' '}
            <Link to="/plan/builder/airport" className="font-bold text-terracotta hover:underline">
              Airport Transfers
            </Link>
            .
          </p>
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
