import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Minus, ChevronDown, Zap } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

// ─── Per-product variants ─────────────────────────────────────────────────────

const VARIANTS: Record<string, { size: string; price: number }[]> = {
  p001: [{ size: '500ml', price: 32 }, { size: '1L', price: 62 }, { size: '2L', price: 120 }],
  p044: [{ size: '500g', price: 105 }, { size: '1kg', price: 199 }, { size: '5kg', price: 920 }],
  p026: [{ size: '500ml', price: 10 }, { size: '1L', price: 20 }, { size: '5L', price: 95 }],
  p049: [{ size: '500ml', price: 99 }, { size: '1L', price: 189 }, { size: '2L', price: 359 }],
  p011: [{ size: '6 pcs', price: 49 }, { size: '12 pcs', price: 89 }],
  p012: [{ size: '500g', price: 79 }, { size: '1kg', price: 149 }],
}

const LOW_STOCK = new Set(['p005', 'p023', 'p070'])
const OUT_STOCK = new Set(['p058', 'p068'])

// ─── Retail badge config ──────────────────────────────────────────────────────

function RetailBadges({ product }: { product: Product }) {
  const tags: { label: string; cls: string }[] = []
  if (product.discount) tags.push({ label: `${product.discount}% OFF`, cls: 'bg-rose-500 text-white' })
  if (product.rating >= 4.8 && !product.discount) tags.push({ label: '#1 Best Seller', cls: 'bg-amber-400 text-amber-900' })
  if (product.rating >= 4.6 && product.ratingCount > 3000) tags.push({ label: "SnapGrocer's Choice", cls: 'bg-cyan-500 text-white' })
  if (LOW_STOCK.has(product.id)) tags.push({ label: 'Only 3 left', cls: 'bg-orange-500 text-white' })
  if (product.organic) tags.push({ label: '🌿 Organic', cls: 'bg-emerald-500 text-white' })

  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
      {tags.slice(0, 2).map(t => (
        <span key={t.label} className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm ${t.cls}`}>{t.label}</span>
      ))}
    </div>
  )
}

// ─── Add / Stepper ────────────────────────────────────────────────────────────

function CartControl({ product, price, size }: { product: Product; price: number; size: string }) {
  const { getItem, addToCart, inc, dec } = useCart()
  const item = getItem(product.id)
  const qty = item?.quantity ?? 0
  const isOut = OUT_STOCK.has(product.id)

  if (isOut) return (
    <button disabled className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed">
      Out of Stock
    </button>
  )

  if (qty === 0) return (
    <motion.button whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.01 }}
      onClick={() => addToCart(product, 1, size, price)}
      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors shadow-sm">
      <Plus className="w-3.5 h-3.5" /> Add
    </motion.button>
  )

  return (
    <motion.div layout initial={{ scale: 0.9 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="flex items-center rounded-xl overflow-hidden bg-brand-600 shadow-sm">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => dec(product.id)}
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </motion.button>
      <motion.span key={qty}
        initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        className="flex-1 text-center text-sm font-black text-white tabular-nums">{qty}</motion.span>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => inc(product.id)}
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

interface EnterpriseProductCardProps {
  product: Product
  onDetails?: (p: Product) => void
  variant?: 'grid' | 'list'
}

export function EnterpriseProductCard({ product, onDetails, variant = 'grid' }: EnterpriseProductCardProps) {
  const productVariants = VARIANTS[product.id]
  const [vi, setVi] = useState(0)
  const [showVariants, setShowVariants] = useState(false)
  const cur = productVariants ? productVariants[vi] : null
  const price = cur?.price ?? product.price
  const size  = cur?.size  ?? product.size
  const isOut = OUT_STOCK.has(product.id)

  // Unit price
  const parseGrams = (s: string) => {
    const m = s.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)/i)
    if (!m) return null
    const v = parseFloat(m[1])
    const u = m[2].toLowerCase()
    const grams = u === 'kg' ? v * 1000 : u === 'l' ? v * 1000 : v
    return grams
  }
  const g = parseGrams(size)
  const unitPrice = g && g > 0 ? `${formatINR(Math.round(price / g * 100))}/100${size.match(/[lL]$/) ? 'ml' : 'g'}` : null

  if (variant === 'list') {
    return (
      <div className="product-card flex items-center gap-4 p-4">
        <div className="relative shrink-0 w-20 h-20">
          <ProductImage src={product.image} alt={product.name} skeletonClassName="w-20 h-20 rounded-xl" className="rounded-xl" />
          {product.discount && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{product.discount}%</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-0.5">{product.brand}</p>
          <p className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-slate-500">{product.rating} ({product.ratingCount.toLocaleString()})</span>
          </div>
        </div>
        <div className="shrink-0 text-right min-w-[90px]">
          <p className="text-base font-black text-slate-900">{formatINR(price)}</p>
          {product.discount && <p className="text-xs text-slate-400 line-through">{formatINR(Math.round(price / (1 - product.discount / 100)))}</p>}
          <div className="mt-2"><CartControl product={product} price={price} size={size} /></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('product-card flex flex-col group relative', isOut && 'opacity-60')}>
      <RetailBadges product={product} />

      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 h-40 cursor-pointer" onClick={() => onDetails?.(product)}>
        <ProductImage src={product.image} alt={product.name}
          skeletonClassName="w-full h-full"
          className="group-hover:scale-[1.04] transition-transform duration-500 w-full h-full" />
        {isOut && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-1">
            <p className="text-xs font-bold text-slate-600">Out of Stock</p>
            <p className="text-[11px] text-brand-600 font-semibold">See alternatives ↓</p>
          </div>
        )}
        {/* Express chip */}
        {!isOut && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" /> Express
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        {/* Rating row */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn('w-2.5 h-2.5', i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />
            ))}
          </div>
          <span className="text-[11px] text-slate-500">{product.rating}</span>
          <span className="text-[11px] text-slate-400 ml-auto">{(product.ratingCount / 1000).toFixed(1)}k reviews</span>
        </div>

        <p className="text-xs text-slate-400">{product.brand}</p>
        <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</p>

        {/* Variant selector */}
        {productVariants ? (
          <div className="relative">
            <button onClick={() => setShowVariants(v => !v)}
              className="w-full flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors border border-slate-200/80">
              <span>{size} · <span className="font-bold text-slate-800">{formatINR(price)}</span></span>
              <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', showVariants && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showVariants && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                  className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-card-lg overflow-hidden">
                  {productVariants.map((v, i) => (
                    <button key={i} onClick={() => { setVi(i); setShowVariants(false) }}
                      className={cn('w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-brand-50 transition-colors',
                        vi === i && 'bg-brand-50 text-brand-700 font-bold')}>
                      <span className="text-slate-700">{v.size}</span>
                      <span className="font-black text-slate-900">{formatINR(v.price)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Price block */
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">{formatINR(price)}</span>
              {product.discount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(Math.round(price / (1 - product.discount / 100)))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{size}</span>
              {unitPrice && <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{unitPrice}</span>}
            </div>
          </div>
        )}

        {/* Add button */}
        <div className="mt-auto pt-1">
          <CartControl product={product} price={price} size={size} />
        </div>
      </div>
    </div>
  )
}
