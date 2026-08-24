import { Router } from 'express'
import { success } from '../utils/response'

const router = Router()

const month = new Date().getMonth() + 1
const season = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter'

const SEASONAL: Record<string, string[]> = {
  summer: ['Lemonade', 'Ice Cream', 'Sunscreen SPF 50', 'Sparkling Water'],
  winter: ['Hot Chocolate Mix', 'Green Tea', 'Moisturizer', 'Coffee'],
  spring: ['Fruit Salad Mix', 'Green Tea', 'Sparkling Water', 'Yogurt'],
  autumn: ['Apple Cider', 'Pumpkin', 'Granola', 'Soup'],
}

router.get('/', (_req, res) => {
  success(res, {
    season,
    seasonal: SEASONAL[season] || SEASONAL.summer,
    message: 'Recommendations based on season and mock history',
  })
})

export default router
