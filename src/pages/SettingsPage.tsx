import React, { useState } from 'react'
import {
  Globe, Eye, Trash2, Mic, MapPin, ChevronRight, User, Truck,
  Bell, Volume2, Leaf, Check
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { useShopping } from '@/context/ShoppingContext'
import { useAddress } from '@/context/AddressContext'
import { AddressManager } from '@/components/AddressManager'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Language, Currency, DeliveryPreference, DietaryFilter } from '@/types'

const LANGS: { code: Language; label: string; flag: string; example: string }[] = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸', example: '"Add two bottles of milk"' },
  { code: 'hi-IN', label: 'हिंदी (India)', flag: '🇮🇳', example: '"दो बोतल दूध जोड़ो"' },
  { code: 'es-ES', label: 'Español (Spain)', flag: '🇪🇸', example: '"Añade dos botellas de leche"' },
  { code: 'fr-FR', label: 'Français (France)', flag: '🇫🇷', example: '"Ajouter 2 bouteilles de lait"' },
  { code: 'de-DE', label: 'Deutsch (Germany)', flag: '🇩🇪', example: '"Füge 2 Flaschen Milch hinzu"' },
]

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
]

const DELIVERY_OPTIONS: { id: DeliveryPreference; title: string; desc: string; icon: string }[] = [
  { id: 'express', title: 'Express 10-Min Delivery', desc: 'Priority instant dispatch from nearest dark store', icon: '⚡' },
  { id: 'standard', title: 'Standard Delivery (2-4 hrs)', desc: 'Flexible delivery window with zero minimum order fee', icon: '📦' },
  { id: 'eco', title: 'Eco-Friendly Slot', desc: 'Grouped neighborhood delivery to reduce carbon footprint', icon: '🌱' },
]

const COMMANDS = [
  { cmd: '"Add milk"',                       desc: 'Add item to list' },
  { cmd: '"Add 2 bottles of water"',         desc: 'Add with quantity & unit' },
  { cmd: '"I need organic apples"',          desc: 'Natural language add' },
  { cmd: '"Remove bananas"',                 desc: 'Remove an item' },
  { cmd: '"Change milk quantity to 3"',      desc: 'Update quantity' },
  { cmd: '"Find toothpaste under ₹300"',     desc: 'Search with price filter' },
  { cmd: '"Show Amul products"',             desc: 'Filter by brand' },
  { cmd: '"Find organic olive oil"',         desc: 'Search with attribute' },
  { cmd: '"Show alternatives to milk"',      desc: 'Get substitutes' },
]

