import type { Plugin } from 'vite'

const SITEMAP_PATHS = [
  '/',
  '/why-vietnam',
  '/when-to-go',
  '/when-to-go/discover',
  '/plan',
  '/plan/builder/when-to-go',
  '/plan/builder/experiences',
  '/plan/builder/activities',
  '/plan/builder/stay',
  '/plan/builder/transport',
  '/plan/builder/eat',
  '/plan/builder/shopping',
  '/plan/builder/airport',
  '/plan/builder/logistics',
  '/plan/itinerary-ideas',
  '/plan/itinerary-templates',
  '/where-to-stay',
  '/getting-around',
  '/getting-around/train',
  '/getting-around/bus',
  '/getting-around/flight',
  '/getting-around/city',
  '/getting-around/water',
  '/taste-of-vietnam',
  '/bring-home',
  '/airport-transfers',
  '/know-before-you-go',
  '/ask',
]

/** Emits robots.txt and sitemap.xml; absolute URLs need `VITE_SITE_URL` (e.g. https://tripbuilder.in). */
export function seoPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, '')
  return {
    name: 'seo-files',
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /api/']
      if (base) robots.push('', `Sitemap: ${base}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` })

      if (!base) {
        this.warn('VITE_SITE_URL is not set; skipping sitemap.xml and absolute share-preview URLs.')
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      const urls = SITEMAP_PATHS.map(
        (p) => `  <url><loc>${base}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`,
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', base)
    },
  }
}
