import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ExternalLink, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { LearningNode } from '@/lib/supabase'

interface NodeDrawerProps {
  node: LearningNode | null
  isCompleted: boolean
  onClose: () => void
  onToggleComplete: (nodeId: string, completed: boolean) => void
}

export function NodeDrawer({ node, isCompleted, onClose, onToggleComplete }: NodeDrawerProps) {
  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[#1E293B] border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/30" />
                )}
                <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                  Learning Module
                </span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{node.topic}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      <Clock className="w-3 h-3 mr-1" />
                      {node.estimatedTime}
                    </Badge>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Why This Matters</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{node.reason}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
                    Resources ({node.resources?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {node.resources?.map((resource, i) => (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 glass-card-hover rounded-lg group"
                      >
                        <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                          {resource.title}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-violet-400 shrink-0 ml-2" />
                      </a>
                    ))}
                    {(!node.resources || node.resources.length === 0) && (
                      <p className="text-white/30 text-sm">No resources listed.</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-5 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Mark as Complete</p>
                  <p className="text-xs text-white/40">Track your progress</p>
                </div>
                <Switch
                  checked={isCompleted}
                  onCheckedChange={(checked) => onToggleComplete(node.id, checked)}
                />
              </div>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center text-green-400 text-sm font-medium"
                >
                  ✓ Module completed!
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
