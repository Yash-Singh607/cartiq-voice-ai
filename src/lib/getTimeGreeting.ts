// Single source of truth for time-aware greeting logic.
// All components must import from here — never compute locally.

export interface TimeGreeting {
  salutation: string   // e.g. "Good morning ☀️"
  subtitle: string     // contextual subtitle
  slot: 'night' | 'morning' | 'afternoon' | 'evening'
  /** Tailwind gradient classes for the hero banner background */
  gradient: string
  /** Product IDs to curate for this time slot */
  productIds: string[]
}

export function getTimeGreeting(hour?: number): TimeGreeting {
  const h = hour ?? new Date().getHours()

  if (h >= 0 && h < 5) {
    return {
      salutation: 'Good night 🌙',
      subtitle: 'Late-night cravings? Snacks & munchies delivered in 10 mins.',
      slot: 'night',
      gradient: 'from-slate-100 via-zinc-100/80 to-slate-100',
      productIds: ['p036', 'p039', 'p070', 'p071', 'p091', 'p027'],
    }
  }
  if (h >= 5 && h < 12) {
    return {
      salutation: 'Good morning ☀️',
      subtitle: 'Fresh breakfast staples & dairy ready for delivery.',
      slot: 'morning',
      gradient: 'from-amber-50 via-orange-50/60 to-sky-50',
      productIds: ['p001', 'p074', 'p023', 'p012', 'p031', 'p101'],
    }
  }
  if (h >= 12 && h < 17) {
    return {
      salutation: 'Good afternoon 🌤️',
      subtitle: 'Lunch essentials, cold drinks & quick pantry refills.',
      slot: 'afternoon',
      gradient: 'from-cyan-50 via-sky-50/60 to-emerald-50',
      productIds: ['p044', 'p084', 'p046', 'p028', 'p026', 'p090'],
    }
  }
  // 17:00 – 23:59
  return {
    salutation: 'Good evening 🌆',
    subtitle: 'Dinner recipes & fresh vegetables delivered in minutes.',
    slot: 'evening',
    gradient: 'from-violet-50 via-purple-50/60 to-rose-50',
    productIds: ['p019', 'p081', 'p082', 'p016', 'p096', 'p018'],
  }
}
