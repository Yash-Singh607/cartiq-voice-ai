import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Minus, ChevronDown, Zap } from 'lucide-react'
import { StoreNavbar } from '@/components/StoreNavbar'
import { SubPageHeader } from '@/components/SubPageHeader'
import { PromoBannerCarousel } from '@/components/PromoBannerCarousel'
import { VoiceAssistantOverlay } from '@/components/VoiceAssistantOverlay'
import { CartDrawer } from '@/components/CartDrawer'
import { QuickBuySheet } from '@/components/QuickBuySheet'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatINR } from '@/utils/format'
import { PRODUCTS } from '@/data/products'
import { CATEGORY_EMOJI } from '@/services/categorizationService'
import { cn } from '@/utils/cn'
import type { Product, Category } from '@/types'

// ─── Category pills ───────────────────────────────────────────────────────────

const CAT_PILLS: { label: string; id: Category | 'All' }[] = [
  { label: '🛒 All',           id: 'All' },
  { label: '🥦 Vegetables',    id: 'Produce' },
  { label: '🥛 Dairy & Eggs',  id: 'Dairy' },
  { label: '🥤 Cold Drinks',   id: 'Beverages' },
  { label: '🍿 Munchies',      id: 'Snacks' },
  { label: '🍞 Bakery',        id: 'Bakery' },
  { label: '🫙 Pantry',        id: 'Pantry' },
  { label: '🧊 Frozen',        id: 'Frozen' },
  { label: '🧴 Personal Care', id: 'Personal Care' },
  { label: '🧹 Household',     id: 'Household' },
]

// ─── Per-product unit variants ────────────────────────────────────────────────

const UNIT_VARIANTS: Record<string, { size: string; price: number }[]> = {
  p001: [{ size: '500ml', price: 32 }, { size: '1L', price: 62 }, { size: '2L', price: 120 }],
  p044: [{ size: '500g', price: 105 }, { size: '1kg', price: 199 }, { size: '5kg', price: 920 }],
  p026: [{ size: '500ml', price: 10 }, { size: '1L', price: 20 }, { size: '5L', price: 95 }],
  p049: [{ size: '500ml', price: 99 }, { size: '1L', price: 189 }, { size: '2L', price: 359 }],
  p011: [{ size: '6 pcs', price: 49 }, { size: '12 pcs', price: 89 }],
  p012: [{ size: '500g', price: 79 }, { size: '1kg', price: 149 }],
}

const LOW_STOCK  = new Set(['p005', 'p023', 'p070'])
const OUT_STOCK  = new Set(['p058', 'p068'])

// ─── Add / Stepper button ─────────────────────────────────────────────────────

function AddButton({ product, price, size }: { product: Product; price: number; size: string }) {
  const { getItem, addToCart, inc, dec } = useCart()
  const item = getItem(product.id)
  const qty = item?.quantity ?? 0
  const isOut = OUT_STOCK.has(product.id)

  if (isOut) return (
    <button disabled className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">
      Sold Out
    </button>
  )

  if (qty === 0) return (
    <motion.button whileTap={{ scale: 0.93 }}
      onClick={() => addToCart(product, 1, size, price)}
      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors shadow-sm">
      <Plus className="w-3.5 h-3.5" /> ADD
    </motion.button>
  )

  return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
      className="flex items-center rounded-xl overflow-hidden bg-brand-600">
      <button onClick={() => dec(product.id)}
        className="w-9 h-9 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <motion.span key={qty} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex-1 text-center text-sm font-black text-white">{qty}</motion.span>
      <button onClick={() => inc(product.id)}
        className="w-9 h-9 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ShopCard({ product }: { product: Product }) {
  const variants = UNIT_VARIANTS[product.id]
  const [vi, setVi] = useState(0)
  const [showV, setShowV] = useState(false)
  const cur = variants ? variants[vi] : null
  const price = cur?.price ?? product.price
  const size  = cur?.size  ?? product.size
  const isLow  = LOW_STOCK.has(product.id)
  const isOut  = OUT_STOCK.has(product.id)

  return (
    <div className={cn(
      'bg-white rounded-2xl border overflow-hidden flex flex-col group relative transition-all duration-200',
      isOut ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:border-brand-200 hover:shadow-md'
    )}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
        {product.discount && <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{product.discount}% OFF</span>}
        {product.rating >= 4.8 && !product.discount && <span className="bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full">BESTSELLER</span>}
        {isLow && !isOut && <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">FEW LEFT</span>}
        {product.organic && <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">🌿 ORGANIC</span>}
      </div>

      {/* Image */}
      <div className="relative h-36 bg-slate-50 overflow-hidden">
        <ProductImage src={product.image} alt={product.name}
          skeletonClassName="w-full h-full"
          className="group-hover:scale-105 transition-transform duration-500" />
        {isOut && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-600">Out of stock</p>
            <p className="text-xs text-brand-600 font-medium mt-0.5">↓ Alternatives available</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[11px] text-slate-500">{product.rating}</span>
          <span className="text-[11px] text-slate-300 ml-auto">{product.brand}</span>
        </div>
        <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</p>

        {/* Variant selector */}
        {variants ? (
          <div className="relative">
            <button onClick={() => setShowV(v => !v)}
              className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors w-full justify-between">
              <span>{size} · {formatINR(price)}</span>
              <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', showV && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showV && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                  {variants.map((v, i) => (
                    <button key={i} onClick={() => { setVi(i); setShowV(false) }}
                      className={cn('w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-brand-50 transition-colors',
                        vi === i && 'bg-brand-50 text-brand-700 font-bold')}>
                      <span>{v.size}</span>
                      <span className="font-bold">{formatINR(v.price)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900">{formatINR(price)}</span>
            {product.discount && (
              <span className="text-xs text-slate-400 line-through">
                {formatINR(Math.round(price / (1 - product.discount / 100)))}
              </span>
            )}
            <span className="text-xs text-slate-400 ml-auto">{size}</span>
          </div>
        )}

        <div className="mt-auto pt-0.5">
          <AddButton product={product} price={price} size={size} />
        </div>
      </div>
    </div>
  )
}

// ─── Voice deal countdown ─────────────────────────────────────────────────────

const DEAL = PRODUCTS.find(p => p.id === 'p077') ?? PRODUCTS[6]

function VoiceDeal({ onClaimDeal }: { onClaimDeal: (p: typeof DEAL) => void }) {
  const [secs, setSecs] = useState(299)
  useEffect(() => { const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 299), 1000); return () => clearInterval(t) }, [])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-4 text-white">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-black text-yellow-200 uppercase tracking-wider">Flash Voice Deal</span>
          </div>
          <p className="font-black text-lg leading-tight">{DEAL.name}</p>
          <p className="text-white/80 text-sm">{DEAL.brand} · {DEAL.size}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-2xl font-black">{formatINR(Math.round(DEAL.price * 0.75))}</span>
            <span className="text-white/60 line-through text-sm">{formatINR(DEAL.price)}</span>
            <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full">25% OFF</span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="bg-black/25 rounded-xl px-3 py-2 text-center">
            <p className="text-[10px] text-white/60 mb-0.5">Ends in</p>
            <p className="text-xl font-black font-mono tabular-nums">{mm}:{ss}</p>
          </div>
          <ProductImage src={DEAL.image} alt={DEAL.name} skeletonClassName="w-16 h-16 rounded-xl" className="rounded-xl" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {/* Opens QuickBuySheet instead of direct addToCart */}
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => onClaimDeal(DEAL)}
          className="flex-1 py-2.5 rounded-xl font-black text-sm bg-white text-rose-600 hover:bg-rose-50 transition-all">
          ⚡ Claim Deal Now
        </motion.button>
        <div className="bg-black/20 rounded-xl px-3 py-2.5 text-xs text-white/80 font-bold backdrop-blur-sm">
          🎙️ "Claim Deal"
        </div>
      </div>
    </div>
  )
}

