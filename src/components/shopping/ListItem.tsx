import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, Check, Pencil } from 'lucide-react'
import { useShopping } from '@/context/ShoppingContext'
import { ProductImage } from '@/components/ui/ProductImage'
import { cn } from '@/utils/cn'
import { formatINR } from '@/utils/format'
import type { ShoppingItem } from '@/types'

export function ListItem({ item }: { item: ShoppingItem }) {
  const { removeItem, updateItem, toggleItem } = useShopping()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)

  const saveEdit = () => {
    if (editName.trim()) updateItem(item.id, { name: editName.trim() })
    setEditing(false)
  }

  return (
    <motion.li layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      className={cn('group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors', item.completed && 'opacity-50')}>

      {/* Thumbnail */}
      {item.image ? (
        <ProductImage src={item.image} alt={item.name} className="rounded-lg" skeletonClassName="w-11 h-11 rounded-lg shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-lg shrink-0">🛒</div>
      )}

      {/* Checkbox */}
      <button onClick={() => toggleItem(item.id)}
        aria-label={item.completed ? `Unmark ${item.name}` : `Mark ${item.name} as done`}
        className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-ink-300 hover:border-brand-400')}>
        {item.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input value={editName} onChange={e => setEditName(e.target.value)}
            onBlur={saveEdit} onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            className="w-full text-sm font-medium border-b border-brand-400 bg-transparent outline-none" autoFocus />
        ) : (
          <p className={cn('text-sm font-medium text-slate-800 truncate', item.completed && 'line-through text-slate-400')}>
            {item.name}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-0.5">
          {item.brand && <span className="text-xs text-slate-400">{item.brand}</span>}
          {item.price && <span className="text-xs text-slate-500">{formatINR(item.price * item.quantity)}</span>}
        </div>
      </div>

      {/* Qty */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
          disabled={item.quantity <= 1 || item.completed}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center" aria-label="Decrease">
          <Minus className="w-3 h-3 text-slate-600" />
        </button>
        <span className="text-sm font-semibold text-slate-800 w-5 text-center">{item.quantity}</span>
        <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
          disabled={item.completed}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center" aria-label="Increase">
          <Plus className="w-3 h-3 text-slate-600" />
        </button>
      </div>

      {/* Actions on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!item.completed && (
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600" aria-label={`Edit ${item.name}`}>
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-500" aria-label={`Remove ${item.name}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.li>
  )
}
