import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import type { ShoppingItem, PurchaseRecord, Category } from '@/types'
import { categorize } from '@/services/categorizationService'

// ─── State & Actions ──────────────────────────────────────────────────────────
interface State {
  items: ShoppingItem[]
  history: PurchaseRecord[]
}

type Action =
  | { type: 'ADD'; payload: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'completed'> }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE'; id: string; changes: Partial<ShoppingItem> }
  | { type: 'TOGGLE'; id: string }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_ITEMS'; items: ShoppingItem[] }
  | { type: 'SET_HISTORY'; history: PurchaseRecord[] }
  | { type: 'ADD_HISTORY'; record: PurchaseRecord }

function reducer(state: State, action: Action): State {
  const now = new Date().toISOString()
  switch (action.type) {
    case 'ADD': return {
      ...state,
      items: [...state.items, { ...action.payload, id: uuid(), completed: false, createdAt: now, updatedAt: now }],
    }
    case 'REMOVE': return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'UPDATE': return {
      ...state,
      items: state.items.map(i => i.id === action.id ? { ...i, ...action.changes, updatedAt: now } : i),
    }
    case 'TOGGLE': {
      const item = state.items.find(i => i.id === action.id)
      const newItems = state.items.map(i => i.id === action.id ? { ...i, completed: !i.completed, updatedAt: now } : i)
      let newHistory = state.history
      if (item && !item.completed) {
        const rec: PurchaseRecord = {
          id: uuid(),
          productId: item.productId || item.id,
          productName: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price || 0,
          image: item.image,
          purchasedAt: now,
        }
        newHistory = [rec, ...state.history].slice(0, 200) // keep last 200
      }
      return { items: newItems, history: newHistory }
    }
    case 'CLEAR_COMPLETED': return { ...state, items: state.items.filter(i => !i.completed) }
    case 'SET_ITEMS': return { ...state, items: action.items }
    case 'SET_HISTORY': return { ...state, history: action.history }
    case 'ADD_HISTORY': return { ...state, history: [action.record, ...state.history].slice(0, 200) }
    default: return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface Ctx extends State {
  addItem: (name: string, qty?: number, unit?: string, cat?: Category, brand?: string, price?: number, image?: string, productId?: string) => void
  removeItem: (id: string) => void
  removeByName: (name: string) => boolean
  updateItem: (id: string, changes: Partial<ShoppingItem>) => void
  updateQtyByName: (name: string, qty: number) => boolean
  toggleItem: (id: string) => void
  clearCompleted: () => void
  byCategory: () => Partial<Record<Category, ShoppingItem[]>>
  activeItems: () => ShoppingItem[]
  completedItems: () => ShoppingItem[]
  estimatedTotal: () => number
}

const ShoppingContext = createContext<Ctx | null>(null)

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], history: [] })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const items = localStorage.getItem('cartiq_items') || localStorage.getItem('SnapGrocer_items')
      if (items) dispatch({ type: 'SET_ITEMS', items: JSON.parse(items) })
      const hist = localStorage.getItem('cartiq_history') || localStorage.getItem('SnapGrocer_history')
      if (hist) dispatch({ type: 'SET_HISTORY', history: JSON.parse(hist) })
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartiq_items', JSON.stringify(state.items))
    }
  }, [state.items])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartiq_history', JSON.stringify(state.history))
    }
  }, [state.history])

  const addItem = useCallback((
    name: string, qty = 1, unit = 'item',
    cat?: Category, brand?: string, price?: number, image?: string, productId?: string
  ) => {
    dispatch({ type: 'ADD', payload: {
      name, quantity: qty, unit,
      category: cat ?? categorize(name) as Category,
      brand, price, image, productId,
    }})
  }, [])

  const removeItem = useCallback((id: string) => dispatch({ type: 'REMOVE', id }), [])

  const removeByName = useCallback((name: string): boolean => {
    const item = state.items.find(i => i.name.toLowerCase().includes(name.toLowerCase()))
    if (item) { dispatch({ type: 'REMOVE', id: item.id }); return true }
    return false
  }, [state.items])

  const updateItem = useCallback((id: string, changes: Partial<ShoppingItem>) => {
    dispatch({ type: 'UPDATE', id, changes })
  }, [])

  const updateQtyByName = useCallback((name: string, qty: number): boolean => {
    const item = state.items.find(i => i.name.toLowerCase().includes(name.toLowerCase()))
    if (item) { dispatch({ type: 'UPDATE', id: item.id, changes: { quantity: qty } }); return true }
    return false
  }, [state.items])

  const toggleItem = useCallback((id: string) => dispatch({ type: 'TOGGLE', id }), [])
  const clearCompleted = useCallback(() => dispatch({ type: 'CLEAR_COMPLETED' }), [])

  const byCategory = useCallback((): Partial<Record<Category, ShoppingItem[]>> => {
    const g: Partial<Record<Category, ShoppingItem[]>> = {}
    for (const item of state.items) {
      if (!g[item.category]) g[item.category] = []
      g[item.category]!.push(item)
    }
    return g
  }, [state.items])

  const activeItems = useCallback(() => state.items.filter(i => !i.completed), [state.items])
  const completedItems = useCallback(() => state.items.filter(i => i.completed), [state.items])
  const estimatedTotal = useCallback(() => state.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), [state.items])

  return (
    <ShoppingContext.Provider value={{
      ...state, addItem, removeItem, removeByName,
      updateItem, updateQtyByName, toggleItem, clearCompleted,
      byCategory, activeItems, completedItems, estimatedTotal,
    }}>
      {children}
    </ShoppingContext.Provider>
  )
}

export function useShopping() {
  const ctx = useContext(ShoppingContext)
  if (!ctx) throw new Error('useShopping outside ShoppingProvider')
  return ctx
}
