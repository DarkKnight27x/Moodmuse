import { motion } from 'framer-motion'
import { Play, Shuffle, Sparkles, Flame, Compass, Clock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { dailyMixTracks, madeForYou } from '../lib/mockData'
import MoodQuiz from '../components/MoodQuiz'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const recentlyPlayed = [
  { id: 'r1', title: 'Aurora Fields', artist: 'Kaz Meridian', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80', time: '1:12' },
  { id: 'r2', title: 'Silver Signal', artist: 'Nova & the Static', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80', time: '3:34' },
  { id: 'r3', title: 'Hologram Love', artist: 'Yuna Kite', cover: 'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=200&q=80', time: '2:47' },
  { id: 'r4', title: 'Quiet Circuit', artist: 'Peregrine', cover: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&q=80', time: '4:02' },
  { id: 'r5', title: 'Neon Reverie', artist: 'Aria Voss · Midnight Bloom', cover: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=200&q=80', time: '3:18' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Dashboard() {
  const { userName, playTrack, currentTrack, isPlaying, togglePlay } = useStore()

  const heroTrack = dailyMixTracks[0]
  const isHeroPlaying = currentTrack?.id === heroTrack.id && isPlaying

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* greeting */}
      <motion.div variants={item}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {getGreeting()}, <span className="text-gradient">{userName}</span>
        </h1>
        <p className="mt-1.5 text-sm text-fog">Your sonic universe, tuned to tonight's mood.</p>
      </motion.div>

      {/* daily mix hero */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08]"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=1400&q=80"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/80 via-transparent to-transparent" />
        </div>

        <div className="relative flex flex-col justify-end gap-5 p-6 pt-32 md:p-10 md:pt-48">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-violet/30 bg-violet/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-violet-bright">
              <Sparkles className="h-3 w-3" />
              Vol. 24
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-fog">
              AI curated · updated 2h ago
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Dreamy · Focused · A little melancholic
          </h2>
          <p className="max-w-md text-sm text-mist md:text-base">
            32 tracks that match your late-night flow state — warm synths, spacious rooms, and one
            surprise from your favorite era.
          </p>

          <div className="mt-2 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (currentTrack?.id === heroTrack.id) togglePlay()
                else playTrack(heroTrack, dailyMixTracks)
              }}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <Play className={`h-4 w-4 fill-white ${isHeroPlaying ? 'hidden' : ''}`} />
              {isHeroPlaying ? 'Playing' : 'Play'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => playTrack(dailyMixTracks[Math.floor(Math.random() * dailyMixTracks.length)], dailyMixTracks)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-ink backdrop-blur-md"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* mood quiz widget */}
      <motion.div variants={item}>
        <MoodQuiz />
      </motion.div>

      {/* stat strip */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mood streak', value: '12 days', icon: Flame },
          { label: 'New discoveries', value: '48 tracks', icon: Compass },
          { label: 'Listened this week', value: '9h 42m', icon: Clock },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <s.icon className="mb-3 h-4 w-4 text-cyan-bright" />
            <p className="font-display text-xl font-semibold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-fog">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* made for you */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Made for you tonight</h3>
          <button className="text-xs font-medium text-cyan-bright hover:text-cyan-bright/80">See all</button>
        </div>
        <div className="scrollbar-none -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {madeForYou.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="glass group relative w-44 shrink-0 cursor-pointer rounded-2xl p-3 transition-colors hover:border-violet/30 md:w-52"
              onClick={() =>
                playTrack(dailyMixTracks[i % dailyMixTracks.length], dailyMixTracks)
              }
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
              <p className="truncate text-xs text-fog">{p.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* recently played */}
      <motion.div variants={item}>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink">Recently played</h3>
        <div className="glass-strong divide-y divide-white/[0.06] rounded-2xl">
          {recentlyPlayed.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="group flex cursor-pointer items-center gap-4 px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl"
              onClick={() => playTrack(dailyMixTracks[i % dailyMixTracks.length], dailyMixTracks)}
            >
              <span className="w-4 shrink-0 text-center font-mono text-xs text-fog">{i + 1}</span>
              <img src={t.cover} alt={t.title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                <p className="truncate text-xs text-fog">{t.artist}</p>
              </div>
              <Play className="h-3.5 w-3.5 shrink-0 fill-mist text-mist opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="shrink-0 font-mono text-xs text-fog">{t.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

