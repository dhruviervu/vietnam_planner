import { Nav } from '../../components/landing/Nav'
import { FeatureStrip, type FeatureKey } from '../../components/landing/FeatureStrip'
import { Footer } from '../../components/landing/Footer'
import { Hero } from './Hero'
import { ActivitiesSlideshow } from './ActivitiesSlideshow'
import { BucketList } from './BucketList'
import { ValueComparison } from './ValueComparison'
import { Reviews } from './Reviews'
import { FinalCTA } from './FinalCTA'

const WHY_VIETNAM_ORDER: FeatureKey[] = [
  'see-and-do',
  'taste-of-vietnam',
  'when-to-go',
  'getting-around',
  'know-before-you-go',
  'bring-home',
]

export function WhyVietnamPage() {
  return (
    <>
      <Nav />
      <FeatureStrip order={WHY_VIETNAM_ORDER} />
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
