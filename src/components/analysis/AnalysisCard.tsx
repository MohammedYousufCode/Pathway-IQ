import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreCircle } from './ScoreCircle'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/lib/supabase'

type Analysis = Database['public']['Tables']['analyses']['Row']

interface AnalysisCardProps {
  analysis: Analysis
  onDelete?: (id: string) => void
  index?: number
}

export function AnalysisCard({ analysis, onDelete, index = 0 }: AnalysisCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card-hover p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{analysis.job_title}</h3>
          <div className="flex items-center gap-1.5 text-white/40 text-xs mt-1">
            <Calendar className="w-3 h-3" />
            {formatDate(analysis.created_at)}
          </div>
        </div>
        <ScoreCircle score={analysis.readiness_score} size={72} strokeWidth={6} showLabel={false} />
      </div>

      <div className="flex items-center gap-2">
        <Link to={`/results/${analysis.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full group">
            View Results
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Link to={`/roadmap/${analysis.id}`}>
          <Button size="sm" className="flex-1">Roadmap</Button>
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(analysis.id)}
            className="text-white/30 hover:text-red-400 hover:bg-red-500/10 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
