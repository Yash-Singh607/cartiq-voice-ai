import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mic, Zap, ShoppingBag, ArrowRight, Check, Cpu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  { icon: Mic,   title: 'Voice-First',          desc: 'Speak naturally in English, Hindi, or Spanish. SnapGrocer understands context.' },
  { icon: Cpu,   title: 'Smart NLP Engine',     desc: 'Intent detection, entity extraction, confidence scoring — all local, instant.' },
  { icon: Zap,   title: 'Smart Suggestions',    desc: 'Learns your habits. Suggests what you\'ll likely need before you ask.' },
  { icon: Heart, title: 'Personalised',         desc: 'History-based recs, seasonal picks, and smarter substitutes every time.' },
]

const DEMO_STEPS = [
  { input: '"Add 2 bottles of almond milk"',    output: 'Almond Milk × 2 → Dairy' },
  { input: '"Find organic apples under ₹200"',  output: 'Filtered 3 results → Produce' },
  { input: '"Show alternatives to butter"',     output: 'Kerrygold, Vegan Butter...' },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SnapGrocer</span>
          </div>
          <Button size="sm" onClick={() => navigate('/app')}>
            Try SnapGrocer <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-200">
            <Zap className="w-3.5 h-3.5 text-brand-600" /> Voice-Powered Shopping
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
            Snap a thought,<br />
            <span className="text-brand-600">get it delivered.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            SnapGrocer understands what you say, remembers what you buy, and delivers in 10 minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" onClick={() => navigate('/app')}>
              <Mic className="w-5 h-5" /> Try SnapGrocer Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/app')}>
              See how it works <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-400">
            {['No sign-up required', 'Works offline', 'Free to use'].map(f => (
              <span key={f} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />{f}</span>
            ))}
          </div>
        </motion.div>

        {/* App preview mockup */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 bg-slate-900 rounded-3xl p-6 shadow-2xl max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-auto text-xs text-slate-500 font-mono">SnapGrocer.app</span>
          </div>
          {/* Demo steps */}
          <div className="space-y-3">
            {DEMO_STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.2 }}
                className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brand-300 font-mono truncate">{step.input}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">→ {step.output}</p>
                </div>
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for the way you shop</h2>
            <p className="text-slate-500 max-w-md mx-auto">Intelligent shopping that adapts to your patterns and preferences.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Snap a thought, get it delivered.</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start shopping smarter in seconds. No account needed.</p>
          <Button size="lg" onClick={() => navigate('/app')}>
            <Mic className="w-5 h-5" /> Start Now — It's Free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center">
        <p className="text-sm text-slate-400">© 2025 SnapGrocer · Built for the Unthinkable assessment</p>
      </footer>
    </div>
  )
}
