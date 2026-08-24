import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Clock } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { CATEGORY_EMOJI } from '@/services/categorizationService'
import { formatRelative, formatDate } from '@/utils/format'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/types'

export function HistoryPage() {
  const { history, addItem } = useShopping()

  const sorted = [...history].sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())

  // Group by date
  const grouped: Record<string, typeof history> = {}
  for (const r of sorted) {
    const key = formatDate(r.purchasedAt)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase History</h1>
          <p className="text-sm text-slate-400 mt-0.5">{history.length} items purchased</p>
        </div>
        <Clock className="w-5 h-5 text-slate-300" />
      </div>

      {!history.length ? (
        <Card><CardBody>
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-semibold text-slate-700">No purchase history yet</p>
            <p className="text-sm text-slate-400 mt-1">Mark items as purchased on your shopping list</p>
          </div>
        </CardBody></Card>
      ) : (
        Object.entries(grouped).map(([date, records]) => (
          <motion.section key={date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            aria-label={`Purchased on ${date}`}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">{date}</h2>
            <Card>
              <CardBody className="p-0">
                <ul>
                  {records.map((r, i) => (
                    <li key={r.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < records.length - 1 ? 'border-b border-slate-50' : ''}`}>
                      {r.image
                        ? <ProductImage src={r.image} alt={r.productName} skeletonClassName="w-11 h-11 rounded-xl shrink-0" className="rounded-xl" />
                        : <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl">{CATEGORY_EMOJI[r.category as Category]}</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{r.productName}</p>
                        <p className="text-xs text-slate-400">{r.quantity} {r.unit} · {r.category}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400 hidden sm:block mr-2 whitespace-nowrap">
                        {formatRelative(r.purchasedAt)}
                      </div>
                      <Button size="xs" variant="outline"
                        onClick={() => addItem(r.productName, r.quantity, r.unit, r.category, undefined, r.price, r.image, r.productId)}
                        aria-label={`Add ${r.productName} again`}>
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </motion.section>
        ))
      )}
    </div>
  )
}
