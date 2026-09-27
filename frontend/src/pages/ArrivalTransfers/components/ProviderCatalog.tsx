import type { CatalogProvider } from '../data/providerCatalog'
import { APP_STORE_LINKS } from '../data/transferGuides'
import { filledBookingUrl, providerDetailHref, routePlate, type BookingRoute } from '../data/bookingLinks'
import { openDetailHref } from '../../PlanBuilder/lib/yourVietnam/links'

type Props = {
  providers: CatalogProvider[]
  route: BookingRoute
}

function storesFor(name: string) {
  if (name.startsWith('Grab')) return APP_STORE_LINKS.grab
  if (name.startsWith('Be')) return APP_STORE_LINKS.be
  if (name.startsWith('Xanh')) return APP_STORE_LINKS.xanh
  return null
}

export function ProviderCatalog({ providers, route }: Props) {
  const plate = routePlate(route)
  if (!providers.length) {
    return (
      <p className="rounded-[16px] bg-cream/70 px-4 py-3 text-[0.85rem] text-muted">
        No listed providers for this mode at this airport.
      </p>
    )
  }
  return (
    <ul className="flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
      {providers.map((p, i) => {
        const stores = p.booking.kind === 'app' ? storesFor(p.name) : null
        const href = filledBookingUrl(p.booking.url, route)
        const detailHref = providerDetailHref(p.id, route)
        return (
          <li
            key={p.id}
            className="group w-[10.25rem] shrink-0 snap-start overflow-hidden rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/8 sm:w-auto"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <img
                src={p.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/50 to-transparent" />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-sage px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-paper">
                  Best value
                </span>
              ) : null}
            </div>
            <div className="px-3 py-3">
              <p className="font-serif text-[1.02rem] font-semibold leading-tight text-ink">{p.name}</p>
              <p className="mt-1.5 text-[0.68rem] font-medium leading-snug text-muted">
                <span className="font-bold text-ink/70">From</span> {plate.from}
              </p>
              <p className="text-[0.68rem] font-medium leading-snug text-muted">
                <span className="font-bold text-ink/70">To</span> {plate.to}
              </p>
              <p className="mt-1.5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-terracotta">
                {p.time}
              </p>
              <p className="mt-0.5 text-[0.78rem] font-semibold text-ink/75">{p.fare}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {p.booking.kind === 'web' && href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-terracotta px-2.5 py-1 text-[0.65rem] font-bold text-paper"
                  >
                    {p.booking.label}
                  </a>
                ) : null}
                {stores ? (
                  <>
                    <a
                      href={stores.ios}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-paper"
                    >
                      iPhone
                    </a>
                    <a
                      href={stores.android}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-paper"
                    >
                      Android
                    </a>
                  </>
                ) : p.booking.kind === 'app' && href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-paper"
                  >
                    {p.booking.label}
                  </a>
                ) : null}
                {p.booking.kind === 'desk' || p.booking.kind === 'onboard' ? (
                  <span className="rounded-full bg-cream px-2.5 py-1 text-[0.65rem] font-bold text-ink">
                    {p.booking.label}
                  </span>
                ) : null}
                <a
                  href={detailHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => openDetailHref(detailHref, e)}
                  className="rounded-full bg-paper px-2.5 py-1 text-[0.65rem] font-bold text-ink ring-1 ring-ink/12"
                >
                  Learn more
                </a>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
