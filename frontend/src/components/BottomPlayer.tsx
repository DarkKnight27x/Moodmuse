import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ListMusic,
  Volume2,
  Shuffle,
  Repeat,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    liked,
    togglePlay,
    setProgress,
    toggleLike,
    next,
    prev,
  } = useStore()

  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying || !currentTrack) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const inc = dt / currentTrack.duration
      const p = useStore.getState().progress
      const nextP = p + inc
      if (nextP >= 1) {
        next()
      } else {
        setProgress(nextP)
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTrack?.id])

  if (!currentTrack) return null

  const elapsed = progress * currentTrack.duration

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.07] bg-abyss/85 backdrop-blur-2xl md:left-64"
    >
      {/* progress bar */}
      <div
        className="group relative h-1 w-full cursor-pointer bg-white/[0.06]"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = (e.clientX - rect.left) / rect.width
          setProgress(Math.min(1, Math.max(0, ratio)))
        }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-violet to-cyan"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-bright opacity-0 shadow-[0_0_8px_2px_rgba(103,232,249,0.6)] transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${progress * 100}% - 5px)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* track info */}
        <div className="flex min-w-0 flex-1 items-center gap-3 md:w-64 md:flex-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentTrack.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
            />
          </AnimatePresence>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{currentTrack.title}</p>
            <p className="truncate text-xs text-fog">{currentTrack.artist}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleLike}
            className="ml-1 hidden shrink-0 md:block"
            aria-label={liked ? 'Unlike track' : 'Like track'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                liked ? 'fill-violet text-violet' : 'text-fog hover:text-mist'
              }`}
            />
          </motion.button>
        </div>

        {/* controls */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <Shuffle className="hidden h-4 w-4 text-fog hover:text-mist sm:block cursor-pointer" />
            <motion.button whileTap={{ scale: 0.85 }} onClick={prev} aria-label="Previous track">
              <SkipBack className="h-[18px] w-[18px] fill-ink text-ink" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-white shadow-[0_0_16px_rgba(168,85,247,0.5)]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-white" />
              )}
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={next} aria-label="Next track">
              <SkipForward className="h-[18px] w-[18px] fill-ink text-ink" />
            </motion.button>
            <Repeat className="hidden h-4 w-4 text-fog hover:text-mist sm:block cursor-pointer" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-mono text-[10px] text-fog">{formatTime(elapsed)}</span>
            <span className="font-mono text-[10px] text-fog">/</span>
            <span className="font-mono text-[10px] text-fog">{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* right controls */}
        <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
          <ListMusic className="h-4 w-4 text-fog hover:text-mist cursor-pointer" />
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-fog" />
            <div className="h-1 w-20 rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-mist" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
