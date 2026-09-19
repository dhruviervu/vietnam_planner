import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { rememberAskPath } from '../../ai/chatMemory'
import { AskChat } from './AskChat'

export function MiniAskChat() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const onBuilder = location.pathname.startsWith('/plan/builder')

  useEffect(() => {
    rememberAskPath(location.pathname)
  }, [location.pathname])

  return (
    <div
      className={`fixed right-3 z-40 xl:right-5 ${
        onBuilder ? 'bottom-[6.4rem] xl:bottom-5' : 'bottom-5'
      }`}
    >
      {open ? (
        <div className="mb-3 flex h-[min(36rem,74vh)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-paper shadow-hero">
          <AskChat pathname={location.pathname} variant="mini" onClose={() => setOpen(false)} />
          <div className="border-t border-ink/8 px-4 py-2">
            <Link
              to="/ask"
              className="text-[0.72rem] font-bold text-terracotta hover:underline"
              onClick={() => setOpen(false)}
            >
              Open full Ask page →
            </Link>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Hide sight assistant' : 'Ask about sights'}
        className="ml-auto flex h-14 items-center gap-2 rounded-full bg-ink px-4 text-paper shadow-hero"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-[0.95rem]">
          ✦
        </span>
        <span className="pr-1 text-[0.82rem] font-bold">Ask</span>
      </button>
    </div>
  )
}
