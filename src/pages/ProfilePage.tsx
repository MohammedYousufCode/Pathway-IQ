import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'
import { AnalysisCard } from '@/components/analysis/AnalysisCard'
import { useAuthStore } from '@/store/authStore'
import { useAnalysesStore } from '@/store/analysesStore'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

export function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { analyses, setAnalyses, removeAnalysis, isLoading, setLoading } = useAnalysesStore()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    const fetch = async () => {
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
    fetch()
  }, [user, setAnalyses, setLoading])

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSavingName(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() },
      })
      if (error) throw error
      setUser(data.user)
      setEditingName(false)
      toast({ title: 'Name updated!' })
    } catch {
      toast({ title: 'Failed to update name', variant: 'destructive' })
    } finally {
      setSavingName(false)
    }
  }

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

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-white mb-8"
          >
            Profile
          </motion.h1>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-7 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0">
                {initials}
              </div>

              <div className="flex-1 space-y-3">
                {/* Name */}
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-white/30 shrink-0" />
                  {editingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') setEditingName(false)
                        }}
                      />
                      <button onClick={handleSaveName} disabled={savingName} className="text-green-400 hover:text-green-300">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingName(false)} className="text-white/30 hover:text-white/60">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {user?.user_metadata?.full_name || 'No name set'}
                      </span>
                      <button
                        onClick={() => {
                          setNewName(user?.user_metadata?.full_name || '')
                          setEditingName(true)
                        }}
                        className="text-white/25 hover:text-violet-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/30 shrink-0" />
                  <span className="text-white/60">{user?.email}</span>
                </div>

                {/* Joined */}
                <div className="text-white/30 text-xs">
                  Member since {user?.created_at ? formatDate(user.created_at) : '—'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Past analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-white mb-5">
              Past Analyses ({analyses.length})
            </h2>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <p>No analyses yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
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
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
