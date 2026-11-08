import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import './styles/index.css'
import App from './App.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('Root element was not found.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
