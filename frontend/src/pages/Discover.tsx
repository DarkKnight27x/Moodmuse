import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { moodPlaylists, dailyMixTracks } from '../lib/mockData'

const filters = ['All', 'Energetic', 'Chill', 'Focus', 'Melancholy', 'Nostalgic', 'Euphoric']

export default function Discover() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const playTrack = useStore((s) => s.playTrack)

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Discover</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          What's the <span className="text-gradient">frequency</span> tonight?
        </h1>
      </div>

      {/* search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-fog" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search moods, artists, colors, textures..."
          className="glass-strong w-full rounded-2xl py-4 pl-14 pr-5 text-sm text-ink placeholder:text-fog/70 outline-none transition-shadow focus:shadow-[0_0_0_1px_rgba(168,85,247,0.4),0_0_24px_rgba(168,85,247,0.15)]"
        />
        <Sparkles className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-bright/60" />
      </motion.div>

      {/* filters */}
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeFilter === f
                ? 'bg-gradient-to-r from-violet to-cyan text-white shadow-[0_0_16px_rgba(168,85,247,0.35)]'
                : 'border border-white/10 bg-white/[0.03] text-mist hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* mood grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {moodPlaylists.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            whileHover={{ y: -6, borderColor: 'rgba(168,85,247,0.35)' }}
            className="glass group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] p-3"
            onClick={() => playTrack(dailyMixTracks[i % dailyMixTracks.length], dailyMixTracks)}
          >
            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
              <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
              </motion.div>
            </div>
            <p className="truncate text-sm font-medium text-ink">{p.title}</p>
            <p className="truncate text-xs text-fog">{p.subtitle} · {p.trackCount} tracks</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
