import { useEffect, useState } from 'react'
import { costLevelLabel, metricDots } from '../data/ranking'
import type { RankedCluster } from '../data/ranking'
import { getClusterDescription, previewWords } from '../data/clusterDescriptions'

type Props = {
  cityLabel: string
  cityImage?: string
  ranked: RankedCluster[]
  selectedId: string
  onSelect: (id: string) => void
  /** Cluster id forced as the trip-bag / top recommendation */
  recommendedId?: string | null
}

export function ClusterComparison({
  cityLabel,
  cityImage,
  ranked,
  selectedId,
  onSelect,
  recommendedId = null,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [selectedId])

  function isRecommended(clusterId: string, match: RankedCluster['match']) {
    if (recommendedId) return clusterId === recommendedId
    return match === 'recommended'
  }

  const selected = ranked.find((r) => r.cluster.id === selectedId) ?? ranked[0]
  const desc = selected ? getClusterDescription(selected.cluster.id) : null
  const rawImage = cityImage || desc?.image || ''
  const imageSrc = rawImage
    .replace(/([?&])w=\d+/g, '$1w=1600')
    .replace(/([?&])q=\d+/g, '$1q=85')
  const full = desc?.text ?? ''
  const { preview, hasMore } = previewWords(full, 28)
  const recommended = selected
    ? isRecommended(selected.cluster.id, selected.match)
    : false

  return (
    <section>
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
        {cityLabel} stay clusters
      </p>
      <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {ranked.map(({ cluster, match }) => {
          const active = cluster.id === selectedId
          const rec = isRecommended(cluster.id, match)
          const walk = metricDots(cluster.metrics.walkability)
          const quiet = metricDots(cluster.metrics.quietness)
          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => onSelect(cluster.id)}
              className={`w-[168px] shrink-0 rounded-[14px] px-3 py-2.5 text-left transition ring-1 ${
                rec
                  ? active
                    ? 'bg-sage/15 ring-2 ring-sage/55'
                    : 'bg-sage/10 ring-sage/35 hover:ring-sage/50'
                  : active
                    ? 'bg-terracotta/10 ring-terracotta/45'
                    : match === 'possible'
                      ? 'bg-cream/50 ring-ink/6 opacity-75'
                      : 'bg-paper ring-ink/8 hover:ring-terracotta/30'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-[0.78rem] font-bold leading-snug text-ink">{cluster.name}</p>
                <span className="shrink-0 text-[0.72rem] font-bold text-terracotta">
                  {costLevelLabel(cluster.costLevel)}
                </span>
              </div>
              <p
                className={`mt-1 text-[0.58rem] font-bold uppercase tracking-wide ${
                  rec ? 'text-sage' : 'text-muted'
                }`}
              >
                {rec ? 'Recommended' : match === 'good' ? 'Good match' : 'Possible'}
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6rem] text-muted">Walk</span>
                  <span className="flex gap-0.5">
                    {walk.map((on, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${on ? 'bg-ink' : 'bg-ink/15'}`}
                      />
                    ))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[0.6rem] text-muted">Quiet</span>
                  <span className="flex gap-0.5">
                    {quiet.map((on, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${on ? 'bg-ink' : 'bg-ink/15'}`}
                      />
                    ))}
                  </span>
                </div>
              </div>
              <p className="mt-1.5 truncate text-[0.62rem] text-muted">
                {cluster.character[0]}
              </p>
            </button>
          )
        })}
      </div>

      {selected && desc ? (
        <article
          key={selected.cluster.id}
          className={`mt-5 overflow-hidden rounded-[20px] border shadow-soft transition ${
            recommended ? 'border-sage/40 bg-sage/[0.06]' : 'border-ink/10 bg-paper'
          }`}
        >
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div className="flex flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.12em] text-muted">
                  About this cluster
                </p>
                {recommended ? (
                  <span className="rounded-full bg-sage/20 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-sage">
                    Recommended
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1.5 font-serif text-[1.45rem] font-semibold leading-tight text-ink sm:text-[1.6rem]">
                {selected.cluster.name}
              </h3>
              <p className="mt-3 text-[0.92rem] leading-[1.65] text-ink/85">
                {expanded || !hasMore ? full : preview}
              </p>
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3 self-start text-[0.8rem] font-bold text-terracotta transition hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              ) : null}
            </div>

            <div className="relative min-h-[220px] overflow-hidden md:min-h-[340px]">
              <img
                src={imageSrc}
                alt={`${selected.cluster.name}, ${cityLabel}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-paper/15"
                aria-hidden
              />
            </div>
          </div>
        </article>
      ) : null}
    </section>
  )
}
