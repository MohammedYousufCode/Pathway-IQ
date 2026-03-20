import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string
          user_id: string
          job_title: string
          readiness_score: number
          candidate_skills: SkillItem[]
          required_skills: SkillItem[]
          skill_gaps: SkillGap[]
          learning_pathway: LearningNode[]
          reasoning_trace: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['analyses']['Insert']>
      }
      roadmap_progress: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          node_id: string
          completed: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['roadmap_progress']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['roadmap_progress']['Insert']>
      }
    }
  }
}

export interface SkillItem {
  skill: string
  level: string
}

export interface SkillGap {
  skill: string
  priority: 'High' | 'Medium' | 'Low'
  reason: string
}

export interface Resource {
  title: string
  url: string
}

export interface LearningNode {
  id: string
  topic: string
  estimatedTime: string
  resources: Resource[]
  reason: string
}

export interface AnalysisResult {
  job_title: string
  readiness_score: number
  candidate_skills: SkillItem[]
  required_skills: SkillItem[]
  skill_gaps: SkillGap[]
  learning_pathway: LearningNode[]
  reasoning_trace: string
}
