import { useEffect, useMemo, useState } from 'react'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { useTripStore } from '../../store/tripStore'
import { getStayCity, STAY_CITIES } from './data/cities'
import { getClustersForCity } from './data/clusters'
import { rankClusters } from './data/ranking'
import { NEIGHBOURHOOD_INTROS } from './data/neighbourhoodIntros'
import type { StayCityId } from './data/types'
import {
  collectTripBagStayItems,
  summarizeTripBagCities,
  unmappedBagPlaces,
} from './services/tripBagStayIntelligence'
import { useTripBagStayPins } from './lib/tripBagStayPins'
import { StayHero } from './components/StayHero'
import { ClusterMap } from './components/ClusterMap'
import { NeighbourhoodCard } from './components/NeighbourhoodCard'
import { HotelExplorer } from './components/HotelExplorer'
import { TripBagStayContext } from './components/TripBagStayContext'
import { CitySwitchBar } from './components/CitySwitchBar'

const DEFAULT_CITY: StayCityId = 'hanoi'

export function WhereToStayPage({ embedded = false }: { embedded?: boolean }) {
  const experienceIds = useTripStore((s) => s.selectedExperienceIds)
  const activityIds = useTripStore((s) => s.selectedActivityIds)

  const bagItems = useMemo(
    () => collectTripBagStayItems(experienceIds, activityIds),
    [experienceIds, activityIds],
  )
  const bagCities = useMemo(() => summarizeTripBagCities(bagItems), [bagItems])
  const unmapped = useMemo(() => unmappedBagPlaces(bagItems), [bagItems])
  const bagFiltered = bagItems.length > 0 && bagCities.length > 0

  const visibleCities = useMemo(
    () =>
      bagFiltered
        ? STAY_CITIES.filter((city) => bagCities.some((b) => b.cityId === city.id))
        : STAY_CITIES,
    [bagFiltered, bagCities],
  )

  const initialCity =
    (bagFiltered ? bagCities[0]?.cityId : undefined) ??
    (visibleCities.some((c) => c.id === DEFAULT_CITY) ? DEFAULT_CITY : visibleCities[0]?.id) ??
    DEFAULT_CITY

  const [cityId, setCityId] = useState<StayCityId>(initialCity)
  const [clusterId, setClusterId] = useState(getStayCity(initialCity).defaultClusterId)
  const [catalogScope, setCatalogScope] = useState<'city' | 'all'>('city')

  useEffect(() => {
    if (!visibleCities.some((c) => c.id === cityId)) {
      setCityId(visibleCities[0]?.id ?? DEFAULT_CITY)
    }
  }, [visibleCities, cityId])

  useEffect(() => {
    setClusterId(getStayCity(cityId).defaultClusterId)
  }, [cityId])

  const city = getStayCity(cityId)
  const clusters = useMemo(() => getClustersForCity(cityId), [cityId])
  const ranked = useMemo(() => rankClusters(clusters, []), [clusters])
  const bagPins = useTripBagStayPins(city, bagItems)

  useEffect(() => {
    if (!ranked.some((r) => r.cluster.id === clusterId) && ranked[0]) {
      setClusterId(ranked[0].cluster.id)
    }
  }, [ranked, clusterId])

  function selectCluster(id: string) {
    setClusterId(id)
    window.requestAnimationFrame(() => {
      document.getElementById(`neighbourhood-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function openNeighbourhoodHotels(id: string) {
    const from = embedded ? '?from=pipeline' : ''
    window.open(`/where-to-stay/neighbourhood/${id}${from}`, '_blank', 'noopener,noreferrer')
  }

  function exploreAllStays() {
    setCatalogScope('all')
    window.setTimeout(() => {
      document.getElementById('stay-catalog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
  }

  const page = (
    <>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-6 pb-20">
        <StayHero />

        {bagFiltered ? (
          <div className="mt-4">
            <TripBagStayContext
              cities={bagCities}
              totalBagItems={bagItems.length}
              unmappedLabels={[...new Set(unmapped.map((item) => item.cityLabel))]}
              onExploreAllStays={exploreAllStays}
            />
          </div>
        ) : null}

        <div className="mt-6">
          <CitySwitchBar cities={visibleCities} cityId={cityId} onChange={setCityId} />
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] font-semibold text-ink">
            Neighbourhoods in {city.label}
          </h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <p className="text-[0.92rem] leading-[1.7] text-ink/85">
              {NEIGHBOURHOOD_INTROS[city.id]}
            </p>
            <div className="overflow-hidden rounded-[16px]">
              <ClusterMap
                city={city}
                ranked={ranked}
                selectedId={clusterId}
                onSelect={selectCluster}
                bagPins={bagPins}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {clusters.map((cluster) => (
              <NeighbourhoodCard
                key={cluster.id}
                cluster={cluster}
                selected={cluster.id === clusterId}
                onSelect={() => selectCluster(cluster.id)}
                onOpenHotels={() => openNeighbourhoodHotels(cluster.id)}
              />
            ))}
          </div>
        </section>

        <div className="mt-14">
          <HotelExplorer
            cityId={city.id}
            cityLabel={city.label}
            clusters={clusters}
            catalogScope={catalogScope}
          />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )

  if (embedded) return page
  return (
    <BuilderProgressChrome current="stay" withNav>
      {page}
    </BuilderProgressChrome>
  )
}
