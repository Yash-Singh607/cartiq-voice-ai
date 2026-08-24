import { PRODUCTS } from '@/data/products'
import type { Recommendation, PurchaseRecord, ShoppingItem, Season } from '@/types'

export function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 7) return 'summer'
  if (m >= 8 && m <= 10) return 'monsoon'
  return 'winter'
}

export function getSeasonalRecs(limit = 5): Recommendation[] {
  const season = getCurrentSeason()
  const reasons: Record<Season, string> = {
    summer: 'Perfect for the summer heat',
    winter: 'Great for the cold winter months',
    monsoon: 'Ideal for the rainy season',
    spring: 'Fresh spring favourite',
    autumn: 'Perfect for the autumn season',
    all: 'Year-round essential',
  }
  return PRODUCTS
    .filter(p => {
      const s = p.season
      return Array.isArray(s) ? s.includes(season) : s === season || s === 'all'
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
    .map(p => ({ product: p, reason: reasons[season], score: p.rating / 5, type: 'seasonal' as const }))
}

export function getHistoryRecs(
  history: PurchaseRecord[],
  currentList: ShoppingItem[],
  limit = 5
): Recommendation[] {
  if (!history.length) return []

  const freq = new Map<string, { name: string; count: number; last: Date; image?: string }>()
  for (const r of history) {
    const k = r.productName.toLowerCase()
    const e = freq.get(k)
    const d = new Date(r.purchasedAt)
    if (e) { e.count++; if (d > e.last) e.last = d }
    else freq.set(k, { name: r.productName, count: 1, last: d, image: r.image })
  }

  const listed = new Set(currentList.map(i => i.name.toLowerCase()))
  const result: Recommendation[] = []

  for (const [, data] of [...freq.entries()].sort((a, b) => b[1].count - a[1].count)) {
    if (listed.has(data.name.toLowerCase())) continue
    const product = PRODUCTS.find(p =>
      p.name.toLowerCase().includes(data.name.toLowerCase()) ||
      data.name.toLowerCase().includes(p.name.toLowerCase())
    )
    if (!product) continue

    const days = Math.floor((Date.now() - data.last.getTime()) / 86400000)
    const reason =
      days <= 3 ? 'Bought recently' :
      days <= 7 ? 'You usually buy this weekly' :
      `Bought ${data.count} times before`

    result.push({
      product, reason, score: Math.min(data.count / 10, 1),
      type: 'history', metadata: { daysSince: days, frequency: data.count },
    })
    if (result.length >= limit) break
  }
  return result
}

export function getTrendingRecs(currentList: ShoppingItem[], limit = 5): Recommendation[] {
  const listed = new Set(currentList.map(i => i.name.toLowerCase()))
  return PRODUCTS
    .filter(p => p.rating >= 4.5 && p.available && !listed.has(p.name.toLowerCase()))
    .sort((a, b) => b.rating * b.ratingCount - a.rating * a.ratingCount)
    .slice(0, limit)
    .map(p => ({
      product: p,
      reason: `Rated ${p.rating}★ by ${p.ratingCount.toLocaleString()} shoppers`,
      score: p.rating / 5,
      type: 'trending' as const,
    }))
}

export function getSmartRecs(
  history: PurchaseRecord[],
  currentList: ShoppingItem[],
  limit = 8
): Recommendation[] {
  const hist = getHistoryRecs(history, currentList, 3)
  const seasonal = getSeasonalRecs(3)
  const trending = getTrendingRecs(currentList, 3)

  const seen = new Set<string>()
  const merged: Recommendation[] = []
  for (const r of [...hist, ...seasonal, ...trending]) {
    if (!seen.has(r.product.id)) {
      seen.add(r.product.id)
      merged.push(r)
    }
    if (merged.length >= limit) break
  }
  return merged
}
