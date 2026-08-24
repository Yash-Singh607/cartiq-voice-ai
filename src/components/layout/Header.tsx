import React, { useState } from 'react'
import { Menu, ShoppingBag, MapPin, ChevronDown, Zap, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useCart } from '@/context/CartContext'
import { useAddress } from '@/context/AddressContext'
import { AddressManager } from '@/components/AddressManager'
import { useTimeContext } from '@/hooks/useTimeContext'
import { getTimeGreeting } from '@/lib/getTimeGreeting'
import { formatINR } from '@/utils/format'
import type { Language } from '@/types'

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: 'en-US', label: 'EN', flag: '🇺🇸' },
  { code: 'hi-IN', label: 'HI', flag: '🇮🇳' },
  { code: 'es-ES', label: 'ES', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'FR', flag: '🇫🇷' },
  { code: 'de-DE', label: 'DE', flag: '🇩🇪' },
]

export function Header() {
  const { language, setLanguage, toggleSidebar } = useApp()
  const { itemCount, subtotal, toggleCart } = useCart()
  const { selectedAddress } = useAddress()
  const { salutation, greetingEmoji, slotCountdownText } = useTimeContext()
  const [showAddressManager, setShowAddressManager] = useState(false)
  const count = itemCount()
  const total = subtotal()

  const addressText = selectedAddress
    ? `${selectedAddress.label} – ${selectedAddress.city}`
    : 'Select delivery address'

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 gap-3 shadow-xs">
        {/* Left section: Mobile menu + Salutation & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{salutation} {greetingEmoji}</p>
            <p className="text-xs text-slate-400 mt-1">What are you shopping for today?</p>
          </div>
        </div>

        {/* Center section: Address selector pill */}
        <button
          onClick={() => setShowAddressManager(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors max-w-[220px] text-left group"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 font-semibold leading-none">Deliver to</p>
            <p className="text-xs font-bold text-slate-800 truncate">{addressText}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
        </button>

        {/* Right section: Express badge + Language Selector + Cart button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Express delivery badge */}
          <div
            title={`Express 10-min delivery batch dispatches in ${slotCountdownText}`}
            className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-help"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>10-min Express</span>
          </div>

          {/* Single clean Language Selector dropdown */}
          <div className="relative flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              {LANGS.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Single Cart Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleCart}
            className="relative flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-3.5 py-2 font-bold text-sm transition-colors shadow-sm"
            aria-label={`Cart ${count} items`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {total > 0 && <span className="hidden md:inline text-xs opacity-90">· {formatINR(total)}</span>}
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 ring-2 ring-white"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* Address Manager Modal */}
      <AnimatePresence>
        {showAddressManager && (
          <AddressManager onClose={() => setShowAddressManager(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
