import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Sparkles,
  Wand2,
  Zap,
  Cloud,
  CloudRain,
  Brain,
  Heart,
  Rocket,
  Waves,
  Moon,
  Wind,
  BookOpen,
  Car,
  Sofa,
  MoonStar,
  Dumbbell,
  Mic2,
  Shuffle as ShuffleIcon,
  AudioLines,
  Clock,
  Gauge,
  FileText,
  History,
  Users,
  ShieldAlert,
  Languages,
  SlidersHorizontal,
  CalendarClock,
  Globe,
  Star,
  ArrowLeft,
  Check,
  Play,
  BookmarkPlus,
  BookmarkCheck,
  Loader2,
  WifiOff,
} from 'lucide-react'
import { useStore, type Track } from '../store/useStore'
import api from '../lib/api'

// ============================================================
// static data
// ============================================================

interface QOption {
  label: string
  icon?: LucideIcon
}

interface MoodQuestion {
  key: string
  title: string
  type: 'select' | 'text'
  headerIcon: LucideIcon
  options?: QOption[]
}

const languageOptions: string[] = [
  'English',
  'Hindi',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Korean',
  'Japanese',
  'Spanish',
  'No Preference',
]

const artistOptions: string[] = [
  'Arijit Singh',
  'The Weeknd',
  'Diljit Dosanjh',
  'Taylor Swift',
  'AR Rahman',
  'BTS',
  'Dua Lipa',
  'Anirudh Ravichander',
  'Karan Aujla',
  'Billie Eilish',
  'Surprise me',
  'No strong preference',
]

