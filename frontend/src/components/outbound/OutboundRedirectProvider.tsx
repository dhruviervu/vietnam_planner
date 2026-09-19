import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { buildOutboundGuide, shouldGuideOutbound, type OutboundGuide } from './outboundGuide'

export function OutboundRedirectProvider({ children }: { children: React.ReactNode }) {
  const [guide, setGuide] = useState<OutboundGuide | null>(null)

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.dataset.outboundSkip === 'true') return
      const href = anchor.href
      if (!shouldGuideOutbound(href)) return
      event.preventDefault()
      event.stopPropagation()
      const productName =
        anchor.getAttribute('data-outbound-label') ||
        anchor.getAttribute('aria-label') ||
        anchor.textContent?.trim() ||
        ''
      setGuide(buildOutboundGuide(href, productName))
    }
    document.addEventListener('click', onClick, true)
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setGuide(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!guide) return <>{children}</>

  return (
    <>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-[8000] flex items-end justify-center bg-ink/55 p-4 sm:items-center">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="outbound-title"
                className="w-full max-w-[34rem] overflow-hidden rounded-[22px] bg-paper shadow-[0_24px_60px_rgba(47,42,38,0.28)] ring-1 ring-ink/10"
              >
                <div className="bg-gradient-to-br from-terracotta to-terracotta-deep px-5 py-4 text-paper">
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-paper/75">
                    Leaving Vietnam, Curated
                  </p>
                  <h2 id="outbound-title" className="mt-1 font-serif text-[1.35rem] font-semibold leading-tight">
                    {guide.headline}
                  </h2>
                  <p className="mt-1 text-[0.78rem] text-paper/85">
                    {guide.host}
                    {guide.productName ? ` · ${guide.productName}` : ''}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
                    What to do on that site
                  </p>
                  <ol className="mt-2 space-y-2">
                    {guide.tips.map((tip, i) => (
                      <li key={tip} className="flex gap-2.5 text-[0.86rem] leading-snug text-ink/90">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream text-[0.68rem] font-bold text-terracotta">
                          {i + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a
                      href={guide.href}
                      target="_blank"
                      rel="noreferrer"
                      data-outbound-skip="true"
                      onClick={() => setGuide(null)}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-terracotta px-4 py-2.5 text-center text-[0.86rem] font-bold text-paper"
                    >
                      {guide.continueLabel} →
                    </a>
                    <button
                      type="button"
                      onClick={() => setGuide(null)}
                      className="rounded-full px-4 py-2.5 text-[0.86rem] font-bold text-ink ring-1 ring-ink/12"
                    >
                      Stay here
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
