import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css'
import App from './App.jsx'
import { ConfiguracionProvider } from './context/ConfiguracionContext.jsx'
import { DisenoProvider } from './context/DisenoContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfiguracionProvider>
      <DisenoProvider>
        <App />
      </DisenoProvider>
    </ConfiguracionProvider>
  </StrictMode>,
)
