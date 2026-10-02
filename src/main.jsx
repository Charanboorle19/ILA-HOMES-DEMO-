import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

// Keep pinch/gesture zoom on the map only — never zoom the webpage.
;['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false })
})

document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) event.preventDefault()
  },
  { passive: false },
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
