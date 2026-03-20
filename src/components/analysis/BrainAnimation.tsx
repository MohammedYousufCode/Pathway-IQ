import { motion } from 'framer-motion'

export function BrainAnimation() {
  const nodes = [
    { cx: 100, cy: 80 }, { cx: 200, cy: 60 }, { cx: 300, cy: 80 },
    { cx: 60, cy: 160 }, { cx: 160, cy: 140 }, { cx: 240, cy: 160 }, { cx: 340, cy: 140 },
    { cx: 100, cy: 240 }, { cx: 200, cy: 220 }, { cx: 300, cy: 240 },
  ]
  const edges = [
    [0,1],[1,2],[0,3],[1,4],[2,5],[2,6],[3,4],[4,5],[5,6],
    [3,7],[4,8],[5,8],[6,9],[7,8],[8,9],
  ]

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="400" height="320" viewBox="0 0 400 320">
          <defs>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <ellipse cx="200" cy="160" rx="190" ry="150" fill="url(#bgGlow)" />

          {edges.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={nodes[a].cx} y1={nodes[a].cy}
              x2={nodes[b].cx} y2={nodes[b].cy}
              stroke="#7C3AED"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              animate={{ strokeOpacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: 1.5 + (i % 3) * 0.5, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}

          {nodes.map((node, i) => (
            <motion.circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r="6"
              fill="#7C3AED"
              filter="url(#glow)"
              animate={{
                r: [5, 8, 5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  )
}
