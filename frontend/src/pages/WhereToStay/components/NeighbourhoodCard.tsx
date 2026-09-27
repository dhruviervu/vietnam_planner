import { getClusterDescription, previewWords } from '../data/clusterDescriptions'
import { getStaysForCluster } from '../data/stays'
import { costLevelLabel } from '../data/ranking'
import { FILTER_LABELS } from '../data/labels'
import type { StayCluster } from '../data/types'

type Props = {
  cluster: StayCluster
  selected?: boolean
  onSelect?: () => void
  onOpenHotels: () => void
}

export function NeighbourhoodCard({
  cluster,
  selected = false,
  onSelect,
  onOpenHotels,
}: Props) {
  const essay = getClusterDescription(cluster.id)
  const stays = getStaysForCluster(cluster.id)
  const photos = [essay.image, ...stays.map((s) => s.image)]
    .filter((src, i, arr) => arr.indexOf(src) === i)
    .slice(0, 3)
  const blurb = previewWords(essay.text, 42).preview
  const range = cluster.typicalNightlyRange

  return (
    <article
      id={`neighbourhood-${cluster.id}`}
      className="scroll-mt-24 overflow-hidden rounded-[18px] border-[3px] bg-paper shadow-soft"
      style={{
        borderColor: selected ? cluster.mapColor.stroke : 'rgba(47,42,38,0.08)',
        boxShadow: selected ? `0 0 0 3px ${cluster.mapColor.stroke}` : undefined,
      }}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div
          className={`grid gap-[2px] overflow-hidden bg-cream ${
            photos.length > 1 ? 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : 'grid-cols-1'
          } aspect-[16/9]`}
        >
          <img src={photos[0]} alt="" className="h-full w-full object-cover" />
          {photos.length > 1 ? (
            <div className="grid min-h-0 grid-rows-2 gap-[2px]">
              <img src={photos[1]} alt="" className="h-full w-full object-cover" />
              <img src={photos[2] ?? photos[1]} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>
      </button>

      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-serif text-[1.18rem] font-semibold leading-snug text-ink">
            {cluster.name}
          </h3>
          <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[0.68rem] font-bold text-ink">
            {costLevelLabel(cluster.costLevel)}
            {range ? ` · ~$${range[0]}–$${range[1]}` : ''}
          </span>
        </div>
        <p className="mt-1 text-[0.72rem] font-semibold text-muted">
          {cluster.character.slice(0, 3).join(' · ')}
        </p>
        <p className="mt-2 text-[0.84rem] leading-relaxed text-ink/85">{blurb}</p>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {cluster.bestFor.slice(0, 4).map((id) => (
            <span
              key={id}
              className="rounded-full bg-ink/[0.04] px-2 py-0.5 text-[0.62rem] font-bold text-ink"
            >
              {FILTER_LABELS[id]}
            </span>
          ))}
        </div>

        <div className="mt-3.5">
          <button
            type="button"
            onClick={onOpenHotels}
            className="rounded-full bg-terracotta px-3.5 py-2 text-[0.75rem] font-bold text-paper hover:bg-terracotta/90"
          >
            See more about {cluster.name}
          </button>
        </div>
      </div>
    </article>
  )
}
