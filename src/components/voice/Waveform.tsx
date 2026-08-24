import React from 'react'
import { motion } from 'framer-motion'

const BARS = 9

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-8" aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-brand-500"
          animate={active ? {
            scaleY: [0.4, 1, 0.4],
            transition: {
              duration: 0.9 + i * 0.08,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.06,
            },
          } : { scaleY: 0.3 }}
          style={{ height: 28, transformOrigin: 'center' }}
        />
      ))}
    </div>
  )
}
