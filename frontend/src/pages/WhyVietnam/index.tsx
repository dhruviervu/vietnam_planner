import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { Hero } from './Hero'
import { ActivitiesSlideshow } from './ActivitiesSlideshow'
import { BucketList } from './BucketList'
import { ValueComparison } from './ValueComparison'
import { Reviews } from './Reviews'
import { FinalCTA } from './FinalCTA'

export function WhyVietnamPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ActivitiesSlideshow />
        <BucketList />
        <ValueComparison />
        <Reviews />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
