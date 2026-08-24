import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ListItem } from './ListItem'
import { CATEGORY_EMOJI, CATEGORY_COLOR } from '@/services/categorizationService'
import { cn } from '@/utils/cn'
import type { Category, ShoppingItem } from '@/types'

export function CategoryGroup({ category, items }: { category: Category; items: ShoppingItem[] }) {
  const [open, setOpen] = useState(true)
  const done = items.filter(i => i.completed).length
  const c = CATEGORY_COLOR[category]

  return (
    <section aria-label={`${category} section`} className="mb-1">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors"
        aria-expanded={open}>
        <span className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-sm', c.bg)}>{CATEGORY_EMOJI[category]}</span>
        <span className="text-sm font-semibold text-slate-700 flex-1 text-left">{category}</span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', c.bg, c.text)}>{done}/{items.length}</span>
        <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden ml-2 border-l-2 border-slate-100 pl-3">
            <AnimatePresence>
              {items.map(item => <ListItem key={item.id} item={item} />)}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}
