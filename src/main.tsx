import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/treatments.css'
import App from './App.tsx'

// After a deploy, a page loaded before it may still ask for old hashed chunks
// ("Unable to preload CSS for …/assets/X.css"). Reload to pick up the new build,
// at most once every 30 seconds so a genuinely broken asset cannot loop.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'ui_explorer_last_preload_reload'
  const last = Number(sessionStorage.getItem(key) ?? 0)
  if (Date.now() - last < 30_000) return
  sessionStorage.setItem(key, String(Date.now()))
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
