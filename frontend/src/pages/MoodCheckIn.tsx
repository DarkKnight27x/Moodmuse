import { motion } from 'framer-motion'
import MoodCheckInWidget from '../components/MoodCheckIn'

export default function MoodCheckInPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Mood Check-In</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          How are you <span className="text-gradient">really</span> feeling?
        </h1>
        <p className="mt-1.5 text-sm text-fog">
          Your responses shape recommendations in real time — no judgment, just calibration.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <MoodCheckInWidget />
      </motion.div>

      <div className="glass rounded-2xl p-5">
        <p className="mb-2 font-display text-sm font-semibold text-ink">Recent check-ins</p>
        <div className="space-y-3">
          {[
            { mood: 'Wired & wide awake', time: 'Yesterday, 11:42 PM' },
            { mood: 'Content, low energy', time: '2 days ago, 8:15 PM' },
            { mood: 'Anxious before a deadline', time: '4 days ago, 2:03 PM' },
          ].map((entry) => (
            <div key={entry.time} className="flex items-center justify-between text-sm">
              <span className="text-mist">{entry.mood}</span>
              <span className="font-mono text-xs text-fog">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
