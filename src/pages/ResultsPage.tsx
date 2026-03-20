import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'
import { ScoreCircle } from '@/components/analysis/ScoreCircle'
import { SkillRadar } from '@/components/analysis/SkillRadar'
import { supabase } from '@/lib/supabase'
import { getPriorityColor } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import type { Database } from '@/lib/supabase'

type Analysis = Database['public']['Tables']['analyses']['Row']

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [traceOpen, setTraceOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!id) return
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setAnalysis(data)
      } catch {
        toast({ title: 'Failed to load results', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [id])

  if (isLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="min-h-screen bg-[#0F172A] pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!analysis) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="min-h-screen bg-[#0F172A] pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl font-bold mb-4">Analysis not found</p>
            <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          >
            <div>
              <p className="text-violet-400 text-sm font-medium mb-1">Analysis Results</p>
              <h1 className="text-3xl font-black text-white">{analysis.job_title}</h1>
            </div>
            <Link to={`/roadmap/${analysis.id}`}>
              <Button size="lg" className="group shrink-0">
                <Map className="w-4 h-4 mr-2" />
                View Full Roadmap
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Score + Radar */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 flex flex-col items-center justify-center md:col-span-2"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-5">Readiness Score</p>
              <ScoreCircle score={analysis.readiness_score} size={160} strokeWidth={12} />
              <p className="text-white/40 text-sm mt-5 text-center max-w-[180px]">
                Based on {analysis.candidate_skills?.length || 0} skills extracted from your resume
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-6 md:col-span-3"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Skills Comparison</p>
              <SkillRadar
                candidateSkills={analysis.candidate_skills || []}
                requiredSkills={analysis.required_skills || []}
              />
            </motion.div>
          </div>

          {/* Skill Gaps */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-5">
              Skill Gaps ({analysis.skill_gaps?.length || 0})
            </h2>
            <div className="space-y-3">
              {analysis.skill_gaps?.map((gap, i) => (
                <motion.div
                  key={gap.skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-white/3 rounded-xl border border-white/5"
                >
                  <div className="shrink-0 mt-0.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityColor(gap.priority)}`}>
                      {gap.priority}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{gap.skill}</p>
                    <p className="text-white/45 text-sm mt-0.5 leading-relaxed">{gap.reason}</p>
                  </div>
                </motion.div>
              ))}
              {(!analysis.skill_gaps || analysis.skill_gaps.length === 0) && (
                <p className="text-white/30 text-center py-8">No skill gaps found — you're a great match!</p>
              )}
            </div>
          </motion.div>

          {/* Candidate skills quick view */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">
              Your Extracted Skills ({analysis.candidate_skills?.length || 0})
            </h2>
            <div className="flex flex-wrap gap-2">
              {analysis.candidate_skills?.map((skill) => (
                <Badge key={skill.skill} variant="secondary" className="text-xs">
                  {skill.skill}
                  <span className="ml-1.5 text-white/40">{skill.level}</span>
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Reasoning trace collapsible */}
          {analysis.reasoning_trace && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setTraceOpen(!traceOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/3 transition-colors"
              >
                <span className="font-semibold text-white">AI Reasoning Trace</span>
                {traceOpen ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>
              {traceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-5"
                >
                  <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-white/3 p-4 rounded-xl">
                    {typeof analysis.reasoning_trace === 'string'
                      ? analysis.reasoning_trace
                      : JSON.stringify(analysis.reasoning_trace, null, 2)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
