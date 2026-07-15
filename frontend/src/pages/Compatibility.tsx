import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { friends } from '../lib/mockData'

function compatColor(score: number) {
  if (score >= 85) return 'from-cyan to-cyan-bright'
  if (score >= 70) return 'from-violet to-cyan'
  return 'from-violet/70 to-magenta/70'
}

export default function Compatibility() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Compatibility</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Taste <span className="text-gradient">compatibility</span>
          </h1>
          <p className="mt-1.5 text-sm text-fog">See how your Music DNA overlaps with friends</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-ink backdrop-blur-md sm:flex"
        >
          <UserPlus className="h-4 w-4" />
          Invite friend
        </motion.button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {friends.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="glass-strong flex items-center gap-4 rounded-2xl p-5"
          >
            <img src={f.avatar} alt={f.name} className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-ink">{f.name}</p>
              <p className="truncate text-xs text-fog">Shared favorite: {f.sharedGenre}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${f.compatibility}%` }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${compatColor(f.compatibility)}`}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-xl font-bold text-gradient">{f.compatibility}%</p>
              <p className="text-[10px] uppercase tracking-wider text-fog">match</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
