import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { CartDrawer } from '@/components/CartDrawer'
import { VoiceFloatingPill } from '@/components/VoiceFloatingPill'

export function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8" id="main-content" tabIndex={-1}>
          <AnimatePresence mode="wait">
            <motion.div key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-6xl mx-auto px-4 lg:px-8 py-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />

      {/* Global overlays */}
      <CartDrawer />
      <VoiceFloatingPill />
    </div>
  )
}
