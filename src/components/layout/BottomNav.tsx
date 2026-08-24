import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Search, Zap, BarChart3 } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/app',             label: 'Home',     icon: LayoutDashboard },
  { to: '/app/list',        label: 'List',     icon: ShoppingCart, badge: true },
  { to: '/app/discover',    label: 'Search',   icon: Search },
  { to: '/app/suggestions', label: 'For You',  icon: Zap },
  { to: '/app/insights',    label: 'Insights', icon: BarChart3 },
]

export function BottomNav() {
  const { items } = useShopping()
  const count = items.filter(i => !i.completed).length

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-10 bg-white/90 backdrop-blur-sm border-t border-slate-100 safe-area-pb" aria-label="Bottom navigation">
      <ul className="flex">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={to === '/app'} className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-1 py-2 text-2xs font-medium transition-colors',
              isActive ? 'text-brand-600' : 'text-slate-400'
            )} aria-label={label}>
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={cn('w-5 h-5', isActive ? 'text-brand-600' : 'text-slate-400')} />
                    {badge && count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[9px] rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">{count > 9 ? '9+' : count}</span>
                    )}
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
