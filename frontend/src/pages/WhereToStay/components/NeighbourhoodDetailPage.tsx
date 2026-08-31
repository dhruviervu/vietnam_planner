import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components/landing/Footer'
import { getClusterById, getClustersForCity } from '../data/clusters'
import { getStayCity } from '../data/cities'
import { getClusterDescription } from '../data/clusterDescriptions'
import { getClusterEssayBlocks } from '../data/clusterEssay'
import { costLevelLabel } from '../data/ranking'
import { HotelExplorer } from './HotelExplorer'
import { BuilderProgressChrome } from '../../PlanBuilder/components/BuilderProgressChrome'

const ESSAY_EMOJI: Record<string, string> = {
  History: '📜',
  Architecture: '🏛️',
  Sights: '📍',
  'Practical tips': '💡',
}

const PARA_EMOJI = ['✨', '🌿', '🕯️', '🧭']

export function NeighbourhoodDetailPage() {
  const { clusterId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const fromPipeline = searchParams.get('from') === 'pipeline'
  const cluster = getClusterById(clusterId)
  const city = cluster ? getStayCity(cluster.cityId) : null
  const photo = cluster ? getClusterDescription(cluster.id).image : null
  const essayBlocks = cluster ? getClusterEssayBlocks(cluster) : []
  const clusters = city ? getClustersForCity(city.id) : []
  const backTo = fromPipeline ? '/plan/builder/stay' : '/where-to-stay'

  if (!cluster || !city) {
    return (
      <BuilderProgressChrome current="stay" withNav>
        <main className="mx-auto max-w-[720px] px-5 py-16 text-center">
          <h1 className="font-serif text-2xl text-ink">Neighbourhood not found</h1>
          <Link to="/where-to-stay" className="mt-4 inline-block font-bold text-terracotta">
            Back to Where to stay
          </Link>
        </main>
        <Footer />
      </BuilderProgressChrome>
    )
  }

  const range = cluster.typicalNightlyRange

  return (
    <BuilderProgressChrome current="stay" withNav>
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-6 pb-20">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta">
          {city.label} · Neighbourhood
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold leading-tight text-ink">
          {cluster.name}
        </h1>
        <p className="mt-1 text-[0.88rem] font-semibold text-muted">
          {costLevelLabel(cluster.costLevel)}
          {range ? ` · typical ~$${range[0]}–$${range[1]} / night` : ''}
        </p>
        {photo ? (
          <img
            src={photo}
            alt=""
            className="mt-5 h-[min(42vw,280px)] w-full rounded-[18px] object-cover shadow-soft"
          />
        ) : null}

        <section className="mt-8 w-full space-y-8">
          {essayBlocks.map((block) => (
            <article key={block.title} className="w-full">
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                {ESSAY_EMOJI[block.title] ?? '✦'} {block.title}
              </h2>
              {block.paragraphs.map((paragraph, i) => (
                <p
                  key={paragraph.slice(0, 56)}
                  className="mt-3 text-[1.05rem] leading-[1.85] text-ink/90"
                >
                  <span aria-hidden>{PARA_EMOJI[i % PARA_EMOJI.length]} </span>
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </section>

        <div className="mt-10">
          <HotelExplorer
            cityId={city.id}
            cityLabel={city.label}
            clusters={clusters}
            lockClusterId={cluster.id}
            catalogFooter={
              <div className="mt-10 flex justify-center">
                <Link
                  to={backTo}
                  className="rounded-full bg-ink px-5 py-2.5 text-[0.8rem] font-bold text-paper hover:bg-ink/90"
                >
                  Back to Where to stay
                </Link>
              </div>
            }
          />
        </div>
      </main>
      <Footer />
    </BuilderProgressChrome>
  )
}
