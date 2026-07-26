import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import api from '../lib/api'

interface SpotifyAuthState {
  /** Whether this browser session currently has a connected Spotify account. */
  connected: boolean
  /** True while the initial status check (or a manual refresh) is in flight. */
  loading: boolean
  /** Re-checks connection status against the backend. Safe to call anytime. */
  refresh: () => Promise<void>
  /** Full-page redirect into the Spotify OAuth flow. */
  connectSpotify: () => void
  /** Marks this browser as "continuing without Spotify" — local only, no backend call. */
  continueAsGuest: () => void
  /** True once the person has explicitly chosen to continue as a guest. */
  guestMode: boolean
}

const SpotifyAuthContext = createContext<SpotifyAuthState | undefined>(undefined)

const GUEST_STORAGE_KEY = 'moodmuse_guest'
const SPOTIFY_LOGIN_URL = 'http://127.0.0.1:8000/auth/spotify/login'

export function SpotifyAuthProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guestMode, setGuestMode] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(GUEST_STORAGE_KEY) === 'true'
  )

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/auth/spotify/status')
      setConnected(Boolean(res.data?.connected))
    } catch {
      // backend unreachable, or the endpoint isn't deployed yet — treat as
      // "not connected" rather than leaving the app stuck loading forever
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // After the OAuth callback redirects back here, the URL looks like
    // /?spotify_connected=true. That query param is just a hint to re-check
    // status now rather than waiting — the actual truth always comes from
    // /auth/spotify/status, never from trusting the URL param's value directly.
    const params = new URLSearchParams(window.location.search)
    if (params.has('spotify_connected')) {
      if (params.get('spotify_connected') === 'true') {
        sessionStorage.removeItem(GUEST_STORAGE_KEY)
        setGuestMode(false)
      }
      params.delete('spotify_connected')
      const cleanedQuery = params.toString()
      window.history.replaceState(
        {},
        '',
        window.location.pathname + (cleanedQuery ? `?${cleanedQuery}` : '')
      )
    }
    refresh()
  }, [refresh])

  const connectSpotify = () => {
    // Full page navigation on purpose — this has to leave the SPA for the
    // OAuth redirect dance to work, a fetch()/axios call can't do this.
    window.location.href = SPOTIFY_LOGIN_URL
  }

  const continueAsGuest = () => {
    sessionStorage.setItem(GUEST_STORAGE_KEY, 'true')
    setGuestMode(true)
  }

  return (
    <SpotifyAuthContext.Provider
      value={{ connected, loading, refresh, connectSpotify, continueAsGuest, guestMode }}
    >
      {children}
    </SpotifyAuthContext.Provider>
  )
}

export function useSpotifyAuth(): SpotifyAuthState {
  const ctx = useContext(SpotifyAuthContext)
  if (!ctx) {
    throw new Error('useSpotifyAuth must be used within a <SpotifyAuthProvider>')
  }
  return ctx
}