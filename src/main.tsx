import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { installChunkLoadRecovery } from './utils/chunk-recovery'

// Must be installed before React renders: a deploy deletes the previous build's
// chunks, and the first lazy route this tab opens after that would otherwise
// reject and blank the page. See utils/chunk-recovery.ts.
installChunkLoadRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)