import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { success, failure } from '../utils/response'

const router = Router()

// In-memory store (replace with DB in production)
const lists: Record<string, any[]> = {}

const itemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  unit: z.string().max(50).default('item'),
  category: z.string().max(50).default('Other'),
  brand: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

function getUserList(userId: string): any[] {
  if (!lists[userId]) lists[userId] = []
  return lists[userId]
}

router.get('/', (req, res) => {
  const userId = String(req.query.userId || 'anonymous')
  success(res, getUserList(userId))
})

router.post('/', (req, res) => {
  const result = itemSchema.safeParse(req.body)
  if (!result.success) return failure(res, result.error.errors[0].message)
  const userId = String(req.query.userId || 'anonymous')
  const now = new Date().toISOString()
  const item = { id: uuidv4(), ...result.data, completed: false, createdAt: now, updatedAt: now }
  getUserList(userId).push(item)
  return success(res, item, 201)
})

router.patch('/:id', (req, res) => {
  const userId = String(req.query.userId || 'anonymous')
  const list = getUserList(userId)
  const idx = list.findIndex(i => i.id === req.params.id)
  if (idx === -1) return failure(res, 'Item not found', 404)
  const allowed = ['name', 'quantity', 'unit', 'category', 'brand', 'notes', 'completed']
  const changes: Record<string, any> = {}
  for (const key of allowed) {
    if (req.body[key] !== undefined) changes[key] = req.body[key]
  }
  list[idx] = { ...list[idx], ...changes, updatedAt: new Date().toISOString() }
  return success(res, list[idx])
})

router.delete('/:id', (req, res) => {
  const userId = String(req.query.userId || 'anonymous')
  const list = getUserList(userId)
  const idx = list.findIndex(i => i.id === req.params.id)
  if (idx === -1) return failure(res, 'Item not found', 404)
  list.splice(idx, 1)
  return success(res, { deleted: true })
})

export default router
