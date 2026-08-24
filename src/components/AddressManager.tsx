import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Home, Briefcase, Map, Plus, Pencil, Trash2, Check, ChevronRight, Star } from 'lucide-react'
import { useAddress, type Address, type AddressType } from '@/context/AddressContext'
import { cn } from '@/utils/cn'

// ─── Address type config ──────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AddressType, { icon: React.ReactNode; color: string; bg: string }> = {
  Home:  { icon: <Home className="w-4 h-4" />,       color: 'text-brand-600',   bg: 'bg-brand-50' },
  Work:  { icon: <Briefcase className="w-4 h-4" />,  color: 'text-purple-600',  bg: 'bg-purple-50' },
  Other: { icon: <Map className="w-4 h-4" />,        color: 'text-amber-600',   bg: 'bg-amber-50' },
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
]

// ─── Form ─────────────────────────────────────────────────────────────────────

interface FormData {
  type: AddressType
  label: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

const EMPTY_FORM: FormData = {
  type: 'Home', label: '', line1: '', line2: '',
  city: '', state: 'Karnataka', pincode: '', phone: '', isDefault: false,
}

function validate(f: FormData): Partial<Record<keyof FormData, string>> {
  const e: Partial<Record<keyof FormData, string>> = {}
  if (!f.label.trim())                          e.label = 'Required'
  if (!f.line1.trim())                          e.line1 = 'Required'
  if (!f.city.trim())                           e.city = 'Required'
  if (!f.pincode.match(/^\d{6}$/))             e.pincode = 'Enter 6-digit pincode'
  if (!f.phone.match(/^[6-9]\d{9}$/))         e.phone = 'Enter valid 10-digit mobile number'
  return e
}

interface AddressFormProps {
  initial?: Address
  onSave: (data: Omit<Address, 'id'>) => void
  onCancel: () => void
}

function AddressForm({ initial, onSave, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { type: initial.type, label: initial.label, line1: initial.line1, line2: initial.line2 ?? '', city: initial.city, state: initial.state, pincode: initial.pincode, phone: initial.phone, isDefault: initial.isDefault }
      : { ...EMPTY_FORM, label: '', type: 'Home' }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const set = (k: keyof FormData, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  // Auto-fill label when type changes and label is empty / matches a type name
  const handleTypeChange = (type: AddressType) => {
    set('type', type)
    const typesAsLabels: AddressType[] = ['Home', 'Work', 'Other']
    if (!form.label || typesAsLabels.includes(form.label as AddressType)) {
      set('label', type)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      type: form.type,
      label: form.label.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      state: form.state,
      pincode: form.pincode,
      phone: form.phone,
      isDefault: form.isDefault,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Address type chips */}
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">Save as</p>
        <div className="flex gap-2">
          {(Object.keys(TYPE_CONFIG) as AddressType[]).map(type => {
            const { icon, color, bg } = TYPE_CONFIG[type]
            const active = form.type === type
            return (
              <button key={type} type="button" onClick={() => handleTypeChange(type)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  active
                    ? `border-current ${color} ${bg}`
                    : 'border-slate-200 text-slate-500 hover:border-ink-300 bg-white'
                )}>
                {icon}{type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Label */}
      <Field label="Address Label *" error={errors.label}>
        <input value={form.label} onChange={e => set('label', e.target.value)}
          placeholder="e.g. Home, Mom's house, Gym" maxLength={40}
          className={inputCls(!!errors.label)} />
      </Field>

      {/* Line 1 */}
      <Field label="Flat / House No., Building Name *" error={errors.line1}>
        <input value={form.line1} onChange={e => set('line1', e.target.value)}
          placeholder="e.g. Flat 4B, Sunrise Apartments"
          className={inputCls(!!errors.line1)} />
      </Field>

      {/* Line 2 */}
      <Field label="Area, Colony, Street, Landmark (optional)">
        <input value={form.line2} onChange={e => set('line2', e.target.value)}
          placeholder="e.g. Near MG Road Metro, Koramangala"
          className={inputCls(false)} />
      </Field>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="City *" error={errors.city}>
          <input value={form.city} onChange={e => set('city', e.target.value)}
            placeholder="Bengaluru"
            className={inputCls(!!errors.city)} />
        </Field>
        <Field label="Pincode *" error={errors.pincode}>
          <input value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="560001" maxLength={6} inputMode="numeric"
            className={inputCls(!!errors.pincode)} />
        </Field>
      </div>

      {/* State */}
      <Field label="State">
        <select value={form.state} onChange={e => set('state', e.target.value)}
          className={inputCls(false)}>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      {/* Phone */}
      <Field label="Mobile Number *" error={errors.phone}>
        <div className="flex">
          <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600 font-medium">
            🇮🇳 +91
          </span>
          <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210" maxLength={10} inputMode="tel"
            className={cn(inputCls(!!errors.phone), 'rounded-l-none')} />
        </div>
      </Field>

      {/* Set as default */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div onClick={() => set('isDefault', !form.isDefault)}
          className={cn(
            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
            form.isDefault ? 'bg-brand-600 border-brand-600' : 'border-ink-300 group-hover:border-brand-400'
          )}>
          {form.isDefault && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Set as default address</p>
          <p className="text-xs text-slate-400">Used for all future orders</p>
        </div>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-3 rounded-2xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors">
          {initial ? 'Save Changes' : 'Add Address'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow',
    hasError ? 'border-rose-400' : 'border-slate-200'
  )
}

// ─── Address card (in the list) ───────────────────────────────────────────────

interface AddressCardProps {
  address: Address
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}

function AddressCard({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const { icon, color, bg } = TYPE_CONFIG[address.type]
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div layout
      className={cn(
        'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
        isSelected ? 'border-brand-500 bg-brand-50/60' : 'border-slate-100 bg-white hover:border-slate-200'
      )}>
      <button onClick={onSelect} className="w-full flex items-start gap-4 p-4 text-left">
        {/* Type icon */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5', bg, color)}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-slate-900">{address.label}</p>
            {address.isDefault && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Default
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {address.line1}
            {address.line2 && `, ${address.line2}`}
          </p>
          <p className="text-xs text-slate-500">{address.city}, {address.state} — {address.pincode}</p>
          <p className="text-xs text-slate-400 mt-0.5">📱 +91 {address.phone}</p>
        </div>

        {/* Selection indicator */}
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all',
          isSelected ? 'border-brand-500 bg-brand-500' : 'border-ink-300'
        )}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </button>

      {/* Actions row */}
      <div className="flex items-center gap-1 px-4 pb-3 pt-0">
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        {!address.isDefault && (
          <button onClick={onSetDefault}
            className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors">
            <Star className="w-3 h-3" /> Set default
          </button>
        )}
        <button onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-rose-500 font-medium hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors ml-auto">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </motion.div>
  )
}

// ─── Delete confirmation ──────────────────────────────────────────────────────

function DeleteConfirm({ address, onConfirm, onCancel }: { address: Address; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 max-w-xs w-full mx-4 text-center shadow-2xl">
      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-rose-500" />
      </div>
      <p className="font-bold text-slate-900 mb-1">Delete address?</p>
      <p className="text-sm text-slate-500 mb-5">
        "<strong>{address.label}</strong>" will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600">
          Delete
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

type ModalView = 'list' | 'add' | 'edit' | 'delete'

interface AddressManagerProps {
  onClose: () => void
  onSelect?: (address: Address) => void
}

export function AddressManager({ onClose, onSelect }: AddressManagerProps) {
  const { addresses, selectedId, selectedAddress, addAddress, updateAddress, deleteAddress, selectAddress, setDefault } = useAddress()
  const [view, setView] = useState<ModalView>('list')
  const [editTarget, setEditTarget] = useState<Address | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)

  const handleSelect = (id: string) => {
    selectAddress(id)
    const addr = addresses.find(a => a.id === id)
    if (addr) onSelect?.(addr)
    onClose()
  }

  const handleEdit = (address: Address) => {
    setEditTarget(address)
    setView('edit')
  }

  const handleDeleteRequest = (address: Address) => {
    setDeleteTarget(address)
    setView('delete')
  }

  const handleSaveNew = (data: Omit<Address, 'id'>) => {
    addAddress(data)
    setView('list')
  }

  const handleSaveEdit = (data: Omit<Address, 'id'>) => {
    if (editTarget) updateAddress(editTarget.id, data)
    setView('list')
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) deleteAddress(deleteTarget.id)
    setDeleteTarget(null)
    setView('list')
  }

  const title = view === 'add' ? 'Add New Address' : view === 'edit' ? 'Edit Address' : 'Deliver to'
  const showBack = view !== 'list' && view !== 'delete'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={view === 'delete' ? undefined : onClose}>

      <AnimatePresence mode="wait">
        {/* Delete confirmation — centered overlay */}
        {view === 'delete' && deleteTarget && (
          <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex items-center justify-center"
            onClick={e => e.stopPropagation()}>
            <DeleteConfirm
              address={deleteTarget}
              onConfirm={handleConfirmDelete}
              onCancel={() => setView('list')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-0 shrink-0" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0">
          {showBack && (
            <button onClick={() => setView('list')}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-600 shrink-0">
              ←
            </button>
          )}
          <p className="font-bold text-slate-900 text-lg flex-1">{title}</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <AnimatePresence mode="wait">
            {/* Address list */}
            {view === 'list' && (
              <motion.div key="list" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                className="space-y-3">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedId === addr.id}
                    onSelect={() => handleSelect(addr.id)}
                    onEdit={() => handleEdit(addr)}
                    onDelete={() => handleDeleteRequest(addr)}
                    onSetDefault={() => setDefault(addr.id)}
                  />
                ))}

                {/* Add new address button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('add')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 hover:border-brand-400 transition-all text-brand-600"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Add New Address</p>
                    <p className="text-xs text-brand-500">Home, Work, or any other location</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </motion.button>
              </motion.div>
            )}

            {/* Add form */}
            {view === 'add' && (
              <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <AddressForm onSave={handleSaveNew} onCancel={() => setView('list')} />
              </motion.div>
            )}

            {/* Edit form */}
            {view === 'edit' && editTarget && (
              <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <AddressForm initial={editTarget} onSave={handleSaveEdit} onCancel={() => setView('list')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
