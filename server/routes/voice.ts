import { Router } from 'express'
import { z } from 'zod'
import { parseCommand } from '../services/nlpService'
import { success, failure } from '../utils/response'

const router = Router()

const parseSchema = z.object({
  transcript: z.string().min(1).max(500),
})

router.post('/parse', (req, res) => {
  const result = parseSchema.safeParse(req.body)
  if (!result.success) {
    return failure(res, 'Invalid request: transcript is required')
  }

  const { transcript } = result.data
  const sanitized = transcript.replace(/<[^>]*>/g, '').slice(0, 500).trim()
  const parsed = parseCommand(sanitized)
  return success(res, parsed)
})

export default router
