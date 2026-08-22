import { motion } from 'framer-motion'

export function TripBagEmptyState() {
  return (
    <div className="mt-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 flex h-24 w-24 items-end justify-center"
        aria-hidden="true"
      >
        {/* Travel journal / bag illustration */}
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <rect x="18" y="28" width="52" height="42" rx="8" fill="#f3e6d4" stroke="#c45c3a" strokeWidth="2" />
          <path
            d="M30 28V22c0-6 6-10 14-10s14 4 14 10v6"
            stroke="#c45c3a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="26" y="40" width="36" height="6" rx="2" fill="#7a8f72" opacity="0.55" />
          <rect x="26" y="50" width="28" height="4" rx="2" fill="#3d2c24" opacity="0.18" />
          <rect x="26" y="58" width="22" height="4" rx="2" fill="#3d2c24" opacity="0.12" />
          <circle cx="58" cy="54" r="3" fill="#c45c3a" />
        </svg>
      </motion.div>
      <p className="font-serif text-[2.4rem] font-semibold leading-none text-ink">0</p>
      <p className="mt-3 font-serif text-[1.15rem] font-semibold text-ink">
        Your trip is empty — for now.
      </p>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted">
        Add experiences you love and they&apos;ll collect here.
      </p>
    </div>
  )
}
