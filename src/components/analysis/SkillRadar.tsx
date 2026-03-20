import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { SkillItem } from '@/lib/supabase'

interface SkillRadarProps {
  candidateSkills: SkillItem[]
  requiredSkills: SkillItem[]
}

const levelToScore = (level: string): number => {
  switch (level?.toLowerCase()) {
    case 'expert': return 100
    case 'advanced': return 80
    case 'intermediate': return 60
    case 'beginner': return 35
    case 'basic': return 25
    default: return 50
  }
}

export function SkillRadar({ candidateSkills, requiredSkills }: SkillRadarProps) {
  // Build unified skill list from required skills
  const skills = requiredSkills.slice(0, 8).map((req) => {
    const candidate = candidateSkills.find(
      (c) => c.skill.toLowerCase() === req.skill.toLowerCase()
    )
    return {
      skill: req.skill.length > 14 ? req.skill.slice(0, 14) + '…' : req.skill,
      required: levelToScore(req.level),
      yours: candidate ? levelToScore(candidate.level) : 0,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={skills} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
        />
        <Radar
          name="Required"
          dataKey="required"
          stroke="#7C3AED"
          fill="#7C3AED"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="Your Skills"
          dataKey="yours"
          stroke="#22d3ee"
          fill="#22d3ee"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{value}</span>
          )}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'white',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
