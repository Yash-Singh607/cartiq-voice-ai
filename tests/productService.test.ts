import { describe, it, expect } from 'vitest'
import { searchProducts, getProductSubstitutes, PRODUCTS } from '../src/services/productService'

describe('searchProducts', () => {
  it('returns all products with no filters', () => {
    expect(searchProducts({}).length).toBeGreaterThan(50)
  })

  it('filters by query "milk"', () => {
    const r = searchProducts({ query: 'milk' })
    expect(r.length).toBeGreaterThan(0)
    r.forEach(p => {
      const text = `${p.name} ${p.brand} ${p.tags.join(' ')} ${p.category} ${p.description}`.toLowerCase()
      expect(text).toContain('milk')
    })
  })

  it('filters by category Dairy', () => {
    searchProducts({ category: 'Dairy' }).forEach(p => expect(p.category).toBe('Dairy'))
  })

  it('filters by maxPrice 100', () => {
    searchProducts({ maxPrice: 100 }).forEach(p => expect(p.price).toBeLessThanOrEqual(100))
  })

  it('filters by minPrice 200', () => {
    searchProducts({ minPrice: 200 }).forEach(p => expect(p.price).toBeGreaterThanOrEqual(200))
  })

  it('filters by price range 50–200', () => {
    searchProducts({ minPrice: 50, maxPrice: 200 }).forEach(p => {
      expect(p.price).toBeGreaterThanOrEqual(50)
      expect(p.price).toBeLessThanOrEqual(200)
    })
  })

  it('returns empty for impossible query', () => {
    expect(searchProducts({ query: 'xyz123nonexistent' }).length).toBe(0)
  })
})

describe('getProductSubstitutes', () => {
  it('returns substitutes for p001', () => {
    const s = getProductSubstitutes('p001')
    expect(s.length).toBeGreaterThan(0)
    s.forEach(p => expect(p.id).not.toBe('p001'))
  })

  it('returns empty for unknown id', () => {
    expect(getProductSubstitutes('unknown')).toEqual([])
  })
})

describe('PRODUCTS dataset', () => {
  it('has 100+ products', () => expect(PRODUCTS.length).toBeGreaterThanOrEqual(100))
  it('all products have required fields', () => {
    PRODUCTS.forEach(p => {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.price).toBeGreaterThan(0)
      expect(p.image).toBeTruthy()
    })
  })
})
