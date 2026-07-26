import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SpotifyAuthProvider } from './context/SpotifyAuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpotifyAuthProvider>
      <App />
    </SpotifyAuthProvider>
  </StrictMode>,
)