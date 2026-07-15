import { motion } from 'framer-motion'
import { useId, useMemo } from 'react'

interface DNAPoint {
  label: string
  value: number // 0-1
}

interface Props {
  data: DNAPoint[]
  size?: number
}

export default function MusicDNAViz({ data, size = 380 }: Props) {
  const gradientId = useId()
  const glowId = useId()
  const center = size / 2
  const radius = size * 0.34
  const levels = 4

  const angleFor = (i: number) => (Math.PI * 2 * i) / data.length - Math.PI / 2

  const pointAt = (i: number, r: number) => {
    const a = angleFor(i)
    return [center + r * Math.cos(a), center + r * Math.sin(a)] as const
  }

  const ringPath = (r: number) =>
    data
      .map((_, i) => {
        const [x, y] = pointAt(i, r)
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ') + ' Z'

  const dataPath = useMemo(
    () =>
      data
        .map((d, i) => {
          const [x, y] = pointAt(i, radius * d.value)
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ') + ' Z',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, radius]
  )

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[420px]">
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
        </radialGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* background rings */}
      {Array.from({ length: levels }).map((_, i) => (
        <path
          key={i}
          d={ringPath(radius * ((i + 1) / levels))}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* spokes */}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, radius)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />
        )
      })}

      {/* data fill */}
      <motion.path
        d={dataPath}
        fill={`url(#${gradientId})`}
        stroke="url(#stroke-grad)"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
      <linearGradient id="stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#67e8f9" />
      </linearGradient>
      <motion.path
        d={dataPath}
        fill="none"
        stroke="url(#stroke-grad)"
        strokeWidth={2}
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      {/* vertices */}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, radius * d.value)
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill="#fff"
            filter={`url(#${glowId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.06, duration: 0.4 }}
          />
        )
      })}

      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, radius * 1.28)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-display"
            fontSize={size * 0.032}
            fill="#b6b0d4"
            fontWeight={500}
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
