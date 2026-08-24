import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'

// Category emoji used as SVG fallback when image fails
const CATEGORY_FALLBACK: Partial<Record<Category | 'default', string>> = {
  Produce:          '🥦',
  Dairy:            '🥛',
  Meat:             '🥩',
  Bakery:           '🍞',
  Beverages:        '🥤',
  Snacks:           '🍿',
  Household:        '🧹',
  'Personal Care':  '🧴',
  Frozen:           '🧊',
  Pantry:           '🫙',
  Other:            '🛒',
  default:          '🛒',
}

// Inline SVG placeholder rendered when CDN image fails
function FallbackPlaceholder({ category, label }: { category?: Category; label: string }) {
  const emoji = (category && CATEGORY_FALLBACK[category]) ?? CATEGORY_FALLBACK.default ?? '🛒'
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-50 select-none">
      <span className="text-3xl" role="img" aria-label={label}>{emoji}</span>
      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80%] text-center leading-tight">{label}</span>
    </div>
  )
}

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  skeletonClassName?: string
  /** Category used to pick the right fallback emoji when the image fails */
  category?: Category
}

export function ProductImage({
  src,
  alt,
  className,
  skeletonClassName,
  category,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const shouldUseFallback = error || !src

  return (
    <div className={cn('relative overflow-hidden bg-slate-50', skeletonClassName)}>
      {/* Shimmer skeleton — shown until image loads or errors */}
      {!loaded && !shouldUseFallback && (
        <div
          className="absolute inset-0 shimmer"
          aria-hidden="true"
        />
      )}

      {/* Category SVG fallback if no src or load error */}
      {shouldUseFallback ? (
        <FallbackPlaceholder category={category} label={alt} />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  )
}
