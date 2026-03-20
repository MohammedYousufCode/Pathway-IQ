import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, BarChart2, Target, AlertTriangle, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'
import { AnalysisCard } from '@/components/analysis/AnalysisCard'
import { useAuthStore } from '@/store/authStore'
import { useAnalysesStore } from '@/store/analysesStore'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/useToast'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { analyses, setAnalyses, removeAnalysis, isLoading, setLoading } = useAnalysesStore()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setAnalyses(data || [])
      } catch {
        toast({ title: 'Failed to load analyses', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyses()
  }, [user, setAnalyses, setLoading])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('analyses').delete().eq('id', id)
      if (error) throw error
      removeAnalysis(id)
      toast({ title: 'Analysis deleted' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.readiness_score, 0) / analyses.length)
    : 0

  const topGap = analyses[0]?.skill_gaps?.[0]?.skill || '—'

  const stats = [
    { icon: BarChart2, label: 'Total Analyses', value: analyses.length.toString(), color: 'text-violet-400' },
    { icon: Target, label: 'Avg. Readiness Score', value: analyses.length ? `${avgScore}%` : '—', color: 'text-blue-400' },
    { icon: AlertTriangle, label: 'Top Skill Gap', value: topGap, color: 'text-yellow-400' },
  ]

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
          >
            <div>
              <h1 className="text-3xl font-black text-white">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-white/40 mt-1">Here's a snapshot of your career readiness journey.</p>
            </div>
            <Link to="/analyze">
              <Button size="lg" className="group shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{stat.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-white font-bold text-lg truncate max-w-[140px]">{stat.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analyses grid */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5">Your Analyses</h2>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-32 h-32 mb-6 opacity-40">
                  <Compass className="w-full h-full text-white/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No analyses yet</h3>
                <p className="text-white/40 mb-6 max-w-xs">
                  Start your first analysis to discover your skill gaps and get a personalized roadmap.
                </p>
                <Link to="/analyze">
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" /> Start Your First Analysis
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis, i) => (
                  <AnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    onDelete={handleDelete}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
