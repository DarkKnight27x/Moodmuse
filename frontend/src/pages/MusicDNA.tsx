import { motion } from 'framer-motion'
import { Dna } from 'lucide-react'
import MusicDNAViz from '../components/MusicDNAViz'
import { dnaArchetypes } from '../lib/mockData'

export default function MusicDNA() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Music DNA</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Your sonic <span className="text-gradient">signature</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-fog">
          Mapped from 6 months of listening behavior — tempo, texture, lyrical density, and repeat patterns.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-strong flex flex-col items-center justify-center rounded-3xl p-6 md:p-10"
        >
          <MusicDNAViz data={dnaArchetypes.map((d) => ({ label: d.label, value: d.value }))} />
          <div className="mt-4 flex items-center gap-2 rounded-full border border-violet/25 bg-violet/[0.06] px-4 py-1.5">
            <Dna className="h-3.5 w-3.5 text-violet-bright" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-violet-bright">
              Dominant archetype: Dreamer
            </span>
          </div>
        </motion.div>

        {/* breakdown */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <h3 className="mb-6 font-display text-lg font-semibold text-ink">Archetype breakdown</h3>
          <div className="space-y-5">
            {dnaArchetypes.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
              >
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-ink">{a.label}</span>
                  <span className="font-mono text-xs text-cyan-bright">{Math.round(a.value * 100)}%</span>
                </div>
                <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.value * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                  />
                </div>
                <p className="text-xs text-fog">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
