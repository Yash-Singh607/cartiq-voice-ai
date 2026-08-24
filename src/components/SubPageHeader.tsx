import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/utils/cn'

// ─── Breadcrumb config ────────────────────────────────────────────────────────

const CRUMB_MAP: Record<string, string> = {
  '':          'Home',
  'app':       'Home',
  'shop':      'Shop Now',
  'checkout':  'Checkout',
  'list':      'My List',
  'discover':  'Discover',
  'suggestions': 'For You',
  'insights':  'Insights',
  'history':   'History',
  'settings':  'Settings',
}

interface SubPageHeaderProps {
  /** Override the generated title */
  title?: string
  /** Extra crumb appended at the end, e.g. current category */
  activeCrumb?: string
  /** Called instead of router.back() if provided */
  onBack?: () => void
  /** Hide the cart badge */
  hideCart?: boolean
  className?: string
}

export function SubPageHeader({
  title,
  activeCrumb,
  onBack,
  hideCart = false,
  className,
}: SubPageHeaderProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { itemCount, toggleCart } = useCart()
  const count = itemCount()

  // Build breadcrumbs from pathname — skip the first segment if it equals 'app'
  // to avoid "Home / Home / Shop Now" duplication
  const segments = pathname.split('/').filter(s => s && s !== 'app')
  const crumbs: { label: string; path: string }[] = [{ label: 'Home', path: '/app' }]
  let accumulated = '/app'
  for (const seg of segments) {
    accumulated += `/${seg}`
    const label = CRUMB_MAP[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    crumbs.push({ label, path: accumulated })
  }
  if (activeCrumb && activeCrumb !== crumbs[crumbs.length - 1]?.label) {
    crumbs.push({ label: activeCrumb, path: '#' })
  }

  const displayTitle = title ?? crumbs[crumbs.length - 1]?.label ?? 'Page'

  const handleBack = () => {
    if (onBack) { onBack(); return }
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/app')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200/80 shadow-xs',
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 h-14 max-w-screen-xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl border border-slate-200 bg-white group-hover:border-brand-300 group-hover:bg-brand-50 flex items-center justify-center transition-all shadow-xs">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Breadcrumbs — hidden on very small screens */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <React.Fragment key={crumb.path + i}>
                {i > 0 && <span className="text-slate-300 text-xs shrink-0">/</span>}
                {isLast ? (
                  <span className="text-xs font-bold text-slate-800 truncate">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-xs font-medium text-slate-400 hover:text-brand-600 transition-colors shrink-0 truncate max-w-[80px]"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            )
          })}
        </nav>

        {/* Title — mobile only (when breadcrumbs are hidden) */}
        <p className="sm:hidden flex-1 text-sm font-bold text-slate-900 truncate">{displayTitle}</p>

        {/* Cart trigger */}
        {!hideCart && (
          <button
            onClick={toggleCart}
            aria-label={`Cart — ${count} item${count !== 1 ? 's' : ''}`}
            className="relative ml-auto shrink-0 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 ring-2 ring-white"
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
