import { useEffect, useState } from 'react'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { GuideModuleCards } from './components/GuideModuleCards'
import { ModeMatrix } from './components/ModeMatrix'
import { ModeDeepDives } from './components/ModeDeepDives'
import { TravelPractices } from './components/TravelPractices'
import { scrollToAnchor } from './components/WorldNav'

export function GettingAroundPage({ embedded = false }: { embedded?: boolean }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    const map: Record<string, string> = {
      'world-urban': 'dive-urban',
      'world-long': 'dive-train',
      'world-water': 'dive-water',
      'before-you-travel': 'guide-practices',
    }
    const target = map[hash] ?? (hash || '')
    if (!target) return
    window.setTimeout(() => scrollToAnchor(target), 80)
  }, [])

  const page = (
    <>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <GuideModuleCards />
        <div className="mt-16 space-y-20">
          <ModeMatrix />
          <ModeDeepDives
            selectedOptionId={selectedOptionId}
            onSelectOption={(id) => setSelectedOptionId((prev) => (prev === id ? null : id))}
          />
          <TravelPractices />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )

  if (embedded) return page
  return (
    <BuilderProgressChrome current="transport" withNav>
      {page}
    </BuilderProgressChrome>
  )
}