const moodQuestions: MoodQuestion[] = [
  {
    key: 'feeling',
    title: 'How are you feeling right now?',
    type: 'select',
    headerIcon: Heart,
    options: [
      { label: 'Energetic & Upbeat', icon: Zap },
      { label: 'Calm & Relaxed', icon: Cloud },
      { label: 'Melancholic / Emotional', icon: CloudRain },
      { label: 'Focused / Deep Work', icon: Brain },
      { label: 'Romantic / Dreamy', icon: Heart },
    ],
  },
  {
    key: 'energy',
    title: 'What kind of energy do you want right now?',
    type: 'select',
    headerIcon: Zap,
    options: [
      { label: 'High energy, danceable', icon: Rocket },
      { label: 'Medium energy, groovy', icon: Waves },
      { label: 'Low energy, atmospheric', icon: Moon },
      { label: 'Very chill / lo-fi', icon: Wind },
    ],
  },
  {
    key: 'activity',
    title: 'What are you doing right now?',
    type: 'select',
    headerIcon: BookOpen,
    options: [
      { label: 'Working / Studying', icon: BookOpen },
      { label: 'Driving / Commuting', icon: Car },
      { label: 'Relaxing at home', icon: Sofa },
      { label: 'Late night vibes', icon: MoonStar },
      { label: 'Workout / Gym', icon: Dumbbell },
    ],
  },
  {
    key: 'vocals',
    title: 'Do you prefer vocals or instrumental?',
    type: 'select',
    headerIcon: Mic2,
    options: [
      { label: 'Mostly vocals', icon: Mic2 },
      { label: 'Mix of both', icon: ShuffleIcon },
      { label: 'Mostly instrumental', icon: AudioLines },
    ],
  },
  {
    key: 'length',
    title: 'How long do you want the playlist to be?',
    type: 'select',
    headerIcon: Clock,
    options: [
      { label: '30–45 mins', icon: Clock },
      { label: '1 hour', icon: Clock },
      { label: '1.5+ hours', icon: Clock },
    ],
  },
  {
    key: 'tempo',
    title: 'What tempo do you prefer?',
    type: 'select',
    headerIcon: Gauge,
    options: [
      { label: 'Slow & Mellow' },
      { label: 'Medium & Groovy' },
      { label: 'Fast & Driving' },
      { label: 'Mixed Tempo' },
    ],
  },
  {
    key: 'lyricsStyle',
    title: 'Do you want lyrics-heavy songs or more atmospheric?',
    type: 'select',
    headerIcon: FileText,
    options: [
      { label: 'Lyrics-heavy' },
      { label: 'Atmospheric / instrumental-leaning' },
      { label: 'Mix of both' },
    ],
  },
  {
    key: 'era',
    title: 'Are you in the mood for new releases or timeless classics?',
    type: 'select',
    headerIcon: History,
    options: [
      { label: 'New releases' },
      { label: 'Timeless classics' },
      { label: 'Mix of both' },
    ],
  },
  {
    key: 'vocalGender',
    title: 'Do you prefer male, female, or mixed vocals?',
    type: 'select',
    headerIcon: Users,
    options: [
      { label: 'Male vocals' },
      { label: 'Female vocals' },
      { label: 'Mixed / group vocals' },
      { label: 'No preference' },
    ],
  },
  {
    key: 'vibe',
    title: 'What kind of vibe are you looking for?',
    type: 'select',
    headerIcon: Sparkles,
    options: [
      { label: 'Chill' },
      { label: 'Intense' },
      { label: 'Romantic' },
      { label: 'Motivational' },
      { label: 'Nostalgic' },
      { label: 'Dark & Moody' },
    ],
  },
  {
    key: 'explicit',
    title: 'Are you okay with explicit content?',
    type: 'select',
    headerIcon: ShieldAlert,
    options: [
      { label: "Yes, that's fine" },
      { label: 'Keep it clean' },
      { label: "Doesn't matter" },
    ],
  },
  {
    key: 'languageMix',
    title: 'Do you want songs in one language or mixed languages?',
    type: 'select',
    headerIcon: Languages,
    options: [
      { label: 'One language only' },
      { label: 'Mixed languages' },
    ],
  },
  {
    key: 'production',
    title: 'How important is the production quality to you?',
    type: 'select',
    headerIcon: SlidersHorizontal,
    options: [
      { label: 'Very important — polished & hi-fi' },
      { label: 'Somewhat important' },
      { label: "Doesn't matter, raw is fine" },
    ],
  },
  {
    key: 'decade',
    title: 'Do you want songs from a specific decade?',
    type: 'select',
    headerIcon: CalendarClock,
    options: [
      { label: '2020s' },
      { label: '2010s' },
      { label: '2000s' },
      { label: '90s' },
      { label: '80s & earlier' },
      { label: 'No preference' },
    ],
  },
  {
    key: 'notes',
    title: 'Any specific mood or feeling you want to enhance?',
    type: 'text',
    headerIcon: Wand2,
  },
]

// ============================================================
// backend + fallback playlist generation
// ============================================================

interface QuizPayload {
  languages: string[]
  artists: string[]
  answers: Record<string, string>
  notes: string
}

interface QuizResult {
  name: string
  description: string
  tracks: Track[]
}

const resultCovers = [
  'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80',
  'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=300&q=80',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&q=80',
]

const fakeArtistPool = [
  'Kilo Vane', 'Pell & Rae', 'Obsidian Youth', 'Vera Lux', 'Nova Field',
  'Kaz Meridian', 'Yuna Kite', 'Peregrine', 'Aria Voss', 'Nova & the Static',
]

const playlistNameByFeeling: Record<string, string> = {
  'Energetic & Upbeat': 'Voltage Bloom',
  'Calm & Relaxed': 'Soft Static',
  'Melancholic / Emotional': 'Blue Hour Echoes',
  'Focused / Deep Work': 'Signal Lock',
  'Romantic / Dreamy': 'Velvet Frequency',
}

