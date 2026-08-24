import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mic, CheckCircle2, ArrowRight, Zap, ShoppingCart, TrendingDown, X, Sliders } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { Button } from '@/components/ui/Button'

const STEPS = [
  {
    title: 'Voice command',
    subtitle: 'Say what you need',
    command: '"Add milk, bananas and bread"',
    outcome: 'SnapGrocer hears your command',
    icon: <Mic className="w-6 h-6" />,
    color: 'brand',
  },
  {
    title: 'Intent Engine',
    subtitle: 'NLP parsing in milliseconds',
    command: 'ADD_ITEM → milk, bananas, bread',
    outcome: 'Confidence: 97% · 3 items parsed',
    icon: <Zap className="w-6 h-6" />,
    color: 'purple',
  },
  {
    title: 'List updated',
    subtitle: 'Items added with categories',
    command: '🥛 Milk · 🍌 Bananas · 🍞 Bread',
    outcome: '3 items added, auto-categorised',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'emerald',
  },
  {
    title: 'Smart suggestion',
    subtitle: 'You usually buy eggs with these',
    command: '"You often buy eggs with milk and bread"',
    outcome: 'History-based personalisation',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'amber',
  },
  {
    title: 'Save money',
    subtitle: 'SnapGrocer finds cheaper options',
    command: '"Almond Milk saves ₹20 vs full-fat"',
    outcome: 'Smart substitution suggested',
    icon: <TrendingDown className="w-6 h-6" />,
    color: 'emerald',
  },
  {
    title: 'Ready to shop',
    subtitle: 'Estimated savings calculated',
    command: 'Estimated savings: ₹70',
    outcome: 'Your smart list is ready!',
    icon: <Zap className="w-6 h-6" />,
    color: 'brand',
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  brand:   { bg: 'bg-brand-600',   text: 'text-brand-600',   ring: 'ring-brand-200' },
  purple:  { bg: 'bg-purple-600',  text: 'text-purple-600',  ring: 'ring-purple-200' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  amber:   { bg: 'bg-amber-500',   text: 'text-amber-600',   ring: 'ring-amber-200' },
}

export function DemoPage() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  const { addItem } = useShopping()

  const runDemo = async () => {
    setRunning(true)
    setStep(0)
    setDone(false)

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 1800))
      if (i === 2) {
        addItem('Whole Milk', 1, 'item', 'Dairy', 'Amul', 62, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&q=80')
        addItem('Bananas', 1, 'bunch', 'Produce', undefined, 49, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&q=80')
        addItem('Whole Wheat Bread', 1, 'item', 'Bakery', 'Modern', 45, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&q=80')
      }
    }
    setDone(true)
    setRunning(false)
  }

  const cur = STEPS[step]
  const colors = COLOR_MAP[cur?.color ?? 'brand']

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-amber-200">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Interactive Demo
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Experience SnapGrocer</h1>
          <p className="text-slate-400 text-sm">See how voice → AI → smart list works in 6 steps</p>
        </div>

        {/* Step card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-6">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <motion.div className="h-full bg-brand-500" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center text-white shadow-sm`}>
                    {cur?.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{cur?.title}</p>
                    <p className="text-xs text-slate-400">{cur?.subtitle}</p>
                  </div>
                  <span className={`ml-auto text-xs font-semibold ${colors.text}`}>{step + 1}/{STEPS.length}</span>
                </div>

                {/* Command display */}
                <div className="bg-slate-900 rounded-2xl px-4 py-3 mb-4 font-mono text-sm text-brand-300">
                  {cur?.command}
                </div>

                {/* Outcome */}
                <div className={`flex items-center gap-2 text-sm font-medium ${colors.text}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {cur?.outcome}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 pb-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-5 h-2 bg-brand-500' : i < step ? 'w-2 h-2 bg-brand-300' : 'w-2 h-2 bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          {!done ? (
            <Button size="lg" loading={running} onClick={runDemo} className="w-full">
              {running ? 'Running demo...' : 'Start Demo'} {!running && <ArrowRight className="w-5 h-5" />}
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-center">
                <p className="font-semibold text-emerald-800 mb-1">🎉 Demo complete!</p>
                <p className="text-sm text-emerald-600">3 items added. ₹70 estimated savings found.</p>
              </div>
              <Button size="lg" onClick={() => navigate('/app')} className="w-full">
                Try it yourself <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => { setDone(false); setStep(0) }} className="w-full">
                Watch again
              </Button>
            </motion.div>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mx-auto">
            <X className="w-4 h-4" /> Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}
