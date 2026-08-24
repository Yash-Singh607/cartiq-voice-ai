import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { PRODUCTS } from '@/data/products'
import { formatINR } from '@/utils/format'
import { ProductImage } from '@/components/ui/ProductImage'
import { getTimeGreeting } from '@/lib/getTimeGreeting'
import type { Product } from '@/types'

// ─── Quick-add chip ───────────────────────────────────────────────────────────

function QuickChip({ product }: { product: Product }) {
  const { addToCart, getItem } = useCart()
  const qty = getItem(product.id)?.quantity ?? 0
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="shrink-0 flex items-center gap-2.5 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/70 shadow-card cursor-pointer hover:shadow-card-md transition-all min-w-[150px]"
      onClick={() => addToCart(product)}
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        skeletonClassName="w-10 h-10 rounded-xl shrink-0"
        className="rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-500">{formatINR(product.price)}</p>
      </div>
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
        qty > 0
          ? 'bg-brand-600 text-white'
          : 'bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600'
      }`}>
        {qty > 0
          ? <span className="text-xs font-black">{qty}</span>
          : <Plus className="w-3.5 h-3.5" />
        }
      </div>
    </motion.div>
  )
}

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="text-xs text-slate-500 font-mono tabular-nums">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RealTimeGreeting() {
  // Re-evaluate every minute so the banner updates when the slot changes
  const [hour, setHour] = useState(new Date().getHours())
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => clearInterval(t)
  }, [])

  // All greeting data comes from the single source of truth
  const greeting = getTimeGreeting(hour)

  const products = greeting.productIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter((p): p is Product => !!p)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={greeting.slot}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-r ${greeting.gradient} rounded-3xl px-5 py-5 border border-white/70 shadow-card overflow-hidden relative`}
      >
        {/* Decorative blobs */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-white/20 blur-xl pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900">{greeting.salutation}</h2>
            <p className="text-sm text-slate-600 leading-snug max-w-xs mt-1">{greeting.subtitle}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <LiveClock />
          </div>
        </div>

        {/* Curated product strip */}
        <div className="relative z-10">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
            {greeting.slot === 'morning'   ? '🍳 Breakfast aisle'   :
             greeting.slot === 'afternoon' ? '🥗 Lunch & hydration' :
             greeting.slot === 'evening'   ? '🍽️ Dinner essentials' :
                                            '🌙 Midnight munchies'}
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <QuickChip product={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
