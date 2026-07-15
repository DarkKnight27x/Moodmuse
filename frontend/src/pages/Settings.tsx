import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Shield, Sliders, User } from 'lucide-react'

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-gradient-to-r from-violet to-cyan' : 'bg-white/10'
      }`}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  )
}

const sections = [
  {
    title: 'Account',
    icon: User,
    rows: [
      { label: 'Display name', desc: 'Alex Rivera', control: 'link', on: false },
      { label: 'Email', desc: 'alex.rivera@email.com', control: 'link', on: false },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    rows: [
      { label: 'Daily mix ready', desc: 'Get notified each morning', control: 'toggle', on: true },
      { label: 'Mood check-in reminders', desc: 'Gentle evening nudges', control: 'toggle', on: false },
      { label: 'Friend compatibility updates', desc: 'When a new match appears', control: 'toggle', on: true },
    ],
  },
  {
    title: 'Appearance',
    icon: Moon,
    rows: [
      { label: 'Reduce motion', desc: 'Minimize animations across the app', control: 'toggle', on: false },
      { label: 'High contrast glass', desc: 'Increase card border visibility', control: 'toggle', on: false },
    ],
  },
  {
    title: 'Privacy',
    icon: Shield,
    rows: [
      { label: 'Share listening data for compatibility', desc: 'Required for the Compatibility page', control: 'toggle', on: true },
      { label: 'Allow AI mood analysis', desc: 'Powers Mood Check-In recommendations', control: 'toggle', on: true },
    ],
  },
]

export default function Settings() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-bright/70">Settings</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Fine-tune your <span className="text-gradient">experience</span>
        </h1>
      </div>

      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.06, duration: 0.4 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="mb-4 flex items-center gap-2.5">
            <section.icon className="h-4 w-4 text-violet-bright" />
            <h3 className="font-display text-sm font-semibold text-ink">{section.title}</h3>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{row.label}</p>
                  <p className="truncate text-xs text-fog">{row.desc}</p>
                </div>
                {row.control === 'toggle' ? (
                  <Toggle defaultOn={row.on} />
                ) : (
                  <button className="shrink-0 text-xs font-medium text-cyan-bright hover:text-cyan-bright/80">
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="flex items-center gap-2 pb-4 text-xs text-fog">
        <Sliders className="h-3.5 w-3.5" />
        MoodMuse AI Sonic Lab · v1.0.0
      </div>
    </div>
  )
}
