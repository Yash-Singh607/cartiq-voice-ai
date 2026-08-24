import { PRODUCTS, getSubstitutes, getFrequentlyBoughtWith } from '@/data/products'
import type { Product, ProductFilter } from '@/types'

export function searchProducts(filter: ProductFilter): Product[] {
  let r = [...PRODUCTS]

  if (filter.query) {
    const q = filter.query.toLowerCase()
    r = r.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  }

  if (filter.brand) {
    const b = filter.brand.toLowerCase()
    r = r.filter(p => p.brand.toLowerCase().includes(b))
  }

  if (filter.category) r = r.filter(p => p.category === filter.category)
  if (filter.minPrice !== undefined) r = r.filter(p => p.price >= filter.minPrice!)
  if (filter.maxPrice !== undefined) r = r.filter(p => p.price <= filter.maxPrice!)
  if (filter.minRating !== undefined) r = r.filter(p => p.rating >= filter.minRating!)

  if (filter.attributes?.length) {
    r = r.filter(p =>
      filter.attributes!.some(a =>
        p.tags.some(t => t.toLowerCase().includes(a.toLowerCase())) ||
        (a === 'organic' && p.organic)
      )
    )
  }

  if (filter.season && filter.season !== 'all') {
    r = r.filter(p => {
      const s = p.season
      if (Array.isArray(s)) return s.includes(filter.season!) || s.includes('all')
      return s === filter.season || s === 'all'
    })
  }

  return r.sort((a, b) => b.rating - a.rating)
}

export function getProductSubstitutes(productId: string): Product[] {
  return getSubstitutes(productId)
}

export function getProductBundle(productId: string): Product[] {
  return getFrequentlyBoughtWith(productId)
}

export function findByName(name: string): Product | undefined {
  const n = name.toLowerCase()
  return PRODUCTS.find(p =>
    p.name.toLowerCase().includes(n) || p.tags.some(t => t.includes(n))
  )
}

export { PRODUCTS }
