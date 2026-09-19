import { BlockTitle, SectionIntro } from './ui'

const HERO =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80'

export function InsuranceSection() {
  return (
    <section className="space-y-4">
      <SectionIntro
        id="logistics-insurance"
        n="05 · Insurance"
        title="Travel Insurance"
        support="A short check before you fly — not a policy comparison."
      />

      <div className="overflow-hidden rounded-[3px] border border-ink/10">
        <div className="relative h-[110px] sm:h-[128px]">
          <img src={HERO} alt="" className="h-full w-full object-cover object-[center_35%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-ink/15" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
            <p className="max-w-[42ch] font-serif text-[1.2rem] leading-snug text-paper sm:text-[1.35rem]">
              Check travel insurance before flying into Vietnam.
            </p>
          </div>
        </div>
        <div className="bg-paper px-4 py-5 sm:px-5">
          <BlockTitle>Checking travel insurance before flying into Vietnam</BlockTitle>
          <ul className="mt-3 max-w-[64ch] space-y-2 text-[0.88rem] leading-relaxed text-ink/85">
            <li>
              Buy cover before you leave home — many policies will not start after you have already
              departed.
            </li>
            <li>
              Visitor medical care in Vietnam is often paid first, then claimed. Confirm medical and
              evacuation limits.
            </li>
            <li>
              Scooter and motorbike accidents are a common claim. Check whether riding (and a local
              licence) is covered.
            </li>
            <li>
              Read adventure-activity exclusions if you plan trekking, diving or similar.
            </li>
            <li>Keep the policy PDF offline and a 24-hour assistance number handy.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