// Local fallback used when the backend at localhost:8000 is unreachable,
// so the quiz still feels complete during frontend-only development.
function generateFallbackPlaylist(payload: QuizPayload): QuizResult {
  const name = playlistNameByFeeling[payload.answers.feeling] ?? 'Custom Frequency'
  const langPart =
    payload.languages.length && !payload.languages.includes('No Preference')
      ? ` in ${payload.languages.join(', ')}`
      : ''
  const description = `A ${payload.answers.energy?.toLowerCase() ?? 'balanced'} mix${langPart}, tuned for ${
    payload.answers.activity?.toLowerCase() ?? 'right now'
  } with a ${payload.answers.vibe?.toLowerCase() ?? 'custom'} edge. Runs about ${
    payload.answers.length ?? '1 hour'
  }.`

  const tracks: Track[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `quiz-${i}`,
    title: ['Static Bloom', 'Afterglow Drift', 'Low Light Signal', 'Paper Moons', 'Second Wind'][i],
    artist: fakeArtistPool[(i + (payload.answers.feeling?.length ?? 0)) % fakeArtistPool.length],
    cover: resultCovers[i % resultCovers.length],
    duration: 180 + i * 22,
    color: i % 2 === 0 ? '#a855f7' : '#22d3ee',
  }))

  return { name, description, tracks }
}



async function ensureMinDelay(start: number, minMs: number) {
  const elapsed = Date.now() - start
  if (elapsed < minMs) await new Promise((r) => setTimeout(r, minMs - elapsed))
}

// ============================================================
// shared bits
// ============================================================

type Stage = 'idle' | 'language' | 'artist' | 'quiz' | 'loading' | 'results'

