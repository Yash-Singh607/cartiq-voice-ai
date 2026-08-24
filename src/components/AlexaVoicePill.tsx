import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Loader2, ShoppingCart, Search, Undo2, ChevronUp } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { useApp } from '@/context/AppContext'
import { useCart } from '@/context/CartContext'
import { parseCommand } from '@/services/nlpService'
import { findByName } from '@/services/productService'
import { capitalize, formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { VoiceState, Language, ParsedCommand } from '@/types'

// ─── RGB Waveform ─────────────────────────────────────────────────────────────

const WAVE_COLORS = ['#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981']

function AlexaWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-8" aria-hidden>
      {WAVE_COLORS.map((color, i) => (
        <motion.div key={i}
          style={{ backgroundColor: color, width: 3, height: 28, borderRadius: 6, transformOrigin: 'center' }}
          animate={active ? {
            scaleY: [0.2, 0.4 + Math.random() * 0.6, 0.2],
            transition: { duration: 0.5 + i * 0.03, repeat: Infinity, ease: 'easeInOut', delay: i * 0.035 }
          } : { scaleY: 0.15 }}
        />
      ))}
    </div>
  )
}

// ─── NLP breakdown badge ──────────────────────────────────────────────────────

function IntentBadge({ cmd }: { cmd: ParsedCommand }) {
  const entries = [
    { label: 'Intent',   value: cmd.intent.replace(/_/g, ' ') },
    { label: 'Item',     value: cmd.product },
    { label: 'Qty',      value: cmd.quantity !== 1 ? `${cmd.quantity}${cmd.unit !== 'item' ? ` ${cmd.unit}` : ''}` : undefined },
    { label: 'Brand',    value: cmd.brand },
    { label: 'Max',      value: cmd.maxPrice ? `₹${cmd.maxPrice}` : undefined },
    { label: 'Confidence', value: `${Math.round(cmd.confidence * 100)}%` },
  ].filter(e => e.value)

  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5">
      {entries.map(({ label, value }) => (
        <span key={label} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full border border-white/20">
          <span className="opacity-60">{label}:</span>
          <span>{value}</span>
        </span>
      ))}
    </div>
  )
}

// ─── Action flyout ────────────────────────────────────────────────────────────

interface Flyout {
  type: 'added' | 'removed' | 'searched' | 'info' | 'error'
  title: string
  detail?: string
  price?: number
  image?: string
  onUndo?: () => void
}

