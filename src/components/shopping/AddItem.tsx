import React, { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ALL_CATEGORIES } from '@/services/categorizationService'
import type { Category } from '@/types'

export function AddItem() {
  const { addItem } = useShopping()
  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState('item')
  const [cat, setCat] = useState<Category | ''>('')
  const [advanced, setAdvanced] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Enter item name'); return }
    addItem(name.trim(), qty, unit, cat || undefined)
    setName(''); setQty(1); setUnit('item'); setCat(''); setError('')
  }

  return (
    <form onSubmit={submit} aria-label="Add item manually">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="Add item (e.g. Milk, Apples...)"
            error={error}
            className="h-11"
          />
        </div>
        <input
          type="number"
          value={qty}
          onChange={e => setQty(Math.max(1, +e.target.value || 1))}
          min={1}
          className="w-16 h-11 rounded-xl border border-slate-200 bg-white px-2.5 text-sm text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shrink-0 shadow-2xs"
          aria-label="Quantity"
        />
        <Button type="submit" aria-label="Add" className="h-11 px-5 rounded-xl shrink-0 font-bold">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
      <button type="button" onClick={() => setAdvanced(v => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${advanced ? 'rotate-180' : ''}`} />
        {advanced ? 'Less' : 'More options'}
      </button>
      {advanced && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Input label="Unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="bottles, kg..." />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value as Category)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Auto-detect</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </form>
  )
}
