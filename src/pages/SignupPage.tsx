import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/hooks/useToast'

export function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setSession } = useAuthStore()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      if (data.user) {
        setUser(data.user)
        setSession(data.session)
        toast({ title: 'Account created!', description: 'Welcome to PathwayIQ.' })
        navigate('/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account'
      toast({ title: 'Signup failed', description: msg, variant: 'destructive' })
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
            src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1000&q=80"
            alt="Abstract gradient"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0F172A]" />
          <div className="absolute inset-0 bg-violet-900/20" />
          <div className="absolute bottom-12 left-12 right-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-3xl font-black text-white mb-2">Start your journey today.</h2>
              <p className="text-white/50">Join thousands of professionals closing their skill gaps with AI.</p>
            </motion.div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 18 L12 6 L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-white text-lg">PathwayIQ</span>
            </Link>

            <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-white/40 mb-8">Free forever. No credit card required.</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
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
                    placeholder="Min. 6 characters"
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
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Create Account
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Log In</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
