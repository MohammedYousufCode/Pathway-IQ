import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/useToast'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    toast({ title: 'Signed out', description: 'See you next time!' })
    navigate('/')
  }

  const isLanding = location.pathname === '/'

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center group-hover:bg-violet-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M6 18 L12 6 L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="6" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-white">PathwayIQ</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isLanding && (
              <>
                <a href="#how-it-works" className="text-white/60 hover:text-white text-sm transition-colors">How it Works</a>
                <a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">Features</a>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/profile" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-white/50 text-sm">{user.user_metadata?.full_name || user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-2 p-4 flex flex-col gap-3"
          >
            {isLanding && (
              <>
                <a href="#how-it-works" className="text-white/70 text-sm py-2" onClick={() => setMobileOpen(false)}>How it Works</a>
                <a href="#features" className="text-white/70 text-sm py-2" onClick={() => setMobileOpen(false)}>Features</a>
              </>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="text-white/70 text-sm py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="text-white/70 text-sm py-2" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
