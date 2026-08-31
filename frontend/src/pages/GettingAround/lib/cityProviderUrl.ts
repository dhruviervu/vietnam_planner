/** City-specific booking links for urban rental aggregators (Klook search). Grab stays app-wide. */
export function cityProviderUrl(bookingUrl: string, cityLabel: string): string {
  if (/grab\.com/i.test(bookingUrl)) return bookingUrl
  try {
    const url = new URL(bookingUrl)
    if (!url.hostname.includes('klook.com')) return bookingUrl
    const query = url.searchParams.get('query')
    if (!query || !/\bvietnam\b/i.test(query)) return bookingUrl
    url.searchParams.set('query', query.replace(/\bvietnam\b/i, cityLabel.trim()))
    return url.toString()
  } catch {
    return bookingUrl
  }
}
