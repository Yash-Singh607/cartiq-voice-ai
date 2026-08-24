import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Mic, MicOff, X, Loader2, ShoppingCart, Search, Undo2 } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useApp } from '@/context/AppContext'
import { useCart } from '@/context/CartContext'
import { parseCommand } from '@/services/nlpService'
import { findByName, searchProducts } from '@/services/productService'
import { capitalize, formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { VoiceState, Language } from '@/types'

// ─── Waveform ─────────────────────────────────────────────────────────────────

function RGBWaveform({ active }: { active: boolean }) {
  const BARS = 16
  const colors = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6']
  return (
    <div className="flex items-center gap-0.5 h-6" aria-hidden>
      {Array.from({ length: BARS }).map((_, i) => (
        <motion.div
          key={i}
          style={{ backgroundColor: colors[i], width: 3, height: 24, borderRadius: 4, transformOrigin: 'center' }}
          animate={active ? {
            scaleY: [0.2, 0.6 + Math.random() * 0.4, 0.2],
            transition: { duration: 0.5 + Math.random() * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }
          } : { scaleY: 0.15 }}
        />
      ))}
    </div>
  )
}

// ─── Action flyout card ───────────────────────────────────────────────────────

interface ActionCard {
  type: 'added' | 'removed' | 'searched' | 'nav' | 'language'
  message: string
  detail?: string
  price?: number
  image?: string
  onUndo?: () => void
}

function ActionFlyout({ card, onDismiss }: { card: ActionCard; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const icons: Record<ActionCard['type'], React.ReactNode> = {
    added:    <ShoppingCart className="w-4 h-4 text-emerald-500" />,
    removed:  <X className="w-4 h-4 text-rose-400" />,
    searched: <Search className="w-4 h-4 text-brand-500" />,
    nav:      <ShoppingCart className="w-4 h-4 text-brand-500" />,
    language: <span className="text-sm">🌐</span>,
  }
  const bg: Record<ActionCard['type'], string> = {
    added:    'bg-emerald-50 border-emerald-200',
    removed:  'bg-rose-50 border-rose-200',
    searched: 'bg-brand-50 border-brand-200',
    nav:      'bg-brand-50 border-brand-200',
    language: 'bg-purple-50 border-purple-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg w-80 max-w-[92vw]', bg[card.type])}
    >
      {card.image && <img src={card.image} alt="" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} className="w-10 h-10 rounded-xl object-cover shrink-0" />}
      <div className="flex items-center gap-2 shrink-0">{icons[card.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{card.message}</p>
        {card.detail && <p className="text-xs text-slate-500 truncate">{card.detail}</p>}
        {card.price !== undefined && <p className="text-xs font-bold text-slate-700">{formatINR(card.price)}</p>}
      </div>
      {card.onUndo && (
        <button onClick={card.onUndo}
          className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 shrink-0 bg-white rounded-lg px-2 py-1.5 border border-brand-200">
          <Undo2 className="w-3 h-3" /> Undo
        </button>
      )}
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  )
}

// ─── Language detection helper ────────────────────────────────────────────────

function detectLangFromText(text: string): Language | null {
  const lower = text.toLowerCase()
  if (/hindi|हिंदी|switch.*hindi/i.test(lower)) return 'hi-IN'
  if (/spanish|español|switch.*spanish/i.test(lower)) return 'es-ES'
  if (/english|switch.*english/i.test(lower)) return 'en-US'
  return null
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

interface VoiceAssistantOverlayProps {
  onSearch?: (q: string) => void
}

export function VoiceAssistantOverlay({ onSearch }: VoiceAssistantOverlayProps) {
  const { language, setLanguage } = useApp()
  const { addToCart, removeFromCart, openCart, items } = useCart()

  const [vs, setVs] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [processingText, setProcessingText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [actionCard, setActionCard] = useState<ActionCard | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.state !== 'closed') {
        audioRef.current.close().catch(() => {})
      }
    }
  }, [])

  // Play a short chime
  const playChime = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(); osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])

  const executeCommand = useCallback((text: string) => {
    setVs('processing')
    const cmd = parseCommand(text)
    let card: ActionCard | null = null

    // Language switch
    const newLang = detectLangFromText(text)
    if (newLang) {
      setLanguage(newLang)
      const labels: Record<Language, string> = { 'en-US': 'English', 'hi-IN': 'Hindi', 'es-ES': 'Spanish', 'fr-FR': 'French', 'de-DE': 'German' }
      card = { type: 'language', message: `Switched to ${labels[newLang]}` }
      setActionCard(card)
      setVs('success')
      setTimeout(() => setVs('idle'), 2500)
      return
    }

    // Open cart / checkout
    if (/open cart|show cart|my cart/i.test(text)) {
      openCart()
      card = { type: 'nav', message: 'Opening cart…' }
      setActionCard(card)
      setVs('success')
      setTimeout(() => setVs('idle'), 2000)
      return
    }

    // Search
    if (cmd.intent === 'SEARCH_PRODUCT' && cmd.product) {
      setProcessingText(`Searching "${cmd.product}"${cmd.maxPrice ? ` under ₹${cmd.maxPrice}` : ''}…`)
      onSearch?.(cmd.product)
      card = { type: 'searched', message: `Showing "${cmd.product}"`, detail: cmd.maxPrice ? `Under ₹${cmd.maxPrice}` : undefined }
      setTimeout(() => { setActionCard(card); setVs('success'); setTimeout(() => setVs('idle'), 2500) }, 600)
      return
    }

    // Remove item
    if (cmd.intent === 'REMOVE_ITEM' && cmd.product) {
      const item = items.find(i => i.product.name.toLowerCase().includes(cmd.product!.toLowerCase()))
      if (item) {
        removeFromCart(item.product.id)
        card = { type: 'removed', message: `Removed ${capitalize(cmd.product)}`, detail: 'Tap Undo to restore',
          onUndo: () => { addToCart(item.product, item.quantity) } }
      } else {
        card = { type: 'removed', message: `"${cmd.product}" not in cart` }
      }
      setActionCard(card); setVs('success'); setTimeout(() => setVs('idle'), 2500)
      return
    }

    // Add item
    if (cmd.intent === 'ADD_ITEM' && cmd.product) {
      const qty = cmd.quantity ?? 1
      setProcessingText(`Adding ${qty > 1 ? `${qty}× ` : ''}${capitalize(cmd.product)} to cart…`)
      const product = findByName(cmd.product)
      setTimeout(() => {
        if (product) {
          addToCart(product, qty)
          playChime()
          card = {
            type: 'added',
            message: `Added ${qty > 1 ? `${qty}× ` : ''}${product.name}`,
            detail: product.category,
            price: product.price * qty,
            image: product.image,
            onUndo: () => removeFromCart(product.id),
          }
        } else {
          card = { type: 'added', message: `"${capitalize(cmd.product!)}" added to list`, detail: 'Not found in catalog' }
        }
        setActionCard(card); setVs('success'); setTimeout(() => setVs('idle'), 2800)
      }, 700)
      return
    }

    // Unknown
    card = { type: 'searched', message: 'Try: "Add 2 apples" or "Search milk"' }
    setActionCard(card); setVs('error'); setTimeout(() => setVs('idle'), 2500)
  }, [addToCart, removeFromCart, openCart, items, onSearch, playChime, setLanguage])

  const { start: startRec, stop: stopRec } = useVoiceRecognition({
    language,
    onFinal: (text) => { setTranscript(text); executeCommand(text) },
    onInterim: (text) => setTranscript(text),
    onError: (msg) => { setVs('error'); setTimeout(() => setVs('idle'), 3000) },
  })

  const handleTap = () => {
    if (vs === 'listening') { stopRec(); setTranscript(''); setVs('idle') }
    else if (vs === 'idle' || vs === 'success' || vs === 'error') {
      setTranscript(''); setVs('listening'); startRec()
    }
  }

  const isListening  = vs === 'listening'
  const isProcessing = vs === 'processing'
  const isSuccess    = vs === 'success'
  const isError      = vs === 'error'

  // Pill width animation
  const pillWidth = isListening ? 280 : isProcessing ? 240 : 180

  const EXAMPLES = ['Add 2 bananas', 'Search organic milk', 'Remove butter', 'Open cart', 'Switch to Hindi']

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none">
      {/* Action flyout */}
      <div className="pointer-events-auto">
        <AnimatePresence>
          {actionCard && (
            <ActionFlyout key={JSON.stringify(actionCard)} card={actionCard} onDismiss={() => setActionCard(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* Expanded examples panel */}
      <AnimatePresence>
        {expanded && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-4 w-72 pointer-events-auto"
          >
            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide text-center">Try saying</p>
            <div className="space-y-1.5">
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => { setExpanded(false); executeCommand(ex) }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-sm text-slate-700 font-medium transition-colors">
                  🎙️ &nbsp;"{ex}"
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Island Pill */}
      <motion.div
        className="pointer-events-auto relative"
        animate={{ width: pillWidth }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        {/* Glow ring when listening */}
        {isListening && (
          <>
            <motion.div className="absolute inset-0 rounded-full blur-lg"
              style={{ backgroundColor: 'rgba(239,68,68,0.3)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="absolute inset-0 rounded-full blur-md"
              style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: 0.2 }} />
          </>
        )}

        <motion.button
          onClick={handleTap}
          aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
          aria-pressed={isListening}
          className={cn(
            'relative w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-full shadow-2xl transition-colors duration-200 overflow-hidden',
            isListening  ? 'bg-gradient-to-r from-rose-600 to-rose-500' :
            isProcessing ? 'bg-gradient-to-r from-brand-700 to-brand-600' :
            isSuccess    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
            isError      ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
            'bg-gradient-to-r from-ink-900 to-ink-800'
          )}
        >
          {/* Shimmer when processing */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Left icon */}
          <div className="relative z-10 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div key={vs}
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {isProcessing ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                 : isListening  ? <MicOff className="w-5 h-5 text-white" />
                 : <Mic className="w-5 h-5 text-white" />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {transcript
                    ? <p className="text-xs text-white/90 truncate italic">"{transcript}"</p>
                    : <RGBWaveform active />
                  }
                </motion.div>
              ) : isProcessing ? (
                <motion.p key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-white/90 truncate">{processingText || 'Understanding…'}</motion.p>
              ) : isSuccess ? (
                <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-white font-semibold">Done ✓</motion.p>
              ) : isError ? (
                <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-white/90">Tap to try again</motion.p>
              ) : (
                <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-white/80 font-medium whitespace-nowrap">
                  🎙️ Tap or say "Add 2 Apples"
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Right — expand/close */}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="relative z-10 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
            aria-label="Show examples"
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-white text-xs leading-none">
              ⌃
            </motion.span>
          </button>
        </motion.button>
      </motion.div>
    </div>
  )
}
