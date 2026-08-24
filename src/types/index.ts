// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Category =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Bakery'
  | 'Beverages'
  | 'Snacks'
  | 'Household'
  | 'Personal Care'
  | 'Frozen'
  | 'Pantry'
  | 'Other'

export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'all'
export type Language = 'en-US' | 'hi-IN' | 'es-ES' | 'fr-FR' | 'de-DE'

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  price: number          // INR
  currency: string
  rating: number
  ratingCount: number
  size: string
  image: string
  images?: string[]
  description: string
  tags: string[]
  season: Season | Season[]
  substituteIds: string[]
  frequentlyBoughtWith?: string[]
  available: boolean
  discount?: number      // percentage
  organic?: boolean
}

// ─── Shopping Item ────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string
  userId?: string
  productId?: string
  name: string
  quantity: number
  unit: string
  category: Category
  completed: boolean
  brand?: string
  notes?: string
  price?: number
  image?: string
  createdAt: string
  updatedAt: string
}

// ─── Purchase History ─────────────────────────────────────────────────────────

export interface PurchaseRecord {
  id: string
  productId: string
  productName: string
  category: Category
  quantity: number
  unit: string
  price: number
  image?: string
  purchasedAt: string
}

// ─── NLP / Voice ─────────────────────────────────────────────────────────────

export type Intent =
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'UPDATE_ITEM'
  | 'CLEAR_ITEM'
  | 'SEARCH_PRODUCT'
  | 'FILTER_PRODUCT'
  | 'SHOW_LIST'
  | 'GET_RECOMMENDATIONS'
  | 'GET_SUBSTITUTES'
  | 'UNKNOWN'

export interface ParsedCommand {
  intent: Intent
  product?: string
  quantity?: number
  unit?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  category?: Category
  attributes?: string[]
  confidence: number
  rawTranscript: string
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation {
  product: Product
  reason: string
  score: number
  type: 'history' | 'seasonal' | 'trending' | 'substitute' | 'bundle'
  metadata?: { daysSince?: number; frequency?: number }
}

// ─── Insights ────────────────────────────────────────────────────────────────

export interface ShoppingInsights {
  monthlySpend: number
  averageBasketSize: number
  mostPurchasedCategory: Category
  repeatPurchaseRate: number
  topProducts: { name: string; count: number; image?: string }[]
  topCategories: { category: Category; count: number; spend: number }[]
  weeklyPattern: number[]
}

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'
export type DeliveryPreference = 'express' | 'standard' | 'eco'
export type DietaryFilter = 'all' | 'veg' | 'organic'

export interface AppSettings {
  language: Language
  theme: 'light' | 'dark' | 'system'
  currency: Currency
  showCompletedItems: boolean
  enableAiNlp: boolean
  userName: string
  userEmail: string
  userPhone: string
  defaultPaymentMethod: 'upi' | 'card' | 'cod' | 'wallet'
  deliveryPreference: DeliveryPreference
  leaveAtDoor: boolean
  ecoPackaging: boolean
  dietaryFilter: DietaryFilter
  audioChime: boolean
  autoAddCart: boolean
  orderNotifications: boolean
  dealNotifications: boolean
  restockAlerts: boolean
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface ProductFilter {
  query?: string
  brand?: string
  category?: Category
  minPrice?: number
  maxPrice?: number
  attributes?: string[]
  season?: Season
  minRating?: number
}

export interface VoiceCommandResult {
  success: boolean
  message: string
  command?: ParsedCommand
}

export type { CartItem } from '@/context/CartContext'

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

