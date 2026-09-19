import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { startTripCompareSync } from './pages/PlanBuilder/lib/tripCompareSync'
import { OutboundRedirectProvider } from './components/outbound/OutboundRedirectProvider'

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
