import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, X, CheckCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'
import { BrainAnimation } from '@/components/analysis/BrainAnimation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { extractTextFromPDF } from '@/lib/pdfParser'
import { toast } from '@/hooks/useToast'

type Step = 'upload' | 'processing' | 'done'

const PROCESSING_MESSAGES = [
  'Parsing your resume…',
  'Extracting key skills and experience…',
  'Analyzing job description requirements…',
  'Identifying skill gaps…',
  'Building your personalized roadmap…',
  'Finalizing recommendations…',
]

export function AnalyzePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('upload')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setResumeFile(file)
    } else {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast({ title: 'Please upload your resume', variant: 'destructive' })
      return
    }
    if (!jdText.trim()) {
      toast({ title: 'Please paste the job description', variant: 'destructive' })
      return
    }
    if (!user) return

    setStep('processing')

    // Cycle processing messages
    let msgIdx = 0
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % PROCESSING_MESSAGES.length
      setProcessingMsgIdx(msgIdx)
    }, 2200)

    // Animate progress bar
    let prog = 0
    const progInterval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 8, 90)
      setProgress(Math.round(prog))
    }, 400)

    try {
      // 1. Extract PDF text client-side
      const resumeText = await extractTextFromPDF(resumeFile)

      // 2. Upload PDF to Supabase Storage
      const filePath = `resumes/${user.id}/${Date.now()}_${resumeFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, { upsert: true })
      if (uploadError) console.warn('Storage upload failed (non-fatal):', uploadError.message)

      // 3. Call Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke('analyze-gaps', {
        body: {
          resumeText,
          jdText: jdText.trim(),
          userEmail: user.email,
          userName: user.user_metadata?.full_name || 'User',
        },
      })
      if (fnError) throw fnError

      const result = fnData

      // 4. Save to Supabase DB
      const { data: analysisRow, error: dbError } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          job_title: result.job_title,
          readiness_score: result.readiness_score,
          candidate_skills: result.candidate_skills,
          required_skills: result.required_skills,
          skill_gaps: result.skill_gaps,
          learning_pathway: result.learning_pathway,
          reasoning_trace: result.reasoning_trace,
        })
        .select()
        .single()
      if (dbError) throw dbError

      // 5. Trigger email (non-blocking)
      supabase.functions.invoke('send-result-email', {
        body: {
          userEmail: user.email,
          userName: user.user_metadata?.full_name || 'User',
          jobTitle: result.job_title,
          readinessScore: result.readiness_score,
          topGaps: result.skill_gaps?.slice(0, 3).map((g: { skill: string }) => g.skill) || [],
          roadmapUrl: `${window.location.origin}/roadmap/${analysisRow.id}`,
        },
      }).catch(console.warn)

      clearInterval(msgInterval)
      clearInterval(progInterval)
      setProgress(100)
      setStep('done')

      setTimeout(() => navigate(`/results/${analysisRow.id}`), 800)
    } catch (err: unknown) {
      clearInterval(msgInterval)
      clearInterval(progInterval)
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      toast({ title: 'Analysis failed', description: msg, variant: 'destructive' })
      setStep('upload')
      setProgress(0)
    }
  }

  const stepLabels = ['Upload', 'Processing', 'Results']
  const currentStepIdx = step === 'upload' ? 0 : step === 'processing' ? 1 : 2

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] pt-24 pb-16 px-4">

        {/* Full-screen processing overlay */}
        <AnimatePresence>
          {(step === 'processing' || step === 'done') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-center px-4"
            >
              <div className="max-w-md w-full text-center">
                <BrainAnimation />

                <motion.div
                  key={processingMsgIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 mb-8"
                >
                  {step === 'done' ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                      <p className="text-xl font-bold text-white">Analysis Complete!</p>
                      <p className="text-white/40">Redirecting to your results…</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-semibold text-white mb-2">
                        {PROCESSING_MESSAGES[processingMsgIdx]}
                      </p>
                      <p className="text-white/40 text-sm">This usually takes 15–30 seconds</p>
                    </>
                  )}
                </motion.div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-white/30 text-xs">{progress}% complete</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto">
          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  i === currentStepIdx
                    ? 'bg-violet-600 text-white'
                    : i < currentStepIdx
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'bg-white/5 text-white/30'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < currentStepIdx ? 'bg-violet-400 text-white' : ''
                  }`}>
                    {i < currentStepIdx ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </span>
                  {label}
                </div>
                {i < stepLabels.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/20" />
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-black text-white mb-2">Analyze Your Fit</h1>
            <p className="text-white/40">Upload your resume and paste the job description to get started.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Resume upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Resume (PDF)
              </h2>

              {resumeFile ? (
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{resumeFile.name}</p>
                    <p className="text-white/40 text-xs">{(resumeFile.size / 1024).toFixed(1)} KB · PDF</p>
                  </div>
                  <button
                    onClick={() => setResumeFile(null)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`glass-card p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed min-h-[240px] ${
                    isDragActive
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 bg-violet-600/15 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className={`w-7 h-7 ${isDragActive ? 'text-violet-400' : 'text-white/30'}`} />
                  </div>
                  <p className="text-white font-semibold mb-1">
                    {isDragActive ? 'Drop your PDF here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-white/35 text-sm mb-4">or click to browse</p>
                  <span className="text-xs text-white/20 bg-white/5 px-3 py-1 rounded-full">PDF only</span>
                </div>
              )}
            </motion.div>

            {/* Job description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Job Description
              </h2>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here…&#10;&#10;Include responsibilities, required skills, qualifications, and any other relevant details."
                className="w-full h-[240px] glass-card p-5 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl transition-all"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-white/25 text-xs">Min. 100 characters recommended</p>
                <p className="text-white/25 text-xs">{jdText.length} chars</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mt-8"
          >
            <Button
              size="xl"
              onClick={handleAnalyze}
              disabled={!resumeFile || !jdText.trim()}
              className="group min-w-[240px]"
            >
              Analyze Now
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
