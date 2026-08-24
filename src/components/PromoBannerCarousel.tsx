import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Zap, Tag, Gift } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/utils/cn'

interface PromoBanner {
  id: string
  headline: string
  sub: string
  cta: string
  code?: string
  gradient: string
  icon: React.ReactNode
  endTime?: number   // unix ms
  discount?: number
}

const NOW = Date.now()

const BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    headline: '⚡ Flash Deal — 20% Off Dairy',
    sub: 'Use code VOICE50 · Min order ₹299',
    cta: 'Claim Now',
    code: 'VOICE50',
    gradient: 'from-brand-700 via-brand-600 to-blue-500',
    icon: <Zap className="w-8 h-8 text-white/30" />,
    endTime: NOW + 5 * 60 * 1000,
    discount: 20,
  },
  {
    id: 'b2',
    headline: '🎁 First Order? ₹100 Off',
    sub: 'Use code FIRST100 on your very first order',
    cta: 'Apply Code',
    code: 'FIRST100',
    gradient: 'from-purple-700 via-purple-600 to-pink-500',
    icon: <Gift className="w-8 h-8 text-white/30" />,
  },
  {
    id: 'b3',
    headline: '🛒 Flat ₹30 Off Today',
    sub: 'Use code SNAP30 on orders above ₹199',
    cta: 'Use Code',
    code: 'SNAP30',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
    icon: <Tag className="w-8 h-8 text-white/30" />,
  },
  {
    id: 'b4',
    headline: '🌿 Organic Picks — Up to 15% Off',
    sub: 'Fresh from certified organic farms',
    cta: 'Shop Now',
    gradient: 'from-green-600 via-green-500 to-lime-500',
    icon: <span className="text-4xl text-white/30">🥦</span>,
  },
]

function Countdown({ endTime }: { endTime: number }) {
  const [left, setLeft] = useState(Math.max(0, endTime - Date.now()))
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, endTime - Date.now())), 1000)
    return () => clearInterval(t)
  }, [endTime])

  const m = String(Math.floor(left / 60000)).padStart(2, '0')
  const s = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span className="text-white/70 text-xs">Ends in</span>
      <div className="flex items-center gap-0.5">
        {[m, ':', s].map((t, i) => (
          <span key={i} className={cn(
            'font-black font-mono text-sm text-white',
            t !== ':' && 'bg-black/25 px-1.5 py-0.5 rounded-md'
          )}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export function PromoBannerCarousel() {
  const { applyCoupon } = useCart()
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [applied, setApplied] = useState<string | null>(null)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDirection(1); setIdx(i => (i + 1) % BANNERS.length)
    }, 4500)
  }

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])

  const go = (dir: 1 | -1) => {
    setDirection(dir)
    setIdx(i => (i + BANNERS.length + dir) % BANNERS.length)
    resetTimer()
  }

  const handleCTA = (banner: PromoBanner) => {
    if (banner.code) {
      const discounts: Record<string, number> = { VOICE50: 50, FIRST100: 100, SNAP30: 30 }
      applyCoupon(banner.code, discounts[banner.code] ?? 0)
      setApplied(banner.code)
      setTimeout(() => setApplied(null), 2500)
    }
  }

  const banner = BANNERS[idx]

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  }

  return (
    <div className="relative h-32 sm:h-28 rounded-2xl overflow-hidden select-none">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={banner.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className={cn('absolute inset-0 bg-gradient-to-r p-5 flex items-center gap-4', banner.gradient)}
        >
          {/* Icon decoration */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 scale-150 opacity-50 pointer-events-none">
            {banner.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 relative z-10">
            <p className="font-black text-white text-base leading-tight truncate">{banner.headline}</p>
            <p className="text-white/80 text-xs mt-0.5 truncate">{banner.sub}</p>
            {banner.endTime && <Countdown endTime={banner.endTime} />}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCTA(banner)}
              className={cn(
                'mt-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                applied === banner.code
                  ? 'bg-emerald-400 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
              )}
            >
              {applied === banner.code ? '✓ Applied!' : banner.cta}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <button onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i); resetTimer() }}
            className={cn('rounded-full transition-all duration-300', i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50')} />
        ))}
      </div>
    </div>
  )
}
