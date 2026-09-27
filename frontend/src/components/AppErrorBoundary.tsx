import { Component, type ReactNode } from 'react'
import { reloadOnceForStaleChunk } from '../lib/lazyPage'

type Props = { resetKey: string; children: ReactNode }
type State = { failed: boolean }

const STALE_CHUNK = /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError/i

/** Keeps one broken page from blanking the whole site. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    if (STALE_CHUNK.test(message)) reloadOnceForStaleChunk()
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-6 text-center">
        <div className="max-w-md">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            TripBuilder
          </p>
          <h1 className="mt-2 font-serif text-[1.8rem] font-semibold text-ink">
            This page hit a snag
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
            Your trip bag is safe. Reload the page, or head back home and pick up where you left off.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-ink px-6 py-2.5 text-[0.9rem] font-bold text-paper hover:bg-ink/90"
            >
              Reload
            </button>
            <a
              href="/"
              className="rounded-full border border-ink/20 px-6 py-2.5 text-[0.9rem] font-bold text-ink hover:bg-ink/5"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
