import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Ready'
  if (score >= 40) return 'Developing'
  return 'Needs Work'
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}
