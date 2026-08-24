import { Router } from 'express'
import { success, failure } from '../utils/response'

const router = Router()

// Import mock data at runtime (server-side)
// In production this would connect to a real product DB/API
const PRODUCTS = [
  { id: 'p001', name: 'Whole Milk', brand: 'Amul', category: 'Dairy', price: 2.49, currency: 'USD', rating: 4.5, available: true },
  { id: 'p026', name: 'Bottled Water', brand: 'Evian', category: 'Beverages', price: 1.99, currency: 'USD', rating: 4.3, available: true },
  // Extend with full dataset in production
]

router.get('/', (_req, res) => {
  success(res, PRODUCTS)
})

router.get('/search', (req, res) => {
  const { q, brand, category, minPrice, maxPrice } = req.query

  let results = [...PRODUCTS]
  if (q) results = results.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()))
  if (brand) results = results.filter(p => p.brand.toLowerCase().includes(String(brand).toLowerCase()))
  if (category) results = results.filter(p => p.category === String(category))
  if (minPrice) results = results.filter(p => p.price >= parseFloat(String(minPrice)))
  if (maxPrice) results = results.filter(p => p.price <= parseFloat(String(maxPrice)))

  success(res, results)
})

router.get('/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id)
  if (!product) return failure(res, 'Product not found', 404)
  return success(res, product)
})

export default router
