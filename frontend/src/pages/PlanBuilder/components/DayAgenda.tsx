import type { DayAgendaItem, YourVietnamDay } from '../lib/yourVietnam/types'
import { gettingAroundUrl, itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'

function agendaSights(day: YourVietnamDay): DayAgendaItem[] {
  return day.periods
    .flatMap((p) => p.items)
    .filter((it) => it.kind === 'experience' || it.kind === 'activity')
    .map((it) => ({
      id: it.id,
      name: it.name,
      kind: it.kind,
      sourceId: it.sourceId,
      recommended: it.selectionState === 'recommended',
      mapsUrl: it.mapsUrl,
    }))
}

function transportEmoji(label: string) {
  if (/flight|plane|air/i.test(label)) return '✈️'
  if (/train/i.test(label)) return '🚆'
  if (/bus/i.test(label)) return '🚌'
  if (/boat|ferry/i.test(label)) return '⛴️'
  if (/scooter|motorbike|xe/i.test(label)) return '🛵'
  if (/grab|taxi|car/i.test(label)) return '🚗'
  return '🚗'
}

function mainTransport(day: YourVietnamDay): { emoji: string; label: string; hint: string; href?: string } {
  if (day.cityTransferOut) {
    const hop = day.cityTransferOut
    const label = `${day.city} → ${hop.toCity} · ${hop.modeLabel}`
    return {
      emoji: hop.icon || transportEmoji(hop.modeLabel),
      label,
      hint: hop.durationLabel,
      href: hop.externalUrl ?? gettingAroundUrl(),
    }
  }

  const hop = day.periods
    .flatMap((p) => p.items)
    .map((it) => it.transferAfter)
    .find((t) => t?.accent === 'city-hop')
  if (hop) {
    const label = `${hop.mode} · ${day.city}`
    return {
      emoji: hop.icon || transportEmoji(hop.mode),
      label,
      hint: hop.durationLabel,
      href: hop.externalUrl ?? gettingAroundUrl(),
    }
  }

  return {
    emoji: '🚗',
    label: `Grab App · ${day.city}`,
    hint: 'Local rides between stops',
    href: gettingAroundUrl(),
  }
}

export function DayAgendaList({
  day,
  activeId,
  onSelect,
  pinNumberById = {},
  groupSize = 2,
}: {
  day: YourVietnamDay
  activeId: string | null
  onSelect: (id: string) => void
  pinNumberById?: Record<string, number>
  groupSize?: number
}) {
  const rows = agendaSights(day)
  const transport = mainTransport(day)
  const scooter = groupSize === 2 || groupSize === 4

  return (
    <div className="rounded-[20px] border border-ink/8 bg-paper px-4 py-5">
      <p className="font-serif text-[1.35rem] font-semibold leading-tight tracking-tight text-ink sm:text-[1.5rem]">
        Day {day.day} agenda
      </p>
      <ul className="mt-4 space-y-2">
        <li>
          <a
            href={transport.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!transport.href) return
              openDetailHref(transport.href, e)
            }}
            className="flex items-start gap-2 rounded-lg px-1 py-0.5 text-[0.86rem] text-ink hover:bg-cream"
          >
            <span className="mt-0.5 text-[1.15rem] leading-none" aria-hidden="true">
              {transport.emoji}
            </span>
            <span>
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
                Main transport of the day
              </span>
              <span className="font-semibold">{transport.label}</span>
              <span className="ml-1.5 text-[0.75rem] text-muted">{transport.hint}</span>
            </span>
          </a>
        </li>
        {scooter && (
          <li className="rounded-[14px] bg-sage/10 px-3 py-2.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              🛵 Strong pick for your group
            </p>
            <p className="mt-0.5 text-[0.86rem] font-semibold text-ink">
              Rent a scooter for the day in {day.city}
            </p>
            <p className="mt-0.5 text-[0.78rem] leading-snug text-muted">
              {groupSize === 2
                ? 'Couples usually cover more of the city this way — two-up on one bike, stop when the street looks good.'
                : 'A family of four still does well with two scooters: same freedom as a couple, without waiting on Grab between nearby sights.'}
            </p>
          </li>
        )}
        <li className="pt-1">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink">Sights</p>
        </li>
        {rows.length === 0 ? (
          <li className="pl-1 text-[0.82rem] text-muted">Nothing locked in yet for this day.</li>
        ) : (
          rows.map((it) => {
            const href = itineraryItemHref({
              kind: it.kind,
              sourceId: it.sourceId,
              mapsUrl: it.mapsUrl,
            })
            const n = pinNumberById[it.id]
            return (
              <li key={it.id}>
                <a
                  href={href || '#'}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    onSelect(it.id)
                    if (href) openDetailHref(href, e)
                    else e.preventDefault()
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left text-[0.86rem] transition ${
                    activeId === it.id
                      ? 'bg-terracotta/12 text-terracotta'
                      : 'text-ink hover:bg-cream'
                  }`}
                >
                  {n ? (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ea4335] text-[0.68rem] font-bold text-white">
                      {n}
                    </span>
                  ) : (
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" />
                  )}
                  <span className={`min-w-0 font-semibold underline-offset-2 hover:underline ${
                    it.recommended ? 'text-sage' : ''
                  }`}>
                    {it.name}
                  </span>
                </a>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
