import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ExplorePage } from './pages/ExplorePage'
import { PlanForkPage } from './pages/PlanForkPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { ItineraryPlaceholderPage } from './pages/ItineraryPlaceholderPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { WhyVietnamPage } from './pages/WhyVietnam'
import { WhenToGoPage } from './pages/WhenToGo'
import { WhenToGoDiscoverPage } from './pages/WhenToGoDiscover'
import { HappenDetailPlaceholder } from './pages/WhenToGoDiscover/HappenDetailPlaceholder'
import { TasteOfVietnamPage } from './pages/TasteOfVietnam'
import { BringHomePage } from './pages/BringHome'
import { ArrivalTransfersPage } from './pages/ArrivalTransfers'
import { GettingAroundPage } from './pages/GettingAround'
import { WhereToStayPage } from './pages/WhereToStay'
import { VietnamLogisticsPage } from './pages/VietnamLogistics'
import { ExperienceDetailPage } from './pages/ExperienceDetailPage'
import {
  PlanBuilderIndexRedirect,
  PlanBuilderLayout,
} from './pages/PlanBuilder'
import { ThingsToDo } from './pages/PlanBuilder/stages/ThingsToDo'
import { ThingsToDoByCity } from './pages/PlanBuilder/stages/ThingsToDoByCity'
import { FinalItinerary } from './pages/PlanBuilder/stages/FinalItinerary'
import {
  PipelineWhenToGo,
  PipelineStay,
  PipelineTransport,
  PipelineEat,
  PipelineShopping,
  PipelineAirport,
  PipelineLogistics,
} from './pages/PlanBuilder/stages/PipelinePages'
import { BuilderExperienceDetailPage } from './pages/PlanBuilder/stages/BuilderExperienceDetailPage'
import { BuilderActivityDetailPage } from './pages/PlanBuilder/stages/BuilderActivityDetailPage'
import { StayComparePage } from './pages/PlanBuilder/stages/StayComparePage'
import { SmoothPageTransition } from './components/transitions/SmoothPageTransition'
import { PIPELINE_START } from './pages/PlanBuilder/steps'

export default function App() {
  return (
    <SmoothPageTransition>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/culture" element={<ComingSoonPage title="Culture" />} />
        <Route path="/explore/history" element={<ComingSoonPage title="History" />} />
        <Route path="/explore/nature" element={<ComingSoonPage title="Nature" />} />
        <Route path="/why-vietnam" element={<WhyVietnamPage />} />
        <Route path="/why-vietnam/gallery" element={<ComingSoonPage title="Image Gallery" />} />
        <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
        <Route path="/when-to-go" element={<WhenToGoPage />} />
        <Route path="/when-to-go/discover" element={<WhenToGoDiscoverPage />} />
        <Route path="/when-to-go/discover/happen/:id" element={<HappenDetailPlaceholder />} />
        <Route path="/know-before-you-go" element={<Navigate to="/plan/builder/logistics" replace />} />
        <Route path="/see-and-do" element={<ComingSoonPage title="See & Do" />} />
        <Route path="/taste-of-vietnam" element={<TasteOfVietnamPage />} />
        <Route
          path="/taste-of-vietnam/restaurants"
          element={<ComingSoonPage title="Restaurants" />}
        />
        <Route path="/getting-around" element={<GettingAroundPage />} />
        <Route path="/where-to-stay" element={<WhereToStayPage />} />
        <Route path="/vietnam-logistics" element={<VietnamLogisticsPage />} />
        <Route path="/airport-transfers" element={<ArrivalTransfersPage />} />
        <Route path="/bring-home" element={<BringHomePage />} />
        <Route path="/plan" element={<PlanForkPage />} />
        <Route path="/plan/intro" element={<Navigate to={PIPELINE_START} replace />} />
        <Route path="/plan/templates" element={<TemplatesPage />} />
        <Route path="/plan/itinerary/:templateId" element={<ItineraryPlaceholderPage />} />

        <Route path="/plan/builder" element={<PlanBuilderLayout />}>
          <Route index element={<PlanBuilderIndexRedirect />} />
          <Route path="when-to-go" element={<PipelineWhenToGo />} />
          <Route path="experiences" element={<ThingsToDo />} />
          <Route path="activities" element={<ThingsToDoByCity />} />
          <Route path="experiences-city" element={<Navigate to="/plan/builder/activities" replace />} />
          <Route path="stay" element={<PipelineStay />} />
          <Route path="transport" element={<PipelineTransport />} />
          <Route path="eat" element={<PipelineEat />} />
          <Route path="shopping" element={<PipelineShopping />} />
          <Route path="airport" element={<PipelineAirport />} />
          <Route path="logistics" element={<PipelineLogistics />} />
          <Route path="itinerary" element={<FinalItinerary />} />
          {/* Legacy redirects */}
          <Route path="basics" element={<Navigate to="/plan/builder/when-to-go" replace />} />
          <Route path="know-before" element={<Navigate to="/plan/builder/logistics" replace />} />
        </Route>

        <Route
          path="/plan/builder/experience/:id"
          element={<BuilderExperienceDetailPage />}
        />
        <Route
          path="/plan/builder/activity/:id"
          element={<BuilderActivityDetailPage />}
        />
        <Route path="/plan/builder/stay/compare" element={<StayComparePage />} />
      </Routes>
    </SmoothPageTransition>
  )
}
