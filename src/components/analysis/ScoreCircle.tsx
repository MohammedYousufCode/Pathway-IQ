import { motion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface ScoreCircleProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export function ScoreCircle({ score, size = 140, strokeWidth = 10, showLabel = true }: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
