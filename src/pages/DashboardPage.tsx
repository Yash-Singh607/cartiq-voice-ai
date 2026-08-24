import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingCart, Zap, TrendingUp, Store } from 'lucide-react'
import { VoicePanel } from '@/components/voice/VoicePanel'
import { RealTimeGreeting } from '@/components/RealTimeGreeting'
import { CategoryGroup } from '@/components/shopping/CategoryGroup'
import { RecCard } from '@/components/recommendations/RecCard'
import { useShopping } from '@/context/ShoppingContext'
import { getSmartRecs } from '@/services/recommendationService'
import { formatINR } from '@/utils/format'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/types'

export function DashboardPage() {
  const { items, history, byCategory, activeItems, estimatedTotal } = useShopping()
  const active = activeItems()
  const cats = byCategory()
  const topCats = (Object.entries(cats) as [Category, typeof items][]).slice(0, 2)
  const recs = getSmartRecs(history, items, 4)
  const total = estimatedTotal()

  const STAT_CARDS = [
    { label: 'Items needed',    value: active.length,                     icon: <ShoppingCart className="w-5 h-5 text-brand-500" />,  bg: 'bg-brand-50'  },
    { label: 'Estimated total', value: total > 0 ? formatINR(total) : '—', icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50' },
    { label: 'Suggestions',     value: recs.length,                       icon: <Zap className="w-5 h-5 text-purple-500" />,          bg: 'bg-purple-50'  },
    { label: 'Quick shop',      value: 'Open',                            icon: <Store className="w-5 h-5 text-cyan-600" />,         bg: 'bg-cyan-50', link: '/app/discover' },
  ]

  return (
    <div className="space-y-6">
      {/* Dynamic contextual greeting — time-aware */}
      <RealTimeGreeting />

      {/* Stats */}
      {active.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map(({ label, value, icon, bg, link }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Voice panel */}
      <Card>
        <CardHeader>
          <p className="font-semibold text-slate-900">Voice Assistant</p>
          <p className="text-xs text-slate-400 mt-0.5">Speak naturally. SnapGrocer gets it.</p>
        </CardHeader>
        <CardBody className="pt-0"><VoicePanel /></CardBody>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Shopping List</p>
                <Link to="/list"><Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {active.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="font-medium text-slate-700">Your list is empty</p>
                  <p className="text-sm text-slate-400 mt-1">Try saying "Add milk" above</p>
                </div>
              ) : (
                <div>
                  {topCats.map(([cat, citems]) => (
                    <CategoryGroup key={cat} category={cat} items={citems.slice(0, 4)} />
                  ))}
                  {active.length > 6 && (
                    <Link to="/list" className="block text-center text-sm text-brand-600 hover:text-brand-700 py-2 mt-1">
                      +{active.length - 6} more items →
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Smart suggestions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="font-semibold text-slate-900">Picked for You</p>
                </div>
                <Link to="/suggestions"><Button variant="ghost" size="sm">More <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Based on history & season</p>
            </CardHeader>
            <CardBody className="pt-0">
              {recs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Add items to unlock personalised picks</p>
              ) : (
                <div className="space-y-2">
                  {recs.map(r => <RecCard key={r.product.id} rec={r} />)}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
