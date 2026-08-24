import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { VoiceState } from '@/types'

interface MicButtonProps {
  state: VoiceState
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function MicButton({ state, isSupported, onStart, onStop, size = 'lg' }: MicButtonProps) {
  const isListening = state === 'listening'
  const isProcessing = state === 'processing'
  const disabled = !isSupported || isProcessing

  const sizes = { sm: { btn: 'w-14 h-14', icon: 16 }, md: { btn: 'w-20 h-20', icon: 22 }, lg: { btn: 'w-24 h-24', icon: 28 } }
  const { btn, icon } = sizes[size]

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className="absolute rounded-full bg-rose-400/20"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              style={{ width: '6rem', height: '6rem' }}
            />
            <motion.div
              className="absolute rounded-full bg-rose-400/20"
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              style={{ width: '6rem', height: '6rem' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Success ring */}
      {state === 'success' && (
        <motion.div
          className="absolute rounded-full bg-emerald-400/30"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: '6rem', height: '6rem' }}
        />
      )}

      <motion.button
        whileTap={{ scale: 0.94 }}
        whileHover={!disabled ? { scale: 1.04 } : {}}
        onClick={isListening ? onStop : disabled ? undefined : onStart}
        disabled={disabled}
        aria-label={isListening ? 'Stop listening' : isProcessing ? 'Processing...' : isSupported ? 'Start voice input' : 'Voice not supported'}
        aria-pressed={isListening}
        className={cn(
          btn, 'relative z-10 rounded-full flex items-center justify-center',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300',
          'transition-all duration-200 shadow-xl',
          isListening     ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white' :
          state === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' :
          state === 'error'   ? 'bg-gradient-to-br from-rose-400 to-rose-500 text-white' :
          disabled            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
          'bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:shadow-glow'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div key={state} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }}>
            {isProcessing ? <Loader2 size={icon} className="animate-spin" /> :
             isListening  ? <MicOff size={icon} /> :
             !isSupported  ? <MicOff size={icon} /> :
             <Mic size={icon} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
