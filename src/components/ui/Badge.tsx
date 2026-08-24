import React from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps { children: React.ReactNode; variant?: 'default'|'success'|'warning'|'error'|'info'|'purple'; className?: string }

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const v = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    error:   'bg-rose-50 text-rose-700',
    info:    'bg-brand-50 text-brand-700',
    purple:  'bg-purple-50 text-purple-700',
  }
  return <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', v[variant], className)}>{children}</span>
}
