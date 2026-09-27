import { MODE_MATRIX } from '../data/standaloneGuide'
import { scrollToAnchor } from './WorldNav'

export function ModeMatrix() {
  return (
    <section id="guide-matrix" className="scroll-mt-28">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-terracotta">
        At a glance
      </p>
      <h2 className="mt-2 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-semibold text-ink">
        Which mode actually fits
      </h2>
      <p className="mt-2 max-w-[58ch] text-[1rem] leading-relaxed text-ink/75">
        Cost marks are relative, not fares. A VietJet ticket can undercut a soft sleeper; a private
        car to Ha Giang will not.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] ring-1 ring-ink/10">
        <table className="min-w-[720px] w-full border-collapse text-left">
          <thead className="bg-ink text-paper">
            <tr>
              {['Mode', 'Best for', 'Typical speed', 'Cost', 'Watch for'].map((h) => (
                <th key={h} className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODE_MATRIX.map((row, i) => (
              <tr key={row.mode} className={i % 2 ? 'bg-cream/50' : 'bg-paper'}>
                <td className="px-4 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => scrollToAnchor(row.jumpId)}
                    className="text-left font-serif text-[1.05rem] font-semibold text-ink hover:text-terracotta"
                  >
                    {row.symbol} {row.mode}
                  </button>
                </td>
                <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">
                  {row.bestFor}
                </td>
                <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/80">
                  {row.speed}
                </td>
                <td className="px-4 py-4 align-top font-bold text-terracotta">{row.cost}</td>
                <td className="px-4 py-4 align-top text-[0.88rem] leading-relaxed text-ink/75">
                  {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
