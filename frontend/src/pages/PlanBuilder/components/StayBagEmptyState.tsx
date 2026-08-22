import { motion } from 'framer-motion'

export function StayBagEmptyState() {
  return (
    <div className="mt-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 flex h-24 w-24 items-end justify-center"
        aria-hidden="true"
      >
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <rect x="16" y="30" width="56" height="40" rx="8" fill="#f3e6d4" stroke="#7a8f72" strokeWidth="2" />
          <path
            d="M28 30V24c0-5 5-9 16-9s16 4 16 9v6"
            stroke="#7a8f72"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="24" y="42" width="40" height="8" rx="2" fill="#c45c3a" opacity="0.35" />
          <rect x="24" y="54" width="28" height="4" rx="2" fill="#3d2c24" opacity="0.16" />
          <rect x="24" y="62" width="20" height="4" rx="2" fill="#3d2c24" opacity="0.1" />
          <circle cx="60" cy="58" r="3" fill="#7a8f72" />
        </svg>
      </motion.div>
      <p className="font-serif text-[2.4rem] font-semibold leading-none text-ink">0</p>
      <p className="mt-3 font-serif text-[1.1rem] font-semibold text-ink">Your Stay Bag is empty.</p>
      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted">
        Save any stays you&apos;re considering. We&apos;ll help you compare them when you&apos;re
        ready.
      </p>
    </div>
  )
}