export function SettingsPage() {
  const {
    language, setLanguage, update, currency, showCompletedItems,
    userName, userEmail, userPhone, deliveryPreference,
    leaveAtDoor, ecoPackaging, dietaryFilter, audioChime, autoAddCart,
    orderNotifications, dealNotifications
  } = useApp()
  const { items, history } = useShopping()
  const { addresses, selectedAddress } = useAddress()

  const [showAddressManager, setShowAddressManager] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(userName ?? 'Alex Johnson')
  const [profileEmail, setProfileEmail] = useState(userEmail ?? 'alex.johnson@example.com')
  const [profilePhone, setProfilePhone] = useState(userPhone ?? '+91 98765 43210')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    update({ userName: profileName, userEmail: profileEmail, userPhone: profilePhone })
    setEditingProfile(false)
  }

  const handleClearData = () => {
    if (window.confirm('This clears all saved cart items and shopping history. Are you sure?')) {
      localStorage.removeItem('cartiq_items')
      localStorage.removeItem('cartiq_history')
      localStorage.removeItem('SnapGrocer_items')
      localStorage.removeItem('SnapGrocer_history')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account & App Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your profile, delivery preferences, and shopping experience</p>
      </div>

      {/* ─── 1. Profile & Account ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              <p className="font-semibold text-slate-900">Customer Profile</p>
            </div>
            <button
              onClick={() => setEditingProfile(v => !v)}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              {editingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Full Name</label>
                <input
                  type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Email Address</label>
                  <input
                    type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Phone Number</label>
                  <input
                    type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="mt-2">Save Profile Changes</Button>
            </form>
          ) : (
            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-lg">
                {profileName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-base truncate">{profileName}</p>
                <p className="text-xs text-slate-400 truncate">{profileEmail} · {profilePhone}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── 2. Delivery & Fulfillment ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <p className="font-semibold text-slate-900">Delivery & Fulfillment Preferences</p>
          </div>
          <p className="text-xs text-slate-400">Default dispatch speed and door delivery rules</p>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Delivery Mode</p>
            {DELIVERY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => update({ deliveryPreference: opt.id })}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  deliveryPreference === opt.id ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{opt.title}</p>
                  <p className="text-xs text-slate-400 truncate">{opt.desc}</p>
                </div>
                {deliveryPreference === opt.id && (
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ leaveAtDoor: !leaveAtDoor })}>
              <div>
                <p className="text-sm font-medium text-slate-900">Leave at door if unavailable</p>
                <p className="text-xs text-slate-400">Rider leaves package securely at doorstep</p>
              </div>
              <div role="switch" aria-checked={leaveAtDoor}
                className={`w-11 h-6 rounded-full transition-colors relative ${leaveAtDoor ? 'bg-brand-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${leaveAtDoor ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ ecoPackaging: !ecoPackaging })}>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Eco-friendly minimal packaging</p>
                  <p className="text-xs text-slate-400">Opt out of extra plastic carrier bags</p>
                </div>
              </div>
              <div role="switch" aria-checked={ecoPackaging}
                className={`w-11 h-6 rounded-full transition-colors relative ${ecoPackaging ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${ecoPackaging ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─── 3. Saved Addresses ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <p className="font-semibold text-slate-900">Saved Addresses</p>
            </div>
            <button onClick={() => setShowAddressManager(true)}
              className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-400">{addresses.length} location{addresses.length !== 1 ? 's' : ''} saved</p>
        </CardHeader>
        <CardBody className="pt-0">
          {addresses.length === 0 ? (
            <button onClick={() => setShowAddressManager(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-brand-200 text-sm text-brand-600 font-semibold hover:bg-brand-50 transition-colors">
              + Add your default address
            </button>
          ) : (
            <div className="space-y-2">
              {addresses.slice(0, 2).map(addr => (
                <div key={addr.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${selectedAddress?.id === addr.id ? 'border-brand-300 bg-brand-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${addr.type === 'Home' ? 'bg-brand-100' : addr.type === 'Work' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                    {addr.type === 'Home' ? '🏠' : addr.type === 'Work' ? '💼' : '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      {addr.label}
                      {addr.isDefault && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Default</span>}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{addr.line1}, {addr.city}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── 4. Regional, Currency & Theme ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            <p className="font-semibold text-slate-900">Currency & Regional Preferences</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Currency</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => update({ currency: c.code })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    currency === c.code ? 'border-brand-500 bg-brand-50 font-bold text-brand-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-base font-bold mr-1">{c.symbol}</span>
                  <span className="text-xs">{c.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dietary Filter Default</p>
            <div className="flex gap-2">
              {[
                { id: 'all', label: '🛒 All Products' },
                { id: 'veg', label: '🌱 Vegetarian Only' },
                { id: 'organic', label: '🌿 Organic Only' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => update({ dietaryFilter: d.id as DietaryFilter })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    dietaryFilter === d.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between cursor-pointer" onClick={() => update({ showCompletedItems: !showCompletedItems })}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Show completed list items</p>
                <p className="text-xs text-slate-400">Keep checked items visible in the list</p>
              </div>
            </div>
            <div role="switch" aria-checked={showCompletedItems}
              className={`w-11 h-6 rounded-full transition-colors relative ${showCompletedItems ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${showCompletedItems ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─── 5. Voice & Assistant Controls ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-brand-600" />
            <p className="font-semibold text-slate-900">Voice Assistant Controls</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Voice Recognition Language</p>
            <div className="space-y-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    language === l.code ? 'border-brand-500 bg-brand-50/60 font-medium' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                  <span className="text-xl">{l.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{l.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{l.example}</p>
                  </div>
                  {language === l.code && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ audioChime: !audioChime })}>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Audio Chime Feedback</p>
                  <p className="text-xs text-slate-400">Play pleasant sound on voice start and completion</p>
                </div>
              </div>
              <div role="switch" aria-checked={audioChime}
                className={`w-11 h-6 rounded-full transition-colors relative ${audioChime ? 'bg-brand-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${audioChime ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ autoAddCart: !autoAddCart })}>
              <div>
                <p className="text-sm font-medium text-slate-900">Auto-add voice items to Cart</p>
                <p className="text-xs text-slate-400">Add directly to active checkout cart instead of list</p>
              </div>
              <div role="switch" aria-checked={autoAddCart}
                className={`w-11 h-6 rounded-full transition-colors relative ${autoAddCart ? 'bg-brand-600' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAddCart ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─── 6. Notifications ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            <p className="font-semibold text-slate-900">Notifications & Alerts</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ orderNotifications: !orderNotifications })}>
            <div>
              <p className="text-sm font-medium text-slate-900">Order Delivery Updates</p>
              <p className="text-xs text-slate-400">Rider dispatch, arrival, and delivery receipts</p>
            </div>
            <div role="switch" aria-checked={orderNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative ${orderNotifications ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${orderNotifications ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>

          <div className="flex items-center justify-between cursor-pointer" onClick={() => update({ dealNotifications: !dealNotifications })}>
            <div>
              <p className="text-sm font-medium text-slate-900">Voice Deals & Flash Sales</p>
              <p className="text-xs text-slate-400">Daily promotional discounts and coupon drops</p>
            </div>
            <div role="switch" aria-checked={dealNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative ${dealNotifications ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dealNotifications ? 'left-5' : 'left-0.5'}`} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─── 7. Voice Command Reference ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-brand-500" />
            <p className="font-semibold text-slate-900">Voice Command Reference</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-2">
            {COMMANDS.map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <code className="text-xs bg-slate-50 text-slate-700 px-2 py-1 rounded-lg font-mono shrink-0">{cmd}</code>
                <p className="text-xs text-slate-500 pt-1">{desc}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ─── 8. Data & Privacy Controls ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <p className="font-semibold text-slate-900">Data & Storage Management</p>
          </div>
          <p className="text-xs text-slate-400">{items.length} list items · {history.length} history records stored locally</p>
        </CardHeader>
        <CardBody className="pt-0">
          <Button variant="danger" size="sm" onClick={handleClearData}>
            <Trash2 className="w-4 h-4" /> Reset All App Data
          </Button>
        </CardBody>
      </Card>

      {/* Address manager modal */}
      <AnimatePresence>
        {showAddressManager && (
          <AddressManager onClose={() => setShowAddressManager(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
