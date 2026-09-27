import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App.jsx'

// Prevent theme flash by applying theme early
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('nivasa-theme')
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const root = document.documentElement
  root.classList.add(theme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
