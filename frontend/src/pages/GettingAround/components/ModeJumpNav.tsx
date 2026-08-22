import type { TransportMode } from '../data/types'
import { scrollToAnchor } from './WorldNav'

type Props = {
  modes: TransportMode[]
  activeId: string | null
  onActive: (id: string) => void
  idPrefix: string
}

export function ModeJumpNav({ modes, activeId, onActive, idPrefix }: Props) {
  return (
    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
      {modes.map((m) => {
        const on = activeId === m.id
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              onActive(m.id)
              scrollToAnchor(`${idPrefix}-${m.id}`)
            }}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[0.75rem] font-bold transition ${
              on
                ? 'bg-terracotta text-paper'
                : 'bg-paper text-ink ring-1 ring-ink/10 hover:text-terracotta'
            }`}
          >
            {m.symbol} {m.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
