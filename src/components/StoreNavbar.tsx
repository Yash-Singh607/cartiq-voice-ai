import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, Search, ShoppingBag, Mic, X, Zap, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAddress } from '@/context/AddressContext'
import { AddressManager } from '@/components/AddressManager'
import { PRODUCTS, FALLBACK_IMAGE } from '@/data/products'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

interface StoreNavbarProps {
  onSearch: (q: string) => void
  searchQuery: string
}

// ─── Quick search result row ──────────────────────────────────────────────────

function SearchResult({ product, onPick }: { product: Product; onAdd: () => void; onPick: () => void }) {
  const { addToCart, getItem } = useCart()
  const qty = getItem(product.id)?.quantity ?? 0
  return (
    <button onClick={onPick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0">
      <img src={product.image} alt={product.name}
        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE }}
        className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
        <p className="text-xs text-slate-400">{product.brand} · {product.size}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-900">{formatINR(product.price)}</p>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); addToCart(product) }}
          className={cn('text-xs font-bold px-2.5 py-1 rounded-lg transition-all',
            qty > 0 ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
          )}>
          {qty > 0 ? `${qty} ✓` : '+ Add'}
        </motion.button>
      </div>
    </button>
  )
}

// ─── Main navbar ──────────────────────────────────────────────────────────────

export function StoreNavbar({ onSearch, searchQuery }: StoreNavbarProps) {
  const { itemCount, toggleCart } = useCart()
  const { selectedAddress } = useAddress()

  const [showAddressManager, setShowAddressManager] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [prevCount, setPrevCount] = useState(0)
  const [bounce, setBounce] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = itemCount()

  // Bounce badge on cart change
  useEffect(() => {
    if (count > prevCount) {
      setBounce(true)
      setTimeout(() => setBounce(false), 600)
    }
    setPrevCount(count)
  }, [count])

  // Debounced live search
  const handleInput = useCallback((q: string) => {
    setLocalQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(q)
      if (q.trim().length >= 2) {
        const lower = q.toLowerCase()
        setResults(
          PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.brand.toLowerCase().includes(lower) ||
            p.tags.some(t => t.includes(lower))
          ).slice(0, 6)
        )
      } else {
        setResults([])
      }
    }, 200)
  }, [onSearch])

  const clearSearch = () => { setLocalQuery(''); onSearch(''); setResults([]) }
  const pickResult = (p: Product) => { handleInput(p.name); setFocused(false); inputRef.current?.blur() }

  const addressLabel = selectedAddress
    ? `${selectedAddress.label}, ${selectedAddress.city}`
    : 'Select address'

  return (
    <>
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        {/* Row 1 — Location + Cart */}
        <div className="px-3 sm:px-4 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
          {/* Location pill */}
          <button onClick={() => setShowAddressManager(true)}
            className="flex items-center gap-2 min-w-0 max-w-[62%] group">
            <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 truncate">{addressLabel}</p>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:text-brand-500 transition-colors" />
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                10-min delivery
              </p>
            </div>
          </button>

          {/* Cart badge */}
          <motion.button
            onClick={toggleCart}
            animate={bounce ? { scale: [1, 1.25, 0.9, 1.05, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="relative bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-3.5 py-2 flex items-center gap-1.5 text-sm font-bold transition-colors shrink-0 shadow-sm"
            aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 ring-2 ring-white"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Row 2 — Search */}
        <div className="px-3 sm:px-4 pb-2.5 relative">
          <div className={cn(
            'flex items-center gap-2 bg-slate-50 rounded-2xl px-4 border transition-all duration-200',
            focused ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-100'
          )}>
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={localQuery}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder='Search groceries, brands...'
              className="flex-1 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {localQuery ? (
              <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-px h-4 bg-slate-200 shrink-0" />
            )}
            <button
              onClick={() => inputRef.current?.focus()}
              className="text-brand-600 shrink-0 hover:text-brand-700"
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Live search dropdown */}
          <AnimatePresence>
            {focused && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-3 right-3 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-40"
              >
                {results.map(p => (
                  <SearchResult key={p.id} product={p} onAdd={() => {}} onPick={() => pickResult(p)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Address manager */}
      <AnimatePresence>
        {showAddressManager && (
          <AddressManager onClose={() => setShowAddressManager(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