// ─── Main ShopPage ────────────────────────────────────────────────────────────

export function ShopPage() {
  const [activeCat, setActiveCat] = useState<Category | 'All'>('All')
  const [searchQ, setSearchQ] = useState('')
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null)
  const [quickBuyDiscount, setQuickBuyDiscount] = useState<number | undefined>()
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({})
  const pillRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Filter products
  const filtered = PRODUCTS.filter(p => {
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
    }
    if (activeCat !== 'All') return p.category === activeCat
    return true
  })

  const byCat: Partial<Record<Category, Product[]>> = {}
  for (const p of filtered) {
    if (!byCat[p.category]) byCat[p.category] = []
    byCat[p.category]!.push(p)
  }

  const scrollToCat = (cat: Category | 'All') => {
    setActiveCat(cat)
    if (cat !== 'All') {
      categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Scroll spy
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const handler = () => {
      for (const cat of Object.keys(categoryRefs.current) as Category[]) {
        const el = categoryRefs.current[cat]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top >= -20 && r.top < window.innerHeight * 0.4) {
          setActiveCat(cat)
          pillRef.current?.querySelector(`[data-cat="${cat}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' })
          break
        }
      }
    }
    container.addEventListener('scroll', handler, { passive: true })
    return () => container.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = useCallback((q: string) => setSearchQ(q), [])

  const handleClaimDeal = (product: Product) => {
    setQuickBuyProduct(product)
    setQuickBuyDiscount(25)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Sticky sub-page header with back nav + breadcrumb + cart badge */}
      <SubPageHeader activeCrumb={activeCat !== 'All' ? activeCat : undefined} />

      {/* Store search + location navbar */}
      <StoreNavbar onSearch={handleSearch} searchQuery={searchQ} />

      {/* Category pill rail */}
      <div className="bg-white border-b border-slate-200/80 shrink-0">
        <div ref={pillRef} className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-hide">
          {CAT_PILLS.map(({ label, id }) => (
            <button key={id} data-cat={id} onClick={() => scrollToCat(id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border',
                activeCat === id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-32 lg:pb-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-8">

          {/* Promo banner carousel */}
          <PromoBannerCarousel />

          {/* Voice deal — opens QuickBuySheet */}
          <VoiceDeal onClaimDeal={handleClaimDeal} />

          {/* Product sections */}
          {(Object.entries(byCat) as [Category, Product[]][]).map(([cat, prods]) => (
            <section key={cat} ref={el => { categoryRefs.current[cat] = el }}>
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-2xl">{CATEGORY_EMOJI[cat]}</span>
                <h2 className="text-lg font-black text-slate-900">{cat}</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{prods.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {prods.map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.2 }}>
                    <ShopCard product={p} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-bold text-slate-700 text-lg">No products found</p>
              <p className="text-sm text-slate-400 mt-1 mb-4">Try a different search or category</p>
              <button onClick={() => { setSearchQ(''); setActiveCat('All') }}
                className="text-brand-600 text-sm font-bold hover:underline">Clear search</button>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer */}
      <CartDrawer />

      {/* Dynamic Island voice overlay */}
      <VoiceAssistantOverlay onSearch={handleSearch} />

      {/* Quick buy bottom sheet (Claim Deal / Buy Now) */}
      <QuickBuySheet
        product={quickBuyProduct}
        discountPct={quickBuyDiscount}
        onClose={() => { setQuickBuyProduct(null); setQuickBuyDiscount(undefined) }}
      />
    </div>
  )
}
