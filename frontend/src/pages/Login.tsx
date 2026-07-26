import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Music2, User, Sparkles, CheckCircle2 } from 'lucide-react'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { connected, loading, connectSpotify, continueAsGuest } = useSpotifyAuth()

  const handleGuest = () => {
    continueAsGuest()
    navigate('/')
  }

  const handleContinue = () => {
    // already connected (e.g. returning visitor with a live session) —
    // no need to round-trip through Spotify again
    navigate('/')
  }

  return (
    <div className="bg-lab relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* background glows */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-violet/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-cyan/20 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/10 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-strong relative w-full max-w-md rounded-3xl border border-white/[0.08] p-8 md:p-10"
      >
        {/* header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/30 to-cyan/20 ring-1 ring-violet/30"
          >
            <Sparkles className="h-6 w-6 text-violet-bright" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Welcome to <span className="text-gradient">MoodMuse</span>
          </h1>
          <p className="mt-2 text-sm text-fog">
            Sign in to start discovering music tuned to your mood
          </p>
        </div>

        {/* already connected banner */}
        {!loading && connected && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-center gap-2 rounded-2xl border border-cyan/20 bg-cyan/[0.06] px-4 py-3"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-bright" />
            <p className="text-xs text-mist">Spotify is already connected on this device.</p>
          </motion.div>
        )}

        {/* actions */}
        <div className="space-y-3">
          {!loading && connected ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.35)]"
            >
              <Sparkles className="h-4 w-4" />
              Continue to MoodMuse
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={connectSpotify}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1DB954] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(29,185,84,0.35)] disabled:opacity-60"
            >
              <Music2 className="h-4 w-4" />
              Continue with Spotify
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGuest}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-ink backdrop-blur-md transition-colors hover:border-white/25"
          >
            <User className="h-4 w-4" />
            Continue as Guest
          </motion.button>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-fog">
          Connect Spotify to automatically save playlists to your account.
          As a guest, you can still take the quiz and preview tracks — just
          without playlists saving anywhere.
        </p>
      </motion.div>
    </div>
  )
}