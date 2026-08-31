import type { ReactNode } from 'react'
import type { Experience } from '../../types'
import { getExperiencePracticalInfo, type BookAheadLevel } from '../../services/experiencePracticalInfo'

type Props = {
  experience: Experience
  /** Compact three-column block inside The Story */
  embedded?: boolean
}

const BOOK_AHEAD_STYLE: Record<
  BookAheadLevel,
  { label: string; chip: string; ring: string }
> = {
  required: {
    label: 'Required',
    chip: 'bg-terracotta/12 text-terracotta-deep',
    ring: 'ring-terracotta/25',
  },
  recommended: {
    label: 'Recommended',
    chip: 'bg-amber-100/90 text-amber-900',
    ring: 'ring-amber-200/80',
  },
  'not needed': {
    label: 'Not needed',
    chip: 'bg-sage/15 text-sage',
    ring: 'ring-sage/25',
  },
}

export function WhatToKnowSection({ experience, embedded = false }: Props) {
  const { bookAhead, whatToBring, physicalEffort } = getExperiencePracticalInfo(experience)
  const bookStyle = BOOK_AHEAD_STYLE[bookAhead]
  const showBring = whatToBring.length > 0
  const columns = showBring ? 3 : 2

  return (
    <section className={embedded ? 'mt-7' : 'border-t border-ink/8 bg-gradient-to-b from-paper to-cream/40 px-5 py-5 sm:px-6 sm:py-6'}>
      <h3
        className={
          embedded
            ? 'font-serif text-[1.2rem] font-semibold text-ink'
            : 'font-serif text-[1.45rem] font-semibold text-ink'
        }
      >
        What to know
      </h3>

      <div
        className={`mt-4 grid gap-3 ${
          columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        <PracticalBlock title="Book ahead" icon="📅">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[0.78rem] font-bold capitalize ring-1 ${bookStyle.chip} ${bookStyle.ring}`}
          >
            {bookStyle.label}
          </span>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
            {bookAhead === 'required'
              ? 'Reserve tickets or a tour slot before you travel — same-day availability is often limited.'
              : bookAhead === 'recommended'
                ? 'Booking a day or two ahead helps secure your preferred time and avoids queues.'
                : 'You can usually show up without a reservation — arrive early on busy weekends if possible.'}
          </p>
        </PracticalBlock>

        {showBring ? (
          <PracticalBlock title="What to bring" icon="🎒">
            <ul className="flex flex-wrap gap-2">
              {whatToBring.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-paper px-3 py-1.5 text-[0.78rem] font-semibold text-ink shadow-soft ring-1 ring-ink/8"
                >
                  {item}
                </li>
              ))}
            </ul>
          </PracticalBlock>
        ) : null}

        <PracticalBlock title="Physical effort" icon="🥾">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                  Walking intensity
                </p>
                <p className="text-[0.82rem] font-semibold text-ink">{physicalEffort.walkingLabel}</p>
              </div>
              <div className="mt-2 flex gap-1">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      level <= physicalEffort.walkingIntensity
                        ? level <= 2
                          ? 'bg-sage'
                          : level <= 3
                            ? 'bg-amber-400'
                            : 'bg-terracotta'
                        : 'bg-ink/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <EffortFlag
                active={physicalEffort.unevenTerrain}
                label="Uneven terrain"
                activeLabel="Expect uneven ground"
              />
              <EffortFlag
                active={physicalEffort.stairs}
                label="Stairs & steps"
                activeLabel={physicalEffort.stepsDetail}
              />
            </div>
          </div>
        </PracticalBlock>
      </div>
    </section>
  )
}

function PracticalBlock({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-ink/8 bg-paper/80 p-4 shadow-soft">
      <p className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-sage">
        <span aria-hidden>{icon}</span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function EffortFlag({
  active,
  label,
  activeLabel,
}: {
  active: boolean
  label: string
  activeLabel: string
}) {
  return (
    <span
      className={`inline-flex max-w-full items-start gap-1.5 rounded-xl px-3 py-2 text-[0.78rem] leading-snug ring-1 ${
        active
          ? 'bg-cream font-semibold text-ink ring-terracotta/20'
          : 'bg-ink/[0.03] font-medium text-muted ring-ink/8'
      }`}
    >
      <span className={active ? 'text-terracotta' : 'text-muted'}>{active ? '●' : '○'}</span>
      <span>{active ? activeLabel : `No significant ${label.toLowerCase()}`}</span>
    </span>
  )
}
