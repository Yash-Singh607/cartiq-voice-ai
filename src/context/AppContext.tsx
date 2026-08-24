import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AppSettings, Language } from '@/types'

const DEFAULTS: AppSettings = {
  language: 'en-US',
  theme: 'light',
  currency: 'INR',
  showCompletedItems: true,
  enableAiNlp: false,
  userName: 'Alex Johnson',
  userEmail: 'alex.johnson@example.com',
  userPhone: '+91 98765 43210',
  defaultPaymentMethod: 'upi',
  deliveryPreference: 'express',
  leaveAtDoor: false,
  ecoPackaging: true,
  dietaryFilter: 'all',
  audioChime: true,
  autoAddCart: true,
  orderNotifications: true,
  dealNotifications: true,
  restockAlerts: true,
}
const PRIMARY_KEY = 'cartiq_settings'
const LEGACY_KEY = 'SnapGrocer_settings'

interface Ctx extends AppSettings {
  update: (c: Partial<AppSettings>) => void
  setLanguage: (l: Language) => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') return DEFAULTS
    try {
      const s = localStorage.getItem(PRIMARY_KEY) || localStorage.getItem(LEGACY_KEY)
      return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS
    } catch { return DEFAULTS }
  })
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRIMARY_KEY, JSON.stringify(settings))
    }
  }, [settings])

  return (
    <AppContext.Provider value={{
      ...settings,
      update: (c) => setSettings(p => ({ ...p, ...c })),
      setLanguage: (l) => setSettings(p => ({ ...p, language: l })),
      isSidebarOpen,
      toggleSidebar: () => setSidebarOpen(v => !v),
      closeSidebar: () => setSidebarOpen(false),
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp outside AppProvider')
  return ctx
}
