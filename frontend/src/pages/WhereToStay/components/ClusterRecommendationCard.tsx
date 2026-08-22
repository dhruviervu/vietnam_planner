import type { ClusterRecommendation } from '../services/tripBagStayIntelligence'

type Props = {
  recommendation: ClusterRecommendation
  cityLabel: string
  onSelect: (clusterId: string) => void
  isSelected: boolean
}

export function ClusterRecommendationCard({
  recommendation,
  cityLabel,
  onSelect,
  isSelected,
}: Props) {
  const { cluster, reasons, matchedItemNames } = recommendation

  return (
    <section className="overflow-hidden rounded-[18px] border border-sage/35 bg-gradient-to-br from-sage/10 via-paper to-cream shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            ★ Recommended base · {cityLabel}
          </p>
          <h3 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">{cluster.name}</h3>
          <p className="mt-1 max-w-[54ch] text-[0.88rem] leading-relaxed text-muted">
            Suggested from everything in your trip bag for this city — experiences and things to do.
            You can still explore every other cluster and stay below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(cluster.id)}
          className={`shrink-0 rounded-full px-4 py-2.5 text-[0.82rem] font-bold transition ${
            isSelected
              ? 'bg-sage text-paper'
              : 'bg-ink text-paper hover:bg-ink/90'
          }`}
        >
          {isSelected ? '✓ Viewing this cluster' : 'View this cluster'}
        </button>
      </div>

      <div className="border-t border-sage/20 px-5 py-4 sm:px-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
          Why this area
        </p>
        <ul className="mt-2 space-y-2">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-[0.9rem] leading-snug text-ink">
              <span className="mt-0.5 text-sage" aria-hidden>
                ✓
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        {matchedItemNames.length > 0 && (
          <p className="mt-3 text-[0.78rem] text-muted">
            Linked to your picks:{' '}
            <span className="font-semibold text-ink">{matchedItemNames.join(' · ')}</span>
          </p>
        )}
        <p className="mt-3 text-[0.78rem] italic text-muted">
          Not locked in — browse other neighbourhoods and stays across {cityLabel} anytime.
        </p>
      </div>
    </section>
  )
}
