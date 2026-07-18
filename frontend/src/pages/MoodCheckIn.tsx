import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import api from '../lib/api'   // ← Yeh line add kar

const quickMoods = ['Anxious', 'Energized', 'Nostalgic', 'Numb', 'Hopeful', 'Restless']

export default function MoodCheckInWidget() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const setLastMood = useStore((s) => s.setLastMood)

  const submit = async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    setResponse(null)
    setLastMood(text)

    try {
      const res = await api.post('/mood/detect', { text })
      setResponse(res.data.message || "Mood analyzed successfully!")
    } catch (err) {
      setResponse("AI Therapist is thinking... Here's a suggestion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-cyan/20 ring-1 ring-violet/30">
          <Sparkles className="h-4 w-4 text-violet-bright" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-ink">AI Sonic Therapist</p>
          <p className="text-xs text-fog">Tell me how you're feeling — I'll tune your sound to match</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {quickMoods.map((mood) => (
          <motion.button
            key={mood}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInput(mood)
              submit(mood)
            }}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-mist transition-colors hover:border-violet/40 hover:text-ink"
          >
            {mood}
          </motion.button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="relative"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Overwhelmed from work but trying to stay optimistic tonight..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 pr-14 text-sm text-ink placeholder:text-fog/70 outline-none transition-colors focus:border-violet/50"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.9 }}
          disabled={loading || !input.trim()}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan text-white disabled:opacity-40"
          aria-label="Submit mood check-in"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </motion.button>
      </form>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-4"
          >
            <p className="text-sm leading-relaxed text-mist">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}