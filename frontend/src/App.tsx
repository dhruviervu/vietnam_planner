import { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazyPage } from './lib/lazyPage'
import { SmoothPageTransition } from './components/transitions/SmoothPageTransition'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { PIPELINE_START } from './pages/PlanBuilder/steps'

const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage')
const AskPage = lazyPage(() => import('./pages/AskPage'), 'AskPage')
const ExplorePage = lazyPage(() => import('./pages/ExplorePage'), 'ExplorePage')
const PlanForkPage = lazyPage(() => import('./pages/PlanForkPage'), 'PlanForkPage')
const TemplatesPage = lazyPage(() => import('./pages/TemplatesPage'), 'TemplatesPage')
const ItineraryPlaceholderPage = lazyPage(
  () => import('./pages/ItineraryPlaceholderPage'),
  'ItineraryPlaceholderPage',
)
const ComingSoonPage = lazyPage(() => import('./pages/ComingSoonPage'), 'ComingSoonPage')

const ItineraryTemplatesPage = lazyPage(() => import('./pages/ItineraryTemplates'), 'ItineraryTemplatesPage')
const TemplateItineraryPage = lazyPage(
  () => import('./pages/ItineraryTemplates/TemplateItineraryPage'),
  'TemplateItineraryPage',
)
const PackedItinerariesPage = lazyPage(() => import('./pages/PackedItineraries'), 'PackedItinerariesPage')
const PackedItineraryPage = lazyPage(
  () => import('./pages/PackedItineraries/PackedItineraryPage'),
  'PackedItineraryPage',
)

const WhyVietnamPage = lazyPage(() => import('./pages/WhyVietnam'), 'WhyVietnamPage')
const WhenToGoPage = lazyPage(() => import('./pages/WhenToGo'), 'WhenToGoPage')
const WhenToGoDiscoverPage = lazyPage(() => import('./pages/WhenToGoDiscover'), 'WhenToGoDiscoverPage')
const HappenDetailPlaceholder = lazyPage(
  () => import('./pages/WhenToGoDiscover/HappenDetailPlaceholder'),
  'HappenDetailPlaceholder',
)
const SeasonGuidePage = lazyPage(() => import('./pages/WhenToGoDiscover/SeasonGuidePage'), 'SeasonGuidePage')
const EventCityPage = lazyPage(() => import('./pages/WhenToGoDiscover/EventCityPage'), 'EventCityPage')
const EventGuidePage = lazyPage(() => import('./pages/WhenToGoDiscover/EventGuidePage'), 'EventGuidePage')
const EventMonthPage = lazyPage(() => import('./pages/WhenToGoDiscover/EventMonthPage'), 'EventMonthPage')
const EventTagPage = lazyPage(() => import('./pages/WhenToGoDiscover/EventTagPage'), 'EventTagPage')

const TasteOfVietnamPage = lazyPage(() => import('./pages/TasteOfVietnam'), 'TasteOfVietnamPage')
const TasteRecipePage = lazyPage(() => import('./pages/TasteOfVietnam/RecipePage'), 'TasteRecipePage')
const BringHomePage = lazyPage(() => import('./pages/BringHome'), 'BringHomePage')
const ShoppingItemDetailPage = lazyPage(
  () => import('./pages/BringHome/ItemDetailPage'),
  'ShoppingItemDetailPage',
)

const ArrivalTransfersPage = lazyPage(() => import('./pages/ArrivalTransfers'), 'ArrivalTransfersPage')
const TransferProviderPage = lazyPage(
  () => import('./pages/ArrivalTransfers/TransferProviderPage'),
  'TransferProviderPage',
)
const TransferModePage = lazyPage(() => import('./pages/ArrivalTransfers/TransferModePage'), 'TransferModePage')

