import { describe, it, expect } from 'vitest'
import { getSeasonalRecs, getTrendingRecs, getSmartRecs, getCurrentSeason } from '../src/services/recommendationService'
import type { ShoppingItem } from '../src/types'

const mockList: ShoppingItem[] = [{
  id: '1', name: 'Whole Milk', quantity: 1, unit: 'item', category: 'Dairy',
  completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}]

describe('recommendationService', () => {
  it('getCurrentSeason returns valid season', () => {
    expect(['spring','summer','monsoon','winter']).toContain(getCurrentSeason())
  })

  it('getSeasonalRecs returns products', () => {
    const r = getSeasonalRecs(4)
    expect(r.length).toBeGreaterThan(0)
    expect(r.length).toBeLessThanOrEqual(4)
    r.forEach(rec => {
      expect(rec.product).toBeDefined()
      expect(rec.type).toBe('seasonal')
      expect(rec.score).toBeGreaterThan(0)
    })
  })

  it('getTrendingRecs excludes current list items', () => {
    const recs = getTrendingRecs(mockList, 10)
    recs.forEach(r => expect(r.product.name).not.toBe('Whole Milk'))
  })

  it('getSmartRecs returns deduplicated results', () => {
    const recs = getSmartRecs([], [], 8)
    const ids = recs.map(r => r.product.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
