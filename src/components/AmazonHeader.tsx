import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, Search, ShoppingBag, Mic, X, Zap, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAddress } from '@/context/AddressContext'
import { AddressManager } from '@/components/AddressManager'
import { PRODUCTS } from '@/data/products'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import { useApp } from '@/context/AppContext'
import type { Product, Language } from '@/types'

// ─── Quick command pills ──────────────────────────────────────────────────────

const QUICK_COMMANDS = [
  { icon: '🍎', label: '"Organic Apples under ₹200"' },
  { icon: '🥛', label: '"Amul Milk 1L"' },
  { icon: '🥑', label: '"Fresh Avocados"' },
  { icon: '🍫', label: '"Dark Chocolate"' },
  { icon: '☕', label: '"Blue Tokai Coffee"' },
]

import { FALLBACK_IMAGE } from '@/data/products'

// ─── Search result row ────────────────────────────────────────────────────────

function SearchRow({ product, onPick }: { product: Product; onPick: () => void }) {
  const { addToCart, getItem } = useCart()
  const qty = getItem(product.id)?.quantity ?? 0
  return (
    <button onClick={onPick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group border-b border-slate-100 last:border-0">
      <img src={product.image} alt={product.name} loading="lazy"
        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE }}
        className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-400">{product.brand} · {product.size}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-900">{formatINR(product.price)}</p>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); addToCart(product) }}
          className={cn('text-xs font-bold px-2.5 py-1 rounded-lg mt-0.5 transition-all',
            qty > 0 ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
          )}>
          {qty > 0 ? `${qty} ✓` : '+ Add'}
        </motion.button>
      </div>
    </button>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AmazonHeaderProps {
  onSearch: (q: string) => void
  searchQuery?: string
  onVoiceCommand?: (cmd: string) => void
}

// ─── Main header ──────────────────────────────────────────────────────────────

export function AmazonHeader({ onSearch, searchQuery = '', onVoiceCommand }: AmazonHeaderProps) {
  const { language, setLanguage } = useApp()
  const { itemCount, toggleCart } = useCart()
  const { selectedAddress } = useAddress()
  const [showAddrMgr, setShowAddrMgr] = useState(false)
  const [query, setQuery] = useState(searchQuery)
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [prevCount, setPrevCount] = useState(0)
  const [bounce, setBounce] = useState(false)
  const [selectedCat, setSelectedCat] = useState('All')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = itemCount()

  const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
    { code: 'en-US', label: 'EN', flag: '🇺🇸' },
    { code: 'hi-IN', label: 'HI', flag: '🇮🇳' },
    { code: 'es-ES', label: 'ES', flag: '🇪🇸' },
    { code: 'fr-FR', label: 'FR', flag: '🇫🇷' },
    { code: 'de-DE', label: 'DE', flag: '🇩🇪' },
  ]

  const CAT_OPTIONS = ['All','Produce','Dairy','Beverages','Snacks','Pantry','Household','Personal Care']

  useEffect(() => {
    if (count > prevCount) { setBounce(true); setTimeout(() => setBounce(false), 600) }
    setPrevCount(count)
  }, [count])

  const handleInput = useCallback((q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(q)
      if (q.trim().length >= 2) {
        const low = q.toLowerCase()
        setResults(PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(low) ||
          p.brand.toLowerCase().includes(low) ||
          p.tags.some(t => t.includes(low))
        ).slice(0, 7))
      } else setResults([])
    }, 180)
  }, [onSearch])

  const clearSearch = () => { setQuery(''); onSearch(''); setResults([]) }
  const pickResult = (p: Product) => { handleInput(p.name); setFocused(false) }

  const handleQuickCommand = (label: string) => {
    const q = label.replace(/['"]/g, '')
    handleInput(q)
    onVoiceCommand?.(q)
  }

  const addressText = selectedAddress
    ? `${selectedAddress.label} – ${selectedAddress.city} ${selectedAddress.pincode}`
    : 'Select delivery address'

  return (
    <>
      {/* ── Header shell ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-30 shadow-lg">

        {/* Top rail: brand + address + language + cart */}
        <div className="px-4 lg:px-6 py-3 flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white text-lg hidden sm:inline tracking-tight">CartIQ</span>
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping-slow hidden sm:inline-block" />
          </div>

          {/* Address pill */}
          <button onClick={() => setShowAddrMgr(true)}
            className="flex items-center gap-2 min-w-0 flex-1 max-w-[200px] group text-left">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 leading-none mb-0.5">Deliver to</p>
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-white truncate">{addressText}</p>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-brand-400 transition-colors" />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Express delivery badge */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-2.5 py-1.5 rounded-full">
              <Zap className="w-3 h-3" />
              <span>10-min Delivery</span>
            </div>

            {/* Language Dropdown Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                aria-label="Select Language"
              >
                {LANG_OPTIONS.map(l => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart button */}
            <motion.button
              onClick={toggleCart}
              animate={bounce ? { scale: [1, 1.3, 0.9, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-3.5 py-2 font-bold text-sm transition-colors shadow-lg"
              aria-label={`Cart ${count} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 ring-2 ring-slate-900"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Search bar row */}
        <div className="px-4 lg:px-6 pb-3 relative">
          <div className="flex gap-2">
            {/* Department selector */}
            <div className="relative hidden sm:block shrink-0">
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="h-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold pl-3 pr-7 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer transition-colors"
                aria-label="Department"
              >
                {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Search input */}
            <div className={cn(
              'flex-1 flex items-center gap-2 bg-white rounded-xl px-4 border-2 transition-all duration-200',
              focused ? 'border-cyan-400 shadow-lg' : 'border-transparent'
            )}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                placeholder="Search groceries, brands, categories..."
                className="flex-1 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 shrink-0 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="w-px h-5 bg-slate-200 shrink-0" />
              {/* Alexa mic inside search */}
              <button
                onClick={() => { inputRef.current?.focus(); onVoiceCommand?.('') }}
                className="shrink-0 w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center transition-all shadow-sm"
                aria-label="Voice search"
              >
                <Mic className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Live search dropdown */}
          <AnimatePresence>
            {focused && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 right-4 top-full mt-1 bg-white rounded-2xl shadow-card-lg border border-slate-200 overflow-hidden z-50"
              >
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs text-slate-400 font-semibold">{results.length} results for "{query}"</p>
                </div>
                {results.map(p => <SearchRow key={p.id} product={p} onPick={() => pickResult(p)} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick command pill carousel */}
        <div className="flex gap-2 px-4 lg:px-6 pb-3 overflow-x-auto scrollbar-hide">
          {QUICK_COMMANDS.map(cmd => (
            <motion.button key={cmd.label} whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickCommand(cmd.label)}
              className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-all backdrop-blur-sm"
            >
              <span>{cmd.icon}</span>
              <span className="opacity-90">{cmd.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddrMgr && <AddressManager onClose={() => setShowAddrMgr(false)} />}
      </AnimatePresence>
    </>
  )
}
