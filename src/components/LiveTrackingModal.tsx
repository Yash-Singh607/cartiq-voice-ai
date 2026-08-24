import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Package, Bike, MapPin, X, Clock, Phone } from 'lucide-react'
import { cn } from '@/utils/cn'

interface LiveTrackingModalProps {
  orderId: string
  total: string
  onClose: () => void
}

type OrderStep = 'placed' | 'confirmed' | 'packed' | 'picked' | 'delivered'

const STEPS: { key: OrderStep; label: string; sub: string; icon: React.ReactNode; duration: number }[] = [
  { key: 'placed',    label: 'Order Placed',          sub: 'We have received your order',       icon: <CheckCircle2 className="w-5 h-5" />, duration: 0 },
  { key: 'confirmed', label: 'Order Confirmed',        sub: 'Store is preparing your items',     icon: <CheckCircle2 className="w-5 h-5" />, duration: 3000 },
  { key: 'packed',    label: 'Items Packed',           sub: 'Your order is packed & ready',      icon: <Package className="w-5 h-5" />,      duration: 7000 },
  { key: 'picked',    label: 'Rider on the way',       sub: 'Rahul is heading to your address',  icon: <Bike className="w-5 h-5" />,         duration: 12000 },
  { key: 'delivered', label: 'Delivered!',             sub: 'Enjoy your order 🎉',               icon: <MapPin className="w-5 h-5" />,       duration: 18000 },
]

const ETA = ['10 min', '8 min', '5 min', '2 min', 'Arrived']

export function LiveTrackingModal({ orderId, total, onClose }: LiveTrackingModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [eta, setEta] = useState('10 min')

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((step, i) => {
      if (i === 0) return
      const t = setTimeout(() => {
        setCurrentIdx(i)
        setEta(ETA[i])
      }, step.duration)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  const currentStep = STEPS[currentIdx]
  const isDelivered = currentIdx === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog" aria-modal aria-label="Order tracking">

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className={cn('px-6 py-5 text-white relative overflow-hidden',
          isDelivered ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-brand-600 to-brand-700')}>
          {/* Animated bg rings */}
          <motion.div className="absolute inset-0 pointer-events-none" aria-hidden>
            {[1, 2, 3].map(i => (
              <motion.div key={i} className="absolute rounded-full border border-white/10"
                style={{ inset: -i * 40 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </motion.div>

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  animate={!isDelivered ? { rotate: [0, 15, -10, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  {isDelivered ? '🎉' : '⚡'}
                </motion.div>
                <p className="font-bold text-lg">{isDelivered ? 'Delivered!' : '10-min Delivery'}</p>
              </div>
              <p className="text-white/80 text-sm">Order #{orderId}</p>
              <p className="text-white/80 text-sm">Amount: {total}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {!isDelivered && (
            <div className="mt-4 bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white">Arriving in</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.span key={eta}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="text-xl font-bold text-white">
                  {eta}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="px-6 py-5">
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const isDone = i <= currentIdx
              const isCurrent = i === currentIdx
              return (
                <motion.div key={step.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: isDone ? 1 : 0.35, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={isDone ? { backgroundColor: isCurrent ? '#2563eb' : '#059669', color: '#fff' } : { backgroundColor: '#f0f0f0', color: '#a3a3a3' }}
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    >
                      {isDone && i < currentIdx
                        ? <CheckCircle2 className="w-5 h-5" />
                        : step.icon
                      }
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <div className="w-0.5 h-4 mt-1">
                        <motion.div
                          className="w-full rounded-full"
                          animate={{ height: i < currentIdx ? '100%' : '0%', backgroundColor: '#059669' }}
                          transition={{ duration: 0.4 }}
                          style={{ backgroundColor: '#e4e4e4', height: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className={cn('text-sm font-semibold', isDone ? 'text-slate-900' : 'text-slate-400')}>{step.label}</p>
                    {isCurrent && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 mt-0.5">
                        {step.sub}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Rider info */}
        {(currentIdx >= 3) && !isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-5 bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-2xl shrink-0">🛵</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Rahul Sharma</p>
              <p className="text-xs text-slate-400">Your delivery partner</p>
            </div>
            <button className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}

        {/* Close button when delivered */}
        {isDelivered && (
          <div className="px-6 pb-6">
            <button onClick={onClose}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-3.5 font-bold transition-colors">
              Rate your experience
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
