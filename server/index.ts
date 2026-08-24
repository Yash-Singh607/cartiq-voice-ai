import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import shoppingListRouter from './routes/shoppingList'
import productsRouter from './routes/products'
import voiceRouter from './routes/voice'
import recommendationsRouter from './routes/recommendations'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(requestLogger)

// ── Routes ─────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/shopping-list', shoppingListRouter)
app.use('/api/products', productsRouter)
app.use('/api/voice', voiceRouter)
app.use('/api/recommendations', recommendationsRouter)

// ── Error handling ────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SnapGrocer server running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
})

export default app
