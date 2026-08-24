import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ShoppingCart, Search, Sparkles, BarChart3, Settings, ShoppingBag, X, Zap, Store } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useShopping } from '@/context/ShoppingContext'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/app',             label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/app/discover',    label: 'Shop & Discover ⚡', icon: Store, highlight: true },
  { to: '/app/list',        label: 'My List',     icon: ShoppingCart, badge: true },
  { to: '/app/suggestions', label: 'For You',     icon: Zap },
  { to: '/app/insights',    label: 'Insights',    icon: BarChart3 },
  { to: '/app/settings',    label: 'Settings',    icon: Settings },
]

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useApp()
  const { items } = useShopping()
  const activeCount = items.filter(i => !i.completed).length

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm"
            onClick={closeSidebar} />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-[220px] bg-white border-r border-slate-100 flex flex-col',
        'transform transition-transform duration-300 ease-spring',
        'lg:translate-x-0 lg:static lg:z-auto',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )} aria-label="Main navigation">

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-none">SnapGrocer</p>
              <p className="text-2xs text-slate-400 leading-tight mt-0.5">Snap a thought, get it delivered.</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="Close nav"><X className="w-4 h-4" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon: Icon, badge }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/app'}
                  onClick={closeSidebar}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600')} />
                      <span className="flex-1">{label}</span>
                      {badge && activeCount > 0 && (
                        <span className={cn('text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1', isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600')}>
                          {activeCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