function FlyoutCard({ flyout, onDismiss }: { flyout: Flyout; onDismiss: () => void }) {
  React.useEffect(() => { const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t) }, [onDismiss])

  const bg = {
    added:    'bg-emerald-500',
    removed:  'bg-rose-500',
    searched: 'bg-brand-600',
    info:     'bg-cyan-500',
    error:    'bg-orange-500',
  }[flyout.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      transition={{ type: 'spring', damping: 20, stiffness: 340 }}
      className={`${bg} text-white rounded-2xl px-4 py-3.5 shadow-xl flex items-center gap-3 max-w-sm w-full`}
    >
      {flyout.image && (
        <img src={flyout.image} alt="" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-white/20" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{flyout.title}</p>
        {flyout.detail && <p className="text-xs text-white/80 truncate mt-0.5">{flyout.detail}</p>}
        {flyout.price !== undefined && <p className="text-xs font-black mt-0.5">{formatINR(flyout.price)}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {flyout.onUndo && (
          <button onClick={flyout.onUndo}
            className="flex items-center gap-1 text-xs font-bold bg-white/25 hover:bg-white/35 px-2.5 py-1.5 rounded-xl transition-colors border border-white/20">
            <Undo2 className="w-3 h-3" /> Undo
          </button>
        )}
        <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Language detection ───────────────────────────────────────────────────────

function detectLang(text: string): Language | null {
  if (/hindi|हिंदी|switch.*hindi/i.test(text)) return 'hi-IN'
  if (/spanish|español|switch.*spanish/i.test(text)) return 'es-ES'
  if (/english|switch.*english/i.test(text)) return 'en-US'
  return null
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AlexaVoicePillProps {
  onSearch?: (q: string) => void
}

export function AlexaVoicePill({ onSearch }: AlexaVoicePillProps) {
  const { language, setLanguage } = useApp()
  const { addToCart, removeFromCart, openCart, items } = useCart()
  const audioRef = useRef<AudioContext | null>(null)

  const [vs, setVs] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [processingCmd, setProcessingCmd] = useState<ParsedCommand | null>(null)
  const [flyout, setFlyout] = useState<Flyout | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.state !== 'closed') {
        audioRef.current.close().catch(() => {})
      }
    }
  }, [])

  const playChime = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(); osc.stop(ctx.currentTime + 0.35)
    } catch {}
  }, [])

  const executeCommand = useCallback((text: string) => {
    setVs('processing')
    const cmd = parseCommand(text)
    setProcessingCmd(cmd)

    // Language switch
    const newLang = detectLang(text)
    if (newLang) {
      setLanguage(newLang)
      const names: Record<Language, string> = { 'en-US': 'English', 'hi-IN': 'Hindi', 'es-ES': 'Spanish', 'fr-FR': 'French', 'de-DE': 'German' }
      setFlyout({ type: 'info', title: `Switched to ${names[newLang]}` })
      setVs('success'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 2500)
      return
    }

    if (/open cart|show cart|my cart/i.test(text)) {
      openCart()
      setFlyout({ type: 'info', title: 'Opening cart…' })
      setVs('success'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 1800)
      return
    }

    if (cmd.intent === 'SEARCH_PRODUCT' && cmd.product) {
      onSearch?.(cmd.product)
      setFlyout({ type: 'searched', title: `Showing "${cmd.product}"`, detail: cmd.maxPrice ? `Under ₹${cmd.maxPrice}` : 'All results' })
      setTimeout(() => { setVs('success'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 2500) }, 500)
      return
    }

    if (cmd.intent === 'REMOVE_ITEM' && cmd.product) {
      const item = items.find(i => i.product.name.toLowerCase().includes(cmd.product!.toLowerCase()))
      if (item) {
        removeFromCart(item.product.id)
        setFlyout({ type: 'removed', title: `Removed ${capitalize(cmd.product)}`, onUndo: () => addToCart(item.product, item.quantity) })
      } else {
        setFlyout({ type: 'error', title: `"${cmd.product}" not in cart` })
      }
      setVs('success'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 2500)
      return
    }

    if (cmd.intent === 'ADD_ITEM' && cmd.product) {
      const qty = cmd.quantity ?? 1
      const product = findByName(cmd.product)
      setTimeout(() => {
        if (product) {
          addToCart(product, qty)
          playChime()
          setFlyout({
            type: 'added',
            title: `Added ${qty > 1 ? `${qty}× ` : ''}${product.name}`,
            detail: `${product.category} · ${product.brand}`,
            price: product.price * qty,
            image: product.image,
            onUndo: () => removeFromCart(product.id),
          })
        } else {
          setFlyout({ type: 'info', title: `"${capitalize(cmd.product!)}" noted`, detail: 'Not found in catalog' })
        }
        setVs('success'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 2800)
      }, 700)
      return
    }

    setFlyout({ type: 'error', title: 'Try: "Add 2 apples" or "Search milk"' })
    setVs('error'); setTimeout(() => { setVs('idle'); setProcessingCmd(null) }, 2500)
  }, [addToCart, removeFromCart, openCart, items, onSearch, playChime, setLanguage])

  const { start: startRec, stop: stopRec } = useVoiceRecognition({
    language,
    onFinal: (text) => { setTranscript(text); executeCommand(text) },
    onInterim: (text) => setTranscript(text),
    onError: () => { setVs('error'); setTimeout(() => setVs('idle'), 3000) },
  })

  const handleTap = () => {
    if (vs === 'listening') { stopRec(); setTranscript(''); setVs('idle') }
    else if (vs === 'idle' || vs === 'success' || vs === 'error') {
      setTranscript(''); setProcessingCmd(null); setVs('listening'); startRec()
    }
  }

  const isListening  = vs === 'listening'
  const isProcessing = vs === 'processing'

  const EXAMPLES = [
    'Add 2kg Apples under ₹200',
    'Search Amul Milk 1L',
    'Remove butter from cart',
    'Open cart',
    'Switch to Hindi',
    'Find organic products',
  ]

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
      {/* Flyout */}
      <div className="pointer-events-auto w-full">
        <AnimatePresence>
          {flyout && <FlyoutCard key={JSON.stringify(flyout.title)} flyout={flyout} onDismiss={() => setFlyout(null)} />}
        </AnimatePresence>
      </div>

      {/* Examples panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto w-full bg-slate-900/95 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Voice Commands</p>
            <div className="grid grid-cols-2 gap-1.5">
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => { setExpanded(false); executeCommand(ex) }}
                  className="text-left text-xs text-white/80 hover:text-white font-medium bg-white/5 hover:bg-white/10 px-2.5 py-2 rounded-xl transition-colors truncate">
                  🎙 {ex}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Alexa pill */}
      <div className="pointer-events-auto w-full">
        <motion.div
          animate={{
            borderRadius: isListening ? '24px' : '9999px',
            paddingLeft: isListening ? 20 : 20,
            paddingRight: isListening ? 16 : 12,
          }}
          className={cn(
            'relative w-full flex items-center gap-3 py-3.5 shadow-2xl overflow-hidden transition-colors duration-300',
            isListening  ? 'bg-gradient-to-r from-rose-600 to-rose-500' :
            isProcessing ? 'bg-gradient-to-r from-slate-800 to-slate-700' :
            vs === 'success' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
            vs === 'error'   ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
            'bg-gradient-to-r from-slate-900 to-slate-800'
          )}
        >
          {/* Alexa glow rings when listening */}
          {isListening && (
            <>
              <motion.div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.2) 0%, transparent 70%)' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {[1.2, 1.6, 2.1].map((s, i) => (
                <motion.div key={i} className="absolute inset-0 rounded-full border border-cyan-400/30"
                  animate={{ scale: [1, s, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </>
          )}

          {/* Shimmer on processing */}
          {isProcessing && (
            <motion.div className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Mic button */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleTap}
            className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
            aria-label={isListening ? 'Stop' : 'Speak'} aria-pressed={isListening}>
            <AnimatePresence mode="wait">
              <motion.div key={vs}
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.12 }}>
                {isProcessing ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                 : isListening ? <MicOff className="w-5 h-5 text-white" />
                 : <Mic className="w-5 h-5 text-cyan-400" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Content area */}
          <div className="relative z-10 flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {transcript
                    ? <p className="text-xs text-white/90 italic truncate">"{transcript}"</p>
                    : <AlexaWaveform active />
                  }
                </motion.div>
              ) : isProcessing ? (
                <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs text-cyan-300 font-semibold truncate mb-1">
                    {processingCmd?.product ? `Processing "${processingCmd.product}"…` : 'Understanding…'}
                  </p>
                  {processingCmd && <IntentBadge cmd={processingCmd} />}
                </motion.div>
              ) : vs === 'success' ? (
                <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm font-bold text-white">Done ✓</motion.p>
              ) : vs === 'error' ? (
                <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-white/80">Tap and try again</motion.p>
              ) : (
                <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-slate-300 truncate">
                  🎙 Tap · <span className="text-cyan-400">Add 2kg Apples under ₹200</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Expand toggle */}
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(v => !v)}
            className="relative z-10 shrink-0 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Show examples"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronUp className="w-4 h-4 text-white/70" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
