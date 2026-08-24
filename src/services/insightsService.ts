import type { PurchaseRecord, ShoppingInsights, Category } from '@/types'
import { CATEGORY_EMOJI } from './categorizationService'

export function computeInsights(history: PurchaseRecord[]): ShoppingInsights {
  if (!history.length) return {
    monthlySpend: 0, averageBasketSize: 0,
    mostPurchasedCategory: 'Other', repeatPurchaseRate: 0,
    topProducts: [], topCategories: [], weeklyPattern: Array(7).fill(0),
  }

  // Monthly spend (last 30 days)
  const now = Date.now()
  const last30 = history.filter(r => now - new Date(r.purchasedAt).getTime() < 30 * 86400000)
  const monthlySpend = last30.reduce((s, r) => s + r.price * r.quantity, 0)

  // Average basket size (items per shopping session)
  const sessions = new Map<string, number>()
  for (const r of history) {
    const date = new Date(r.purchasedAt).toDateString()
    sessions.set(date, (sessions.get(date) || 0) + 1)
  }
  const avgBasket = sessions.size ? [...sessions.values()].reduce((a, b) => a + b, 0) / sessions.size : 0

  // Top products
  const prodCount = new Map<string, { count: number; image?: string }>()
  for (const r of history) {
    const e = prodCount.get(r.productName)
    if (e) e.count++
    else prodCount.set(r.productName, { count: 1, image: r.image })
  }
  const topProducts = [...prodCount.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, d]) => ({ name, count: d.count, image: d.image }))

  // Top categories
  const catData = new Map<Category, { count: number; spend: number }>()
  for (const r of history) {
    const e = catData.get(r.category)
    if (e) { e.count++; e.spend += r.price * r.quantity }
    else catData.set(r.category, { count: 1, spend: r.price * r.quantity })
  }
  const topCategories = [...catData.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([category, d]) => ({ category, ...d }))

  // Most purchased category
  const mostPurchasedCategory: Category = topCategories[0]?.category ?? 'Other'

  // Repeat purchase rate
  const uniqueProducts = new Set(history.map(r => r.productName.toLowerCase()))
  const repeatRate = uniqueProducts.size ? Math.min(1, (history.length - uniqueProducts.size) / history.length) : 0

  // Weekly pattern (purchases per day of week)
  const weeklyPattern = Array(7).fill(0)
  for (const r of history) {
    weeklyPattern[new Date(r.purchasedAt).getDay()]++
  }

  return {
    monthlySpend: Math.round(monthlySpend),
    averageBasketSize: parseFloat(avgBasket.toFixed(1)),
    mostPurchasedCategory,
    repeatPurchaseRate: parseFloat((repeatRate * 100).toFixed(1)),
    topProducts,
    topCategories,
    weeklyPattern,
  }
}
