import { motion } from 'framer-motion'
import { Clock, Flame, Repeat2, Compass } from 'lucide-react'
import { weeklyListening, topGenres } from '../lib/mockData'

const maxMinutes = Math.max(...weeklyListening.map((d) => d.minutes))

export default function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Reports</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Your <span className="text-gradient">listening report</span>
        </h1>
        <p className="mt-1.5 text-sm text-fog">Week of Jul 7 – Jul 13</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total listened', value: '1,013 min', icon: Clock },
          { label: 'Longest streak', value: '9 days', icon: Flame },
          { label: 'Top repeat', value: 'Afterglow', icon: Repeat2 },
          { label: 'New artists found', value: '14', icon: Compass },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-4"
          >
            <s.icon className="mb-3 h-4 w-4 text-cyan-bright" />
            <p className="font-display text-xl font-semibold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-fog">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* weekly bar chart */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <h3 className="mb-6 font-display text-lg font-semibold text-ink">Minutes per day</h3>
          <div className="flex h-52 items-end justify-between gap-3">
            {weeklyListening.map((d, i) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: 'easeOut' }}
                  className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-violet/60 to-cyan/80 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                  style={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                />
                <span className="font-mono text-[10px] text-fog">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* genre breakdown */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <h3 className="mb-6 font-display text-lg font-semibold text-ink">Genre breakdown</h3>
          <div className="space-y-4">
            {topGenres.map((g, i) => (
              <div key={g.genre}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm text-mist">{g.genre}</span>
                  <span className="font-mono text-xs text-cyan-bright">{g.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
