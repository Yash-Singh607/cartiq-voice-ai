import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { Product } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string      // e.g. "500g" from unit variants
  selectedPrice: number      // price of selected variant
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  coupon: string | null
  couponDiscount: number     // flat ₹ off
  tipAmount: number
}

type CartAction =
  | { type: 'ADD'; product: Product; qty?: number; size?: string; price?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; qty: number }
  | { type: 'INC'; productId: string }
  | { type: 'DEC'; productId: string }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE' }
  | { type: 'APPLY_COUPON'; code: string; discount: number }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_TIP'; amount: number }

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.qty ?? 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, {
          product: action.product,
          quantity: action.qty ?? 1,
          selectedSize: action.size ?? action.product.size,
          selectedPrice: action.price ?? action.product.price,
        }],
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.product.id !== action.productId) }
    case 'SET_QTY':
      return {
        ...state,
        items: action.qty <= 0
          ? state.items.filter(i => i.product.id !== action.productId)
          : state.items.map(i => i.product.id === action.productId ? { ...i, quantity: action.qty } : i),
      }
    case 'INC':
      return { ...state, items: state.items.map(i => i.product.id === action.productId ? { ...i, quantity: i.quantity + 1 } : i) }
    case 'DEC':
      return {
        ...state,
        items: state.items
          .map(i => i.product.id === action.productId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'OPEN':   return { ...state, isOpen: true }
    case 'CLOSE':  return { ...state, isOpen: false }
    case 'TOGGLE': return { ...state, isOpen: !state.isOpen }
    case 'APPLY_COUPON':
      return { ...state, coupon: action.code, couponDiscount: action.discount }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, couponDiscount: 0 }
    case 'SET_TIP':
      return { ...state, tipAmount: action.amount }
    default: return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartCtx extends CartState {
  addToCart: (product: Product, qty?: number, size?: string, price?: number) => void
  removeFromCart: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  inc: (productId: string) => void
  dec: (productId: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  setTip: (amount: number) => void
  itemCount: () => number
  subtotal: () => number
  deliveryFee: () => number
  handlingFee: () => number
  grandTotal: () => number
  savingsAmount: () => number
  getItem: (productId: string) => CartItem | undefined
  FREE_DELIVERY_THRESHOLD: number
}

const CartContext = createContext<CartCtx | null>(null)
const CART_KEY_PRIMARY = 'cartiq_cart'
const CART_KEY_LEGACY = 'SnapGrocer_cart'
const FREE_DELIVERY_THRESHOLD = 499

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    isOpen: false,
    coupon: null,
    couponDiscount: 0,
    tipAmount: 0,
  }, (initial) => {
    if (typeof window === 'undefined') return initial
    try {
      const saved = localStorage.getItem(CART_KEY_PRIMARY) || localStorage.getItem(CART_KEY_LEGACY)
      if (saved) return { ...initial, ...JSON.parse(saved), isOpen: false }
    } catch {}
    return initial
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { isOpen, ...persist } = state
      localStorage.setItem(CART_KEY_PRIMARY, JSON.stringify(persist))
    }
  }, [state])

  const subtotal = useCallback(() => state.items.reduce((s, i) => s + i.selectedPrice * i.quantity, 0), [state.items])
  const deliveryFee = useCallback(() => subtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : 25, [subtotal])
  const handlingFee = useCallback(() => state.items.length > 0 ? 5 : 0, [state.items])
  const grandTotal = useCallback(() => Math.max(0, subtotal() + deliveryFee() + handlingFee() + state.tipAmount - state.couponDiscount), [subtotal, deliveryFee, handlingFee, state.tipAmount, state.couponDiscount])
  const itemCount = useCallback(() => state.items.reduce((s, i) => s + i.quantity, 0), [state.items])
  const savingsAmount = useCallback(() => {
    return state.items.reduce((s, i) => s + (i.product.discount ? Math.round(i.product.price * i.product.discount / 100) * i.quantity : 0), 0) + state.couponDiscount
  }, [state.items, state.couponDiscount])
  const getItem = useCallback((id: string) => state.items.find(i => i.product.id === id), [state.items])

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart: (p, q, s, pr) => dispatch({ type: 'ADD', product: p, qty: q, size: s, price: pr }),
      removeFromCart: (id) => dispatch({ type: 'REMOVE', productId: id }),
      setQty: (id, q) => dispatch({ type: 'SET_QTY', productId: id, qty: q }),
      inc: (id) => dispatch({ type: 'INC', productId: id }),
      dec: (id) => dispatch({ type: 'DEC', productId: id }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      openCart: () => dispatch({ type: 'OPEN' }),
      closeCart: () => dispatch({ type: 'CLOSE' }),
      toggleCart: () => dispatch({ type: 'TOGGLE' }),
      applyCoupon: (code, disc) => dispatch({ type: 'APPLY_COUPON', code, discount: disc }),
      removeCoupon: () => dispatch({ type: 'REMOVE_COUPON' }),
      setTip: (a) => dispatch({ type: 'SET_TIP', amount: a }),
      itemCount, subtotal, deliveryFee, handlingFee, grandTotal, savingsAmount, getItem,
      FREE_DELIVERY_THRESHOLD,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}
