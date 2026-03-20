import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeProps,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'
import { NodeDrawer } from '@/components/roadmap/NodeDrawer'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/useToast'
import type { Database, LearningNode } from '@/lib/supabase'

type Analysis = Database['public']['Tables']['analyses']['Row']

// ── Custom node — defined OUTSIDE component so the reference is stable ──
function RoadmapNode({ data }: NodeProps) {
  return (
    <div
      className={`px-4 py-3 rounded-xl border cursor-pointer transition-all select-none min-w-[160px] max-w-[200px] ${
        data.completed
          ? 'bg-green-900/40 border-green-500/50 shadow-green-500/20 shadow-lg'
          : data.selected
          ? 'bg-violet-800/60 border-violet-400/70 shadow-violet-500/30 shadow-xl'
          : 'bg-[#1E293B]/90 border-white/15 hover:border-violet-500/50 hover:bg-violet-900/20 shadow-lg'
      }`}
    >
      <p className="font-semibold text-white text-xs leading-tight mb-1.5">{data.label}</p>
      <div className="flex items-center gap-1">
        <Clock className="w-2.5 h-2.5 text-white/30" />
        <span className="text-white/35 text-[10px]">{data.estimatedTime}</span>
      </div>
      {data.completed && (
        <div className="mt-1.5">
          <span className="text-[10px] text-green-400 font-semibold">✓ Complete</span>
        </div>
      )}
    </div>
  )
}

// Must be stable (module-level constant, not inside a component)
const nodeTypes = { roadmapNode: RoadmapNode }

function buildFlow(pathway: LearningNode[], completedNodes: Set<string>) {
  const cols = 3
  const xGap = 260
  const yGap = 140

  const nodes: Node[] = pathway.map((item, i) => ({
    id: item.id,
    type: 'roadmapNode',
    position: {
      x: (i % cols) * xGap + (Math.floor(i / cols) % 2 === 1 ? xGap / 2 : 0) + 40,
      y: Math.floor(i / cols) * yGap + 40,
    },
    data: {
      label: item.topic,
      estimatedTime: item.estimatedTime,
      completed: completedNodes.has(item.id),
    },
  }))

  const edges: Edge[] = pathway.slice(0, -1).map((item, i) => ({
    id: `e${i}`,
    source: item.id,
    target: pathway[i + 1].id,
    animated: !completedNodes.has(item.id),
    style: {
      stroke: completedNodes.has(item.id) ? '#22c55e' : '#7C3AED',
      strokeWidth: 2,
      opacity: 0.6,
    },
  }))

  return { nodes, edges }
}

// ── Inner component that uses ReactFlow hooks (must be inside ReactFlowProvider) ──
function RoadmapCanvas() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Load analysis + progress
  useEffect(() => {
    const load = async () => {
      if (!id || !user) return
      try {
        const [{ data: analysisData, error: aErr }, { data: progressData, error: pErr }] =
          await Promise.all([
            supabase.from('analyses').select('*').eq('id', id).single(),
            supabase.from('roadmap_progress').select('*').eq('analysis_id', id).eq('user_id', user.id),
          ])
        if (aErr) throw aErr
        if (pErr) console.warn('Progress load failed:', pErr)
        setAnalysis(analysisData)
        const done = new Set<string>(
          (progressData || []).filter((p) => p.completed).map((p) => p.node_id)
        )
        setCompletedNodes(done)
      } catch {
        toast({ title: 'Failed to load roadmap', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, user])

  // Build flow whenever analysis or completedNodes changes
  useEffect(() => {
    if (!analysis?.learning_pathway) return
    const pathway = analysis.learning_pathway as LearningNode[]
    if (!pathway.length) return
    const { nodes: n, edges: e } = buildFlow(pathway, completedNodes)
    setNodes(n)
    setEdges(e)
  }, [analysis, completedNodes, setNodes, setEdges])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const pathway = analysis?.learning_pathway as LearningNode[] | undefined
      const found = pathway?.find((n) => n.id === node.id) || null
      setSelectedNode(found)
    },
    [analysis]
  )

  const handleToggleComplete = async (nodeId: string, completed: boolean) => {
    if (!user || !id) return
    const updated = new Set(completedNodes)
    if (completed) updated.add(nodeId)
    else updated.delete(nodeId)
    setCompletedNodes(updated)

    // Rebuild graph immediately so color updates without re-fetching
    if (analysis?.learning_pathway) {
      const { nodes: n, edges: e } = buildFlow(
        analysis.learning_pathway as LearningNode[],
        updated
      )
      setNodes(n)
      setEdges(e)
    }

    try {
      await supabase.from('roadmap_progress').upsert(
        { analysis_id: id, user_id: user.id, node_id: nodeId, completed },
        { onConflict: 'analysis_id,user_id,node_id' }
      )
    } catch {
      toast({ title: 'Failed to save progress', variant: 'destructive' })
    }
  }

  const pathway = (analysis?.learning_pathway as LearningNode[]) || []
  const completionPct = pathway.length
    ? Math.round((completedNodes.size / pathway.length) * 100)
    : 0

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] flex flex-col pt-20">

        {/* Top bar */}
        <div className="px-4 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/results/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Results
              </Button>
            </Link>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <div>
                <h1 className="text-white font-bold">{analysis?.job_title} Roadmap</h1>
                <p className="text-white/35 text-xs">{pathway.length} learning modules</p>
              </div>
            )}
          </div>

          <div className="sm:ml-auto flex items-center gap-4 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-white/40 text-xs">Progress</span>
                <span className="text-white/60 text-xs font-semibold">{completionPct}%</span>
              </div>
              <Progress value={completionPct} />
            </div>
            <span className="text-white/40 text-xs whitespace-nowrap">
              {completedNodes.size}/{pathway.length}
            </span>
          </div>
        </div>

        {/* React Flow canvas */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !pathway.length ? (
          <div className="flex-1 flex items-center justify-center text-white/40">
            <p>No learning pathway found for this analysis.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
            style={{ height: 'calc(100vh - 140px)' }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.3}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="rgba(255,255,255,0.04)"
              />
              <Controls />
              <MiniMap
                nodeColor={(node) =>
                  completedNodes.has(node.id) ? '#22c55e' : '#7C3AED'
                }
                maskColor="rgba(15,23,42,0.85)"
              />
            </ReactFlow>
          </motion.div>
        )}

        {/* Node drawer */}
        <NodeDrawer
          node={selectedNode}
          isCompleted={selectedNode ? completedNodes.has(selectedNode.id) : false}
          onClose={() => setSelectedNode(null)}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </PageWrapper>
  )
}

// ── Exported page: wraps the canvas in ReactFlowProvider ──
export function RoadmapPage() {
  return (
    <ReactFlowProvider>
      <RoadmapCanvas />
    </ReactFlowProvider>
  )
}