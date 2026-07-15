import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Compass,
  Dna,
  ListMusic,
  HeartHandshake,
  BarChart3,
  Users,
  Settings as SettingsIcon,
  AudioLines,
  Menu,
  X,
} from 'lucide-react'
import { useStore } from '../store/useStore'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/music-dna', label: 'Music DNA', icon: Dna },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/mood-check-in', label: 'Mood Check-In', icon: HeartHandshake },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/compatibility', label: 'Compatibility', icon: Users },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-7">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-cyan glow-ring">
        <AudioLines className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
        MoodMuse
      </span>
    </div>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate}>
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                isActive ? 'text-ink' : 'text-fog hover:text-mist'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-violet/25 bg-gradient-to-r from-violet/15 to-cyan/5"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon
                className={`relative z-10 h-[18px] w-[18px] transition-colors ${
                  isActive ? 'text-cyan-bright' : 'text-fog group-hover:text-mist'
                }`}
                strokeWidth={1.8}
              />
              <span className="relative z-10 font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function EngineStatus() {
  return (
    <div className="mx-3 mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-fog">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
        </span>
        Sonic engine active
      </div>
    </div>
  )
}

export default function Sidebar() {
  const mobileOpen = useStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useStore((s) => s.toggleSidebar)

  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/[0.06] bg-abyss/70 backdrop-blur-2xl md:flex">
        <Logo />
        <NavList />
        <EngineStatus />
      </aside>

      {/* mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-abyss/80 px-4 py-3.5 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet to-cyan">
            <AudioLines className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            MoodMuse
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-mist active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-abyss/95 backdrop-blur-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-4 pt-5">
                <Logo />
                <button
                  onClick={toggleSidebar}
                  className="mr-2 rounded-lg p-1.5 text-mist active:scale-95"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavList onNavigate={toggleSidebar} />
              <EngineStatus />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
