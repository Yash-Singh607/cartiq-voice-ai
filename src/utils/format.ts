import { formatDistanceToNow, format } from 'date-fns'

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatRelative(dateStr: string): string {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }) }
  catch { return 'recently' }
}

export function formatDate(dateStr: string): string {
  try { return format(new Date(dateStr), 'MMM d, yyyy') }
  catch { return dateStr }
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

// Alias kept for backward compat
export const formatPrice = formatINR
