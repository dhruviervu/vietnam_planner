import { SAMPLE_SIGHTS } from './data'
import { SightMeta, SightsShell } from './ui'

export function SoftGalleryPage() {
  return (
    <SightsShell kicker="Template 02" title="A gallery with room to breathe.">
      <div className="mx-auto grid max-w-[64rem] gap-x-12 gap-y-16 sm:grid-cols-2">
        {SAMPLE_SIGHTS.map((sight) => (
          <article key={sight.id}>
            <div className="overflow-hidden rounded-[6px]">
              <img src={sight.image} alt="" className="aspect-[3/2] w-full object-cover" />
            </div>
            <h2 className="mt-4 font-serif text-[1.28rem] font-semibold leading-tight text-ink">
              {sight.name}
            </h2>
            <p className="mt-2 max-w-[28rem] text-[0.9rem] leading-[1.7] text-ink/75">
              {sight.description}
            </p>
            <div className="mt-4">
              <SightMeta sight={sight} />
            </div>
          </article>
        ))}
      </div>
    </SightsShell>
  )
}
