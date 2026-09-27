import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Footer } from '../../../components/landing/Footer'
import { getClusterById, getClustersForCity } from '../data/clusters'
import { getStayCity } from '../data/cities'
import { getClusterDescription } from '../data/clusterDescriptions'
import { getClusterEssayBlocks } from '../data/clusterEssay'
import { getNeighbourhoodGuide } from '../data/neighbourhoodGuides'
import { costLevelLabel } from '../data/ranking'
import {
  loadNeighbourhoodIntel,
  type NeighbourhoodIntel,
} from '../services/neighbourhoodIntel'
import { HotelExplorer } from './HotelExplorer'
import { BuilderProgressChrome } from '../../PlanBuilder/components/BuilderProgressChrome'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'

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
  const guide = cluster ? getNeighbourhoodGuide(cluster.id) : null
  const clusters = city ? getClustersForCity(city.id) : []
  const backTo = fromPipeline ? '/plan/builder/stay' : '/where-to-stay'
  const [intel, setIntel] = useState<NeighbourhoodIntel | null>(null)

  useEffect(() => {
    if (!cluster) return
    let cancelled = false
    void loadNeighbourhoodIntel(cluster.id).then((next) => {
      if (!cancelled) setIntel(next)
    })
    return () => {
      cancelled = true
    }
  }, [cluster])

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
  const living = cluster.living

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

        {intel ? (
          <section className="mt-8">
            <div className="overflow-hidden rounded-[16px] border border-ink/10 bg-cream">
              <iframe
                title={`Map of ${cluster.name}`}
                src={intel.mapsEmbedUrl}
                className="h-[min(52vw,320px)] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        ) : null}

        {guide ? (
          <section className="mt-8 w-full space-y-8">
            <p className="w-full text-[1.05rem] leading-[1.85] text-ink/90">{guide.intro}</p>

            <article>
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                {guide.gettingAroundTitle}
              </h2>
              <ul className="mt-3 space-y-4">
                {guide.gettingAround.map((tip) => (
                  <li key={tip.title}>
                    <p className="text-[1.02rem] font-bold text-ink">{tip.title}</p>
                    <p className="mt-1 w-full text-[1.05rem] leading-[1.85] text-ink/90">{tip.body}</p>
                  </li>
                ))}
              </ul>
            </article>

            {guide.safety?.length ? (
              <article>
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                  {guide.safetyTitle ?? 'Safety & scams'}
                </h2>
                <ul className="mt-3 space-y-4">
                  {guide.safety.map((tip) => (
                    <li key={tip.title}>
                      <p className="text-[1.02rem] font-bold text-ink">{tip.title}</p>
                      <p className="mt-1 w-full text-[1.05rem] leading-[1.85] text-ink/90">{tip.body}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            <article>
              <h2 className="font-serif text-[1.45rem] font-semibold text-ink">{guide.sightsTitle}</h2>
              <div className="mt-4 space-y-5">
                {guide.sights.map((sight) => (
                  <div
                    key={sight.name}
                    className="overflow-hidden rounded-[14px] border border-ink/10 bg-paper"
                  >
                    <img
                      src={sight.image}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                    <div className="px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-serif text-[1.2rem] font-semibold text-ink">{sight.name}</h3>
                      {sight.experienceId ? (
                        <a
                          href={`/plan/builder/experience/${sight.experienceId}`}
                          className="shrink-0 rounded-full bg-terracotta px-3.5 py-1.5 text-[0.75rem] font-bold text-paper hover:bg-terracotta/90"
                          onClick={(e) =>
                            openDetailHref(`/plan/builder/experience/${sight.experienceId}`, e)
                          }
                        >
            See sight
                        </a>
                      ) : null}
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.98rem] leading-[1.75] text-ink/88">
                      {sight.bullets.map((b) => (
                        <li key={b.slice(0, 48)}>{b}</li>
                      ))}
                    </ul>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {guide.stays.length ? (
              <article>
                <h2 className="font-serif text-[1.45rem] font-semibold text-ink">
                  Top Rated Places to Stay
                </h2>
                <div className="mt-4 space-y-4">
                  {guide.stays.map((stay) => (
                    <div
                      key={stay.stayId}
                      className="overflow-hidden rounded-[14px] border border-ink/10 bg-paper"
                    >
                      <img src={stay.image} alt="" className="h-44 w-full object-cover" />
                      <div className="px-4 py-4">
                      <p className="font-serif text-[1.2rem] font-semibold text-ink">{stay.name}</p>
                      <p className="mt-0.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                        {stay.tier}
                      </p>
                      <p className="mt-2 w-full text-[0.98rem] leading-[1.75] text-ink/88">
                        <span className="font-bold text-ink">Vibe & highlights: </span>
                        {stay.vibe}
                      </p>
                      <a
                        href={stay.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block rounded-full bg-terracotta px-3.5 py-1.5 text-[0.75rem] font-bold text-paper hover:bg-terracotta/90"
                      >
                        Check availability
                      </a>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Crowd', living.crowdLevel],
                ['Safety', living.safetyNote],
                ['Food', living.foodNote],
                ['Markets', living.marketNote],
                ['Nights', living.nightlifeFeel],
                ['Noise', living.noiseNote],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-ink/8 bg-paper px-3.5 py-3">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
                  <p className="mt-1 text-[0.86rem] leading-relaxed text-ink">{value}</p>
                </div>
              ))}
            </section>
            {living.whoItSuits.length ? (
              <p className="mt-3 text-[0.82rem] text-muted">Suits: {living.whoItSuits.join(' · ')}</p>
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
          </>
        )}

        {guide?.stays.length ? (
          <div className="mt-10 flex justify-center">
            <Link
              to={backTo}
              className="rounded-full bg-ink px-5 py-2.5 text-[0.8rem] font-bold text-paper hover:bg-ink/90"
            >
              Back to Where to stay
            </Link>
          </div>
        ) : (
          <div className="mt-10">
            <HotelExplorer
              cityId={city.id}
              cityLabel={city.label}
              clusters={clusters}
              lockClusterId={cluster.id}
              catalogHeading={guide ? 'Top Rated Places to Stay' : undefined}
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
        )}
      </main>
      <Footer />
    </BuilderProgressChrome>
  )
}
