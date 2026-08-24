import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, BarChart3, RefreshCw, Clock, Sparkles } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { computeInsights } from '@/services/insightsService'
import { CATEGORY_EMOJI, CATEGORY_COLOR } from '@/services/categorizationService'
import { ProductImage } from '@/components/ui/ProductImage'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { formatINR, formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'

// ─── Sample demo data ─────────────────────────────────────────────────────────

const DEMO_INSIGHTS = {
  monthlySpend: 4820,
  averageBasketSize: 8.4,
  mostPurchasedCategory: 'Dairy' as Category,
  repeatPurchaseRate: 72,
  topCategories: [
    { category: 'Dairy'     as Category, count: 18, spend: 1240 },
    { category: 'Produce'   as Category, count: 14, spend: 890  },
    { category: 'Pantry'    as Category, count: 11, spend: 1100 },
    { category: 'Snacks'    as Category, count: 8,  spend: 560  },
    { category: 'Beverages' as Category, count: 6,  spend: 480  },
  ],
  weeklyPattern: [2, 5, 3, 7, 4, 9, 6],
  topProducts: [
    { name: 'Amul Taaza Milk',    count: 6 },
    { name: 'Whole Wheat Bread',  count: 5 },
    { name: 'Farm Eggs',          count: 4 },
    { name: 'Bananas',            count: 4 },
    { name: 'Bisleri Water',      count: 3 },
  ],
}

export function InsightsPage() {
  const { history } = useShopping()
  const [showDemo, setShowDemo] = useState(false)

  const hasData = history.length > 0
  const useDemoData = !hasData && showDemo
  const ins = hasData ? computeInsights(history) : (useDemoData ? DEMO_INSIGHTS : null)

  const STATS = ins ? [
    { label: 'Monthly Spend',  value: formatINR(ins.monthlySpend),          icon: <TrendingUp className="w-5 h-5 text-brand-500" />,   bg: 'bg-brand-50' },
    { label: 'Avg Basket',     value: `${ins.averageBasketSize} items`,      icon: <ShoppingBag className="w-5 h-5 text-amber-500" />,   bg: 'bg-amber-50' },
    { label: 'Top Category',   value: ins.mostPurchasedCategory,             icon: <span className="text-xl">{CATEGORY_EMOJI[ins.mostPurchasedCategory]}</span>, bg: 'bg-slate-100' },
    { label: 'Repeat Rate',    value: `${ins.repeatPurchaseRate}%`,          icon: <RefreshCw className="w-5 h-5 text-emerald-500" />,   bg: 'bg-emerald-50' },
  ] : []

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const maxDay = ins ? Math.max(...ins.weeklyPattern, 1) : 1

  if (!ins) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your shopping analytics</p>
        </div>
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📊</div>
              <p className="font-bold text-slate-700 text-lg mb-1">No purchase history yet</p>
              <p className="text-sm text-slate-400 mt-1 mb-6">
                Mark items as purchased on your shopping list to see real analytics here.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowDemo(true)}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-colors shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Preview Sample Analytics
              </motion.button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {useDemoData ? (
              <span className="flex items-center gap-1.5 text-amber-600">
                <BarChart3 className="w-3.5 h-3.5" /> Sample preview — purchase items to see real data
              </span>
            ) : `Based on ${history.length} purchases`}
          </p>
        </div>
        {useDemoData && (
          <button onClick={() => setShowDemo(false)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline">
            Hide demo
          </button>
        )}
      </div>

      {useDemoData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            This is a sample preview of what your analytics will look like. Mark items as purchased to populate real data.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ label, value, icon, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Category breakdown */}
      {ins.topCategories.length > 0 && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-slate-400" />Shopping patterns</p></CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              {ins.topCategories.map(({ category, count, spend }) => {
                const max = ins.topCategories[0].count
                const pct = Math.round((count / max) * 100)
                const c = CATEGORY_COLOR[category as Category]
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span>{CATEGORY_EMOJI[category as Category]}</span>{category}
                      </span>
                      <span className="text-slate-500 text-xs">{count}× · {formatINR(spend)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className={cn('h-full rounded-full', c.bg.replace('bg-', 'bg-').replace('-50', '-400'))}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Weekly pattern */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900">Weekly Activity</p></CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-end gap-2 h-20">
            {ins.weeklyPattern.map((count, day) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full bg-brand-300 rounded-md"
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxDay) * 60}px` }}
                  transition={{ duration: 0.5, delay: day * 0.05 }}
                  style={{ minHeight: count > 0 ? 8 : 4 }}
                />
                <span className="text-2xs text-slate-400">{DAY_LABELS[day]}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Top products */}
      {ins.topProducts.length > 0 && (
        <Card>
          <CardHeader><p className="font-semibold text-slate-900">Most Purchased</p></CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-2">
              {(ins.topProducts as { name: string; count: number; image?: string }[]).map(({ name, count, image: img }, i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                  {img
                    ? <ProductImage src={img} alt={name} skeletonClassName="w-9 h-9 rounded-lg shrink-0" className="rounded-lg" />
                    : <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base">🛒</div>
                  }
                  <span className="flex-1 text-sm font-medium text-slate-800 truncate">{name}</span>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{count}×</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent history */}
      <Card>
        <CardHeader><p className="font-semibold text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Recent Purchases</p></CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            {history.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center gap-3">
                {r.image
                  ? <ProductImage src={r.image} alt={r.productName} skeletonClassName="w-10 h-10 rounded-xl shrink-0" className="rounded-xl" />
                  : <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">{CATEGORY_EMOJI[r.category]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.productName}</p>
                  <p className="text-xs text-slate-400">{r.quantity} {r.unit} · {r.category}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{formatRelative(r.purchasedAt)}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
