import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Star, Grid3X3, List, ChevronDown } from 'lucide-react'
import { EnterpriseProductCard } from '@/components/EnterpriseProductCard'
import { ProductDrawer } from '@/components/products/ProductDrawer'
import { SkeletonProductCard } from '@/components/ui/Skeleton'
import { searchProducts } from '@/services/productService'
import { ALL_CATEGORIES, CATEGORY_EMOJI } from '@/services/categorizationService'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import { PromoBannerCarousel } from '@/components/PromoBannerCarousel'
import type { Product, Category, ProductFilter } from '@/types'

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured',   label: 'Featured' },
  { key: 'price_asc',  label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating',     label: 'Customer Rating' },
]

function sortProducts(products: Product[], key: SortKey): Product[] {
  const arr = [...products]
  if (key === 'price_asc')  return arr.sort((a, b) => a.price - b.price)
  if (key === 'price_desc') return arr.sort((a, b) => b.price - a.price)
  if (key === 'rating')     return arr.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
  return arr  // featured — keep original order
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────

interface FilterState {
  category: Category | ''
  minPrice: number
  maxPrice: number
  minRating: number
  organic: boolean
  brand: string
}

const EMPTY_FILTER: FilterState = { category: '', minPrice: 0, maxPrice: 1000, minRating: 0, organic: false, brand: '' }

interface FilterSidebarProps {
  filters: FilterState
  onChange: (f: FilterState) => void
  resultCount: number
}

function FilterSidebar({ filters, onChange, resultCount }: FilterSidebarProps) {
  const brands = useMemo(() => {
    const all = searchProducts({}).map(p => p.brand)
    return [...new Set(all)].sort()
  }, [])

  const set = (k: keyof FilterState, v: unknown) => onChange({ ...filters, [k]: v })

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-4 space-y-4">
        {/* Header */}
        <div className="surface-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
            </p>
            <button onClick={() => onChange(EMPTY_FILTER)}
              className="text-xs text-brand-600 font-semibold hover:text-brand-700 hover:underline">
              Clear all
            </button>
          </div>
          <p className="text-xs text-slate-400">{resultCount} results</p>
        </div>

        {/* Category */}
        <div className="surface-1 p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">Aisle</p>
          <div className="space-y-1">
            <button onClick={() => set('category', '')}
              className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                filters.category === '' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
              <span>All Categories</span>
              {filters.category === '' && <span className="text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded-full">✓</span>}
            </button>
            {ALL_CATEGORIES.filter(c => c !== 'Other').map(cat => {
              const count = searchProducts({ category: cat }).length
              return (
                <button key={cat} onClick={() => set('category', filters.category === cat ? '' : cat)}
                  className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    filters.category === cat ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                  <span className="flex items-center gap-2">{CATEGORY_EMOJI[cat]} {cat}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-full', filters.category === cat ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500')}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Price range */}
        <div className="surface-1 p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">Price Range</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span className="bg-slate-100 px-2 py-1 rounded-lg font-semibold">₹{filters.minPrice}</span>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="bg-slate-100 px-2 py-1 rounded-lg font-semibold">₹{filters.maxPrice}</span>
          </div>
          <div className="space-y-2">
            <input type="range" min={0} max={500} value={filters.minPrice}
              onChange={e => set('minPrice', +e.target.value)}
              className="w-full accent-brand-600 cursor-pointer h-1.5" />
            <input type="range" min={50} max={1000} value={filters.maxPrice}
              onChange={e => set('maxPrice', +e.target.value)}
              className="w-full accent-brand-600 cursor-pointer h-1.5" />
          </div>
          <div className="flex gap-2 mt-3">
            {[100, 250, 500, 1000].map(p => (
              <button key={p} onClick={() => set('maxPrice', p)}
                className={cn('flex-1 text-xs py-1.5 rounded-lg border transition-all font-semibold',
                  filters.maxPrice === p ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300')}>
                ≤{formatINR(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="surface-1 p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">Minimum Rating</p>
          <div className="space-y-1.5">
            {[0, 4, 4.3, 4.5, 4.7].map(r => (
              <button key={r} onClick={() => set('minRating', filters.minRating === r ? 0 : r)}
                className={cn('w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors',
                  filters.minRating === r && r > 0 ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                <span className="flex items-center gap-1.5">
                  {r === 0 ? 'All Ratings' : (
                    <>{[...Array(5)].map((_, i) => <Star key={i} className={cn('w-3 h-3', i < r ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />)}<span>{r}+</span></>
                  )}
                </span>
                {filters.minRating === r && r > 0 && <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary */}
        <div className="surface-1 p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">Dietary</p>
          <label className="flex items-center justify-between cursor-pointer py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="text-sm text-slate-700 font-medium flex items-center gap-2">🌿 Organic Only</span>
            <div onClick={() => set('organic', !filters.organic)}
              className={cn('w-10 h-5 rounded-full transition-colors cursor-pointer relative', filters.organic ? 'bg-emerald-500' : 'bg-slate-200')}>
              <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', filters.organic ? 'left-5' : 'left-0.5')} />
            </div>
          </label>
        </div>
      </div>
    </aside>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DiscoverPage() {
  const [searchQ, setSearchQ] = useState('')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER)
  const [sort, setSort] = useState<SortKey>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const filtered = useMemo(() => {
    const pf: ProductFilter = {
      query: searchQ || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      attributes: filters.organic ? ['organic'] : undefined,
    }
    return sortProducts(searchProducts(pf), sort)
  }, [searchQ, filters, sort])

  const handleSearch = useCallback((q: string) => setSearchQ(q), [])

  const activeFilterCount = [
    filters.category, filters.minPrice > 0, filters.maxPrice < 1000,
    filters.minRating > 0, filters.organic,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Page wrapper */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-3">
        {/* Mobile filter bar */}
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <button onClick={() => setShowMobileFilters(true)}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all',
              activeFilterCount > 0 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200 shadow-xs')}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="bg-white/30 text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
          </button>
          <div className="flex-1 text-sm text-slate-500 font-medium">{filtered.length} products</div>
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar — desktop */}
          <FilterSidebar filters={filters} onChange={setFilters} resultCount={filtered.length} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Promo Flash Deals Carousel */}
            <div className="mb-5">
              <PromoBannerCarousel />
            </div>

            {/* Sort header */}
            <div className="surface-1 p-4 mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">{searchQ ? `Results for "${searchQ}"` : filters.category || 'All Products'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <button onClick={() => setShowSortMenu(v => !v)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-colors">
                    {SORT_OPTIONS.find(o => o.key === sort)?.label}
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showSortMenu && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-card-lg overflow-hidden z-20 min-w-[200px]">
                        {SORT_OPTIONS.map(opt => (
                          <button key={opt.key} onClick={() => { setSort(opt.key); setShowSortMenu(false) }}
                            className={cn('w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 transition-colors',
                              sort === opt.key ? 'text-brand-700 font-bold bg-brand-50' : 'text-slate-700')}>
                            {opt.label}
                            {sort === opt.key && <span className="text-brand-600">✓</span>}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                  {([['grid', Grid3X3], ['list', List]] as const).map(([mode, Icon]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                        viewMode === mode ? 'bg-white shadow-xs text-brand-600' : 'text-slate-400 hover:text-slate-600')}>
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.category && (
                  <FilterChip label={filters.category} onRemove={() => setFilters(f => ({ ...f, category: '' }))} />
                )}
                {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                  <FilterChip label={`₹${filters.minPrice} – ₹${filters.maxPrice}`} onRemove={() => setFilters(f => ({ ...f, minPrice: 0, maxPrice: 1000 }))} />
                )}
                {filters.minRating > 0 && (
                  <FilterChip label={`${filters.minRating}+ Stars`} onRemove={() => setFilters(f => ({ ...f, minRating: 0 }))} />
                )}
                {filters.organic && (
                  <FilterChip label="Organic" onRemove={() => setFilters(f => ({ ...f, organic: false }))} />
                )}
              </div>
            )}

            {/* Product grid */}
            {filtered.length === 0 ? (
              <div className="surface-1 text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="font-bold text-slate-700 text-xl mb-2">No products found</p>
                <p className="text-slate-400 mb-4">Try different keywords or clear some filters</p>
                <button onClick={() => { setSearchQ(''); setFilters(EMPTY_FILTER) }}
                  className="bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div layout
                className={cn('gap-3 sm:gap-4',
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'
                    : 'flex flex-col'
                )}>
                <AnimatePresence>
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} layout
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}>
                      <EnterpriseProductCard
                        product={product}
                        onDetails={setSelected}
                        variant={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowMobileFilters(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-50 overflow-y-auto shadow-2xl lg:hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-slate-900 text-lg">Filters</p>
                  <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <FilterSidebar filters={filters} onChange={f => { setFilters(f); }} resultCount={filtered.length} />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
                <button onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-brand-600 text-white rounded-2xl py-3.5 font-bold text-base hover:bg-brand-700 transition-colors">
                  Show {filtered.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product detail drawer */}
      <ProductDrawer product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors"><X className="w-3 h-3" /></button>
    </div>
  )
}
