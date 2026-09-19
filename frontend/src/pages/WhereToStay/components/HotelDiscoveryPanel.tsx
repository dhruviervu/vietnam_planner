import { useEffect, useState, type FormEvent } from 'react'
import { hotelWebsiteLinks } from '../data/hotelWebsites'
import type { StayCityId, StayProperty } from '../data/types'
import { lookupHotel, INVALID_HOTEL_LINK_MESSAGE, looksLikeWebUrl } from '../services/hotelLookup'

type Props = {
  cityId: StayCityId
  cityLabel: string
  neighbourhoodName: string | null
  preferredClusterId?: string
  expectedCityId?: StayCityId
  expectedClusterId?: string
  onStayReady: (stay: StayProperty, alreadyInCatalog: boolean) => void
}

export function HotelDiscoveryPanel({
  cityId,
  cityLabel,
  neighbourhoodName,
  preferredClusterId,
  expectedCityId,
  expectedClusterId,
  onStayReady,
}: Props) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(cityLabel)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const sites = hotelWebsiteLinks(cityId, cityLabel, neighbourhoodName)

  useEffect(() => {
    setQuery('')
    setLocation(cityLabel)
    setError(null)
    setStatus(null)
  }, [cityId, cityLabel])

  async function onFetch(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setStatus(null)
    setLoading(true)
    try {
      if (!looksLikeWebUrl(query)) {
        setError(INVALID_HOTEL_LINK_MESSAGE)
        return
      }
      const result = await lookupHotel({
        query,
        cityId,
        location,
        preferredClusterId,
      })
      onStayReady(result.stay, result.alreadyInCatalog)
      const clusterNote =
        expectedClusterId && result.resolvedClusterId !== expectedClusterId
          ? ` It sits in ${result.resolvedClusterName} rather than the neighbourhood you were browsing.`
          : expectedCityId && result.resolvedCityId !== expectedCityId
            ? ` We placed it in ${cityLabel}.`
            : ''
      setStatus(
        result.alreadyInCatalog
          ? `${result.stay.name} is already in our shortlist — it’s highlighted below.`
          : `${result.stay.name} is in the catalog below. Add it to your itinerary from the card.${clusterNote}`,
      )
      setQuery('')
    } catch (err) {
      const message = err instanceof Error ? err.message : INVALID_HOTEL_LINK_MESSAGE
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <style>{`@keyframes stayMsgIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }`}</style>
    <section className="rounded-[16px] border border-ink/10 bg-[linear-gradient(180deg,#faf6f0_0%,#f7f1e8_100%)] px-4 py-4 sm:px-5">
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        Browse the full market
      </p>
      <p className="mt-1.5 max-w-[64ch] text-[0.86rem] leading-relaxed text-ink/85">
        We don&apos;t list every hotel in every city yet. Find one you like - from the websites shown
        below, then paste the URL link of the hotel you are selecting here — we&apos;ll add it to
        your itinerary.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {sites.map((site) => (
          <a
            key={site.id}
            href={site.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-[12px] border border-ink/10 bg-paper px-3 py-2.5 transition hover:border-terracotta/40"
          >
            <p className="text-[0.8rem] font-bold text-ink">{site.name}</p>
            <p className="mt-0.5 text-[0.68rem] leading-snug text-muted">{site.blurb}</p>
            <p className="mt-1.5 text-[0.68rem] font-bold text-terracotta">Open hotels →</p>
          </a>
        ))}
      </div>

      <form
        onSubmit={onFetch}
        className="mt-4 flex flex-col gap-2 rounded-[12px] border border-ink/10 bg-paper px-3 py-3 sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            Hotel listing URL
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setError(null)
              setStatus(null)
            }}
            placeholder="Paste the hotel URL here"
            className="mt-1 w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2 text-[0.86rem] text-ink outline-none transition focus:border-terracotta/40 focus:ring-2 focus:ring-terracotta/20"
          />
        </label>
        <label className="min-w-0 sm:w-[200px]">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            City or area
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={cityLabel}
            className="mt-1 w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2 text-[0.86rem] text-ink outline-none transition focus:border-terracotta/40 focus:ring-2 focus:ring-terracotta/20"
          />
        </label>
        <button
          type="submit"
          disabled={loading || query.trim().length < 8}
          className="rounded-[10px] bg-terracotta px-4 py-2 text-[0.8rem] font-bold text-paper transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:mb-px"
        >
          {loading ? 'Fetching…' : 'Add Stay'}
        </button>
      </form>
      {error ? (
        <p
          className="mt-2 rounded-[10px] bg-terracotta/10 px-3 py-2 text-[0.8rem] leading-relaxed text-ink/85"
          style={{ animation: 'stayMsgIn 0.35s ease' }}
        >
          {error}
        </p>
      ) : null}
      {status ? (
        <p
          className="mt-2 rounded-[10px] bg-ink/[0.04] px-3 py-2 text-[0.8rem] font-semibold leading-relaxed text-ink/80"
          style={{ animation: 'stayMsgIn 0.35s ease' }}
        >
          {status}
        </p>
      ) : null}
    </section>
    </>
  )
}
