import { useEffect, useMemo, useState } from 'react'
import { Footer } from '../../components/landing/Footer'
import { BuilderProgressChrome } from '../PlanBuilder/components/BuilderProgressChrome'
import { getStayCity, STAY_CITIES } from './data/cities'
import { getClustersForCity } from './data/clusters'
import { rankClusters } from './data/ranking'
import { NEIGHBOURHOOD_INTROS } from './data/neighbourhoodIntros'
import type { StayCityId } from './data/types'
import { prefetchNeighbourhoodIntel } from './services/neighbourhoodIntel'
import { StayHero } from './components/StayHero'
import { ClusterMap } from './components/ClusterMap'
import { NeighbourhoodCard } from './components/NeighbourhoodCard'
import { HotelExplorer } from './components/HotelExplorer'
import { CitySwitchBar } from './components/CitySwitchBar'

const DEFAULT_CITY: StayCityId = 'hanoi'

export function WhereToStayPage({ embedded = false }: { embedded?: boolean }) {
  const [cityId, setCityId] = useState<StayCityId>(DEFAULT_CITY)
  const [clusterId, setClusterId] = useState(getStayCity(DEFAULT_CITY).defaultClusterId)

  useEffect(() => {
    setClusterId(getStayCity(cityId).defaultClusterId)
  }, [cityId])

  const city = getStayCity(cityId)
  const clusters = useMemo(() => getClustersForCity(cityId), [cityId])
  const ranked = useMemo(() => rankClusters(clusters, []), [clusters])

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
    prefetchNeighbourhoodIntel(id)
    const from = embedded ? '?from=pipeline' : ''
    window.open(`/where-to-stay/neighbourhood/${id}${from}`, '_blank', 'noopener,noreferrer')
  }

  const page = (
    <>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-6 pb-20">
        <StayHero />

        <div className="mt-6">
          <CitySwitchBar cities={STAY_CITIES} cityId={cityId} onChange={setCityId} />
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
            catalogScope="all"
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
