import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckSquare, Mic, Plus } from 'lucide-react'
import { CategoryGroup } from '@/components/shopping/CategoryGroup'
import { AddItem } from '@/components/shopping/AddItem'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useShopping } from '@/context/ShoppingContext'
import { useCart } from '@/context/CartContext'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { useApp } from '@/context/AppContext'
import { formatINR } from '@/utils/format'
import { PRODUCTS } from '@/data/products'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'

// Quick-add chips for the empty state
const QUICK_ADD_CHIPS = [
  { id: 'p001', label: '🥛 Amul Milk 1L',       productId: 'p001' },
  { id: 'p021', label: '🍞 Wheat Bread 400g',   productId: 'p021' },
  { id: 'p074', label: '🥚 Farm Eggs 6 pcs',    productId: 'p074' },
  { id: 'p011', label: '🍌 Bananas 6 pcs',      productId: 'p011' },
  { id: 'p026', label: '💧 Bisleri Water 1L',   productId: 'p026' },
  { id: 'p007', label: '🥣 Greek Yogurt 200g',  productId: 'p007' },
]

export function ShoppingListPage() {
  const { items, byCategory, activeItems, completedItems, clearCompleted, estimatedTotal, addItem } = useShopping()
  const { addToCart } = useCart()
  const { language } = useApp()
  const { start, stop, voiceState, isSupported } = useVoiceCommands(language)
  const [filter, setFilter] = useState<Category | 'All'>('All')
  const [showDone, setShowDone] = useState(true)

  const cats = byCategory()
  const active = activeItems()
  const done = completedItems()
  const total = estimatedTotal()
  const progress = items.length > 0 ? Math.round((done.length / items.length) * 100) : 0

  const handleQuickAdd = (productId: string) => {
    const p = PRODUCTS.find(x => x.id === productId)
    if (!p) return
    addItem(p.name, 1, 'item', p.category, p.brand, p.price, p.image, p.id)
    addToCart(p, 1)
  }

  const visibleCats = (Object.entries(cats) as [Category, typeof items][])
    .filter(([cat]) => filter === 'All' || cat === filter)
    .map(([cat, citems]) => ({
      cat,
      items: showDone ? citems : citems.filter(i => !i.completed),
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping List</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {active.length} item{active.length !== 1 ? 's' : ''} remaining
            {total > 0 && <span className="ml-2 text-emerald-600 font-medium">· Est. {formatINR(total)}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {done.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompleted}>
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear done</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowDone(v => !v)}>
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showDone ? 'Hide' : 'Show'} done</span>
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span>
            <span className="font-medium">{done.length}/{items.length} done</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar"
            aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* Add item */}
      <Card><CardBody><AddItem /></CardBody></Card>

      {/* Category filter pills */}
      {Object.keys(cats).length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['All', ...Object.keys(cats)] as (Category | 'All')[]).map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0
                ${filter === cat ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {cat === 'All' ? `All (${items.length})` : `${cat} (${cats[cat as Category]?.length ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-8">
              {/* Heading */}
              <div className="text-center mb-6">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-5xl mb-3">🛒</motion.div>
                <p className="font-bold text-slate-700 text-lg mb-1">Your list is empty</p>
                <p className="text-sm text-slate-400">Tap the mic or add a quick item below</p>
              </div>

              {/* Inline pulsing voice button */}
              {isSupported && (
                <div className="flex justify-center mb-5">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => voiceState === 'listening' ? stop() : start()}
                    className={cn(
                      'relative flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm',
                      voiceState === 'listening'
                        ? 'bg-rose-500 text-white'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    )}
                    aria-label={voiceState === 'listening' ? 'Stop listening' : 'Start voice input'}
                  >
                    {voiceState === 'listening' && (
                      <motion.span
                        className="absolute inset-0 rounded-2xl bg-rose-400"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <Mic className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">
                      {voiceState === 'listening' ? 'Listening… tap to stop' : '🎙 Tap & speak'}
                    </span>
                  </motion.button>
                </div>
              )}

              {/* Quick-add chips */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 text-center">
                  Or add a popular item
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_ADD_CHIPS.map(chip => (
                    <motion.button
                      key={chip.id}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ y: -1 }}
                      onClick={() => handleQuickAdd(chip.productId)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 text-slate-700 hover:text-brand-700 rounded-xl border border-slate-200 text-xs font-semibold transition-all text-left"
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      {chip.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            {visibleCats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No items in this category</p>
            ) : (
              <div className="space-y-1">
                {visibleCats.map(({ cat, items: catItems }) => (
                  <CategoryGroup key={cat} category={cat} items={catItems} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
