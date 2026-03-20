import { create } from 'zustand'
import type { Database } from '../lib/supabase'

type Analysis = Database['public']['Tables']['analyses']['Row']

interface AnalysesState {
  analyses: Analysis[]
  currentAnalysis: Analysis | null
  isLoading: boolean
  setAnalyses: (analyses: Analysis[]) => void
  setCurrentAnalysis: (analysis: Analysis | null) => void
  addAnalysis: (analysis: Analysis) => void
  removeAnalysis: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useAnalysesStore = create<AnalysesState>((set) => ({
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  setAnalyses: (analyses) => set({ analyses }),
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
  addAnalysis: (analysis) =>
    set((state) => ({ analyses: [analysis, ...state.analyses] })),
  removeAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
