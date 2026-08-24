import React from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Package } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { CATEGORY_COLOR } from '@/services/categorizationService'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onDetails?: (p: Product) => void
  compact?: boolean
}

export function ProductCard({ product, onDetails, compact = false }: ProductCardProps) {
  const { addItem } = useShopping()
  const [added, setAdded] = React.useState(false)
  const c = CATEGORY_COLOR[product.category]

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product.name, 1, 'item', product.category, product.brand, product.price, product.image, product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => onDetails?.(product)}>
        <ProductImage src={product.image} alt={product.name} className="rounded-xl" skeletonClassName="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
          <p className="text-xs text-slate-400">{product.brand}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-900">{formatINR(product.price)}</p>
          <button onClick={handleAdd} className="text-xs text-brand-600 hover:text-brand-700 font-medium">{added ? '✓ Added' : '+ Add'}</button>
        </div>
      </div>
    )
  }

  return (
    <motion.article whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group"
      onClick={() => onDetails?.(product)}>
      {/* Image */}
      <div className="relative">
        <ProductImage src={product.image} alt={product.name} skeletonClassName="h-44 w-full" className="group-hover:scale-105 transition-transform duration-500" />
        <span className={cn('absolute top-2.5 left-2.5 text-xs font-medium px-2 py-0.5 rounded-full', c.bg, c.text)}>
          {product.category}
        </span>
        {product.organic && (
          <span className="absolute top-2.5 right-2.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Organic</span>
        )}
        {product.discount && (
          <span className="absolute bottom-2.5 left-2.5 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">{product.discount}% OFF</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1 truncate">{product.name}</h3>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-slate-700">{product.rating}</span>
            <span className="text-2xs text-slate-400">({product.ratingCount.toLocaleString()})</span>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-slate-900">{formatINR(product.price)}</p>
            <p className="text-2xs text-slate-400">{product.size}</p>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd}
          disabled={!product.available}
          className={cn('w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
            added ? 'bg-emerald-500 text-white' :
            product.available ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
          aria-label={`Add ${product.name} to shopping list`}>
          <ShoppingCart className="w-4 h-4" />
          {added ? 'Added!' : product.available ? 'Add to List' : 'Out of Stock'}
        </motion.button>
      </div>
    </motion.article>
  )
}
