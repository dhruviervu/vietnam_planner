import { LandingSidebar } from '../components/landing/LandingSidebar'
import { FeatureStrip } from '../components/landing/FeatureStrip'
import { Hero } from '../components/landing/Hero'
import { Footer } from '../components/landing/Footer'

export function LandingPage() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <LandingSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <FeatureStrip />
          <Hero />
        </div>
      </div>
      <Footer />
    </>
  )
}
