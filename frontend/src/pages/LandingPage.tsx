import { LandingSidebar } from '../components/landing/LandingSidebar'
import { Hero } from '../components/landing/Hero'
import { Footer } from '../components/landing/Footer'

export function LandingPage() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <LandingSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Hero />
        </div>
      </div>
      <Footer />
    </>
  )
}
