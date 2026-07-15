import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string
  cover: string
  duration: number // seconds
  color: string // accent color for visualizer
}

export interface Playlist {
  id: string
  title: string
  subtitle: string
  cover: string
  trackCount: number
}

interface StoreState {
  // user
  userName: string

  // player
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number // 0-1
  liked: boolean
  volume: number

  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  setProgress: (value: number) => void
  toggleLike: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void

  // sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // mood
  lastMood: string | null
  setLastMood: (mood: string) => void
}

export const useStore = create<StoreState>((set, get) => ({
  userName: 'Alex',

  currentTrack: null,
  queue: [],
  isPlaying: false,
  progress: 0.32,
  liked: false,
  volume: 0.8,

  playTrack: (track, queue) =>
    set({
      currentTrack: track,
      queue: queue ?? get().queue,
      isPlaying: true,
      progress: 0,
      liked: false,
    }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setProgress: (value) => set({ progress: value }),

  toggleLike: () => set((s) => ({ liked: !s.liked })),

  next: () => {
    const { queue, currentTrack } = get()
    if (!queue.length || !currentTrack) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const nextTrack = queue[(idx + 1) % queue.length]
    set({ currentTrack: nextTrack, progress: 0, isPlaying: true, liked: false })
  },

  prev: () => {
    const { queue, currentTrack } = get()
    if (!queue.length || !currentTrack) return
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    const prevTrack = queue[(idx - 1 + queue.length) % queue.length]
    set({ currentTrack: prevTrack, progress: 0, isPlaying: true, liked: false })
  },

  setVolume: (v) => set({ volume: v }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  lastMood: null,
  setLastMood: (mood) => set({ lastMood: mood }),
}))
