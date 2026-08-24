import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { ShoppingProvider } from '@/context/ShoppingContext'
import { CartProvider } from '@/context/CartContext'
import { AddressProvider } from '@/context/AddressContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ShoppingListPage } from '@/pages/ShoppingListPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { SuggestionsPage } from '@/pages/SuggestionsPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DemoPage } from '@/pages/DemoPage'
import { ShopPage } from '@/pages/ShopPage'
import { CheckoutPage } from '@/pages/CheckoutPage'

export default function App() {
  return (
    <AppProvider>
      <ShoppingProvider>
        <CartProvider>
          <AddressProvider>
            <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/demo" element={<DemoPage />} />

              {/* Standalone checkout page */}
              <Route path="/app/checkout" element={<CheckoutPage />} />

              {/* App shell */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="list"        element={<ShoppingListPage />} />
                <Route path="discover"    element={<DiscoverPage />} />
                <Route path="suggestions" element={<SuggestionsPage />} />
                <Route path="insights"    element={<InsightsPage />} />
                <Route path="history"     element={<HistoryPage />} />
                <Route path="settings"    element={<SettingsPage />} />
              </Route>

              {/* Legacy & consolidated redirects */}
              <Route path="/shop font"   element={<Navigate to="/app/discover" replace />} />
              <Route path="/app/shop font" element={<Navigate to="/app/discover" replace />} />
              <Route path="/shop"        element={<Navigate to="/app/discover" replace />} />
              <Route path="/app/shop"    element={<Navigate to="/app/discover" replace />} />
              <Route path="/list"        element={<Navigate to="/app/list" replace />} />
              <Route path="/discover"    element={<Navigate to="/app/discover" replace />} />
              <Route path="/suggestions" element={<Navigate to="/app/suggestions" replace />} />
              <Route path="/insights"    element={<Navigate to="/app/insights" replace />} />
              <Route path="/settings"    element={<Navigate to="/app/settings" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </AddressProvider>
        </CartProvider>
      </ShoppingProvider>
    </AppProvider>
  )
}
