import {
  CROWD_LABELS,
  FILTER_LABELS,
  PROXIMITY_LABELS,
  SAFETY_LABELS,
  COST_LEGEND,
} from '../data/labels'
import { costLevelLabel, metricDots } from '../data/ranking'
import type { MatchLabel, StayCluster } from '../data/types'

type Props = {
  cluster: StayCluster
  match: MatchLabel | null
  cityLabel: string
  /** Explicit recommended flag (trip bag or ranking) */
  recommended?: boolean
  recommendReasons?: string[]
}

function Meter({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const dots = metricDots(value, max)
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.68rem] text-muted">{label}</span>
        <span className="flex gap-0.5" aria-label={`${value} of ${max}`}>
          {dots.map((on, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-terracotta' : 'bg-ink/15'}`}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

function InsightChip({
  title,
  value,
  note,
  tone = 'neutral',
}: {
  title: string
  value: string
  note: string
  tone?: 'good' | 'warn' | 'neutral'
}) {
  const toneClass =
    tone === 'good'
      ? 'border-sage/30 bg-sage/10'
      : tone === 'warn'
        ? 'border-terracotta/25 bg-terracotta/[0.06]'
        : 'border-ink/10 bg-cream/70'

  return (
    <div className={`rounded-[3px] border px-2.5 py-2 ${toneClass}`}>
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">{title}</p>
      <p className="mt-0.5 text-[0.82rem] font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-[0.68rem] leading-snug text-ink/75">{note}</p>
    </div>
  )
}

export function ClusterPanel({
  cluster,
  match,
  cityLabel,
  recommended = false,
  recommendReasons = [],
}: Props) {
  const range = cluster.typicalNightlyRange
  const living = cluster.living
  const isRecommended = recommended || match === 'recommended'

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-[3px] border bg-paper ${
        isRecommended ? 'border-sage/45 shadow-[0_0_0_1px_rgba(122,143,114,0.25)]' : 'border-ink/10'
      }`}
    >
      <div
        className="h-1.5 shrink-0"
        style={{ background: isRecommended ? '#7a8f72' : cluster.mapColor.stroke }}
        aria-hidden
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
        <p
          className={`text-[0.55rem] font-bold uppercase tracking-[0.12em] ${
            isRecommended ? 'text-sage' : 'text-terracotta'
          }`}
        >
          {isRecommended ? 'Recommended cluster' : 'Selected cluster'} · {cityLabel}
        </p>
        <h3 className="mt-1 font-serif text-[1.4rem] font-semibold leading-tight text-ink">
          {cluster.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {isRecommended ? (
            <span className="rounded-[2px] bg-sage/20 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-sage">
              Recommended
            </span>
          ) : null}
          {!isRecommended && match === 'good' ? (
            <span className="rounded-[2px] bg-ink/[0.05] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-ink">
              Good match
            </span>
          ) : null}
          <span className="rounded-[2px] bg-ink/[0.04] px-2 py-0.5 text-[0.58rem] font-bold text-muted">
            Rough area · rough cost
          </span>
        </div>

        {isRecommended && recommendReasons.length > 0 ? (
          <ul className="mt-3 space-y-1.5 rounded-[3px] border border-sage/25 bg-sage/10 px-2.5 py-2.5">
            {recommendReasons.slice(0, 3).map((r) => (
              <li key={r} className="flex gap-1.5 text-[0.75rem] leading-snug text-ink/90">
                <span className="text-sage" aria-hidden>
                  ✓
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-[3px] bg-[linear-gradient(165deg,#faf6f0_0%,#f3ebe0_100%)] px-2.5 py-2">
            <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">
              Typical stay cost
            </p>
            <p className="font-serif text-[1.25rem] font-semibold text-ink">
              {costLevelLabel(cluster.costLevel)}
            </p>
            <p className="text-[0.72rem] font-bold text-ink/80">
              {range ? `~$${range[0]}–$${range[1]} / night` : 'Range varies'}
            </p>
          </div>
          <div className="rounded-[3px] bg-cream/80 px-2.5 py-2">
            <p className="text-[0.5rem] font-bold uppercase tracking-wide text-muted">
              Cost of living cue
            </p>
            <p className="mt-1 text-[0.72rem] leading-snug text-ink/85">
              {living.costOfLivingNote}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
            What you’ll get here
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <InsightChip
              title="Crowd"
              value={CROWD_LABELS[living.crowdLevel]}
              note={living.noiseNote}
              tone={living.crowdLevel === 'busy' ? 'warn' : 'neutral'}
            />
            <InsightChip
              title="Tourist safety"
              value={SAFETY_LABELS[living.touristSafety]}
              note={living.safetyNote}
              tone={living.touristSafety === 'take-care' ? 'warn' : 'good'}
            />
            <InsightChip
              title="Market / shops"
              value={PROXIMITY_LABELS[living.marketAccess]}
              note={living.marketNote}
            />
            <InsightChip
              title="Food nearby"
              value={PROXIMITY_LABELS[living.foodAccess]}
              note={living.foodNote}
            />
          </div>
        </div>

        <div className="mt-3 rounded-[3px] border border-ink/10 px-2.5 py-2.5">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
            Nightlife & evenings
          </p>
          <p className="mt-1 text-[0.78rem] text-ink/85">{living.nightlifeFeel}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {cluster.bestFor.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-[2px] bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-ink ring-1 ring-ink/8"
            >
              {FILTER_LABELS[tag]}
            </span>
          ))}
        </div>

        <div className="mt-3 space-y-1.5 rounded-[3px] bg-ink/[0.03] px-2.5 py-2.5">
          <Meter label="Location" value={cluster.metrics.locationScore} />
          <Meter label="Walkability" value={cluster.metrics.walkability} />
          <Meter label="Sightseeing" value={cluster.metrics.sightseeingAccess} />
          <Meter label="Quietness" value={cluster.metrics.quietness} />
          <Meter label="Local feel" value={cluster.metrics.localFeel} />
          {cluster.metrics.beachAccess > 0 ? (
            <Meter label="Beach access" value={cluster.metrics.beachAccess} />
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
            Base yourself here if…
          </p>
          <p className="mt-1 text-[0.82rem] font-medium leading-snug text-ink">
            {cluster.baseYourselfIf}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">Tradeoff</p>
          <p className="mt-1 text-[0.75rem] leading-snug text-ink/80">{cluster.tradeoff}</p>
        </div>

        <div className="mt-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
            Close to
          </p>
          <ul className="mt-1.5 space-y-1">
            {cluster.keyPlaces.map((p) => (
              <li
                key={p.label}
                className="flex items-center justify-between gap-2 rounded-[2px] bg-cream/70 px-2 py-1.5 text-[0.72rem]"
              >
                <span className="font-medium text-ink">{p.label}</span>
                <span className="shrink-0 text-muted">
                  {p.typicalMinutes} min {p.mode}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
            Getting around
          </p>
          <ul className="mt-1 space-y-0.5 text-[0.7rem] text-ink/80">
            <li>Walk — {cluster.transportAccess.walkabilityLabel}</li>
            <li>Taxi — {cluster.transportAccess.taxiLabel}</li>
            <li>Transit — {cluster.transportAccess.transitLabel}</li>
          </ul>
        </div>
      </div>

      <div className="shrink-0 border-t border-ink/8 px-4 py-2">
        <p className="text-[0.55rem] font-bold uppercase tracking-wide text-muted">
          Price scale (illustrative)
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {COST_LEGEND.map((c) => (
            <span key={c.level} className="text-[0.62rem] text-muted">
              <span className="font-bold text-ink">{'$'.repeat(c.level)}</span> {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
