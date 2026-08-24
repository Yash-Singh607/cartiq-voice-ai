import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Mic, MicOff, X, Loader2, ChevronUp } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useApp } from '@/context/AppContext'
import { useCart } from '@/context/CartContext'
import { parseCommand } from '@/services/nlpService'
import { findByName } from '@/services/productService'
import { capitalize } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { VoiceState } from '@/types'

const WAVEFORM_BARS = 12

function FloatWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.5 h-5" aria-hidden>
      {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-white/80"
          animate={active
            ? { scaleY: [0.3, 1, 0.3], transition: { duration: 0.7 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 } }
            : { scaleY: 0.25 }
          }
          style={{ height: 18, transformOrigin: 'center' }}
        />
      ))}
    </div>
  )
}

// Mini pill that shoots from voice to cart icon
function FlyingPill({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 0, scale: 0.7, y: -60 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg pointer-events-none z-10"
    >
      ✓ {text}
    </motion.div>
  )
}

export function VoiceFloatingPill() {
  const { language } = useApp()
  const { addToCart } = useCart()
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [flyText, setFlyText] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const dragControls = useDragControls()

  const handleFinal = useCallback((text: string) => {
    setTranscript(text)
    setVoiceState('processing')

    const cmd = parseCommand(text)
    let actionText: string | null = null

    if (cmd.intent === 'ADD_ITEM' && cmd.product) {
      const product = findByName(cmd.product)
      if (product) {
        addToCart(product, cmd.quantity ?? 1)
        actionText = `${cmd.quantity && cmd.quantity > 1 ? `${cmd.quantity}× ` : ''}${capitalize(cmd.product)} added`
      } else {
        actionText = `"${capitalize(cmd.product)}" added to list`
      }
    } else if (cmd.intent === 'SEARCH_PRODUCT') {
      actionText = `Searching ${cmd.product ?? ''}...`
    } else if (cmd.intent !== 'UNKNOWN') {
      actionText = text.length > 30 ? text.slice(0, 30) + '…' : text
    }

    setLastAction(actionText)
    setVoiceState('success')
    if (actionText) setFlyText(actionText)
    setTimeout(() => { setVoiceState('idle'); setTranscript('') }, 3000)
  }, [addToCart])

  const handleError = useCallback((msg: string) => {
    setVoiceState('error')
    setLastAction(null)
    setTimeout(() => setVoiceState('idle'), 3000)
  }, [])

  const { start: startRec, stop: stopRec } = useVoiceRecognition({
    language,
    onFinal: handleFinal,
    onInterim: t => setTranscript(t),
    onError: handleError,
  })

  const isListening = voiceState === 'listening'
  const isProcessing = voiceState === 'processing'

  const handleTap = () => {
    if (isListening) { stopRec(); setVoiceState('idle'); setTranscript('') }
    else if (!isProcessing) { setVoiceState('listening'); setTranscript(''); setLastAction(null); startRec() }
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ y: 0 }}
      className="fixed bottom-24 lg:bottom-8 right-4 z-50 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Flying success pill */}
      <AnimatePresence>
        {flyText && (
          <FlyingPill text={flyText} onDone={() => setFlyText(null)} />
        )}
      </AnimatePresence>

      {/* Expanded transcript panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-700">Voice Commands</p>
              <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
            </div>
            {transcript && (
              <div className="bg-brand-50 rounded-xl px-3 py-2 mb-3">
                <p className="text-xs text-brand-600 italic">"{transcript}"</p>
              </div>
            )}
            {lastAction && (
              <div className="bg-emerald-50 rounded-xl px-3 py-2 mb-3">
                <p className="text-xs text-emerald-700 font-medium">✓ {lastAction}</p>
              </div>
            )}
            <div className="space-y-1.5">
              {['"Add 2 packs of butter"', '"Find organic milk"', '"Show cheaper chips"'].map(ex => (
                <p key={ex} className="text-xs text-slate-400 font-mono">{ex}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main pill */}
      <div className="flex items-center">
        {/* Expand toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setExpanded(v => !v)}
          className="mr-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-slate-700 border border-slate-100"
          aria-label="Expand voice panel"
        >
          <ChevronUp className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
        </motion.button>

        {/* The pill itself */}
        <motion.button
          onPointerDown={e => dragControls.start(e)}
          onClick={handleTap}
          whileTap={{ scale: 0.94 }}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          aria-pressed={isListening}
          className={cn(
            'relative flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl transition-all duration-300',
            'min-w-[160px] justify-center',
            isListening
              ? 'bg-gradient-to-r from-rose-500 to-rose-600'
              : voiceState === 'success'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
              : voiceState === 'error'
              ? 'bg-gradient-to-r from-rose-400 to-rose-500'
              : 'bg-gradient-to-r from-brand-600 to-brand-700'
          )}
        >
          {/* Pulse rings when listening */}
          {isListening && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-400"
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-400"
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
              />
            </>
          )}

          {/* Icon */}
          <div className="relative z-10 shrink-0">
            {isProcessing
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : isListening
              ? <MicOff className="w-5 h-5 text-white" />
              : <Mic className="w-5 h-5 text-white" />
            }
          </div>

          {/* Waveform or label */}
          <div className="relative z-10">
            {isListening
              ? <FloatWaveform active />
              : isProcessing
              ? <span className="text-white text-xs font-medium">Thinking...</span>
              : voiceState === 'success'
              ? <span className="text-white text-xs font-medium">Got it! ✓</span>
              : <span className="text-white text-xs font-semibold">Tap to speak</span>
            }
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}
