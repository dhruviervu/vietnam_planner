import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { startTripCompareSync } from './pages/PlanBuilder/lib/tripCompareSync'
import { OutboundRedirectProvider } from './components/outbound/OutboundRedirectProvider'
import { clearStaleChunkFlag, reloadOnceForStaleChunk } from './lib/lazyPage'

window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForStaleChunk()) event.preventDefault()
})
window.addEventListener('load', () => window.setTimeout(clearStaleChunkFlag, 10_000))

startTripCompareSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OutboundRedirectProvider>
        <App />
      </OutboundRedirectProvider>
    </BrowserRouter>
  </StrictMode>,
)
