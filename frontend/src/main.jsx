import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfiguracionProvider } from './context/ConfiguracionContext.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfiguracionProvider>
      <App />
    </ConfiguracionProvider>
  </StrictMode>,
)
