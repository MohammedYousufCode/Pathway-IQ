import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/hooks/useToast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setSession } = useAuthStore()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setUser(data.user)
      setSession(data.session)
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in'
      toast({ title: 'Sign in failed', description: msg, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex bg-[#0F172A]">
        {/* Left image panel */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1000&q=80"
            alt="Abstract gradient path"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F172A]" />
          <div className="absolute inset-0 bg-violet-900/20" />
          <div className="absolute bottom-12 left-12 right-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-black text-white mb-2">Your career path starts here.</h2>
              <p className="text-white/50">Sign in to access your personalized roadmap.</p>
            </motion.div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <Link to="/" className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 18 L12 6 L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-white text-lg">PathwayIQ</span>
            </Link>

            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-white/40 mb-8">Sign in to continue your learning journey.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" /> Sign In
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
