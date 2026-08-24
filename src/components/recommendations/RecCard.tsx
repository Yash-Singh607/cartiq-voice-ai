import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Sun, TrendingUp, Sparkles } from 'lucide-react'
import { ProductImage } from '@/components/ui/ProductImage'
import { useShopping } from '@/context/ShoppingContext'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Recommendation } from '@/types'

const TYPE: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  history:   { icon: Clock,      color: 'text-brand-500',   bg: 'bg-brand-50' },
  seasonal:  { icon: Sun,        color: 'text-amber-500',   bg: 'bg-amber-50' },
  trending:  { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  substitute:{ icon: Sparkles,   color: 'text-purple-500',  bg: 'bg-purple-50' },
  bundle:    { icon: Sparkles,   color: 'text-rose-500',    bg: 'bg-rose-50' },
}

export function RecCard({ rec }: { rec: Recommendation }) {
  const { addItem } = useShopping()
  const [added, setAdded] = React.useState(false)
  const t = TYPE[rec.type]
  const Icon = t.icon

  const handleAdd = () => {
    addItem(rec.product.name, 1, 'item', rec.product.category, rec.product.brand, rec.product.price, rec.product.image, rec.product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div whileHover={{ y: -1 }} className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-sm transition-all">
      <ProductImage src={rec.product.image} alt={rec.product.name} className="rounded-xl" skeletonClassName="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={cn('inline-flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full', t.bg, t.color)}>
            <Icon className="w-2.5 h-2.5" />{rec.type}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 truncate">{rec.product.name}</p>
        <p className="text-xs text-slate-400 truncate">{rec.reason}</p>
        <p className="text-xs font-medium text-slate-600 mt-0.5">{formatINR(rec.product.price)}</p>
      </div>
      <motion.button whileTap={{ scale: 0.92 }} onClick={handleAdd}
        className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all',
          added ? 'bg-emerald-500 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
        )} aria-label={`Add ${rec.product.name}`}>
        {added ? <span className="text-sm">✓</span> : <Plus className="w-4 h-4" />}
      </motion.button>
    </motion.div>
  )
}
