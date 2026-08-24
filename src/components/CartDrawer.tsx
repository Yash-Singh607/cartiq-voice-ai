import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Tag, Bike, ArrowLeftRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { formatINR } from '@/utils/format'
import { PRODUCTS, getSubstitutes } from '@/data/products'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'
import type { CartItem } from '@/context/CartContext'

// ─── Coupon codes ─────────────────────────────────────────────────────────────

const COUPONS: Record<string, number> = { VOICE50: 50, SNAP30: 30, FIRST100: 100 }
const TIP_OPTIONS = [0, 10, 20, 50]

// ─── Substitute chip ──────────────────────────────────────────────────────────

function SubstituteChip({ item }: { item: CartItem }) {
  const { addToCart, removeFromCart } = useCart()
  const subs = getSubstitutes(item.product.id)
  const cheaper = subs.find(s => s.price < item.product.price)
  const organic = subs.find(s => s.organic && s.id !== item.product.id)
  const swap = cheaper ?? organic
  if (!swap) return null

  const diff = swap.price - item.product.price
  const label = diff < 0
    ? `Switch to ${swap.brand} — save ${formatINR(Math.abs(diff))}`
    : `Try Organic — ${formatINR(diff)} more`

  const handleSwap = () => {
    removeFromCart(item.product.id)
    addToCart(swap, item.quantity, swap.size, swap.price)
  }

  return (
    <motion.button
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      onClick={handleSwap}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 rounded-xl text-xs font-medium text-brand-700 transition-colors mt-1.5 border border-brand-100"
    >
      <ArrowLeftRight className="w-3 h-3 shrink-0" />
      <span className="truncate">{label}</span>
    </motion.button>
  )
}

// ─── Cart item row ────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { inc, dec } = useCart()

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}>
      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
        <ProductImage src={item.product.image} alt={item.product.name}
          skeletonClassName="w-14 h-14 rounded-xl shrink-0" className="rounded-xl" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
          <p className="text-xs text-slate-400">{item.selectedSize ?? item.product.size}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm font-bold text-slate-900">{formatINR(item.selectedPrice * item.quantity)}</p>
            {item.product.discount && (
              <span className="text-[10px] text-rose-500 line-through">
                {formatINR(Math.round(item.selectedPrice / (1 - item.product.discount / 100)) * item.quantity)}
              </span>
            )}
          </div>
        </div>
        {/* Stepper */}
        <div className="flex items-center bg-brand-600 rounded-xl overflow-hidden shrink-0">
          <button onClick={() => dec(item.product.id)}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <motion.span key={item.quantity} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
            className="w-7 text-center text-sm font-bold text-white">{item.quantity}</motion.span>
          <button onClick={() => inc(item.product.id)}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-brand-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <SubstituteChip item={item} />
    </motion.div>
  )
}

// ─── Bill row helper ──────────────────────────────────────────────────────────

function BillRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between text-sm', highlight ? 'font-bold text-slate-900 text-base' : 'text-slate-600')}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function CartDrawer() {
  const {
    isOpen, closeCart, items, clearCart,
    subtotal, deliveryFee, handlingFee, grandTotal, savingsAmount,
    itemCount, coupon, couponDiscount, applyCoupon, removeCoupon,
    tipAmount, setTip, FREE_DELIVERY_THRESHOLD,
  } = useCart()

  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [couponErr, setCouponErr] = useState('')
  const [couponOk, setCouponOk] = useState('')

  const sub = subtotal()
  const toFree = Math.max(0, FREE_DELIVERY_THRESHOLD - sub)
  const progress = Math.min(100, (sub / FREE_DELIVERY_THRESHOLD) * 100)

  const suggestions = PRODUCTS.filter(p => !items.find(i => i.product.id === p.id) && p.rating >= 4.5).slice(0, 5)

  const applyCouponCode = () => {
    const disc = COUPONS[couponInput.toUpperCase()]
    if (disc) { applyCoupon(couponInput.toUpperCase(), disc); setCouponOk(`₹${disc} off applied!`); setCouponErr('') }
    else { setCouponErr('Invalid code. Try VOICE50'); setCouponOk('') }
  }

  const handleCheckout = () => { closeCart(); navigate('/app/checkout') }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeCart} />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl"
            role="dialog" aria-modal aria-label="Shopping Cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">My Cart</p>
                  <p className="text-xs text-slate-400">{itemCount()} item{itemCount() !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">Clear</button>
                )}
                <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors" aria-label="Close cart">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Free delivery bar */}
            {items.length > 0 && (
              <div className="px-5 py-2.5 bg-brand-50 border-b border-brand-100 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-brand-700 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5" />
                    {toFree > 0 ? <>Add <strong>{formatINR(toFree)}</strong> more for FREE delivery</> : <span className="text-emerald-700">🎉 Free delivery unlocked!</span>}
                  </p>
                  <span className="text-xs text-brand-600 font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-brand-200 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl">🛒</div>
                  <p className="font-bold text-slate-700 text-lg">Your cart is empty</p>
                  <p className="text-sm text-slate-400">Add items from the shop</p>
                  <button onClick={closeCart} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">Browse Shop</button>
                </div>
              ) : (
                <div>
                  {/* Items */}
                  <div className="px-4 py-3 space-y-2">
                    <AnimatePresence>{items.map(item => <CartItemRow key={item.product.id} item={item} />)}</AnimatePresence>
                  </div>

                  {/* You might also like */}
                  <div className="px-4 pb-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">You might also like</p>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                      {suggestions.map(p => (
                        <div key={p.id} className="shrink-0 w-28 bg-slate-50 rounded-xl p-2">
                          <ProductImage src={p.image} alt={p.name} skeletonClassName="h-16 w-full rounded-lg mb-1.5" className="rounded-lg" />
                          <p className="text-xs font-semibold text-slate-800 truncate mb-1">{p.name}</p>
                          <button onClick={() => useCart.prototype} className="hidden" />
                          <AddSuggestion product={p} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="px-4 pb-3">
                    <div className="border border-dashed border-slate-200 rounded-2xl p-3">
                      <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Promo Code</p>
                      {coupon ? (
                        <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2">
                          <span className="text-xs font-bold text-emerald-700">{coupon} — {formatINR(couponDiscount)} off ✓</span>
                          <button onClick={removeCoupon}><X className="w-3.5 h-3.5 text-rose-400" /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input value={couponInput} onChange={e => { setCouponInput(e.target.value); setCouponErr(''); setCouponOk('') }}
                              placeholder="Try VOICE50"
                              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase placeholder:normal-case" />
                            <button onClick={applyCouponCode}
                              className="text-xs bg-brand-600 text-white px-3 py-2 rounded-xl font-bold hover:bg-brand-700 transition-colors">Apply</button>
                          </div>
                          {couponErr && <p className="text-xs text-rose-500 mt-1">{couponErr}</p>}
                          {couponOk  && <p className="text-xs text-emerald-600 mt-1">{couponOk}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="px-4 pb-3">
                    <p className="text-xs font-bold text-slate-600 mb-2">Tip your delivery partner 🙏</p>
                    <div className="flex gap-2">
                      {TIP_OPTIONS.map(t => (
                        <button key={t} onClick={() => setTip(t)}
                          className={cn('flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all',
                            tipAmount === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                          )}>
                          {t === 0 ? 'None' : `₹${t}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bill */}
                  <div className="mx-4 mb-4 bg-slate-50 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700 mb-1">Bill Details</p>
                    <BillRow label="Item Total" value={formatINR(sub)} />
                    {savingsAmount() > 0 && <BillRow label="Item Discount" value={<span className="text-emerald-600 font-semibold">-{formatINR(savingsAmount() - couponDiscount)}</span>} />}
                    <BillRow label="Delivery Fee" value={deliveryFee() === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatINR(deliveryFee())} />
                    <BillRow label="Handling Fee" value={formatINR(handlingFee())} />
                    {tipAmount > 0 && <BillRow label="Delivery Tip" value={formatINR(tipAmount)} />}
                    {couponDiscount > 0 && <BillRow label={`Coupon (${coupon})`} value={<span className="text-emerald-600 font-semibold">-{formatINR(couponDiscount)}</span>} />}
                    <div className="h-px bg-slate-200" />
                    <BillRow label="Total" value={formatINR(grandTotal())} highlight />
                    {savingsAmount() > 0 && (
                      <p className="text-xs text-center text-emerald-600 font-semibold pt-0.5">
                        🎉 Saving {formatINR(savingsAmount())} on this order!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checkout CTA */}
            {items.length > 0 && (
              <div className="px-4 py-4 border-t border-slate-100 shrink-0">
                <button onClick={handleCheckout}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl py-4 font-bold text-base transition-colors flex items-center justify-between px-5">
                  <span className="text-sm text-brand-200">{itemCount()} item{itemCount() !== 1 ? 's' : ''}</span>
                  <span>Proceed to Pay</span>
                  <span>{formatINR(grandTotal())}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Isolated add button for suggestions (avoids hook-in-loop issue)
function AddSuggestion({ product }: { product: import('@/types').Product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = React.useState(false)
  return (
    <button onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1500) }}
      className={cn('w-full text-xs font-bold py-1 rounded-lg transition-all', added ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700')}>
      {added ? '✓' : `+ ${formatINR(product.price)}`}
    </button>
  )
}