const GettingAroundPage = lazyPage(() => import('./pages/GettingAround'), 'GettingAroundPage')
const TrainInDepthPage = lazyPage(() => import('./pages/GettingAround/TrainInDepthPage'), 'TrainInDepthPage')
const BusInDepthPage = lazyPage(() => import('./pages/GettingAround/BusInDepthPage'), 'BusInDepthPage')
const FlightInDepthPage = lazyPage(() => import('./pages/GettingAround/FlightInDepthPage'), 'FlightInDepthPage')
const UrbanInDepthPage = lazyPage(() => import('./pages/GettingAround/UrbanInDepthPage'), 'UrbanInDepthPage')
const WaterInDepthPage = lazyPage(() => import('./pages/GettingAround/WaterInDepthPage'), 'WaterInDepthPage')

const WhereToStayPage = lazyPage(() => import('./pages/WhereToStay'), 'WhereToStayPage')
const NeighbourhoodDetailPage = lazyPage(
  () => import('./pages/WhereToStay/components/NeighbourhoodDetailPage'),
  'NeighbourhoodDetailPage',
)
const VietnamLogisticsPage = lazyPage(() => import('./pages/VietnamLogistics'), 'VietnamLogisticsPage')
const ExperienceDetailPage = lazyPage(() => import('./pages/ExperienceDetailPage'), 'ExperienceDetailPage')

const PlanBuilderLayout = lazyPage(() => import('./pages/PlanBuilder'), 'PlanBuilderLayout')
const PlanBuilderIndexRedirect = lazyPage(() => import('./pages/PlanBuilder'), 'PlanBuilderIndexRedirect')
const ThingsToDo = lazyPage(() => import('./pages/PlanBuilder/stages/ThingsToDo'), 'ThingsToDo')
const ThingsToDoByCity = lazyPage(() => import('./pages/PlanBuilder/stages/ThingsToDoByCity'), 'ThingsToDoByCity')
const ExperiencesCityPage = lazyPage(
  () => import('./pages/PlanBuilder/stages/ExperiencesCityPage'),
  'ExperiencesCityPage',
)
const ExperiencesTopPage = lazyPage(
  () => import('./pages/PlanBuilder/stages/ExperiencesTopPage'),
  'ExperiencesTopPage',
)
const ActivitiesCityPage = lazyPage(
  () => import('./pages/PlanBuilder/stages/ActivitiesCityPage'),
  'ActivitiesCityPage',
)
const ActivitiesTopPage = lazyPage(() => import('./pages/PlanBuilder/stages/ActivitiesTopPage'), 'ActivitiesTopPage')
const FinalItinerary = lazyPage(() => import('./pages/PlanBuilder/stages/FinalItinerary'), 'FinalItinerary')
const PipelineWhenToGo = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineWhenToGo')
const PipelineStay = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineStay')
const PipelineTransport = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineTransport')
const PipelineEat = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineEat')
const PipelineShopping = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineShopping')
const PipelineAirport = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineAirport')
const PipelineLogistics = lazyPage(() => import('./pages/PlanBuilder/stages/PipelinePages'), 'PipelineLogistics')
const BuilderExperienceDetailPage = lazyPage(
  () => import('./pages/PlanBuilder/stages/BuilderExperienceDetailPage'),
  'BuilderExperienceDetailPage',
)
const BuilderActivityDetailPage = lazyPage(
  () => import('./pages/PlanBuilder/stages/BuilderActivityDetailPage'),
  'BuilderActivityDetailPage',
)
const StayComparePage = lazyPage(() => import('./pages/PlanBuilder/stages/StayComparePage'), 'StayComparePage')

const SightsTemplatesIndex = lazyPage(() => import('./pages/SightsTemplates'), 'SightsTemplatesIndex')
const QuietRowsPage = lazyPage(() => import('./pages/SightsTemplates/QuietRowsPage'), 'QuietRowsPage')
const SoftGalleryPage = lazyPage(() => import('./pages/SightsTemplates/SoftGalleryPage'), 'SoftGalleryPage')
const CityChaptersPage = lazyPage(() => import('./pages/SightsTemplates/CityChaptersPage'), 'CityChaptersPage')
const LookbookPage = lazyPage(() => import('./pages/SightsTemplates/LookbookPage'), 'LookbookPage')
const JournalPage = lazyPage(() => import('./pages/SightsTemplates/JournalPage'), 'JournalPage')

