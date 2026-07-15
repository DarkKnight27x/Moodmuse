import { motion } from 'framer-motion'
import { Play, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { madeForYou, moodPlaylists, dailyMixTracks } from '../lib/mockData'

const allPlaylists = [...madeForYou, ...moodPlaylists]

export default function Playlists() {
  const playTrack = useStore((s) => s.playTrack)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Library</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Your <span className="text-gradient">playlists</span>
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Playlist</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {allPlaylists.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 8) * 0.04, duration: 0.4 }}
            whileHover={{ y: -6 }}
            className="glass group relative cursor-pointer rounded-2xl p-3"
            onClick={() => playTrack(dailyMixTracks[i % dailyMixTracks.length], dailyMixTracks)}
          >
            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
              <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <Play className="ml-0.5 h-3.5 w-3.5 fill-white text-white" />
              </motion.div>
            </div>
            <p className="truncate text-sm font-medium text-ink">{p.title}</p>
            <p className="truncate text-xs text-fog">{p.trackCount} tracks</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
