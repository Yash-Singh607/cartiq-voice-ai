import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Sun, TrendingUp, Package } from 'lucide-react'
import { RecCard } from '@/components/recommendations/RecCard'
import { useShopping } from '@/context/ShoppingContext'
import { getSeasonalRecs, getHistoryRecs, getTrendingRecs, getCurrentSeason } from '@/services/recommendationService'
import { getProductSubstitutes } from '@/services/productService'
import { Card, CardBody } from '@/components/ui/Card'
import { ProductCard } from '@/components/products/ProductCard'
import type { Recommendation } from '@/types'

const SEASON_EMOJI: Record<string, string> = { summer:'☀️', winter:'❄️', spring:'🌸', monsoon:'🌧️' }

function Section({ title, icon, sub, recs }: { title: string; icon: React.ReactNode; sub: string; recs: Recommendation[] }) {
  if (!recs.length) return null
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
      </div>
      <div className="space-y-2">
        {recs.map((r, i) => (
          <motion.div key={r.product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <RecCard rec={r} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function SuggestionsPage() {
  const { items, history } = useShopping()
  const season = getCurrentSeason()
  const histRecs = getHistoryRecs(history, items, 6)
  const seasonal = getSeasonalRecs(6)
  const trending = getTrendingRecs(items, 6)

  // Smart cart substitutes — find cheaper alternatives for items on list
  const substituteSavings = items.slice(0, 3).flatMap(item => {
    const subs = getProductSubstitutes(item.productId || '')
    return subs.filter(s => item.price && s.price < item.price)
  }).slice(0, 3)

  const isEmpty = !histRecs.length && !seasonal.length && !trending.length

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">For You</h1>
        <p className="text-sm text-slate-400 mt-0.5">Personalised picks based on your habits and the season</p>
      </div>

      {isEmpty && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="text-5xl mb-3">💡</div>
              <p className="font-semibold text-slate-700">Building your profile...</p>
              <p className="text-sm text-slate-400 mt-1">Add and check off items to get personalised suggestions</p>
            </div>
          </CardBody>
        </Card>
      )}

      <Section title="Based on Your History" sub="Items you frequently buy" icon={<Clock className="w-5 h-5 text-brand-500" />} recs={histRecs} />
      <Section title={`${season.charAt(0).toUpperCase() + season.slice(1)} Picks ${SEASON_EMOJI[season]}`} sub={`Popular products for this season`} icon={<Sun className="w-5 h-5 text-amber-500" />} recs={seasonal} />
      <Section title="Trending" sub="Highly rated by shoppers" icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} recs={trending} />

      {substituteSavings.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Save Money</h2>
              <p className="text-xs text-slate-400">Cheaper alternatives for your list</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {substituteSavings.map(p => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
