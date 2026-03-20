import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'

export function NotFoundPage() {
  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto bg-violet-600/10 rounded-full flex items-center justify-center mb-6">
              <Compass className="w-16 h-16 text-violet-400/50 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="text-8xl font-black text-gradient mb-4">404</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-black text-white mb-3">
              Looks like you're off the map
            </h1>
            <p className="text-white/40 mb-8 leading-relaxed">
              The page you're looking for doesn't exist. Maybe your roadmap took a wrong turn?
            </p>
            <Link to="/">
              <Button size="lg" className="group">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
