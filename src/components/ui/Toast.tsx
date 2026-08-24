import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ToastData { id: string; message: string; type: 'success'|'error'|'info' }

interface ToastProps extends ToastData { onClose: () => void }

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  const styles = { success: 'bg-emerald-50 border-emerald-200 text-emerald-800', error: 'bg-rose-50 border-rose-200 text-rose-800', info: 'bg-brand-50 border-brand-200 text-brand-800' }
  const icons = { success: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />, error: <XCircle className="w-4 h-4 shrink-0 text-rose-500" />, info: <Info className="w-4 h-4 shrink-0 text-brand-500" /> }
  return (
    <motion.div initial={{ opacity:0, y:16, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.96 }}
      className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-sm', styles[type])}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex flex-col gap-2 items-end" role="region" aria-label="Notifications">
      <AnimatePresence>{toasts.map(t => <Toast key={t.id} {...t} onClose={() => onClose(t.id)} />)}</AnimatePresence>
    </div>
  )
}
