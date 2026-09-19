import { useEffect, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import type { TravelProfile } from './data/types'
import { useExchangeRates } from './lib/useExchangeRates'
import { LogisticsHero } from './components/LogisticsHero'
import { SectionNav } from './components/SectionNav'
import { VisaSection } from './components/VisaSection'
import { SimSection } from './components/SimSection'
import { MoneySection } from './components/MoneySection'
import { CostsSection } from './components/CostsSection'
import { InsuranceSection } from './components/InsuranceSection'

const DEFAULT_PROFILE: TravelProfile = {
  originCountryCode: 'IN',
  tripLength: null,
  travellerType: null,
  arrivalDate: null,
}

export function VietnamLogisticsPage({ embedded = false }: { embedded?: boolean }) {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_PROFILE)
  const { rates, status } = useExchangeRates()

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [])

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] pb-16 pt-6">
        <LogisticsHero />
        <SectionNav />

        <div className="mt-8 space-y-10">
          <VisaSection
            originCountryCode={profile.originCountryCode}
            onOriginChange={(code) =>
              setProfile((p) => ({ ...p, originCountryCode: code }))
            }
            tripLength={profile.tripLength}
          />
          <div className="h-px bg-ink/10" aria-hidden />
          <SimSection
            tripLength={profile.tripLength}
            arrivalDate={profile.arrivalDate}
          />
          <div className="h-px bg-ink/10" aria-hidden />
          <MoneySection fx={rates} fxStatus={status} />
          <div className="h-px bg-ink/10" aria-hidden />
          <CostsSection
            fx={rates}
            travellerType={profile.travellerType}
          />
          <div className="h-px bg-ink/10" aria-hidden />
          <InsuranceSection />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