function ProgressBar({ index, total }: { index: number; total: number }) {
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        animate={{ width: `${((index + 1) / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
      />
    </div>
  )
}

function MultiSelectGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (label: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((label) => {
        const isSelected = selected.includes(label)
        return (
          <motion.button
            key={label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(label)}
            className={`relative flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
              isSelected
                ? 'border-violet/50 bg-violet/[0.1] text-ink'
                : 'border-white/10 bg-white/[0.02] text-mist hover:border-violet/30 hover:text-ink'
            }`}
          >
            <span>{label}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0 text-cyan-bright" />}
          </motion.button>
        )
      })}
    </div>
  )
}

// ============================================================
// main component
// ============================================================

export default function MoodQuiz() {
  const [stage, setStage] = useState<Stage>('idle')
  const [languages, setLanguages] = useState<string[]>([])
  const [artists, setArtists] = useState<string[]>([])
  const [quizStep, setQuizStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const playTrack = useStore((s) => s.playTrack)

  const totalSteps = 2 + moodQuestions.length
  const overallIndex =
    stage === 'language' ? 0 : stage === 'artist' ? 1 : stage === 'quiz' ? 2 + quizStep : totalSteps - 1

  const currentQuestion = moodQuestions[quizStep]
  const isLastQuestion = quizStep === moodQuestions.length - 1
  const currentAnswer = currentQuestion ? answers[currentQuestion.key] : undefined

  const resetAll = () => {
    setLanguages([])
    setArtists([])
    setQuizStep(0)
    setAnswers({})
    setNotes('')
    setSaved(false)
    setResult(null)
    setUsedFallback(false)
  }

  const startQuiz = () => {
    resetAll()
    setStage('language')
  }

  const toggleLanguage = (label: string) =>
    setLanguages((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))

  const toggleArtist = (label: string) =>
    setArtists((prev) => (prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]))

  const selectMoodOption = (label: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: label }))
    if (!isLastQuestion) {
      setTimeout(() => setQuizStep((s) => s + 1), 260)
    }
  }

  const goBack = () => {
    if (stage === 'artist') return setStage('language')
    if (stage === 'quiz') {
      if (quizStep === 0) return setStage('artist')
      return setQuizStep((s) => s - 1)
    }
    if (stage === 'language') return setStage('idle')
  }

const submit = async () => {
  setStage('loading')
  const payload = { languages, artists, answers, notes }
  const start = Date.now()
  try {
    const res = await api.post('/assessment/submit', {
      languages,
      favorite_artists: artists,
      mood: answers.feeling || 'balanced'
    }, {
      params: { mood_text: notes || Object.values(answers).join(' '), preference: 'popular' }
    })
    const parsed = parseBackendResponse(res.data)
    await ensureMinDelay(start, 1200)
    setResult(parsed)
    setUsedFallback(false)
  } catch (err) {
    console.warn('[MoodQuiz] backend unreachable, using local preview data:', err)
    await ensureMinDelay(start, 1200)
    setResult(generateFallbackPlaylist(payload))
    setUsedFallback(true)
  }
  setStage('results')
}

  return (
    <motion.div
      layout
      className="glass-strong relative overflow-hidden rounded-3xl border border-violet/[0.15] p-6 md:p-10"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan/15 blur-[100px]" />

      <AnimatePresence mode="wait">
        {/* ---------------- IDLE ---------------- */}
        {stage === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col items-center gap-5 py-4 text-center md:py-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/30 to-cyan/20 ring-1 ring-violet/30">
              <Wand2 className="h-6 w-6 text-violet-bright" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                Discover Your <span className="text-gradient">Perfect Mood Playlist</span>
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-fog md:text-base">
                Answer a few quick questions and get a personalized playlist instantly
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={startQuiz}
              className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              <Sparkles className="h-4 w-4" />
              Take the Quiz
            </motion.button>
          </motion.div>
        )}

        {/* ---------------- LANGUAGE ---------------- */}
        {stage === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <QuizHeader
              onBack={goBack}
              index={overallIndex}
              total={totalSteps}
              icon={Globe}
              title="Which languages do you want to hear?"
              subtitle="Pick as many as you like"
            />
            <MultiSelectGrid options={languageOptions} selected={languages} onToggle={toggleLanguage} />
            <ContinueButton
              disabled={languages.length === 0}
              onClick={() => setStage('artist')}
            />
          </motion.div>
        )}

        {/* ---------------- ARTIST / GENRE ---------------- */}
        {stage === 'artist' && (
          <motion.div
            key="artist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <QuizHeader
              onBack={goBack}
              index={overallIndex}
              total={totalSteps}
              icon={Star}
              title="Any artists or genres you love?"
              subtitle="Select a few, or let us surprise you"
            />
            <MultiSelectGrid options={artistOptions} selected={artists} onToggle={toggleArtist} />
            <ContinueButton
              disabled={artists.length === 0}
              onClick={() => {
                setQuizStep(0)
                setStage('quiz')
              }}
            />
          </motion.div>
        )}

        {/* ---------------- MOOD QUESTIONS ---------------- */}
        {stage === 'quiz' && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <QuizHeader
              onBack={goBack}
              index={overallIndex}
              total={totalSteps}
              icon={currentQuestion.headerIcon}
              title=""
              subtitle=""
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.key}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <h3 className="mb-5 font-display text-xl font-semibold text-ink md:text-2xl">
                  {currentQuestion.title}
                </h3>

                {currentQuestion.type === 'select' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentQuestion.options!.map((opt) => {
                      const isSelected = currentAnswer === opt.label
                      return (
                        <motion.button
                          key={opt.label}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectMoodOption(opt.label)}
                          className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                            isSelected
                              ? 'border-violet/50 bg-violet/[0.1] text-ink'
                              : 'border-white/10 bg-white/[0.02] text-mist hover:border-violet/30 hover:text-ink'
                          }`}
                        >
                          {opt.icon && (
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isSelected
                                  ? 'bg-gradient-to-br from-violet to-cyan text-white'
                                  : 'bg-white/[0.04] text-fog group-hover:text-mist'
                              }`}
                            >
                              <opt.icon className="h-4 w-4" />
                            </span>
                          )}
                          <span className="flex-1">{opt.label}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-cyan-bright" />}
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional — e.g. 'help me feel less anxious before my exam'"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-ink placeholder:text-fog/70 outline-none transition-colors focus:border-violet/50"
                  />
                )}

                {isLastQuestion && (currentQuestion.type === 'text' || currentAnswer) && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet to-cyan py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Submit & Get My Playlist
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ---------------- LOADING ---------------- */}
        {stage === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center justify-center gap-5 py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet/30 to-cyan/20 ring-1 ring-violet/30"
            >
              <Loader2 className="h-7 w-7 text-violet-bright" />
            </motion.div>
            <div className="text-center">
              <p className="font-display text-base font-semibold text-ink">Tuning your frequency…</p>
              <p className="mt-1 text-xs text-fog">Matching language, artists, mood, and tempo</p>
            </div>
          </motion.div>
        )}

        {/* ---------------- RESULTS ---------------- */}
        {stage === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-violet-bright" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-bright">
                  Your personalized playlist
                </span>
              </div>
              {usedFallback && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fog">
                  <WifiOff className="h-3 w-3" />
                  Preview data — backend offline
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {result.name}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-mist">{result.description}</p>

            <div className="mt-6 space-y-2">
              {result.tracks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.35 }}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <span className="w-4 shrink-0 text-center font-mono text-xs text-fog">{i + 1}</span>
                  <img src={t.cover} alt={t.title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                    <p className="truncate text-xs text-fog">{t.artist}</p>
                  </div>
                <span className="shrink-0 font-mono text-xs text-fog">
                    {Math.floor(t.duration / 60000)}:{(Math.floor(t.duration / 1000) % 60).toString().padStart(2, '0')}
                </span>  
                  
                </motion.div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => playTrack(result.tracks[0], result.tracks)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.35)]"
              >
                <Play className="h-4 w-4 fill-white" />
                Play Playlist
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSaved(true)}
                disabled={saved}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-ink backdrop-blur-md disabled:opacity-70"
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-cyan-bright" />
                    Saved to Library
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    Save to Library
                  </>
                )}
              </motion.button>
            </div>

            <button
              onClick={startQuiz}
              className="mt-5 text-xs font-medium text-fog transition-colors hover:text-mist"
            >
              Retake the quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================
// small helpers used by the language / artist / quiz stages
// ============================================================

function QuizHeader({
  onBack,
  index,
  total,
  icon: Icon,
  title,
  subtitle,
}: {
  onBack: () => void
  index: number
  total: number
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-6">
      <div className="mb-5 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-mist transition-colors hover:text-ink"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <ProgressBar index={index} total={total} />
        <span className="shrink-0 font-mono text-[11px] text-fog">
          {index + 1} / {total}
        </span>
      </div>
      {(title || subtitle) && (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-cyan/20 ring-1 ring-violet/30">
            <Icon className="h-4 w-4 text-violet-bright" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink md:text-xl">{title}</h3>
            {subtitle && <p className="text-xs text-fog">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function ContinueButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet to-cyan py-4 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-40"
    >
      Continue
    </motion.button>
  )
}
// Adapts whatever shape the backend returns into QuizResult.
function parseBackendResponse(data: any): QuizResult {
  const playlist = data.playlist || data
  const name = playlist.name || data.name || 'Your Custom Mix'
  const description = data.message || playlist.description || 'Advanced ML playlist ready!'
  const rawTracks = playlist || []

  const tracks: Track[] = rawTracks.map((t: any, i: number) => ({
    id: t.id ?? `backend-${i}`,
    title: t.name ?? t.title ?? `Track ${i + 1}`,
    artist: t.artists?.[0]?.name ?? t.artist ?? 'Unknown Artist',
    cover: t.album?.images?.[0]?.url ?? t.cover ?? resultCovers[i % resultCovers.length],
    duration: t.duration_ms ?? t.duration ?? 210,
    color: i % 2 === 0 ? '#a855f7' : '#22d3ee',
  }))

  return { name, description, tracks }
}