import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sliders } from 'lucide-react'
import type { ParsedCommand } from '@/types'

interface Props { command: ParsedCommand }

export function AIInterpretation({ command }: Props) {
  const [open, setOpen] = useState(false)

  const entries = [
    { label: 'Intent',      value: command.intent?.replace(/_/g, ' ') },
    { label: 'Product',     value: command.product },
    { label: 'Quantity',    value: command.quantity !== 1 ? String(command.quantity) : undefined },
    { label: 'Unit',        value: command.unit !== 'item' ? command.unit : undefined },
    { label: 'Brand',       value: command.brand },
    { label: 'Max Price',   value: command.maxPrice ? `₹${command.maxPrice}` : undefined },
    { label: 'Min Price',   value: command.minPrice ? `₹${command.minPrice}` : undefined },
    { label: 'Category',    value: command.category !== 'Other' ? command.category : undefined },
    { label: 'Attributes',  value: command.attributes?.join(', ') },
    { label: 'Confidence',  value: `${Math.round(command.confidence * 100)}%` },
  ].filter(e => e.value)

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
      >
        <Sliders className="w-3.5 h-3.5 text-brand-600" />
        <span>View Command Analysis</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid grid-cols-2 gap-1.5 bg-slate-50 rounded-xl p-3">
              {entries.map(({ label, value }) => (
                <div key={label} className="flex items-start gap-1.5 text-xs">
                  <span className="text-slate-400 shrink-0">{label}:</span>
                  <span className="font-medium text-slate-700 truncate">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
