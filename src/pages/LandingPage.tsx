import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Upload, Brain, Map, Zap, BarChart2, Route, TrendingUp, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Navbar } from '@/components/layout/Navbar'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen bg-[#0F172A]">

        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&q=80"
              alt="AI background"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-[#0F172A]/60 to-[#0F172A]" />
          </div>
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-800/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6"
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-violet-300 text-xs font-medium">AI-Powered Onboarding Engine</span>
                </motion.div>

                <motion.h1
                  {...fadeUp}
                  transition={{ delay: 0.2 }}
                  className="text-5xl lg:text-6xl font-black text-white leading-tight mb-5"
                >
                  From Resume to{' '}
                  <span className="text-gradient">Ready</span>
                  {' '}— In Minutes
                </motion.h1>

                <motion.p
                  {...fadeUp}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/55 leading-relaxed mb-8 max-w-lg"
                >
                  AI-powered onboarding that learns you, not the other way around.
                  Upload your resume, paste a job description, and get a personalized
                  learning roadmap in under 60 seconds.
                </motion.p>

                <motion.div
                  {...fadeUp}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link to="/signup">
                    <Button size="lg" className="group">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline">
                      How It Works
                    </Button>
                  </a>
                </motion.div>

                <motion.div
                  {...fadeUp}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-5 mt-8"
                >
                  {['No credit card', 'Free to start', '< 60 sec analysis'].map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-white/40 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      {t}
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative hidden lg:block"
              >
                <div className="relative rounded-2xl overflow-hidden glow-violet">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                    alt="Professional working"
                    className="w-full h-[480px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

                  {/* Floating stat card */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-6 left-6 glass-card p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Readiness Score</p>
                      <p className="text-green-400 font-bold">87% — Ready!</p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute top-6 right-6 glass-card p-3 flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span className="text-white/70 text-xs">AI analyzing skills…</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-white/5 bg-white/2 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '2800+', label: 'Professionals Onboarded' },
                { value: '94%', label: 'Analysis Accuracy' },
                { value: '48hr', label: 'Average to Role Readiness' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl font-black text-gradient mb-1">{stat.value}</div>
                  <div className="text-white/40 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">How It Works</span>
              <h2 className="text-4xl font-black text-white mt-3">Three steps to job readiness</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Upload,
                  step: '01',
                  title: 'Upload Resume & JD',
                  desc: 'Drag & drop your PDF resume and paste the job description you\'re targeting.',
                },
                {
                  icon: Brain,
                  step: '02',
                  title: 'AI Analyzes Skill Gaps',
                  desc: 'Our Groq-powered AI cross-references your experience against what the role demands.',
                },
                {
                  icon: Map,
                  step: '03',
                  title: 'Get Your Roadmap',
                  desc: 'Receive a personalized, interactive learning roadmap with curated resources.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card p-7 relative group hover:border-violet-500/30 transition-all"
                >
                  <div className="absolute top-5 right-5 text-5xl font-black text-white/4 group-hover:text-violet-500/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-600/30 transition-colors">
                    <item.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <img
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=60"
              alt="neural network"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]" />

          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Features</span>
              <h2 className="text-4xl font-black text-white mt-3">Everything you need to get hired</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Zap, title: 'AI Skill Extraction', desc: 'Automatically identifies every skill from your resume using advanced NLP.' },
                { icon: BarChart2, title: 'Gap Analysis', desc: 'Precision comparison against the job requirements you\'re targeting.' },
                { icon: Route, title: 'Personalized Pathway', desc: 'Step-by-step learning plan tailored to your exact skill gaps.' },
                { icon: TrendingUp, title: 'Progress Tracking', desc: 'Mark modules complete and watch your readiness score climb.' },
              ].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 hover:border-violet-500/30 transition-all group"
                >
                  <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors">
                    <feat.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
              <h2 className="text-4xl font-black text-white mt-3">Loved by professionals</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Priya Sharma',
                  role: 'Software Engineer @ Google',
                  img: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=80&q=80',
                  quote: 'PathwayIQ identified exactly the gaps I had for my FAANG interview prep. Got the offer in 6 weeks.',
                },
                {
                  name: 'Marcus Johnson',
                  role: 'Product Manager @ Stripe',
                  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
                  quote: 'The roadmap was so precise — it knew I needed system design basics before jumping to Kafka. Incredible.',
                },
                {
                  name: 'Aisha Okonkwo',
                  role: 'Data Scientist @ Anthropic',
                  img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80',
                  quote: 'From 42% readiness to 91% in 3 weeks following the personalized plan. This tool is a game changer.',
                },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-white/40 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 glow-violet"
            >
              <h2 className="text-4xl font-black text-white mb-4">Ready to close the gap?</h2>
              <p className="text-white/50 mb-8">Join 2,800+ professionals who used PathwayIQ to land their dream role.</p>
              <Link to="/signup">
                <Button size="xl" className="group">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-10 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M6 18 L12 6 L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-white">PathwayIQ</span>
            </div>
            <p className="text-white/30 text-sm">© {new Date().getFullYear()} PathwayIQ. All rights reserved.</p>
            <div className="flex gap-5">
              <Link to="/login" className="text-white/30 hover:text-white/60 text-sm transition-colors">Login</Link>
              <Link to="/signup" className="text-white/30 hover:text-white/60 text-sm transition-colors">Sign Up</Link>
            </div>
          </div>
        </footer>

      </div>
    </PageWrapper>
  )
}