const MiniAskChat = lazyPage(() => import('./components/ai/MiniAskChat'), 'MiniAskChat')

/** Warm the pages most visitors open next, once the current page is idle. */
const IDLE_PREFETCH = [
  LandingPage,
  MiniAskChat,
  PlanBuilderLayout,
  PipelineWhenToGo,
  WhenToGoDiscoverPage,
  ThingsToDo,
  ExperiencesCityPage,
  BuilderExperienceDetailPage,
]

function useIdlePrefetch() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return
    let cancelled = false
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500) as unknown as number)
    const run = async () => {
      for (const page of IDLE_PREFETCH) {
        if (cancelled) return
        await page.preload().catch(() => {})
      }
    }
    const handle = idle(() => void run(), { timeout: 4000 })
    return () => {
      cancelled = true
      window.cancelIdleCallback?.(handle)
    }
  }, [])
}

export default function App() {
  useIdlePrefetch()
  const { pathname } = useLocation()
  return (
    <SmoothPageTransition>
      <AppErrorBoundary resetKey={pathname}>
      <Suspense fallback={<div className="min-h-screen w-full bg-cream" />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/culture" element={<ComingSoonPage title="Culture" />} />
        <Route path="/explore/history" element={<ComingSoonPage title="History" />} />
        <Route path="/explore/nature" element={<ComingSoonPage title="Nature" />} />
        <Route path="/why-vietnam" element={<WhyVietnamPage />} />
        <Route path="/why-vietnam/gallery" element={<ComingSoonPage title="Image Gallery" />} />
        <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
        <Route path="/when-to-go" element={<WhenToGoPage />} />
        <Route path="/when-to-go/discover" element={<WhenToGoDiscoverPage />} />
        <Route path="/when-to-go/discover/season/:season" element={<SeasonGuidePage />} />
        <Route path="/when-to-go/discover/city/:citySlug" element={<EventCityPage />} />
        <Route path="/when-to-go/discover/event/:id" element={<EventGuidePage />} />
        <Route path="/when-to-go/discover/month/:monthKey" element={<EventMonthPage />} />
        <Route path="/when-to-go/discover/tag/:tagSlug" element={<EventTagPage />} />
        <Route path="/when-to-go/discover/happen/:id" element={<HappenDetailPlaceholder />} />
        <Route path="/know-before-you-go" element={<Navigate to="/plan/builder/logistics" replace />} />
        <Route path="/see-and-do" element={<ComingSoonPage title="See & Do" />} />
        <Route path="/taste-of-vietnam" element={<TasteOfVietnamPage />} />
        <Route path="/taste-of-vietnam/recipe/:dishId" element={<TasteRecipePage />} />
        <Route
          path="/taste-of-vietnam/restaurants"
          element={<ComingSoonPage title="Restaurants" />}
        />
        <Route path="/getting-around" element={<GettingAroundPage />} />
        <Route path="/getting-around/train" element={<TrainInDepthPage />} />
        <Route path="/getting-around/bus" element={<BusInDepthPage />} />
        <Route path="/getting-around/flight" element={<FlightInDepthPage />} />
        <Route path="/getting-around/city" element={<UrbanInDepthPage />} />
        <Route path="/getting-around/water" element={<WaterInDepthPage />} />
        <Route path="/where-to-stay" element={<WhereToStayPage />} />
        <Route
          path="/where-to-stay/neighbourhood/:clusterId"
          element={<NeighbourhoodDetailPage />}
        />
        <Route path="/vietnam-logistics" element={<VietnamLogisticsPage />} />
        <Route path="/airport-transfers" element={<ArrivalTransfersPage />} />
        <Route path="/airport-transfers/mode/:modeId" element={<TransferModePage />} />
        <Route path="/bring-home" element={<BringHomePage />} />
        <Route path="/bring-home/item/:itemId" element={<ShoppingItemDetailPage />} />
        <Route path="/sights-templates" element={<SightsTemplatesIndex />} />
        <Route path="/sights-templates/quiet" element={<QuietRowsPage />} />
        <Route path="/sights-templates/gallery" element={<SoftGalleryPage />} />
        <Route path="/sights-templates/chapters" element={<CityChaptersPage />} />
        <Route path="/sights-templates/lookbook" element={<LookbookPage />} />
        <Route path="/sights-templates/journal" element={<JournalPage />} />
        <Route path="/plan" element={<PlanForkPage />} />
        <Route path="/plan/intro" element={<Navigate to={PIPELINE_START} replace />} />
        <Route path="/plan/templates" element={<TemplatesPage />} />
        <Route path="/plan/itinerary-templates" element={<ItineraryTemplatesPage />} />
        <Route path="/plan/itinerary-templates/:templateId" element={<TemplateItineraryPage />} />
        <Route path="/plan/itinerary-ideas" element={<PackedItinerariesPage />} />
        <Route path="/plan/itinerary-ideas/:templateId" element={<PackedItineraryPage />} />
        <Route path="/plan/itinerary/:templateId" element={<ItineraryPlaceholderPage />} />

        <Route path="/plan/builder" element={<PlanBuilderLayout />}>
          <Route index element={<PlanBuilderIndexRedirect />} />
          <Route path="when-to-go" element={<PipelineWhenToGo />} />
          <Route path="experiences" element={<ThingsToDo />} />
          <Route path="experiences/top" element={<ExperiencesTopPage />} />
          <Route path="experiences/city/:citySlug" element={<ExperiencesCityPage />} />
          <Route path="activities" element={<ThingsToDoByCity />} />
          <Route path="activities/top" element={<ActivitiesTopPage />} />
          <Route path="activities/city/:citySlug" element={<ActivitiesCityPage />} />
          <Route path="experiences-city" element={<Navigate to="/plan/builder/activities" replace />} />
          <Route path="stay" element={<PipelineStay />} />
          <Route path="stay/compare" element={<StayComparePage />} />
          <Route path="transport" element={<PipelineTransport />} />
          <Route path="transport/train" element={<TrainInDepthPage embedded />} />
          <Route path="transport/bus" element={<BusInDepthPage embedded />} />
          <Route path="transport/flight" element={<FlightInDepthPage embedded />} />
          <Route path="transport/city" element={<UrbanInDepthPage embedded />} />
          <Route path="transport/water" element={<WaterInDepthPage embedded />} />
          <Route path="eat" element={<PipelineEat />} />
          <Route path="shopping" element={<PipelineShopping />} />
          <Route path="airport" element={<PipelineAirport />} />
          <Route path="airport/provider/:providerId" element={<TransferProviderPage />} />
          <Route path="airport/mode/:modeId" element={<TransferModePage />} />
          <Route path="logistics" element={<PipelineLogistics />} />
          <Route path="itinerary" element={<FinalItinerary />} />
          <Route path="experience/:id" element={<BuilderExperienceDetailPage />} />
          <Route path="activity/:id" element={<BuilderActivityDetailPage />} />
          {/* Legacy redirects */}
          <Route path="basics" element={<Navigate to="/plan/builder/when-to-go" replace />} />
          <Route path="know-before" element={<Navigate to="/plan/builder/logistics" replace />} />
          <Route path="*" element={<Navigate to={PIPELINE_START} replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AskHost />
      </Suspense>
      </AppErrorBoundary>
    </SmoothPageTransition>
  )
}

function AskHost() {
  const loc = useLocation()
  if (loc.pathname === '/ask' || loc.pathname === '/') return null
  return (
    <Suspense fallback={null}>
      <MiniAskChat />
    </Suspense>
  )
}
