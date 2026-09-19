import type { DayAgendaItem, YourVietnamDay } from '../lib/yourVietnam/types'
import { orderDaySightsForDisplay } from '../lib/yourVietnam/dayCapacity'
import { itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'

function agendaSights(day: YourVietnamDay): DayAgendaItem[] {
  const sights = day.periods
    .flatMap((p) => p.items)
    .filter((it) => it.kind === 'experience' || it.kind === 'activity' || it.kind === 'shopping')
  return orderDaySightsForDisplay(sights).map((it) => ({
    id: it.id,
    name: it.name,
    kind: it.kind,
    sourceId: it.sourceId,
    recommended: it.selectionState === 'recommended',
    mapsUrl: it.mapsUrl,
  }))
}

export function DayAgendaList({
  day,
  sights,
  activeId,
  onSelect,
  pinNumberById = {},
  onAdd,
}: {
  day: YourVietnamDay
  sights?: DayAgendaItem[]
  activeId: string | null
  onSelect: (id: string) => void
  pinNumberById?: Record<string, number>
  onAdd?: () => void
}) {
  const rows = sights ?? agendaSights(day)
  const hop = day.cityTransferOut

  return (
    <div className="rounded-[16px] border border-ink/8 bg-paper px-4 py-4" data-yv="day-agenda">
      <p className="font-serif text-[1.15rem] font-semibold leading-tight text-ink">
        Sights of the day
      </p>
      {hop ? (
        <p className="mt-1.5 text-[0.75rem] text-muted">
          {hop.icon} {day.city} → {hop.toCity} · {hop.durationLabel}
        </p>
      ) : null}
      <ul className="mt-3 space-y-1">
        {rows.length === 0 ? (
          <li className="text-[0.82rem] text-muted">Nothing locked in yet.</li>
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
                  className={`flex w-full items-start gap-2 rounded-md px-0.5 py-0.5 text-left text-[0.86rem] transition ${
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
                  <span className="min-w-0 font-semibold underline-offset-2 hover:underline">
                    {it.name}
                  </span>
                </a>
              </li>
            )
          })
        )}
        {onAdd ? (
          <li>
            <button
              type="button"
              onClick={onAdd}
              aria-label="Add a sight to this day"
              className="mt-1 grid h-7 w-7 place-items-center rounded-full border border-dashed border-ink/20 text-[1.05rem] font-semibold leading-none text-ink/55 hover:border-terracotta hover:text-terracotta"
            >
              +
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  )
}
