import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Minus, Plus, Star, ArrowRight, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

interface QuickBuySheetProps {
  product: Product | null
  discountPct?: number          // e.g. 25 for 25% off
  onClose: () => void
}

export function QuickBuySheet({ product, discountPct, onClose }: QuickBuySheetProps) {
  const navigate = useNavigate()
  const { addToCart, getItem, inc, dec, openCart } = useCart()
  const [localQty, setLocalQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) return null

  const item = getItem(product.id)
  const cartQty = item?.quantity ?? 0
  const effectivePrice = discountPct
    ? Math.round(product.price * (1 - discountPct / 100))
    : product.price
  const saving = product.price - effectivePrice

  const handleAddToCart = () => {
    addToCart(product, localQty, product.size, effectivePrice)
    setAdded(true)
  }

  const handleCheckout = () => {
    if (!added && cartQty === 0) addToCart(product, localQty, product.size, effectivePrice)
    onClose()
    navigate('/app/checkout')
  }

  const handleContinueShopping = () => onClose()

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal
            aria-label={`Quick buy: ${product.name}`}
          >
            {/* Drag handle */}
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
              <div>
                <p className="font-bold text-slate-900">Quick Buy</p>
                {discountPct && (
                  <p className="text-xs text-rose-500 font-semibold">{discountPct}% Flash Deal active</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500 border border-slate-200"
                aria-label="Close — continue shopping"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Product hero */}
              <div className="flex gap-4 mb-5">
                <div className="relative shrink-0">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    skeletonClassName="w-24 h-24 rounded-2xl"
                    className="rounded-2xl"
                  />
                  {discountPct && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5">{product.brand}</p>
                  <p className="font-bold text-slate-900 text-base leading-tight mb-1">{product.name}</p>
                  <p className="text-xs text-slate-500 mb-2">{product.size}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('w-3 h-3', i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">{product.rating} ({product.ratingCount.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{formatINR(effectivePrice)}</span>
                    {discountPct && (
                      <span className="text-sm text-slate-400 line-through">{formatINR(product.price)}</span>
                    )}
                  </div>
                  {saving > 0 && (
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">You save {formatINR(saving)}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-slate-50 rounded-2xl p-3.5 mb-4">
                  <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 mb-2">
                <p className="text-sm font-semibold text-slate-700">Quantity</p>
                <div className="flex items-center gap-0 bg-brand-600 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setLocalQty(q => Math.max(1, q - 1))}
                    disabled={localQty <= 1}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <motion.span
                    key={localQty}
                    initial={{ scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="w-10 text-center text-base font-black text-white tabular-nums"
                  >
                    {localQty}
                  </motion.span>
                  <button
                    onClick={() => setLocalQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-brand-700 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-right mb-4">
                Total: <span className="font-bold text-slate-800">{formatINR(effectivePrice * localQty)}</span>
              </p>

              {/* Already in cart indicator */}
              {cartQty > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 mb-4"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-600" />
                    <p className="text-sm font-semibold text-brand-800">
                      {cartQty} already in cart
                    </p>
                  </div>
                  <button
                    onClick={() => { onClose(); openCart() }}
                    className="text-xs text-brand-600 font-bold hover:underline"
                  >
                    View cart →
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sticky action bar */}
            <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white safe-area-pb">
              <div className="flex gap-3">
                {/* Add to cart */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={added}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all border-2',
                    added
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100'
                  )}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </motion.button>

                {/* Proceed to pay */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors shadow-sm"
                >
                  Buy Now <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Continue shopping link */}
              <button
                onClick={handleContinueShopping}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium mt-3 py-1 transition-colors"
              >
                ← Continue browsing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
