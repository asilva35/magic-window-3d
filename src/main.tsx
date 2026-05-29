import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './design-system/tokens.css'
import './design-system/components.css'
import './design-system/configurator.css'
import App from './App.tsx'
import TestPage from './TestPage.tsx'
import TestRedDoorPage from './TestRedDoorPage.tsx'
import TestUnoDoorPage from './TestUnoDoorPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-red-door" element={<TestRedDoorPage />} />
        <Route path="/test-uno-door" element={<TestUnoDoorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
