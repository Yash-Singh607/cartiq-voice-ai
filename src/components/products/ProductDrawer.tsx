import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, ShoppingCart, Package, ChevronLeft } from 'lucide-react'
import { ProductImage } from '@/components/ui/ProductImage'
import { ProductCard } from './ProductCard'
import { useShopping } from '@/context/ShoppingContext'
import { useCart } from '@/context/CartContext'
import { getProductSubstitutes } from '@/services/productService'
import { formatINR } from '@/utils/format'
import { CATEGORY_COLOR } from '@/services/categorizationService'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

export function ProductDrawer({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addItem } = useShopping()
  const { addToCart, itemCount, toggleCart } = useCart()
  const [added, setAdded] = React.useState(false)
  const count = itemCount()

  const subs = product ? getProductSubstitutes(product.id) : []

  const handleAdd = () => {
    if (!product) return
    addItem(product.name, 1, 'item', product.category, product.brand, product.price, product.image, product.id)
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1500)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

          {/* Drawer */}
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 overflow-y-auto shadow-2xl"
            role="dialog" aria-modal aria-label={product.name}>

            {/* Sticky drawer nav bar — back + close + cart badge */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-4 h-13 py-3 shadow-xs">
              {/* Back / close */}
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors group"
                aria-label="Close drawer"
              >
                <div className="w-8 h-8 rounded-xl border border-slate-200 bg-white group-hover:border-brand-300 group-hover:bg-brand-50 flex items-center justify-center transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">Back</span>
              </button>

              {/* Breadcrumb trail */}
              <nav className="hidden sm:flex items-center gap-1 text-xs text-slate-400 flex-1 px-3 truncate">
                <span className="hover:text-brand-600 cursor-pointer" onClick={onClose}>Shop</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400">{product.category}</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 font-semibold truncate max-w-[100px]">{product.name}</span>
              </nav>

              {/* Cart badge */}
              <button
                onClick={toggleCart}
                aria-label={`Cart — ${count} items`}
                className="relative flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cart</span>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 ring-2 ring-white"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Hero image */}
            <div className="relative h-60 sm:h-72">
              <ProductImage src={product.image} alt={product.name} skeletonClassName="h-full w-full" className="w-full h-full" />
              {product.organic && (
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  🌿 Organic
                </span>
              )}
              {product.discount && (
                <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Category + rating */}
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border', CATEGORY_COLOR[product.category].bg, CATEGORY_COLOR[product.category].text, CATEGORY_COLOR[product.category].border)}>
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{product.rating}</span>
                  <span className="text-xs text-slate-400">({product.ratingCount.toLocaleString()})</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium mb-1">{product.brand}</p>
              <h2 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{product.name}</h2>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">{product.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="text-xs bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full border border-slate-100">{tag}</span>
                ))}
              </div>

              {/* Price + size */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3.5 mb-5 border border-slate-100">
                <div>
                  <p className="text-2xs text-slate-400 mb-0.5">Price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900">{formatINR(product.price)}</p>
                    {product.discount && (
                      <p className="text-sm text-slate-400 line-through">{formatINR(Math.round(product.price / (1 - product.discount / 100)))}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xs text-slate-400 mb-0.5">Size</p>
                  <p className="text-base font-bold text-slate-700">{product.size}</p>
                </div>
              </div>

              {/* Add to list button */}
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleAdd}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-bold transition-all mb-3',
                  added ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                )}>
                <ShoppingCart className="w-5 h-5" />
                {added ? '✓ Added!' : 'Add to Cart'}
              </motion.button>

              {/* Continue shopping link */}
              <button onClick={onClose}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium py-1 transition-colors mb-4">
                ← Continue Shopping
              </button>

              {/* Substitutes */}
              {subs.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" /> Alternatives
                  </h3>
                  <div className="space-y-2">
                    {subs.map(sub => <ProductCard key={sub.id} product={sub} compact />)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
