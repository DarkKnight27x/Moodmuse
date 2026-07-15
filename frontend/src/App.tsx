import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import BottomPlayer from './components/BottomPlayer'
import Dashboard from './pages/Dashboard'
import Discover from './pages/Discover'
import MusicDNA from './pages/MusicDNA'
import Playlists from './pages/Playlists'
import MoodCheckInPage from './pages/MoodCheckIn'
import Reports from './pages/Reports'
import Compatibility from './pages/Compatibility'
import Settings from './pages/Settings'
import { useStore } from './store/useStore'
import { dailyMixTracks } from './lib/mockData'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/music-dna" element={<MusicDNA />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/mood-check-in" element={<MoodCheckInPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/compatibility" element={<Compatibility />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  useEffect(() => {
    const state = useStore.getState()
    if (!state.currentTrack) {
      state.playTrack(dailyMixTracks[0], dailyMixTracks)
      useStore.setState({ isPlaying: false, progress: 0.28 })
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-lab min-h-screen">
        <Sidebar />
        <main className="min-h-screen px-4 pb-32 pt-20 md:ml-64 md:px-8 md:pb-28 md:pt-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <AnimatedRoutes />
          </div>
        </main>
        <BottomPlayer />
      </div>
    </BrowserRouter>
  )
}

export default App