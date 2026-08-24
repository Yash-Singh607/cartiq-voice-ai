import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Smartphone, CreditCard, Banknote, ChevronDown, Lock,
  CheckCircle2, MapPin, Home, Briefcase, Map, Copy, ShoppingBag, ArrowLeft,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useCart } from '@/context/CartContext'
import { useAddress } from '@/context/AddressContext'
import { AddressManager } from '@/components/AddressManager'
import { ExitConfirmDialog } from '@/components/ExitConfirmDialog'
import { SubPageHeader } from '@/components/SubPageHeader'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'

type PayMethod = 'upi' | 'card' | 'cod'

const UPI_APPS = [
  { name: 'Google Pay', emoji: '🟡', bg: 'bg-white' },
  { name: 'PhonePe',   emoji: '💜', bg: 'bg-purple-50' },
  { name: 'Paytm',     emoji: '💙', bg: 'bg-sky-50' },
  { name: 'BHIM',      emoji: '🏛️', bg: 'bg-orange-50' },
]

function genOrderId() { return 'CQ' + Math.random().toString(36).slice(2, 8).toUpperCase() }

// ─── Mock QR code (SVG pattern) ───────────────────────────────────────────────

function MockQR({ upiId }: { upiId: string }) {
  const lines = Array.from({ length: 10 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => Math.random() > 0.5)
  )
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <svg width="120" height="120" className="block">
          {lines.map((row, i) => row.map((fill, j) => fill ? (
            <rect key={`${i}-${j}`} x={j * 12} y={i * 12} width={11} height={11} rx={2} fill="#1e40af" />
          ) : null))}
          {/* Corner markers */}
          {[[0,0],[84,0],[0,84]].map(([x,y],k) => (
            <g key={k}>
              <rect x={x} y={y} width={24} height={24} rx={3} fill="#1e40af" />
              <rect x={x+4} y={y+4} width={16} height={16} rx={2} fill="white" />
              <rect x={x+8} y={y+8} width={8} height={8} rx={1} fill="#1e40af" />
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-slate-500">Scan with any UPI app</p>
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
        <p className="text-xs font-mono text-slate-700">{upiId || 'SnapGrocer@upi'}</p>
        <button className="text-slate-400 hover:text-slate-600"><Copy className="w-3 h-3" /></button>
      </div>
    </div>
  )
}

// ─── Live delivery tracker ────────────────────────────────────────────────────

type DeliveryStep = 'confirmed' | 'packed' | 'assigned' | 'arriving' | 'delivered'

const DELIVERY_STEPS: { key: DeliveryStep; label: string; sub: string; duration: number }[] = [
  { key: 'confirmed', label: 'Order Confirmed',           sub: 'We have received your order',         duration: 0 },
  { key: 'packed',    label: 'Packed at Dark Store',      sub: 'Your items are being packed',          duration: 3500 },
  { key: 'assigned',  label: 'Delivery Partner Assigned', sub: 'Rahul is picking up your order',      duration: 8000 },
  { key: 'arriving',  label: 'Arriving in 8 mins',        sub: 'Rahul is on the way to your address', duration: 13000 },
  { key: 'delivered', label: 'Order Delivered! 🎉',        sub: 'Enjoy your order',                    duration: 20000 },
]

function LiveDeliveryTracker({ orderId, total, onClose }: { orderId: string; total: string; onClose: () => void }) {
  const [stepIdx, setStepIdx] = useState(0)
  const [riderX, setRiderX] = useState(0)

  React.useEffect(() => {
    const timers = DELIVERY_STEPS.map((s, i) => {
      if (i === 0) return null
      return setTimeout(() => { setStepIdx(i); setRiderX((i / (DELIVERY_STEPS.length - 1)) * 100) }, s.duration)
    }).filter(Boolean) as ReturnType<typeof setTimeout>[]
    return () => timers.forEach(clearTimeout)
  }, [])

  const isDone = stepIdx === DELIVERY_STEPS.length - 1
  const cur = DELIVERY_STEPS[stepIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">

        {/* Hero gradient header */}
        <div className={cn('relative px-6 py-6 text-white overflow-hidden',
          isDone ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-brand-700 to-brand-600')}>
          <div className="relative z-10">
            <p className="font-black text-xl">{isDone ? '🎉 Delivered!' : '⚡ On the way!'}</p>
            <p className="text-white/80 text-sm mt-0.5">Order #{orderId} · {total}</p>

            {/* ETA chip */}
            {!isDone && (
              <AnimatePresence mode="wait">
                <motion.div key={stepIdx} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-sm font-bold text-white">{cur.label}</span>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          {/* Background rings */}
          {[80, 120, 160].map((s, i) => (
            <div key={i} className="absolute -right-8 -top-8 rounded-full border border-white/10"
              style={{ width: s, height: s }} />
          ))}
        </div>

        {/* Mock map */}
        <div className="relative h-28 bg-gradient-to-b from-emerald-50 to-blue-50 overflow-hidden mx-4 mt-4 rounded-2xl border border-slate-100">
          {/* Grid lines */}
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute inset-y-0 border-l border-slate-100" style={{ left: `${p}%` }} />
          ))}
          {[33, 66].map(p => (
            <div key={p} className="absolute inset-x-0 border-t border-slate-100" style={{ top: `${p}%` }} />
          ))}
          {/* Road */}
          <div className="absolute top-1/2 left-0 right-0 h-3 -translate-y-1/2 bg-slate-200/50 rounded-full" />
          {/* Rider emoji moving */}
          <motion.div
            className="absolute top-1/2 -translate-y-full text-xl"
            animate={{ left: `${riderX}%` }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{ translateX: '-50%' }}
          >
            🛵
          </motion.div>
          {/* Destination */}
          <div className="absolute right-4 top-1/2 -translate-y-full">
            <MapPin className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium">Live tracking simulation</p>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-3">
          {DELIVERY_STEPS.map((step, i) => {
            const done = i <= stepIdx
            const isCur = i === stepIdx
            return (
              <motion.div key={step.key} initial={{ opacity: 0 }} animate={{ opacity: done ? 1 : 0.3 }}
                className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  isCur ? 'bg-brand-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}>
                  {done && !isCur ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <div>
                  <p className={cn('text-sm font-semibold', done ? 'text-slate-900' : 'text-slate-400')}>{step.label}</p>
                  {isCur && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 mt-0.5">{step.sub}</motion.p>}
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose}
            className={cn('w-full py-3.5 rounded-2xl font-bold text-white transition-colors',
              isDone ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900')}>
            {isDone ? 'Rate your order' : 'Track in background'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main checkout page ───────────────────────────────────────────────────────

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, deliveryFee, handlingFee, grandTotal, tipAmount, couponDiscount, coupon, clearCart } = useCart()
  const { selectedAddress } = useAddress()

  const [payMethod, setPayMethod] = useState<PayMethod>('upi')
  const [selectedUpi, setSelectedUpi] = useState(0)
  const [upiId, setUpiId] = useState('')
  const [placing, setPlacing] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showTracking, setShowTracking] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [showAddressManager, setShowAddressManager] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const fireConfetti = () => {
    const fire = (r: number, o: confetti.Options) =>
      confetti({ origin: { y: 0.7 }, particleCount: Math.floor(200 * r), ...o })
    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#2563eb', '#10b981'] })
    fire(0.20, { spread: 60, colors: ['#f59e0b', '#ef4444'] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#60a5fa', '#a78bfa'] })
    fire(0.10, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#34d399'] })
    fire(0.10, { spread: 120, startVelocity: 45, colors: ['#fbbf24'] })
  }

  // Show exit confirm only if order is in progress (placing or address filled)
  const handleBackAttempt = () => {
    if (placing) return   // can't leave while placing
    if (items.length > 0 && selectedAddress) {
      setShowExitConfirm(true)
    } else {
      navigate(-1)
    }
  }

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    navigate('/app/discover')
  }

  const handlePlaceOrder = () => {
    if (placing || !selectedAddress) return
    setPlacing(true)
    setTimeout(() => {
      const id = genOrderId()
      setOrderId(id)
      fireConfetti()
      setTimeout(() => { setShowTracking(true); clearCart() }, 500)
    }, 1500)
  }

  if (items.length === 0 && !showTracking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <SubPageHeader title="Checkout" hideCart />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="font-bold text-slate-800 text-xl mb-2">Your cart is empty</p>
            <p className="text-sm text-slate-500 mb-6">Add items before checking out</p>
            <button
              onClick={() => navigate('/app/discover')}
              className="bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Shop
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky sub-page header with breadcrumb + back + exit confirm */}
      <SubPageHeader
        title="Checkout"
        onBack={handleBackAttempt}
        hideCart
      />

      {/* Return to cart / shop link */}
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
        <button
          onClick={handleBackAttempt}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 font-medium transition-colors group"
        >
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Return to Cart / Shop
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Address card */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {selectedAddress ? (
            <div className="p-5">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    selectedAddress.type === 'Home' ? 'bg-brand-50' : selectedAddress.type === 'Work' ? 'bg-purple-50' : 'bg-amber-50')}>
                    {selectedAddress.type === 'Home'  && <Home      className="w-4 h-4 text-brand-600" />}
                    {selectedAddress.type === 'Work'  && <Briefcase className="w-4 h-4 text-purple-600" />}
                    {selectedAddress.type === 'Other' && <Map       className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{selectedAddress.label}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedAddress.line1}{selectedAddress.line2 && `, ${selectedAddress.line2}`}</p>
                    <p className="text-xs text-slate-500">{selectedAddress.city} — {selectedAddress.pincode}</p>
                    <p className="text-xs text-slate-400 mt-0.5">📱 +91 {selectedAddress.phone}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddressManager(true)} className="text-xs text-brand-600 font-bold hover:underline shrink-0">Change</button>
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-3">⚡ Arriving in ~10 minutes</p>
            </div>
          ) : (
            <button onClick={() => setShowAddressManager(true)}
              className="w-full flex items-center gap-3 p-5 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-brand-600">+ Add delivery address</p>
                <p className="text-xs text-slate-400">Required to place your order</p>
              </div>
            </button>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <button onClick={() => setShowItems(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4">
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
              <p className="text-xs text-slate-400">Tap to view</p>
            </div>
            <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', showItems && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {showItems && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden border-t border-slate-50">
                <div className="px-5 pb-4 pt-3 space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <ProductImage src={item.product.image} alt={item.product.name} skeletonClassName="w-10 h-10 rounded-xl shrink-0" className="rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-400">{item.quantity} × {formatINR(item.selectedPrice)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatINR(item.selectedPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Payment Method</p>
          <div className="flex gap-2 mb-4">
            {([
              { id: 'upi' as PayMethod,  label: 'UPI',  icon: <Smartphone className="w-4 h-4" /> },
              { id: 'card' as PayMethod, label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cod' as PayMethod,  label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
            ]).map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)}
                className={cn('flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-bold transition-all',
                  payMethod === m.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-ink-300')}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {payMethod === 'upi' && (
              <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {UPI_APPS.map((a, i) => (
                    <button key={a.name} onClick={() => setSelectedUpi(i)}
                      className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all',
                        selectedUpi === i ? 'border-brand-500' : 'border-transparent', a.bg, 'border border-slate-100')}>
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-700">{a.name}</span>
                    </button>
                  ))}
                </div>
                {selectedUpi < 2
                  ? <MockQR upiId={upiId || 'SnapGrocer@ybl'} />
                  : <input value={upiId} onChange={e => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. name@paytm)"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand-500" />
                }
              </motion.div>
            )}
            {payMethod === 'card' && (
              <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <input placeholder="Card number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM / YY" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand-500" />
                  <input placeholder="CVV" className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand-500" />
                </div>
                <input placeholder="Name on card" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-brand-500" />
              </motion.div>
            )}
            {payMethod === 'cod' && (
              <motion.div key="cod" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-sm text-amber-800 font-semibold">Pay {formatINR(grandTotal())} in cash on delivery</p>
                <p className="text-xs text-amber-600 mt-0.5">Please keep exact change ready</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bill */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-bold text-slate-900 mb-3">Bill Summary</p>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Item Total</span><span>{formatINR(subtotal())}</span></div>
            <div className="flex justify-between"><span>Delivery</span>
              <span className={deliveryFee() === 0 ? 'text-emerald-600 font-bold' : ''}>{deliveryFee() === 0 ? 'FREE' : formatINR(deliveryFee())}</span>
            </div>
            <div className="flex justify-between"><span>Handling</span><span>{formatINR(handlingFee())}</span></div>
            {tipAmount > 0 && <div className="flex justify-between"><span>Tip</span><span>{formatINR(tipAmount)}</span></div>}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({coupon})</span><span>-{formatINR(couponDiscount)}</span>
              </div>
            )}
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-bold text-slate-900 text-base"><span>Total</span><span>{formatINR(grandTotal())}</span></div>
          </div>
        </div>

        {/* Place order */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={handlePlaceOrder}
          disabled={placing || !selectedAddress}
          className={cn('w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all',
            placing ? 'bg-brand-400 text-white' :
            !selectedAddress ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
            'bg-brand-600 text-white hover:bg-brand-700 shadow-lg')}>
          {placing ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
              <CheckCircle2 className="w-5 h-5" />
            </motion.div> Placing order…</>
          ) : !selectedAddress ? 'Add address to continue'
          : `Place Order · ${formatINR(grandTotal())}`}
        </motion.button>
        <p className="text-center text-xs text-slate-400 pb-6">Secured by SnapGrocer · 256-bit encryption</p>
      </div>

      {/* Live tracking modal */}
      <AnimatePresence>
        {showTracking && orderId && (
          <LiveDeliveryTracker
            orderId={orderId}
            total={formatINR(grandTotal())}
            onClose={() => { setShowTracking(false); navigate('/app/discover') }}
          />
        )}
      </AnimatePresence>

      {/* Address manager */}
      <AnimatePresence>
        {showAddressManager && <AddressManager onClose={() => setShowAddressManager(false)} />}
      </AnimatePresence>

      {/* Exit confirmation dialog */}
      <ExitConfirmDialog
        open={showExitConfirm}
        title="Leave checkout?"
        message="Your cart is saved. You can come back and complete your order anytime."
        confirmLabel="Leave"
        cancelLabel="Stay & Pay"
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  )
}
